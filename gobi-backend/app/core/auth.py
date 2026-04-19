from fastapi import HTTPException, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from clerk_backend_api import Clerk
from app.core.config import settings

security = HTTPBearer()
clerk = Clerk(bearer_auth=settings.CLERK_SECRET_KEY)

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Security(security)
):
    token = credentials.credentials
    try:
        payload = clerk.verify_token(token)
        return {
            "user_id": payload["sub"],
            "rol": payload.get("public_metadata", {}).get("rol", "ciudadano"),
        }
    except Exception:
        raise HTTPException(status_code=401, detail="Token inválido o expirado")

async def require_admin(user=Security(get_current_user)):
    if user["rol"] != "admin":
        raise HTTPException(status_code=403, detail="Se requiere rol de administrador")
    return user
