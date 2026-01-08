"""
PokéDream Tournament System
Manages bi-weekly tournaments with 16 Pokémon brackets.
"""

import json
import random
from pathlib import Path
from datetime import datetime, timedelta
from typing import Optional, List, Dict


class TournamentSystem:
    """Manages tournament creation, progression, and voting."""
    
    def __init__(self, db_path: str = "data/tournaments.json"):
        self.db_path = Path(db_path)
        self.db_path.parent.mkdir(exist_ok=True)
        self._load()
    
    def _load(self):
        """Load tournament database from disk."""
        if self.db_path.exists():
            with open(self.db_path, 'r') as f:
                self.data = json.load(f)
        else:
            self.data = {
                "current_season": 1,
                "tournaments": [],
                "created_at": datetime.now().isoformat(),
            }
            self._save()
    
    def _save(self):
        """Save tournament database to disk."""
        with open(self.db_path, 'w') as f:
            json.dump(self.data, f, indent=2)
    
    def get_current_tournament(self) -> Optional[Dict]:
        """Get the currently active tournament."""
        now = datetime.now()
        
        for tournament in self.data["tournaments"]:
            start = datetime.fromisoformat(tournament["start_date"])
            end = datetime.fromisoformat(tournament["end_date"])
            
            if start <= now <= end:
                return tournament
        
        return None
    
    def create_tournament(self, pokedex_db) -> Dict:
        """
        Create a new bi-weekly tournament with 16 Pokémon.
        
        Selection criteria:
        - Created within last 14 days
        - Max 2 per type
        - Random selection from eligible pool
        """
        now = datetime.now()
        
        # Calculate tournament dates (14 days)
        start_date = now
        end_date = now + timedelta(days=14)
        
        # Calculate season and week
        season = self.data["current_season"]
        week = len([t for t in self.data["tournaments"] if t["season"] == season]) + 1
        
        # Get eligible Pokémon (created in last 14 days)
        cutoff_date = now - timedelta(days=14)
        all_pokemon = pokedex_db.get_all()
        
        eligible = [
            p for p in all_pokemon 
            if datetime.fromisoformat(p.get("added_at", "2000-01-01")) >= cutoff_date
        ]
        
        # If not enough, expand to last 30 days
        if len(eligible) < 16:
            cutoff_date = now - timedelta(days=30)
            eligible = [
                p for p in all_pokemon 
                if datetime.fromisoformat(p.get("added_at", "2000-01-01")) >= cutoff_date
            ]
        
        # If still not enough, use most recent Pokémon
        if len(eligible) < 16:
            eligible = sorted(
                all_pokemon, 
                key=lambda p: p.get("added_at", "2000-01-01"), 
                reverse=True
            )[:32]  # Get more for filtering
        
        # Ensure type diversity (max 2 per type)
        type_counts = {}
        selected = []
        random.shuffle(eligible)
        
        for pokemon in eligible:
            if len(selected) >= 16:
                break
            
            # Check type diversity
            pokemon_types = pokemon.get("types", [])
            type_ok = True
            
            for ptype in pokemon_types:
                if type_counts.get(ptype, 0) >= 2:
                    type_ok = False
                    break
            
            if type_ok:
                selected.append(pokemon)
                for ptype in pokemon_types:
                    type_counts[ptype] = type_counts.get(ptype, 0) + 1
        
        # If we don't have 16, just take what we have or pad with random
        if len(selected) < 16:
            remaining = [p for p in eligible if p not in selected]
            selected.extend(remaining[:16 - len(selected)])
        
        # Shuffle for random bracket seeding
        random.shuffle(selected)
        selected = selected[:16]
        
        # Create bracket structure (4 rounds)
        # Round 1: 16 → 8 (8 matchups)
        # Round 2: 8 → 4 (4 matchups)
        # Round 3: 4 → 2 (2 matchups)
        # Round 4: 2 → 1 (1 matchup)
        
        tournament_id = f"s{season}w{week}"
        
        bracket = {
            "round_1": [],  # 8 matchups
            "round_2": [],  # 4 matchups
            "round_3": [],  # 2 matchups (semifinals)
            "round_4": []   # 1 matchup (finals)
        }
        
        # Create Round 1 matchups
        for i in range(0, 16, 2):
            matchup = {
                "matchup_id": f"{tournament_id}_r1_m{i//2}",
                "pokemon_a_id": selected[i]["dex_number"],
                "pokemon_b_id": selected[i+1]["dex_number"],
                "votes_a": 0,
                "votes_b": 0,
                "winner_id": None,
                "status": "active"
            }
            bracket["round_1"].append(matchup)
        
        # Create empty future rounds (will be populated as tournament progresses)
        for _ in range(4):
            bracket["round_2"].append({
                "matchup_id": f"{tournament_id}_r2_m{_}",
                "pokemon_a_id": None,
                "pokemon_b_id": None,
                "votes_a": 0,
                "votes_b": 0,
                "winner_id": None,
                "status": "pending"
            })
        
        for _ in range(2):
            bracket["round_3"].append({
                "matchup_id": f"{tournament_id}_r3_m{_}",
                "pokemon_a_id": None,
                "pokemon_b_id": None,
                "votes_a": 0,
                "votes_b": 0,
                "winner_id": None,
                "status": "pending"
            })
        
        bracket["round_4"].append({
            "matchup_id": f"{tournament_id}_r4_m0",
            "pokemon_a_id": None,
            "pokemon_b_id": None,
            "votes_a": 0,
            "votes_b": 0,
            "winner_id": None,
            "status": "pending"
        })
        
        tournament = {
            "id": tournament_id,
            "season": season,
            "week": week,
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat(),
            "status": "active",
            "current_round": 1,
            "bracket": bracket,
            "participants": [p["dex_number"] for p in selected],
            "champion_id": None,
            "created_at": now.isoformat()
        }
        
        self.data["tournaments"].append(tournament)
        self._save()
        
        return tournament
    
    def get_current_round_duration(self, tournament: Dict) -> int:
        """Calculate how long each round should last (in days)."""
        # 14 days / 4 rounds = 3.5 days per round
        total_days = 14
        num_rounds = 4
        return total_days / num_rounds
    
    def advance_round(self, tournament_id: str) -> bool:
        """Advance tournament to next round based on votes."""
        tournament = self._get_tournament_by_id(tournament_id)
        if not tournament:
            return False
        
        current_round = tournament["current_round"]
        round_key = f"round_{current_round}"
        next_round_key = f"round_{current_round + 1}"
        
        if next_round_key not in tournament["bracket"]:
            # Tournament complete
            return False
        
        # Determine winners from current round
        current_matchups = tournament["bracket"][round_key]
        winners = []
        
        for matchup in current_matchups:
            if matchup["votes_a"] > matchup["votes_b"]:
                winner_id = matchup["pokemon_a_id"]
            elif matchup["votes_b"] > matchup["votes_a"]:
                winner_id = matchup["pokemon_b_id"]
            else:
                # Tie - random winner
                winner_id = random.choice([matchup["pokemon_a_id"], matchup["pokemon_b_id"]])
            
            matchup["winner_id"] = winner_id
            matchup["status"] = "complete"
            winners.append(winner_id)
        
        # Populate next round matchups
        next_matchups = tournament["bracket"][next_round_key]
        for i, matchup in enumerate(next_matchups):
            matchup["pokemon_a_id"] = winners[i * 2]
            matchup["pokemon_b_id"] = winners[i * 2 + 1]
            matchup["status"] = "active"
        
        # Update current round
        tournament["current_round"] = current_round + 1
        
        # Check if tournament is complete
        if current_round == 4:
            final_matchup = tournament["bracket"]["round_4"][0]
            if final_matchup["winner_id"]:
                tournament["champion_id"] = final_matchup["winner_id"]
                tournament["status"] = "complete"
        
        self._save()
        return True
    
    def _get_tournament_by_id(self, tournament_id: str) -> Optional[Dict]:
        """Get tournament by ID."""
        for tournament in self.data["tournaments"]:
            if tournament["id"] == tournament_id:
                return tournament
        return None
    
    def get_active_matchups(self, tournament_id: str) -> List[Dict]:
        """Get all active matchups in current round."""
        tournament = self._get_tournament_by_id(tournament_id)
        if not tournament:
            return []
        
        current_round = tournament["current_round"]
        round_key = f"round_{current_round}"
        
        matchups = tournament["bracket"].get(round_key, [])
        return [m for m in matchups if m["status"] == "active"]
    
    def get_tournament_history(self, limit: int = 10) -> List[Dict]:
        """Get past tournaments."""
        sorted_tournaments = sorted(
            self.data["tournaments"],
            key=lambda t: t["start_date"],
            reverse=True
        )
        return sorted_tournaments[:limit]


# Global instance
_tournament_system = None

def get_tournament_system() -> TournamentSystem:
    """Get global tournament system instance."""
    global _tournament_system
    if _tournament_system is None:
        _tournament_system = TournamentSystem()
    return _tournament_system


# Test
if __name__ == "__main__":
    from pokedex_db import get_db
    
    system = get_tournament_system()
    pokedex = get_db()
    
    # Create test tournament
    tournament = system.create_tournament(pokedex)
    print(f"Created tournament: {tournament['id']}")
    print(f"Participants: {len(tournament['participants'])} Pokémon")
    print(f"Round 1 matchups: {len(tournament['bracket']['round_1'])}")