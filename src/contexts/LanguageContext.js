import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export function useLanguage() {
  return useContext(LanguageContext);
}

// Indian Regional Languages
export const languages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া' }
];

// Translations for different languages
export const translations = {
  en: {
    // Navigation
    amaplayer: 'AmaPlayer',
    home: 'Home',
    search: 'Search',
    add: 'Add',
    activity: 'Activity',
    profile: 'Profile',
    logout: 'Logout',
    
    // Landing Page
    hero_title: 'AmaPlayer',
    hero_subtitle: '🏅 Where Champions Rise & Victory Lives 🏅',
    hero_description: '⚽ Train Hard. Play Harder. Win Together. Connect with elite athletes, showcase your achievements, and fuel your competitive spirit with legendary sports moments! 🥇',
    join_champions: '🏆 Join the Champions 🏆',
    continue_guest: '⚡ Continue as Guest ⚡',
    olympic_spirit: 'Olympic Spirit',
    words_champions: 'Words of Champions',
    why_amaplayer: 'Why AmaPlayer?',
    share_victories: 'Share Your Victories',
    connect_athletes: 'Connect with Athletes',
    get_motivated: 'Get Motivated',
    capture_moments: 'Capture Moments',
    ready_join: 'Ready to Join the Champions?',
    get_started: 'Get Started Now',
    
    // Auth
    login: 'Log In',
    signup: 'Sign Up',
    email: 'Email',
    password: 'Password',
    full_name: 'Full Name',
    confirm_password: 'Confirm Password',
    no_account: "Don't have an account?",
    have_account: 'Already have an account?',
    
    // Posts
    create_post: 'Create New Post',
    whats_mind: "What's on your mind?",
    post: 'Post',
    posting: 'Posting...',
    like: 'Like',
    comment: 'Comment',
    
    // Gallery captions
    olympic_rings: 'Olympic Rings - Symbol of Unity',
    athletic_excellence: 'Athletic Excellence',
    victory_celebration: 'Victory Celebration',
    swimming_championships: 'Swimming Championships',
    
    // Profile
    personal_details: 'Personal Details',
    name: 'Name',
    age: 'Age',
    height: 'Height',
    weight: 'Weight',
    sex: 'Sex',
    male: 'Male',
    female: 'Female',
    other: 'Other',
    certificates: 'Certificates',
    achievements: 'Achievements',
    role: 'Role',
    athlete: 'Athlete',
    coach: 'Coach',
    organisation: 'Organisation',
    profile_picture: 'Profile Picture',
    upload_photo: 'Upload Photo',
    save_profile: 'Save Profile',
    edit_profile: 'Edit Profile',
    height_cm: 'Height (cm)',
    weight_kg: 'Weight (kg)',
    add_certificate: 'Add Certificate',
    add_achievement: 'Add Achievement',
    certificate_name: 'Certificate Name',
    achievement_title: 'Achievement Title',
    date_received: 'Date Received',
    description: 'Description'
  },
  hi: {
    // Navigation
    amaplayer: 'अमाप्लेयर',
    home: 'होम',
    search: 'खोजें',
    add: 'जोड़ें',
    activity: 'गतिविधि',
    profile: 'प्रोफ़ाइल',
    logout: 'लॉग आउट',
    
    // Landing Page
    hero_title: 'अमाप्लेयर',
    hero_subtitle: 'जहाँ चैंपियन अपनी यात्रा साझा करते हैं',
    hero_description: 'खिलाड़ियों से जुड़ें, अपनी जीत साझा करें, और महान खेल पलों से प्रेरणा लें',
    join_champions: 'चैंपियन्स में शामिल हों',
    continue_guest: 'अतिथि के रूप में जारी रखें',
    olympic_spirit: 'ओलंपिक भावना',
    words_champions: 'चैंपियन्स के शब्द',
    why_amaplayer: 'अमाप्लेयर क्यों?',
    share_victories: 'अपनी जीत साझा करें',
    connect_athletes: 'खिलाड़ियों से जुड़ें',
    get_motivated: 'प्रेरणा पाएं',
    capture_moments: 'पलों को कैद करें',
    ready_join: 'चैंपियन्स में शामिल होने के लिए तैयार?',
    get_started: 'अभी शुरू करें',
    
    // Auth
    login: 'लॉग इन',
    signup: 'साइन अप',
    email: 'ईमेल',
    password: 'पासवर्ड',
    full_name: 'पूरा नाम',
    confirm_password: 'पासवर्ड की पुष्टि करें',
    no_account: 'खाता नहीं है?',
    have_account: 'पहले से खाता है?',
    
    // Posts
    create_post: 'नई पोस्ट बनाएं',
    whats_mind: 'आप क्या सोच रहे हैं?',
    post: 'पोस्ट',
    posting: 'पोस्ट कर रहे हैं...',
    like: 'पसंद',
    comment: 'टिप्पणी',
    
    // Gallery captions
    olympic_rings: 'ओलंपिक रिंग्स - एकता का प्रतीक',
    athletic_excellence: 'खेल उत्कृष्टता',
    victory_celebration: 'जीत का जश्न',
    swimming_championships: 'तैराकी चैंपियनशिप',
    
    // Profile
    personal_details: 'व्यक्तिगत विवरण',
    name: 'नाम',
    age: 'उम्र',
    height: 'लंबाई',
    weight: 'वजन',
    sex: 'लिंग',
    male: 'पुरुष',
    female: 'महिला',
    other: 'अन्य',
    certificates: 'प्रमाणपत्र',
    achievements: 'उपलब्धियां',
    role: 'भूमिका',
    athlete: 'खिलाड़ी',
    coach: 'कोच',
    organisation: 'संगठन',
    profile_picture: 'प्रोफ़ाइल चित्र',
    upload_photo: 'फोटो अपलोड करें',
    save_profile: 'प्रोफ़ाइल सहेजें',
    edit_profile: 'प्रोफ़ाइल संपादित करें',
    height_cm: 'लंबाई (सेमी)',
    weight_kg: 'वजन (किग्रा)',
    add_certificate: 'प्रमाणपत्र जोड़ें',
    add_achievement: 'उपलब्धि जोड़ें',
    certificate_name: 'प्रमाणपत्र का नाम',
    achievement_title: 'उपलब्धि का शीर्षक',
    date_received: 'प्राप्ति दिनांक',
    description: 'विवरण'
  },
  pa: {
    // Navigation
    amaplayer: 'ਅਮਾਪਲੇਅਰ',
    home: 'ਘਰ',
    search: 'ਖੋਜ',
    add: 'ਜੋੜੋ',
    activity: 'ਗਤੀਵਿਧੀ',
    profile: 'ਪ੍ਰੋਫਾਈਲ',
    logout: 'ਲਾਗ ਆਊਟ',
    
    // Landing Page
    hero_title: 'ਅਮਾਪਲੇਅਰ',
    hero_subtitle: 'ਜਿੱਥੇ ਚੈਂਪੀਅਨ ਆਪਣਾ ਸਫਰ ਸਾਂਝਾ ਕਰਦੇ ਹਨ',
    hero_description: 'ਖਿਡਾਰੀਆਂ ਨਾਲ ਜੁੜੋ, ਆਪਣੀ ਜਿੱਤ ਸਾਂਝੀ ਕਰੋ, ਅਤੇ ਮਹਾਨ ਖੇਡ ਪਲਾਂ ਤੋਂ ਪ੍ਰੇਰਣਾ ਲਓ',
    join_champions: 'ਚੈਂਪੀਅਨਾਂ ਵਿੱਚ ਸ਼ਾਮਲ ਹੋਵੋ',
    continue_guest: 'ਮਹਿਮਾਨ ਵਜੋਂ ਜਾਰੀ ਰੱਖੋ',
    olympic_spirit: 'ਓਲੰਪਿਕ ਭਾਵਨਾ',
    words_champions: 'ਚੈਂਪੀਅਨਾਂ ਦੇ ਸ਼ਬਦ',
    why_amaplayer: 'ਅਮਾਪਲੇਅਰ ਕਿਉਂ?',
    share_victories: 'ਆਪਣੀ ਜਿੱਤ ਸਾਂਝੀ ਕਰੋ',
    connect_athletes: 'ਖਿਡਾਰੀਆਂ ਨਾਲ ਜੁੜੋ',
    get_motivated: 'ਪ੍ਰੇਰਣਾ ਪ੍ਰਾਪਤ ਕਰੋ',
    capture_moments: 'ਪਲਾਂ ਨੂੰ ਕੈਦ ਕਰੋ',
    ready_join: 'ਚੈਂਪੀਅਨਾਂ ਵਿੱਚ ਸ਼ਾਮਲ ਹੋਣ ਲਈ ਤਿਆਰ?',
    get_started: 'ਹੁਣੇ ਸ਼ੁਰੂ ਕਰੋ',
    
    // Auth
    login: 'ਲਾਗ ਇਨ',
    signup: 'ਸਾਈਨ ਅੱਪ',
    email: 'ਈਮੇਲ',
    password: 'ਪਾਸਵਰਡ',
    full_name: 'ਪੂਰਾ ਨਾਮ',
    confirm_password: 'ਪਾਸਵਰਡ ਦੀ ਪੁਸ਼ਟੀ ਕਰੋ',
    no_account: 'ਖਾਤਾ ਨਹੀਂ ਹੈ?',
    have_account: 'ਪਹਿਲਾਂ ਤੋਂ ਖਾਤਾ ਹੈ?',
    
    // Posts
    create_post: 'ਨਵੀਂ ਪੋਸਟ ਬਣਾਓ',
    whats_mind: 'ਤੁਸੀਂ ਕੀ ਸੋਚ ਰਹੇ ਹੋ?',
    post: 'ਪੋਸਟ',
    posting: 'ਪੋਸਟ ਕਰ ਰਹੇ ਹਾਂ...',
    like: 'ਪਸੰਦ',
    comment: 'ਟਿੱਪਣੀ',
    
    // Gallery captions
    olympic_rings: 'ਓਲੰਪਿਕ ਰਿੰਗ - ਏਕਤਾ ਦਾ ਪ੍ਰਤੀਕ',
    athletic_excellence: 'ਖੇਡ ਉੱਤਮਤਾ',
    victory_celebration: 'ਜਿੱਤ ਦਾ ਜਸ਼ਨ',
    swimming_championships: 'ਤੈਰਾਕੀ ਚੈਂਪੀਅਨਸ਼ਿਪ',
    
    // Profile
    personal_details: 'ਨਿੱਜੀ ਵੇਰਵੇ',
    name: 'ਨਾਮ',
    age: 'ਉਮਰ',
    height: 'ਲੰਬਾਈ',
    weight: 'ਭਾਰ',
    sex: 'ਲਿੰਗ',
    male: 'ਮਰਦ',
    female: 'ਔਰਤ',
    other: 'ਹੋਰ',
    certificates: 'ਪ੍ਰਮਾਣ ਪੱਤਰ',
    achievements: 'ਪ੍ਰਾਪਤੀਆਂ',
    role: 'ਭੂਮਿਕਾ',
    athlete: 'ਖਿਡਾਰੀ',
    coach: 'ਕੋਚ',
    organisation: 'ਸੰਸਥਾ',
    profile_picture: 'ਪ੍ਰੋਫਾਈਲ ਤਸਵੀਰ',
    upload_photo: 'ਫੋਟੋ ਅੱਪਲੋਡ ਕਰੋ',
    save_profile: 'ਪ੍ਰੋਫਾਈਲ ਸੇਵ ਕਰੋ',
    edit_profile: 'ਪ੍ਰੋਫਾਈਲ ਸੰਪਾਦਿਤ ਕਰੋ',
    height_cm: 'ਲੰਬਾਈ (ਸੈਮੀ)',
    weight_kg: 'ਭਾਰ (ਕਿਗ੍ਰਾ)',
    add_certificate: 'ਪ੍ਰਮਾਣ ਪੱਤਰ ਜੋੜੋ',
    add_achievement: 'ਪ੍ਰਾਪਤੀ ਜੋੜੋ',
    certificate_name: 'ਪ੍ਰਮਾਣ ਪੱਤਰ ਦਾ ਨਾਮ',
    achievement_title: 'ਪ੍ਰਾਪਤੀ ਦਾ ਸਿਰਲੇਖ',
    date_received: 'ਪ੍ਰਾਪਤੀ ਦੀ ਮਿਤੀ',
    description: 'ਵਰਣਨ'
  },
  mr: {
    // Navigation
    amaplayer: 'अमाप्लेयर',
    home: 'मुख्यपृष्ठ',
    search: 'शोधा',
    add: 'जोडा',
    activity: 'क्रियाकलाप',
    profile: 'प्रोफाइल',
    logout: 'लॉग आउट',
    
    // Landing Page
    hero_title: 'अमाप्लेयर',
    hero_subtitle: 'जिथे चॅम्पियन त्यांचा प्रवास सामायिक करतात',
    hero_description: 'खेळाडूंशी जुडा, तुमचे विजय सामायिक करा आणि महान खेळ क्षणांपासून प्रेरणा घ्या',
    join_champions: 'चॅम्पियनमध्ये सामील व्हा',
    continue_guest: 'पाहुणे म्हणून चालू ठेवा',
    olympic_spirit: 'ऑलिम्पिक भावना',
    words_champions: 'चॅम्पियनचे शब्द',
    why_amaplayer: 'अमाप्लेयर का?',
    share_victories: 'तुमचे विजय सामायिक करा',
    connect_athletes: 'खेळाडूंशी जुडा',
    get_motivated: 'प्रेरणा मिळवा',
    capture_moments: 'क्षण कॅप्चर करा',
    ready_join: 'चॅम्पियनमध्ये सामील होण्यास तयार?',
    get_started: 'आता सुरुवात करा',
    
    // Auth
    login: 'लॉग इन',
    signup: 'साइन अप',
    email: 'ईमेल',
    password: 'पासवर्ड',
    full_name: 'पूर्ण नाव',
    confirm_password: 'पासवर्डची पुष्टी करा',
    no_account: 'खाते नाही?',
    have_account: 'आधीच खाते आहे?',
    
    // Posts
    create_post: 'नवीन पोस्ट तयार करा',
    whats_mind: 'तुम्ही काय विचार करत आहात?',
    post: 'पोस्ट',
    posting: 'पोस्ट करत आहे...',
    like: 'आवडले',
    comment: 'टिप्पणी',
    
    // Gallery captions
    olympic_rings: 'ऑलिम्पिक रिंग्स - एकतेचे प्रतीक',
    athletic_excellence: 'क्रीडा उत्कृष्टता',
    victory_celebration: 'विजयाचा उत्सव',
    swimming_championships: 'पोहण्याची स्पर्धा',
    
    // Profile
    personal_details: 'वैयक्तिक तपशील',
    name: 'नाव',
    age: 'वय',
    height: 'उंची',
    weight: 'वजन',
    sex: 'लिंग',
    male: 'पुरुष',
    female: 'स्त्री',
    other: 'इतर',
    certificates: 'प्रमाणपत्रे',
    achievements: 'साधणुका',
    role: 'भूमिका',
    athlete: 'खेळाडू',
    coach: 'प्रशिक्षक',
    organisation: 'संस्था',
    profile_picture: 'प्रोफाइल चित्र',
    upload_photo: 'फोटो अपलोड करा',
    save_profile: 'प्रोफाइल जतन करा',
    edit_profile: 'प्रोफाइल संपादित करा',
    height_cm: 'उंची (सेमी)',
    weight_kg: 'वजन (किग्रा)',
    add_certificate: 'प्रमाणपत्र जोडा',
    add_achievement: 'साधणूक जोडा',
    certificate_name: 'प्रमाणपत्राचे नाव',
    achievement_title: 'साधणुकीचे शीर्षक',
    date_received: 'प्राप्ती दिनांक',
    description: 'वर्णन'
  },
  bn: {
    // Navigation
    amaplayer: 'আমাপ্লেয়ার',
    home: 'হোম',
    search: 'খোঁজ',
    add: 'যোগ',
    activity: 'কার্যকলাপ',
    profile: 'প্রোফাইল',
    logout: 'লগ আউট',
    
    // Landing Page
    hero_title: 'আমাপ্লেয়ার',
    hero_subtitle: 'যেখানে চ্যাম্পিয়নরা তাদের যাত্রা ভাগ করে',
    hero_description: 'অ্যাথলিটদের সাথে সংযুক্ত হন, আপনার বিজয় ভাগ করুন এবং মহান খেলার মুহূর্ত থেকে অনুপ্রেরণা নিন',
    join_champions: 'চ্যাম্পিয়নদের সাথে যোগ দিন',
    continue_guest: 'অতিথি হিসেবে চালিয়ে যান',
    olympic_spirit: 'অলিম্পিক চেতনা',
    words_champions: 'চ্যাম্পিয়নদের কথা',
    why_amaplayer: 'কেন আমাপ্লেয়ার?',
    share_victories: 'আপনার বিজয় ভাগ করুন',
    connect_athletes: 'অ্যাথলিটদের সাথে সংযুক্ত হন',
    get_motivated: 'অনুপ্রেরণা পান',
    capture_moments: 'মুহূর্তগুলি ক্যাপচার করুন',
    ready_join: 'চ্যাম্পিয়নদের সাথে যোগ দিতে প্রস্তুত?',
    get_started: 'এখনই শুরু করুন',
    
    // Auth
    login: 'লগ ইন',
    signup: 'সাইন আপ',
    email: 'ইমেইল',
    password: 'পাসওয়ার্ড',
    full_name: 'পূর্ণ নাম',
    confirm_password: 'পাসওয়ার্ড নিশ্চিত করুন',
    no_account: 'অ্যাকাউন্ট নেই?',
    have_account: 'ইতিমধ্যে অ্যাকাউন্ট আছে?',
    
    // Posts
    create_post: 'নতুন পোস্ট তৈরি করুন',
    whats_mind: 'আপনি কী ভাবছেন?',
    post: 'পোস্ট',
    posting: 'পোস্ট করছি...',
    like: 'পছন্দ',
    comment: 'মন্তব্য',
    
    // Gallery captions
    olympic_rings: 'অলিম্পিক রিং - ঐক্যের প্রতীক',
    athletic_excellence: 'ক্রীড়া উৎকর্ষতা',
    victory_celebration: 'বিজয় উৎসব',
    swimming_championships: 'সাঁতার চ্যাম্পিয়নশিপ',
    
    // Profile
    personal_details: 'ব্যক্তিগত বিবরণ',
    name: 'নাম',
    age: 'বয়স',
    height: 'উচ্চতা',
    weight: 'ওজন',
    sex: 'লিঙ্গ',
    male: 'পুরুষ',
    female: 'মহিলা',
    other: 'অন্যান্য',
    certificates: 'সার্টিফিকেট',
    achievements: 'অর্জন',
    role: 'ভূমিকা',
    athlete: 'অ্যাথলিট',
    coach: 'কোচ',
    organisation: 'সংস্থা',
    profile_picture: 'প্রোফাইল ছবি',
    upload_photo: 'ছবি আপলোড করুন',
    save_profile: 'প্রোফাইল সেভ করুন',
    edit_profile: 'প্রোফাইল সম্পাদনা করুন',
    height_cm: 'উচ্চতা (সেমি)',
    weight_kg: 'ওজন (কেজি)',
    add_certificate: 'সার্টিফিকেট যোগ করুন',
    add_achievement: 'অর্জন যোগ করুন',
    certificate_name: 'সার্টিফিকেটের নাম',
    achievement_title: 'অর্জনের শিরোনাম',
    date_received: 'প্রাপ্তির তারিখ',
    description: 'বিবরণ'
  }
};

export function LanguageProvider({ children }) {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem('amaplayer-language');
    return savedLanguage || 'en';
  });

  useEffect(() => {
    localStorage.setItem('amaplayer-language', currentLanguage);
    document.documentElement.lang = currentLanguage;
  }, [currentLanguage]);

  const changeLanguage = (languageCode) => {
    setCurrentLanguage(languageCode);
  };

  const t = (key) => {
    return translations[currentLanguage]?.[key] || translations.en[key] || key;
  };

  const getCurrentLanguage = () => {
    return languages.find(lang => lang.code === currentLanguage) || languages[0];
  };

  const value = {
    currentLanguage,
    changeLanguage,
    t,
    getCurrentLanguage,
    languages,
    translations
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}