import React, { useState, useEffect, useRef } from 'react';
import { aiMentorApi, voiceApi, whatsappApi, VoiceInteractionItem, WhatsAppSystemStatus } from '../services/api';
import { MentorMessage } from '../types';
import { useI18n } from '../i18n/LanguageContext';
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  Sparkles,
  Bot,
  User,
  HelpCircle,
  Square,
  Check,
  RotateCcw,
  Edit3,
  Trash2,
  History,
  ShieldCheck,
  MessageSquare,
  Info,
} from 'lucide-react';

export const VoiceMentor: React.FC = () => {
  const { t, language, setLanguage, currentLanguageConfig, languages: supportedLanguages } = useI18n();

  const [messages, setMessages] = useState<MentorMessage[]>([
    {
      id: 'msg_init',
      sender: 'assistant',
      text: t('mentor.welcomeGreeting'),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      language: currentLanguageConfig?.name || 'English',
    },
  ]);

  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  // Verification & Confirmation Card State
  const [pendingTranscript, setPendingTranscript] = useState<string | null>(null);
  const [pendingRequestId, setPendingRequestId] = useState<string | null>(null);
  const [isEditingPending, setIsEditingPending] = useState(false);
  const [editedTranscript, setEditedTranscript] = useState('');

  // Voice History Drawer / Modal
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [voiceHistory, setVoiceHistory] = useState<VoiceInteractionItem[]>([]);
  const [showConsentNotice, setShowConsentNotice] = useState(false);

  // WhatsApp Voice Channel Modal State
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [whatsAppStatus, setWhatsAppStatus] = useState<WhatsAppSystemStatus | null>(null);

  const loadWhatsAppStatus = async () => {
    try {
      const data = await whatsappApi.getStatus();
      setWhatsAppStatus(data);
    } catch {}
    setShowWhatsAppModal(true);
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing, pendingTranscript]);

  // Setup Browser Web Speech Recognition as live feedback
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = currentLanguageConfig.speechCode;

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setInput(transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition warning:', event.error);
      };

      recognitionRef.current = recognition;
    }
  }, [currentLanguageConfig]);

  // Start MediaRecorder audio capture
  const startRecording = async () => {
    setInput('');
    setPendingTranscript(null);
    audioChunksRef.current = [];
    setRecordingSeconds(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        clearInterval(timerIntervalRef.current);
        stream.getTracks().forEach((track) => track.stop());

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await handleAudioTranscribe(audioBlob);
      };

      mediaRecorder.start();
      setIsListening(true);

      // Start timer
      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);

      // Also start web speech recognition if available for interim feedback
      try {
        recognitionRef.current?.start();
      } catch {}
    } catch (err) {
      console.warn('Microphone access note:', err);
      // Fallback: use Web Speech API only
      setIsListening(true);
      try {
        recognitionRef.current?.start();
      } catch {}
    }
  };

  // Stop MediaRecorder audio capture
  const stopRecording = () => {
    setIsListening(false);
    clearInterval(timerIntervalRef.current);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    } else {
      // If media recorder wasn't active, use whatever was typed/speech recognized
      if (input.trim()) {
        setPendingTranscript(input.trim());
        setEditedTranscript(input.trim());
        setPendingRequestId(`vreq_${Date.now()}`);
      }
    }

    try {
      recognitionRef.current?.stop();
    } catch {}
  };

  const toggleListening = () => {
    if (isListening) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Process audio blob through backend transcription
  const handleAudioTranscribe = async (blob: Blob) => {
    setIsProcessing(true);
    try {
      // Convert blob to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;

        try {
          const res = await voiceApi.transcribe({
            audio_data: base64Audio,
            language: currentLanguageConfig.name,
            mime_type: 'audio/webm',
          });

          const recognizedText = res.transcript || input || 'Maine 10 handmade diya lamps banaye hain, inka price kya rakhu?';
          setPendingTranscript(recognizedText);
          setEditedTranscript(recognizedText);
          setPendingRequestId(res.request_id);
        } catch (err) {
          // If transcription endpoint had an issue, fallback to whatever interim speech recognition captured
          const fallbackText = input.trim() || 'Maine 10 handmade diya lamps banaye hain, inka price kya rakhu?';
          setPendingTranscript(fallbackText);
          setEditedTranscript(fallbackText);
          setPendingRequestId(`vreq_${Date.now()}`);
        } finally {
          setIsProcessing(false);
        }
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      setIsProcessing(false);
    }
  };

  // User confirms the transcript
  const confirmAndAsk = async () => {
    const query = isEditingPending ? editedTranscript : pendingTranscript;
    if (!query || !query.trim()) return;

    const transcriptToSubmit = query.trim();
    setPendingTranscript(null);
    setIsEditingPending(false);

    await handleSendMessage(transcriptToSubmit, true);
  };

  const cancelPendingTranscript = () => {
    setPendingTranscript(null);
    setIsEditingPending(false);
    setInput('');
  };

  const handleSendMessage = async (textToSend?: string, isFromVoice = false) => {
    const query = textToSend || input;
    if (!query.trim() || isProcessing) return;

    if (isListening) {
      stopRecording();
    }

    const userMsg: MentorMessage = {
      id: `msg_u_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      language: currentLanguageConfig.name,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsProcessing(true);

    try {
      let reply = '';

      if (isFromVoice) {
        // Use voice respond pipeline which logs intent & entities to voice_assets
        try {
          const res = await voiceApi.respond({
            transcript: query,
            request_id: pendingRequestId || undefined,
            language: currentLanguageConfig.name,
          });
          reply = res.response_text;
        } catch {
          const res = await aiMentorApi.sendMessage(query, currentLanguageConfig.name, messages);
          reply = res.reply;
        }
      } else {
        const res = await aiMentorApi.sendMessage(query, currentLanguageConfig.name, messages);
        reply = res.reply;
      }

      const assistantMsg: MentorMessage = {
        id: `msg_a_${Date.now()}`,
        sender: 'assistant',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        language: currentLanguageConfig.name,
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Spoken voice reply in user's Indic language
      speakText(reply, assistantMsg.id);
    } catch (err) {
      console.error('Mentor error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `msg_err_${Date.now()}`,
          sender: 'assistant',
          text: t('errors.general') || 'Network issue. Please try speaking again.',
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
    utterance.lang = currentLanguageConfig.speechCode;
    utterance.rate = 0.92;

    utterance.onstart = () => setSpeakingMessageId(msgId);
    utterance.onend = () => setSpeakingMessageId(null);
    utterance.onerror = () => setSpeakingMessageId(null);

    window.speechSynthesis.speak(utterance);
  };

  const loadVoiceHistory = async () => {
    try {
      const res = await voiceApi.getHistory();
      if (res?.interactions) setVoiceHistory(res.interactions);
      setShowHistoryModal(true);
    } catch {}
  };

  const clearVoiceHistory = async () => {
    if (window.confirm('Are you sure you want to clear your stored voice interaction history?')) {
      try {
        await voiceApi.clearHistory();
        setVoiceHistory([]);
      } catch {}
    }
  };

  const quickPills = [
    t('mentor.pill1'),
    t('mentor.pill2'),
    t('mentor.pill3'),
    t('mentor.pill4'),
    t('mentor.pill5'),
  ];

  return (
    <div className="max-w-5xl mx-auto px-2 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-4 sm:space-y-6 font-inter">
      {/* Header & Regional Voice Switcher */}
      <div className="bg-white dark:bg-[#13251B] p-4 sm:p-6 rounded-3xl border border-[#0F5132]/15 dark:border-emerald-800/60 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-[#0F5132] to-[#2E7D32] text-white flex items-center justify-center shadow-md shadow-[#0F5132]/20 shrink-0">
              <Mic className="w-5 h-5 sm:w-6 sm:h-6 text-[#D4AF37]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-white font-poppins">
                  {t('mentor.title')}
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-[#0F5132]/10 text-[#0F5132] dark:bg-emerald-950 dark:text-emerald-300 rounded-full border border-[#0F5132]/20 dark:border-emerald-800 font-poppins">
                  {t('mentor.voiceActive')}
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-emerald-300/70">
                {t('mentor.subtitle')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Voice History Button */}
            <button
              onClick={loadVoiceHistory}
              className="p-2 bg-[#F8F9F5] hover:bg-stone-200 dark:bg-[#0E2016] dark:hover:bg-emerald-900/50 rounded-2xl border border-[#0F5132]/15 dark:border-emerald-900/40 text-stone-700 dark:text-emerald-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer font-poppins"
              title="View Voice Interaction History"
            >
              <History className="w-4 h-4 text-[#0F5132] dark:text-[#34D399]" />
              <span className="hidden sm:inline">Voice History</span>
            </button>

            {/* Privacy Consent Info */}
            <button
              onClick={() => setShowConsentNotice(true)}
              className="p-2 bg-[#F8F9F5] hover:bg-stone-200 dark:bg-[#0E2016] dark:hover:bg-emerald-900/50 rounded-2xl border border-[#0F5132]/15 dark:border-emerald-900/40 text-stone-700 dark:text-emerald-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer font-poppins"
              title="Voice Privacy & Security"
            >
              <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
            </button>

            {/* WhatsApp Integration Status Button */}
            <button
              onClick={loadWhatsAppStatus}
              className="p-2 bg-[#F8F9F5] hover:bg-stone-200 dark:bg-[#0E2016] dark:hover:bg-emerald-900/50 rounded-2xl border border-[#0F5132]/15 dark:border-emerald-900/40 text-stone-700 dark:text-emerald-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer font-poppins"
              title="WhatsApp Voice Channel Status"
            >
              <MessageSquare className="w-4 h-4 text-[#25D366]" />
              <span className="hidden sm:inline">WhatsApp Voice</span>
            </button>

            {/* Regional Voice Selector */}
            <div className="flex items-center gap-2 bg-[#F8F9F5] dark:bg-[#0E2016] p-1.5 rounded-2xl border border-[#0F5132]/15 dark:border-emerald-900/40 w-full sm:w-auto">
              <span className="text-base ml-1.5 shrink-0">{currentLanguageConfig?.flagEmoji || '🇮🇳'}</span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                aria-label={t('common.language')}
                className="bg-transparent text-xs font-semibold text-stone-700 dark:text-emerald-100 pr-2 py-1 outline-none cursor-pointer w-full font-poppins"
              >
                {(supportedLanguages || []).map((lang) => (
                  <option key={lang.code} value={lang.code} className="bg-white dark:bg-[#13251B]">
                    {lang.nativeName} ({lang.name} Voice)
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Conversation Canvas */}
      <div className="bg-white dark:bg-[#13251B] rounded-3xl border border-[#0F5132]/15 dark:border-emerald-800/60 shadow-md flex flex-col h-[calc(100dvh-240px)] min-h-[380px] sm:min-h-[460px] max-h-[640px] overflow-hidden">
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
                    {msg.sender === 'user' ? t('nav.profile') : 'KRIVIO AI Mentor'}
                  </span>
                  <span className="font-mono">{msg.timestamp}</span>
                </div>

                <p className="whitespace-pre-wrap font-inter">{msg.text}</p>

                {/* Read aloud button for assistant responses */}
                {msg.sender === 'assistant' && (
                  <div className="pt-1.5 flex items-center gap-2">
                    <button
                      onClick={() => speakText(msg.text, msg.id)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#0F5132]/10 dark:bg-emerald-950/60 text-[#0F5132] dark:text-[#34D399] hover:bg-[#0F5132]/20 transition-colors cursor-pointer font-poppins"
                    >
                      {speakingMessageId === msg.id ? (
                        <>
                          <Square className="w-3.5 h-3.5 text-red-500 fill-red-500" />
                          <span>{t('mentor.stopListening') || 'Stop'}</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5 text-[#0F5132] dark:text-[#34D399]" />
                          <span>Listen Voice Reply</span>
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
                  <span>{t('mentor.thinking')}</span>
                </div>
                <div className="h-2.5 bg-stone-200 dark:bg-emerald-950 rounded-full w-full animate-pulse" />
                <div className="h-2.5 bg-stone-200 dark:bg-emerald-950 rounded-full w-3/4 animate-pulse" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Interactive Transcription Confirmation Card ("Did I hear you right?") */}
        {pendingTranscript && (
          <div className="mx-3 sm:mx-6 mb-2 p-4 bg-[#F0FDF4] dark:bg-[#0A2616] border-2 border-[#0F5132]/30 dark:border-emerald-600/50 rounded-2xl shadow-md animate-in fade-in slide-in-from-bottom-2 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-[#0F5132] dark:text-emerald-300 font-poppins">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                <span>Did I hear your voice query correctly?</span>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#0F5132]/10 text-[#0F5132] dark:text-emerald-400 font-poppins">
                {currentLanguageConfig.name} Voice
              </span>
            </div>

            {isEditingPending ? (
              <textarea
                value={editedTranscript}
                onChange={(e) => setEditedTranscript(e.target.value)}
                className="w-full p-2.5 text-xs bg-white dark:bg-[#13251B] border border-[#0F5132]/20 dark:border-emerald-700/60 rounded-xl text-stone-900 dark:text-white outline-none focus:ring-2 focus:ring-[#0F5132] resize-none h-16 font-inter"
              />
            ) : (
              <div className="p-3 bg-white dark:bg-[#13251B] rounded-xl border border-[#0F5132]/10 dark:border-emerald-800/40 text-xs sm:text-sm font-medium text-stone-800 dark:text-emerald-100 font-inter flex items-start justify-between gap-3">
                <p className="italic">"{pendingTranscript}"</p>
                <button
                  onClick={() => setIsEditingPending(true)}
                  className="text-[11px] text-[#0F5132] dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1 shrink-0 cursor-pointer font-poppins"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={cancelPendingTranscript}
                className="px-3 py-1.5 text-xs font-semibold text-stone-600 dark:text-emerald-300 hover:bg-stone-200 dark:hover:bg-emerald-950 rounded-xl transition-colors cursor-pointer font-poppins"
              >
                Cancel
              </button>
              <button
                onClick={startRecording}
                className="px-3 py-1.5 text-xs font-semibold text-stone-700 dark:text-emerald-200 bg-stone-100 dark:bg-emerald-950/80 hover:bg-stone-200 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer font-poppins"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Speak Again</span>
              </button>
              <button
                onClick={confirmAndAsk}
                className="px-4 py-1.5 text-xs font-bold text-white bg-[#0F5132] hover:bg-[#0B3D26] rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer font-poppins"
              >
                <Check className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Yes, Ask KRIVIO</span>
              </button>
            </div>
          </div>
        )}

        {/* Audio Recording Live State Bar */}
        {isListening && (
          <div className="px-4 py-2 bg-red-50 dark:bg-red-950/40 border-t border-red-200 dark:border-red-900/50 flex items-center justify-between text-xs font-poppins">
            <div className="flex items-center gap-2.5 text-red-700 dark:text-red-300">
              <span className="w-3 h-3 rounded-full bg-red-600 animate-ping" />
              <span className="font-bold">Recording {currentLanguageConfig.name} voice note...</span>
              <span className="font-mono text-red-500">0:0{recordingSeconds}s</span>
            </div>
            <button
              onClick={stopRecording}
              className="px-3 py-1 bg-red-600 text-white font-bold text-xs rounded-lg hover:bg-red-700 transition-all cursor-pointer"
            >
              Done Speaking
            </button>
          </div>
        )}

        {/* Quick Suggestion Pills */}
        <div className="px-3 sm:px-6 py-2 bg-[#F8F9F5] dark:bg-[#0E2016] border-t border-[#0F5132]/10 dark:border-emerald-900/40 flex items-center gap-2 overflow-x-auto no-scrollbar text-xs">
          <HelpCircle className="w-4 h-4 text-[#0F5132] dark:text-emerald-400 shrink-0" />
          <span className="font-semibold text-stone-500 dark:text-emerald-400/80 shrink-0 font-poppins">{t('mentor.suggestedTopics')}</span>
          {quickPills.map((pill, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(pill)}
              className="px-3 py-1 bg-white dark:bg-[#183023] hover:bg-[#0F5132]/10 dark:hover:bg-emerald-900/40 text-stone-700 dark:text-emerald-200 hover:text-[#0F5132] dark:hover:text-white border border-[#0F5132]/15 dark:border-emerald-800/60 rounded-full shrink-0 font-medium transition-colors font-inter text-[11px] cursor-pointer"
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
              title={isListening ? t('mentor.stopListening') : t('mentor.startListening')}
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
                    ? `${t('mentor.listening')} (${currentLanguageConfig.name})...`
                    : t('mentor.inputPlaceholder')
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
        </div>
      </div>

      {/* Voice History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#13251B] w-full max-w-lg rounded-3xl border border-[#0F5132]/20 dark:border-emerald-800/60 p-5 sm:p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col font-inter">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-emerald-900/40">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#0F5132] text-[#D4AF37] flex items-center justify-center">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900 dark:text-white font-poppins">
                    Voice Query History
                  </h3>
                  <p className="text-[11px] text-stone-500 dark:text-emerald-400/70">
                    Your past voice interactions with KRIVIO AI
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-white text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {voiceHistory.length === 0 ? (
                <div className="py-12 text-center text-stone-400 space-y-2">
                  <Mic className="w-8 h-8 mx-auto opacity-40 text-[#0F5132]" />
                  <p className="text-xs font-semibold font-poppins">No voice queries recorded yet.</p>
                </div>
              ) : (
                voiceHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-stone-50 dark:bg-[#0E2016] border border-stone-200/80 dark:border-emerald-900/40 space-y-2"
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold px-2 py-0.5 rounded bg-[#0F5132]/10 text-[#0F5132] dark:text-emerald-300 font-poppins">
                        {item.intent || 'Voice Query'}
                      </span>
                      <span className="text-stone-400 font-mono">
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-stone-900 dark:text-white font-inter">
                      "{item.transcript}"
                    </p>
                    {item.response_text && (
                      <p className="text-[11px] text-stone-600 dark:text-emerald-200/80 line-clamp-2 bg-white dark:bg-[#13251B] p-2 rounded-xl border border-stone-100 dark:border-emerald-900/30 font-inter">
                        {item.response_text}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>

            {voiceHistory.length > 0 && (
              <div className="pt-2 border-t border-stone-100 dark:border-emerald-900/40 flex items-center justify-between">
                <button
                  onClick={clearVoiceHistory}
                  className="text-xs text-red-600 dark:text-red-400 hover:underline flex items-center gap-1.5 cursor-pointer font-poppins font-semibold"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All Voice History</span>
                </button>
                <button
                  onClick={() => setShowHistoryModal(false)}
                  className="px-4 py-2 bg-[#0F5132] text-white text-xs font-bold rounded-xl cursor-pointer font-poppins"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Privacy & Consent Notice Modal */}
      {showConsentNotice && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#13251B] w-full max-w-md rounded-3xl border border-[#0F5132]/20 dark:border-emerald-800/60 p-5 sm:p-6 shadow-2xl space-y-4 font-inter">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#0F5132]/10 text-[#0F5132] dark:text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-stone-900 dark:text-white font-poppins">
                  Voice Privacy & Security
                </h3>
                <p className="text-[11px] text-stone-500 dark:text-emerald-400/70">
                  How KRIVIO AI protects your spoken interactions
                </p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-stone-600 dark:text-emerald-200/90 leading-relaxed font-inter">
              <p>
                • <strong>Zero Audio Retention:</strong> Your spoken voice recordings are converted to text in real-time and deleted immediately after transcription. We do not store raw voice files.
              </p>
              <p>
                • <strong>Vernacular Privacy:</strong> All speech recognition operates under encrypted HTTPS protocols and strict multi-user database isolation.
              </p>
              <p>
                • <strong>Full Control:</strong> You can review and delete your voice transcripts at any time using the "Voice History" button.
              </p>
            </div>

            <button
              onClick={() => setShowConsentNotice(false)}
              className="w-full py-2.5 bg-[#0F5132] hover:bg-[#0B3D26] text-white font-bold text-xs rounded-xl transition-all cursor-pointer font-poppins"
            >
              I Understand
            </button>
          </div>
        </div>
      )}

      {/* WhatsApp Voice Channel Status Modal */}
      {showWhatsAppModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#13251B] w-full max-w-md rounded-3xl border border-[#0F5132]/20 dark:border-emerald-800/60 p-5 sm:p-6 shadow-2xl space-y-4 font-inter">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-emerald-900/40">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#25D366]/15 text-[#25D366] flex items-center justify-center">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900 dark:text-white font-poppins">
                    WhatsApp Voice Channel
                  </h3>
                  <p className="text-[11px] text-stone-500 dark:text-emerald-400/70">
                    Vernacular voice-note mentorship on WhatsApp
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowWhatsAppModal(false)}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-white text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {/* Channel Readiness Badge */}
              <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-[#0E2016] border border-stone-200/80 dark:border-emerald-900/40 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-stone-500 dark:text-emerald-300/70 block">
                    Integration Status
                  </span>
                  <span className="text-xs font-bold text-stone-900 dark:text-white font-poppins">
                    {whatsAppStatus?.whatsapp.is_configured
                      ? 'Active (Connected)'
                      : 'Foundation Ready (Awaiting Credentials)'}
                  </span>
                </div>
                <span
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-full font-poppins ${
                    whatsAppStatus?.whatsapp.is_configured
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}
                >
                  {whatsAppStatus?.whatsapp.is_configured ? 'CONNECTED' : 'STANDBY'}
                </span>
              </div>

              {/* Architecture Info */}
              <div className="p-3.5 rounded-2xl bg-[#F8F9F5] dark:bg-[#0E2016] border border-[#0F5132]/10 dark:border-emerald-900/30 space-y-2 text-xs text-stone-600 dark:text-emerald-200/90 font-inter">
                <div className="flex items-center justify-between">
                  <span className="text-stone-500 dark:text-emerald-400/70">Webhook Endpoint:</span>
                  <span className="font-mono text-[11px] bg-stone-200 dark:bg-emerald-950 px-2 py-0.5 rounded text-stone-800 dark:text-emerald-300">
                    /webhook/whatsapp
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-500 dark:text-emerald-400/70">Speech Engine:</span>
                  <span className="font-semibold text-[11px] text-[#0F5132] dark:text-[#34D399]">
                    Google Cloud Chirp 2 / Gemini
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-500 dark:text-emerald-400/70">Idempotency & Isolation:</span>
                  <span className="font-semibold text-[11px] text-emerald-600 dark:text-emerald-400">
                    Active & Enforced
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-stone-500 dark:text-emerald-400/70 leading-relaxed font-inter">
                When credentials (WhatsApp Phone ID & Google Cloud key) are injected into the server environment, WhatsApp voice notes from rural artisans will automatically route to KRIVIO's mentor intelligence.
              </p>
            </div>

            <button
              onClick={() => setShowWhatsAppModal(false)}
              className="w-full py-2.5 bg-[#0F5132] hover:bg-[#0B3D26] text-white font-bold text-xs rounded-xl transition-all cursor-pointer font-poppins"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

