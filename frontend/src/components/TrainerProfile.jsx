import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:8000';

const TYPE_COLORS = {
  Normal: '#A8A878', Fire: '#F08030', Water: '#6890F0', Electric: '#F8D030',
  Grass: '#78C850', Ice: '#98D8D8', Fighting: '#C03028', Poison: '#A040A0',
  Ground: '#E0C068', Flying: '#A890F0', Psychic: '#F85888', Bug: '#A8B820',
  Rock: '#B8A038', Ghost: '#705898', Dragon: '#7038F8', Dark: '#705848',
  Steel: '#B8B8D0', Fairy: '#EE99AC'
};

const StatCard = ({ label, value, icon, subtext }) => (
  <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
    <div className="flex items-center gap-3 mb-2">
      <span className="text-2xl">{icon}</span>
      <span className="text-gray-400 text-sm">{label}</span>
    </div>
    <div className="text-3xl font-bold text-white">{value}</div>
    {subtext && <div className="text-gray-500 text-xs mt-1">{subtext}</div>}
  </div>
);

const AchievementBadge = ({ title, description, unlocked, icon }) => (
  <div className={`rounded-lg p-3 border ${unlocked 
    ? 'bg-amber-900/30 border-amber-500/50' 
    : 'bg-gray-800/50 border-gray-700 opacity-50'}`}
  >
    <div className="flex items-center gap-2">
      <span className={`text-xl ${unlocked ? '' : 'grayscale'}`}>{icon}</span>
      <div>
        <div className={`font-bold text-sm ${unlocked ? 'text-amber-400' : 'text-gray-500'}`}>
          {title}
        </div>
        <div className="text-xs text-gray-500">{description}</div>
      </div>
    </div>
  </div>
);

const TypeBar = ({ type, count, maxCount }) => (
  <div className="flex items-center gap-2">
    <span 
      className="w-16 text-xs font-bold text-white px-2 py-0.5 rounded text-center"
      style={{ backgroundColor: TYPE_COLORS[type] }}
    >
      {type}
    </span>
    <div className="flex-1 h-3 bg-gray-800 rounded-full overflow-hidden">
      <div 
        className="h-full rounded-full transition-all duration-500"
        style={{ 
          width: `${(count / maxCount) * 100}%`, 
          backgroundColor: TYPE_COLORS[type] 
        }}
      />
    </div>
    <span className="text-gray-400 text-sm w-8 text-right">{count}</span>
  </div>
);

