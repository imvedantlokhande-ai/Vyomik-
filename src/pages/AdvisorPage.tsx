import { apiFetch } from '../utils/apiClient';
import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  User,
  RotateCcw,
  Copy,
  Check,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Languages,
  ShieldCheck,
  Lightbulb,
  ArrowRight,
  TrendingUp,
  Award,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getTranslation, SupportedLanguage } from '../utils/i18n';

interface ChatMessage {
  id: string;
  sender: 'user' | 'advisor';
  text: string;
  timestamp: string;
  source?: 'gemini' | 'knowledge_engine';
}

export const AdvisorPage: React.FC = () => {
  const { userProfile, activeBusiness, language, setLanguage } = useApp();
  const t = getTranslation(language);

  const initialGreeting =
    language === 'मराठी'
      ? `नमस्कार ${userProfile.name}! मी व्योमी आहे, तुमचा ग्रामीण व्यवसाय मित्र.\n\nमी **${userProfile.district}, ${userProfile.state}** मधील कृषी बाजारपेठ आणि तुमच्या **₹${userProfile.availableCapital.toLocaleString('en-IN')}** भांडवलाचा अभ्यास केला आहे.\n\nसध्या तुमची निवड **${activeBusiness.name}** ही आहे. मशिनरी, PMEGP 35% अनुदान किंवा ग्राहक शोधण्याबाबत तुम्हाला काय जाणून घ्यायचे आहे? खालील माईक दाबा किंवा विचारा!`
      : language === 'हिंदी'
      ? `नमस्ते ${userProfile.name}! मैं व्योमी हूँ, आपका ग्रामीण व्यवसाय सलाहकार।\n\nमैं **${userProfile.district}, ${userProfile.state}** में आपके **₹${userProfile.availableCapital.toLocaleString('en-IN')}** बजट के अनुसार स्थानीय अवसरों का विश्लेषण कर रहा हूँ।\n\nआपका सक्रिय व्यवसाय **${activeBusiness.name}** है। आपको मशीनरी, 35% PMEGP सब्सिडी या मंडी भाव के बारे में क्या जानकारी चाहिए? माइक दबाकर बेझिझक बोलें!`
      : `Namaste ${userProfile.name}! I am Vyomi, your rural enterprise companion.\n\nI am analyzing your location in **${userProfile.district}, ${userProfile.state}** with available capital of **₹${userProfile.availableCapital.toLocaleString('en-IN')}**.\n\nYour active venture is **${activeBusiness.name}**. How can I assist your business planning or government subsidies today? Speak or type your question below!`;

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-init',
      sender: 'advisor',
      text: initialGreeting,
      timestamp: 'Just now',
      source: 'knowledge_engine',
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Handle Speech Recognition
  const startSpeechRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Graceful fallback for browsers without speech API
      setVoiceNotice('Voice simulation active (browser speech API not permitted in iframe)');
      simulateSpokenVoice();
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang =
        language === 'मराठी' ? 'mr-IN' : language === 'हिंदी' ? 'hi-IN' : 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceNotice(t.advisor.micListening);
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setInputText(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
        setVoiceNotice('Microphone access unavailable. Using quick sample questions.');
        setTimeout(() => setVoiceNotice(null), 3000);
      };

      recognition.onend = () => {
        setIsListening(false);
        setVoiceNotice(null);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      simulateSpokenVoice();
    }
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
    setVoiceNotice(null);
  };

  // Simulated spoken voice fallback if in iframe or denied mic permission
  const simulateSpokenVoice = () => {
    setIsListening(true);
    setVoiceNotice(t.advisor.micListening);

    const samples =
      language === 'मराठी'
        ? [
            `माझ्या ${userProfile.district} जिल्ह्यात PMEGP चे 35% अनुदान कसे मिळवायचे?`,
            `${activeBusiness.name} सुरू करण्यासाठी कोणती यंत्रसामग्री लागते?`,
            `खेड्यातील किराणा दुकानांना माल कसा विकायचा?`,
          ]
        : language === 'हिंदी'
        ? [
            `मेरे जिले में 35% PMEGP सब्सिडी कैसे मिलेगी?`,
            `${activeBusiness.name} की मशीनरी और सही दाम क्या है?`,
            `स्थानीय स्तर पर ग्राहकों से एडवांस ऑर्डर कैसे लें?`,
          ]
        : [
            `How to claim 35% PMEGP subsidy in ${userProfile.district}?`,
            `What is the best machinery setup for ${activeBusiness.name}?`,
            `How do I get wholesale buyer contracts in local mandis?`,
          ];

    const randomSample = samples[Math.floor(Math.random() * samples.length)];

    let current = '';
    let i = 0;
    const interval = setInterval(() => {
      current += randomSample[i];
      setInputText(current);
      i++;
      if (i >= randomSample.length) {
        clearInterval(interval);
        setIsListening(false);
        setVoiceNotice(null);
      }
    }, 45);
  };

  // Text-To-Speech
  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    // Clean markdown stars
    const cleanText = text.replace(/[*#_`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang =
      language === 'मराठी' ? 'mr-IN' : language === 'हिंदी' ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.95;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setLoading(true);

    try {
      const response = await apiFetch('/api/v1/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: text,
          message: text,
          profile: {
            name: userProfile.name,
            location: `${userProfile.district}, ${userProfile.state}`,
            district: userProfile.district,
            state: userProfile.state,
            capital: userProfile.availableCapital,
            landAsset: userProfile.landAsset,
            skills: userProfile.skills,
            language: language,
            category: userProfile.casteCategory,
            shgMember: userProfile.shgMember,
            goal: activeBusiness.name,
          },
          currentBusiness: activeBusiness.name,
        }),
      });

      if (!response.ok) {
        throw new Error('API error');
      }

      const data = await response.json();

      const advisorMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        sender: 'advisor',
        text: data.advice || data.reply || 'Here is the practical guidance for your rural venture.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: data.model || data.source,
      };

      setMessages((prev) => [...prev, advisorMsg]);
    } catch {
      // Local knowledge fallback
      const fallbackReply =
        language === 'मराठी'
          ? `**व्योमिक कृती आराखडा (${activeBusiness.name}):**\n\n1. **35% PMEGP अनुदान:** तुम्ही ${userProfile.casteCategory} प्रवर्गात असल्याने JanSamarth पोर्टलवर 35% सबसिडीसाठी पात्र आहात.\n2. **स्थानिक खरेदीदार:** तुमच्या गावातील स्थानिक किराणा दुकानांना नमुने देऊन 7 दिवसांच्या उधारीवर काम सुरू करा.\n3. **भांडवल सुरक्षा:** किमान 45 दिवसांचा कच्चा मालाचा साठा राखून ठेवा.`
          : language === 'हिंदी'
          ? `**व्योमिक व्यावहारिक मार्गदर्शन (${activeBusiness.name}):**\n\n1. **35% PMEGP सब्सिडी:** ${userProfile.casteCategory} वर्ग होने के कारण आप जनसमर्थ पोर्टल पर 35% अनुदान के पात्र हैं।\n2. **मशीनरी की खरीद:** केवल BIS/ISO प्रमाणित रोटरी मशीन लें ताकि बिजली का बिल कम आए।\n3. **स्थानीय ग्राहक:** साप्ताहिक हाट व ग्रामीण किराना दुकानों पर छोटे 500ml/1L पैक में सीधे सप्लाई करें।`
          : `**VYOMIK Key Recommendations for ${activeBusiness.name}:**\n\n1. **Claim 35% Subsidy:** Under PMEGP rural guidelines, your ${userProfile.casteCategory} category entitles you to 35% margin money.\n2. **Quality Machinery:** Opt for stainless-steel food-grade contact parts to ensure immediate FSSAI basic clearance.\n3. **Retail Cashflow:** Supply 1L / 500ml packages to local village shops with weekly settlements.`;

      const fallbackMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        sender: 'advisor',
        text: fallbackReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'knowledge_engine',
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetChat = () => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
    setMessages([
      {
        id: 'm-reset',
        sender: 'advisor',
        text: initialGreeting,
        timestamp: 'Just now',
        source: 'knowledge_engine',
      },
    ]);
  };

  return (
    <div className="flex h-[calc(100vh-130px)] flex-col rounded-2xl border border-stone-200 bg-white shadow-sm overflow-hidden text-left">
      {/* Top Header: Vyomi Mitra Friendly Bar */}
      <div className="flex items-center justify-between border-b border-stone-100 bg-gradient-to-r from-emerald-900 to-emerald-800 px-4 py-3 text-white sm:px-6">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-400 text-emerald-950 font-black shadow-md">
            <Sparkles className="h-5 w-5" />
            <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-white">
              <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-extrabold text-white tracking-tight">
                Vyomi Mitra (व्योमी मित्र)
              </h1>
              <span className="rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 text-[10px] font-bold">
                SIH AI Coach
              </span>
            </div>
            <p className="text-[11px] text-emerald-100/80">
              {t.advisor.onlineStatus} • {userProfile.district}, {userProfile.state}
            </p>
          </div>
        </div>

        {/* Quick actions: Language toggle & Reset */}
        <div className="flex items-center gap-2">
          {/* Quick 3-way Language toggle in Advisor */}
          <div className="flex rounded-lg bg-emerald-950/60 p-1 text-xs">
            {(['English', 'हिंदी', 'मराठी'] as SupportedLanguage[]).map((l) => (
              <button
                key={l}
                onClick={() => setLanguage(l)}
                className={`rounded px-2 py-0.5 text-[11px] font-bold transition ${
                  language === l
                    ? 'bg-amber-400 text-emerald-950 shadow-xs'
                    : 'text-emerald-200 hover:text-white'
                }`}
              >
                {l === 'English' ? 'EN' : l === 'हिंदी' ? 'हिं' : 'म'}
              </button>
            ))}
          </div>

          <button
            onClick={handleResetChat}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-800/80 text-emerald-100 hover:bg-emerald-700 hover:text-white transition"
            title="Reset Chat"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Suggested Quick Spoken Prompts Bar */}
      <div className="border-b border-stone-100 bg-amber-50/50 px-4 py-2 sm:px-6 overflow-x-auto">
        <div className="flex items-center gap-2 whitespace-nowrap text-xs">
          <span className="font-extrabold text-amber-900 flex items-center gap-1 shrink-0">
            <Lightbulb className="h-3.5 w-3.5 text-amber-600" />
            <span>1-Tap Questions:</span>
          </span>
          {t.advisor.suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              className="flex items-center gap-1.5 rounded-xl border border-amber-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-800 hover:bg-amber-100/60 hover:border-amber-400 active:scale-95 transition shrink-0 shadow-xs"
            >
              <span>{q}</span>
              <ArrowRight className="h-3 w-3 text-amber-600" />
            </button>
          ))}
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${
              msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            {/* Avatar */}
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl text-xs font-black shadow-xs ${
                msg.sender === 'user'
                  ? 'bg-stone-900 text-white'
                  : 'bg-emerald-700 text-white ring-2 ring-emerald-600/30'
              }`}
            >
              {msg.sender === 'user' ? (
                <User className="h-4 w-4" />
              ) : (
                <Sparkles className="h-4 w-4 text-amber-300" />
              )}
            </div>

            {/* Bubble */}
            <div
              className={`group relative max-w-2xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-xs ${
                msg.sender === 'user'
                  ? 'bg-emerald-700 text-white rounded-tr-none'
                  : 'bg-stone-50 text-stone-900 rounded-tl-none border border-stone-200/80'
              }`}
            >
              <div className="whitespace-pre-wrap space-y-2 font-normal">
                {msg.text.split('\n\n').map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>

              {/* Message Footer: Timestamp, Voice TTS, Copy */}
              <div className="mt-3 flex items-center justify-between gap-4 border-t border-stone-200/60 pt-2 text-[11px] opacity-80">
                <span>{msg.timestamp}</span>

                {msg.sender === 'advisor' && (
                  <div className="flex items-center gap-3">
                    {/* Read Aloud Button */}
                    <button
                      onClick={() => speakText(msg.text)}
                      className="flex items-center gap-1 font-semibold text-emerald-800 hover:text-emerald-950 transition"
                      title={t.advisor.readAloud}
                    >
                      {isSpeaking ? (
                        <>
                          <VolumeX className="h-3.5 w-3.5 text-rose-600" />
                          <span className="text-rose-600">{t.advisor.stopReading}</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="h-3.5 w-3.5 text-emerald-700" />
                          <span>{t.advisor.readAloud}</span>
                        </>
                      )}
                    </button>

                    {/* Copy */}
                    <button
                      onClick={() => handleCopy(msg.id, msg.text)}
                      className="flex items-center gap-1 text-stone-500 hover:text-stone-800 transition"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-emerald-700 text-white">
              <Sparkles className="h-4 w-4 text-amber-300 animate-spin" />
            </div>
            <div className="rounded-2xl rounded-tl-none bg-stone-50 p-4 border border-stone-200">
              <div className="flex items-center gap-2 text-xs text-stone-600 font-medium">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-600 animate-ping" />
                <span>Vyomi is analyzing local mandi data & subsidy rules...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Voice Status Toast */}
      {voiceNotice && (
        <div className="bg-amber-500 text-stone-950 px-4 py-2 text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-red-600 animate-ping" />
            <span>{voiceNotice}</span>
          </div>
          <button
            onClick={() => setVoiceNotice(null)}
            className="text-stone-900 underline text-[11px]"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Prominent Microphone & Touch Input Bar */}
      <div className="border-t border-stone-200 bg-stone-50/80 p-3 sm:p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2 sm:gap-3"
        >
          {/* Prominent High-Visibility Microphone Button */}
          <button
            type="button"
            id="advisor-prominent-mic-btn"
            onClick={isListening ? stopSpeechRecognition : startSpeechRecognition}
            className={`relative flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl font-bold transition-all shadow-md active:scale-95 min-h-[44px] min-w-[44px] ${
              isListening
                ? 'bg-rose-600 text-white ring-4 ring-rose-300 animate-pulse'
                : 'bg-amber-400 text-emerald-950 hover:bg-amber-300 ring-2 ring-amber-500/30'
            }`}
            title={isListening ? 'Stop Listening' : t.advisor.micTapToSpeak}
            aria-label="Microphone Voice Input"
          >
            {isListening ? (
              <MicOff className="h-6 w-6 animate-bounce" />
            ) : (
              <Mic className="h-6 w-6" />
            )}
            {!isListening && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </span>
            )}
          </button>

          {/* Text Input */}
          <div className="relative flex-1">
            <input
              id="advisor-text-input"
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={t.advisor.inputPlaceholder}
              disabled={loading}
              className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-xs sm:text-sm text-stone-900 focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 min-h-[48px]"
            />
          </div>

          {/* Send Button */}
          <button
            type="submit"
            id="advisor-send-btn"
            disabled={!inputText.trim() || loading}
            className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-md transition hover:bg-emerald-800 disabled:opacity-40 active:scale-95 min-h-[44px] min-w-[44px]"
            aria-label="Send query"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>

        <div className="mt-2 flex items-center justify-between px-1 text-[11px] text-stone-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" />
            <span>Grounded in MSME, NABARD, and JanSamarth database</span>
          </span>
          <span className="hidden sm:inline">Tap Mic to speak in Hindi/Marathi/English</span>
        </div>
      </div>
    </div>
  );
};
