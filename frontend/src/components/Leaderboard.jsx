import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const RankBadge = ({ rank }) => {
  if (rank === 1) return <span className="text-2xl">🥇</span>;
  if (rank === 2) return <span className="text-2xl">🥈</span>;
  if (rank === 3) return <span className="text-2xl">🥉</span>;
  return <span className="text-gray-400 font-mono w-8 text-center">#{rank}</span>;
};

const TrainerRow = ({ trainer, rank, isCurrentUser }) => {
  const getTimePlayed = (seconds) => {
    if (!seconds) return '0m';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <div 
      className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
        isCurrentUser 
          ? 'bg-amber-900/30 border border-amber-500/50' 
          : 'bg-gray-800 hover:bg-gray-750'
      }`}
    >
      <RankBadge rank={rank} />
      
      <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center text-xl">
        🎓
      </div>
      
      <div className="flex-1">
        <div className="font-bold text-white flex items-center gap-2">
          {trainer.name}
          {isCurrentUser && (
            <span className="text-xs bg-amber-500 text-black px-2 py-0.5 rounded-full">
              You
            </span>
          )}
        </div>
        <div className="text-sm text-gray-400">
          Joined {new Date(trainer.created_at).toLocaleDateString()}
        </div>
      </div>
      
      <div className="text-right">
        <div className="text-xl font-bold text-white">
          {trainer.pokemon_created || 0}
        </div>
        <div className="text-xs text-gray-500">Pokémon</div>
      </div>
      
      <div className="text-right hidden sm:block">
        <div className="text-lg font-bold text-yellow-400">
          {trainer.shinies_found || 0} ✨
        </div>
        <div className="text-xs text-gray-500">Shinies</div>
      </div>
      
      <div className="text-right hidden md:block">
        <div className="text-sm text-gray-300">
          {getTimePlayed(trainer.active_time_seconds)}
        </div>
        <div className="text-xs text-gray-500">Active</div>
      </div>
    </div>
  );
};

export default function Leaderboard({ trainerId, onNavigate }) {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalTrainers: 0, totalPokemon: 0 });

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const [leaderboardRes, pokedexRes] = await Promise.all([
        fetch(`${API_URL}/api/trainer/leaderboard?limit=50`),
        fetch(`${API_URL}/api/pokedex/stats`)
      ]);
      
      const leaderboardData = await leaderboardRes.json();
      const pokedexData = await pokedexRes.json();
      
      setTrainers(leaderboardData.trainers || []);
      setStats({
        totalTrainers: leaderboardData.trainers?.length || 0,
        totalPokemon: pokedexData.total || 0,
        totalShinies: pokedexData.shinies || 0,
      });
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <nav className="bg-gray-900 border-b border-gray-800 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => onNavigate('generator')}
            className="text-xl font-bold text-white hover:text-amber-400 transition-all"
          >
            🔴 PokéDream
          </button>
          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate('pokedex')}
              className="text-gray-400 hover:text-white transition-all"
            >
              Pokédex
            </button>
            <span className="text-gray-600">|</span>
            <button
              onClick={() => onNavigate('profile')}
              className="text-gray-400 hover:text-white transition-all"
            >
              Profile
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">🏆 Leaderboard</h1>
          <p className="text-gray-400">Top Pokémon Dreamers of the Oneira Region</p>
        </div>

        {/* Global Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-800 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-white">{stats.totalTrainers}</div>
            <div className="text-sm text-gray-400">Trainers</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-white">{stats.totalPokemon}</div>
            <div className="text-sm text-gray-400">Pokémon Created</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-yellow-400">{stats.totalShinies}</div>
            <div className="text-sm text-gray-400">Shinies Found</div>
          </div>
        </div>

        {/* Leaderboard */}
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-400">Loading leaderboard...</p>
          </div>
        ) : trainers.length === 0 ? (
          <div className="text-center py-16 bg-gray-900 rounded-2xl border border-gray-800">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-xl font-bold text-gray-300 mb-2">No trainers yet!</h2>
            <p className="text-gray-500 mb-6">Be the first to claim your spot.</p>
            <button
              onClick={() => onNavigate('generator')}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-lg transition-all"
            >
              Create Your First Pokémon
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {trainers.map((trainer, index) => (
              <TrainerRow 
                key={trainer.id} 
                trainer={trainer} 
                rank={index + 1}
                isCurrentUser={trainer.id === trainerId}
              />
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-500 mb-4">Want to climb the ranks?</p>
          <button
            onClick={() => onNavigate('generator')}
            className="px-8 py-3 bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-lg transition-all"
          >
            Create More Pokémon
          </button>
        </div>
      </div>
    </div>
  );
}