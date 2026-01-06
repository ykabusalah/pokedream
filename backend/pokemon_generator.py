"""
PokéDream - Complete Pokemon Generator
Combines image generation (Replicate) and stats generation (Claude)
to create fully-realized Pokemon inspired by world cultures.
"""

import os
import json
from pathlib import Path
from datetime import datetime
from dotenv import load_dotenv

from src.image_generator import PokemonImageGenerator, structure_prompt
from src.stats_generator import PokemonStatsGenerator
from src.moves_generator import MoveGenerator
from src.pokedex_db import get_db

load_dotenv()


class PokeDream:
    """Generate complete Pokemon with images, stats, and lore."""
    
    def __init__(self, output_dir: str = "outputs"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        
        self.image_gen = PokemonImageGenerator(output_dir)
        self.stats_gen = PokemonStatsGenerator()
        self.moves_gen = MoveGenerator()
        self.pokedex = get_db()
    
    def create(
        self,
        concept: str,
        types: list[str],
        culture: str,
        tier: str = "fully_evolved",
        body_type: str = None,
        colors: list[str] = None,
        seed: int = None
    ) -> dict:
        """
        Create a complete Pokemon with image and stats.
        
        Args:
            concept: Core design idea ("snow leopard guardian spirit")
            types: Pokemon types (["Ice", "Fighting"])
            culture: Cultural inspiration ("nepal", "mexico", etc.)
            tier: Power tier (early_game, mid_game, fully_evolved, pseudo_legendary, legendary)
            body_type: Physical form ("quadruped", "bipedal", "serpentine")
            colors: Color scheme (["white", "blue", "gold"])
            seed: Random seed for image reproducibility
        
        Returns:
            Complete Pokemon dictionary with image path and all metadata
        """
        print(f"\n{'='*60}")
        print(f"Creating Pokemon: {concept}")
        print(f"Culture: {culture} | Types: {'/'.join(types)} | Tier: {tier}")
        print(f"{'='*60}\n")
        
        # Get existing names to avoid duplicates
        existing_names = self.pokedex.get_all_names()
        print(f"      Existing Pokemon in Pokédex: {len(existing_names)}")
        
        # Step 1: Generate stats first (to get the name)
        print("[1/4] Generating stats and lore...")
        pokemon = self.stats_gen.generate(
            concept=concept,
            types=types,
            culture=culture,
            tier=tier,
            existing_names=existing_names
        )
        
        name = pokemon["name"].lower()
        print(f"      Name: {pokemon['name']}")
        
        # Double-check name isn't a duplicate (Claude might ignore instructions)
        if self.pokedex.name_exists(pokemon["name"]):
            print(f"      WARNING: Name '{pokemon['name']}' already exists, regenerating...")
            # Try again with stronger emphasis
            existing_names.append(pokemon["name"].lower())
            pokemon = self.stats_gen.generate(
                concept=concept,
                types=types,
                culture=culture,
                tier=tier,
                existing_names=existing_names
            )
            name = pokemon["name"].lower()
            print(f"      New name: {pokemon['name']}")
        
        # Step 2: Generate moveset
        print("[2/4] Generating moveset...")
        moveset = self.moves_gen.generate_moveset(pokemon)
        pokemon["moveset"] = moveset
        print(f"      Moves: {', '.join(moveset['current_moves'])}")
        
        # Step 3: Generate image
        print("[3/4] Generating image...")
        prompt = structure_prompt(
            concept=concept,
            types=types,
            colors=colors
        )
        
        image_paths = self.image_gen.generate_and_save(
            prompt=prompt,
            pokemon_name=name,
            seed=seed
        )
        
        pokemon["image_path"] = str(image_paths[0])
        pokemon["image_prompt"] = prompt
        
        # Step 4: Save complete data
        print("[4/4] Saving Pokemon data...")
        json_path = self.output_dir / f"{name}_data.json"
        with open(json_path, "w") as f:
            json.dump(pokemon, f, indent=2)
        
        pokemon["json_path"] = str(json_path)
        
        # Display result
        print(self.stats_gen.display(pokemon))
        print("\nMOVESET")
        print("-" * 30)
        print(f"  Current: {', '.join(moveset['current_moves'])}")
        print(f"  TMs: {', '.join([m['move'] for m in moveset['tm_moves'][:4]])}")
        print(f"\nImage saved: {pokemon['image_path']}")
        print(f"Data saved:  {json_path}")
        
        return pokemon
    
    def create_regional_set(self, culture: str, count: int = 3) -> list[dict]:
        """
        Generate a set of Pokemon for a specific culture/region.
        
        Args:
            culture: Cultural inspiration ("nepal", "mexico", etc.)
            count: Number of Pokemon to generate
        
        Returns:
            List of complete Pokemon dictionaries
        """
        # Pre-defined concepts for each culture
        regional_concepts = {
            "nepal": [
                {"concept": "snow leopard guardian spirit", "types": ["Ice", "Fighting"], "body_type": "quadruped", "colors": ["white", "blue", "gold"], "tier": "fully_evolved"},
                {"concept": "yak with prayer flags", "types": ["Normal", "Ice"], "body_type": "quadruped", "colors": ["brown", "white", "red"], "tier": "mid_game"},
                {"concept": "temple bell spirit", "types": ["Steel", "Psychic"], "body_type": "floating", "colors": ["gold", "bronze"], "tier": "fully_evolved"},
            ],
            "mexico": [
                {"concept": "skeletal jaguar spirit", "types": ["Ghost", "Dark"], "body_type": "quadruped", "colors": ["black", "orange", "turquoise"], "tier": "fully_evolved"},
                {"concept": "alebrije dragon", "types": ["Dragon", "Fairy"], "body_type": "serpentine", "colors": ["rainbow", "vibrant"], "tier": "pseudo_legendary"},
                {"concept": "cactus warrior", "types": ["Grass", "Fighting"], "body_type": "bipedal", "colors": ["green", "red", "yellow"], "tier": "mid_game"},
            ],
            "jordan": [
                {"concept": "ancient sandstone guardian", "types": ["Rock", "Ghost"], "body_type": "bipedal", "colors": ["rose", "tan", "gold"], "tier": "fully_evolved"},
                {"concept": "desert oryx spirit", "types": ["Ground", "Fairy"], "body_type": "quadruped", "colors": ["white", "gold"], "tier": "mid_game"},
                {"concept": "sand cat assassin", "types": ["Dark", "Ground"], "body_type": "quadruped", "colors": ["tan", "black"], "tier": "fully_evolved"},
            ],
            "saudi arabia": [
                {"concept": "falcon warrior", "types": ["Flying", "Fighting"], "body_type": "bipedal", "colors": ["brown", "gold", "white"], "tier": "fully_evolved"},
                {"concept": "sand dune serpent", "types": ["Ground", "Dragon"], "body_type": "serpentine", "colors": ["gold", "tan"], "tier": "pseudo_legendary"},
                {"concept": "oasis spirit", "types": ["Water", "Grass"], "body_type": "floating", "colors": ["blue", "green", "gold"], "tier": "mid_game"},
            ],
            "colombia": [
                {"concept": "golden condor", "types": ["Flying", "Steel"], "body_type": "winged", "colors": ["gold", "black", "emerald"], "tier": "legendary"},
                {"concept": "coffee bean sprite", "types": ["Grass", "Fairy"], "body_type": "small bipedal", "colors": ["brown", "green", "cream"], "tier": "early_game"},
                {"concept": "emerald frog", "types": ["Poison", "Water"], "body_type": "quadruped", "colors": ["emerald", "gold", "black"], "tier": "mid_game"},
            ],
            "vietnam": [
                {"concept": "dragon of ascending", "types": ["Dragon", "Water"], "body_type": "serpentine", "colors": ["blue", "gold", "red"], "tier": "legendary"},
                {"concept": "lotus spirit", "types": ["Grass", "Fairy"], "body_type": "floating", "colors": ["pink", "white", "green"], "tier": "fully_evolved"},
                {"concept": "water buffalo guardian", "types": ["Ground", "Fighting"], "body_type": "quadruped", "colors": ["gray", "brown"], "tier": "fully_evolved"},
            ],
            "el salvador": [
                {"concept": "torogoz bird spirit", "types": ["Flying", "Fairy"], "body_type": "winged", "colors": ["turquoise", "red", "green"], "tier": "fully_evolved"},
                {"concept": "volcanic warrior", "types": ["Fire", "Rock"], "body_type": "bipedal", "colors": ["black", "red", "orange"], "tier": "fully_evolved"},
                {"concept": "indigo moth", "types": ["Bug", "Psychic"], "body_type": "winged", "colors": ["indigo", "blue", "silver"], "tier": "mid_game"},
            ],
            "panama": [
                {"concept": "harpy eagle hunter", "types": ["Flying", "Dark"], "body_type": "winged", "colors": ["black", "white", "gray"], "tier": "fully_evolved"},
                {"concept": "golden frog", "types": ["Poison", "Electric"], "body_type": "small quadruped", "colors": ["gold", "black"], "tier": "mid_game"},
                {"concept": "canal guardian", "types": ["Water", "Steel"], "body_type": "serpentine", "colors": ["blue", "silver", "green"], "tier": "legendary"},
            ],
            "costa rica": [
                {"concept": "resplendent quetzal", "types": ["Flying", "Grass"], "body_type": "winged", "colors": ["green", "red", "gold"], "tier": "fully_evolved"},
                {"concept": "sloth sage", "types": ["Normal", "Psychic"], "body_type": "bipedal", "colors": ["brown", "green", "cream"], "tier": "mid_game"},
                {"concept": "volcanic hot spring spirit", "types": ["Fire", "Water"], "body_type": "amorphous", "colors": ["orange", "blue", "steam"], "tier": "fully_evolved"},
            ],
        }
        
        concepts = regional_concepts.get(culture.lower(), [])[:count]
        
        if not concepts:
            print(f"No pre-defined concepts for {culture}. Use create() with custom concepts.")
            return []
        
        pokemon_list = []
        for i, c in enumerate(concepts):
            print(f"\n[{i+1}/{len(concepts)}] Creating {c['concept']}...")
            pokemon = self.create(
                concept=c["concept"],
                types=c["types"],
                culture=culture,
                tier=c.get("tier", "fully_evolved"),
                body_type=c.get("body_type"),
                colors=c.get("colors"),
                seed=42 + i
            )
            pokemon_list.append(pokemon)
        
        return pokemon_list


def main():
    """Demo: Create a single Pokemon."""
    pokedream = PokeDream()
    
    # Create one Pokemon
    pokemon = pokedream.create(
        concept="temple guardian lion",
        types=["Rock", "Fighting"],
        culture="nepal",
        tier="fully_evolved",
        body_type="quadruped",
        colors=["gold", "red", "white"],
        seed=42
    )
    
    print("\n" + "="*60)
    print("POKEMON CREATED SUCCESSFULLY!")
    print("="*60)


if __name__ == "__main__":
    main()