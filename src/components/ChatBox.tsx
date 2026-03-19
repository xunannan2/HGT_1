import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { Message, MessageProps } from './Message';
import { askAI } from '../api';
import { Story } from '../stories';

interface ChatBoxProps {
  initialMessage?: string;
  story: Story;
}

export const ChatBox: React.FC<ChatBoxProps> = ({ initialMessage, story }) => {
  const [messages, setMessages] = useState<MessageProps[]>(
    initialMessage ? [{ role: 'assistant', content: initialMessage }] : []
  );
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const question = inputValue.trim();
    // Add user message
    const userMessage: MessageProps = { role: 'user', content: question };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await askAI(question, story);
      const aiResponse: MessageProps = { 
        role: 'assistant', 
        content: response 
      };
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      const errorMessage: MessageProps = {
        role: 'assistant',
        content: error instanceof Error ? error.message : "AI 助手暂时无法响应，请稍后再试。"
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white/5 rounded-2xl md:rounded-3xl border border-white/10 overflow-hidden backdrop-blur-xl">
      {/* Messages Area */}
      <div className="flex-grow overflow-y-auto p-4 md:p-6 space-y-2 scrollbar-thin scrollbar-thumb-white/10">
        {messages.map((msg, idx) => (
          <Message key={idx} role={msg.role} content={msg.content} />
        ))}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex justify-start"
          >
            <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-none px-4 py-2 text-slate-400 text-sm flex items-center gap-2">
              <Loader2 className="w-3 h-3 animate-spin" />
              思考中...
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-black/20 border-t border-white/10">
        <div className="relative flex items-center gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入你的问题（如：他是自杀吗？）..."
            className="flex-grow bg-white/5 border border-white/10 rounded-full px-5 py-3 text-sm md:text-base text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
            className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-full flex items-center justify-center text-white transition-all active:scale-95 shadow-lg shadow-emerald-600/20"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
        <p className="mt-2 text-[10px] text-slate-500 text-center">
          按 Enter 发送，Shift + Enter 换行
        </p>
      </div>
    </div>
  );
};
