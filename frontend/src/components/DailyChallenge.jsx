import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:8000';

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
      // Pass challenge details to pre-fill the generator
      onUseChallenge({
        types: challenge.types?.filter(Boolean) || [],
        culture: challenge.culture,
        theme: challenge.theme,
        challengeId: challenge.id,
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

  return (
    <div className={`rounded-xl p-4 border transition-all ${
      challenge.completed 
        ? 'bg-green-900/30 border-green-500/50' 
        : 'bg-gradient-to-r from-purple-900/50 to-indigo-900/50 border-purple-500/30'
    }`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">{challenge.completed ? '✅' : '🎯'}</span>
            <h3 className="font-bold text-white">Daily Challenge</h3>
            {challenge.completed && (
              <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                Completed!
              </span>
            )}
          </div>
          
          <p className="text-gray-200 mb-3">{challenge.challenge}</p>
          
          <div className="flex items-center gap-4 text-sm">
            <span className="text-purple-300">
              ⏱️ Resets in {timeLeft}
            </span>
          </div>
        </div>
        
        {!challenge.completed && (
          <button
            onClick={handleUseChallenge}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg transition-all text-sm whitespace-nowrap"
          >
            Try It →
          </button>
        )}
      </div>
    </div>
  );
}