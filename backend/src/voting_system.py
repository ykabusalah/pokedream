"""
PokéDream Voting System
Tracks votes and prevents duplicate voting.
"""

import json
from pathlib import Path
from datetime import datetime
from typing import Optional, Dict, List


class VotingSystem:
    """Manages tournament votes."""
    
    def __init__(self, db_path: str = "data/votes.json"):
        self.db_path = Path(db_path)
        self.db_path.parent.mkdir(exist_ok=True)
        self._load()
    
    def _load(self):
        """Load votes from disk."""
        if self.db_path.exists():
            with open(self.db_path, 'r') as f:
                self.data = json.load(f)
        else:
            self.data = {
                "votes": [],
                "created_at": datetime.now().isoformat()
            }
            self._save()
    
    def _save(self):
        """Save votes to disk."""
        with open(self.db_path, 'w') as f:
            json.dump(self.data, f, indent=2)
    
    def cast_vote(
        self, 
        matchup_id: str, 
        trainer_id: str, 
        pokemon_id: int
    ) -> Dict[str, any]:
        """
        Cast a vote for a Pokémon in a matchup.
        
        Returns:
            Dict with success status and message
        """
        # Check if trainer already voted on this matchup
        if self.has_voted(matchup_id, trainer_id):
            return {
                "success": False,
                "message": "You already voted on this matchup"
            }
        
        # Record vote
        vote = {
            "matchup_id": matchup_id,
            "trainer_id": trainer_id,
            "pokemon_id": pokemon_id,
            "timestamp": datetime.now().isoformat()
        }
        
        self.data["votes"].append(vote)
        self._save()
        
        return {
            "success": True,
            "message": "Vote recorded!",
            "vote": vote
        }
    
    def has_voted(self, matchup_id: str, trainer_id: str) -> bool:
        """Check if trainer has already voted on a matchup."""
        for vote in self.data["votes"]:
            if (vote["matchup_id"] == matchup_id and 
                vote["trainer_id"] == trainer_id):
                return True
        return False
    
    def get_matchup_votes(self, matchup_id: str) -> Dict[int, int]:
        """Get vote counts for a matchup."""
        counts = {}
        
        for vote in self.data["votes"]:
            if vote["matchup_id"] == matchup_id:
                pokemon_id = vote["pokemon_id"]
                counts[pokemon_id] = counts.get(pokemon_id, 0) + 1
        
        return counts
    
    def get_trainer_votes(self, trainer_id: str, tournament_id: str) -> List[Dict]:
        """Get all votes by a trainer in a tournament."""
        return [
            vote for vote in self.data["votes"]
            if (vote["trainer_id"] == trainer_id and 
                vote["matchup_id"].startswith(tournament_id))
        ]
    
    def get_pokemon_total_votes(self, pokemon_id: int) -> int:
        """Get total votes a Pokémon has received across all tournaments."""
        return len([
            vote for vote in self.data["votes"]
            if vote["pokemon_id"] == pokemon_id
        ])
    
    def get_trainer_voting_stats(self, trainer_id: str) -> Dict:
        """Get voting statistics for a trainer."""
        trainer_votes = [
            vote for vote in self.data["votes"]
            if vote["trainer_id"] == trainer_id
        ]
        
        return {
            "total_votes": len(trainer_votes),
            "tournaments_participated": len(set(
                vote["matchup_id"].split("_")[0] 
                for vote in trainer_votes
            ))
        }


# Global instance
_voting_system = None

def get_voting_system() -> VotingSystem:
    """Get global voting system instance."""
    global _voting_system
    if _voting_system is None:
        _voting_system = VotingSystem()
    return _voting_system


# Test
if __name__ == "__main__":
    system = get_voting_system()
    
    # Test vote
    result = system.cast_vote(
        matchup_id="s1w1_r1_m0",
        trainer_id="test_trainer",
        pokemon_id=42
    )
    print(f"Vote result: {result}")
    
    # Check duplicate
    result2 = system.cast_vote(
        matchup_id="s1w1_r1_m0",
        trainer_id="test_trainer",
        pokemon_id=127
    )
    print(f"Duplicate vote: {result2}")
    
    # Get counts
    counts = system.get_matchup_votes("s1w1_r1_m0")
    print(f"Matchup votes: {counts}")