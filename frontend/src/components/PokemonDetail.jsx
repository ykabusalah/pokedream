import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const TYPE_COLORS = {
  Normal: '#A8A878', Fire: '#F08030', Water: '#6890F0', Electric: '#F8D030',
  Grass: '#78C850', Ice: '#98D8D8', Fighting: '#C03028', Poison: '#A040A0',
  Ground: '#E0C068', Flying: '#A890F0', Psychic: '#F85888', Bug: '#A8B820',
  Rock: '#B8A038', Ghost: '#705898', Dragon: '#7038F8', Dark: '#705848',
  Steel: '#B8B8D0', Fairy: '#EE99AC'
};

const TypeBadge = ({ type }) => (
  <span 
    className="px-4 py-1.5 rounded-full text-sm font-bold text-white"
    style={{ backgroundColor: TYPE_COLORS[type] || '#888' }}
  >
    {type}
  </span>
);

const StatBar = ({ label, value, max = 255 }) => {
  const getColor = () => {
    const percent = value / max;
    if (percent < 0.3) return '#ef4444';
    if (percent < 0.5) return '#f97316';
    if (percent < 0.7) return '#eab308';
    return '#22c55e';
  };
  
  return (
    <div className="flex items-center gap-3">
      <span className="w-20 text-sm text-gray-400">{label}</span>
      <div className="flex-1 h-3 bg-gray-800 rounded-full overflow-hidden">
        <div 
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${(value / max) * 100}%`, backgroundColor: getColor() }}
        />
      </div>
      <span className="w-10 text-sm text-right font-mono text-gray-300">{value}</span>
    </div>
  );
};

export default function PokemonDetail({ dexNumber, onNavigate }) {
  const [pokemon, setPokemon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPokemon();
  }, [dexNumber]);

  const loadPokemon = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/pokedex/${dexNumber}`);
      if (!res.ok) throw new Error('Pokemon not found');
      const data = await res.json();
      setPokemon(data.pokemon);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-400">Loading Pokémon...</p>
        </div>
      </div>
    );
  }

  if (error || !pokemon) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">?</div>
          <h2 className="text-2xl font-bold text-white mb-2">Pokémon Not Found</h2>
          <p className="text-gray-400 mb-6">This Pokémon doesn't exist in the Oneira Pokédex.</p>
          <button
            onClick={() => onNavigate('pokedex')}
            className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-lg"
          >
            Back to Pokédex
          </button>
        </div>
      </div>
    );
  }

  const { 
    name, types, stats, pokedex_entry, moveset, image_path, 
    is_shiny, dex_number: dexNum, abilities, signature_move,
    category, height_m, weight_kg, trainer, added_at, hall_of_fame_badge
  } = pokemon;
  
  const imageUrl = image_path ? `${API_URL}/${image_path}` : null;
  const bst = stats ? Object.values(stats).reduce((a, b) => a + b, 0) : 0;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => onNavigate('pokedex')}
            className="text-gray-400 hover:text-white transition-all flex items-center gap-2"
          >
            ← Back to Pokédex
          </button>
          <span className="text-gray-500">
            #{String(dexNum).padStart(4, '0')}
          </span>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left: Image */}
          <div>
            <div 
              className="bg-gray-900 rounded-2xl p-6 relative"
              style={{ border: '3px solid #374151' }}
            >
              {/* Hall of Fame Badge */}
              {hall_of_fame_badge && (
                <div className="absolute top-4 left-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 shadow-lg z-10">
                  <span>🏆</span> {hall_of_fame_badge}
                </div>
              )}
              
              {/* Shiny Badge */}
              {is_shiny && (
                <div className="absolute top-4 right-4 bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                  ✨ SHINY
                </div>
              )}
              
              {imageUrl && (
                <img 
                  src={imageUrl} 
                  alt={name}
                  className="w-full aspect-square object-contain"
                />
              )}
            </div>
            
            {/* Navigation */}
            <div className="flex justify-between mt-4">
              <button
                onClick={() => dexNum > 1 && onNavigate('pokemon', dexNum - 1)}
                disabled={dexNum <= 1}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition-all"
              >
                ← #{String(dexNum - 1).padStart(4, '0')}
              </button>
              <button
                onClick={() => onNavigate('pokemon', dexNum + 1)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all"
              >
                #{String(dexNum + 1).padStart(4, '0')} →
              </button>
            </div>
          </div>
          
          {/* Right: Info */}
          <div>
            {/* Name & Types */}
            <div className="mb-6">
              <h1 className="text-4xl font-bold mb-2">{name}</h1>
              {category && <p className="text-gray-400 mb-3">{category}</p>}
              <div className="flex gap-2">
                {types?.map(t => <TypeBadge key={t} type={t} />)}
              </div>
            </div>
            
            {/* Pokedex Entry */}
            {pokedex_entry && (
              <div className="bg-gray-900 rounded-xl p-4 mb-6" style={{ border: '2px solid #374151' }}>
                <p className="text-gray-300 italic">"{pokedex_entry}"</p>
              </div>
            )}
            
            {/* Physical */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {height_m && (
                <div className="bg-gray-900 rounded-lg p-3 text-center">
                  <p className="text-gray-500 text-sm">Height</p>
                  <p className="text-xl font-bold">{height_m}m</p>
                </div>
              )}
              {weight_kg && (
                <div className="bg-gray-900 rounded-lg p-3 text-center">
                  <p className="text-gray-500 text-sm">Weight</p>
                  <p className="text-xl font-bold">{weight_kg}kg</p>
                </div>
              )}
            </div>
            
            {/* Abilities */}
            {abilities && abilities.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-bold text-gray-500 mb-2">ABILITIES</h3>
                <div className="flex flex-wrap gap-2">
                  {abilities.map((ability, i) => (
                    <span key={i} className="px-3 py-1 bg-gray-800 rounded-full text-sm">
                      {ability}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Stats */}
            {stats && (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-bold text-gray-500">BASE STATS</h3>
                  <span className="text-gray-400 text-sm">BST: {bst}</span>
                </div>
                <div className="space-y-2">
                  <StatBar label="HP" value={stats.hp} />
                  <StatBar label="Attack" value={stats.attack} />
                  <StatBar label="Defense" value={stats.defense} />
                  <StatBar label="Sp. Atk" value={stats.sp_attack} />
                  <StatBar label="Sp. Def" value={stats.sp_defense} />
                  <StatBar label="Speed" value={stats.speed} />
                </div>
              </div>
            )}
            
            {/* Signature Move */}
            {signature_move && (
              <div className="mb-6">
                <h3 className="text-sm font-bold text-gray-500 mb-2">SIGNATURE MOVE</h3>
                <div className="bg-gray-900 rounded-lg p-3" style={{ border: '2px solid #374151' }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold">{signature_move.name}</span>
                    <span 
                      className="px-2 py-0.5 rounded text-xs font-bold"
                      style={{ backgroundColor: TYPE_COLORS[signature_move.type] || '#888' }}
                    >
                      {signature_move.type}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm">
                    {signature_move.category} • {signature_move.power} BP • {signature_move.accuracy}% Acc
                  </p>
                  {signature_move.description && (
                    <p className="text-gray-500 text-sm mt-2">{signature_move.description}</p>
                  )}
                </div>
              </div>
            )}
            
            {/* Moves */}
            {moveset?.current_moves && (
              <div className="mb-6">
                <h3 className="text-sm font-bold text-gray-500 mb-2">MOVESET</h3>
                <div className="flex flex-wrap gap-2">
                  {moveset.current_moves.map(move => (
                    <span key={move} className="px-3 py-1 bg-gray-800 rounded-full text-sm">
                      {move}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Meta */}
            <div className="text-sm text-gray-600 pt-4 border-t border-gray-800">
              {trainer && <p>Created by: {trainer}</p>}
              {added_at && <p>Added: {new Date(added_at).toLocaleDateString()}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}