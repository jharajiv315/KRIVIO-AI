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

      // Map selected language to SpeechRecognition lang tag
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

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingMessageId(null);
  };

  const quickPills = [
    'How do I calculate fair prices for my handmade items?',
    'How do I list my craft products on ONDC?',
    'What government loans or grants are available for SHGs?',
    'How to pack terracotta pottery safely for courier shipping?',
    'How to get customer orders on WhatsApp Business?',
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header & Language Switcher */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
              <Mic className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white font-display">
                  Voice AI Business Mentor
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 rounded-full">
                  Gemini Powered
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Speak your business query in regional language. Practical advice for rural entrepreneurs.
              </p>
            </div>
          </div>

          {/* Regional Voice Selector */}
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
            <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400 ml-1.5" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-200 pr-2 py-1 outline-none cursor-pointer"
            >
              <option value="English">English Voice</option>
              <option value="Hindi">हिंदी (Hindi Voice)</option>
              <option value="Tamil">தமிழ் (Tamil Voice)</option>
              <option value="Telugu">తెలుగు (Telugu Voice)</option>
              <option value="Bengali">বাংলা (Bengali Voice)</option>
              <option value="Marathi">मराठी (Marathi Voice)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Conversation Canvas */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md flex flex-col h-[560px] overflow-hidden">
        {/* Messages List */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 max-w-3xl ${
                msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  msg.sender === 'user'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-emerald-600 text-white shadow-xs'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Content */}
              <div
                className={`p-4 rounded-2xl space-y-1.5 text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-amber-500 text-white rounded-tr-xs'
                    : 'bg-slate-100 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 border border-slate-200/60 dark:border-slate-700/60 rounded-tl-xs'
                }`}
              >
                <div className="flex items-center justify-between gap-4 text-[10px] opacity-80">
                  <span className="font-semibold">
                    {msg.sender === 'user' ? 'You' : 'KRIVIO AI Mentor'}
                  </span>
                  <span>{msg.timestamp}</span>
                </div>

                <p className="whitespace-pre-wrap">{msg.text}</p>

                {/* Read aloud button for assistant responses */}
                {msg.sender === 'assistant' && (
                  <div className="pt-1.5 flex items-center gap-2">
                    <button
                      onClick={() => speakText(msg.text, msg.id)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 hover:underline"
                    >
                      {speakingMessageId === msg.id ? (
                        <>
                          <Square className="w-3 h-3 text-red-500 fill-red-500" />
                          <span>Stop Voice</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
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
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl rounded-tl-xs space-y-2 w-64 border border-slate-200/60 dark:border-slate-700/60">
                <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                  <span>KRIVIO Mentor preparing response...</span>
                </div>
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full w-full animate-pulse" />
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full w-3/4 animate-pulse" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Pills */}
        <div className="px-6 py-2 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200/60 dark:border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar text-xs">
          <HelpCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="font-semibold text-slate-500 shrink-0">Quick Questions:</span>
          {quickPills.map((pill, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(pill)}
              className="px-3 py-1 bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950 text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300 border border-slate-200 dark:border-slate-700 rounded-full shrink-0 font-medium transition-colors"
            >
              {pill}
            </button>
          ))}
        </div>

        {/* Voice Microphone & Text Input Bar */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            {/* Big Pulsing Mic Button */}
            <button
              id="btn-mentor-big-mic"
              onClick={toggleListening}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold transition-all shrink-0 shadow-lg ${
                isListening
                  ? 'bg-red-500 animate-pulse scale-105 shadow-red-500/30 ring-4 ring-red-200 dark:ring-red-900'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30 hover:scale-105 active:scale-95'
              }`}
              title={isListening ? 'Tap to Stop Listening' : 'Tap to Speak Question'}
            >
              {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6 text-amber-300" />}
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
                className="w-full pl-4 pr-10 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />

              <button
                id="btn-mentor-send"
                onClick={() => handleSendMessage()}
                disabled={!input.trim() || isProcessing}
                className="absolute right-2 top-2 p-1.5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-950 rounded-lg disabled:opacity-30 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
          {isListening && (
            <p className="text-[11px] text-red-500 font-semibold mt-2 text-center animate-pulse">
              🎙️ Listening to speech in {language}... Speak clearly into your phone/laptop mic.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
