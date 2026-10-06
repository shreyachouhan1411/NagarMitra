import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'hi';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Brand
    brand_name: 'NagarMitra',
    tagline: 'Your voice. Your neighbourhood.',
    how_accessing: 'How are you accessing NagarMitra?',
    
    // Roles
    role_citizen: 'Citizen',
    role_government: 'Government Employee',
    role_field_worker: 'Field Worker',
    role_citizen_desc: 'Report civic problems and track neighbourhood resolutions',
    role_gov_desc: 'Manage municipal queues, dispatch field teams, and oversee wards',
    role_worker_desc: 'Receive field assignments, navigate to sites, and submit proof',
    
    // Auth
    welcome_citizen: 'Welcome to NagarMitra',
    citizen_subtitle: 'Enter your name and email to continue. No municipal password required.',
    full_name: 'Full Name',
    email_address: 'Email Address',
    continue_btn: 'Continue to Citizen Portal',
    
    gov_login_title: 'Government Employee Access',
    gov_login_subtitle: 'Municipal Authorized Personnel Only. Enter your official credentials.',
    emp_id_or_name: 'Employee ID or Name',
    password: 'Password',
    gov_login_btn: 'Authenticate & Enter Command Center',
    
    worker_login_title: 'Field Worker Access',
    worker_login_subtitle: 'Municipal Field Operations. Enter your worker credentials.',
    worker_id_or_name: 'Worker ID or Name',
    worker_login_btn: 'Authenticate & View Tasks',
    
    invalid_credentials: 'Authentication failed. Please verify your credentials.',
    logout: 'Sign Out',
    
    // Citizen Shell
    citizen_greeting: 'Good morning',
    how_can_we_help: 'How can we help today?',
    report_a_problem: 'REPORT A PROBLEM',
    immediate_danger: 'Immediate danger?',
    immediate_danger_subtitle: 'Exposed live wire, water main burst, open manhole, or severe hazard',
    your_complaints: 'Your Active Complaints',
    no_complaints_yet: 'You have not submitted any complaints yet.',
    nearby_issues: 'Nearby Civic Issues',
    nearby_issues_desc: 'Civic reports from your neighbourhood ward',
    recent_updates: 'Recent Updates',
    municipal_contact: 'Municipal Ward Helpline',
    
    // Citizen Navigation
    nav_home: 'Home',
    nav_report: 'Report',
    nav_my_complaints: 'My Complaints',
    nav_nearby: 'Nearby',
    nav_profile: 'Profile',
    
    // Citizen Report Flow
    report_new_issue: 'Report a Civic Issue',
    issue_description_label: 'Describe the problem in English, Hindi, or Hinglish',
    issue_description_placeholder: 'e.g., "Road pe bahut bada pothole hai near Main Market" or "Streetlight not working on 5th cross"',
    analyzing_ai: 'AI is analyzing issue and assessing risks...',
    ai_advisory_title: 'AI Civic Advisory Analysis',
    ai_advisory_disclaimer: 'Advisory suggestion — please verify before submitting.',
    detected_issue: 'Detected Issue',
    category: 'Category',
    severity: 'Severity',
    possible_risk: 'Possible Civic Risk',
    assigned_dept: 'Suggested Department',
    detected_ward: 'Ward Location',
    upload_photo: 'Add Photo Evidence',
    or_voice: 'Voice Input',
    listening: 'Listening to your voice...',
    submit_complaint: 'Submit Civic Complaint',
    
    // Citizen Emergency Flow
    danger_question: 'Is anyone in immediate danger?',
    btn_yes: 'YES — Active Danger',
    btn_no: 'NO — Urgent but safe',
    btn_not_sure: 'NOT SURE — Potential Hazard',
    hazard_detected: 'Potential safety hazard detected.',
    send_emergency_alert: 'SEND EMERGENCY ALERT',
    emergency_sent_success: 'Emergency Alert Transmitted to Civic Command Center',
    
    // Citizen Verification
    verify_resolution: 'Was this problem fixed?',
    btn_fixed: 'FIXED — Verified by Citizen',
    btn_still_exists: 'STILL EXISTS — Reopen Issue',
    
    // Government Shell
    command_center_title: 'Civic Command Center',
    what_needs_attention: 'WHAT NEEDS ATTENTION?',
    emergency_attention: 'EMERGENCY ATTENTION',
    active_emergencies: 'Active Emergencies',
    priority_queue: 'PRIORITY QUEUE',
    today_stats: 'TODAY MUNICIPAL METRICS',
    active_complaints: 'Active Complaints',
    assigned_count: 'Assigned',
    awaiting_action: 'Awaiting Action',
    resolved_count: 'Resolved Today',
    
    // Government Nav
    gov_overview: 'Overview',
    gov_complaints: 'Complaints',
    gov_emergencies: 'Emergencies',
    gov_map: 'Operational Map',
    gov_departments: 'Departments',
    gov_wards: 'Wards',
    gov_analytics: 'Analytics',
    gov_activity: 'Audit Activity',
    gov_settings: 'Settings',
    
    // Field Worker Shell
    worker_greeting: 'Good morning',
    what_do_i_need: 'WHAT DO I NEED TO DO?',
    you_have_tasks: 'You have assignments requiring action today.',
    worker_emergency_title: 'EMERGENCY RESPONSE REQUIRED',
    todays_tasks: 'TODAY\'S TASKS',
    assigned_tasks: 'Assigned Tasks',
    worker_task_detail: 'Task Detail',
    navigate_btn: 'Navigate to Location',
    acknowledge_btn: 'Acknowledge Assignment',
    start_response_btn: 'Start Response',
    on_site_btn: 'Mark On Site',
    upload_photo_btn: 'Upload After-Photo',
    add_note_btn: 'Add Field Note',
    mark_complete_btn: 'Mark Task Complete',
    
    // Field Worker Nav
    worker_today: 'Today',
    worker_assignments: 'Assignments',
    worker_emergencies: 'Emergencies',
    worker_completed: 'Completed',
    worker_profile: 'My Profile',
  },
  hi: {
    // Brand
    brand_name: 'नगर मित्र',
    tagline: 'आपकी आवाज़, आपका शहर।',
    how_accessing: 'आप नगर मित्र पर किस रूप में प्रवेश कर रहे हैं?',
    
    // Roles
    role_citizen: 'नागरिक',
    role_government: 'सरकारी अधिकारी',
    role_field_worker: 'फील्ड कार्यकर्ता',
    role_citizen_desc: 'नागरिक समस्याओं की रिपोर्ट करें और समाधान ट्रैक करें',
    role_gov_desc: 'नगर निगम की शिकायतों की समीक्षा, टीमें तैनात करें और वार्ड प्रबंधित करें',
    role_worker_desc: 'कार्य असाइनमेंट प्राप्त करें, स्थल पर पहुंचें और समाधान फोटो अपलोड करें',
    
    // Auth
    welcome_citizen: 'नगर मित्र में आपका स्वागत है',
    citizen_subtitle: 'जारी रखने के लिए अपना नाम और ईमेल दर्ज करें। किसी सरकारी पासवर्ड की आवश्यकता नहीं है।',
    full_name: 'पूरा नाम',
    email_address: 'ईमेल पता',
    continue_btn: 'नागरिक पोर्टल में प्रवेश करें',
    
    gov_login_title: 'सरकारी कर्मचारी लॉगिन',
    gov_login_subtitle: 'केवल अधिकृत नगर निगम कर्मी। अपनी आधिकारिक साख दर्ज करें।',
    emp_id_or_name: 'कर्मचारी आईडी या नाम',
    password: 'पासवर्ड',
    gov_login_btn: 'प्रमाणीकृत करें एवं कमांड सेंटर खोलें',
    
    worker_login_title: 'फील्ड कार्यकर्ता लॉगिन',
    worker_login_subtitle: 'नगर निगम फील्ड संचालन। अपना वर्कर आईडी दर्ज करें।',
    worker_id_or_name: 'वर्कर आईडी या नाम',
    worker_login_btn: 'प्रमाणीकृत करें एवं कार्य देखें',
    
    invalid_credentials: 'प्रमाणीकरण विफल। कृपया अपनी साख पुनः जांचें।',
    logout: 'लॉग आउट',
    
    // Citizen Shell
    citizen_greeting: 'शुभ प्रभात',
    how_can_we_help: 'आज हम आपकी क्या सहायता कर सकते हैं?',
    report_a_problem: 'समस्या दर्ज करें',
    immediate_danger: 'क्या कोई तात्कालिक ख़तरा है?',
    immediate_danger_subtitle: 'खुला बिजली का तार, पाइपलाइन फटना, खुला सीवर या गंभीर ख़तरा',
    your_complaints: 'आपकी सक्रिय शिकायतें',
    no_complaints_yet: 'आपने अभी तक कोई शिकायत दर्ज नहीं की है।',
    nearby_issues: 'आस-पास की नागरिक समस्याएं',
    nearby_issues_desc: 'आपके वार्ड क्षेत्र की सार्वजनिक शिकायतें',
    recent_updates: 'नवीनतम अपडेट',
    municipal_contact: 'वार्ड हेल्पलाइन संपर्क',
    
    // Citizen Navigation
    nav_home: 'होम',
    nav_report: 'रिपोर्ट करें',
    nav_my_complaints: 'मेरी शिकायतें',
    nav_nearby: 'आस-पास',
    nav_profile: 'प्रोफ़ाइल',
    
    // Citizen Report Flow
    report_new_issue: 'नागरिक समस्या दर्ज करें',
    issue_description_label: 'समस्या का विवरण हिंदी, अंग्रेज़ी या हिंग्लिश में लिखें',
    issue_description_placeholder: 'उदा. "सड़क पर बहुत बड़ा गड्ढा है" या "5th cross ki streetlight band hai"',
    analyzing_ai: 'एआई समस्या का विश्लेषण और जोखिम जांच रहा है...',
    ai_advisory_title: 'एआई नागरिक सलाहकार विश्लेषण',
    ai_advisory_disclaimer: 'सलाहकार सुझाव — कृपया पुष्टि करें।',
    detected_issue: 'पहचानी गई समस्या',
    category: 'श्रेणी',
    severity: 'गंभीरता',
    possible_risk: 'संभावित नागरिक जोखिम',
    assigned_dept: 'अनुशंसित विभाग',
    detected_ward: 'वार्ड स्थान',
    upload_photo: 'फोटो साक्ष्य जोड़ें',
    or_voice: 'आवाज़ से बताएं',
    listening: 'आपकी आवाज़ सुन रहे हैं...',
    submit_complaint: 'शिकायत दर्ज करें',
    
    // Citizen Emergency Flow
    danger_question: 'क्या कोई व्यक्ति तात्कालिक ख़तरे में है?',
    btn_yes: 'हाँ — तात्कालिक ख़तरा है',
    btn_no: 'नहीं — जरूरी है पर सुरक्षित',
    btn_not_sure: 'अनिश्चित — संभावित ख़तरा',
    hazard_detected: 'संभावित सुरक्षा ख़तरा पहचाना गया।',
    send_emergency_alert: 'आपातकालीन चेतावनी भेजें',
    emergency_sent_success: 'कमांड सेंटर को आपातकालीन अलर्ट भेजा गया',
    
    // Citizen Verification
    verify_resolution: 'क्या यह समस्या हल हो गई है?',
    btn_fixed: 'हल हो गया — नागरिक सत्यापन',
    btn_still_exists: 'समस्या अब भी है — पुनः खोलें',
    
    // Government Shell
    command_center_title: 'नागरिक कमांड सेंटर',
    what_needs_attention: 'किस विषय पर ध्यान देने की आवश्यकता है?',
    emergency_attention: 'आपातकालीन मामले',
    active_emergencies: 'सक्रिय आपातकाल',
    priority_queue: 'प्राथमिकता कतार',
    today_stats: 'आज के नगर निगम आँकड़े',
    active_complaints: 'सक्रिय शिकायतें',
    assigned_count: 'असाइन की गई',
    awaiting_action: 'प्रतीक्षारत',
    resolved_count: 'आज सुलझाई गई',
    
    // Government Nav
    gov_overview: 'अवलोकन',
    gov_complaints: 'शिकायतें',
    gov_emergencies: 'आपातकाल',
    gov_map: 'संचालन मानचित्र',
    gov_departments: 'विभाग',
    gov_wards: 'वार्ड',
    gov_analytics: 'एनालिटिक्स',
    gov_activity: 'ऑडिट लॉग',
    gov_settings: 'सेटिंग्स',
    
    // Field Worker Shell
    worker_greeting: 'शुभ प्रभात',
    what_do_i_need: 'मुझे आज क्या करना है?',
    you_have_tasks: 'आज आपके लिए कार्य निर्धारित हैं।',
    worker_emergency_title: 'आपातकालीन प्रतिक्रिया आवश्यक',
    todays_tasks: 'आज के कार्य',
    assigned_tasks: 'असाइन किए गए कार्य',
    worker_task_detail: 'कार्य विवरण',
    navigate_btn: 'स्थान पर नेविगेट करें',
    acknowledge_btn: 'कार्य स्वीकार करें',
    start_response_btn: 'प्रतिक्रिया शुरू करें',
    on_site_btn: 'स्थल पर आगमन दर्ज करें',
    upload_photo_btn: 'समाधान फोटो अपलोड करें',
    add_note_btn: 'फील्ड नोट जोड़ें',
    mark_complete_btn: 'कार्य पूरा चिह्नित करें',
    
    // Field Worker Nav
    worker_today: 'आज',
    worker_assignments: 'असाइनमेंट',
    worker_emergencies: 'आपातकाल',
    worker_completed: 'पूर्ण कार्य',
    worker_profile: 'मेरी प्रोफ़ाइल',
  }
};

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  setLang: () => {},
  t: (key) => key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('nm_lang') as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('nm_lang', lang);
  }, [lang]);

  const t = (key: string): string => {
    return translations[lang]?.[key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
