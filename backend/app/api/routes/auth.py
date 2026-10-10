import json
import os
import urllib.parse
import urllib.request
from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response, status
from fastapi.responses import RedirectResponse
from app.domain.auth_models import (
    SignUpRequest,
    LoginRequest,
    AuthResponse,
    UserProfile,
    GoogleAuthRequest,
    GoogleConfigResponse,
    UpdateProfileRequest,
    ChangePasswordRequest,
)
from app.services.auth_service import AuthService
from app.api.deps import get_auth_service, get_current_user_optional, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

COOKIE_NAME = "subslayer_session"
COOKIE_MAX_AGE = 7 * 24 * 3600  # 7 days
COOKIE_SAMESITE = "lax"
COOKIE_PATH = "/"


def _is_cookie_secure() -> bool:
    return os.getenv("COOKIE_SECURE", "false").lower() == "true"


def _frontend_url() -> str:
    return os.getenv("FRONTEND_URL", "http://localhost:8443").rstrip("/")


def _set_session_cookie(response: Response, session_id: str) -> None:
    response.set_cookie(
        key=COOKIE_NAME,
        value=session_id,
        max_age=COOKIE_MAX_AGE,
        httponly=True,
        samesite=COOKIE_SAMESITE,
        secure=_is_cookie_secure(),
        path=COOKIE_PATH,
    )


def _clear_session_cookie(response: Response) -> None:
    response.delete_cookie(
        key=COOKIE_NAME,
        path=COOKIE_PATH,
        samesite=COOKIE_SAMESITE,
        secure=_is_cookie_secure(),
    )


