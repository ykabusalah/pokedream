import { useState, useEffect } from 'react';

export default function ShinyPopup({ pokemon, onContinue }) {
  const [sparkles, setSparkles] = useState([]);
  
  // Generate random sparkles
  useEffect(() => {
    const newSparkles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 2,
      size: 4 + Math.random() * 8,
      duration: 1 + Math.random() * 2,
    }));
    setSparkles(newSparkles);
  }, []);

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      {/* Sparkles background */}
      {sparkles.map(sparkle => (
        <div
          key={sparkle.id}
          className="absolute text-yellow-300"
          style={{
            left: `${sparkle.left}%`,
            top: `${sparkle.top}%`,
            fontSize: `${sparkle.size}px`,
            animation: `sparkle ${sparkle.duration}s ease-in-out infinite`,
            animationDelay: `${sparkle.delay}s`,
          }}
        >
          ✦
        </div>
      ))}
      
      {/* Main popup */}
      <div 
        className="relative bg-gradient-to-b from-yellow-900 via-amber-950 to-yellow-900 rounded-2xl p-8 max-w-md w-full text-center"
        style={{ 
          border: '4px solid #fbbf24',
          boxShadow: '0 0 60px rgba(251, 191, 36, 0.5), inset 0 0 30px rgba(251, 191, 36, 0.1)'
        }}
      >
        {/* Stars decoration */}
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-4xl">
          ✨
        </div>
        
        {/* Title */}
        <h2 
          className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-300 mb-4"
          style={{ animation: 'shimmer 2s ease-in-out infinite' }}
        >
          SHINY POKÉMON!
        </h2>
        
        {/* Pokemon name */}
        <div className="text-xl text-amber-300 font-bold mb-4">
          {pokemon?.name}
        </div>
        
        {/* Blaine message */}
        <div className="bg-black/30 rounded-xl p-4 mb-6">
          <p className="text-amber-100 text-lg mb-2">
            Oh my stars! A SHINY Pokémon!
          </p>
          <p className="text-amber-200/70 text-sm">
            The chances of this were 1 in 4,096!
          </p>
          <p className="text-amber-200/70 text-sm mt-1">
            Congratulations, trainer! 🎊
          </p>
        </div>
        
        {/* Fun fact */}
        <p className="text-amber-400/60 text-xs mb-6">
          Only ~0.024% of Pokémon are shiny. You're incredibly lucky!
        </p>
        
        {/* Buttons */}
        <div className="flex gap-3 justify-center">
          <button 
            onClick={onContinue}
            className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-lg transition-all"
            style={{ boxShadow: '0 0 20px rgba(251, 191, 36, 0.3)' }}
          >
            Amazing! ✨
          </button>
        </div>
      </div>
      
      <style>{`
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0.5) rotate(0deg); }
          50% { opacity: 1; transform: scale(1) rotate(180deg); }
        }
        @keyframes shimmer {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(1.3); }
        }
      `}</style>
    </div>
  );
}