"""
PokéDream Hall of Fame
Manages prestigious Pokémon inductions and badges.
"""

import json
from pathlib import Path
from datetime import datetime
from typing import Optional, List, Dict


class HallOfFame:
    """Manages Hall of Fame inductees and badges."""
    
    def __init__(self, db_path: str = "data/hall_of_fame.json"):
        self.db_path = Path(db_path)
        self.db_path.parent.mkdir(exist_ok=True)
        self._load()
    
    def _load(self):
        """Load Hall of Fame from disk."""
        if self.db_path.exists():
            with open(self.db_path, 'r') as f:
                self.data = json.load(f)
        else:
            self.data = {
                "inductees": [],
                "created_at": datetime.now().isoformat(),
                "first_month_mode": True,  # First month = 1 per week
                "first_month_end_date": None  # Set when first inductee added
            }
            self._save()
    
    def _save(self):
        """Save Hall of Fame to disk."""
        with open(self.db_path, 'w') as f:
            json.dump(self.data, f, indent=2)
    
    def induct_champion(
        self, 
        pokemon_id: int, 
        tournament_id: str, 
        total_votes: int,
        creator_quote: str = None
    ) -> Dict:
        """
        Induct a tournament champion into the Hall of Fame.
        
        Args:
            pokemon_id: Pokédex number
            tournament_id: Tournament ID (e.g., "s1w1")
            total_votes: Total votes received in tournament
            creator_quote: Optional message from creator (max 280 chars)
        
        Returns:
            Inductee record
        """
        # Check if already inducted
        if self.is_inducted(pokemon_id):
            existing = self.get_inductee(pokemon_id)
            return existing
        
        # Set first month end date on first induction
        if not self.data.get("first_month_end_date"):
            from datetime import timedelta
            first_month_end = datetime.now() + timedelta(days=30)
            self.data["first_month_end_date"] = first_month_end.isoformat()
        
        # Create badge based on tournament
        season, week = self._parse_tournament_id(tournament_id)
        badge = f"Champion (S{season}W{week})"
        
        inductee = {
            "pokemon_id": pokemon_id,
            "induction_type": "champion",
            "induction_date": datetime.now().isoformat(),
            "tournament_id": tournament_id,
            "total_votes": total_votes,
            "creator_quote": creator_quote[:280] if creator_quote else None,
            "badge": badge,
            "season": season,
            "week": week
        }
        
        self.data["inductees"].append(inductee)
        self._save()
        
        return inductee
    
    def induct_fan_favorite(
        self, 
        pokemon_id: int, 
        month: str,
        total_votes: int,
        creator_quote: str = None
    ) -> Dict:
        """
        Induct monthly fan favorite into Hall of Fame.
        
        Args:
            pokemon_id: Pokédex number
            month: Month string (e.g., "January 2025")
            total_votes: Total votes received that month
            creator_quote: Optional message from creator
        
        Returns:
            Inductee record
        """
        if self.is_inducted(pokemon_id):
            existing = self.get_inductee(pokemon_id)
            return existing
        
        badge = f"Fan Favorite ({month})"
        
        inductee = {
            "pokemon_id": pokemon_id,
            "induction_type": "fan_favorite",
            "induction_date": datetime.now().isoformat(),
            "month": month,
            "total_votes": total_votes,
            "creator_quote": creator_quote[:280] if creator_quote else None,
            "badge": badge
        }
        
        self.data["inductees"].append(inductee)
        self._save()
        
        return inductee
    
    def induct_professors_choice(
        self, 
        pokemon_id: int,
        reason: str,
        creator_quote: str = None
    ) -> Dict:
        """
        Manually induct a Pokémon (Professor's Choice).
        
        Args:
            pokemon_id: Pokédex number
            reason: Why this Pokémon was chosen
            creator_quote: Optional message from creator
        
        Returns:
            Inductee record
        """
        if self.is_inducted(pokemon_id):
            existing = self.get_inductee(pokemon_id)
            return existing
        
        badge = "Professor's Pick"
        
        inductee = {
            "pokemon_id": pokemon_id,
            "induction_type": "professors_choice",
            "induction_date": datetime.now().isoformat(),
            "reason": reason,
            "creator_quote": creator_quote[:280] if creator_quote else None,
            "badge": badge
        }
        
        self.data["inductees"].append(inductee)
        self._save()
        
        return inductee
    
    def is_inducted(self, pokemon_id: int) -> bool:
        """Check if a Pokémon is in the Hall of Fame."""
        return any(i["pokemon_id"] == pokemon_id for i in self.data["inductees"])
    
    def get_inductee(self, pokemon_id: int) -> Optional[Dict]:
        """Get Hall of Fame record for a Pokémon."""
        for inductee in self.data["inductees"]:
            if inductee["pokemon_id"] == pokemon_id:
                return inductee
        return None
    
    def get_all_inductees(self, induction_type: str = None) -> List[Dict]:
        """
        Get all Hall of Fame inductees.
        
        Args:
            induction_type: Filter by type (champion, fan_favorite, professors_choice)
        
        Returns:
            List of inductees
        """
        if induction_type:
            return [i for i in self.data["inductees"] if i["induction_type"] == induction_type]
        return self.data["inductees"]
    
    def get_inductee_count(self) -> int:
        """Get total number of inductees."""
        return len(self.data["inductees"])
    
    def get_trainer_inductees(self, trainer_id: str, pokedex_db) -> List[Dict]:
        """Get all Hall of Fame Pokémon created by a trainer."""
        trainer_pokemon = pokedex_db.get_by_trainer(trainer_id)
        trainer_pokemon_ids = {p["dex_number"] for p in trainer_pokemon}
        
        return [
            i for i in self.data["inductees"] 
            if i["pokemon_id"] in trainer_pokemon_ids
        ]
    
    def is_first_month(self) -> bool:
        """Check if we're still in the first month (weekly inductions)."""
        if not self.data.get("first_month_mode"):
            return False
        
        if not self.data.get("first_month_end_date"):
            return True  # No inductees yet
        
        end_date = datetime.fromisoformat(self.data["first_month_end_date"])
        return datetime.now() < end_date
    
    def _parse_tournament_id(self, tournament_id: str) -> tuple:
        """Parse tournament ID into season and week."""
        # Format: "s1w3" -> (1, 3)
        parts = tournament_id.lower().replace('s', '').split('w')
        season = int(parts[0])
        week = int(parts[1])
        return season, week
    
    def get_stats(self) -> Dict:
        """Get Hall of Fame statistics."""
        inductees = self.data["inductees"]
        
        by_type = {}
        for inductee in inductees:
            itype = inductee["induction_type"]
            by_type[itype] = by_type.get(itype, 0) + 1
        
        return {
            "total": len(inductees),
            "champions": by_type.get("champion", 0),
            "fan_favorites": by_type.get("fan_favorite", 0),
            "professors_choices": by_type.get("professors_choice", 0),
            "first_month_mode": self.is_first_month()
        }


# Global instance
_hall_of_fame = None

def get_hall_of_fame() -> HallOfFame:
    """Get global Hall of Fame instance."""
    global _hall_of_fame
    if _hall_of_fame is None:
        _hall_of_fame = HallOfFame()
    return _hall_of_fame


# Test
if __name__ == "__main__":
    hof = get_hall_of_fame()
    
    # Test induction
    inductee = hof.induct_champion(
        pokemon_id=42,
        tournament_id="s1w1",
        total_votes=247,
        creator_quote="I can't believe my Pokémon made it!"
    )
    
    print(f"Inducted: {inductee['badge']}")
    print(f"Total inductees: {hof.get_inductee_count()}")
    print(f"Stats: {hof.get_stats()}")