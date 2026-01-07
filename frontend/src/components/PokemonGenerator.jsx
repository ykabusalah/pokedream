import { useState } from 'react';

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

// Pokéball Loading Spinner
const PokeballSpinner = () => (
  <div className="relative w-20 h-20 animate-spin">
    <svg viewBox="0 0 100 100" className="w-full h-full">
      {/* Top half - red */}
      <path d="M 50 5 A 45 45 0 0 1 95 50 L 65 50 A 15 15 0 0 0 35 50 L 5 50 A 45 45 0 0 1 50 5" fill="#EF4444"/>
      {/* Bottom half - white */}
      <path d="M 50 95 A 45 45 0 0 1 5 50 L 35 50 A 15 15 0 0 0 65 50 L 95 50 A 45 45 0 0 1 50 95" fill="#F8F8F8"/>
      {/* Center line */}
      <rect x="5" y="47" width="90" height="6" fill="#333"/>
      {/* Center button */}
      <circle cx="50" cy="50" r="12" fill="#F8F8F8" stroke="#333" strokeWidth="4"/>
      <circle cx="50" cy="50" r="6" fill="#333"/>
    </svg>
  </div>
);

// Lab Background Pattern
const LabBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {/* Grid pattern */}
    <div 
      className="absolute inset-0 opacity-5"
      style={{
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px'
      }}
    />
    {/* Pokéball watermarks */}
    <div className="absolute top-10 right-10 opacity-5">
      <svg viewBox="0 0 100 100" className="w-32 h-32">
        <circle cx="50" cy="50" r="45" fill="none" stroke="white" strokeWidth="4"/>
        <path d="M 5 50 L 95 50" stroke="white" strokeWidth="4"/>
        <circle cx="50" cy="50" r="12" fill="none" stroke="white" strokeWidth="4"/>
      </svg>
    </div>
    <div className="absolute bottom-20 left-10 opacity-5">
      <svg viewBox="0 0 100 100" className="w-24 h-24">
        <circle cx="50" cy="50" r="45" fill="none" stroke="white" strokeWidth="4"/>
        <path d="M 5 50 L 95 50" stroke="white" strokeWidth="4"/>
        <circle cx="50" cy="50" r="12" fill="none" stroke="white" strokeWidth="4"/>
      </svg>
    </div>
    {/* Gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-b from-red-950/20 via-transparent to-gray-950"/>
  </div>
);

// Mini Blaine Helper
const BlaineHelper = ({ message }) => (
  <div className="flex items-end gap-3 mb-6">
    <div className="relative">
      <img 
        src="/blaine.png" 
        alt="Blaine" 
        className="w-16 h-16 object-contain"
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
    <div 
      className="bg-white text-gray-800 px-4 py-2 rounded-xl rounded-bl-none text-sm max-w-xs shadow-lg"
      style={{ border: '2px solid #666' }}
    >
      {message}
    </div>
  </div>
);

// Stat bar component
const StatBar = ({ label, value, color }) => (
  <div className="flex items-center gap-2 text-sm">
    <span className="w-16 text-gray-300 font-medium">{label}</span>
    <div className="flex-1 h-3 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
      <div 
        className="h-full rounded-full transition-all duration-700 ease-out"
        style={{ 
          width: `${(value / 255) * 100}%`, 
          backgroundColor: color,
          boxShadow: `0 0 10px ${color}50`
        }}
      />
    </div>
    <span className="w-8 text-right text-white font-bold">{value}</span>
  </div>
);

// Pokemon card display - TCG style
const PokemonCard = ({ pokemon, imageKey }) => {
  const { name, types, stats, moveset, lore, image_path, is_shiny, dex_number } = pokemon;
  const primaryType = types?.[0] || 'Normal';
  const imageUrl = image_path ? `${API_URL}/${image_path}?t=${imageKey}` : null;
  
  return (
    <div className="relative">
      {/* Shiny sparkle effect */}
      {is_shiny && (
        <div className="absolute -inset-4 pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-yellow-300 rounded-full animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: '1.5s'
              }}
            />
          ))}
        </div>
      )}
      
      <div 
        className="relative rounded-2xl p-1 max-w-md mx-auto"
        style={{
          background: is_shiny 
            ? 'linear-gradient(135deg, #ffd700, #ffed4a, #ffd700, #ff6b6b, #ffd700)'
            : `linear-gradient(135deg, ${TYPE_COLORS[primaryType]}, ${TYPE_COLORS[types?.[1]] || TYPE_COLORS[primaryType]})`
        }}
      >
        <div className="bg-gray-900 rounded-xl p-5">
          {/* Header */}
          <div className="flex justify-between items-start mb-3">
            <div>
              <div className="text-xs text-gray-500 font-mono">#{String(dex_number || 0).padStart(3, '0')}</div>
              <h2 className="text-2xl font-bold text-white">{name}</h2>
            </div>
            <div className="flex gap-1">
              {types?.map(type => (
                <div 
                  key={type}
                  className="px-3 py-1 rounded-full text-xs font-bold text-white flex items-center gap-1"
                  style={{ backgroundColor: TYPE_COLORS[type] }}
                >
                  <span>{TYPE_ICONS[type]}</span>
                  {type}
                </div>
              ))}
            </div>
          </div>
          
          {/* Shiny badge */}
          {is_shiny && (
            <div className="absolute top-3 right-3 px-3 py-1 bg-gradient-to-r from-yellow-400 to-amber-500 text-black text-xs font-bold rounded-full animate-pulse shadow-lg">
              ✨ SHINY ✨
            </div>
          )}
          
          {/* Image */}
          {imageUrl && (
            <div 
              className="relative mb-4 rounded-xl overflow-hidden"
              style={{
                background: `linear-gradient(180deg, ${TYPE_COLORS[primaryType]}30 0%, transparent 100%)`
              }}
            >
              <img 
                src={imageUrl} 
                alt={name}
                className="w-full aspect-square object-contain"
              />
              {is_shiny && (
                <div className="absolute inset-0 bg-gradient-to-tr from-yellow-500/10 via-transparent to-yellow-500/10 animate-pulse" />
              )}
            </div>
          )}
          
          {/* Stats */}
          {stats && (
            <div className="space-y-2 mb-4 p-3 bg-gray-800/50 rounded-xl">
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
              <h3 className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Moves</h3>
              <div className="flex flex-wrap gap-2">
                {moveset.current_moves.map(move => (
                  <span 
                    key={move} 
                    className="px-3 py-1 bg-gray-800 rounded-lg text-sm text-gray-300 border border-gray-700"
                  >
                    {move}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Lore */}
          {lore?.pokedex_entry && (
            <div className="p-3 bg-gray-800/50 rounded-xl border-l-4 border-amber-500">
              <p className="text-sm text-gray-400 italic">"{lore.pokedex_entry}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Type selector badge
const TypeBadge = ({ type, selected, onClick }) => (
  <button
    onClick={onClick}
    className={`
      relative px-3 py-2 rounded-lg text-sm font-bold transition-all duration-200
      flex items-center gap-1.5
      ${selected 
        ? 'scale-110 shadow-lg ring-2 ring-white ring-offset-2 ring-offset-gray-900' 
        : 'opacity-70 hover:opacity-100 hover:scale-105'
      }
    `}
    style={{ 
      backgroundColor: TYPE_COLORS[type],
      boxShadow: selected ? `0 0 20px ${TYPE_COLORS[type]}80` : 'none'
    }}
  >
    <span className="text-base">{TYPE_ICONS[type]}</span>
    <span className="text-white">{type}</span>
  </button>
);

export default function PokemonGenerator({ trainerName, onNavigate }) {
  const [description, setDescription] = useState('');
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [pokemon, setPokemon] = useState(null);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState('simple');
  const [imageKey, setImageKey] = useState(Date.now());
  const [showErrorPopup, setShowErrorPopup] = useState(false);

  const toggleType = (type) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter(t => t !== type));
    } else if (selectedTypes.length < 2) {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  const getBlaineMessage = () => {
    if (isGenerating) return "The machine is whirring... this is my favorite part!";
    if (pokemon) return `${pokemon.name}! A fine specimen! ${pokemon.is_shiny ? "AND IT'S SHINY! Quick, save it!" : ""}`;
    if (mode === 'random') return "Feeling lucky? My randomizer has produced some... interesting results.";
    if (mode === 'advanced') return "Ah, a trainer who knows what they want! Choose your types wisely.";
    return "Describe your dream Pokémon! Be creative - the AI loves weird concepts.";
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
    <div className="min-h-screen bg-gray-950 text-white relative">
      <LabBackground />
      
      <div className="relative z-10 p-4 max-w-2xl mx-auto">
        {/* Blaine Helper */}
        <div className="pt-6">
          <BlaineHelper message={getBlaineMessage()} />
        </div>
        
        {/* Mode Toggle - Pokéball themed */}
        <div className="flex justify-center gap-2 mb-6">
          {[
            { id: 'simple', label: 'Simple', icon: '📝' },
            { id: 'advanced', label: 'Advanced', icon: '⚙️' },
            { id: 'random', label: 'Surprise Me', icon: '🎲' }
          ].map(m => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`
                px-5 py-3 rounded-full font-bold transition-all duration-200
                flex items-center gap-2
                ${mode === m.id 
                  ? m.id === 'random'
                    ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30 scale-105'
                    : 'bg-red-500 text-white shadow-lg shadow-red-500/30 scale-105'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 border border-gray-700'
                }
              `}
            >
              <span>{m.icon}</span>
              {m.label}
            </button>
          ))}
        </div>
        
        {/* Input Form */}
        {mode !== 'random' ? (
          <div 
            className="rounded-2xl p-1 mb-8"
            style={{
              background: 'linear-gradient(135deg, #DC2626, #991B1B, #DC2626)'
            }}
          >
            <div className="bg-gray-900 rounded-xl p-6">
              {/* Screen effect header */}
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"/>
                <div className="w-3 h-3 rounded-full bg-yellow-500"/>
                <div className="flex-1 h-1 bg-gray-800 rounded"/>
                <span className="text-xs text-gray-500 font-mono">POKÉ-GENERATOR v1.0</span>
              </div>
              
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A majestic ice dragon inspired by Himalayan mythology..."
                className="w-full bg-gray-950 text-green-400 font-mono p-4 rounded-lg resize-none h-32 outline-none focus:ring-2 focus:ring-red-500 mb-4 border border-gray-800"
                style={{
                  textShadow: '0 0 10px rgba(74, 222, 128, 0.3)'
                }}
              />
              
              {/* Type selector (advanced mode) */}
              {mode === 'advanced' && (
                <div className="mb-4">
                  <p className="text-sm text-gray-400 mb-3 flex items-center gap-2">
                    <span>Select up to 2 types:</span>
                    {selectedTypes.length > 0 && (
                      <span className="text-xs bg-gray-800 px-2 py-1 rounded">
                        {selectedTypes.length}/2 selected
                      </span>
                    )}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {POKEMON_TYPES.map(type => (
                      <TypeBadge
                        key={type}
                        type={type}
                        selected={selectedTypes.includes(type)}
                        onClick={() => toggleType(type)}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !description.trim()}
                className="w-full py-4 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg shadow-red-500/20 flex items-center justify-center gap-2"
              >
                <span className="text-xl">⚡</span>
                {isGenerating ? 'Generating...' : 'Generate Pokémon'}
              </button>
            </div>
          </div>
        ) : (
          /* Random Mode UI */
          <div 
            className="rounded-2xl p-1 mb-8"
            style={{
              background: 'linear-gradient(135deg, #7C3AED, #5B21B6, #7C3AED)'
            }}
          >
            <div className="bg-gray-900 rounded-xl p-8 text-center">
              <div className="text-7xl mb-4 animate-bounce">🎲</div>
              <h2 className="text-2xl font-bold mb-2">Feeling Lucky?</h2>
              <p className="text-gray-400 mb-6 max-w-sm mx-auto">
                Let the AI surprise you with a completely random Pokémon!
                No prompts, no choices — pure chaos.
              </p>
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="px-10 py-4 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all text-lg shadow-lg shadow-purple-500/30"
              >
                {isGenerating ? '🎲 Rolling...' : '🎲 Surprise Me!'}
              </button>
            </div>
          </div>
        )}
        
        {/* Error Popup */}
        {showErrorPopup && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div 
              className="rounded-2xl p-1 max-w-sm w-full"
              style={{ background: 'linear-gradient(135deg, #DC2626, #991B1B)' }}
            >
              <div className="bg-gray-900 rounded-xl p-6 text-center">
                <div className="text-5xl mb-4">😅</div>
                <h3 className="text-xl font-bold mb-2">Oops!</h3>
                <p className="text-gray-400 mb-4">{error || 'Something went wrong. Please try again.'}</p>
                <button
                  onClick={() => setShowErrorPopup(false)}
                  className="px-6 py-2 bg-red-500 hover:bg-red-400 text-white font-bold rounded-lg"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Loading State */}
        {isGenerating && (
          <div className="flex flex-col items-center justify-center py-12">
            <PokeballSpinner />
            <p className="text-gray-400 mt-6 animate-pulse">
              {mode === 'random' ? 'The AI is cooking up something wild...' : 'Creating your Pokémon...'}
            </p>
            <p className="text-gray-600 text-sm mt-2">This may take 15-30 seconds</p>
          </div>
        )}
        
        {/* Pokemon Result */}
        {pokemon && !isGenerating && <PokemonCard pokemon={pokemon} imageKey={imageKey} />}
        
        {/* Post-creation options */}
        {pokemon && !isGenerating && (
          <div className="flex justify-center gap-4 mt-6 pb-8">
            <button
              onClick={() => {
                setPokemon(null);
                setDescription('');
                setSelectedTypes([]);
              }}
              className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl transition-all border border-gray-700 flex items-center gap-2"
            >
              <span>🔄</span> Create Another
            </button>
            <button
              onClick={() => onNavigate && onNavigate('pokedex')}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-white font-bold rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2"
            >
              <span>📖</span> View in Pokédex
            </button>
          </div>
        )}
      </div>
    </div>
  );
}