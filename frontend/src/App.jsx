import { useState, useEffect } from 'react';
import PokeDreamIntro from './components/PokeDreamIntro';
import PokemonGenerator from './components/PokemonGenerator';
import Pokedex from './components/Pokedex';
import PokemonDetail from './components/PokemonDetail';
import TrainerProfile from './components/TrainerProfile';
import Tournament from './components/Tournament';
import HallOfFame from './components/HallOfFame';
import AchievementPopup, { ACHIEVEMENTS, checkNewAchievements } from './components/AchievementPopup';

const API_URL = 'http://localhost:8000';

// ============================================
// TIME TRACKING HELPERS
// ============================================

const getTotalTimeSpent = () => {
  return parseInt(localStorage.getItem('pokedream_total_time_seconds') || '0', 10);
};

const saveTotalTime = (seconds) => {
  localStorage.setItem('pokedream_total_time_seconds', seconds.toString());
};

// ============================================
// TRAINER ID HELPERS
// ============================================

const getOrCreateTrainerId = () => {
  let trainerId = localStorage.getItem('pokedream_trainer_id');
  if (!trainerId) {
    // Generate a unique ID (timestamp + random)
    trainerId = `trainer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('pokedream_trainer_id', trainerId);
  }
  return trainerId;
};

// ============================================
// ACHIEVEMENT TRACKING HELPERS
// ============================================

const getUnlockedAchievements = () => {
  const saved = localStorage.getItem('pokedream_unlocked_achievements');
  return saved ? JSON.parse(saved) : [];
};

const saveUnlockedAchievements = (achievementIds) => {
  localStorage.setItem('pokedream_unlocked_achievements', JSON.stringify(achievementIds));
};

// ============================================
// POKEBALL LOGO COMPONENT
// ============================================

const PokeballLogo = ({ size = 32 }) => (
  <svg viewBox="0 0 100 100" width={size} height={size} className="drop-shadow-lg">
    <path 
      d="M 50 5 A 45 45 0 0 1 95 50 L 65 50 A 15 15 0 0 0 35 50 L 5 50 A 45 45 0 0 1 50 5" 
      fill="#DC2626"
      stroke="#1a1a1a"
      strokeWidth="3"
    />
    <path 
      d="M 50 95 A 45 45 0 0 1 5 50 L 35 50 A 15 15 0 0 0 65 50 L 95 50 A 45 45 0 0 1 50 95" 
      fill="#F5F5F5"
      stroke="#1a1a1a"
      strokeWidth="3"
    />
    <rect x="5" y="46" width="90" height="8" fill="#1a1a1a"/>
    <circle cx="50" cy="50" r="14" fill="#F5F5F5" stroke="#1a1a1a" strokeWidth="3"/>
    <circle cx="50" cy="50" r="8" fill="#1a1a1a"/>
    <ellipse cx="35" cy="30" rx="8" ry="5" fill="white" opacity="0.3" transform="rotate(-30 35 30)"/>
  </svg>
);

// ============================================
// NAV LINK COMPONENT
// ============================================

const NavLink = ({ onClick, active, children }) => (
  <button
    onClick={onClick}
    className={`
      px-4 py-2 rounded-lg font-medium transition-all duration-200
      ${active 
        ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
        : 'text-gray-400 hover:text-white hover:bg-gray-800'
      }
    `}
  >
    {children}
  </button>
);

// ============================================
// MAIN NAVIGATION BAR
// ============================================

const NavBar = ({ currentPage, trainerName, onNavigate }) => (
  <nav className="sticky top-0 z-50 bg-gray-950/95 backdrop-blur-sm border-b border-gray-800">
    <div className="h-1 bg-gradient-to-r from-red-600 via-red-500 to-red-600"/>
    
    <div className="max-w-6xl mx-auto px-4">
      <div className="flex items-center justify-between h-16">
        <button
          onClick={() => onNavigate('generator')}
          className="flex items-center gap-3 group"
        >
          <div className="transition-transform group-hover:rotate-12 group-hover:scale-110">
            <PokeballLogo size={36} />
          </div>
          <div className="flex flex-col items-start">
            <span className="text-xl font-bold text-white tracking-tight">
              Poké<span className="text-red-500">Dream</span>
            </span>
            <span className="text-[10px] text-gray-500 -mt-1 tracking-widest uppercase">
              Oneira Region
            </span>
          </div>
        </button>
        
        <div className="hidden sm:flex items-center gap-2">
          <NavLink 
            onClick={() => onNavigate('generator')} 
            active={currentPage === 'generator'}
          >
            ⚡ Generator
          </NavLink>
          <NavLink 
            onClick={() => onNavigate('pokedex')} 
            active={currentPage === 'pokedex'}
          >
            📖 Pokédex
          </NavLink>
          <NavLink 
            onClick={() => onNavigate('tournament')} 
            active={currentPage === 'tournament'}
          >
            🏆 Tournament
          </NavLink>
          <NavLink 
            onClick={() => onNavigate('hall-of-fame')} 
            active={currentPage === 'hall-of-fame'}
          >
            🏛️ Hall of Fame
          </NavLink>
        </div>
        
        <button
          onClick={() => onNavigate('profile')}
          className={`
            flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-200
            ${currentPage === 'profile'
              ? 'bg-amber-500/20 border border-amber-500/30'
              : 'hover:bg-gray-800 border border-transparent'
            }
          `}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
            {trainerName?.charAt(0)?.toUpperCase() || 'T'}
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-sm font-medium text-white">{trainerName}</div>
            <div className="text-xs text-gray-500">Trainer</div>
          </div>
        </button>
      </div>
    </div>
    
    <div className="sm:hidden flex justify-center gap-2 pb-3 px-2">
      <NavLink 
        onClick={() => onNavigate('generator')} 
        active={currentPage === 'generator'}
      >
        ⚡
      </NavLink>
      <NavLink 
        onClick={() => onNavigate('pokedex')} 
        active={currentPage === 'pokedex'}
      >
        📖
      </NavLink>
      <NavLink 
        onClick={() => onNavigate('tournament')} 
        active={currentPage === 'tournament'}
      >
        🏆
      </NavLink>
      <NavLink 
        onClick={() => onNavigate('hall-of-fame')} 
        active={currentPage === 'hall-of-fame'}
      >
        🏛️
      </NavLink>
    </div>
  </nav>
);

// ============================================
// MAIN APP COMPONENT
// ============================================

export default function App() {
  const [savedTrainerName] = useState(() => {
    return localStorage.getItem('pokedream_trainer_name') || null;
  });
  
  const [currentPage, setCurrentPage] = useState('intro');
  
  const [trainerName, setTrainerName] = useState(() => {
    return localStorage.getItem('pokedream_trainer_name') || 'Trainer';
  });
  
  // Unique trainer ID for tracking personal stats
  const [trainerId] = useState(() => getOrCreateTrainerId());
  
  const [selectedDexNumber, setSelectedDexNumber] = useState(null);

  // ============================================
  // GLOBAL TIME TRACKING
  // ============================================
  
  const [sessionStart] = useState(() => Date.now());
  const [activeSeconds, setActiveSeconds] = useState(0);
  const [previousTotalSeconds] = useState(() => getTotalTimeSpent());

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - sessionStart) / 1000);
      setActiveSeconds(elapsed);
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionStart]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      const finalActiveSeconds = Math.floor((Date.now() - sessionStart) / 1000);
      const newTotal = previousTotalSeconds + finalActiveSeconds;
      saveTotalTime(newTotal);
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [sessionStart, previousTotalSeconds]);

  useEffect(() => {
    const interval = setInterval(() => {
      const currentActiveSeconds = Math.floor((Date.now() - sessionStart) / 1000);
      const newTotal = previousTotalSeconds + currentActiveSeconds;
      saveTotalTime(newTotal);
    }, 60000);
    return () => clearInterval(interval);
  }, [sessionStart, previousTotalSeconds]);

  const totalSeconds = previousTotalSeconds + activeSeconds;

  // ============================================
  // ACHIEVEMENT TRACKING
  // ============================================
  
  const [achievementQueue, setAchievementQueue] = useState([]);
  const [currentAchievement, setCurrentAchievement] = useState(null);
  const [unlockedAchievementIds, setUnlockedAchievementIds] = useState(() => getUnlockedAchievements());

  // Process achievement queue - show one at a time
  useEffect(() => {
    if (!currentAchievement && achievementQueue.length > 0) {
      setCurrentAchievement(achievementQueue[0]);
      setAchievementQueue(prev => prev.slice(1));
    }
  }, [achievementQueue, currentAchievement]);

  // Check for new achievements based on current stats
  const checkAchievementsFromStats = (stats) => {
    if (!stats) return;
    
    const newlyUnlocked = [];
    
    for (const achievement of ACHIEVEMENTS) {
      const isUnlocked = achievement.check(stats);
      const wasAlreadyUnlocked = unlockedAchievementIds.includes(achievement.id);
      
      if (isUnlocked && !wasAlreadyUnlocked) {
        newlyUnlocked.push(achievement);
      }
    }
    
    if (newlyUnlocked.length > 0) {
      // Update unlocked list
      const newUnlockedIds = [
        ...unlockedAchievementIds,
        ...newlyUnlocked.map(a => a.id)
      ];
      setUnlockedAchievementIds(newUnlockedIds);
      saveUnlockedAchievements(newUnlockedIds);
      
      // Queue the popups
      setAchievementQueue(prev => [...prev, ...newlyUnlocked]);
    }
  };

  // Called after Pokemon creation to check achievements
  const handlePokemonCreated = async () => {
    try {
      // Fetch trainer-specific stats
      const res = await fetch(`${API_URL}/api/trainer/${trainerId}/stats`);
      const stats = await res.json();
      checkAchievementsFromStats(stats);
    } catch (err) {
      console.error('Failed to check achievements:', err);
    }
  };

  const handleAchievementClose = () => {
    setCurrentAchievement(null);
  };

  // ============================================
  // NAVIGATION HANDLERS
  // ============================================

  const handleIntroComplete = (name) => {
    setTrainerName(name);
    localStorage.setItem('pokedream_trainer_name', name);
    setCurrentPage('generator');
  };

  const handleNavigate = (page, data = null) => {
    if (page === 'pokemon' && data) {
      setSelectedDexNumber(data);
    }
    setCurrentPage(page);
  };

  const handleChangeName = (newName) => {
    localStorage.setItem('pokedream_trainer_name', newName);
    setTrainerName(newName);
  };

  // ============================================
  // RENDER
  // ============================================

  // Achievement popup (always rendered, shows when there's an achievement)
  const achievementPopup = (
    <AchievementPopup 
      achievement={currentAchievement} 
      onClose={handleAchievementClose} 
    />
  );

  // Intro
  if (currentPage === 'intro') {
    return (
      <>
        <PokeDreamIntro onComplete={handleIntroComplete} savedTrainerName={savedTrainerName} />
        {achievementPopup}
      </>
    );
  }

  // Pokemon Detail
  if (currentPage === 'pokemon' && selectedDexNumber) {
    return (
      <div className="min-h-screen bg-gray-950">
        <NavBar currentPage={currentPage} trainerName={trainerName} onNavigate={handleNavigate} />
        <PokemonDetail 
          dexNumber={selectedDexNumber} 
          onNavigate={handleNavigate}
        />
        {achievementPopup}
      </div>
    );
  }

  // Pokedex
  if (currentPage === 'pokedex') {
    return (
      <div className="min-h-screen bg-gray-950">
        <NavBar currentPage={currentPage} trainerName={trainerName} onNavigate={handleNavigate} />
        <Pokedex onNavigate={handleNavigate} trainerId={trainerId} />
        {achievementPopup}
      </div>
    );
  }

  // Tournament
  if (currentPage === 'tournament') {
    return (
      <div className="min-h-screen bg-gray-950">
        <NavBar currentPage={currentPage} trainerName={trainerName} onNavigate={handleNavigate} />
        <Tournament trainerId={trainerId} onNavigate={handleNavigate} />
        {achievementPopup}
      </div>
    );
  }

  // Hall of Fame
  if (currentPage === 'hall-of-fame') {
    return (
      <div className="min-h-screen bg-gray-950">
        <NavBar currentPage={currentPage} trainerName={trainerName} onNavigate={handleNavigate} />
        <HallOfFame trainerId={trainerId} onNavigate={handleNavigate} />
        {achievementPopup}
      </div>
    );
  }

  // Trainer Profile
  if (currentPage === 'profile') {
    return (
      <div className="min-h-screen bg-gray-950">
        <NavBar currentPage={currentPage} trainerName={trainerName} onNavigate={handleNavigate} />
        <TrainerProfile 
          trainerName={trainerName}
          trainerId={trainerId}
          onNavigate={handleNavigate}
          onChangeName={handleChangeName}
          activeSeconds={activeSeconds}
          totalSeconds={totalSeconds}
        />
        {achievementPopup}
      </div>
    );
  }

  // Generator (default)
  return (
    <div className="min-h-screen bg-gray-950">
      <NavBar currentPage={currentPage} trainerName={trainerName} onNavigate={handleNavigate} />
      <PokemonGenerator 
        trainerName={trainerName}
        trainerId={trainerId}
        onNavigate={handleNavigate}
        onPokemonCreated={handlePokemonCreated}
      />
      {achievementPopup}
    </div>
  );
}