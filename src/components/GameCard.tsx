import React from 'react';
import { motion } from 'motion/react';
import { ChevronRight, BrainCircuit } from 'lucide-react';
import { Story } from '../stories';
import { cn } from '../lib/utils';

interface GameCardProps {
  story: Story;
  onClick?: () => void;
}

const difficultyColors = {
  '简单': 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  '中等': 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  '困难': 'text-orange-400 bg-orange-400/10 border-orange-400/20',
  '极难': 'text-red-400 bg-red-400/10 border-red-400/20',
};

export const GameCard: React.FC<GameCardProps> = ({ story, onClick }) => {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="group relative cursor-pointer h-full"
    >
      {/* Card Background with Glass Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-white/10 group-hover:border-emerald-500/50 transition-colors duration-500" />
      
      {/* Glow Effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 bg-emerald-500/5 rounded-2xl blur-2xl" />
      </div>

      <div className="relative p-6 flex flex-col h-full">
        <div className="flex justify-between items-start mb-3 md:mb-4">
          <div className={cn(
            "px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-medium border whitespace-nowrap",
            difficultyColors[story.difficulty]
          )}>
            {story.difficulty}
          </div>
          <BrainCircuit className="w-4 h-4 md:w-5 md:h-5 text-slate-500 group-hover:text-emerald-400 transition-colors duration-300" />
        </div>

        <h3 className="text-base md:text-xl font-bold text-white mb-2 md:mb-3 group-hover:text-emerald-300 transition-colors duration-300 line-clamp-1">
          {story.title}
        </h3>

        <p className="text-[11px] md:text-sm text-slate-400 line-clamp-2 md:line-clamp-3 mb-4 md:mb-6 flex-grow leading-relaxed">
          {story.surface}
        </p>

        <div className="flex items-center text-emerald-400 text-xs md:text-sm font-semibold group-hover:translate-x-1 transition-transform duration-300">
          开始探索
          <ChevronRight className="w-4 h-4 ml-1" />
        </div>
      </div>
    </motion.div>
  );
};
