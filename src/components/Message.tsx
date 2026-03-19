import React from 'react';
import { User, Bot } from 'lucide-react';
import { cn } from '../lib/utils';

export interface MessageProps {
  role: 'user' | 'assistant';
  content: string;
}

export const Message: React.FC<MessageProps> = ({ role, content }) => {
  const isUser = role === 'user';

  return (
    <div className={cn(
      "flex w-full mb-4 gap-3",
      isUser ? "flex-row-reverse" : "flex-row"
    )}>
      {/* Avatar */}
      <div className={cn(
        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-lg",
        isUser ? "bg-emerald-500 text-white" : "bg-slate-700 text-emerald-400"
      )}>
        {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
      </div>

      {/* Content Bubble */}
      <div className={cn(
        "max-w-[80%] px-4 py-2 rounded-2xl text-sm md:text-base leading-relaxed shadow-sm",
        isUser 
          ? "bg-emerald-600 text-white rounded-tr-none" 
          : "bg-white/10 text-slate-200 border border-white/5 rounded-tl-none"
      )}>
        {content}
      </div>
    </div>
  );
};
