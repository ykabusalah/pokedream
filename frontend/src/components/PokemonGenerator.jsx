import { useState } from 'react';

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

// Stat bar component
const StatBar = ({ label, value, max = 255, color = '#f59e0b' }) => (
  <div className="flex items-center gap-3">
    <span className="w-20 text-sm text-gray-400">{label}</span>
    <div className="flex-1 h-3 bg-gray-800 rounded-full overflow-hidden">
      <div 
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${(value / max) * 100}%`, backgroundColor: color }}
      />
    </div>
    <span className="w-10 text-sm text-right font-mono text-gray-300">{value}</span>
  </div>
);

// Type badge
const TypeBadge = ({ type }) => (
  <span 
    className="px-3 py-1 rounded-full text-sm font-bold text-white"
    style={{ backgroundColor: TYPE_COLORS[type] || '#888' }}
  >
    {type}
  </span>
);

// Pokemon card
const PokemonCard = ({ pokemon }) => {
  if (!pokemon) return null;
  
  const { name, types, stats, pokedex_entry, lore, moveset, image_path } = pokemon;
  const imageUrl = image_path ? `${API_URL}/${image_path}` : null;
  
  return (
    <div className="bg-gray-900 rounded-2xl p-6 max-w-2xl mx-auto" style={{ border: '3px solid #374151' }}>
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">{name}</h2>
          <div className="flex gap-2">
            {types?.map(t => <TypeBadge key={t} type={t} />)}
          </div>
        </div>
        <div className="text-right text-gray-500 text-sm">
          BST: {stats ? Object.values(stats).reduce((a, b) => a + b, 0) : '???'}
        </div>
      </div>
      
      {/* Image */}
      {imageUrl && (
        <div className="mb-6 flex justify-center">
          <img 
            src={imageUrl} 
            alt={name}
            className="w-64 h-64 object-contain rounded-xl bg-gray-800 p-4"
            style={{ imageRendering: 'auto' }}
          />
        </div>
      )}
      
      {/* Pokedex Entry */}
      {pokedex_entry && (
        <p className="text-gray-300 italic mb-6 text-center px-4">
          "{pokedex_entry}"
        </p>
      )}
      
      {/* Stats */}
      {stats && (
        <div className="space-y-2 mb-6">
          <StatBar label="HP" value={stats.hp} color="#ef4444" />
          <StatBar label="Attack" value={stats.attack} color="#f97316" />
          <StatBar label="Defense" value={stats.defense} color="#eab308" />
          <StatBar label="Sp. Atk" value={stats.sp_attack} color="#3b82f6" />
          <StatBar label="Sp. Def" value={stats.sp_defense} color="#22c55e" />
          <StatBar label="Speed" value={stats.speed} color="#ec4899" />
        </div>
      )}
      
      {/* Moves */}
      {moveset?.current_moves && (
        <div className="mb-4">
          <h3 className="text-sm font-bold text-gray-500 mb-2">MOVES</h3>
          <div className="flex flex-wrap gap-2">
            {moveset.current_moves.map(move => (
              <span key={move} className="px-3 py-1 bg-gray-800 rounded-full text-sm text-gray-300">
                {move}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {/* Lore */}
      {lore?.origin && (
        <div className="text-sm text-gray-500 mt-4 pt-4 border-t border-gray-800">
          <span className="font-bold">Origin:</span> {lore.origin}
        </div>
      )}
    </div>
  );
};

export default function PokemonGenerator({ trainerName }) {
  const [description, setDescription] = useState('');
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [pokemon, setPokemon] = useState(null);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState('simple'); // simple or advanced

  const toggleType = (type) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter(t => t !== type));
    } else if (selectedTypes.length < 2) {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  const handleGenerate = async () => {
    if (!description.trim()) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const endpoint = mode === 'simple' ? '/api/quick-generate' : '/api/generate';
      const body = mode === 'simple' 
        ? { description, trainer_name: trainerName }
        : { 
            concept: description, 
            types: selectedTypes.length ? selectedTypes : ['Normal'],
            trainer_name: trainerName 
          };
      
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      if (!res.ok) throw new Error('Generation failed');
      
      const data = await res.json();
      setPokemon(data.pokemon);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">PokéDream Generator</h1>
          <p className="text-gray-400">Welcome, {trainerName}! Describe your dream Pokémon.</p>
        </div>
        
        {/* Mode Toggle */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => setMode('simple')}
            className={`px-4 py-2 rounded-lg transition-all ${
              mode === 'simple' ? 'bg-amber-500 text-white' : 'bg-gray-800 text-gray-400'
            }`}
          >
            Simple
          </button>
          <button
            onClick={() => setMode('advanced')}
            className={`px-4 py-2 rounded-lg transition-all ${
              mode === 'advanced' ? 'bg-amber-500 text-white' : 'bg-gray-800 text-gray-400'
            }`}
          >
            Advanced
          </button>
        </div>
        
        {/* Input Form */}
        <div className="bg-gray-900 rounded-xl p-6 mb-8" style={{ border: '3px solid #374151' }}>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="A majestic ice dragon inspired by Himalayan mythology..."
            className="w-full bg-gray-800 text-white p-4 rounded-lg resize-none h-32 outline-none focus:ring-2 focus:ring-amber-500 mb-4"
          />
          
          {/* Type selector (advanced mode) */}
          {mode === 'advanced' && (
            <div className="mb-4">
              <p className="text-sm text-gray-400 mb-2">Select up to 2 types:</p>
              <div className="flex flex-wrap gap-2">
                {POKEMON_TYPES.map(type => (
                  <button
                    key={type}
                    onClick={() => toggleType(type)}
                    className={`px-3 py-1 rounded-full text-sm font-bold transition-all ${
                      selectedTypes.includes(type) 
                        ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900' 
                        : 'opacity-60 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: TYPE_COLORS[type], color: 'white' }}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !description.trim()}
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all"
          >
            {isGenerating ? 'Generating...' : 'Generate Pokémon'}
          </button>
        </div>
        
        {/* Loading */}
        {isGenerating && (
          <div className="text-center py-12">
            <div className="animate-spin w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-400">Creating your Pokémon...</p>
            <p className="text-gray-600 text-sm mt-2">This may take 30-60 seconds</p>
          </div>
        )}
        
        {/* Error */}
        {error && (
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-8 text-center">
            <p className="text-red-300">{error}</p>
            <p className="text-red-400 text-sm mt-2">Make sure the backend server is running on port 8000</p>
          </div>
        )}
        
        {/* Result */}
        {pokemon && !isGenerating && <PokemonCard pokemon={pokemon} />}
        
        {/* Footer */}
        <p className="text-center text-gray-600 text-sm mt-12">
          Powered by Claude AI & Replicate • PokéDream v1.0
        </p>
      </div>
    </div>
  );
}