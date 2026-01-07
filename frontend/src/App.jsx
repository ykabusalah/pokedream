import { useState, useEffect } from 'react';
import PokeDreamIntro from './components/PokeDreamIntro';
import PokemonGenerator from './components/PokemonGenerator';
import Pokedex from './components/Pokedex';
import PokemonDetail from './components/PokemonDetail';
import TrainerProfile from './components/TrainerProfile';

// ============================================
// TIME TRACKING HELPERS (NEW IN COMMIT 3)
// ============================================

const getTotalTimeSpent = () => {
  return parseInt(localStorage.getItem('pokedream_total_time_seconds') || '0', 10);
};

const saveTotalTime = (seconds) => {
  localStorage.setItem('pokedream_total_time_seconds', seconds.toString());
};

// ============================================
// POKEBALL LOGO COMPONENT
// ============================================

const PokeballLogo = ({ size = 32 }) => (
  <svg viewBox="0 0 100 100" width={size} height={size} className="drop-shadow-lg">
    {/* Top half - red */}
    <path 
      d="M 50 5 A 45 45 0 0 1 95 50 L 65 50 A 15 15 0 0 0 35 50 L 5 50 A 45 45 0 0 1 50 5" 
      fill="#DC2626"
      stroke="#1a1a1a"
      strokeWidth="3"
    />
    {/* Bottom half - white */}
    <path 
      d="M 50 95 A 45 45 0 0 1 5 50 L 35 50 A 15 15 0 0 0 65 50 L 95 50 A 45 45 0 0 1 50 95" 
      fill="#F5F5F5"
      stroke="#1a1a1a"
      strokeWidth="3"
    />
    {/* Center band */}
    <rect x="5" y="46" width="90" height="8" fill="#1a1a1a"/>
    {/* Center button outer */}
    <circle cx="50" cy="50" r="14" fill="#F5F5F5" stroke="#1a1a1a" strokeWidth="3"/>
    {/* Center button inner */}
    <circle cx="50" cy="50" r="8" fill="#1a1a1a"/>
    {/* Shine effect */}
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
    {/* Red accent line at top */}
    <div className="h-1 bg-gradient-to-r from-red-600 via-red-500 to-red-600"/>
    
    <div className="max-w-6xl mx-auto px-4">
      <div className="flex items-center justify-between h-16">
        {/* Logo */}
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
        
        {/* Center Nav Links */}
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
        </div>
        
        {/* Trainer Profile */}
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
          {/* Trainer avatar placeholder */}
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
    
    {/* Mobile nav */}
    <div className="sm:hidden flex justify-center gap-4 pb-3 px-4">
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
    </div>
  </nav>
);

// ============================================
// MAIN APP COMPONENT
// ============================================

export default function App() {
  // Check if returning user (has saved name)
  const [savedTrainerName] = useState(() => {
    return localStorage.getItem('pokedream_trainer_name') || null;
  });
  
  // Always start with intro (but returning users get short welcome back)
  const [currentPage, setCurrentPage] = useState('intro');
  
  const [trainerName, setTrainerName] = useState(() => {
    return localStorage.getItem('pokedream_trainer_name') || 'Trainer';
  });
  
  const [selectedDexNumber, setSelectedDexNumber] = useState(null);

  // ============================================
  // GLOBAL TIME TRACKING (NEW IN COMMIT 3)
  // ============================================
  
  // Store the timestamp when the app first loaded (this session)
  const [sessionStart] = useState(() => Date.now());
  
  // Active time for this visit (updates every second)
  const [activeSeconds, setActiveSeconds] = useState(0);
  
  // Total time from all PREVIOUS sessions (loaded once from localStorage)
  const [previousTotalSeconds] = useState(() => getTotalTimeSpent());

  // Update active time every second
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - sessionStart) / 1000);
      setActiveSeconds(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionStart]);

  // Save time when user leaves the page
  useEffect(() => {
    const handleBeforeUnload = () => {
      const finalActiveSeconds = Math.floor((Date.now() - sessionStart) / 1000);
      const newTotal = previousTotalSeconds + finalActiveSeconds;
      saveTotalTime(newTotal);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [sessionStart, previousTotalSeconds]);

  // Also save periodically (every 60 seconds) in case of crash
  useEffect(() => {
    const interval = setInterval(() => {
      const currentActiveSeconds = Math.floor((Date.now() - sessionStart) / 1000);
      const newTotal = previousTotalSeconds + currentActiveSeconds;
      saveTotalTime(newTotal);
    }, 60000);

    return () => clearInterval(interval);
  }, [sessionStart, previousTotalSeconds]);

  // Calculate total time (previous sessions + current active time)
  const totalSeconds = previousTotalSeconds + activeSeconds;

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
    // Update the name in state and localStorage
    localStorage.setItem('pokedream_trainer_name', newName);
    setTrainerName(newName);
  };

  // ============================================
  // RENDER
  // ============================================

  // Intro (new users get full intro, returning users get welcome back)
  if (currentPage === 'intro') {
    return <PokeDreamIntro onComplete={handleIntroComplete} savedTrainerName={savedTrainerName} />;
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
      </div>
    );
  }

  // Pokedex
  if (currentPage === 'pokedex') {
    return (
      <div className="min-h-screen bg-gray-950">
        <NavBar currentPage={currentPage} trainerName={trainerName} onNavigate={handleNavigate} />
        <Pokedex onNavigate={handleNavigate} />
      </div>
    );
  }

  // Trainer Profile - pass time tracking props
  if (currentPage === 'profile') {
    return (
      <div className="min-h-screen bg-gray-950">
        <NavBar currentPage={currentPage} trainerName={trainerName} onNavigate={handleNavigate} />
        <TrainerProfile 
          trainerName={trainerName} 
          onNavigate={handleNavigate}
          onChangeName={handleChangeName}
          activeSeconds={activeSeconds}
          totalSeconds={totalSeconds}
        />
      </div>
    );
  }

  // Generator (default)
  return (
    <div className="min-h-screen bg-gray-950">
      <NavBar currentPage={currentPage} trainerName={trainerName} onNavigate={handleNavigate} />
      <PokemonGenerator 
        trainerName={trainerName} 
        onNavigate={handleNavigate}
      />
    </div>
  );
}