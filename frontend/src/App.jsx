import { useState, useEffect, useRef } from 'react';
import PokeDreamIntro from './components/PokeDreamIntro';
import PokemonGenerator from './components/PokemonGenerator';
import Pokedex from './components/Pokedex';
import PokemonDetail from './components/PokemonDetail';
import TrainerProfile from './components/TrainerProfile';

export default function App() {
  // Load saved trainer name from localStorage
  const [currentPage, setCurrentPage] = useState(() => {
    const savedName = localStorage.getItem('pokedream_trainer_name');
    return savedName ? 'generator' : 'intro';
  });
  const [trainerName, setTrainerName] = useState(() => {
    return localStorage.getItem('pokedream_trainer_name') || 'Trainer';
  });
  const [selectedDexNumber, setSelectedDexNumber] = useState(null);
  
  // Active time tracking
  const [activeTime, setActiveTime] = useState(() => {
    const saved = localStorage.getItem('pokedream_active_time');
    return saved ? parseInt(saved, 10) : 0;
  });
  const isActiveRef = useRef(true);
  
  // Track active time only when page is visible
  useEffect(() => {
    const interval = setInterval(() => {
      if (isActiveRef.current && document.visibilityState === 'visible') {
        setActiveTime(prev => {
          const newTime = prev + 1;
          localStorage.setItem('pokedream_active_time', newTime.toString());
          return newTime;
        });
      }
    }, 1000); // Count every second
    
    const handleVisibilityChange = () => {
      isActiveRef.current = document.visibilityState === 'visible';
    };
    
    const handleFocus = () => { isActiveRef.current = true; };
    const handleBlur = () => { isActiveRef.current = false; };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

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
  
  const handleChangeName = () => {
    // Clear saved name and go to intro
    localStorage.removeItem('pokedream_trainer_name');
    setCurrentPage('intro');
  };

  // Intro
  if (currentPage === 'intro') {
    return <PokeDreamIntro onComplete={handleIntroComplete} />;
  }

  // Pokemon Detail
  if (currentPage === 'pokemon' && selectedDexNumber) {
    return (
      <PokemonDetail 
        dexNumber={selectedDexNumber} 
        onNavigate={handleNavigate}
      />
    );
  }

  // Pokedex
  if (currentPage === 'pokedex') {
    return <Pokedex onNavigate={handleNavigate} />;
  }

  // Trainer Profile
  if (currentPage === 'profile') {
    return (
      <TrainerProfile 
        trainerName={trainerName} 
        activeTime={activeTime}
        onNavigate={handleNavigate}
        onChangeName={handleChangeName}
      />
    );
  }

  // Generator (default after intro)
  return (
    <div className="min-h-screen bg-gray-950">
      {/* Nav */}
      <nav className="bg-gray-900 border-b border-gray-800 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => handleNavigate('generator')}
            className="text-xl font-bold text-white hover:text-amber-400 transition-all"
          >
            🔴 PokéDream
          </button>
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleNavigate('pokedex')}
              className="text-gray-400 hover:text-white transition-all"
            >
              Pokédex
            </button>
            <span className="text-gray-600">|</span>
            <button
              onClick={() => handleNavigate('profile')}
              className="text-amber-400 hover:text-amber-300 transition-all font-medium"
            >
              {trainerName}
            </button>
          </div>
        </div>
      </nav>
      
      <PokemonGenerator 
        trainerName={trainerName} 
        onNavigate={handleNavigate}
      />
    </div>
  );
}