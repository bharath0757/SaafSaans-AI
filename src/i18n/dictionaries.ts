export type Locale = "en" | "hi" | "te";

export const dictionaries = {
  en: {
    skipToContent: "Skip to content",
    brand: "SaafSaans",
    tagline: "Clearer choices for smog days",
    heroFallback:
      "Choose your location to see today's air quality and a simple plan for your household.",
    privacyNote: "Your location stays on your device.",
    useLocation: "Use my location",
    searchCity: "Search a city",
    notMedicalAdvice: "Educational estimates only — not medical advice.",
    dataAttribution: "Air quality data will use Open-Meteo (attribution on live readings).",
    language: "Language",
    aqiLabel: "Air quality index",
    loading: "Loading",
  },
  hi: {
    skipToContent: "मुख्य सामग्री पर जाएँ",
    brand: "SaafSaans",
    tagline: "धुंध भरे दिनों के लिए स्पष्ट विकल्प",
    heroFallback: "आज की हवा की गुणवत्ता और अपने घर के लिए एक सरल योजना देखने के लिए अपना स्थान चुनें।",
    privacyNote: "आपका स्थान आपके उपकरण पर ही रहता है।",
    useLocation: "मेरा स्थान उपयोग करें",
    searchCity: "शहर खोजें",
    notMedicalAdvice: "केवल शैक्षिक अनुमान — चिकित्सकीय सलाह नहीं।",
    dataAttribution: "वायु गुणवत्ता डेटा Open-Meteo से आएगा (लाइव रीडिंग पर श्रेय)।",
    language: "भाषा",
    aqiLabel: "वायु गुणवत्ता सूचकांक",
    loading: "लोड हो रहा है",
  },
  te: {
    skipToContent: "ప్రధాన కంటెంట్‌కు వెళ్లండి",
    brand: "SaafSaans",
    tagline: "పొగమంచు రోజులకు స్పష్టమైన ఎంపికలు",
    heroFallback: "ఈరోజు గాలి నాణ్యత మరియు మీ ఇంటికి సరళమైన ప్రణాళిక చూడటానికి మీ స్థానాన్ని ఎంచుకోండి.",
    privacyNote: "మీ స్థానం మీ పరికరంలోనే ఉంటుంది.",
    useLocation: "నా స్థానం ఉపయోగించు",
    searchCity: "నగరం వెతకండి",
    notMedicalAdvice: "విద్యా అంచనాలు మాత్రమే — వైద్య సలహా కాదు.",
    dataAttribution: "గాలి నాణ్యత డేటా Open-Meteo నుండి వస్తుంది (లైవ్ రీడింగ్‌లపై ఆపాదన).",
    language: "భాష",
    aqiLabel: "గాలి నాణ్యత సూచిక",
    loading: "లోడ్ అవుతోంది",
  },
} as const;

export type Dictionary = (typeof dictionaries)[Locale];

/** Typed dictionary lookup. */
export function t(locale: Locale, key: keyof Dictionary): string {
  return dictionaries[locale][key];
}
