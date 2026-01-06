import { useState } from 'react';
import PokeDreamIntro from './components/PokeDreamIntro';
import PokemonGenerator from './components/PokemonGenerator';

export default function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [trainerName, setTrainerName] = useState('Trainer');

  const handleIntroComplete = (name) => {
    setTrainerName(name);
    setShowIntro(false);
  };

  if (showIntro) {
    return <PokeDreamIntro onComplete={handleIntroComplete} />;
  }

  return <PokemonGenerator trainerName={trainerName} />;
}