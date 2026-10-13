export type SupportedLanguage = 'English' | 'हिंदी' | 'मराठी';

export interface Translations {
  appName: string;
  tagline: string;
  greetingPrefix: string;
  guidedSetupBtn: string;
  guidedSetupSub: string;
  askAdvisorBtn: string;
  viewRoadmapBtn: string;
  quickMetrics: {
    viability: string;
    profit: string;
    capital: string;
    subsidy: string;
    viabilitySub: string;
    profitSub: string;
    capitalReady: string;
    subsidyPmegp: string;
  };
  dashboard: {
    viabilityScore: string;
    monthlyProfit: string;
    yourCapital: string;
    subsidyMatch: string;
    actionPlanProgress: string;
    businessOpportunityScore: string;
    financialHealthScore: string;
    riskLevel: string;
    bestBusinessRecommendation: string;
    localMarketOpportunity: string;
    availableSupport: string;
    nextRecommendedAction: string;
    quickButtons: {
      askAi: string;
      exploreOpportunities: string;
      financialPlan: string;
      governmentSupport: string;
    };
  };
  navigation: {
    dashboard: string;
    profile: string;
    advisor: string;
    opportunities: string;
    recommendations: string;
    financialPlanner: string;
    simulator: string;
    schemes: string;
    explainability: string;
    actionPlan: string;
    settings: string;
  };
  onboarding: {
    badge: string;
    title: string;
    subtitle: string;
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3Desc: string;
    step4Title: string;
    step4Desc: string;
    nextStep: string;
    prevStep: string;
    finishSetup: string;
    presetNotice: string;
  };
  advisor: {
    welcomeMessage: string;
    onlineStatus: string;
    micPrompt: string;
    micListening: string;
    micTapToSpeak: string;
    readAloud: string;
    stopReading: string;
    suggestedQuestions: string[];
    inputPlaceholder: string;
  };
  common: {
    rupeesPerMonth: string;
    months: string;
    score: string;
    low: string;
    medium: string;
    high: string;
    save: string;
    edit: string;
    reset: string;
    done: string;
    pending: string;
  };
}

