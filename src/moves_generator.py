"""
PokéDream Move Generator
Assigns moves based on type, stats, and tier using a real move database.
"""

import json
import random
from pathlib import Path


class MoveGenerator:
    """Generate movesets for Pokemon based on type, stats, and tier."""
    
    def __init__(self, database_path: str = "data/moves_database.json"):
        db_path = Path(database_path)
        if not db_path.exists():
            raise FileNotFoundError(f"Move database not found at {database_path}")
        
        with open(db_path, "r") as f:
            data = json.load(f)
        
        self.moves = data["moves"]
        self.coverage_chart = data["coverage_chart"]
    
    def generate_moveset(self, pokemon: dict) -> dict:
        """
        Generate a complete moveset for a Pokemon.
        
        Args:
            pokemon: Pokemon data dict with types, stats, tier
        
        Returns:
            Dictionary with level_up_moves, tm_moves, egg_moves, current_moves
        """
        types = [t.lower() for t in pokemon["types"] if t]
        stats = pokemon["stats"]
        tier = pokemon.get("tier", "fully_evolved")
        
        # Determine if physical or special attacker
        is_physical = stats["attack"] >= stats["sp_attack"]
        attack_category = "physical" if is_physical else "special"
        
        # Generate different move lists
        level_up_moves = self._generate_level_up_moves(types, attack_category, tier)
        tm_moves = self._generate_tm_moves(types, attack_category)
        egg_moves = self._generate_egg_moves(types, attack_category)
        current_moves = self._select_current_moves(level_up_moves, tier)
        
        return {
            "level_up_moves": level_up_moves,
            "tm_moves": tm_moves,
            "egg_moves": egg_moves,
            "current_moves": current_moves
        }
    
    def _get_moves_by_type(self, move_type: str, category: str = None) -> list:
        """Get all moves of a specific type, optionally filtered by category."""
        if move_type not in self.moves:
            return []
        
        type_moves = self.moves[move_type]
        
        if category and category in type_moves:
            return type_moves[category]
        
        # Return all categories
        all_moves = []
        for cat in ["physical", "special", "status"]:
            if cat in type_moves:
                all_moves.extend(type_moves[cat])
        return all_moves
    
    def _generate_level_up_moves(self, types: list, attack_category: str, tier: str) -> list:
        """Generate level-up move progression."""
        level_moves = []
        
        # Determine tier progression
        tier_levels = {
            "early_game": [1, 5, 9, 13, 17, 21, 25],
            "mid_game": [1, 5, 10, 15, 20, 25, 30, 35, 40],
            "fully_evolved": [1, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50],
            "pseudo_legendary": [1, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60],
            "legendary": [1, 5, 10, 15, 20, 30, 40, 50, 60, 70, 80]
        }
        
        levels = tier_levels.get(tier, tier_levels["fully_evolved"])
        
        # Collect available moves
        stab_moves = []
        for t in types:
            stab_moves.extend(self._get_moves_by_type(t, attack_category))
            stab_moves.extend(self._get_moves_by_type(t, "status"))
        
        # Add Normal-type moves for variety
        normal_moves = self._get_moves_by_type("normal", attack_category)
        normal_status = self._get_moves_by_type("normal", "status")
        
        # Sort by tier
        early_moves = [m for m in stab_moves + normal_moves + normal_status if m.get("tier") == "early"]
        mid_moves = [m for m in stab_moves + normal_moves if m.get("tier") == "mid"]
        late_moves = [m for m in stab_moves + normal_moves if m.get("tier") == "late"]
        
        used_moves = set()
        
        for i, level in enumerate(levels):
            # Progress from early to late moves
            if i < len(levels) // 3:
                pool = early_moves
            elif i < 2 * len(levels) // 3:
                pool = early_moves + mid_moves
            else:
                pool = mid_moves + late_moves
            
            # Filter out already used moves
            available = [m for m in pool if m["name"] not in used_moves]
            
            if available:
                move = random.choice(available)
                used_moves.add(move["name"])
                level_moves.append({
                    "level": level,
                    "move": move["name"],
                    "type": self._find_move_type(move["name"]),
                    "power": move.get("power"),
                    "category": self._find_move_category(move["name"])
                })
        
        return level_moves
    
    def _generate_tm_moves(self, types: list, attack_category: str) -> list:
        """Generate TM-compatible moves (coverage + utility)."""
        tm_moves = []
        used_moves = set()
        
        # Get coverage moves based on type chart
        coverage_types = set()
        for t in types:
            if t in self.coverage_chart:
                # Types that the Pokemon's types are super effective against
                pass
            # Find types that cover the Pokemon's weaknesses
            for other_type, effective_against in self.coverage_chart.items():
                if other_type not in types and len(coverage_types) < 4:
                    coverage_types.add(other_type)
        
        # Add STAB TM moves
        for t in types:
            type_moves = self._get_moves_by_type(t, attack_category)
            late_moves = [m for m in type_moves if m.get("tier") in ["mid", "late"]]
            for move in late_moves[:2]:
                if move["name"] not in used_moves:
                    used_moves.add(move["name"])
                    tm_moves.append({
                        "move": move["name"],
                        "type": t,
                        "power": move.get("power"),
                        "reason": "STAB"
                    })
        
        # Add coverage moves
        for cov_type in list(coverage_types)[:3]:
            type_moves = self._get_moves_by_type(cov_type, attack_category)
            good_moves = [m for m in type_moves if m.get("tier") in ["mid", "late"]]
            if good_moves:
                move = random.choice(good_moves)
                if move["name"] not in used_moves:
                    used_moves.add(move["name"])
                    tm_moves.append({
                        "move": move["name"],
                        "type": cov_type,
                        "power": move.get("power"),
                        "reason": "Coverage"
                    })
        
        # Add utility moves
        utility_moves = [
            {"name": "Protect", "type": "normal", "reason": "Utility"},
            {"name": "Rest", "type": "psychic", "reason": "Recovery"},
            {"name": "Substitute", "type": "normal", "reason": "Utility"},
        ]
        
        for util in utility_moves[:2]:
            if util["name"] not in used_moves:
                tm_moves.append({
                    "move": util["name"],
                    "type": util["type"],
                    "power": None,
                    "reason": util["reason"]
                })
        
        return tm_moves[:8]  # Limit to 8 TMs
    
    def _generate_egg_moves(self, types: list, attack_category: str) -> list:
        """Generate egg moves (special/rare moves)."""
        egg_moves = []
        
        # Look for moves with special tags
        special_tags = ["priority", "drain", "high_crit", "recoil"]
        
        for t in types:
            all_type_moves = self._get_moves_by_type(t)
            for move in all_type_moves:
                if any(tag in move.get("tags", []) for tag in special_tags):
                    if len(egg_moves) < 4:
                        egg_moves.append({
                            "move": move["name"],
                            "type": t,
                            "power": move.get("power")
                        })
        
        return egg_moves
    
    def _select_current_moves(self, level_up_moves: list, tier: str) -> list:
        """Select the 4 current moves based on tier/level."""
        # Assume current level based on tier
        level_caps = {
            "early_game": 25,
            "mid_game": 40,
            "fully_evolved": 50,
            "pseudo_legendary": 60,
            "legendary": 70
        }
        
        max_level = level_caps.get(tier, 50)
        
        # Get all moves learned up to this level
        available = [m for m in level_up_moves if m["level"] <= max_level]
        
        # Take the last 4 (most recent/powerful)
        current = available[-4:] if len(available) >= 4 else available
        
        return [m["move"] for m in current]
    
    def _find_move_type(self, move_name: str) -> str:
        """Find the type of a move by name."""
        for type_name, categories in self.moves.items():
            for category, moves in categories.items():
                for move in moves:
                    if move["name"] == move_name:
                        return type_name
        return "normal"
    
    def _find_move_category(self, move_name: str) -> str:
        """Find the category (physical/special/status) of a move."""
        for type_name, categories in self.moves.items():
            for category, moves in categories.items():
                for move in moves:
                    if move["name"] == move_name:
                        return category
        return "physical"
    
    def display(self, moveset: dict) -> str:
        """Format moveset for display."""
        output = []
        
        output.append("\nCURRENT MOVES (Level 50)")
        output.append("-" * 30)
        for move in moveset["current_moves"]:
            output.append(f"  • {move}")
        
        output.append("\nLEVEL-UP MOVES")
        output.append("-" * 30)
        for m in moveset["level_up_moves"]:
            power_str = f"Pow: {m['power']}" if m['power'] else "Status"
            output.append(f"  Lv.{m['level']:>2}: {m['move']:<20} [{m['type'].upper()}] {power_str}")
        
        output.append("\nTM COMPATIBILITY")
        output.append("-" * 30)
        for m in moveset["tm_moves"]:
            power_str = f"Pow: {m['power']}" if m['power'] else "Status"
            output.append(f"  • {m['move']:<20} [{m['type'].upper()}] {power_str} ({m['reason']})")
        
        output.append("\nEGG MOVES")
        output.append("-" * 30)
        for m in moveset["egg_moves"]:
            power_str = f"Pow: {m['power']}" if m['power'] else "Status"
            output.append(f"  • {m['move']:<20} [{m['type'].upper()}] {power_str}")
        
        return "\n".join(output)


def main():
    """Test the move generator."""
    # Sample Pokemon data
    test_pokemon = {
        "name": "Himalon",
        "types": ["Ice", "Fighting"],
        "stats": {
            "hp": 95,
            "attack": 115,
            "defense": 80,
            "sp_attack": 65,
            "sp_defense": 95,
            "speed": 90
        },
        "tier": "fully_evolved"
    }
    
    generator = MoveGenerator()
    moveset = generator.generate_moveset(test_pokemon)
    
    print(f"\nMOVESET FOR {test_pokemon['name'].upper()}")
    print("=" * 50)
    print(generator.display(moveset))


if __name__ == "__main__":
    main()