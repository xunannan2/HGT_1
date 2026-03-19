import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { HelpCircle, Play, Info, Sparkles, Turtle, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { stories, Difficulty } from '../stories';
import { GameCard } from './GameCard';
import { cn } from '../lib/utils';

const difficulties: (Difficulty | '全部')[] = ['全部', '简单', '中等', '困难', '极难'];

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  color: string;
}

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  pulse: number;
}

export const LandingPage: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const targetMousePos = useRef({ x: 0, y: 0 });
  const smoothedMousePos = useRef({ x: 0, y: 0 });
  const navigate = useNavigate();
  const [showStories, setShowStories] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | '全部'>('全部');

  const filteredStories = stories.filter(story => 
    selectedDifficulty === '全部' || story.difficulty === selectedDifficulty
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    let stars: Star[] = [];
    const particleCount = 80;
    const starCount = 200;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars();
    };

    const initStars = () => {
      stars = [];
      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2,
          opacity: Math.random(),
          pulse: Math.random() * 0.02,
        });
      }
    };

    const createParticle = (x: number, y: number) => {
      const colors = ['#4ade80', '#22c55e', '#16a34a', '#86efac'];
      return {
        x,
        y,
        size: Math.random() * 5 + 2,
        speedX: (Math.random() - 0.5) * 3,
        speedY: (Math.random() - 0.5) * 3,
        opacity: 1,
        color: colors[Math.floor(Math.random() * colors.length)],
      };
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      smoothedMousePos.current.x += (targetMousePos.current.x - smoothedMousePos.current.x) * 0.05;
      smoothedMousePos.current.y += (targetMousePos.current.y - smoothedMousePos.current.y) * 0.05;

      const mx = smoothedMousePos.current.x;
      const my = smoothedMousePos.current.y;

      stars.forEach((star) => {
        star.opacity += star.pulse;
        if (star.opacity > 1 || star.opacity < 0.2) star.pulse *= -1;
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity * 0.6})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();

        const dx = star.x - mx;
        const dy = star.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200) {
          ctx.strokeStyle = `rgba(52, 211, 153, ${(1 - dist / 200) * 0.4})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(star.x, star.y);
          ctx.lineTo(mx, my);
          ctx.stroke();
        }
      });

      if (particles.length < particleCount) {
        particles.push(createParticle(mx, my));
      }

      particles.forEach((p, index) => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.opacity -= 0.015;
        if (p.opacity <= 0) {
          particles.splice(index, 1);
        } else {
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.opacity;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    resize();
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    targetMousePos.current = { x: clientX, y: clientY };
  };

  const rules = [
    {
      icon: <HelpCircle className="w-5 h-5 md:w-6 md:h-6 text-emerald-400" />,
      title: "提出疑问",
      desc: "AI会给出一个离奇的故事片段，你需要通过提问来揭开真相。"
    },
    {
      icon: <Info className="w-5 h-5 md:w-6 md:h-6 text-emerald-400" />,
      title: "限定回答",
      desc: "AI只会回答：'是'、'不是'、'与此无关'或'无法回答'。"
    },
    {
      icon: <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-emerald-400" />,
      title: "揭开真相",
      desc: "运用逻辑推理，还原出完整的故事背景，即为胜利。"
    }
  ];

  return (
    <div 
      className="relative min-h-screen w-full bg-[#020617] overflow-hidden flex flex-col items-center font-sans text-slate-200"
      onMouseMove={handleMouseMove}
      onTouchMove={handleMouseMove}
    >
      <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />
      
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-emerald-900/20 via-transparent to-black/40" />
      </div>

      <main className="relative z-10 max-w-6xl w-full px-4 md:px-6 py-8 md:py-12 flex flex-col items-center text-center">
        {!showStories ? (
          <>
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 md:mb-12"
            >
              <div className="flex flex-col items-center">
                <Turtle className="w-12 h-12 md:w-16 md:h-16 text-emerald-400 mb-2 md:mb-4" />
                <h1 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-emerald-300 via-emerald-500 to-emerald-900">
                  AI海龟汤
                </h1>
                <p className="mt-2 md:mt-4 text-emerald-400/60 font-mono tracking-widest uppercase text-[10px] md:text-sm">
                  — 逻辑与直觉的终极对决 —
                </p>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 w-full max-w-4xl mb-8 md:mb-12">
              {rules.map((rule, idx) => (
                <div key={idx} className="p-4 md:p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                  <div className="mb-2 md:mb-4 flex justify-center">{rule.icon}</div>
                  <h3 className="text-base md:text-lg font-bold mb-1 md:mb-2 text-emerald-100">{rule.title}</h3>
                  <p className="text-[10px] md:text-xs text-slate-400 leading-relaxed">{rule.desc}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowStories(true)}
              className="px-8 md:px-12 py-4 md:py-5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-lg md:text-xl rounded-full transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-3 active:scale-95"
            >
              <Play className="w-5 h-5 md:w-6 md:h-6 fill-current" />
              <span>开始游戏</span>
            </button>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full"
          >
            <div className="flex flex-col items-center mb-8 md:mb-12 w-full max-w-5xl mx-auto">
              <div className="flex items-center justify-between w-full mb-6">
                <h2 className="text-2xl md:text-4xl font-bold text-white">选择一个剧本</h2>
                <button 
                  onClick={() => setShowStories(false)}
                  className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all text-sm"
                >
                  返回
                </button>
              </div>

              {/* Difficulty Filter */}
              <div className="flex flex-wrap justify-center gap-2 md:gap-3">
                {difficulties.map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setSelectedDifficulty(diff)}
                    className={cn(
                      "px-4 py-1.5 md:px-6 md:py-2 rounded-full text-xs md:text-sm font-medium transition-all border",
                      selectedDifficulty === diff
                        ? "bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20"
                        : "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 w-full max-w-5xl mx-auto">
              {filteredStories.map((story) => (
                <GameCard 
                  key={story.id} 
                  story={story} 
                  onClick={() => navigate(`/game/${story.id}`)}
                />
              ))}
            </div>
          </motion.div>
        )}

        <div className="mt-12 flex items-center gap-2 text-xs font-mono opacity-40">
          <BookOpen className="w-3 h-3" />
          <span>VERSION 1.0.5 // SYSTEM_READY</span>
        </div>
      </main>

      <div className="fixed inset-0 pointer-events-none z-50 border-[10px] md:border-[40px] border-black/10 mix-blend-overlay" />
    </div>
  );
};
