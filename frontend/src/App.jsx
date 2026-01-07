import { useState } from 'react';
import PokeDreamIntro from './components/PokeDreamIntro';
import PokemonGenerator from './components/PokemonGenerator';
import Pokedex from './components/Pokedex';
import PokemonDetail from './components/PokemonDetail';
import TrainerProfile from './components/TrainerProfile';

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
    // Clear saved name and go back to intro
    localStorage.removeItem('pokedream_trainer_name');
    setCurrentPage('intro');
  };

  // Intro (new users get full intro, returning users get welcome back)
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
    return <Pokedex onNavigate={handleNavigate} />;
  }

  // Trainer Profile
  if (currentPage === 'profile') {
    return (
      <TrainerProfile 
        trainerName={trainerName} 
        onNavigate={handleNavigate}
        onChangeName={handleChangeName}
      />
    );
  }

  // Generator (default)
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