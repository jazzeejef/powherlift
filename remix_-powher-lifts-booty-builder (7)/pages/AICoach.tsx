import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { generateFitnessAdvice } from '../services/geminiService';
import { Send, Sparkles, User, Bot, Heart } from 'lucide-react';
import { storageService } from '../services/storageService';

const AICoach: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Hi gorgeous! 👋 I'm Coach PowHER. I can help you build that booty, tone those arms, or plan healthy meals. What's on your mind?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Hydrate chat messages on mount
  useEffect(() => {
    const hydrateMessages = async () => {
      try {
        const saved = await storageService.getItem<ChatMessage[]>('powher_coach_messages', []);
        if (saved && saved.length > 0) {
          const parsed = saved.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp)
          }));
          setMessages(parsed);
        }
      } catch (e) {
        console.error('Error hydrating coach messages:', e);
      } finally {
        setIsHydrated(true);
      }
    };
    hydrateMessages();
  }, []);

  // Sync messages back to storage
  useEffect(() => {
    if (isHydrated) {
      storageService.setItem('powher_coach_messages', messages);
    }
  }, [messages, isHydrated]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await generateFitnessAdvice(userMsg.text);
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      // Error handling is managed inside generateFitnessAdvice mostly, but fallback here
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col bg-white rounded-[2.5rem] shadow-2xl shadow-purple-200/50 overflow-hidden border border-pink-100">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 p-6 flex items-center gap-4 text-white relative overflow-hidden">
         <div className="absolute top-0 right-0 p-8 opacity-10">
            <Heart className="w-32 h-32" />
         </div>
         <div className="bg-white/20 p-3.5 rounded-2xl backdrop-blur-md border border-white/20 shadow-lg">
            <Sparkles className="w-6 h-6 text-white" />
         </div>
         <div className="relative z-10">
            <h2 className="text-xl font-black tracking-tight">Coach PowHER</h2>
            <p className="text-pink-100 text-xs font-bold opacity-90 tracking-wide uppercase">AI Personal Trainer</p>
         </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
         {messages.map((msg) => (
           <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-fade-in`}>
              <div className={`
                 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm border
                 ${msg.role === 'user' ? 'bg-slate-200 border-slate-300' : 'bg-pink-100 border-pink-200'}
              `}>
                {msg.role === 'user' ? <User className="w-5 h-5 text-slate-500" /> : <Bot className="w-5 h-5 text-pink-500" />}
              </div>
              <div className={`
                 max-w-[80%] p-5 rounded-3xl shadow-sm text-sm font-medium leading-relaxed whitespace-pre-wrap relative
                 ${msg.role === 'user' 
                   ? 'bg-gradient-to-br from-slate-700 to-slate-900 text-white rounded-tr-none' 
                   : 'bg-white text-slate-700 border border-pink-50 rounded-tl-none'}
              `}>
                {msg.text}
              </div>
           </div>
         ))}
         {isLoading && (
            <div className="flex gap-4">
               <div className="w-10 h-10 rounded-full bg-pink-100 text-pink-500 border border-pink-200 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5" />
               </div>
               <div className="bg-white border border-pink-50 px-6 py-4 rounded-3xl rounded-tl-none shadow-sm flex items-center gap-2">
                  <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
               </div>
            </div>
         )}
         <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-5 bg-white border-t border-pink-50">
         <form onSubmit={handleSend} className="flex gap-3 relative">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask for a glute workout... 🍑" 
              className="flex-1 bg-slate-50 text-slate-800 placeholder-slate-400 font-bold rounded-2xl px-6 py-4 focus:outline-none focus:ring-4 focus:ring-pink-100 focus:bg-white transition-all border border-slate-100"
            />
            <button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              className="bg-gradient-to-br from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white p-4 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-pink-200 transform hover:scale-105 active:scale-95"
            >
               <Send className="w-5 h-5" />
            </button>
         </form>
      </div>
    </div>
  );
};

export default AICoach;