import { useState, useEffect } from 'react';
import { ACHIEVEMENTS } from './AchievementPopup';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const TYPE_COLORS = {
  Normal: '#A8A878', Fire: '#F08030', Water: '#6890F0', Electric: '#F8D030',
  Grass: '#78C850', Ice: '#98D8D8', Fighting: '#C03028', Poison: '#A040A0',
  Ground: '#E0C068', Flying: '#A890F0', Psychic: '#F85888', Bug: '#A8B820',
  Rock: '#B8A038', Ghost: '#705898', Dragon: '#7038F8', Dark: '#705848',
  Steel: '#B8B8D0', Fairy: '#EE99AC'
};

// ============================================
// POKÉBALL BACKGROUND
// ============================================

const PokeballBackground = () => (
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
    
    {/* Pokéball - top left (large) */}
    <div className="absolute top-8 left-12 opacity-[0.06]">
      <svg viewBox="0 0 100 100" className="w-28 h-28">
        <circle cx="50" cy="50" r="45" fill="none" stroke="white" strokeWidth="4"/>
        <path d="M 5 50 L 95 50" stroke="white" strokeWidth="4"/>
        <circle cx="50" cy="50" r="12" fill="none" stroke="white" strokeWidth="4"/>
      </svg>
    </div>
    
    {/* Pokéball - top right (small) */}
    <div className="absolute top-24 right-16 opacity-[0.05]">
      <svg viewBox="0 0 100 100" className="w-16 h-16">
        <circle cx="50" cy="50" r="45" fill="none" stroke="white" strokeWidth="5"/>
        <path d="M 5 50 L 95 50" stroke="white" strokeWidth="5"/>
        <circle cx="50" cy="50" r="12" fill="none" stroke="white" strokeWidth="5"/>
      </svg>
    </div>
    
    {/* Pokéball - right upper (medium) */}
    <div className="absolute top-[30%] right-6 opacity-[0.07]">
      <svg viewBox="0 0 100 100" className="w-24 h-24">
        <circle cx="50" cy="50" r="45" fill="none" stroke="white" strokeWidth="4"/>
        <path d="M 5 50 L 95 50" stroke="white" strokeWidth="4"/>
        <circle cx="50" cy="50" r="12" fill="none" stroke="white" strokeWidth="4"/>
      </svg>
    </div>
    
    {/* Pokéball - left middle (tiny) */}
    <div className="absolute top-[35%] left-4 opacity-[0.04]">
      <svg viewBox="0 0 100 100" className="w-12 h-12">
        <circle cx="50" cy="50" r="45" fill="none" stroke="white" strokeWidth="6"/>
        <path d="M 5 50 L 95 50" stroke="white" strokeWidth="6"/>
        <circle cx="50" cy="50" r="12" fill="none" stroke="white" strokeWidth="6"/>
      </svg>
    </div>
    
    {/* Pokéball - left of content (medium) */}
    <div className="absolute top-[42%] left-[10%] opacity-[0.06]">
      <svg viewBox="0 0 100 100" className="w-20 h-20">
        <circle cx="50" cy="50" r="45" fill="none" stroke="white" strokeWidth="4"/>
        <path d="M 5 50 L 95 50" stroke="white" strokeWidth="4"/>
        <circle cx="50" cy="50" r="12" fill="none" stroke="white" strokeWidth="4"/>
      </svg>
    </div>
    
    {/* Pokéball - right of content (small) */}
    <div className="absolute top-[55%] right-[14%] opacity-[0.05]">
      <svg viewBox="0 0 100 100" className="w-14 h-14">
        <circle cx="50" cy="50" r="45" fill="none" stroke="white" strokeWidth="5"/>
        <path d="M 5 50 L 95 50" stroke="white" strokeWidth="5"/>
        <circle cx="50" cy="50" r="12" fill="none" stroke="white" strokeWidth="5"/>
      </svg>
    </div>
    
    {/* Pokéball - left lower (large) */}
    <div className="absolute top-[60%] left-[18%] opacity-[0.06]">
      <svg viewBox="0 0 100 100" className="w-26 h-26">
        <circle cx="50" cy="50" r="45" fill="none" stroke="white" strokeWidth="4"/>
        <path d="M 5 50 L 95 50" stroke="white" strokeWidth="4"/>
        <circle cx="50" cy="50" r="12" fill="none" stroke="white" strokeWidth="4"/>
      </svg>
    </div>
    
    {/* Pokéball - right lower (tiny) */}
    <div className="absolute top-[72%] right-8 opacity-[0.04]">
      <svg viewBox="0 0 100 100" className="w-10 h-10">
        <circle cx="50" cy="50" r="45" fill="none" stroke="white" strokeWidth="7"/>
        <path d="M 5 50 L 95 50" stroke="white" strokeWidth="7"/>
        <circle cx="50" cy="50" r="12" fill="none" stroke="white" strokeWidth="7"/>
      </svg>
    </div>
    
    {/* Pokéball - bottom left (medium) */}
    <div className="absolute bottom-32 left-6 opacity-[0.05]">
      <svg viewBox="0 0 100 100" className="w-20 h-20">
        <circle cx="50" cy="50" r="45" fill="none" stroke="white" strokeWidth="4"/>
        <path d="M 5 50 L 95 50" stroke="white" strokeWidth="4"/>
        <circle cx="50" cy="50" r="12" fill="none" stroke="white" strokeWidth="4"/>
      </svg>
    </div>
    
    {/* Pokéball - bottom right (large) */}
    <div className="absolute bottom-20 right-12 opacity-[0.07]">
      <svg viewBox="0 0 100 100" className="w-32 h-32">
        <circle cx="50" cy="50" r="45" fill="none" stroke="white" strokeWidth="4"/>
        <path d="M 5 50 L 95 50" stroke="white" strokeWidth="4"/>
        <circle cx="50" cy="50" r="12" fill="none" stroke="white" strokeWidth="4"/>
      </svg>
    </div>
    
    {/* Pokéball - bottom center left (small) */}
    <div className="absolute bottom-12 left-[25%] opacity-[0.05]">
      <svg viewBox="0 0 100 100" className="w-16 h-16">
        <circle cx="50" cy="50" r="45" fill="none" stroke="white" strokeWidth="5"/>
        <path d="M 5 50 L 95 50" stroke="white" strokeWidth="5"/>
        <circle cx="50" cy="50" r="12" fill="none" stroke="white" strokeWidth="5"/>
      </svg>
    </div>
    
    {/* Pokéball - bottom center right (tiny) */}
    <div className="absolute bottom-40 right-[22%] opacity-[0.04]">
      <svg viewBox="0 0 100 100" className="w-12 h-12">
        <circle cx="50" cy="50" r="45" fill="none" stroke="white" strokeWidth="6"/>
        <path d="M 5 50 L 95 50" stroke="white" strokeWidth="6"/>
        <circle cx="50" cy="50" r="12" fill="none" stroke="white" strokeWidth="6"/>
      </svg>
    </div>
    
    {/* Gradient overlay - amber tint for trainer page */}
    <div className="absolute inset-0 bg-gradient-to-b from-amber-950/20 via-transparent to-gray-950"/>
  </div>
);

