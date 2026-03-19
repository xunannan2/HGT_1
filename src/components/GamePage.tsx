import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, MessageSquare, Eye, LogOut, X } from 'lucide-react';
import { stories } from '../stories';
import { ChatBox } from './ChatBox';

export const GamePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showTruth, setShowTruth] = useState(false);
  const story = stories.find(s => s.id === id);

  if (!story) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">故事未找到</h1>
          <button 
            onClick={() => navigate('/')}
            className="text-emerald-400 hover:underline"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#020617] text-slate-200 font-sans selection:bg-emerald-500/30 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 bg-[#020617]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 md:px-6 h-14 md:h-16 flex items-center justify-between">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden sm:inline text-sm">返回</span>
          </button>
          <div className="text-emerald-400 font-bold tracking-wider text-sm md:text-base">
            {story.title}
          </div>
          <div className="w-10 sm:w-20" /> {/* Spacer */}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col max-w-5xl w-full mx-auto overflow-hidden">
        {/* Top: Story Surface */}
        <div className="flex-shrink-0 p-4 md:p-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative p-4 md:p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl"
          >
            <div className="absolute -top-2 -left-2 w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <p className="text-sm md:text-lg leading-relaxed text-slate-300 italic">
              “{story.surface}”
            </p>
          </motion.div>
        </div>

        {/* Middle: ChatBox */}
        <div className="flex-grow px-4 md:px-6 pb-4 overflow-hidden">
          <ChatBox 
            story={story}
            initialMessage="我是你的AI助手。你可以向我提问，我会回答：'是'、'否'或'无关'。如果你卡住了，可以输入'提示'来获取线索。" 
          />
        </div>

        {/* Bottom: Action Buttons */}
        <div className="flex-shrink-0 p-4 md:p-6 bg-black/20 border-t border-white/5 flex gap-3 md:gap-4">
          <button 
            onClick={() => setShowTruth(true)}
            className="flex-grow flex items-center justify-center gap-2 py-3 md:py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all active:scale-95"
          >
            <Eye className="w-4 h-4 md:w-5 md:h-5" />
            <span className="text-sm md:text-base font-bold">查看汤底</span>
          </button>
          <button 
            onClick={() => navigate('/')}
            className="flex-grow flex items-center justify-center gap-2 py-3 md:py-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300 transition-all active:scale-95"
          >
            <LogOut className="w-4 h-4 md:w-5 md:h-5" />
            <span className="text-sm md:text-base font-bold">结束游戏</span>
          </button>
        </div>
      </main>

      {/* Truth Modal */}
      <AnimatePresence>
        {showTruth && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative max-w-lg w-full bg-slate-900 border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl"
            >
              <button 
                onClick={() => setShowTruth(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                  <Eye className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-white">汤底 (真相)</h3>
              </div>

              <div className="p-4 md:p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                <p className="text-base md:text-lg leading-relaxed text-emerald-100/90">
                  {story.bottom}
                </p>
              </div>

              <button 
                onClick={() => setShowTruth(false)}
                className="mt-8 w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all"
              >
                我明白了
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
