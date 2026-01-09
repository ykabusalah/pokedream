import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:8000';

const TYPE_COLORS = {
  Normal: '#A8A878', Fire: '#F08030', Water: '#6890F0', Electric: '#F8D030',
  Grass: '#78C850', Ice: '#98D8D8', Fighting: '#C03028', Poison: '#A040A0',
  Ground: '#E0C068', Flying: '#A890F0', Psychic: '#F85888', Bug: '#A8B820',
  Rock: '#B8A038', Ghost: '#705898', Dragon: '#7038F8', Dark: '#705848',
  Steel: '#B8B8D0', Fairy: '#EE99AC'
};

const TYPE_ICONS = {
  Normal: '⚪', Fire: '🔥', Water: '💧', Electric: '⚡',
  Grass: '🌿', Ice: '❄️', Fighting: '👊', Poison: '☠️',
  Ground: '🌍', Flying: '🪶', Psychic: '🔮', Bug: '🐛',
  Rock: '🪨', Ghost: '👻', Dragon: '🐲', Dark: '🌑',
  Steel: '⚙️', Fairy: '✨'
};

const POKEMON_TYPES = Object.keys(TYPE_COLORS);

// Pokemon card component
const PokemonCard = ({ pokemon, onClick, isMine }) => {
  const primaryType = pokemon.types?.[0] || 'Normal';
  const secondaryType = pokemon.types?.[1];

  return(
    <div
      onClick={onClick}
      className="group relative rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:z-10"
      style={{
        background: `linear-gradient(135deg, ${TYPE_COLORS[primaryType]}40, ${TYPE_COLORS[secondaryType || primaryType]}20)`
      }}
    >
{/* Card content */}
      <div className="p-3 bg-gray-900/80 backdrop-blur-sm h-full border border-gray-800 rounded-xl group-hover:border-gray-600 transition-colors">
        <div className="flex items-center justify-between mb-1">
          <div className="text-xs text-gray-500 font-mono">
            #{String(pokemon.dex_number).padStart(3, '0')}
          </div>

          <div className="flex items-center gap-1.5">
            {/* Created by you indicator (shown in Global view for your own Pokémon) */}
            {isMine && (
              <span
                className="inline-flex items-center justify-center px-1.5 py-0.5 rounded bg-gradient-to-r from-cyan-500/80 to-blue-500/80 text-white text-[10px] font-bold shadow-sm"
                title="Created by you"
              >
                YOURS
              </span>
            )}

            {/* Shiny indicator */}
            {pokemon.is_shiny && (
              <span
                className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500/20 border border-amber-400/40"
                title="Shiny Pokémon"
              >
                <span className="text-amber-300 text-xs">✨</span>
              </span>
            )}
          </div>
        </div>

        {pokemon.image_path ? (
          <div className="relative aspect-square mb-2 rounded-lg overflow-hidden bg-gray-800">
            <img
              src={`${API_URL}/${pokemon.image_path}`}
              alt={pokemon.name}
              className="w-full h-full object-contain transition-transform group-hover:scale-110"
            />
          </div>
        ) : (
          <div className="aspect-square bg-gray-800 rounded-lg mb-2 flex items-center justify-center text-4xl text-gray-600">
            ?
          </div>
        )}

        <div className="font-bold text-sm text-white truncate mb-2">{pokemon.name}</div>

        <div className="flex gap-1 flex-wrap">
          {pokemon.types?.map(type => (
            <span
              key={type}
              className="text-xs px-2 py-0.5 rounded-full text-white flex items-center gap-1"
              style={{ backgroundColor: TYPE_COLORS[type] }}
            >
              <span className="text-[10px]">{TYPE_ICONS[type]}</span>
              {type}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

// Empty state
const EmptyState = ({ onGenerate }) => (
  <div className="text-center py-20">
    <div className="text-8xl mb-6 opacity-50">📭</div>
    <h2 className="text-3xl font-bold mb-3 text-white">No Pokémon Yet!</h2>
    <p className="text-gray-400 mb-8 max-w-md mx-auto">
      Your Pokédex is empty. Create your first AI-generated Pokémon and start building your collection!
    </p>
    <button
      onClick={onGenerate}
      className="px-8 py-4 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-500/20 flex items-center gap-2 mx-auto"
    >
      <span>⚡</span> Create Your First Pokémon
    </button>
  </div>
);

// Type filter button
const TypeFilter = ({ type, selected, onClick }) => (
  <button
    onClick={onClick}
    className={`
      px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 flex items-center gap-1
      ${selected
        ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900 scale-110'
        : 'opacity-60 hover:opacity-100'
      }
    `}
    style={{ backgroundColor: TYPE_COLORS[type] }}
  >
    <span>{TYPE_ICONS[type]}</span>
    {type}
  </button>
);

export default function Pokedex({ onNavigate, trainerId: trainerIdProp }) {
  const [pokemon, setPokemon] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Scope: local (this trainer) vs global (all trainers)
  const [scope, setScope] = useState('local'); // 'local' | 'global'

  // Resolve trainerId (App should pass it, but we also fallback to localStorage)
  const trainerId = trainerIdProp || localStorage.getItem('pokedream_trainer_id');

  useEffect(() => {
    loadPokedex();
    loadStats();
  }, [selectedType, scope, trainerId]);

  const loadPokedex = async () => {
    setLoading(true);
    try {
      const baseUrl = scope === 'local'
        ? `${API_URL}/api/trainer/${trainerId}/pokemon`
        : `${API_URL}/api/pokedex`;

      const url = selectedType
        ? `${baseUrl}?type=${encodeURIComponent(selectedType)}`
        : baseUrl;

      const res = await fetch(url);
      const data = await res.json();
      setPokemon(data.pokemon || []);
    } catch (err) {
      console.error('Failed to load Pokédex:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const url = scope === 'local'
        ? `${API_URL}/api/trainer/${trainerId}/stats`
        : `${API_URL}/api/pokedex/stats`;
      const res = await fetch(url);
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadPokedex();
      return;
    }
    setLoading(true);
    try {
      if (scope === 'local') {
        const baseUrl = `${API_URL}/api/trainer/${trainerId}/pokemon/search?q=${encodeURIComponent(searchQuery)}`;
        const url = selectedType ? `${baseUrl}&type=${encodeURIComponent(selectedType)}` : baseUrl;
        const res = await fetch(url);
        const data = await res.json();
        setPokemon(data.pokemon || []);
      } else {
        const res = await fetch(`${API_URL}/api/pokedex/search?q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        // Apply type filter client-side for global search results, since /api/pokedex/search doesn't accept type
        const results = (data.pokemon || []);
        const filtered = selectedType ? results.filter(p => (p.types || []).includes(selectedType)) : results;
        setPokemon(filtered);
      }
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };


  const footerLabel = scope === 'local' ? 'My Collection' : 'World Collection';



  return(
    <div className="min-h-screen text-white">
      {/* Header Section */}
      <div className="bg-gray-900/50 border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-6">
          {/* Title and Stats */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <span>📖</span>
                {scope === 'local' ? 'My Oneira Pokédex' : 'Global Oneira Pokédex'}
              </h1>
              <p className="text-gray-400 mt-1">
                {stats ? (
                  <>
                    <span className="text-white font-bold">{stats.total}</span> Pokémon discovered
                    {stats.shinies > 0 && (
                      <span className="ml-2">
                        • <span className="text-yellow-400">✨ {stats.shinies}</span> shiny
                      </span>
                    )}
                  </>
                ) : 'Loading...'}
              </p>

              <div className="mt-3 inline-flex rounded-xl overflow-hidden border border-gray-700">
                <button
                  onClick={() => setScope('local')}
                  className={`px-4 py-2 text-sm font-bold transition-all ${
                    scope === 'local' ? 'bg-white text-gray-900' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  👤 My Pokédex
                </button>
                <button
                  onClick={() => setScope('global')}
                  className={`px-4 py-2 text-sm font-bold transition-all ${
                    scope === 'global' ? 'bg-white text-gray-900' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  🌎 Global Pokédex
                </button>
              </div>
            </div>
            <button
              onClick={() => onNavigate('generator')}
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-500/20 flex items-center gap-2"
            >
              <span>⚡</span> Create New
            </button>
          </div>

          {/* Search */}
          <div className="flex gap-2 mb-6">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search Pokémon..."
                className="w-full bg-gray-800 text-white pl-10 pr-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-red-500 border border-gray-700"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
            </div>
            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl transition-all border border-gray-700 font-medium"
            >
              Search
            </button>
          </div>

          {/* Type filters */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedType(null)}
              className={`
                px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200
                ${!selectedType
                  ? 'bg-white text-gray-900'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
                }
              `}
            >
              All Types
            </button>
            {POKEMON_TYPES.map(type => (
              <TypeFilter
                key={type}
                type={type}
                selected={selectedType === type}
                onClick={() => setSelectedType(type === selectedType ? null : type)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-20">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="absolute inset-0 border-4 border-red-500 border-t-transparent rounded-full animate-spin"/>
            </div>
            <p className="text-gray-400">Loading Pokédex...</p>
          </div>
        ) : pokemon.length === 0 ? (
          <EmptyState onGenerate={() => onNavigate('generator')} />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {pokemon.map(p => (
              <PokemonCard
                key={p.id || p.dex_number}
                pokemon={p}
                isMine={scope === 'global' && trainerId && p.trainer_id === trainerId}
                onClick={() => onNavigate('pokemon', p.dex_number)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center py-8 text-gray-600 text-sm border-t border-gray-800 mt-8">
        <p>{footerLabel} • Oneira Region • {stats?.total || 0} Pokémon Discovered</p>
      </div>
    </div>
  );
}