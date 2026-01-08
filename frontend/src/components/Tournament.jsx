import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:8000';

const TYPE_COLORS = {
  Normal: '#A8A878', Fire: '#F08030', Water: '#6890F0', Electric: '#F8D030',
  Grass: '#78C850', Ice: '#98D8D8', Fighting: '#C03028', Poison: '#A040A0',
  Ground: '#E0C068', Flying: '#A890F0', Psychic: '#F85888', Bug: '#A8B820',
  Rock: '#B8A038', Ghost: '#705898', Dragon: '#7038F8', Dark: '#705848',
  Steel: '#B8B8D0', Fairy: '#EE99AC'
};

// Matchup Card Component
const MatchupCard = ({ matchup, onVote, trainerId }) => {
  const [voting, setVoting] = useState(false);
  
  const handleVote = async (pokemonId) => {
    if (matchup.has_voted || voting) return;
    
    setVoting(true);
    await onVote(matchup.matchup_id, pokemonId);
    setVoting(false);
  };
  
  const getLeadingPokemon = () => {
    if (matchup.votes_a > matchup.votes_b) return 'a';
    if (matchup.votes_b > matchup.votes_a) return 'b';
    return null;
  };
  
  const leader = getLeadingPokemon();
  const totalVotes = matchup.votes_a + matchup.votes_b;
  
  const getVotePercentage = (votes) => {
    if (totalVotes === 0) return 50;
    return (votes / totalVotes) * 100;
  };
  
  return (
    <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-800 p-6 hover:border-amber-500/30 transition-all">
      {/* VS Badge */}
      <div className="flex justify-center mb-4">
        <div className="bg-red-600 text-white px-4 py-1 rounded-full text-sm font-bold">
          VS
        </div>
      </div>
      
      {/* Matchup */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Pokémon A */}
        <button
          onClick={() => handleVote(matchup.pokemon_a.dex_number)}
          disabled={matchup.has_voted || voting || matchup.pokemon_a.trainer_id === trainerId}
          className={`
            p-4 rounded-xl transition-all relative overflow-hidden
            ${matchup.has_voted ? 'cursor-default' : 'hover:scale-105 cursor-pointer'}
            ${leader === 'a' ? 'ring-2 ring-amber-500' : ''}
            ${matchup.pokemon_a.trainer_id === trainerId ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          style={{
            background: `linear-gradient(135deg, ${TYPE_COLORS[matchup.pokemon_a.types[0]]}40, ${TYPE_COLORS[matchup.pokemon_a.types[0]]}20)`
          }}
        >
          {matchup.pokemon_a.image_path && (
            <img
              src={`${API_URL}/${matchup.pokemon_a.image_path}`}
              alt={matchup.pokemon_a.name}
              className="w-full aspect-square object-contain mb-2"
            />
          )}
          <div className="text-white font-bold text-center text-sm mb-1">
            {matchup.pokemon_a.name}
          </div>
          <div className="text-xs text-gray-400 text-center">
            #{String(matchup.pokemon_a.dex_number).padStart(3, '0')}
          </div>
          
          {matchup.pokemon_a.trainer_id === trainerId && (
            <div className="absolute top-2 right-2 bg-cyan-500 text-white text-xs px-2 py-1 rounded-full">
              Yours
            </div>
          )}
        </button>
        
        {/* Pokémon B */}
        <button
          onClick={() => handleVote(matchup.pokemon_b.dex_number)}
          disabled={matchup.has_voted || voting || matchup.pokemon_b.trainer_id === trainerId}
          className={`
            p-4 rounded-xl transition-all relative overflow-hidden
            ${matchup.has_voted ? 'cursor-default' : 'hover:scale-105 cursor-pointer'}
            ${leader === 'b' ? 'ring-2 ring-amber-500' : ''}
            ${matchup.pokemon_b.trainer_id === trainerId ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          style={{
            background: `linear-gradient(135deg, ${TYPE_COLORS[matchup.pokemon_b.types[0]]}40, ${TYPE_COLORS[matchup.pokemon_b.types[0]]}20)`
          }}
        >
          {matchup.pokemon_b.image_path && (
            <img
              src={`${API_URL}/${matchup.pokemon_b.image_path}`}
              alt={matchup.pokemon_b.name}
              className="w-full aspect-square object-contain mb-2"
            />
          )}
          <div className="text-white font-bold text-center text-sm mb-1">
            {matchup.pokemon_b.name}
          </div>
          <div className="text-xs text-gray-400 text-center">
            #{String(matchup.pokemon_b.dex_number).padStart(3, '0')}
          </div>
          
          {matchup.pokemon_b.trainer_id === trainerId && (
            <div className="absolute top-2 right-2 bg-cyan-500 text-white text-xs px-2 py-1 rounded-full">
              Yours
            </div>
          )}
        </button>
      </div>
      
      {/* Vote Bar */}
      <div className="relative h-8 bg-gray-800 rounded-full overflow-hidden mb-2">
        <div
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-500"
          style={{ width: `${getVotePercentage(matchup.votes_a)}%` }}
        />
        <div
          className="absolute right-0 top-0 h-full bg-gradient-to-l from-red-500 to-red-400 transition-all duration-500"
          style={{ width: `${getVotePercentage(matchup.votes_b)}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm">
          {matchup.votes_a} - {matchup.votes_b}
        </div>
      </div>
      
      {/* Status */}
      {matchup.has_voted && (
        <div className="text-center text-green-400 text-sm">
          ✓ You voted in this matchup
        </div>
      )}
      
      {!matchup.has_voted && (matchup.pokemon_a.trainer_id === trainerId || matchup.pokemon_b.trainer_id === trainerId) && (
        <div className="text-center text-gray-500 text-sm">
          Cannot vote on your own Pokémon
        </div>
      )}
    </div>
  );
};

// Main Tournament Component
export default function Tournament({ trainerId, onNavigate }) {
  const [tournament, setTournament] = useState(null);
  const [matchups, setMatchups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [votingProgress, setVotingProgress] = useState({ voted: 0, total: 0 });
  
  useEffect(() => {
    fetchTournament();
  }, [trainerId]);
  
  const fetchTournament = async () => {
    try {
      const res = await fetch(`${API_URL}/api/tournament/current/matchups?trainer_id=${trainerId}`);
      const data = await res.json();
      
      setTournament(data.tournament);
      setMatchups(data.matchups || []);
      
      // Calculate voting progress
      const voted = data.matchups?.filter(m => m.has_voted).length || 0;
      const total = data.matchups?.length || 0;
      setVotingProgress({ voted, total });
    } catch (err) {
      console.error('Failed to fetch tournament:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleVote = async (matchupId, pokemonId) => {
    try {
      const res = await fetch(`${API_URL}/api/tournament/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchup_id: matchupId,
          trainer_id: trainerId,
          pokemon_id: pokemonId
        })
      });
      
      if (!res.ok) {
        const error = await res.json();
        alert(error.detail || 'Failed to cast vote');
        return;
      }
      
      // Refresh matchups
      await fetchTournament();
    } catch (err) {
      console.error('Vote failed:', err);
      alert('Failed to cast vote');
    }
  };
  
  const getRoundName = (round) => {
    const names = {
      1: 'Round of 16',
      2: 'Quarterfinals',
      3: 'Semifinals',
      4: 'Finals'
    };
    return names[round] || `Round ${round}`;
  };
  
  const getTimeRemaining = () => {
    if (!tournament) return '';
    
    const now = new Date();
    const end = new Date(tournament.end_date);
    const diff = end - now;
    
    if (diff <= 0) return 'Tournament ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h remaining`;
    return `${hours}h remaining`;
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-400">Loading tournament...</p>
        </div>
      </div>
    );
  }
  
  if (!tournament) {
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="text-6xl mb-4">🏆</div>
          <h2 className="text-3xl font-bold mb-4">No Active Tournament</h2>
          <p className="text-gray-400 mb-8">Check back soon for the next tournament!</p>
          <button
            onClick={() => onNavigate('generator')}
            className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-xl transition-all"
          >
            Create Pokémon
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gray-900/50 border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <span>🏆</span>
                Oneira Tournament
              </h1>
              <p className="text-gray-400 mt-1">
                Season {tournament.season} • Week {tournament.week}
              </p>
            </div>
            <div className="text-right">
              <div className="text-amber-400 font-bold">{getTimeRemaining()}</div>
              <div className="text-sm text-gray-500">
                {getRoundName(tournament.current_round)}
              </div>
            </div>
          </div>
          
          {/* Tournament Description */}
          <div className="bg-gray-800/50 rounded-xl p-4 mb-4 border border-gray-700">
            <div className="flex items-start gap-3">
              <div className="text-2xl">ℹ️</div>
              <div className="flex-1">
                <h3 className="text-white font-bold mb-2">How Tournaments Work</h3>
                <p className="text-gray-300 text-sm mb-2">
                  Every two weeks, 16 Pokémon are randomly selected to compete in a bracket-style tournament. 
                  Vote for your favorites in head-to-head matchups to help them advance through the rounds!
                </p>
                <div className="flex flex-col sm:flex-row gap-3 text-sm">
                  <div className="flex items-start gap-2 sm:w-[33%]">
                    <span className="text-amber-400 flex-shrink-0">•</span>
                    <span className="text-gray-400">4 rounds: Round of 16 → Quarterfinals → Semifinals → Finals</span>
                  </div>
                  <div className="flex items-start gap-2 sm:flex-1">
                    <span className="text-amber-400 flex-shrink-0">•</span>
                    <span className="text-gray-400">Vote once per matchup (can't vote on your own Pokémon)</span>
                  </div>
                  <div className="flex items-start gap-2 sm:flex-3">
                    <span className="text-amber-400 flex-shrink-0">•</span>
                    <span className="text-gray-400">Tournament champion gets inducted into the Hall of Fame!</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Progress */}
          <div className="bg-gray-800/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Your Voting Progress</span>
              <span className="text-sm font-bold text-white">
                {votingProgress.voted}/{votingProgress.total}
              </span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-500"
                style={{ width: `${(votingProgress.voted / votingProgress.total) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Matchups */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {matchups.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">⏳</div>
            <h2 className="text-2xl font-bold mb-2">Round Complete!</h2>
            <p className="text-gray-400">
              Votes are being tallied. Check back soon for the next round.
            </p>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold mb-6">
              {getRoundName(tournament.current_round)} Matchups
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {matchups.map(matchup => (
                <MatchupCard
                  key={matchup.matchup_id}
                  matchup={matchup}
                  onVote={handleVote}
                  trainerId={trainerId}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}