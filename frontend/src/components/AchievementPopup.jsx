import { useState, useEffect } from 'react';

export default function AchievementPopup({ achievement, onClose }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    if (achievement) {
      // Trigger enter animation
      setTimeout(() => setIsVisible(true), 50);
      
      // Auto-dismiss after 4 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 4000);
      
      return () => clearTimeout(timer);
    }
  }, [achievement]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsLeaving(false);
      onClose?.();
    }, 300);
  };

  if (!achievement) return null;

  return (
    <div 
      className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300 ${
        isVisible && !isLeaving 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 -translate-y-4'
      }`}
    >
      <div 
        className="relative bg-gradient-to-r from-amber-600 to-yellow-500 rounded-2xl p-1 shadow-2xl shadow-amber-500/30"
        onClick={handleClose}
      >
        {/* Sparkle effects */}
        <div className="absolute -inset-2 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-yellow-300 rounded-full animate-ping"
              style={{
                left: `${10 + Math.random() * 80}%`,
                top: `${10 + Math.random() * 80}%`,
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: '1s'
              }}
            />
          ))}
        </div>
        
        <div className="bg-gray-900 rounded-xl px-6 py-4 flex items-center gap-4 min-w-[300px]">
          {/* Icon */}
          <div className="text-4xl animate-bounce">
            {achievement.icon}
          </div>
          
          {/* Content */}
          <div className="flex-1">
            <div className="text-xs text-amber-400 font-bold uppercase tracking-wider mb-1">
              🎉 Achievement Unlocked!
            </div>
            <div className="text-white font-bold text-lg">
              {achievement.title}
            </div>
            <div className="text-gray-400 text-sm">
              {achievement.desc}
            </div>
          </div>
          
          {/* Close hint */}
          <div className="text-gray-600 text-xs">
            tap to close
          </div>
        </div>
      </div>
    </div>
  );
}

// Achievement definitions - export for use in other components
export const ACHIEVEMENTS = [
  // Creation milestones
  { id: 'first', icon: '🥚', title: 'First Steps', desc: 'Create your first Pokémon', check: s => s.total >= 1 },
  { id: 'five', icon: '⭐', title: 'Budding Trainer', desc: 'Create 5 Pokémon', check: s => s.total >= 5 },
  { id: 'ten', icon: '🏆', title: 'Rising Star', desc: 'Create 10 Pokémon', check: s => s.total >= 10 },
  { id: 'twentyfive', icon: '👑', title: 'Regional Expert', desc: 'Create 25 Pokémon', check: s => s.total >= 25 },
  { id: 'fifty', icon: '🌟', title: 'Pokémon Master', desc: 'Create 50 Pokémon', check: s => s.total >= 50 },
  { id: 'hundred', icon: '💫', title: 'Living Legend', desc: 'Create 100 Pokémon', check: s => s.total >= 100 },
  
  // Shiny achievements
  { id: 'shiny', icon: '✨', title: 'Lucky Find', desc: 'Find a shiny Pokémon', check: s => s.shinies >= 1 },
  { id: 'shiny3', icon: '🔮', title: 'Fortune Favors', desc: 'Find 3 shiny Pokémon', check: s => s.shinies >= 3 },
  { id: 'shiny5', icon: '💎', title: 'Shiny Hunter', desc: 'Find 5 shiny Pokémon', check: s => s.shinies >= 5 },
  { id: 'shiny10', icon: '🌠', title: 'Shiny Collector', desc: 'Find 10 shiny Pokémon', check: s => s.shinies >= 10 },
  
  // Type diversity
  { id: 'types5', icon: '🎨', title: 'Type Explorer', desc: 'Discover 5 different types', check: s => Object.keys(s.type_counts || {}).length >= 5 },
  { id: 'types10', icon: '🎭', title: 'Type Enthusiast', desc: 'Discover 10 different types', check: s => Object.keys(s.type_counts || {}).length >= 10 },
  { id: 'types15', icon: '🎪', title: 'Type Specialist', desc: 'Discover 15 different types', check: s => Object.keys(s.type_counts || {}).length >= 15 },
  { id: 'types18', icon: '🌈', title: 'Type Master', desc: 'Discover all 18 types', check: s => Object.keys(s.type_counts || {}).length >= 18 },
  
  // Type specialists (5+ of one type)
  { id: 'fire_fan', icon: '🔥', title: 'Fire Enthusiast', desc: 'Create 5 Fire-type Pokémon', check: s => (s.type_counts?.Fire || 0) >= 5 },
  { id: 'water_fan', icon: '💧', title: 'Water Enthusiast', desc: 'Create 5 Water-type Pokémon', check: s => (s.type_counts?.Water || 0) >= 5 },
  { id: 'grass_fan', icon: '🌿', title: 'Grass Enthusiast', desc: 'Create 5 Grass-type Pokémon', check: s => (s.type_counts?.Grass || 0) >= 5 },
  { id: 'dragon_fan', icon: '🐲', title: 'Dragon Tamer', desc: 'Create 5 Dragon-type Pokémon', check: s => (s.type_counts?.Dragon || 0) >= 5 },
  { id: 'ghost_fan', icon: '👻', title: 'Ghost Whisperer', desc: 'Create 5 Ghost-type Pokémon', check: s => (s.type_counts?.Ghost || 0) >= 5 },
  { id: 'psychic_fan', icon: '🔮', title: 'Mind Bender', desc: 'Create 5 Psychic-type Pokémon', check: s => (s.type_counts?.Psychic || 0) >= 5 },
];

// Helper function to check for newly unlocked achievements
export function checkNewAchievements(previousStats, currentStats) {
  const newlyUnlocked = [];
  
  for (const achievement of ACHIEVEMENTS) {
    const wasUnlocked = previousStats && achievement.check(previousStats);
    const isNowUnlocked = currentStats && achievement.check(currentStats);
    
    if (!wasUnlocked && isNowUnlocked) {
      newlyUnlocked.push(achievement);
    }
  }
  
  return newlyUnlocked;
}