"""
Hall of Fame System
Tracks legendary Pokémon across different categories.
"""

import json
from pathlib import Path
from datetime import datetime
from typing import Optional


class HallOfFame:
    def __init__(self, data_file: str = "data/hall_of_fame.json"):
        self.data_file = Path(data_file)
        self.data_file.parent.mkdir(parents=True, exist_ok=True)
        self.inductees = self._load()
    
    def _load(self) -> list:
        """Load Hall of Fame data from JSON file."""
        if self.data_file.exists():
            with open(self.data_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        return []
    
    def _save(self):
        """Save Hall of Fame data to JSON file."""
        with open(self.data_file, 'w', encoding='utf-8') as f:
            json.dump(self.inductees, f, indent=2, ensure_ascii=False)
    
    def is_inducted(self, pokemon_id: int) -> bool:
        """Check if a Pokémon is already in the Hall of Fame."""
        return any(i["pokemon_id"] == pokemon_id for i in self.inductees)
    
    def get_inductee(self, pokemon_id: int) -> Optional[dict]:
        """Get Hall of Fame entry for a specific Pokémon."""
        return next((i for i in self.inductees if i["pokemon_id"] == pokemon_id), None)
    
    def get_all_inductees(self, induction_type: str = None) -> list:
        """
        Get all Hall of Fame inductees, optionally filtered by type.
        
        Args:
            induction_type: Filter by type (champion, fan_favorite, professors_choice)
        """
        if induction_type:
            return [i for i in self.inductees if i["induction_type"] == induction_type]
        return self.inductees.copy()
    
    def induct_champion(
        self,
        pokemon_id: int,
        tournament_id: str,
        total_votes: int,
        creator_quote: str = None
    ) -> dict:
        """
        Induct a tournament champion into the Hall of Fame.
        
        Args:
            pokemon_id: Pokémon's dex number
            tournament_id: ID of the tournament won
            total_votes: Total votes received in the tournament
            creator_quote: Optional quote from the creator
        """
        if self.is_inducted(pokemon_id):
            return {"success": False, "message": "Pokémon already in Hall of Fame"}
        
        inductee = {
            "pokemon_id": pokemon_id,
            "induction_type": "champion",
            "induction_date": datetime.now().isoformat(),
            "tournament_id": tournament_id,
            "total_votes": total_votes,
            "creator_quote": creator_quote
        }
        
        self.inductees.append(inductee)
        self._save()
        
        return {"success": True, "message": "Champion inducted into Hall of Fame!", "inductee": inductee}
    
    def induct_fan_favorite(
        self,
        pokemon_id: int,
        total_votes: int,
        tournaments_participated: int,
        creator_quote: str = None
    ) -> dict:
        """
        Induct a fan favorite into the Hall of Fame.
        
        Args:
            pokemon_id: Pokémon's dex number
            total_votes: Total votes received across all tournaments
            tournaments_participated: Number of tournaments participated in
            creator_quote: Optional quote from the creator
        """
        if self.is_inducted(pokemon_id):
            return {"success": False, "message": "Pokémon already in Hall of Fame"}
        
        inductee = {
            "pokemon_id": pokemon_id,
            "induction_type": "fan_favorite",
            "induction_date": datetime.now().isoformat(),
            "total_votes": total_votes,
            "tournaments_participated": tournaments_participated,
            "creator_quote": creator_quote
        }
        
        self.inductees.append(inductee)
        self._save()
        
        return {"success": True, "message": "Fan Favorite inducted into Hall of Fame!", "inductee": inductee}
    
    def induct_professors_choice(
        self,
        pokemon_id: int,
        reason: str,
        creator_quote: str = None
    ) -> dict:
        """
        Induct a Pokémon as Professor's Choice into the Hall of Fame.
        
        Args:
            pokemon_id: Pokémon's dex number
            reason: Reason for the Professor's Choice selection
            creator_quote: Optional quote from the creator
        """
        if self.is_inducted(pokemon_id):
            return {"success": False, "message": "Pokémon already in Hall of Fame"}
        
        inductee = {
            "pokemon_id": pokemon_id,
            "induction_type": "professors_choice",
            "induction_date": datetime.now().isoformat(),
            "reason": reason,
            "creator_quote": creator_quote
        }
        
        self.inductees.append(inductee)
        self._save()
        
        return {"success": True, "message": "Professor's Choice inducted into Hall of Fame!", "inductee": inductee}
    
    def get_stats(self) -> dict:
        """Get Hall of Fame statistics."""
        champions = len([i for i in self.inductees if i["induction_type"] == "champion"])
        fan_favorites = len([i for i in self.inductees if i["induction_type"] == "fan_favorite"])
        professors_choices = len([i for i in self.inductees if i["induction_type"] == "professors_choice"])
        
        return {
            "total_inductees": len(self.inductees),
            "champions": champions,
            "fan_favorites": fan_favorites,
            "professors_choices": professors_choices
        }


# Singleton instance
_hall_of_fame = None


def get_hall_of_fame() -> HallOfFame:
    """Get the global Hall of Fame instance."""
    global _hall_of_fame
    if _hall_of_fame is None:
        _hall_of_fame = HallOfFame()
    return _hall_of_fame