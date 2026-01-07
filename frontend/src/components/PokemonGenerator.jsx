import { useState } from 'react';

const API_URL = 'http://localhost:8000';

const TYPE_COLORS = {
  Normal: '#A8A878', Fire: '#F08030', Water: '#6890F0', Electric: '#F8D030',
  Grass: '#78C850', Ice: '#98D8D8', Fighting: '#C03028', Poison: '#A040A0',
  Ground: '#E0C068', Flying: '#A890F0', Psychic: '#F85888', Bug: '#A8B820',
  Rock: '#B8A038', Ghost: '#705898', Dragon: '#7038F8', Dark: '#705848',
  Steel: '#B8B8D0', Fairy: '#EE99AC'
};

const POKEMON_TYPES = Object.keys(TYPE_COLORS);

// Stat bar component
const StatBar = ({ label, value, color }) => (
  <div className="flex items-center gap-2 text-sm">
    <span className="w-16 text-gray-400">{label}</span>
    <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
      <div 
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${(value / 255) * 100}%`, backgroundColor: color }}
      />
    </div>
    <span className="w-8 text-right text-gray-300">{value}</span>
  </div>
);

// Pokemon card display
const PokemonCard = ({ pokemon, imageKey }) => {
  const { name, types, stats, abilities, moveset, lore, image_path, is_shiny } = pokemon;
  const primaryType = types?.[0] || 'Normal';
  const imageUrl = image_path ? `${API_URL}/${image_path}?t=${imageKey}` : null;
  
  return (
    <div 
      className="bg-gray-900 rounded-xl p-6 max-w-md mx-auto relative"
      style={{ border: `3px solid ${TYPE_COLORS[primaryType]}` }}
    >
      {/* Shiny badge */}
      {is_shiny && (
        <div className="absolute top-2 right-2 px-2 py-1 bg-yellow-500 text-black text-xs font-bold rounded-full animate-pulse">
          ✨ SHINY
        </div>
      )}
      
      {/* Image */}
      {imageUrl && (
        <div className="relative mb-4">
          <img 
            src={imageUrl} 
            alt={name}
            className="w-full aspect-square object-contain rounded-lg bg-gray-800"
          />
          {is_shiny && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-tr from-yellow-500/20 to-transparent animate-pulse" />
            </div>
          )}
        </div>
      )}
      
      {/* Name and types */}
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-white mb-2">{name}</h2>
        <div className="flex justify-center gap-2">
          {types?.map(type => (
            <span 
              key={type}
              className="px-3 py-1 rounded-full text-sm font-bold text-white"
              style={{ backgroundColor: TYPE_COLORS[type] }}
            >
              {type}
            </span>
          ))}
        </div>
      </div>
      
      {/* Stats */}
      {stats && (
        <div className="space-y-2 mb-4">
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

export default function PokemonGenerator({ trainerName, onNavigate }) {
  const [description, setDescription] = useState('');
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [pokemon, setPokemon] = useState(null);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState('simple'); // simple, advanced, random
  const [imageKey, setImageKey] = useState(Date.now());
  const [showErrorPopup, setShowErrorPopup] = useState(false);

  const toggleType = (type) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter(t => t !== type));
    } else if (selectedTypes.length < 2) {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  const handleGenerate = async () => {
    if (mode !== 'random' && !description.trim()) return;
    
    setPokemon(null);
    setImageKey(Date.now());
    setIsGenerating(true);
    setError(null);
    setShowErrorPopup(false);
    
    try {
      let endpoint, body;
      
      if (mode === 'random') {
        endpoint = '/api/random-generate';
        body = { trainer_name: trainerName };
      } else if (mode === 'simple') {
        endpoint = '/api/quick-generate';
        body = { description, trainer_name: trainerName };
      } else {
        endpoint = '/api/generate';
        body = { 
          concept: description, 
          types: selectedTypes.length ? selectedTypes : undefined,
          trainer_name: trainerName 
        };
      }
      
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Generation failed');
      }
      
      const data = await res.json();
      // Backend returns {success: true, pokemon: {...}} so extract the pokemon
      setPokemon(data.pokemon || data);
      
    } catch (err) {
      console.error('Generation error:', err);
      setError(err.message);
      setShowErrorPopup(true);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <h1 className="text-3xl font-bold mb-2">Pokémon Generator</h1>
          <p className="text-gray-400">Welcome, {trainerName}! Describe your dream Pokémon.</p>
        </div>
        
        {/* Mode Toggle */}
        <div className="flex justify-center gap-2 mb-6">
          <button
            onClick={() => setMode('simple')}
            className={`px-4 py-2 rounded-lg transition-all ${
              mode === 'simple' ? 'bg-amber-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Simple
          </button>
          <button
            onClick={() => setMode('advanced')}
            className={`px-4 py-2 rounded-lg transition-all ${
              mode === 'advanced' ? 'bg-amber-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Advanced
          </button>
          <button
            onClick={() => setMode('random')}
            className={`px-4 py-2 rounded-lg transition-all ${
              mode === 'random' ? 'bg-purple-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            🎲 Surprise Me
          </button>
        </div>
        
        {/* Input Form - Hidden in random mode */}
        {mode !== 'random' ? (
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
        ) : (
          /* Random Mode UI */
          <div className="bg-gray-900 rounded-xl p-8 mb-8 text-center" style={{ border: '3px solid #7c3aed' }}>
            <div className="text-6xl mb-4">🎲</div>
            <h2 className="text-xl font-bold mb-2">Feeling Lucky?</h2>
            <p className="text-gray-400 mb-6">
              Let the AI surprise you with a completely random Pokémon!
              No prompts, no choices — pure chaos.
            </p>
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="px-8 py-4 bg-purple-500 hover:bg-purple-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all text-lg"
            >
              {isGenerating ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">🎲</span> Rolling the dice...
                </span>
              ) : (
                '🎲 Surprise Me!'
              )}
            </button>
          </div>
        )}
        
        {/* Error Popup */}
        {showErrorPopup && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-xl p-6 max-w-sm w-full text-center">
              <div className="text-4xl mb-4">😅</div>
              <h3 className="text-xl font-bold mb-2">Oops!</h3>
              <p className="text-gray-400 mb-4">{error || 'Something went wrong. Please try again.'}</p>
              <button
                onClick={() => setShowErrorPopup(false)}
                className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-lg"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
        
        {/* Loading State */}
        {isGenerating && (
          <div className="text-center py-12">
            <div className="animate-spin w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-400">
              {mode === 'random' ? 'The AI is cooking up something wild...' : 'Creating your Pokémon...'}
            </p>
          </div>
        )}
        
        {/* Pokemon Result */}
        {pokemon && !isGenerating && <PokemonCard pokemon={pokemon} imageKey={imageKey} />}
        
        {/* Post-creation options */}
        {pokemon && !isGenerating && (
          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={() => {
                setPokemon(null);
                setDescription('');
                setSelectedTypes([]);
              }}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg transition-all"
            >
              Create Another
            </button>
            <button
              onClick={() => onNavigate && onNavigate('pokedex')}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-lg transition-all"
            >
              View in Pokédex
            </button>
          </div>
        )}
      </div>
    </div>
  );
}