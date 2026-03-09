import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import enJSON from './locale/English.json'
import ptJSON from './locale/Portuguese.json'
import moment from 'moment';
import 'moment/locale/pt';
import {translations} from "@a12e/accessmonitor-rulesets";
// Global safeguard: if a Moment instance is invalid, format() returns an empty string
const originalMomentFormat = moment.fn.format;
moment.fn.format = function (...args) {
  if (!this.isValid()) return '';
  return originalMomentFormat.apply(this, args);
};
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: { ...enJSON, ...translations.en.translation } },
      pt: { translation: { ...ptJSON, ...translations.pt.translation } },
    },
    fallbackLng: "en",
    interpolation: { escapeValue: false }
  });

// Function to update Moment.js locale based on i18next language
function updateMomentLocale() {
    const currentLanguage = i18n.language;
    moment.locale(currentLanguage);
}

// Listen for language change
i18n.on('languageChanged', () => {
    updateMomentLocale();
});


// Initially set the locale
updateMomentLocale();
export default i18n;