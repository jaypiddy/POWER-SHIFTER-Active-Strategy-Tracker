
import React, { useState, useEffect, useRef } from 'react';
import { Bet } from '../types';
import { startStrategicCouncil } from '../services/geminiService';
import { GenerateContentResponse } from '@google/genai';

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface StrategicCouncilProps {
  bet: Bet;
}

const StrategicCouncil: React.FC<StrategicCouncilProps> = ({ bet }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [session, setSession] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    // Reset session when bet changes
    setHasStarted(false);
    setMessages([]);
    setSession(null);
  }, [bet.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleStartSession = () => {
    setHasStarted(true);
    const chatSession = startStrategicCouncil(bet);
    setSession(chatSession);
    handleSendMessage("Hello, Council. I'd like to stress-test this bet.", chatSession);
  };

  const handleSendMessage = async (text: string, activeSession = session) => {
    if (!text.trim() || !activeSession || isTyping) return;

    const userMsg: Message = { role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const result = await activeSession.sendMessageStream({ message: text });
      let fullText = '';

      // Add a placeholder for the model response to update it chunk by chunk
      setMessages(prev => [...prev, { role: 'model', text: '' }]);

      for await (const chunk of result) {
        const chunkText = (chunk as GenerateContentResponse).text || '';
        fullText += chunkText;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { role: 'model', text: fullText };
          return newMessages;
        });
      }
    } catch (error) {
      console.error("Council error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "I apologize, the connection to the strategic plane was interrupted. Please try again." }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!hasStarted) {
    return (
      <div className="flex flex-col h-[600px] bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden items-center justify-center p-12 text-center group">
        <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-indigo-600/30 group-hover:scale-110 transition-transform duration-500">
          <i className="fas fa-gavel text-white text-3xl"></i>
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">The Strategic Council</h3>
        <p className="text-slate-400 max-w-md mb-8 leading-relaxed font-light">
          Activate the council to receive AI-driven stress-testing, strategic analysis, and Devil's Advocate challenges for this bet.
        </p>
        <button
          onClick={handleStartSession}
          className="px-8 py-4 bg-white text-indigo-900 font-bold rounded-xl hover:bg-indigo-50 transition-all shadow-xl shadow-white/10 flex items-center gap-3 active:scale-95"
        >
          <i className="fas fa-sparkles text-indigo-500"></i>
          Analyze Bet
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
      {/* Council Header */}
      <header className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <i className="fas fa-gavel text-white text-xs"></i>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-widest">The Strategic Council</h3>
            <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-tighter">Active Strategy Coach</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[10px] font-bold text-slate-500 uppercase">Consulting Mode</span>
        </div>
      </header>

      {/* Chat Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-slate-900 to-slate-950"
      >
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-5 py-3 shadow-sm ${msg.role === 'user'
              ? 'bg-indigo-600 text-white rounded-br-none'
              : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-none'
              }`}>
              {msg.role === 'model' && (
                <div className="flex items-center gap-1.5 mb-1.5 opacity-50">
                  <i className="fas fa-sparkles text-[10px] text-indigo-400"></i>
                  <span className="text-[9px] font-bold uppercase tracking-widest">Council Wisdom</span>
                </div>
              )}
              <p className="text-sm leading-relaxed font-light whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-bl-none px-5 py-3 flex gap-1">
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce delay-75"></span>
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce delay-150"></span>
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce delay-300"></span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-slate-950 border-t border-slate-800">
        <form
          onSubmit={(e) => { e.preventDefault(); handleSendMessage(input); }}
          className="flex gap-3"
        >
          <input
            type="text"
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600"
            placeholder="Respond to the Council's challenge..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-50 transition-all disabled:opacity-50 disabled:grayscale shadow-lg shadow-indigo-600/20 active:scale-95"
          >
            <i className="fas fa-paper-plane text-sm"></i>
          </button>
        </form>
        <div className="mt-2 flex justify-center">
          <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Stress-testing mode active. Expect direct feedback.</p>
        </div>
      </div>
    </div>
  );
};

export default StrategicCouncil;
