from fastapi import Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.auth import get_current_user
from app.core.permissions import require_capability

DbSession = Depends(get_db)
CurrentUser = Depends(get_current_user)

def Can(capability: str):
    return Depends(require_capability(capability))