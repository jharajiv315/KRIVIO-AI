import React, { useState, useEffect, useRef } from 'react';
import { aiMentorApi } from '../services/api';
import { MentorMessage } from '../types';
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  Globe,
  Sparkles,
  Bot,
  User,
  HelpCircle,
  RotateCcw,
  Square,
} from 'lucide-react';

export const VoiceMentor: React.FC = () => {
  const [messages, setMessages] = useState<MentorMessage[]>([
    {
      id: 'msg_init',
      sender: 'assistant',
      text: 'Namaste! I am KRIVIO AI, your voice mentor for your rural business. Ask me anything about pricing your crafts, selling on ONDC, taking product photos, or applying for government grants.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      language: 'English',
    },
  ]);

  const [input, setInput] = useState('');
  const [language, setLanguage] = useState('English');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing]);

  // Setup Browser Web Speech Recognition if available
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;

      const langMap: Record<string, string> = {
        English: 'en-IN',
        Hindi: 'hi-IN',
        Tamil: 'ta-IN',
        Telugu: 'te-IN',
        Bengali: 'bn-IN',
        Marathi: 'mr-IN',
        Gujarati: 'gu-IN',
      };
      recognition.lang = langMap[language] || 'en-IN';

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setInput(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [language]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setInput('');
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (err) {
        console.error('Speech recognition start error:', err);
        setIsListening(false);
      }
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isProcessing) return;

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }

    const userMsg: MentorMessage = {
      id: `msg_u_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      language,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsProcessing(true);

    try {
      const res = await aiMentorApi.sendMessage(query, language, messages);

      const assistantMsg: MentorMessage = {
        id: `msg_a_${Date.now()}`,
        sender: 'assistant',
        text: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        language,
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Auto read response with voice synthesis
      speakText(res.reply, assistantMsg.id);
    } catch (err) {
      console.error('Mentor error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `msg_err_${Date.now()}`,
          sender: 'assistant',
          text: 'I apologize, I experienced a brief connection delay. Please tap the mic button and ask again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const speakText = (text: string, msgId: string) => {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();

    if (speakingMessageId === msgId) {
      setSpeakingMessageId(null);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    const langMap: Record<string, string> = {
      English: 'en-IN',
      Hindi: 'hi-IN',
      Tamil: 'ta-IN',
      Telugu: 'te-IN',
      Bengali: 'bn-IN',
      Marathi: 'mr-IN',
      Gujarati: 'gu-IN',
    };
    utterance.lang = langMap[language] || 'en-IN';
    utterance.rate = 0.95;

    utterance.onstart = () => setSpeakingMessageId(msgId);
    utterance.onend = () => setSpeakingMessageId(null);
    utterance.onerror = () => setSpeakingMessageId(null);

    window.speechSynthesis.speak(utterance);
  };

  const quickPills = [
    'How do I calculate fair prices for my handmade items?',
    'How do I list my craft products on ONDC?',
    'What government loans or grants are available for SHGs?',
    'How to pack terracotta pottery safely for courier shipping?',
    'How to get customer orders on WhatsApp Business?',
  ];

  return (
    <div className="max-w-5xl mx-auto px-2 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-4 sm:space-y-6 font-inter">
      {/* Header & Language Switcher */}
      <div className="bg-white dark:bg-[#13251B] p-4 sm:p-6 rounded-3xl border border-[#0F5132]/15 dark:border-emerald-800/60 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-[#0F5132] to-[#2E7D32] text-white flex items-center justify-center shadow-md shadow-[#0F5132]/20 shrink-0">
              <Mic className="w-5 h-5 sm:w-6 sm:h-6 text-[#D4AF37]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-white font-poppins">
                  Voice AI Business Mentor
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-[#0F5132]/10 text-[#0F5132] dark:bg-emerald-950 dark:text-emerald-300 rounded-full border border-[#0F5132]/20 dark:border-emerald-800 font-poppins">
                  AI Active
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-emerald-300/70">
                Speak your business query in regional languages. Practical advice for rural creators.
              </p>
            </div>
          </div>

          {/* Regional Voice Selector */}
          <div className="flex items-center gap-2 bg-[#F8F9F5] dark:bg-[#0E2016] p-1.5 rounded-2xl border border-[#0F5132]/15 dark:border-emerald-900/40 w-full sm:w-auto">
            <Globe className="w-4 h-4 text-[#0F5132] dark:text-emerald-400 ml-1.5 shrink-0" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              aria-label="Select voice language"
              className="bg-transparent text-xs font-semibold text-stone-700 dark:text-emerald-100 pr-2 py-1 outline-none cursor-pointer w-full font-poppins"
            >
              <option value="English" className="bg-white dark:bg-[#13251B]">English Voice</option>
              <option value="Hindi" className="bg-white dark:bg-[#13251B]">हिंदी (Hindi Voice)</option>
              <option value="Gujarati" className="bg-white dark:bg-[#13251B]">ગુજરાતી (Gujarati Voice)</option>
              <option value="Tamil" className="bg-white dark:bg-[#13251B]">தமிழ் (Tamil Voice)</option>
              <option value="Telugu" className="bg-white dark:bg-[#13251B]">తెలుగు (Telugu Voice)</option>
              <option value="Bengali" className="bg-white dark:bg-[#13251B]">বাংলা (Bengali Voice)</option>
              <option value="Marathi" className="bg-white dark:bg-[#13251B]">मराठी (Marathi Voice)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Conversation Canvas */}
      <div className="bg-white dark:bg-[#13251B] rounded-3xl border border-[#0F5132]/15 dark:border-emerald-800/60 shadow-md flex flex-col h-[calc(100dvh-280px)] min-h-[460px] max-h-[640px] overflow-hidden">
        {/* Messages List */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 sm:gap-3 max-w-3xl ${
                msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold font-poppins shadow-xs ${
                  msg.sender === 'user'
                    ? 'bg-[#D4AF37] text-[#1A1A1A]'
                    : 'bg-[#0F5132] text-white'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Content */}
              <div
                className={`p-3.5 sm:p-4 rounded-2xl space-y-1.5 text-xs sm:text-sm leading-relaxed max-w-[85%] sm:max-w-xl ${
                  msg.sender === 'user'
                    ? 'bg-[#0F5132] text-white rounded-tr-xs shadow-xs'
                    : 'bg-[#F8F9F5] dark:bg-[#183023] text-stone-900 dark:text-[#E2F1E7] border border-[#0F5132]/10 dark:border-emerald-800/50 rounded-tl-xs'
                }`}
              >
                <div className="flex items-center justify-between gap-4 text-[10px] opacity-75">
                  <span className="font-semibold font-poppins">
                    {msg.sender === 'user' ? 'You' : 'KRIVIO AI Mentor'}
                  </span>
                  <span className="font-mono">{msg.timestamp}</span>
                </div>

                <p className="whitespace-pre-wrap font-inter">{msg.text}</p>

                {/* Read aloud button for assistant responses */}
                {msg.sender === 'assistant' && (
                  <div className="pt-1.5 flex items-center gap-2">
                    <button
                      onClick={() => speakText(msg.text, msg.id)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0F5132] dark:text-[#34D399] hover:underline"
                    >
                      {speakingMessageId === msg.id ? (
                        <>
                          <Square className="w-3 h-3 text-red-500 fill-red-500" />
                          <span>Stop Voice</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5 text-[#0F5132] dark:text-[#34D399]" />
                          <span>Listen Voice Response</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Skeleton Loader during AI Thinking */}
          {isProcessing && (
            <div className="flex items-start gap-3 max-w-2xl">
              <div className="w-8 h-8 rounded-full bg-[#0F5132] text-white font-bold flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-[#F8F9F5] dark:bg-[#183023] p-4 rounded-2xl rounded-tl-xs space-y-2 w-64 border border-[#0F5132]/10 dark:border-emerald-800/50">
                <div className="flex items-center gap-2 text-xs text-[#0F5132] dark:text-emerald-400 font-semibold font-poppins">
                  <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] animate-pulse" />
                  <span>KRIVIO Mentor preparing response...</span>
                </div>
                <div className="h-2.5 bg-stone-200 dark:bg-emerald-950 rounded-full w-full animate-pulse" />
                <div className="h-2.5 bg-stone-200 dark:bg-emerald-950 rounded-full w-3/4 animate-pulse" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Pills */}
        <div className="px-3 sm:px-6 py-2 bg-[#F8F9F5] dark:bg-[#0E2016] border-t border-[#0F5132]/10 dark:border-emerald-900/40 flex items-center gap-2 overflow-x-auto no-scrollbar text-xs">
          <HelpCircle className="w-4 h-4 text-[#0F5132] dark:text-emerald-400 shrink-0" />
          <span className="font-semibold text-stone-500 dark:text-emerald-400/80 shrink-0 font-poppins">Quick Questions:</span>
          {quickPills.map((pill, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(pill)}
              className="px-3 py-1 bg-white dark:bg-[#183023] hover:bg-[#0F5132]/10 dark:hover:bg-emerald-900/40 text-stone-700 dark:text-emerald-200 hover:text-[#0F5132] dark:hover:text-white border border-[#0F5132]/15 dark:border-emerald-800/60 rounded-full shrink-0 font-medium transition-colors font-inter text-[11px]"
            >
              {pill}
            </button>
          ))}
        </div>

        {/* Voice Microphone & Text Input Bar */}
        <div className="p-3 sm:p-4 bg-white dark:bg-[#13251B] border-t border-[#0F5132]/10 dark:border-emerald-900/40">
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Big Pulsing Mic Button */}
            <button
              id="btn-mentor-big-mic"
              onClick={toggleListening}
              className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-white font-bold transition-all shrink-0 shadow-lg cursor-pointer ${
                isListening
                  ? 'bg-red-600 animate-pulse scale-105 shadow-red-500/30 ring-4 ring-red-200 dark:ring-red-950'
                  : 'bg-[#0F5132] hover:bg-[#0B3D26] shadow-[#0F5132]/25 hover:scale-105 active:scale-95'
              }`}
              title={isListening ? 'Tap to Stop Listening' : 'Tap to Speak Question'}
            >
              {isListening ? <MicOff className="w-5 h-5 sm:w-6 sm:h-6" /> : <Mic className="w-5 h-5 sm:w-6 sm:h-6 text-[#D4AF37]" />}
            </button>

            {/* Input Field */}
            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={
                  isListening
                    ? `Listening to your ${language} voice...`
                    : 'Tap mic or type your business question...'
                }
                className="w-full pl-3.5 pr-10 py-2.5 sm:py-3 bg-[#F8F9F5] dark:bg-[#0E2016] border border-[#0F5132]/18 dark:border-emerald-800/60 rounded-xl text-xs sm:text-sm text-stone-900 dark:text-white focus:ring-2 focus:ring-[#0F5132] outline-none font-inter"
              />

              <button
                id="btn-mentor-send"
                onClick={() => handleSendMessage()}
                disabled={!input.trim() || isProcessing}
                className="absolute right-2 top-2 p-1.5 text-[#0F5132] dark:text-[#34D399] hover:bg-[#0F5132]/10 dark:hover:bg-emerald-950 rounded-lg disabled:opacity-30 transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
          {isListening && (
            <p className="text-[11px] text-red-500 font-semibold mt-2 text-center animate-pulse font-inter">
              🎙️ Listening to speech in {language}... Speak clearly into your phone/laptop mic.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

