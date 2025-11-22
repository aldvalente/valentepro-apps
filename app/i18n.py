"""Internationalization (i18n) service for multi-language support"""
import json
import os
from typing import Dict, Any

# Load translation files
_translations: Dict[str, Dict[str, Any]] = {}
_locales_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'locales')

def load_translations():
    """Load all translation files from locales directory"""
    global _translations
    for filename in os.listdir(_locales_dir):
        if filename.endswith('.json'):
            lang = filename.replace('.json', '')
            filepath = os.path.join(_locales_dir, filename)
            with open(filepath, 'r', encoding='utf-8') as f:
                _translations[lang] = json.load(f)

# Load translations on module import
try:
    load_translations()
except Exception as e:
    print(f"Warning: Could not load translations: {e}")
    _translations = {'it': {}, 'en': {}}


def get_translation(key: str, lang: str = 'it', **kwargs) -> str:
    """
    Get translation for a key in specified language
    
    Args:
        key: Translation key in dot notation (e.g., 'auth.email_already_registered')
        lang: Language code ('it' or 'en')
        **kwargs: Variables to interpolate in the translation
    
    Returns:
        Translated string or the key itself if not found
    """
    # Default to Italian if language not supported
    if lang not in _translations:
        lang = 'it'
    
    # Navigate through nested dictionary
    parts = key.split('.')
    value = _translations.get(lang, {})
    
    for part in parts:
        if isinstance(value, dict):
            value = value.get(part)
        else:
            break
    
    # If not found, try English as fallback
    if value is None and lang != 'en':
        value = _translations.get('en', {})
        for part in parts:
            if isinstance(value, dict):
                value = value.get(part)
            else:
                break
    
    # If still not found, return the key
    if value is None:
        return key
    
    # Interpolate variables if any
    if kwargs and isinstance(value, str):
        try:
            return value.format(**kwargs)
        except KeyError:
            pass
    
    return str(value) if value is not None else key


def t(key: str, lang: str = 'it', **kwargs) -> str:
    """Shorthand for get_translation"""
    return get_translation(key, lang, **kwargs)


def get_user_language(user) -> str:
    """Get user's preferred language, default to 'it'"""
    if user and hasattr(user, 'preferred_language'):
        return user.preferred_language or 'it'
    return 'it'
