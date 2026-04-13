import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslation from './locales/en.json';
import hiTranslation from './locales/hi.json';
import teTranslation from './locales/te.json';
import taTranslation from './locales/ta.json';
import mlTranslation from './locales/ml.json';
import knTranslation from './locales/kn.json';
import bnTranslation from './locales/bn.json';
import mrTranslation from './locales/mr.json';
import guTranslation from './locales/gu.json';
import paTranslation from './locales/pa.json';

const resources = {
  en: { translation: enTranslation },
  hi: { translation: hiTranslation },
  te: { translation: teTranslation },
  ta: { translation: taTranslation },
  ml: { translation: mlTranslation },
  kn: { translation: knTranslation },
  bn: { translation: bnTranslation },
  mr: { translation: mrTranslation },
  gu: { translation: guTranslation },
  pa: { translation: paTranslation }
};

const savedLanguage = localStorage.getItem('le_ui_lang') || 'en';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false 
    }
  });

i18n.on('languageChanged', (lng) => {
  localStorage.setItem('le_ui_lang', lng);
});

export default i18n;
