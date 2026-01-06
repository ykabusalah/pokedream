import { useState } from 'react';
import PokeDreamIntro from './components/PokeDreamIntro';
import PokemonGenerator from './components/PokemonGenerator';
import Pokedex from './components/Pokedex';
import PokemonDetail from './components/PokemonDetail';

export default function App() {
  const [currentPage, setCurrentPage] = useState('intro'); // intro, generator, pokedex, pokemon
  const [trainerName, setTrainerName] = useState('Trainer');
  const [selectedDexNumber, setSelectedDexNumber] = useState(null);

  const handleIntroComplete = (name) => {
    setTrainerName(name);
    setCurrentPage('generator');
  };

  const handleNavigate = (page, data = null) => {
    if (page === 'pokemon' && data) {
      setSelectedDexNumber(data);
    }
    setCurrentPage(page);
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
            <span className="text-gray-400">{trainerName}</span>
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