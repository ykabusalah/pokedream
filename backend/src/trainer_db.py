"""
PokéDream Trainer Database
Stores trainer profiles and links them to their created Pokemon.
"""

import json
import uuid
from pathlib import Path
from datetime import datetime
from typing import Optional


class TrainerDB:
    """Manages trainer profiles."""
    
    def __init__(self, db_path: str = "data/trainers.json"):
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
                "trainers": {},
                "created_at": datetime.now().isoformat(),
            }
            self._save()
    
    def _save(self):
        """Save database to disk."""
        with open(self.db_path, 'w') as f:
            json.dump(self.data, f, indent=2)
    
    def create_trainer(self, name: str) -> dict:
        """Create a new trainer and return their profile."""
        trainer_id = str(uuid.uuid4())[:8]  # Short unique ID
        
        trainer = {
            "id": trainer_id,
            "name": name,
            "created_at": datetime.now().isoformat(),
            "last_seen": datetime.now().isoformat(),
            "active_time_seconds": 0,
            "pokemon_created": 0,
            "shinies_found": 0,
        }
        
        self.data["trainers"][trainer_id] = trainer
        self._save()
        
        return trainer
    
    def get_trainer(self, trainer_id: str) -> Optional[dict]:
        """Get a trainer by ID."""
        return self.data["trainers"].get(trainer_id)
    
    def get_trainer_by_name(self, name: str) -> Optional[dict]:
        """Get a trainer by name (case-insensitive)."""
        name_lower = name.lower()
        for trainer in self.data["trainers"].values():
            if trainer["name"].lower() == name_lower:
                return trainer
        return None
    
    def update_trainer(self, trainer_id: str, updates: dict) -> Optional[dict]:
        """Update trainer data."""
        if trainer_id not in self.data["trainers"]:
            return None
        
        trainer = self.data["trainers"][trainer_id]
        trainer.update(updates)
        trainer["last_seen"] = datetime.now().isoformat()
        self._save()
        
        return trainer
    
    def add_active_time(self, trainer_id: str, seconds: int) -> Optional[dict]:
        """Add active time to trainer."""
        if trainer_id not in self.data["trainers"]:
            return None
        
        trainer = self.data["trainers"][trainer_id]
        trainer["active_time_seconds"] = trainer.get("active_time_seconds", 0) + seconds
        trainer["last_seen"] = datetime.now().isoformat()
        self._save()
        
        return trainer
    
    def increment_pokemon_created(self, trainer_id: str, is_shiny: bool = False) -> Optional[dict]:
        """Increment Pokemon created count for trainer."""
        if trainer_id not in self.data["trainers"]:
            return None
        
        trainer = self.data["trainers"][trainer_id]
        trainer["pokemon_created"] = trainer.get("pokemon_created", 0) + 1
        if is_shiny:
            trainer["shinies_found"] = trainer.get("shinies_found", 0) + 1
        trainer["last_seen"] = datetime.now().isoformat()
        self._save()
        
        return trainer
    
    def get_trainer_stats(self, trainer_id: str, pokedex_db) -> dict:
        """Get full trainer stats including Pokemon breakdown."""
        trainer = self.get_trainer(trainer_id)
        if not trainer:
            return None
        
        # Get Pokemon created by this trainer
        all_pokemon = pokedex_db.get_all()
        trainer_pokemon = [p for p in all_pokemon if p.get("trainer_id") == trainer_id]
        
        # Calculate type counts
        type_counts = {}
        for p in trainer_pokemon:
            for t in p.get("types", []):
                type_counts[t] = type_counts.get(t, 0) + 1
        
        # Count shinies
        shinies = len([p for p in trainer_pokemon if p.get("is_shiny")])
        
        return {
            "trainer": trainer,
            "total_pokemon": len(trainer_pokemon),
            "shinies": shinies,
            "type_counts": type_counts,
            "types_discovered": len(type_counts),
        }
    
    def get_all_trainers(self) -> list:
        """Get all trainers."""
        return list(self.data["trainers"].values())
    
    def get_leaderboard(self, limit: int = 10) -> list:
        """Get top trainers by Pokemon created."""
        trainers = list(self.data["trainers"].values())
        sorted_trainers = sorted(trainers, key=lambda t: t.get("pokemon_created", 0), reverse=True)
        return sorted_trainers[:limit]


# Global instance
_db = None

def get_trainer_db() -> TrainerDB:
    """Get the global trainer database instance."""
    global _db
    if _db is None:
        _db = TrainerDB()
    return _db


# Test
if __name__ == "__main__":
    db = get_trainer_db()
    
    # Create test trainer
    trainer = db.create_trainer("Ash")
    print(f"Created trainer: {trainer}")
    
    # Update stats
    db.increment_pokemon_created(trainer["id"], is_shiny=False)
    db.add_active_time(trainer["id"], 300)
    
    print(f"Updated trainer: {db.get_trainer(trainer['id'])}")