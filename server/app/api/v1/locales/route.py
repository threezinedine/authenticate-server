from fastapi import APIRouter
from app.services.i18n import Translator

router = APIRouter()

@router.get("/")
def get_supported_locales():
    """
    Returns a list of all supported language codes available 
    on the authentication server.
    """
    return {
        "supported_languages": Translator.get_supported_languages()
    }
