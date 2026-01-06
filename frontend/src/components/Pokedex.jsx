import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:8000';

const POKEMON_TYPES = [
  'Normal', 'Fire', 'Water', 'Electric', 'Grass', 'Ice',
  'Fighting', 'Poison', 'Ground', 'Flying', 'Psychic', 'Bug',
  'Rock', 'Ghost', 'Dragon', 'Dark', 'Steel', 'Fairy'
];

const TYPE_COLORS = {
  Normal: '#A8A878', Fire: '#F08030', Water: '#6890F0', Electric: '#F8D030',
  Grass: '#78C850', Ice: '#98D8D8', Fighting: '#C03028', Poison: '#A040A0',
  Ground: '#E0C068', Flying: '#A890F0', Psychic: '#F85888', Bug: '#A8B820',
  Rock: '#B8A038', Ghost: '#705898', Dragon: '#7038F8', Dark: '#705848',
  Steel: '#B8B8D0', Fairy: '#EE99AC'
};

const TypeBadge = ({ type, small = false }) => (
  <span 
    className={`${small ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'} rounded-full font-bold text-white`}
    style={{ backgroundColor: TYPE_COLORS[type] || '#888' }}
  >
    {type}
  </span>
);

const PokemonCard = ({ pokemon, onClick }) => {
  const { dex_number, name, types, image_path, is_shiny } = pokemon;
  const imageUrl = image_path ? `${API_URL}/${image_path}` : null;
  
  return (
    <div 
      onClick={onClick}
      className="bg-gray-900 rounded-xl p-4 cursor-pointer transition-all hover:scale-105 hover:bg-gray-800 relative"
      style={{ border: '2px solid #374151' }}
    >
      {/* Shiny indicator */}
      {is_shiny && (
        <div className="absolute top-2 right-2 text-yellow-400 animate-pulse">
          ✨
        </div>
      )}
      
      {/* Dex number */}
      <p className="text-gray-500 text-xs mb-2">#{String(dex_number).padStart(4, '0')}</p>
      
      {/* Image */}
      <div className="w-full aspect-square bg-gray-800 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={name}
            className="w-full h-full object-contain p-2"
          />
        ) : (
          <span className="text-4xl">?</span>
        )}
      </div>
      
      {/* Name */}
      <h3 className="text-white font-bold text-center mb-2 truncate">{name}</h3>
      
      {/* Types */}
      <div className="flex justify-center gap-1 flex-wrap">
        {types?.map(t => <TypeBadge key={t} type={t} small />)}
      </div>
    </div>
  );
};

const EmptyState = ({ onGenerate }) => (
  <div className="text-center py-16">
    <div className="text-6xl mb-4">📖</div>
    <h2 className="text-2xl font-bold text-white mb-2">The Pokédex is Empty!</h2>
    <p className="text-gray-400 mb-6">No Pokémon have been discovered in the Oneira Region yet.</p>
    <button
      onClick={onGenerate}
      className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-lg transition-all"
    >
      Create the First Pokémon
    </button>
  </div>
);

export default function Pokedex({ onNavigate }) {
  const [pokemon, setPokemon] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPokemon, setSelectedPokemon] = useState(null);

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

  const filteredPokemon = pokemon;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold">Oneira Pokédex</h1>
              <p className="text-gray-400">
                {stats ? `${stats.total} Pokémon discovered` : 'Loading...'}
                {stats?.shinies > 0 && ` • ${stats.shinies} shiny`}
              </p>
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
        ) : filteredPokemon.length === 0 ? (
          <EmptyState onGenerate={() => onNavigate('generator')} />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredPokemon.map(p => (
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