/**
 * Multilingual Translation System for NER Smart Logistics Platform.
 * Supports English, Hindi (हिंदी), Assamese (অসমীয়া), and Bengali (বাংলা).
 * Designed for alert templates, notifications, and UI while strictly preserving
 * technical identifiers (e.g. NH-2, NER-101, coordinates, and metrics).
 */

export const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'as', label: 'Assamese', native: 'অসমীয়া' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা' },
];

export const translations = {
  en: {
    // Nav & System
    dashboard: 'Dashboard',
    liveMap: 'Live Map',
    vehicles: 'Vehicles',
    routes: 'Routes',
    incidents: 'Incidents',
    alerts: 'Alerts',
    logistics: 'Logistics',
    analytics: 'Analytics',
    fieldReports: 'Field Reports',
    simulation: 'Live Simulation',
    settings: 'Settings',
    logout: 'Logout',
    notifications: 'Notifications',
    searchPlaceholder: 'Search roads, vehicles, districts...',
    markAllRead: 'Mark all as read',
    noAlerts: 'No unread alerts',
    viewAllAlerts: 'View all alerts →',

    // Statuses & Severities
    critical: 'Critical',
    warning: 'Warning',
    info: 'Info',
    open: 'Open',
    risky: 'Risky',
    blocked: 'Blocked',
    moving: 'Moving',
    delayed: 'Delayed',
    atRisk: 'At Risk',
    delivered: 'Delivered',
    pending: 'Pending',
    assigned: 'Assigned',
    inTransit: 'In Transit',

    // Alert Templates
    alertRoadBlocked: 'is completely BLOCKED due to',
    alertAlternateAvailable: 'Alternate bypass routing active.',
    alertHeavyRain: 'Heavy rainfall warning in',
    alertDelayDelivery: 'Consignment delivery is delayed by',
    alertAcknowledge: 'Acknowledge',
    alertAcknowledged: 'Acknowledged',

    // Dashboard Cards & Sections
    roadsMonitored: 'Roads Monitored',
    openRoads: 'Open Roads',
    riskyRoads: 'Risky Roads',
    blockedRoads: 'Blocked Roads',
    activeVehicles: 'Active Vehicles',
    delayedDeliveries: 'Delayed Deliveries',
    criticalAlerts: 'Critical Alerts',
    activeIncidents: 'Active Incidents',
    districtConnectivity: 'District Connectivity Matrix',
    logisticsBottlenecks: 'Logistics Bottlenecks & Hazards',
    emergencyRoutes: 'Emergency Routes & Reroutes',
    aiInsights: 'AI Logistics Intelligence Insights'
  },
  hi: {
    dashboard: 'डैशबोर्ड',
    liveMap: 'लाइव मानचित्र',
    vehicles: 'वाहन बेड़ा',
    routes: 'मार्ग प्रबंधन',
    incidents: 'आपदा एवं घटनाएं',
    alerts: 'चेतावनी एवं सूचनाएं',
    logistics: 'लॉजिस्टिक्स',
    analytics: 'विश्लेषण',
    fieldReports: 'फ़ील्ड रिपोर्ट',
    simulation: 'लाइव सिमुलेशन',
    settings: 'सेटिंग्स',
    logout: 'लॉगआउट',
    notifications: 'सूचनाएं',
    searchPlaceholder: 'सड़कें, वाहन, जिले खोजें...',
    markAllRead: 'सभी पढ़े गए चिह्नित करें',
    noAlerts: 'कोई अपठित चेतावनी नहीं',
    viewAllAlerts: 'सभी चेतावनियां देखें →',

    critical: 'गंभीर',
    warning: 'चेतावनी',
    info: 'सूचना',
    open: 'खुला',
    risky: 'जोखिमपूर्ण',
    blocked: 'अवरुद्ध',
    moving: 'चल रहा है',
    delayed: 'विलंबित',
    atRisk: 'जोखिम में',
    delivered: 'वितरित',
    pending: 'लंबित',
    assigned: 'आवंटित',
    inTransit: 'पारगमन में',

    alertRoadBlocked: 'पूरी तरह से अवरुद्ध है कारण:',
    alertAlternateAvailable: 'वैकल्पिक बाईपास मार्ग सक्रिय है।',
    alertHeavyRain: 'भारी वर्षा की चेतावनी जिला:',
    alertDelayDelivery: 'माल वितरण में विलंब:',
    alertAcknowledge: 'स्वीकार करें',
    alertAcknowledged: 'स्वीकृत',

    roadsMonitored: 'निगरानी अधीन सड़कें',
    openRoads: 'खुली सड़कें',
    riskyRoads: 'जोखिमपूर्ण सड़कें',
    blockedRoads: 'अवरुद्ध सड़कें',
    activeVehicles: 'सक्रिय वाहन',
    delayedDeliveries: 'विलंबित डिलीवरी',
    criticalAlerts: 'गंभीर चेतावनियां',
    activeIncidents: 'सक्रिय घटनाएं',
    districtConnectivity: 'जिला-वार कनेक्टिविटी मैट्रिक्स',
    logisticsBottlenecks: 'लॉजिस्टिक्स बाधाएं एवं जोखिम',
    emergencyRoutes: 'आपातकालीन एवं वैकल्पिक मार्ग',
    aiInsights: 'एआई लॉजिस्टिक्स इंटेलिजेंस अंतर्दृष्टि'
  },
  as: {
    dashboard: 'ডেশ্ববৰ্ড',
    liveMap: 'লাইভ মানচিত্ৰ',
    vehicles: 'বাহনসমূহ',
    routes: 'পথ ব্যৱস্থাপনা',
    incidents: 'দুৰ্যোগ আৰু ঘটনা',
    alerts: 'সতৰ্কবাৰ্তা আৰু জাননী',
    logistics: 'লজিষ্টিকছ',
    analytics: 'বিশ্লেষণ',
    fieldReports: 'ক্ষেত্ৰ প্ৰতিবেদন',
    simulation: 'লাইভ অনুকৰণ',
    settings: 'ছেটিংছ',
    logout: 'লগআউট',
    notifications: 'জাননীসমূহ',
    searchPlaceholder: 'পথ, বাহন, জিলা সন্ধান কৰক...',
    markAllRead: 'সকলো পঢ়া বুলি চিহ্নিত কৰক',
    noAlerts: 'কোনো নতুন সতৰ্কবাৰ্তা নাই',
    viewAllAlerts: 'সকলো সতৰ্কবাৰ্তা চাওক →',

    critical: 'সংকটজনক',
    warning: 'সাৱধানবাণী',
    info: 'তথ্য',
    open: 'খোলা',
    risky: 'বিপজ্জনক',
    blocked: 'অৱৰোধিত',
    moving: 'চলন্ত',
    delayed: 'পলম হোৱা',
    atRisk: 'বিপদাপন্ন',
    delivered: 'বিতৰণ কৰা হ’ল',
    pending: 'বাকী থকা',
    assigned: 'নিযুক্ত কৰা হ’ল',
    inTransit: 'পথত আছে',

    alertRoadBlocked: 'সম্পূৰ্ণৰূপে অৱৰোধিত, কাৰণ:',
    alertAlternateAvailable: 'বিকল্প বাইপাছ পথ ব্যৱহাৰৰ উপযোগী।',
    alertHeavyRain: 'প্ৰবল বৰষুণৰ সতৰ্কবাৰ্তা জিলা:',
    alertDelayDelivery: 'সামগ্ৰী যোগান পলম হৈছে:',
    alertAcknowledge: 'গ্ৰহণ কৰক',
    alertAcknowledged: 'স্বীকৃত',

    roadsMonitored: 'নিৰীক্ষণ কৰা পথ',
    openRoads: 'খোলা পথ',
    riskyRoads: 'বিপজ্জনক পথ',
    blockedRoads: 'অৱৰোধিত পথ',
    activeVehicles: 'সক্ৰিয় বাহন',
    delayedDeliveries: 'পলম হোৱা যোগান',
    criticalAlerts: 'সংকটজনক সতৰ্কতা',
    activeIncidents: 'সক্ৰিয় ঘটনা',
    districtConnectivity: 'জিলাভিত্তিক সংযোগ মেট্ৰিক্স',
    logisticsBottlenecks: 'লজিষ্টিকছৰ বাধা আৰু সংকট',
    emergencyRoutes: 'জৰুৰীকালীন আৰু বিকল্প পথ',
    aiInsights: 'এআই লজিষ্টিকছ বুদ্ধিমত্তা পৰামৰ্শ'
  },
  bn: {
    dashboard: 'ড্যাশবোর্ড',
    liveMap: 'লাইভ ম্যাপ',
    vehicles: 'যানবাহন',
    routes: 'রুট ব্যবস্থাপনা',
    incidents: 'দুর্যোগ ও ঘটনা',
    alerts: 'সতর্কবার্তা ও বিজ্ঞপ্তি',
    logistics: 'লজিস্টিকস',
    analytics: 'অ্যানালিটিক্স',
    fieldReports: 'ফিল্ড রিপোর্ট',
    simulation: 'লাইভ সিমুলেশন',
    settings: 'সেটিংস',
    logout: 'লগআউট',
    notifications: 'বিজ্ঞপ্তি',
    searchPlaceholder: 'সড়ক, যানবাহন, জেলা অনুসন্ধান করুন...',
    markAllRead: 'সব পড়া হয়েছে চিহ্নিত করুন',
    noAlerts: 'কোন অপঠিত সতর্কতা নেই',
    viewAllAlerts: 'সকল সতর্কতা দেখুন →',

    critical: 'সংকটজনক',
    warning: 'সতর্কতা',
    info: 'তথ্য',
    open: 'খোলা',
    risky: 'ঝুঁকিপূর্ণ',
    blocked: 'অবরুদ্ধ',
    moving: 'চলমান',
    delayed: 'বিলম্বিত',
    atRisk: 'ঝুঁকিতে রয়েছে',
    delivered: 'বিতরণ সম্পন্ন',
    pending: 'অপেক্ষারত',
    assigned: 'বরাদ্দকৃত',
    inTransit: 'ট্রানজিটে আছে',

    alertRoadBlocked: 'সম্পূর্ণরূপে অবরুদ্ধ, কারণ:',
    alertAlternateAvailable: 'বিকল্প বাইপাস রুট প্রস্তুত রয়েছে।',
    alertHeavyRain: 'ভারী বর্ষণের সতর্কবার্তা জেলা:',
    alertDelayDelivery: 'পণ্য সরবরাহে বিলম্ব:',
    alertAcknowledge: 'স্বীকার করুন',
    alertAcknowledged: 'স্বীকৃত',

    roadsMonitored: 'নজরদারিকৃত সড়ক',
    openRoads: 'খোলা সড়ক',
    riskyRoads: 'ঝুঁকিপূর্ণ সড়ক',
    blockedRoads: 'অবরুদ্ধ সড়ক',
    activeVehicles: 'সক্রিয় যানবাহন',
    delayedDeliveries: 'বিলম্বিত সরবরাহ',
    criticalAlerts: 'সংকটজনক সতর্কতা',
    activeIncidents: 'সক্রিয় ঘটনা',
    districtConnectivity: 'জেলা-ভিত্তিক সংযোগ ম্যাট্রিক্স',
    logisticsBottlenecks: 'লজিস্টিকসের বাধা ও সমস্যা',
    emergencyRoutes: 'জরুরি ও বিকল্প রুট',
    aiInsights: 'এআই লজিস্টিকস বুদ্ধিমত্তা পরামর্শ'
  }
};

