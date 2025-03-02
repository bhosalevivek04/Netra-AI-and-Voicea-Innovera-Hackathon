from googletrans import Translator
from typing import Dict, Any
import json

class TranslationService:
    def __init__(self):
        self.translator = Translator()
        
    def translate_text(self, text: str, target_lang: str) -> str:
        try:
            if target_lang == 'mr':  # Marathi
                result = self.translator.translate(text, dest='mr')
            elif target_lang == 'hi':  # Hindi
                result = self.translator.translate(text, dest='hi')
            else:
                return text  # Return original text for English
            return result.text
        except Exception as e:
            print(f"Translation error: {e}")
            return text

    def translate_content(self, content: Dict[str, Any], target_lang: str) -> Dict[str, Any]:
        translated_content = {}
        
        def translate_value(value):
            if isinstance(value, str):
                return self.translate_text(value, target_lang)
            elif isinstance(value, dict):
                return {k: translate_value(v) for k, v in value.items()}
            elif isinstance(value, list):
                return [translate_value(item) for item in value]
            return value
        
        return {k: translate_value(v) for k, v in content.items()} 