@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def signup(
    req: SignUpRequest,
    response: Response,
    auth_service: AuthService = Depends(get_auth_service),
):
    try:
        user = auth_service.create_user(
            email=req.email,
            password=req.password,
            name=req.name,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    session_id = auth_service.create_session(user.id)
    _set_session_cookie(response, session_id)

    return AuthResponse(
        authenticated=True,
        user=user,
        sessionId=session_id,
        message="Account created successfully",
    )


@router.post("/login", response_model=AuthResponse)
async def login(
    req: LoginRequest,
    response: Response,
    auth_service: AuthService = Depends(get_auth_service),
):
    user = auth_service.authenticate_user(email=req.email, password=req.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    session_id = auth_service.create_session(user.id)
    _set_session_cookie(response, session_id)

    return AuthResponse(
        authenticated=True,
        user=user,
        sessionId=session_id,
        message="Logged in successfully",
    )


@router.post("/logout", response_model=AuthResponse)
async def logout(
    request: Request,
    response: Response,
    auth_service: AuthService = Depends(get_auth_service),
):
    session_id = request.cookies.get(COOKIE_NAME)
    if not session_id:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            session_id = auth_header[7:].strip()
    if not session_id:
        session_id = request.headers.get("X-Session-ID", "").strip()

    if session_id:
        auth_service.delete_session(session_id)

    _clear_session_cookie(response)

    return AuthResponse(
        authenticated=False,
        user=None,
        message="Logged out successfully",
    )


@router.get("/me", response_model=AuthResponse)
async def get_me(
    user: UserProfile | None = Depends(get_current_user_optional),
):
    if not user:
        return AuthResponse(authenticated=False, user=None)
    return AuthResponse(authenticated=True, user=user)


@router.patch("/profile", response_model=AuthResponse)
async def update_profile(
    req: UpdateProfileRequest,
    current_user: UserProfile = Depends(get_current_user),
    auth_service: AuthService = Depends(get_auth_service),
):
    try:
        updated_user = auth_service.update_user_name(current_user.id, req.name)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    return AuthResponse(
        authenticated=True,
        user=updated_user,
        message="Profile name updated successfully",
    )


@router.post("/change-password")
async def change_password(
    req: ChangePasswordRequest,
    current_user: UserProfile = Depends(get_current_user),
    auth_service: AuthService = Depends(get_auth_service),
):
    try:
        auth_service.change_password(
            user_id=current_user.id,
            new_password=req.newPassword,
            current_password=req.currentPassword,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    return {"success": True, "message": "Password updated successfully"}


# Google OAuth Endpoints
@router.get("/google/config", response_model=GoogleConfigResponse)
async def get_google_config(request: Request, origin: str | None = Query(None)):
    client_id = os.getenv("GOOGLE_CLIENT_ID", "").strip()
    configured = bool(client_id)
    host = request.headers.get("host", "127.0.0.1:8000")
    default_callback = f"http://{host}/api/auth/google/callback"
    callback_url = os.getenv("GOOGLE_REDIRECT_URI") or default_callback

    auth_url = None
    if configured:
        frontend_state = origin or request.headers.get("referer", "").split("/#")[0].rstrip("/") or _frontend_url()
        params = {
            "client_id": client_id,
            "redirect_uri": callback_url,
            "response_type": "code",
            "scope": "openid email profile",
            "access_type": "offline",
            "prompt": "consent",
            "state": frontend_state,
        }
        auth_url = f"https://accounts.google.com/o/oauth2/v2/auth?{urllib.parse.urlencode(params)}"

    return GoogleConfigResponse(
        configured=configured,
        clientId=client_id if configured else None,
        authUrl=auth_url,
    )


@router.post("/google", response_model=AuthResponse)
async def google_auth(
    req: GoogleAuthRequest,
    response: Response,
    auth_service: AuthService = Depends(get_auth_service),
):
    client_id = os.getenv("GOOGLE_CLIENT_ID", "").strip()
    if not client_id:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google OAuth is not configured. Please add GOOGLE_CLIENT_ID to backend/.env",
        )

    email = None
    name = None
    google_id = None
    avatar = None

    if req.credential:
        # Validate ID token with Google's tokeninfo endpoint
        try:
            tokeninfo_url = f"https://oauth2.googleapis.com/tokeninfo?id_token={urllib.parse.quote(req.credential)}"
            req_obj = urllib.request.Request(tokeninfo_url, headers={"User-Agent": "SubSlayer-AI"})
            with urllib.request.urlopen(req_obj, timeout=10) as resp:
                data = json.loads(resp.read().decode("utf-8"))
            
            # Verify audience matches client ID if provided
            aud = data.get("aud")
            if client_id and aud != client_id:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token audience")
            
            email = data.get("email")
            name = data.get("name") or data.get("given_name") or (email.split("@")[0] if email else "Google User")
            google_id = data.get("sub")
            avatar = data.get("picture")
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Google token validation failed: {str(e)}",
            )
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing credential")

    if not email or not google_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Incomplete Google profile")

    user = auth_service.get_or_create_oauth_user(
        email=email,
        name=name,
        oauth_id=google_id,
        provider="google",
        avatar=avatar,
    )
    session_id = auth_service.create_session(user.id)
    _set_session_cookie(response, session_id)

    return AuthResponse(
        authenticated=True,
        user=user,
        sessionId=session_id,
        message="Signed in with Google successfully",
    )


@router.get("/google/callback")
async def google_callback(
    request: Request,
    code: str = Query(...),
    state: str | None = Query(None),
    auth_service: AuthService = Depends(get_auth_service),
):
    client_id = os.getenv("GOOGLE_CLIENT_ID", "").strip()
    client_secret = os.getenv("GOOGLE_CLIENT_SECRET", "").strip()
    host = request.headers.get("host", "127.0.0.1:8000")
    default_callback = f"http://{host}/api/auth/google/callback"
    redirect_uri = os.getenv("GOOGLE_REDIRECT_URI") or default_callback

    if not client_id or not client_secret:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google OAuth credentials not configured on backend",
        )

    try:
        # Exchange authorization code for tokens
        token_data = urllib.parse.urlencode({
            "code": code,
            "client_id": client_id,
            "client_secret": client_secret,
            "redirect_uri": redirect_uri,
            "grant_type": "authorization_code",
        }).encode("utf-8")

        token_req = urllib.request.Request(
            "https://oauth2.googleapis.com/token",
            data=token_data,
            headers={"Content-Type": "application/x-www-form-urlencoded", "User-Agent": "SubSlayer-AI"},
        )
        with urllib.request.urlopen(token_req, timeout=10) as resp:
            token_res = json.loads(resp.read().decode("utf-8"))

        access_token = token_res.get("access_token")
        if not access_token:
            raise ValueError("No access token returned")

        # Fetch user info
        user_req = urllib.request.Request(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f"Bearer {access_token}", "User-Agent": "SubSlayer-AI"},
        )
        with urllib.request.urlopen(user_req, timeout=10) as resp:
            user_data = json.loads(resp.read().decode("utf-8"))

        email = user_data.get("email")
        name = user_data.get("name") or (email.split("@")[0] if email else "Google User")
        google_id = user_data.get("sub")
        avatar = user_data.get("picture")

        if not email or not google_id:
            raise ValueError("Incomplete Google user profile")

        user = auth_service.get_or_create_oauth_user(
            email=email,
            name=name,
            oauth_id=google_id,
            provider="google",
            avatar=avatar,
        )
        session_id = auth_service.create_session(user.id)

        target_host = state if (state and state.startswith("http")) else _frontend_url()
        frontend_dest = f"{target_host.rstrip('/')}/#app?session_id={session_id}"
        redirect_response = RedirectResponse(url=frontend_dest, status_code=status.HTTP_302_FOUND)
        _set_session_cookie(redirect_response, session_id)
        return redirect_response

    except Exception as e:
        target_host = state if (state and state.startswith("http")) else _frontend_url()
        error_url = f"{target_host.rstrip('/')}/#login?error={urllib.parse.quote(str(e))}"
        return RedirectResponse(url=error_url, status_code=status.HTTP_302_FOUND)