export const TRANSLATIONS: Record<SupportedLanguage, Translations> = {
  English: {
    appName: 'VYOMIK',
    tagline: 'Rural Micro-Enterprise Intelligence Platform',
    greetingPrefix: 'Ram Ram',
    guidedSetupBtn: '⚡ 1-Min Guided Setup',
    guidedSetupSub: 'Tap 4 simple cards to unlock tailored rural business & subsidy matches',
    askAdvisorBtn: 'Ask AI Advisor',
    viewRoadmapBtn: '90-Day Roadmap',
    quickMetrics: {
      viability: 'Viability Score',
      profit: 'Est. Monthly Profit',
      capital: 'Your Capital',
      subsidy: 'Subsidy Match',
      viabilitySub: 'Based on local raw material & demand',
      profitSub: 'gross operating margin',
      capitalReady: '✓ Ready for Phase 1',
      subsidyPmegp: 'PMEGP Grant Match',
    },
    dashboard: {
      viabilityScore: 'Viability Score',
      monthlyProfit: 'Est. Monthly Profit',
      yourCapital: 'Your Capital',
      subsidyMatch: 'Subsidy Match',
      actionPlanProgress: '90-Day Action Plan Progress',
      businessOpportunityScore: 'Business Opportunity Score',
      financialHealthScore: 'Financial Health Score',
      riskLevel: 'Risk Level',
      bestBusinessRecommendation: 'Best Business Recommendation',
      localMarketOpportunity: 'Local Market Opportunity',
      availableSupport: 'Available Support',
      nextRecommendedAction: 'Next Recommended Action',
      quickButtons: {
        askAi: 'Ask AI',
        exploreOpportunities: 'Explore Opportunities',
        financialPlan: 'Financial Plan',
        governmentSupport: 'Government Support',
      },
    },
    navigation: {
      dashboard: 'Dashboard',
      profile: 'Profile & Assets',
      advisor: 'AI Advisor & Voice',
      opportunities: 'Local Opportunities',
      recommendations: 'Business Models',
      financialPlanner: 'Financial Planner',
      simulator: 'What-If Simulator',
      schemes: 'Govt Schemes',
      explainability: 'Why This Match?',
      actionPlan: '90-Day Action Plan',
      settings: 'Settings & Offline',
    },
    onboarding: {
      badge: 'Fast-Track Rural Onboarding',
      title: 'Find Your Perfect Rural Business in 60 Seconds',
      subtitle: 'No long boring forms. Just answer 4 visual cards to match viable local ventures, 35% subsidies, and bank funding.',
      step1Title: 'Select Your Region & Language',
      step1Desc: 'Where is your proposed unit and which language do you prefer?',
      step2Title: 'What is Your Available Capital?',
      step2Desc: 'How much own cash or family savings can you invest upfront?',
      step3Title: 'What Land & Power Do You Have?',
      step3Desc: 'Micro-units need basic space and electricity to operate machinery.',
      step4Title: 'Your Category & Social Group',
      step4Desc: 'Central government gives 35% capital subsidy for rural priority categories.',
      nextStep: 'Continue →',
      prevStep: '← Back',
      finishSetup: 'Calculate Viable Businesses & Subsidy 🚀',
      presetNotice: 'Tap any demo village profile to auto-fill in 1-click',
    },
    advisor: {
      welcomeMessage: 'Namaste! I am Vyomi, your rural business companion. Ask me anything about machines, mandi rates, or government subsidies.',
      onlineStatus: 'Online • Rural Enterprise Mitra',
      micPrompt: 'Tap microphone to speak your question in English, Hindi or Marathi',
      micListening: 'Listening to your voice... Speak clearly now',
      micTapToSpeak: 'Hold or tap mic to speak',
      readAloud: 'Listen Voice',
      stopReading: 'Stop Audio',
      suggestedQuestions: [
        'How to claim 35% PMEGP subsidy in my district?',
        'What is the machine cost and payback for oil ghani?',
        'Where can I sell by-products like cattle feed cake?',
        'Which licenses (FSSAI/Udyam) are mandatory to begin?',
      ],
      inputPlaceholder: 'Type or speak: mandi rates, machines, 35% subsidy, buyers...',
    },
    common: {
      rupeesPerMonth: '/month',
      months: 'months',
      score: 'Score',
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      save: 'Save Changes',
      edit: 'Edit',
      reset: 'Reset',
      done: 'Completed',
      pending: 'Pending',
    },
  },
  हिंदी: {
    appName: 'व्योमिक (VYOMIK)',
    tagline: 'ग्रामीण सूक्ष्म उद्यम नियोजन एवं संवर्धन मंच',
    greetingPrefix: 'राम राम',
    guidedSetupBtn: '⚡ 1-मिनट आसान सेटअप',
    guidedSetupSub: 'केवल 4 कार्ड चुनकर अपनी पूंजी अनुसार सही उद्योग व 35% सब्सिडी पाएं',
    askAdvisorBtn: 'एआई सलाहकार से पूछें',
    viewRoadmapBtn: '90-दिवसीय कार्ययोजना',
    quickMetrics: {
      viability: 'सफलता स्कोर',
      profit: 'अनुमानित मासिक लाभ',
      capital: 'आपकी पूंजी',
      subsidy: 'सरकारी अनुदान',
      viabilitySub: 'कच्चे माल और स्थानीय मांग के आधार पर',
      profitSub: 'सकल परिचालन लाभ',
      capitalReady: '✓ प्रथम चरण हेतु पर्याप्त',
      subsidyPmegp: 'PMEGP विशेष अनुदान',
    },
    dashboard: {
      viabilityScore: 'व्यवसाय उपयुक्तता स्कोर',
      monthlyProfit: 'अनुमानित मासिक लाभ',
      yourCapital: 'आपकी पूंजी',
      subsidyMatch: 'सरकारी सब्सिडी',
      actionPlanProgress: '90-दिवसीय कार्ययोजना प्रगति',
      businessOpportunityScore: 'व्यापार अवसर स्कोर',
      financialHealthScore: 'वित्तीय स्वास्थ्य स्कोर',
      riskLevel: 'जोखिम स्तर',
      bestBusinessRecommendation: 'सर्वोत्तम व्यवसाय अनुशंसा',
      localMarketOpportunity: 'स्थानीय बाजार अवसर',
      availableSupport: 'उपलब्ध सहायता व योजनाएं',
      nextRecommendedAction: 'अगला अनुशंसित कदम',
      quickButtons: {
        askAi: 'एआई से पूछें',
        exploreOpportunities: 'अवसर खोजें',
        financialPlan: 'वित्तीय योजना',
        governmentSupport: 'सरकारी सहायता',
      },
    },
    navigation: {
      dashboard: 'डैशबोर्ड',
      profile: 'प्रोफ़ाइल एवं संसाधन',
      advisor: 'एआई सलाहकार (आवाज)',
      opportunities: 'स्थानीय मंडी अवसर',
      recommendations: 'व्यवसाय सुझाव',
      financialPlanner: 'वित्तीय योजनाकार',
      simulator: 'जोखिम सिमुलेटर',
      schemes: 'सरकारी योजनाएं',
      explainability: 'सुझाव का कारण',
      actionPlan: '90-दिवसीय कार्ययोजना',
      settings: 'सेटिंग्स व ऑफलाइन',
    },
    onboarding: {
      badge: 'सरल ग्रामीण ऑनबोर्डिंग',
      title: '60 सेकंड में अपना सही ग्रामीण व्यवसाय चुनें',
      subtitle: 'कोई लंबा फॉर्म भरने की जरूरत नहीं। केवल 4 दृश्य विकल्पों का चयन करें और बैंक सब्सिडी व मशीनरी की पूरी जानकारी पाएं।',
      step1Title: 'अपना राज्य, जिला व भाषा चुनें',
      step1Desc: 'आप किस क्षेत्र में अपनी इकाई स्थापित करना चाहते हैं?',
      step2Title: 'आपके पास कितनी पूंजी (बजट) है?',
      step2Desc: 'आप स्वयं की बचत से कितना पैसा तुरंत लगा सकते हैं?',
      step3Title: 'जमीन एवं बिजली की क्या सुविधा है?',
      step3Desc: 'मशीन चलाने के लिए उपयुक्त स्थान और बिजली की उपलब्धता बताएं।',
      step4Title: 'सामाजिक वर्ग एवं समूह सदस्यता',
      step4Desc: 'ग्रामीण क्षेत्रों में OBC/SC/ST व महिलाओं को 35% तक भारी सब्सिडी मिलती है।',
      nextStep: 'आगे बढ़ें →',
      prevStep: '← पीछे जाएं',
      finishSetup: 'व्यवसाय और सब्सिडी की गणना करें 🚀',
      presetNotice: 'किसी भी डेमो प्रोफाइल को 1-क्लिक में लोड करने के लिए नीचे टैप करें',
    },
    advisor: {
      welcomeMessage: 'नमस्ते! मैं व्योमी हूँ, आपका ग्रामीण व्यवसाय मित्र। मुझसे तेल घानी, मसाला उद्योग, मंडी भाव या PMEGP सब्सिडी के बारे में बेझिझक पूछें।',
      onlineStatus: 'सक्रिय • ग्रामीण व्यवसाय मित्र',
      micPrompt: 'माइक दबाएं और हिंदी, मराठी या अंग्रेजी में अपना प्रश्न बोलें',
      micListening: 'आपकी आवाज सुनी जा रही है... कृपया स्पष्ट बोलें',
      micTapToSpeak: 'बोलने के लिए माइक दबाएं',
      readAloud: 'आवाज में सुनें',
      stopReading: 'आवाज रोकें',
      suggestedQuestions: [
        'मेरे जिले में 35% PMEGP सब्सिडी कैसे मिलेगी?',
        'कच्ची घानी तेल मिल की मशीनरी व लागत कितनी है?',
        'खली (बाय-प्रोडक्ट) को स्थानीय स्तर पर कैसे बेचें?',
        'शुरुआत में कौन-से सरकारी लाइसेंस जरूरी हैं?',
      ],
      inputPlaceholder: 'लिखें या बोलें: मशीनरी, मंडी भाव, सरकारी सब्सिडी, ग्राहक...',
    },
    common: {
      rupeesPerMonth: '/माह',
      months: 'महीने',
      score: 'स्कोर',
      low: 'कम',
      medium: 'मध्यम',
      high: 'उच्च',
      save: 'सहेजें',
      edit: 'बदलें',
      reset: 'रीसेट',
      done: 'पूर्ण',
      pending: 'बाकी',
    },
  },
  मराठी: {
    appName: 'व्योमिक (VYOMIK)',
    tagline: 'ग्रामीण सूक्ष्म उद्योग नियोजन व विकास मंच',
    greetingPrefix: 'नमस्कार / जय महाराष्ट्र',
    guidedSetupBtn: '⚡ 1-मिनिट सोपे सेटअप',
    guidedSetupSub: 'फक्त 4 सोपे कार्ड्स निवडून स्वतःच्या भांडवलानुसार योग्य व्यवसाय व 35% अनुदान मिळवा',
    askAdvisorBtn: 'एआय सल्लागारास विचारा',
    viewRoadmapBtn: '90-दिवसीय कृती आराखडा',
    quickMetrics: {
      viability: 'यशस्वी संभाव्यता गुण',
      profit: 'अंदाजे मासिक नफा',
      capital: 'तुमचे भांडवल',
      subsidy: 'शासकीय अनुदान',
      viabilitySub: 'कच्चा माल व स्थानिक मागणीनुसार',
      profitSub: 'एकूण नफा मार्जिन',
      capitalReady: '✓ पहिल्या टप्प्यासाठी सज्ज',
      subsidyPmegp: 'PMEGP विशेष अनुदान',
    },
    dashboard: {
      viabilityScore: 'व्यवसाय संभाव्यता गुण',
      monthlyProfit: 'अंदाजे मासिक नफा',
      yourCapital: 'तुमचे भांडवल',
      subsidyMatch: 'शासकीय अनुदान',
      actionPlanProgress: '90-दिवसीय कृती योजना प्रगती',
      businessOpportunityScore: 'व्यवसाय संधी गुण',
      financialHealthScore: 'आर्थिक आरोग्य गुण',
      riskLevel: 'जोखीम पातळी',
      bestBusinessRecommendation: 'सर्वोत्तम व्यवसाय शिफारस',
      localMarketOpportunity: 'स्थानिक बाजार संधी',
      availableSupport: 'उपलब्ध शासकीय साहाय्य',
      nextRecommendedAction: 'पुढील शिफारसीत कृती',
      quickButtons: {
        askAi: 'एआयस विचारा',
        exploreOpportunities: 'संधी शोधा',
        financialPlan: 'आर्थिक नियोजन',
        governmentSupport: 'शासकीय योजना',
      },
    },
    navigation: {
      dashboard: 'डॅशबोर्ड',
      profile: 'माहिती व संसाधने',
      advisor: 'एआय सल्लागार (आवाज)',
      opportunities: 'स्थानिक बाजार संधी',
      recommendations: 'व्यवसाय शिफारसी',
      financialPlanner: 'आर्थिक नियोजन',
      simulator: 'जोखीम सिम्युलेटर',
      schemes: 'शासकीय योजना',
      explainability: 'शिफारशींचे कारण',
      actionPlan: '90-दिवसीय कृती योजना',
      settings: 'सेटिंग्ज व ऑफलाइन',
    },
    onboarding: {
      badge: 'जलद ग्रामीण ऑनबोर्डिंग',
      title: 'अवघ्या 60 सेकंदात तुमचा योग्य ग्रामीण व्यवसाय निवडा',
      subtitle: 'कोणताही मोठा फॉर्म भरण्याची गरज नाही. फक्त 4 पर्याय निवडा आणि नफा, मशिनरी व 35% अनुदानाची संपूर्ण माहिती मिळवा.',
      step1Title: 'तुमचा जिल्हा, राज्य व भाषा निवडा',
      step1Desc: 'तुम्हाला कोणत्या भागात व्यवसाय सुरू करायचा आहे?',
      step2Title: 'तुमच्याकडे किती भांडवल (बजेट) उपलब्ध आहे?',
      step2Desc: 'स्वतःच्या बचतीतून तुम्ही लगेच किती रक्कम गुंतवू शकता?',
      step3Title: 'जागा (शेड) आणि वीज पुरवठ्याची सोय काय आहे?',
      step3Desc: 'मशीन चालवण्यासाठी जागा आणि किती तास वीज उपलब्ध आहे ते सांगा.',
      step4Title: 'सामाजिक प्रवर्ग आणि महिला बचत गट (SHG)',
      step4Desc: 'ग्रामीण भागातील OBC, SC, ST आणि महिला बचत गटांना PMEGP अंतर्गत 35% पर्यंत भरघोस अनुदान मिळते.',
      nextStep: 'पुढे जा →',
      prevStep: '← मागे जा',
      finishSetup: 'व्यवसाय व अनुदानाची माहिती मिळवा 🚀',
      presetNotice: 'खालीलपैकी कोणत्याही 1-क्लिक नमुना प्रोफाईलवर टॅप करून त्वरित सुरू करा',
    },
    advisor: {
      welcomeMessage: 'नमस्कार! मी व्योमी आहे, तुमचा ग्रामीण व्यवसाय मित्र. मला तेल घाणी, मिरची-हळद मसाला उद्योग, बाजारभाव किंवा सरकारी अनुदानाबद्दल काहीही विचारा.',
      onlineStatus: 'सक्रिय • ग्रामीण व्यवसाय मित्र',
      micPrompt: 'माईक दाबा आणि मराठी, हिंदी किंवा इंग्रजीत तुमचा प्रश्न बोला',
      micListening: 'तुमचा आवाज ऐकला जात आहे... कृपया स्पष्ट बोला',
      micTapToSpeak: 'बोलण्यासाठी माईक दाबा',
      readAloud: 'आवाजात ऐका',
      stopReading: 'आवाज थांबवा',
      suggestedQuestions: [
        'नाशिक/माझ्या जिल्ह्यात 35% PMEGP अनुदान कसे मिळवायचे?',
        'कच्ची घाणी तेल मशीनचा खर्च आणि नफा किती?',
        'पेंड (खळ) स्थानिक पातळीवर दुग्ध उत्पादकांना कशी विकायची?',
        'सुरुवातीला कोणते सरकारी परवाने (उद्यम, FSSAI) आवश्यक आहेत?',
      ],
      inputPlaceholder: 'टाइप करा किंवा बोला: मशीन, बाजारभाव, 35% सबसिडी, खरेदीदार...',
    },
    common: {
      rupeesPerMonth: '/महिना',
      months: 'महिने',
      score: 'गुण',
      low: 'कमी',
      medium: 'मध्यम',
      high: 'जास्त',
      save: 'जतन करा',
      edit: 'बदला',
      reset: 'रीसेट',
      done: 'पूर्ण',
      pending: 'अपूर्ण',
    },
  },
};

export const getTranslation = (lang: string): Translations => {
  if (lang === 'हिंदी') return TRANSLATIONS['हिंदी'];
  if (lang === 'मराठी') return TRANSLATIONS['मराठी'];
  return TRANSLATIONS['English'];
};
