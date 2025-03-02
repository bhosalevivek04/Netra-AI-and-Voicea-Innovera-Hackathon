import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: true,
    interpolation: {
      escapeValue: false,
    },
    resources: {
      en: {
        translation: {
          welcome: "Hi! How can I help you today?",
          sendButton: "Send",
          inputPlaceholder: "Type your message...",
          aiAssistant: "AI Assistant",
          thinking: "Thinking...",
          error: "Sorry, I encountered an error. Please try again."
        }
      },
      mr: {
        translation: {
          welcome: "नमस्कार! मी आज आपली कशी मदत करू शकतो?",
          sendButton: "पाठवा",
          inputPlaceholder: "आपला संदेश टाइप करा...",
          aiAssistant: "कृत्रिम बुद्धिमत्ता सहाय्यक",
          thinking: "विचार करत आहे...",
          error: "क्षमस्व, एक त्रुटी आली. कृपया पुन्हा प्रयत्न करा."
        }
      },
      hi: {
        translation: {
          welcome: "नमस्ते! मैं आज आपकी कैसे मदद कर सकता हूं?",
          sendButton: "भेजें",
          inputPlaceholder: "अपना संदेश टाइप करें...",
          aiAssistant: "एआई सहायक",
          thinking: "सोच रहा हूं...",
          error: "क्षमा करें, एक त्रुटि हुई। कृपया पुनः प्रयास करें।"
        }
      }
    }
  });

export default i18n; 