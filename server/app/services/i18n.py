import json
import os
from functools import lru_cache

# The directory where translation JSON files are stored
LOCALES_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "locales")

@lru_cache(maxsize=1)
def load_translations() -> dict:
    """
    Loads all JSON translation files from the locales directory into memory.
    Cached so it only reads from disk once.
    """
    translations = {}
    if not os.path.exists(LOCALES_DIR):
        return translations

    for filename in os.listdir(LOCALES_DIR):
        if filename.endswith(".json"):
            lang_code = filename[:-5]  # e.g., 'en.json' -> 'en'
            filepath = os.path.join(LOCALES_DIR, filename)
            with open(filepath, "r", encoding="utf-8") as file:
                try:
                    translations[lang_code] = json.load(file)
                except json.JSONDecodeError:
                    pass
    return translations

class Translator:
    def __init__(self, target_lang: str = "en"):
        self.translations = load_translations()
        
        # Fallback to English if the requested language is not supported
        self.target_lang = target_lang if target_lang in self.translations else "en"

    def translate(self, key: str) -> str:
        """
        Translates a given key based on the initialized language.
        If the key doesn't exist in the target language, it falls back to English.
        If it doesn't exist in English either, it returns the raw key.
        """
        # Try finding it in the target language
        if self.target_lang in self.translations and key in self.translations[self.target_lang]:
            return self.translations[self.target_lang][key]
            
        # Fallback to english
        if "en" in self.translations and key in self.translations["en"]:
            return self.translations["en"][key]
            
        # Return the key itself as a last resort
        return key

    @staticmethod
    def get_supported_languages() -> list[str]:
        """
        Returns a list of all currently loaded language codes (e.g. ['en', 'vi', 'es']).
        """
        return list(load_translations().keys())