// ============================================
// TIME FORMATTING HELPERS
// ============================================

const formatTime = (totalSeconds) => {
  if (totalSeconds < 60) {
    return `${totalSeconds}s`;
  }
  
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

const formatTimeDetailed = (totalSeconds) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
};

// ============================================
// UI COMPONENTS
// ============================================

function StatCard({ icon, label, value, sub, accent }) {
  return (
    <div className={`bg-gray-900/80 backdrop-blur-sm rounded-xl p-4 border transition-all ${
      accent ? 'border-amber-500/50 bg-amber-500/5' : 'border-gray-800'
    }`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{icon}</span>
        <span className="text-gray-400 text-sm">{label}</span>
      </div>
      <div className="text-2xl font-bold">
        {value}
        {sub && <span className="text-gray-500 text-sm ml-1">{sub}</span>}
      </div>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function TrainerProfile({ trainerName, trainerId, onNavigate, onChangeName, activeSeconds = 0, totalSeconds = 0 }) {
  const [stats, setStats] = useState(null);
  const [recentPokemon, setRecentPokemon] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNameEdit, setShowNameEdit] = useState(false);
  const [newName, setNewName] = useState(trainerName);
  const [showAllAchievements, setShowAllAchievements] = useState(false);

  // ============================================
  // DATA FETCHING
  // ============================================

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setNewName(trainerName);
  }, [trainerName]);

  const fetchData = async () => {
    try {
      const [statsRes, recentRes] = await Promise.all([
        fetch(`${API_URL}/api/trainer/${trainerId}/stats`),
        fetch(`${API_URL}/api/trainer/${trainerId}/recent?limit=6`)
      ]);
      const statsData = await statsRes.json();
      const recentData = await recentRes.json();
      setStats(statsData);
      setRecentPokemon(recentData.pokemon || []);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // NAME CHANGE HANDLERS
  // ============================================

  const handleNameChange = () => {
    const trimmedName = newName.trim();
    
    if (!trimmedName) {
      setNewName(trainerName);
      setShowNameEdit(false);
      return;
    }
    
    if (trimmedName === trainerName) {
      setShowNameEdit(false);
      return;
    }
    
    if (onChangeName) {
      onChangeName(trimmedName);
    }
    
    setShowNameEdit(false);
  };

  const handleCancelEdit = () => {
    setNewName(trainerName);
    setShowNameEdit(false);
  };

  // ============================================
  // COMPUTED VALUES
  // ============================================

  const getFavoriteType = () => {
    if (!stats?.type_counts) return null;
    const entries = Object.entries(stats.type_counts);
    if (entries.length === 0) return null;
    return entries.sort((a, b) => b[1] - a[1])[0][0];
  };

  const favoriteType = getFavoriteType();
  const unlockedAchievements = stats ? ACHIEVEMENTS.filter(a => a.check(stats)) : [];
  const typeCounts = Object.entries(stats?.type_counts || {}).sort((a, b) => b[1] - a[1]);
  const maxTypeCount = typeCounts.length > 0 ? typeCounts[0][1] : 1;

  // ============================================
  // RENDER
  // ============================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 relative">
        <PokeballBackground />
        <div className="relative z-10 flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-400">Loading trainer data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white relative">
      <PokeballBackground />
      
      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8">
        {/* Profile Header Card */}
        <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-800 overflow-hidden mb-8">
          <div className="h-24 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-red-500/20" />
          <div className="px-6 pb-6 -mt-12">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4">
              {/* Avatar */}
              <div 
                className="w-24 h-24 rounded-2xl flex items-center justify-center text-4xl border-4 border-gray-900 shadow-xl"
                style={{ backgroundColor: favoriteType ? TYPE_COLORS[favoriteType] : '#f59e0b' }}
              >
                {trainerName.charAt(0).toUpperCase()}
              </div>
              
              <div className="flex-1 text-center sm:text-left">
                {showNameEdit ? (
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="bg-gray-800 text-white px-3 py-1 rounded-lg text-xl font-bold outline-none focus:ring-2 focus:ring-amber-500 max-w-[200px]"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleNameChange();
                        if (e.key === 'Escape') handleCancelEdit();
                      }}
                      maxLength={20}
                    />
                    <button 
                      onClick={handleNameChange} 
                      className="text-green-500 hover:text-green-400 text-xl"
                      title="Save"
                    >
                      ✔
                    </button>
                    <button 
                      onClick={handleCancelEdit} 
                      className="text-red-500 hover:text-red-400 text-xl"
                      title="Cancel"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <h1 
                    className="text-2xl font-bold cursor-pointer hover:text-amber-400 transition-colors inline-flex items-center gap-2 group"
                    onClick={() => setShowNameEdit(true)}
                    title="Click to edit name"
                  >
                    {trainerName}
                    <span className="text-sm text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">✏️</span>
                  </h1>
                )}
                <p className="text-gray-400 mt-1">Oneira Region Trainer</p>
              </div>

              {favoriteType && (
                <div className="text-center mt-12">
                  <div className="text-xs text-gray-500 mb-1">Favorite Type</div>
                  <span 
                    className="px-4 py-2 rounded-full font-bold text-white text-sm inline-block"
                    style={{ backgroundColor: TYPE_COLORS[favoriteType] }}
                  >
                    {favoriteType}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid - 5 items with time from props */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          <StatCard icon="🎴" label="Pokémon Created" value={stats?.total || 0} />
          <StatCard icon="✨" label="Shinies Found" value={stats?.shinies || 0} accent={stats?.shinies > 0} />
          <StatCard icon="🎨" label="Types Discovered" value={Object.keys(stats?.type_counts || {}).length} sub="/18" />
          <StatCard 
            icon="⏱️" 
            label="Active Time" 
            value={formatTimeDetailed(activeSeconds)}
            sub="this visit"
          />
          <StatCard 
            icon="📅" 
            label="Total Time" 
            value={formatTime(totalSeconds)}
            sub="all time"
          />
        </div>

        {/* Two Column Layout */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left: Achievements */}
          <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                🏆 Achievements
                <span className="text-sm font-normal text-gray-500">{unlockedAchievements.length}/{ACHIEVEMENTS.length}</span>
              </h2>
              <button
                onClick={() => setShowAllAchievements(true)}
                className="text-amber-400 hover:text-amber-300 text-sm"
              >
                View All →
              </button>
            </div>
            <div className="space-y-3">
              {/* Show first 6 achievements (prioritize locked/upcoming ones) */}
              {[...ACHIEVEMENTS.filter(a => !stats || !a.check(stats)), ...unlockedAchievements].slice(0, 6).map(a => {
                const unlocked = stats && a.check(stats);
                return (
                  <div 
                    key={a.id}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                      unlocked 
                        ? 'bg-amber-500/10 border border-amber-500/30' 
                        : 'bg-gray-800/50 border border-gray-700/50 opacity-50'
                    }`}
                  >
                    <span className={`text-2xl ${unlocked ? '' : 'grayscale'}`}>{a.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className={`font-medium text-sm ${unlocked ? 'text-amber-400' : 'text-gray-500'}`}>{a.title}</div>
                      <div className="text-xs text-gray-500 truncate">{a.desc}</div>
                    </div>
                    {unlocked && <span className="text-green-500 text-lg">✔</span>}
                  </div>
                );
              })}
            </div>
            {ACHIEVEMENTS.length > 6 && (
              <button
                onClick={() => setShowAllAchievements(true)}
                className="w-full mt-4 py-2 text-sm text-gray-400 hover:text-amber-400 transition-colors"
              >
                +{ACHIEVEMENTS.length - 6} more achievements
              </button>
            )}
          </div>

          {/* Right: Type Distribution + Recent */}
          <div className="space-y-8">
            {/* Type Distribution */}
            <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-800 p-6">
              <h2 className="text-lg font-bold mb-4">📊 Type Distribution</h2>
              {typeCounts.length === 0 ? (
                <p className="text-gray-500 text-sm">Create some Pokémon to see your type distribution!</p>
              ) : (
                <div className="space-y-2">
                  {typeCounts.slice(0, 8).map(([type, count]) => (
                    <div key={type} className="flex items-center gap-2">
                      <span 
                        className="w-16 text-xs font-bold text-white px-2 py-0.5 rounded text-center shrink-0"
                        style={{ backgroundColor: TYPE_COLORS[type] }}
                      >
                        {type}
                      </span>
                      <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${(count / maxTypeCount) * 100}%`, backgroundColor: TYPE_COLORS[type] }}
                        />
                      </div>
                      <span className="text-gray-400 text-sm w-6 text-right">{count}</span>
                    </div>
                  ))}
                  {typeCounts.length > 8 && (
                    <p className="text-gray-500 text-xs mt-2">+{typeCounts.length - 8} more types</p>
                  )}
                </div>
              )}
            </div>

            {/* Recent Creations */}
            <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">🕐 Recent Creations</h2>
                <button 
                  onClick={() => onNavigate('pokedex')}
                  className="text-amber-400 hover:text-amber-300 text-sm"
                >
                  View All →
                </button>
              </div>
              {recentPokemon.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">🥚</div>
                  <p className="text-gray-500 text-sm">No Pokémon yet!</p>
                  <button 
                    onClick={() => onNavigate('generator')}
                    className="mt-3 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-lg text-sm transition-all"
                  >
                    Create Your First
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {recentPokemon.map(p => (
                    <button
                      key={p.id || p.dex_number}
                      onClick={() => onNavigate('pokemon', p.dex_number)}
                      className="group relative aspect-square rounded-xl overflow-hidden bg-gray-800 border border-gray-700 hover:border-amber-500/50 transition-all"
                    >
                      {p.image_path ? (
                        <img 
                          src={`${API_URL}/${p.image_path}`} 
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">❓</div>
                      )}
                      {p.is_shiny && (
                        <div className="absolute top-1 right-1 text-xs">✨</div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                        <div className="text-xs font-medium truncate">{p.name}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <button
            onClick={() => onNavigate('generator')}
            className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-xl transition-all flex items-center gap-2"
          >
            ➕ Create Pokémon
          </button>
          <button
            onClick={() => onNavigate('pokedex')}
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl border border-gray-700 transition-all flex items-center gap-2"
          >
            📖 Open Pokédex
          </button>
        </div>
      </div>
      
      {/* Achievements Modal */}
      {showAllAchievements && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setShowAllAchievements(false)}
        >
          <div 
            className="bg-gray-900 rounded-2xl border border-gray-700 max-w-lg w-full max-h-[80vh] overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                🏆 All Achievements
                <span className="text-sm font-normal text-gray-500">{unlockedAchievements.length}/{ACHIEVEMENTS.length}</span>
              </h2>
              <button
                onClick={() => setShowAllAchievements(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ✕
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[calc(80vh-80px)] space-y-2">
              {ACHIEVEMENTS.map(a => {
                const unlocked = stats && a.check(stats);
                return (
                  <div 
                    key={a.id}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                      unlocked 
                        ? 'bg-amber-500/10 border border-amber-500/30' 
                        : 'bg-gray-800/50 border border-gray-700/50 opacity-50'
                    }`}
                  >
                    <span className={`text-2xl ${unlocked ? '' : 'grayscale'}`}>{a.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className={`font-medium text-sm ${unlocked ? 'text-amber-400' : 'text-gray-500'}`}>{a.title}</div>
                      <div className="text-xs text-gray-500 truncate">{a.desc}</div>
                    </div>
                    {unlocked && <span className="text-green-500 text-lg">✔</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}