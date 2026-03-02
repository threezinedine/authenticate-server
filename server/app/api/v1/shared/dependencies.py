from fastapi import Header
from app.services.i18n import Translator

def get_translator(accept_language: str | None = Header(None)) -> Translator:
    """
    FastAPI Dependency to extract the requested language from the
    'Accept-Language' HTTP header and return a bound Translator instance.
    """
    lang_code = "en"
    if accept_language:
        # e.g. 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7' -> extracts 'vi'
        primary_lang = accept_language.split(",")[0].split("-")[0].strip().lower()
        if primary_lang:
            lang_code = primary_lang
            
    return Translator(target_lang=lang_code)
