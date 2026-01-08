"""
PokéDream Pokédex Database
Simple JSON-based storage for all created Pokemon.
"""

import json
import os
from pathlib import Path
from datetime import datetime
from typing import Optional
import hashlib


class PokedexDB:
    """Manages the global Pokédex of created Pokemon."""
    
    def __init__(self, db_path: str = "data/pokedex.json"):
        self.db_path = Path(db_path)
        self.db_path.parent.mkdir(exist_ok=True)
        self._load()
    
    def _load(self):
        """Load database from disk."""
        if self.db_path.exists():
            with open(self.db_path, 'r') as f:
                self.data = json.load(f)
        else:
            self.data = {
                "region": "Oneira",
                "pokemon": [],
                "next_dex_number": 1,
                "created_at": datetime.now().isoformat(),
            }
            self._save()
    
    def _save(self):
        """Save database to disk."""
        with open(self.db_path, 'w') as f:
            json.dump(self.data, f, indent=2)
    
    def get_all_names(self) -> list:
        """Get all existing Pokemon names (for duplicate prevention)."""
        return [p.get("name", "").lower() for p in self.data["pokemon"]]
    
    def name_exists(self, name: str) -> bool:
        """Check if a Pokemon name already exists."""
        return name.lower() in self.get_all_names()
    
    def add_pokemon(self, pokemon: dict) -> dict:
        """
        Add a new Pokemon to the Pokédex.
        Returns the Pokemon with assigned dex number.
        """
        # Assign dex number
        dex_number = self.data["next_dex_number"]
        pokemon["dex_number"] = dex_number
        pokemon["added_at"] = datetime.now().isoformat()
        
        # Generate unique ID
        pokemon["id"] = f"pkmn_{dex_number:04d}"
        
        # Add to list
        self.data["pokemon"].append(pokemon)
        self.data["next_dex_number"] = dex_number + 1
        
        self._save()
        return pokemon
    
    def get_all(self) -> list:
        """Get all Pokemon in the Pokédex."""
        return self.data["pokemon"]
    
    def get_by_dex_number(self, dex_number: int) -> Optional[dict]:
        """Get a Pokemon by its Pokédex number."""
        for p in self.data["pokemon"]:
            if p.get("dex_number") == dex_number:
                return p
        return None
    
    def get_by_id(self, pokemon_id: str) -> Optional[dict]:
        """Get a Pokemon by its ID."""
        for p in self.data["pokemon"]:
            if p.get("id") == pokemon_id:
                return p
        return None
    
    def get_by_type(self, pokemon_type: str) -> list:
        """Get all Pokemon of a specific type."""
        return [p for p in self.data["pokemon"] 
                if pokemon_type in p.get("types", [])]
    
    def get_by_trainer(self, trainer_id: str) -> list:
        """Get all Pokemon created by a specific trainer."""
        return [p for p in self.data["pokemon"] 
                if p.get("trainer_id") == trainer_id]


    def get_by_trainer_and_type(self, trainer_id: str, pokemon_type: str) -> list:
        """Get all Pokemon created by a trainer that match a specific type."""
        return [p for p in self.data["pokemon"]
                if p.get("trainer_id") == trainer_id and pokemon_type in p.get("types", [])]

    def search_by_trainer(self, trainer_id: str, query: str) -> list:
        """Search a trainer's Pokemon by name."""
        q = query.lower()
        return [p for p in self.data["pokemon"]
                if p.get("trainer_id") == trainer_id and q in p.get("name", "").lower()]

    def get_stats_for_trainer(self, trainer_id: str) -> dict:
        """Get Pokédex statistics for a specific trainer."""
        pokemon = [p for p in self.data["pokemon"] if p.get("trainer_id") == trainer_id]

        type_counts = {}
        for p in pokemon:
            for t in p.get("types", []):
                type_counts[t] = type_counts.get(t, 0) + 1

        return {
            "total": len(pokemon),
            "shinies": len([p for p in pokemon if p.get("is_shiny")]),
            "type_counts": type_counts,
            "region": self.data["region"],
            "trainer_id": trainer_id,
        }
    
    def get_shinies(self) -> list:
        """Get all shiny Pokemon."""
        return [p for p in self.data["pokemon"] 
                if p.get("is_shiny", False)]
    
    def search(self, query: str) -> list:
        """Search Pokemon by name."""
        query = query.lower()
        return [p for p in self.data["pokemon"] 
                if query in p.get("name", "").lower()]
    
    def get_count(self) -> int:
        """Get total number of Pokemon."""
        return len(self.data["pokemon"])
    
    def get_recent(self, limit: int = 10) -> list:
        """Get most recently added Pokemon."""
        sorted_pokemon = sorted(
            self.data["pokemon"],
            key=lambda x: x.get("added_at", ""),
            reverse=True
        )
        return sorted_pokemon[:limit]
    
    def get_stats(self) -> dict:
        """Get Pokédex statistics."""
        pokemon = self.data["pokemon"]
        
        type_counts = {}
        for p in pokemon:
            for t in p.get("types", []):
                type_counts[t] = type_counts.get(t, 0) + 1
        
        return {
            "total": len(pokemon),
            "shinies": len([p for p in pokemon if p.get("is_shiny")]),
            "type_counts": type_counts,
            "region": self.data["region"],
        }


# Global instance
_db = None

def get_db() -> PokedexDB:
    """Get the global database instance."""
    global _db
    if _db is None:
        _db = PokedexDB()
    return _db


# Test
if __name__ == "__main__":
    db = get_db()
    print(f"Pokédex has {db.get_count()} Pokemon")
    print(f"Existing names: {db.get_all_names()}")
    print(f"Stats: {db.get_stats()}")