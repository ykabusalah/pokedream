import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Valid Pokemon types for filtering
const POKEMON_TYPES = [
  'Normal', 'Fire', 'Water', 'Electric', 'Grass', 'Ice', 
  'Fighting', 'Poison', 'Ground', 'Flying', 'Psychic', 'Bug', 
  'Rock', 'Ghost', 'Dragon', 'Dark', 'Steel', 'Fairy'
];

// Helper function for type colors
const TYPE_COLORS = {
  Normal: '#A8A878', Fire: '#F08030', Water: '#6890F0', Electric: '#F8D030',
  Grass: '#78C850', Ice: '#98D8D8', Fighting: '#C03028', Poison: '#A040A0',
  Ground: '#E0C068', Flying: '#A890F0', Psychic: '#F85888', Bug: '#A8B820',
  Rock: '#B8A038', Ghost: '#705898', Dragon: '#7038F8', Dark: '#705848',
  Steel: '#B8B8D0', Fairy: '#EE99AC'
};

function getTypeColor(type) {
  return TYPE_COLORS[type] || '#777777';
}

// Helper function for difficulty stars
function getDifficultyStars(difficulty) {
  const levels = { easy: 1, medium: 2, hard: 3, legendary: 3 };
  return levels[difficulty] || 2;
}

export default function DailyChallenge({ trainerId, onUseChallenge }) {
  const [challenge, setChallenge] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChallenge();
  }, [trainerId]);

  useEffect(() => {
    if (!challenge?.seconds_until_reset) return;
    
    const updateTimer = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setUTCHours(24, 0, 0, 0);
      const diff = Math.max(0, Math.floor((tomorrow - now) / 1000));
      
      const hours = Math.floor(diff / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = diff % 60;
      
      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [challenge]);

  const fetchChallenge = async () => {
    try {
      const url = trainerId 
        ? `${API_URL}/api/daily-challenge?trainer_id=${trainerId}`
        : `${API_URL}/api/daily-challenge`;
      
      const res = await fetch(url);
      const data = await res.json();
      setChallenge(data);
    } catch (err) {
      console.error('Failed to fetch challenge:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUseChallenge = () => {
    if (onUseChallenge && challenge) {
      // Filter to only valid Pokemon types
      const types = (challenge.types || [])
        .filter(t => t && POKEMON_TYPES.includes(t));
      
      onUseChallenge({
        types,
        culture: challenge.culture,
        theme: challenge.theme,
        challengeId: challenge.id,
        challengeText: challenge.challenge || '',
        autoGenerate: true,
      });
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-purple-900/50 to-indigo-900/50 rounded-xl p-4 border border-purple-500/30 animate-pulse">
        <div className="h-6 bg-gray-700 rounded w-1/3 mb-2"></div>
        <div className="h-4 bg-gray-700 rounded w-2/3"></div>
      </div>
    );
  }

  if (!challenge) return null;

  // Filter types to only valid Pokemon types
  const validTypes = (challenge.types || [])
    .filter(t => t && POKEMON_TYPES.includes(t));
  
  const isCompleted = challenge.completed || false;

  return (
    <div className={`rounded-xl p-4 border transition-all ${
      isCompleted 
        ? 'bg-green-900/30 border-green-500/50' 
        : 'bg-gradient-to-r from-purple-900/50 to-indigo-900/50 border-purple-500/30'
    }`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">{isCompleted ? '✅' : '🎯'}</span>
            <h3 className="font-bold text-white">Daily Challenge</h3>
            {isCompleted && (
              <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                Completed!
              </span>
            )}
          </div>
          
          <p className="text-gray-200 mb-3">{challenge.challenge}</p>
          
          <div className="flex flex-wrap items-center gap-4 text-sm">
            {/* Show types only if there are valid Pokemon types */}
            {validTypes.length > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-gray-400">Types:</span>
                {validTypes.map((type, i) => (
                  <span 
                    key={i}
                    className="px-2 py-0.5 rounded text-xs font-medium text-white"
                    style={{ backgroundColor: getTypeColor(type) }}
                  >
                    {type}
                  </span>
                ))}
              </div>
            )}
            
            <span className="text-purple-300">
              ⏱️ Resets in {timeLeft}
            </span>
          </div>
        </div>
        
        {!isCompleted && (
          <button
            onClick={handleUseChallenge}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg transition-all text-sm whitespace-nowrap flex-shrink-0"
          >
            Try It →
          </button>
        )}
      </div>
    </div>
  );
}