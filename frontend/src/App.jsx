import { useState, useEffect, useRef } from 'react';
import PokeDreamIntro from './components/PokeDreamIntro';
import PokemonGenerator from './components/PokemonGenerator';
import Pokedex from './components/Pokedex';
import PokemonDetail from './components/PokemonDetail';
import TrainerProfile from './components/TrainerProfile';
import Leaderboard from './components/Leaderboard';

const API_URL = 'http://localhost:8000';

export default function App() {
  // Load saved trainer from localStorage
  const [savedTrainerName] = useState(() => {
    return localStorage.getItem('pokedream_trainer_name') || null;
  });
  const [currentPage, setCurrentPage] = useState('intro');
  const [trainerName, setTrainerName] = useState(() => {
    return localStorage.getItem('pokedream_trainer_name') || 'Trainer';
  });
  const [trainerId, setTrainerId] = useState(() => {
    return localStorage.getItem('pokedream_trainer_id') || null;
  });
  const [selectedDexNumber, setSelectedDexNumber] = useState(null);
  
  // Active time tracking - sync to backend periodically
  const activeTimeRef = useRef(0);
  const lastSyncRef = useRef(Date.now());
  const isActiveRef = useRef(true);
  
  // Track active time and sync to backend every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (isActiveRef.current && document.visibilityState === 'visible') {
        activeTimeRef.current += 1;
        
        // Sync to backend every 60 seconds
        const now = Date.now();
        if (trainerId && now - lastSyncRef.current >= 60000) {
          syncActiveTime();
          lastSyncRef.current = now;
        }
      }
    }, 1000);
    
    const handleVisibilityChange = () => {
      isActiveRef.current = document.visibilityState === 'visible';
      // Sync when leaving page
      if (!isActiveRef.current && trainerId && activeTimeRef.current > 0) {
        syncActiveTime();
      }
    };
    
    const handleBeforeUnload = () => {
      // Final sync when closing
      if (trainerId && activeTimeRef.current > 0) {
        // Use sendBeacon for reliable delivery
        navigator.sendBeacon(
          `${API_URL}/api/trainer/active-time`,
          JSON.stringify({ trainer_id: trainerId, seconds: activeTimeRef.current })
        );
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [trainerId]);
  
  const syncActiveTime = async () => {
    if (!trainerId || activeTimeRef.current === 0) return;
    
    try {
      await fetch(`${API_URL}/api/trainer/active-time`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trainer_id: trainerId, seconds: activeTimeRef.current })
      });
      activeTimeRef.current = 0; // Reset after sync
    } catch (err) {
      console.error('Failed to sync active time:', err);
    }
  };

  const handleIntroComplete = async (name) => {
    setTrainerName(name);
    localStorage.setItem('pokedream_trainer_name', name);
    
    // Register trainer with backend
    try {
      const res = await fetch(`${API_URL}/api/trainer/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      
      if (res.ok) {
        const data = await res.json();
        setTrainerId(data.trainer.id);
        localStorage.setItem('pokedream_trainer_id', data.trainer.id);
      }
    } catch (err) {
      console.error('Failed to register trainer:', err);
    }
    
    setCurrentPage('generator');
  };

  const handleNavigate = (page, data = null) => {
    if (page === 'pokemon' && data) {
      setSelectedDexNumber(data);
    }
    setCurrentPage(page);
  };
  
  const handleChangeName = () => {
    localStorage.removeItem('pokedream_trainer_name');
    localStorage.removeItem('pokedream_trainer_id');
    setTrainerId(null);
    setCurrentPage('intro');
  };

  // Intro
  if (currentPage === 'intro') {
    return <PokeDreamIntro onComplete={handleIntroComplete} savedTrainerName={savedTrainerName} />;
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
    return <Pokedex onNavigate={handleNavigate} trainerId={trainerId} />;
  }

  // Trainer Profile
  if (currentPage === 'profile') {
    return (
      <TrainerProfile 
        trainerName={trainerName}
        trainerId={trainerId}
        onNavigate={handleNavigate}
        onChangeName={handleChangeName}
      />
    );
  }

  // Leaderboard
  if (currentPage === 'leaderboard') {
    return (
      <Leaderboard 
        trainerId={trainerId}
        onNavigate={handleNavigate}
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
            <button
              onClick={() => handleNavigate('leaderboard')}
              className="text-gray-400 hover:text-white transition-all"
            >
              🏆
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
        trainerId={trainerId}
        onNavigate={handleNavigate}
      />
    </div>
  );
}