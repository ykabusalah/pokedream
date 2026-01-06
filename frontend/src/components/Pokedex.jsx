import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:8000';

const TYPE_COLORS = {
  Normal: '#A8A878', Fire: '#F08030', Water: '#6890F0', Electric: '#F8D030',
  Grass: '#78C850', Ice: '#98D8D8', Fighting: '#C03028', Poison: '#A040A0',
  Ground: '#E0C068', Flying: '#A890F0', Psychic: '#F85888', Bug: '#A8B820',
  Rock: '#B8A038', Ghost: '#705898', Dragon: '#7038F8', Dark: '#705848',
  Steel: '#B8B8D0', Fairy: '#EE99AC'
};

const POKEMON_TYPES = Object.keys(TYPE_COLORS);

// Pokemon card component
const PokemonCard = ({ pokemon, onClick }) => {
  const primaryType = pokemon.types?.[0] || 'Normal';
  
  return (
    <div 
      onClick={onClick}
      className="bg-gray-800 rounded-lg p-3 cursor-pointer hover:scale-105 transition-all hover:ring-2 hover:ring-amber-500"
    >
      <div className="text-xs text-gray-500 mb-1">
        #{String(pokemon.dex_number).padStart(3, '0')}
      </div>
      
      {pokemon.image_path ? (
        <img 
          src={`${API_URL}/${pokemon.image_path}`}
          alt={pokemon.name}
          className="w-full aspect-square object-contain bg-gray-700 rounded mb-2"
        />
      ) : (
        <div className="w-full aspect-square bg-gray-700 rounded mb-2 flex items-center justify-center text-4xl">
          ?
        </div>
      )}
      
      <div className="font-bold text-sm truncate">{pokemon.name}</div>
      
      <div className="flex gap-1 mt-1 flex-wrap">
        {pokemon.types?.map(type => (
          <span 
            key={type}
            className="text-xs px-2 py-0.5 rounded text-white"
            style={{ backgroundColor: TYPE_COLORS[type] }}
          >
            {type}
          </span>
        ))}
      </div>
    </div>
  );
};

// Empty state
const EmptyState = ({ onGenerate }) => (
  <div className="text-center py-16">
    <div className="text-6xl mb-4">📭</div>
    <h2 className="text-2xl font-bold mb-2">No Pokémon Yet!</h2>
    <p className="text-gray-400 mb-6">Your Pokédex is empty. Create your first AI-generated Pokémon!</p>
    <button
      onClick={onGenerate}
      className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-lg transition-all"
    >
      Create Your First Pokémon
    </button>
  </div>
);

export default function Pokedex({ onNavigate }) {
  const [pokemon, setPokemon] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadPokedex();
    loadStats();
  }, [selectedType]);

  const loadPokedex = async () => {
    setLoading(true);
    try {
      const url = selectedType 
        ? `${API_URL}/api/pokedex?type=${selectedType}`
        : `${API_URL}/api/pokedex`;
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
      const res = await fetch(`${API_URL}/api/pokedex/stats`);
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
      const res = await fetch(`${API_URL}/api/pokedex/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setPokemon(data.pokemon || []);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-6">
          {/* Top nav row with home button */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              {/* HOME BUTTON */}
              <button
                onClick={() => onNavigate('generator')}
                className="text-xl font-bold text-white hover:text-amber-400 transition-all"
              >
                🔴 PokéDream
              </button>
              <span className="text-gray-600">|</span>
              <div>
                <h1 className="text-2xl font-bold">Oneira Pokédex</h1>
                <p className="text-gray-400 text-sm">
                  {stats ? `${stats.total} Pokémon discovered` : 'Loading...'}
                  {stats?.shinies > 0 && ` • ${stats.shinies} shiny`}
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('generator')}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-lg transition-all"
            >
              + Create New
            </button>
          </div>
          
          {/* Search */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search Pokémon..."
              className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all"
            >
              🔍
            </button>
          </div>
          
          {/* Type filters */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedType(null)}
              className={`px-3 py-1 rounded-full text-sm font-bold transition-all ${
                !selectedType 
                  ? 'bg-white text-gray-900' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              All
            </button>
            {POKEMON_TYPES.map(type => (
              <button
                key={type}
                onClick={() => setSelectedType(type === selectedType ? null : type)}
                className={`px-3 py-1 rounded-full text-sm font-bold transition-all ${
                  selectedType === type 
                    ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900' 
                    : 'opacity-70 hover:opacity-100'
                }`}
                style={{ backgroundColor: TYPE_COLORS[type], color: 'white' }}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full mx-auto mb-4" />
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
                onClick={() => onNavigate('pokemon', p.dex_number)}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="text-center py-8 text-gray-600 text-sm">
        PokéDream • Oneira Region • {stats?.total || 0} Pokémon
      </div>
    </div>
  );
}