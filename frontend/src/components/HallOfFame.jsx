import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:8000';

const TYPE_COLORS = {
  Normal: '#A8A878', Fire: '#F08030', Water: '#6890F0', Electric: '#F8D030',
  Grass: '#78C850', Ice: '#98D8D8', Fighting: '#C03028', Poison: '#A040A0',
  Ground: '#E0C068', Flying: '#A890F0', Psychic: '#F85888', Bug: '#A8B820',
  Rock: '#B8A038', Ghost: '#705898', Dragon: '#7038F8', Dark: '#705848',
  Steel: '#B8B8D0', Fairy: '#EE99AC'
};

// Badge Component
const Badge = ({ type }) => {
  const badges = {
    champion: { icon: '🏆', color: 'from-amber-500 to-yellow-500', label: 'Champion' },
    fan_favorite: { icon: '❤️', color: 'from-pink-500 to-rose-500', label: 'Fan Favorite' },
    professors_choice: { icon: '🎓', color: 'from-blue-500 to-indigo-500', label: "Professor's Pick" }
  };

  const badge = badges[type] || badges.champion;

  return (
    <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r ${badge.color} text-white text-xs font-bold shadow-lg`}>
      <span>{badge.icon}</span>
      {badge.label}
    </div>
  );
};

// Inductee Card
const InducteeCard = ({ inductee, onClick, isMine }) => {
  const pokemon = inductee.pokemon;
  const primaryType = pokemon.types?.[0] || 'Normal';

  return (
    <div
      onClick={onClick}
      className="group relative rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105"
      style={{
        background: `linear-gradient(135deg, ${TYPE_COLORS[primaryType]}60, ${TYPE_COLORS[primaryType]}30)`
      }}
    >
      {/* Shine effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative p-4 bg-gray-900/80 backdrop-blur-sm border border-gray-800 group-hover:border-amber-500/50 transition-colors rounded-xl">
        {/* Badge */}
        <div className="absolute top-3 left-3 z-10">
          <Badge type={inductee.induction_type} />
        </div>

        {/* Owner indicator */}
        {isMine && (
          <div className="absolute top-3 right-3 z-10 bg-cyan-500 text-white text-xs px-2 py-1 rounded-full">
            ⭐ Yours
          </div>
        )}

        {/* Shiny indicator */}
        {pokemon.is_shiny && (
          <div className="absolute top-10 right-3 z-10">
            <span className="text-2xl">✨</span>
          </div>
        )}

        {/* Image */}
        <div className="aspect-square mb-3 mt-8">
          {pokemon.image_path ? (
            <img
              src={`${API_URL}/${pokemon.image_path}`}
              alt={pokemon.name}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">?</div>
          )}
        </div>

        {/* Info */}
        <div className="text-center">
          <div className="text-xs text-gray-500 mb-1">
            #{String(pokemon.dex_number).padStart(3, '0')}
          </div>
          <h3 className="text-white font-bold text-lg mb-2">{pokemon.name}</h3>

          {/* Types */}
          <div className="flex justify-center gap-1 mb-2">
            {pokemon.types?.map(type => (
              <span
                key={type}
                className="text-xs px-2 py-1 rounded-full text-white"
                style={{ backgroundColor: TYPE_COLORS[type] }}
              >
                {type}
              </span>
            ))}
          </div>

          {/* Badge text */}
          <div className="text-xs text-amber-400 font-medium">
            {inductee.badge}
          </div>

          {/* Votes (if applicable) */}
          {inductee.total_votes && (
            <div className="text-xs text-gray-500 mt-1">
              {inductee.total_votes} votes
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Main Hall of Fame Component
export default function HallOfFame({ trainerId, onNavigate }) {
  const [inductees, setInductees] = useState([]);
  const [filteredInductees, setFilteredInductees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchHallOfFame();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [inductees, filter, sortBy]);

  const fetchHallOfFame = async () => {
    try {
      const [inducteesRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/api/hall-of-fame`),
        fetch(`${API_URL}/api/hall-of-fame/stats`)
      ]);

      const inducteesData = await inducteesRes.json();
      const statsData = await statsRes.json();

      setInductees(inducteesData.inductees || []);
      setStats(statsData);
    } catch (err) {
      console.error('Failed to fetch Hall of Fame:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...inductees];

    // Apply filter
    if (filter !== 'all') {
      filtered = filtered.filter(i => i.induction_type === filter);
    }

    // Apply sort
    if (sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.induction_date) - new Date(a.induction_date));
    } else if (sortBy === 'oldest') {
      filtered.sort((a, b) => new Date(a.induction_date) - new Date(b.induction_date));
    } else if (sortBy === 'votes') {
      filtered.sort((a, b) => (b.total_votes || 0) - (a.total_votes || 0));
    }

    setFilteredInductees(filtered);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-400">Loading Hall of Fame...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gradient-to-b from-amber-900/20 to-transparent border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-3">
              <span className="text-5xl">🏛️</span>
              Hall of Fame
            </h1>
            <p className="text-gray-400">Oneira's Greatest Pokémon</p>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-900/50 rounded-xl p-4 text-center border border-gray-800">
                <div className="text-2xl font-bold text-amber-400">{stats.total}</div>
                <div className="text-xs text-gray-500">Total Inductees</div>
              </div>
              <div className="bg-gray-900/50 rounded-xl p-4 text-center border border-gray-800">
                <div className="text-2xl font-bold text-amber-400">{stats.champions}</div>
                <div className="text-xs text-gray-500">Champions</div>
              </div>
              <div className="bg-gray-900/50 rounded-xl p-4 text-center border border-gray-800">
                <div className="text-2xl font-bold text-pink-400">{stats.fan_favorites}</div>
                <div className="text-xs text-gray-500">Fan Favorites</div>
              </div>
              <div className="bg-gray-900/50 rounded-xl p-4 text-center border border-gray-800">
                <div className="text-2xl font-bold text-blue-400">{stats.professors_choices}</div>
                <div className="text-xs text-gray-500">Prof's Picks</div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="flex flex-col gap-4">
            {/* Filter buttons - grid on mobile/tablet, flex on desktop */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  filter === 'all'
                    ? 'bg-amber-500 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                All ({inductees.length})
              </button>
              <button
                onClick={() => setFilter('champion')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  filter === 'champion'
                    ? 'bg-amber-500 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                🏆 Champions
              </button>
              <button
                onClick={() => setFilter('fan_favorite')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  filter === 'fan_favorite'
                    ? 'bg-pink-500 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                ❤️ Favorites
              </button>
              <button
                onClick={() => setFilter('professors_choice')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  filter === 'professors_choice'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                🎓 Prof's Picks
              </button>
            </div>

            {/* Sort dropdown - full width on mobile, auto on larger */}
            <div className="flex justify-center sm:justify-end">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm border border-gray-700 outline-none w-full sm:w-auto"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="votes">Most Votes</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Inductees Grid */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {filteredInductees.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-2xl font-bold mb-2">No Inductees Yet</h2>
            <p className="text-gray-400 mb-6">
              {filter === 'all'
                ? 'The Hall of Fame is waiting for its first legendary Pokémon!'
                : `No ${filter.replace('_', ' ')} inductees yet.`}
            </p>
            <button
              onClick={() => onNavigate('tournament')}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-xl transition-all"
            >
              View Tournament
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredInductees.map(inductee => (
              <InducteeCard
                key={inductee.pokemon_id}
                inductee={inductee}
                onClick={() => onNavigate('pokemon', inductee.pokemon_id)}
                isMine={trainerId && inductee.pokemon?.trainer_id === trainerId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}