export default function TrainerProfile({ trainerName, trainerId, onNavigate, onChangeName }) {
  const [stats, setStats] = useState(null);
  const [trainerData, setTrainerData] = useState(null);
  const [recentPokemon, setRecentPokemon] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [trainerId]);

  const fetchData = async () => {
    try {
      const requests = [
        fetch(`${API_URL}/api/pokedex/stats`),
        fetch(`${API_URL}/api/pokedex/recent?limit=5`)
      ];
      
      // Add trainer-specific stats if we have trainerId
      if (trainerId) {
        requests.push(fetch(`${API_URL}/api/trainer/${trainerId}/stats`));
      }
      
      const responses = await Promise.all(requests);
      const [statsRes, recentRes] = responses;
      
      const statsData = await statsRes.json();
      const recentData = await recentRes.json();
      
      // Use trainer-specific stats if available
      if (trainerId && responses[2]) {
        const trainerStats = await responses[2].json();
        setTrainerData(trainerStats.trainer);
        setStats({
          total: trainerStats.total_pokemon,
          shinies: trainerStats.shinies,
          type_counts: trainerStats.type_counts,
        });
      } else {
        setStats(statsData);
      }
      
      // Filter recent Pokemon to show only this trainer's
      const myPokemon = (recentData.pokemon || []).filter(
        p => !trainerId || p.trainer_id === trainerId
      );
      setRecentPokemon(myPokemon);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTimePlayed = () => {
    const totalSeconds = trainerData?.active_time_seconds || 0;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m`;
    return `${totalSeconds}s`;
  };

  const getFavoriteType = () => {
    if (!stats?.type_counts) return null;
    const entries = Object.entries(stats.type_counts);
    if (entries.length === 0) return null;
    return entries.sort((a, b) => b[1] - a[1])[0][0];
  };

  const getAchievements = () => {
    const total = stats?.total || 0;
    const typesCount = Object.keys(stats?.type_counts || {}).length;
    const shinies = stats?.shinies || 0;
    
    return [
      { id: 'first', title: 'First Steps', description: 'Create your first Pokémon', icon: '🥚', unlocked: total >= 1 },
      { id: 'five', title: 'Budding Trainer', description: 'Create 5 Pokémon', icon: '⭐', unlocked: total >= 5 },
      { id: 'ten', title: 'Rising Star', description: 'Create 10 Pokémon', icon: '🌟', unlocked: total >= 10 },
      { id: 'twentyfive', title: 'Pokémon Enthusiast', description: 'Create 25 Pokémon', icon: '🏆', unlocked: total >= 25 },
      { id: 'fifty', title: 'Master Creator', description: 'Create 50 Pokémon', icon: '👑', unlocked: total >= 50 },
      { id: 'types5', title: 'Type Explorer', description: 'Create 5 different types', icon: '🎨', unlocked: typesCount >= 5 },
      { id: 'types10', title: 'Type Master', description: 'Create 10 different types', icon: '🌈', unlocked: typesCount >= 10 },
      { id: 'types18', title: 'Type Completionist', description: 'Create all 18 types', icon: '💎', unlocked: typesCount >= 18 },
      { id: 'shiny', title: 'Lucky Find', description: 'Find a shiny Pokémon', icon: '✨', unlocked: shinies >= 1 },
    ];
  };

  const favoriteType = getFavoriteType();
  const achievements = getAchievements();
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const maxTypeCount = stats?.type_counts ? Math.max(...Object.values(stats.type_counts)) : 1;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full" />
      </div>
    );
  }

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
            <span className="text-amber-400 font-bold">{trainerName}</span>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-gray-900 rounded-2xl p-6 mb-6 border border-gray-800">
          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center text-4xl shadow-lg shadow-amber-500/20">
              🎓
            </div>
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-1">{trainerName}</h1>
              <p className="text-gray-400">Pokémon Dreamer • Oneira Region</p>
              <div className="flex gap-4 mt-3 text-sm">
                <span className="text-amber-400">
                  {unlockedCount}/{achievements.length} Achievements
                </span>
                <span className="text-gray-500">•</span>
                <span className="text-gray-400">
                  Active time: {getTimePlayed()}
                </span>
                {trainerData?.created_at && (
                  <>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-400">
                      Joined: {new Date(trainerData.created_at).toLocaleDateString()}
                    </span>
                  </>
                )}
              </div>
              <button
                onClick={onChangeName}
                className="mt-3 text-xs text-gray-500 hover:text-gray-300 transition-all"
              >
                Change trainer name
              </button>
            </div>

            {favoriteType && (
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-2">Favorite Type</div>
                <div 
                  className="px-4 py-2 rounded-full font-bold text-white inline-block"
                  style={{ backgroundColor: TYPE_COLORS[favoriteType] }}
                >
                  {favoriteType}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard 
            label="Pokémon Created" 
            value={stats?.total || 0} 
            icon="📋"
            subtext="Total in Pokédex"
          />
          <StatCard 
            label="Types Discovered" 
            value={Object.keys(stats?.type_counts || {}).length} 
            icon="🎨"
            subtext="Out of 18"
          />
          <StatCard 
            label="Shinies Found" 
            value={stats?.shinies || 0} 
            icon="✨"
            subtext="1/4096 chance each"
          />
          <StatCard 
            label="Active Time" 
            value={getTimePlayed()} 
            icon="⏱️"
            subtext="Total time on site"
          />
        </div>

        {/* Type Distribution */}
        {stats?.type_counts && Object.keys(stats.type_counts).length > 0 && (
          <div className="bg-gray-900 rounded-2xl p-6 mb-6 border border-gray-800">
            <h2 className="text-xl font-bold mb-4">Type Distribution</h2>
            <div className="space-y-2">
              {Object.entries(stats.type_counts)
                .sort((a, b) => b[1] - a[1])
                .map(([type, count]) => (
                  <TypeBar key={type} type={type} count={count} maxCount={maxTypeCount} />
                ))
              }
            </div>
          </div>
        )}

        {/* Achievements */}
        <div className="bg-gray-900 rounded-2xl p-6 mb-6 border border-gray-800">
          <h2 className="text-xl font-bold mb-4">Achievements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {achievements.map(achievement => (
              <AchievementBadge key={achievement.id} {...achievement} />
            ))}
          </div>
        </div>

        {/* Recent Pokémon */}
        {recentPokemon.length > 0 && (
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <h2 className="text-xl font-bold mb-4">Recent Creations</h2>
            <div className="space-y-3">
              {recentPokemon.map((pokemon, i) => (
                <div 
                  key={pokemon.id || i}
                  className="flex items-center gap-4 bg-gray-800 rounded-lg p-3 cursor-pointer hover:bg-gray-750 transition-all"
                  onClick={() => onNavigate('pokemon', pokemon.dex_number)}
                >
                  {pokemon.image_path && (
                    <img 
                      src={`${API_URL}/${pokemon.image_path}`}
                      alt={pokemon.name}
                      className="w-12 h-12 object-contain rounded bg-gray-700"
                    />
                  )}
                  <div className="flex-1">
                    <div className="font-bold">{pokemon.name}</div>
                    <div className="flex gap-1">
                      {pokemon.types?.map(t => (
                        <span 
                          key={t}
                          className="text-xs px-2 py-0.5 rounded text-white"
                          style={{ backgroundColor: TYPE_COLORS[t] }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-gray-500 text-sm">
                    #{String(pokemon.dex_number).padStart(3, '0')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Create More CTA */}
        <div className="text-center mt-8">
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