"""
PokéDream Daily Challenges
Generates rotating daily challenges to encourage diverse Pokemon creation.
"""

import json
import hashlib
from datetime import datetime, date, timedelta
from pathlib import Path
from typing import Optional


# Challenge templates
CHALLENGE_TEMPLATES = [
    # Type-focused challenges
    {"template": "Create a {type1}/{type2} type Pokémon", "needs": ["type1", "type2"]},
    {"template": "Create a {type1} type Pokémon inspired by {culture} culture", "needs": ["type1", "culture"]},
    {"template": "Create a pure {type1} type Pokémon", "needs": ["type1"]},
    
    # Theme-focused challenges
    {"template": "Create a Pokémon based on {theme}", "needs": ["theme"]},
    {"template": "Create a {type1} type Pokémon based on {theme}", "needs": ["type1", "theme"]},
    
    # Culture-focused challenges
    {"template": "Create a Pokémon inspired by {culture} mythology", "needs": ["culture"]},
    {"template": "Create a {type1}/{type2} Pokémon from {culture} folklore", "needs": ["type1", "type2", "culture"]},
]

POKEMON_TYPES = [
    "Fire", "Water", "Grass", "Electric", "Ice", "Fighting", "Poison", "Ground",
    "Flying", "Psychic", "Bug", "Rock", "Ghost", "Dragon", "Dark", "Steel", "Fairy", "Normal"
]

CULTURES = [
    "Japanese", "Mexican", "Egyptian", "Greek", "Norse", "Chinese", "Indian",
    "Celtic", "African", "Native American", "Hawaiian", "Brazilian", "Korean",
    "Vietnamese", "Thai", "Indonesian", "Peruvian", "Aztec", "Mayan", "Polynesian"
]

THEMES = [
    "a kitchen appliance", "a musical instrument", "a weather phenomenon",
    "a gemstone or crystal", "a deep sea creature", "a desert animal",
    "a mythical beast", "a piece of furniture", "a sports equipment",
    "a cosmic object", "a garden plant", "a winter holiday",
    "a tropical fruit", "a construction vehicle", "a nocturnal animal",
    "an ancient artifact", "a natural disaster", "a carnival attraction",
    "a breakfast food", "an office supply", "a vintage toy",
    "a haunted object", "a robot companion", "a forest spirit"
]


def get_daily_seed() -> int:
    """Get a seed based on today's date."""
    today = date.today().isoformat()
    return int(hashlib.md5(today.encode()).hexdigest()[:8], 16)


def seeded_choice(items: list, seed: int, offset: int = 0) -> str:
    """Pick an item from list based on seed."""
    index = (seed + offset) % len(items)
    return items[index]


def generate_daily_challenge() -> dict:
    """Generate today's challenge."""
    seed = get_daily_seed()
    
    # Pick template
    template_data = CHALLENGE_TEMPLATES[seed % len(CHALLENGE_TEMPLATES)]
    template = template_data["template"]
    needs = template_data["needs"]
    
    # Fill in template
    replacements = {}
    offset = 0
    
    for need in needs:
        if need == "type1":
            replacements["type1"] = seeded_choice(POKEMON_TYPES, seed, offset)
            offset += 7
        elif need == "type2":
            # Make sure type2 is different from type1
            type2 = seeded_choice(POKEMON_TYPES, seed, offset)
            while type2 == replacements.get("type1"):
                offset += 1
                type2 = seeded_choice(POKEMON_TYPES, seed, offset)
            replacements["type2"] = type2
            offset += 11
        elif need == "culture":
            replacements["culture"] = seeded_choice(CULTURES, seed, offset)
            offset += 13
        elif need == "theme":
            replacements["theme"] = seeded_choice(THEMES, seed, offset)
            offset += 17
    
    # Build challenge text
    challenge_text = template.format(**replacements)
    
    # Calculate time until reset (midnight UTC)
    now = datetime.utcnow()
    tomorrow = datetime(now.year, now.month, now.day) + timedelta(days=1)
    seconds_until_reset = (tomorrow - now).seconds
    
    # Only include types that actually exist (filter out None)
    types = [t for t in [replacements.get("type1"), replacements.get("type2")] if t]
    
    return {
        "id": f"daily_{date.today().isoformat()}",
        "challenge": challenge_text,
        "date": date.today().isoformat(),
        "types": types,
        "culture": replacements.get("culture"),
        "theme": replacements.get("theme"),
        "seconds_until_reset": seconds_until_reset,
    }


def check_challenge_completion(pokemon: dict, challenge: dict) -> bool:
    """Check if a Pokemon meets the daily challenge requirements."""
    pokemon_types = [t.lower() for t in pokemon.get("types", []) if t]
    
    # Check types
    if challenge.get("types"):
        required_types = [t.lower() for t in challenge["types"] if t]
        if not all(t in pokemon_types for t in required_types):
            return False
    
    # For culture and theme, we can't strictly verify - we trust the user
    # In a production app, you might use AI to verify
    
    return True


class DailyChallengeDB:
    """Track daily challenge completions."""
    
    def __init__(self, db_path: str = "data/daily_challenges.json"):
        self.db_path = Path(db_path)
        self.db_path.parent.mkdir(exist_ok=True)
        self._load()
    
    def _load(self):
        if self.db_path.exists():
            with open(self.db_path, 'r') as f:
                self.data = json.load(f)
        else:
            self.data = {"completions": {}}
            self._save()
    
    def _save(self):
        with open(self.db_path, 'w') as f:
            json.dump(self.data, f, indent=2)
    
    def mark_completed(self, trainer_id: str, challenge_id: str, pokemon_id: str):
        """Mark a challenge as completed by a trainer."""
        if trainer_id not in self.data["completions"]:
            self.data["completions"][trainer_id] = {}
        
        self.data["completions"][trainer_id][challenge_id] = {
            "pokemon_id": pokemon_id,
            "completed_at": datetime.now().isoformat()
        }
        self._save()
    
    def has_completed(self, trainer_id: str, challenge_id: str) -> bool:
        """Check if trainer has completed a challenge."""
        return (trainer_id in self.data["completions"] and 
                challenge_id in self.data["completions"][trainer_id])
    
    def get_trainer_completions(self, trainer_id: str) -> dict:
        """Get all completions for a trainer."""
        return self.data["completions"].get(trainer_id, {})
    
    def get_completion_count(self, trainer_id: str) -> int:
        """Get total challenge completions for a trainer."""
        return len(self.get_trainer_completions(trainer_id))


# Global instance
_challenge_db = None

def get_challenge_db() -> DailyChallengeDB:
    global _challenge_db
    if _challenge_db is None:
        _challenge_db = DailyChallengeDB()
    return _challenge_db


# Test
if __name__ == "__main__":
    challenge = generate_daily_challenge()
    print(f"Today's Challenge: {challenge['challenge']}")
    print(f"Types: {challenge['types']}")
    print(f"Culture: {challenge['culture']}")
    print(f"Theme: {challenge['theme']}")
    print(f"Resets in: {challenge['seconds_until_reset'] // 3600}h {(challenge['seconds_until_reset'] % 3600) // 60}m")