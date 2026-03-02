import pytest
# We import a module that does not exist yet for TDD
from app.services.i18n import Translator

def test_i18n_fallback_english():
    """
    Test that the Translator defaults to English when an unsupported
    or missing language is requested.
    """
    t = Translator("fr") # Unsupported language
    assert t.translate("SUCCESS") == "Success"

def test_i18n_translate_vietnamese():
    """
    Test that the Translator correctly loads and translates keys using the 'vi' dictionary.
    """
    t = Translator("vi")
    assert t.translate("MISSING_FIELD") == "Thiếu trường"

def test_i18n_translate_spanish():
    """
    Test that the Translator correctly loads and translates keys using the 'es' dictionary.
    """
    t = Translator("es")
    assert t.translate("REGISTER_SUCCESS") == "Usuario registrado con éxito."

def test_i18n_missing_key():
    """
    Test that the Translator safely handles a missing key, perhaps returning the raw key back.
    """
    t = Translator("en")
    assert t.translate("NON_EXISTENT_KEY") == "NON_EXISTENT_KEY"

def test_i18n_get_supported_languages():
    """
    Test that the Translator can return a list or dictionary of currently
    loaded/supported languages (e.g. ['en', 'vi', 'es']).
    """
    supported = Translator.get_supported_languages()
    assert isinstance(supported, list)
    assert "en" in supported
    assert "vi" in supported
    assert "es" in supported
