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
    hero_subtitle: 'Where Champions Rise & Victory Lives',
    hero_description: 'Train Hard. Play Harder. Win Together. Connect with elite athletes, showcase your achievements, and fuel your competitive spirit with legendary sports moments!',
    join_champions: 'Join the Champions',
    continue_guest: 'Continue as Guest',
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
  ta: {
    // Navigation
    amaplayer: 'அமாப்ளேயர்',
    home: 'முகப்பு',
    search: 'தேடல்',
    add: 'சேர்',
    activity: 'செயல்பாடு',
    profile: 'சுயவிவரம்',
    logout: 'வெளியேறு',
    
    // Landing Page
    hero_title: 'அமாப்ளேயர்',
    hero_subtitle: 'வீரர்கள் வெற்றி பெறும் இடம்',
    hero_description: 'விளையாட்டு வீரர்களுடன் இணைந்து, உங்கள் வெற்றிகளை பகிர்ந்து, சிறந்த விளையாட்டு தருணங்களில் இருந்து உத்வேகம் பெறுங்கள்',
    join_champions: 'வீரர்களில் சேருங்கள்',
    continue_guest: 'விருந்தினராக தொடருங்கள்',
    olympic_spirit: 'ஒலிம்பிக் உணர்வு',
    words_champions: 'வீரர்களின் வார்த்தைகள்',
    why_amaplayer: 'ஏன் அமாப்ளேயர்?',
    share_victories: 'உங்கள் வெற்றிகளை பகிருங்கள்',
    connect_athletes: 'விளையாட்டு வீரர்களுடன் இணையுங்கள்',
    get_motivated: 'உத்வேகம் பெறுங்கள்',
    capture_moments: 'தருணங்களை பிடியுங்கள்',
    ready_join: 'வீரர்களில் சேர தயாரா?',
    get_started: 'இப்போது தொடங்குங்கள்',
    
    // Auth
    login: 'உள்நுழைய',
    signup: 'பதிவு செய்ய',
    email: 'மின்னஞ்சல்',
    password: 'கடவுச்சொல்',
    full_name: 'முழு பெயர்',
    confirm_password: 'கடவுச்சொல்லை உறுதிப்படுத்தவும்',
    no_account: 'கணக்கு இல்லையா?',
    have_account: 'ஏற்கனவே கணக்கு இருக்கிறதா?',
    
    // Posts
    create_post: 'புதிய பதிவு உருவாக்கு',
    whats_mind: 'நீங்கள் என்ன நினைக்கிறீர்கள்?',
    post: 'பதிவு',
    posting: 'பதிவிடுகிறது...',
    like: 'பிடிக்கும்',
    comment: 'கருத்து',
    
    // Gallery captions
    olympic_rings: 'ஒலிம்பிக் வளையங்கள் - ஐக்கியத்தின் சின்னம்',
    athletic_excellence: 'விளையாட்டு சிறப்பு',
    victory_celebration: 'வெற்றி கொண்டாட்டம்',
    swimming_championships: 'நீச்சல் சாம்பியன்ஷிப்',
    
    // Profile
    personal_details: 'தனிப்பட்ட விவரங்கள்',
    name: 'பெயர்',
    age: 'வயது',
    height: 'உயரம்',
    weight: 'எடை',
    sex: 'பாலினம்',
    male: 'ஆண்',
    female: 'பெண்',
    other: 'மற்றவை',
    certificates: 'சான்றிதழ்கள்',
    achievements: 'சாதனைகள்',
    role: 'பங்கு',
    athlete: 'விளையாட்டு வீரர்',
    coach: 'பயிற்சியாளர்',
    organisation: 'அமைப்பு',
    profile_picture: 'சுயவிவர படம்',
    upload_photo: 'புகைப்படம் பதிவேற்று',
    save_profile: 'சுயவிவரத்தை சேமி',
    edit_profile: 'சுயவிவரத்தை திருத்து',
    height_cm: 'உயரம் (செமீ)',
    weight_kg: 'எடை (கிலோ)',
    add_certificate: 'சான்றிதழ் சேர்',
    add_achievement: 'சாதனை சேர்',
    certificate_name: 'சான்றிதழ் பெயர்',
    achievement_title: 'சாதனை தலைப்பு',
    date_received: 'பெற்ற தேதி',
    description: 'விளக்கம்'
  },
  te: {
    // Navigation
    amaplayer: 'అమాప్లేయర్',
    home: 'హోమ్',
    search: 'వెతుకు',
    add: 'జోడించు',
    activity: 'కార్యకలాపం',
    profile: 'ప్రొఫైల్',
    logout: 'లాగ్ అవుట్',
    
    // Landing Page
    hero_title: 'అమాప్లేయర్',
    hero_subtitle: 'చాంపియన్లు లేచే చోటు',
    hero_description: 'అథ్లెట్లతో కనెక్ట్ అవ్వండి, మీ విజయాలను షేర్ చేయండి మరియు గొప్ప స్పోర్ట్స్ క్షణాల నుండి ప్రేరణ పొందండి',
    join_champions: 'చాంపియన్లలో చేరండి',
    continue_guest: 'గెస్ట్ గా కొనసాగించండి',
    olympic_spirit: 'ఒలింపిక్ స్పిరిట్',
    words_champions: 'చాంపియన్ల మాటలు',
    why_amaplayer: 'ఎందుకు అమాప్లేయర్?',
    share_victories: 'మీ విజయాలను షేర్ చేయండి',
    connect_athletes: 'అథ్లెట్లతో కనెక్ట్ అవ్వండి',
    get_motivated: 'ప్రేరణ పొందండి',
    capture_moments: 'క్షణాలను క్యాప్చర్ చేయండి',
    ready_join: 'చాంపియన్లలో చేరడానికి సిద్ధంగా ఉన్నారా?',
    get_started: 'ఇప్పుడే ప్రారంభించండి',
    
    // Auth
    login: 'లాగిన్',
    signup: 'సైన్ అప్',
    email: 'ఇమెయిల్',
    password: 'పాస్వర్డ్',
    full_name: 'పూర్తి పేరు',
    confirm_password: 'పాస్వర్డ్ని కన్ఫర్మ్ చేయండి',
    no_account: 'అకౌంట్ లేదా?',
    have_account: 'ఇప్పటికే అకౌంట్ ఉందా?',
    
    // Posts
    create_post: 'కొత్త పోస్ట్ సృష్టించండి',
    whats_mind: 'మీరు ఏమి అనుకుంటున్నారు?',
    post: 'పోస్ట్',
    posting: 'పోస్ట్ చేస్తోంది...',
    like: 'లైక్',
    comment: 'కామెంట్',
    
    // Gallery captions
    olympic_rings: 'ఒలింపిక్ రింగ్స్ - ఐక్యత సంకేతం',
    athletic_excellence: 'అథ్లెటిక్ ఎక్సలెన్స్',
    victory_celebration: 'విజయ వేడుక',
    swimming_championships: 'స్విమ్మింగ్ చాంపియన్షిప్స్',
    
    // Profile
    personal_details: 'వ్యక్తిగత వివరాలు',
    name: 'పేరు',
    age: 'వయసు',
    height: 'ఎత్తు',
    weight: 'బరువు',
    sex: 'లింగం',
    male: 'పురుషుడు',
    female: 'స్త్రీ',
    other: 'ఇతర',
    certificates: 'సర్టిఫికేట్లు',
    achievements: 'విజయాలు',
    role: 'పాత్ర',
    athlete: 'అథ్లెట్',
    coach: 'కోచ్',
    organisation: 'సంస్థ',
    profile_picture: 'ప్రొఫైల్ పిక్చర్',
    upload_photo: 'ఫోటో అప్లోడ్ చేయండి',
    save_profile: 'ప్రొఫైల్ సేవ్ చేయండి',
    edit_profile: 'ప్రొఫైల్ ఎడిట్ చేయండి',
    height_cm: 'ఎత్తు (సెం.మీ)',
    weight_kg: 'బరువు (కిలోలు)',
    add_certificate: 'సర్టిఫికేట్ జోడించండి',
    add_achievement: 'విజయం జోడించండి',
    certificate_name: 'సర్టిఫికేట్ పేరు',
    achievement_title: 'విజయ శీర్షిక',
    date_received: 'పొందిన తేదీ',
    description: 'వివరణ'
  },
  kn: {
    // Navigation
    amaplayer: 'ಅಮಾಪ್ಲೇಯರ್',
    home: 'ಮನೆ',
    search: 'ಹುಡುಕಿ',
    add: 'ಸೇರಿಸಿ',
    activity: 'ಚಟುವಟಿಕೆ',
    profile: 'ಪ್ರೊಫೈಲ್',
    logout: 'ಲಾಗ್ ಔಟ್',
    
    // Landing Page
    hero_title: 'ಅಮಾಪ್ಲೇಯರ್',
    hero_subtitle: 'ಚಾಂಪಿಯನ್‌ಗಳು ಏಳುವ ಸ್ಥಳ',
    hero_description: 'ಅಥ್ಲೀಟ್‌ಗಳೊಂದಿಗೆ ಸಂಪರ್ಕ ಸಾಧಿಸಿ, ನಿಮ್ಮ ಜಯಗಳನ್ನು ಹಂಚಿಕೊಳ್ಳಿ ಮತ್ತು ಮಹಾನ್ ಕ್ರೀಡಾ ಕ್ಷಣಗಳಿಂದ ಸ್ಫೂರ್ತಿ ಪಡೆಯಿರಿ',
    join_champions: 'ಚಾಂಪಿಯನ್‌ಗಳಲ್ಲಿ ಸೇರಿ',
    continue_guest: 'ಅತಿಥಿಯಾಗಿ ಮುಂದುವರಿಸಿ',
    olympic_spirit: 'ಒಲಿಂಪಿಕ್ ಚೇತನ',
    words_champions: 'ಚಾಂಪಿಯನ್‌ಗಳ ಮಾತುಗಳು',
    why_amaplayer: 'ಏಕೆ ಅಮಾಪ್ಲೇಯರ್?',
    share_victories: 'ನಿಮ್ಮ ಜಯಗಳನ್ನು ಹಂಚಿಕೊಳ್ಳಿ',
    connect_athletes: 'ಅಥ್ಲೀಟ್‌ಗಳೊಂದಿಗೆ ಸಂಪರ್ಕ ಸಾಧಿಸಿ',
    get_motivated: 'ಸ್ಫೂರ್ತಿ ಪಡೆಯಿರಿ',
    capture_moments: 'ಕ್ಷಣಗಳನ್ನು ಸೆರೆಹಿಡಿಯಿರಿ',
    ready_join: 'ಚಾಂಪಿಯನ್‌ಗಳಲ್ಲಿ ಸೇರಲು ಸಿದ್ಧರಿದ್ದೀರಾ?',
    get_started: 'ಈಗಲೇ ಪ್ರಾರಂಭಿಸಿ',
    
    // Auth
    login: 'ಲಾಗಿನ್',
    signup: 'ಸೈನ್ ಅಪ್',
    email: 'ಇಮೇಲ್',
    password: 'ಪಾಸ್‌ವರ್ಡ್',
    full_name: 'ಪೂರ್ಣ ಹೆಸರು',
    confirm_password: 'ಪಾಸ್‌ವರ್ಡ್ ಖಚಿತಪಡಿಸಿ',
    no_account: 'ಖಾತೆ ಇಲ್ಲವೇ?',
    have_account: 'ಈಗಾಗಲೇ ಖಾತೆ ಇದೆಯೇ?',
    
    // Posts
    create_post: 'ಹೊಸ ಪೋಸ್ಟ್ ರಚಿಸಿ',
    whats_mind: 'ನೀವು ಏನು ಯೋಚಿಸುತ್ತಿದ್ದೀರಿ?',
    post: 'ಪೋಸ್ಟ್',
    posting: 'ಪೋಸ್ಟ್ ಮಾಡುತ್ತಿದೆ...',
    like: 'ಇಷ್ಟ',
    comment: 'ಕಾಮೆಂಟ್',
    
    // Gallery captions
    olympic_rings: 'ಒಲಿಂಪಿಕ್ ಉಂಗುರಗಳು - ಐಕ್ಯತೆಯ ಸಂಕೇತ',
    athletic_excellence: 'ಅಥ್ಲೆಟಿಕ್ ಶ್ರೇಷ್ಠತೆ',
    victory_celebration: 'ಜಯೋತ್ಸವ',
    swimming_championships: 'ಈಜು ಚಾಂಪಿಯನ್‌ಶಿಪ್‌ಗಳು',
    
    // Profile
    personal_details: 'ವೈಯಕ್ತಿಕ ವಿವರಗಳು',
    name: 'ಹೆಸರು',
    age: 'ವಯಸ್ಸು',
    height: 'ಎತ್ತರ',
    weight: 'ತೂಕ',
    sex: 'ಲಿಂಗ',
    male: 'ಪುರುಷ',
    female: 'ಮಹಿಳೆ',
    other: 'ಇತರ',
    certificates: 'ಪ್ರಮಾಣಪತ್ರಗಳು',
    achievements: 'ಸಾಧನೆಗಳು',
    role: 'ಪಾತ್ರ',
    athlete: 'ಅಥ್ಲೀಟ್',
    coach: 'ಕೋಚ್',
    organisation: 'ಸಂಸ್ಥೆ',
    profile_picture: 'ಪ್ರೊಫೈಲ್ ಚಿತ್ರ',
    upload_photo: 'ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ',
    save_profile: 'ಪ್ರೊಫೈಲ್ ಉಳಿಸಿ',
    edit_profile: 'ಪ್ರೊಫೈಲ್ ಎಡಿಟ್ ಮಾಡಿ',
    height_cm: 'ಎತ್ತರ (ಸೆಂ.ಮೀ)',
    weight_kg: 'ತೂಕ (ಕಿಗ್ರಾ)',
    add_certificate: 'ಪ್ರಮಾಣಪತ್ರ ಸೇರಿಸಿ',
    add_achievement: 'ಸಾಧನೆ ಸೇರಿಸಿ',
    certificate_name: 'ಪ್ರಮಾಣಪತ್ರ ಹೆಸರು',
    achievement_title: 'ಸಾಧನೆ ಶೀರ್ಷಿಕೆ',
    date_received: 'ಪಡೆದ ದಿನಾಂಕ',
    description: 'ವಿವರಣೆ'
  },
  ml: {
    // Navigation
    amaplayer: 'അമാപ്ലേയർ',
    home: 'ഹോം',
    search: 'തിരയുക',
    add: 'ചേർക്കുക',
    activity: 'ആക്റ്റിവിറ്റി',
    profile: 'പ്രൊഫൈൽ',
    logout: 'ലോഗ് ഔട്ട്',
    
    // Landing Page
    hero_title: 'അമാപ്ലേയർ',
    hero_subtitle: 'ചാമ്പ്യന്മാർ ഉയരുന്ന സ്ഥലം',
    hero_description: 'അത്ലറ്റുകളുമായി ബന്ധപ്പെടുക, നിങ്ങളുടെ വിജയങ്ങൾ പങ്കുവെക്കുക, മികച്ച കായിക നിമിഷങ്ങളിൽ നിന്ന് പ്രേരണ നേടുക',
    join_champions: 'ചാമ്പ്യന്മാരിൽ ചേരുക',
    continue_guest: 'അതിഥിയായി തുടരുക',
    olympic_spirit: 'ഒളിമ്പിക് സ്പിരിറ്റ്',
    words_champions: 'ചാമ്പ്യന്മാരുടെ വാക്കുകൾ',
    why_amaplayer: 'എന്തുകൊണ്ട് അമാപ്ലേയർ?',
    share_victories: 'നിങ്ങളുടെ വിജയങ്ങൾ പങ്കുവെക്കുക',
    connect_athletes: 'അത്ലറ്റുകളുമായി ബന്ധപ്പെടുക',
    get_motivated: 'പ്രേരണ നേടുക',
    capture_moments: 'നിമിഷങ്ങൾ പകർത്തുക',
    ready_join: 'ചാമ്പ്യന്മാരിൽ ചേരാൻ തയ്യാറാണോ?',
    get_started: 'ഇപ്പോൾ തുടങ്ങുക',
    
    // Auth
    login: 'ലോഗിൻ',
    signup: 'സൈൻ അപ്പ്',
    email: 'ഇമെയിൽ',
    password: 'പാസ്സ്‌വേഡ്',
    full_name: 'മുഴുവൻ പേര്',
    confirm_password: 'പാസ്സ്‌വേഡ് സ്ഥിരീകരിക്കുക',
    no_account: 'അക്കൗണ്ട് ഇല്ലേ?',
    have_account: 'ഇതിനകം അക്കൗണ്ട് ഉണ്ടോ?',
    
    // Posts
    create_post: 'പുതിയ പോസ്റ്റ് സൃഷ്ടിക്കുക',
    whats_mind: 'നിങ്ങൾ എന്താണ് ചിന്തിക്കുന്നത്?',
    post: 'പോസ്റ്റ്',
    posting: 'പോസ്റ്റ് ചെയ്യുന്നു...',
    like: 'ഇഷ്ടം',
    comment: 'കമന്റ്',
    
    // Gallery captions
    olympic_rings: 'ഒളിമ്പിക് വളയങ്ങൾ - ഐക്യത്തിന്റെ പ്രതീകം',
    athletic_excellence: 'അത്ലറ്റിക് എക്സലൻസ്',
    victory_celebration: 'വിജയാഘോഷം',
    swimming_championships: 'നീന്തൽ ചാമ്പ്യൻഷിപ്പുകൾ',
    
    // Profile
    personal_details: 'വ്യക്തിഗത വിവരങ്ങൾ',
    name: 'പേര്',
    age: 'പ്രായം',
    height: 'ഉയരം',
    weight: 'ഭാരം',
    sex: 'ലിംഗം',
    male: 'പുരുഷൻ',
    female: 'സ്ത്രീ',
    other: 'മറ്റുള്ളവ',
    certificates: 'സർട്ടിഫിക്കറ്റുകൾ',
    achievements: 'നേട്ടങ്ങൾ',
    role: 'റോൾ',
    athlete: 'അത്ലറ്റ്',
    coach: 'കോച്ച്',
    organisation: 'ഓർഗനൈസേഷൻ',
    profile_picture: 'പ്രൊഫൈൽ ചിത്രം',
    upload_photo: 'ഫോട്ടോ അപ്ലോഡ് ചെയ്യുക',
    save_profile: 'പ്രൊഫൈൽ സേവ് ചെയ്യുക',
    edit_profile: 'പ്രൊഫൈൽ എഡിറ്റ് ചെയ്യുക',
    height_cm: 'ഉയരം (സെ.മീ)',
    weight_kg: 'ഭാരം (കി.ഗ്രാം)',
    add_certificate: 'സർട്ടിഫിക്കറ്റ് ചേർക്കുക',
    add_achievement: 'നേട്ടം ചേർക്കുക',
    certificate_name: 'സർട്ടിഫിക്കറ്റ് പേര്',
    achievement_title: 'നേട്ടത്തിന്റെ ശീർഷകം',
    date_received: 'ലഭിച്ച തീയതി',
    description: 'വിവരണം'
  },
  gu: {
    // Navigation
    amaplayer: 'અમાપ્લેયર',
    home: 'હોમ',
    search: 'શોધો',
    add: 'ઉમેરો',
    activity: 'પ્રવૃત્તિ',
    profile: 'પ્રોફાઇલ',
    logout: 'લૉગ આઉટ',
    
    // Landing Page
    hero_title: 'અમાપ્લેયર',
    hero_subtitle: 'જ્યાં ચેમ્પિયન્સ ઉભા થાય છે',
    hero_description: 'રમતવીરો સાથે જોડાઓ, તમારી જીત શેર કરો અને મહાન રમત-ગમતના ક્ષણોથી પ્રેરણા લો',
    join_champions: 'ચેમ્પિયન્સમાં જોડાઓ',
    continue_guest: 'મહેમાન તરીકે ચાલુ રાખો',
    olympic_spirit: 'ઓલિમ્પિક સ્પિરિટ',
    words_champions: 'ચેમ્પિયન્સના શબ્દો',
    why_amaplayer: 'કેમ અમાપ્લેયર?',
    share_victories: 'તમારી જીત શેર કરો',
    connect_athletes: 'રમતવીરો સાથે જોડાઓ',
    get_motivated: 'પ્રેરણા મેળવો',
    capture_moments: 'ક્ષણો કેપ્ચર કરો',
    ready_join: 'ચેમ્પિયન્સમાં જોડાવા તૈયાર છો?',
    get_started: 'હમણાં શરૂ કરો',
    
    // Auth
    login: 'લૉગિન',
    signup: 'સાઇન અપ',
    email: 'ઇમેઇલ',
    password: 'પાસવર્ડ',
    full_name: 'સંપૂર્ણ નામ',
    confirm_password: 'પાસવર્ડની પુષ્ટિ કરો',
    no_account: 'એકાઉન્ટ નથી?',
    have_account: 'પહેલાથી એકાઉન્ટ છે?',
    
    // Posts
    create_post: 'નવી પોસ્ટ બનાવો',
    whats_mind: 'તમે શું વિચારો છો?',
    post: 'પોસ્ટ',
    posting: 'પોસ્ટ કરી રહ્યા છીએ...',
    like: 'લાઇક',
    comment: 'કોમેન્ટ',
    
    // Gallery captions
    olympic_rings: 'ઓલિમ્પિક રિંગ્સ - એકતાનું પ્રતીક',
    athletic_excellence: 'એથ્લેટિક એક્સેલન્સ',
    victory_celebration: 'જીતની ઉજવણી',
    swimming_championships: 'સ્વિમિંગ ચેમ્પિયનશિપ',
    
    // Profile
    personal_details: 'વ્યક્તિગત વિગતો',
    name: 'નામ',
    age: 'ઉંમર',
    height: 'ઊંચાઈ',
    weight: 'વજન',
    sex: 'લિંગ',
    male: 'પુરુષ',
    female: 'સ્ત્રી',
    other: 'અન્ય',
    certificates: 'પ્રમાણપત્રો',
    achievements: 'સિદ્ધિઓ',
    role: 'ભૂમિકા',
    athlete: 'રમતવીર',
    coach: 'કોચ',
    organisation: 'સંસ્થા',
    profile_picture: 'પ્રોફાઇલ ચિત્ર',
    upload_photo: 'ફોટો અપલોડ કરો',
    save_profile: 'પ્રોફાઇલ સેવ કરો',
    edit_profile: 'પ્રોફાઇલ એડિટ કરો',
    height_cm: 'ઊંચાઈ (સે.મી)',
    weight_kg: 'વજન (કિલો)',
    add_certificate: 'પ્રમાણપત્ર ઉમેરો',
    add_achievement: 'સિદ્ધિ ઉમેરો',
    certificate_name: 'પ્રમાણપત્રનું નામ',
    achievement_title: 'સિદ્ધિનું શીર્ષક',
    date_received: 'મળ્યાની તારીખ',
    description: 'વિવરણ'
  },
  or: {
    // Navigation
    amaplayer: 'ଅମାପ୍ଲେୟର',
    home: 'ହୋମ',
    search: 'ଖୋଜ',
    add: 'ଯୋଗ',
    activity: 'କାର୍ଯ୍ୟକଳାପ',
    profile: 'ପ୍ରୋଫାଇଲ',
    logout: 'ଲଗ ଆଉଟ',
    
    // Landing Page
    hero_title: 'ଅମାପ୍ଲେୟର',
    hero_subtitle: 'ଯେଉଁଠାରେ ଚାମ୍ପିଅନମାନେ ଉଠନ୍ତି',
    hero_description: 'ଆଥଲେଟମାନଙ୍କ ସହ ଯୋଗ ଦିଅନ୍ତୁ, ଆପଣଙ୍କ ବିଜୟ ଅଂଶୀଦାର କରନ୍ତୁ ଏବଂ ମହାନ ଖେଳ ମୂହୁର୍ତ୍ତରୁ ପ୍ରେରଣା ନିଅନ୍ତୁ',
    join_champions: 'ଚାମ୍ପିଅନମାନଙ୍କ ସହ ଯୋଗ ଦିଅନ୍ତୁ',
    continue_guest: 'ଅତିଥି ଭାବରେ ଚାଲୁ ରଖନ୍ତୁ',
    olympic_spirit: 'ଅଲିମ୍ପିକ ସ୍ପିରିଟ',
    words_champions: 'ଚାମ୍ପିଅନମାନଙ୍କ ବାକ୍ୟ',
    why_amaplayer: 'କାହିଁକି ଅମାପ୍ଲେୟର?',
    share_victories: 'ଆପଣଙ୍କ ବିଜୟ ଅଂଶୀଦାର କରନ୍ତୁ',
    connect_athletes: 'ଆଥଲେଟମାନଙ୍କ ସହ ଯୋଗ ଦିଅନ୍ତୁ',
    get_motivated: 'ପ୍ରେରଣା ପାଆନ୍ତୁ',
    capture_moments: 'ମୂହୁର୍ତ୍ତଗୁଡ଼ିକ କ୍ୟାପଚର କରନ୍ତୁ',
    ready_join: 'ଚାମ୍ପିଅନମାନଙ୍କ ସହ ଯୋଗ ଦେବାକୁ ପ୍ରସ୍ତୁତ?',
    get_started: 'ଏବେ ଆରମ୍ଭ କରନ୍ତୁ',
    
    // Auth
    login: 'ଲଗଇନ',
    signup: 'ସାଇନ ଅପ',
    email: 'ଇମେଲ',
    password: 'ପାସୱାର୍ଡ',
    full_name: 'ପୂର୍ଣ୍ଣ ନାମ',
    confirm_password: 'ପାସୱାର୍ଡ ନିଶ୍ଚିତ କରନ୍ତୁ',
    no_account: 'ଆକାଉଣ୍ଟ ନାହିଁ?',
    have_account: 'ଆଗରୁ ଆକାଉଣ୍ଟ ଅଛି?',
    
    // Posts
    create_post: 'ନୂତନ ପୋଷ୍ଟ ସୃଷ୍ଟି କରନ୍ତୁ',
    whats_mind: 'ଆପଣ କଣ ଭାବୁଛନ୍ତି?',
    post: 'ପୋଷ୍ଟ',
    posting: 'ପୋଷ୍ଟ କରୁଛି...',
    like: 'ପସନ୍ଦ',
    comment: 'ମନ୍ତବ୍ୟ',
    
    // Gallery captions
    olympic_rings: 'ଅଲିମ୍ପିକ ରିଙ୍ଗ - ଏକତାର ପ୍ରତୀକ',
    athletic_excellence: 'ଆଥଲେଟିକ ଏକ୍ସଲେନ୍ସ',
    victory_celebration: 'ବିଜୟ ଉତ୍ସବ',
    swimming_championships: 'ସନ୍ତରଣ ଚାମ୍ପିଅନଶିପ',
    
    // Profile
    personal_details: 'ବ୍ୟକ୍ତିଗତ ବିବରଣୀ',
    name: 'ନାମ',
    age: 'ବୟସ',
    height: 'ଉଚ୍ଚତା',
    weight: 'ଓଜନ',
    sex: 'ଲିଙ୍ଗ',
    male: 'ପୁରୁଷ',
    female: 'ମହିଳା',
    other: 'ଅନ୍ୟ',
    certificates: 'ପ୍ରମାଣପତ୍ର',
    achievements: 'ସଫଳତା',
    role: 'ଭୂମିକା',
    athlete: 'ଆଥଲେଟ',
    coach: 'କୋଚ',
    organisation: 'ସଂଗଠନ',
    profile_picture: 'ପ୍ରୋଫାଇଲ ଚିତ୍ର',
    upload_photo: 'ଫୋଟୋ ଅପଲୋଡ କରନ୍ତୁ',
    save_profile: 'ପ୍ରୋଫାଇଲ ସେଭ କରନ୍ତୁ',
    edit_profile: 'ପ୍ରୋଫାଇଲ ଏଡିଟ କରନ୍ତୁ',
    height_cm: 'ଉଚ୍ଚତା (ସେ.ମି)',
    weight_kg: 'ଓଜନ (କି.ଗ୍ରା)',
    add_certificate: 'ପ୍ରମାଣପତ୍ର ଯୋଗ କରନ୍ତୁ',
    add_achievement: 'ସଫଳତା ଯୋଗ କରନ୍ତୁ',
    certificate_name: 'ପ୍ରମାଣପତ୍ର ନାମ',
    achievement_title: 'ସଫଳତା ଶୀର୍ଷକ',
    date_received: 'ପ୍ରାପ୍ତ ତାରିଖ',
    description: 'ବିବରଣୀ'
  },
  as: {
    // Navigation
    amaplayer: 'আমাপ্লেয়াৰ',
    home: 'হোম',
    search: 'বিচাৰক',
    add: 'যোগ কৰক',
    activity: 'কাৰ্যকলাপ',
    profile: 'প্ৰফাইল',
    logout: 'লগ আউট',
    
    // Landing Page
    hero_title: 'আমাপ্লেয়াৰ',
    hero_subtitle: 'যত চেম্পিয়নসকলে উত্থান পায়',
    hero_description: 'খেলুৱৈসকলৰ সৈতে সংযোগ স্থাপন কৰক, আপোনাৰ জয় ভাগ কৰক আৰু মহান খেলৰ মুহূৰ্তবোৰৰ পৰা অনুপ্ৰেৰণা লওক',
    join_champions: 'চেম্পিয়নসকলৰ সৈতে যোগ দিয়ক',
    continue_guest: 'অতিথি হিচাপে অব্যাহত ৰাখক',
    olympic_spirit: 'অলিম্পিক স্পিৰিট',
    words_champions: 'চেম্পিয়নসকলৰ বাক্য',
    why_amaplayer: 'কিয় আমাপ্লেয়াৰ?',
    share_victories: 'আপোনাৰ জয় ভাগ কৰক',
    connect_athletes: 'খেলুৱৈসকলৰ সৈতে সংযোগ স্থাপন কৰক',
    get_motivated: 'অনুপ্ৰেৰণা লওক',
    capture_moments: 'মুহূৰ্তবোৰ কেপচাৰ কৰক',
    ready_join: 'চেম্পিয়নসকলৰ সৈতে যোগ দিবলৈ সাজু?',
    get_started: 'এতিয়াই আৰম্ভ কৰক',
    
    // Auth
    login: 'লগইন',
    signup: 'চাইন আপ',
    email: 'ইমেইল',
    password: 'পাছৱৰ্ড',
    full_name: 'সম্পূৰ্ণ নাম',
    confirm_password: 'পাছৱৰ্ড নিশ্চিত কৰক',
    no_account: 'একাউন্ট নাই?',
    have_account: 'ইতিমধ্যে একাউন্ট আছে?',
    
    // Posts
    create_post: 'নতুন পোষ্ট সৃষ্টি কৰক',
    whats_mind: 'আপুনি কি ভাবিছে?',
    post: 'পোষ্ট',
    posting: 'পোষ্ট কৰি আছে...',
    like: 'লাইক',
    comment: 'মন্তব্য',
    
    // Gallery captions
    olympic_rings: 'অলিম্পিক ৰিং - ঐক্যৰ প্ৰতীক',
    athletic_excellence: 'এথলেটিক এক্সেলেন্স',
    victory_celebration: 'জয়ৰ উৎসব',
    swimming_championships: 'সাঁতোৰ চেম্পিয়নশ্বিপ',
    
    // Profile
    personal_details: 'ব্যক্তিগত বিৱৰণ',
    name: 'নাম',
    age: 'বয়স',
    height: 'উচ্চতা',
    weight: 'ওজন',
    sex: 'লিংগ',
    male: 'পুৰুষ',
    female: 'মহিলা',
    other: 'অন্য',
    certificates: 'প্ৰমাণপত্ৰ',
    achievements: 'সাফল্য',
    role: 'ভূমিকা',
    athlete: 'খেলুৱৈ',
    coach: 'কোচ',
    organisation: 'সংস্থা',
    profile_picture: 'প্ৰফাইল ছবি',
    upload_photo: 'ফটো আপলোড কৰক',
    save_profile: 'প্ৰফাইল চেভ কৰক',
    edit_profile: 'প্ৰফাইল এডিট কৰক',
    height_cm: 'উচ্চতা (ছে.মি)',
    weight_kg: 'ওজন (কি.গ্ৰা)',
    add_certificate: 'প্ৰমাণপত্ৰ যোগ কৰক',
    add_achievement: 'সাফল্য যোগ কৰক',
    certificate_name: 'প্ৰমাণপত্ৰৰ নাম',
    achievement_title: 'সাফল্যৰ শিৰোনাম',
    date_received: 'পোৱা তাৰিখ',
    description: 'বিৱৰণ'
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