export function getCurrentLanguage() {
  return localStorage.getItem('ner_lang') || 'en';
}

export function setCurrentLanguage(lang) {
  localStorage.setItem('ner_lang', lang);
  window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
}

/**
 * Helper to translate alert messages or strings while keeping technical entities unaltered.
 */
export function translateAlert(input, lang = 'en') {
  if (!input || lang === 'en' || !translations[lang]) return input;

  const t = translations[lang];

  // If passed a simple string (e.g. alert.title or alert.message)
  if (typeof input === 'string') {
    let result = input;

    // Translate common phrases while keeping technical IDs intact
    if (result.includes('Road Blocked') || result.includes('is blocked') || result.includes('completely blocked')) {
      result = result
        .replace(/Road Blocked/gi, t.blocked)
        .replace(/completely blocked/gi, t.alertRoadBlocked)
        .replace(/due to/gi, '—')
        .replace(/Alternate route via/gi, t.alertAlternateAvailable + ' via');
    }
    if (result.includes('Heavy Rainfall Alert') || result.includes('Heavy Rainfall')) {
      result = result.replace(/Heavy Rainfall Alert/gi, t.alertHeavyRain);
    }
    if (result.includes('High Disruption Risk') || result.includes('High Risk')) {
      result = result.replace(/High Disruption Risk/gi, `${t.risky} (${t.critical})`);
    }
    if (result.includes('At Risk') || result.includes('delayed')) {
      result = result.replace(/At Risk/gi, t.atRisk).replace(/delayed by/gi, t.alertDelayDelivery);
    }

    return result;
  }

  // If passed an alert object
  const alert = input;
  let translatedTitle = alert.title;
  let translatedMessage = alert.message;

  if (alert.type === 'Road Blockage' || alert.title?.includes('Blocked')) {
    const roadMatch = alert.title.match(/(NH-\d+|SH-\d+|DR-\d+|[A-Za-z0-9\-]+ Highway|[A-Za-z0-9\-]+ Road)/i);
    const roadName = roadMatch ? roadMatch[0] : 'Corridor';
    translatedTitle = `${roadName} — ${t.blocked.toUpperCase()}`;
    translatedMessage = `${roadName} ${t.alertRoadBlocked} ${alert.message?.split('due to')?.[1] || 'landslide'}. ${t.alertAlternateAvailable}`;
  } else if (alert.type === 'Heavy Rainfall' || alert.type === 'Weather Warning') {
    translatedTitle = `${t.alertHeavyRain} ${alert.location?.district || ''}`;
  } else if (alert.type === 'Delivery Delay' || alert.type === 'Vehicle Delay') {
    translatedTitle = `${t.alertDelayDelivery} ${alert.title}`;
  }

  return {
    ...alert,
    translatedTitle,
    translatedMessage,
    translatedSeverity: t[alert.severity?.toLowerCase()] || alert.severity
  };
}

export function getTranslation(key, lang = 'en') {
  return translations[lang]?.[key] || translations['en'][key] || key;
}
