"""
PokéDream Stats Generator
Uses Claude API to generate Pokemon names, stats, and Pokédex entries.
"""

import os
import json
import anthropic
from dotenv import load_dotenv

load_dotenv()


# BST ranges for different tiers
BST_TIERS = {
    "early_game": (250, 350),
    "mid_game": (400, 500),
    "fully_evolved": (500, 550),
    "pseudo_legendary": (600, 600),
    "legendary": (580, 680)
}


class PokemonStatsGenerator:
    """Generate Pokemon stats and metadata using Claude API."""
    
    def __init__(self):
        api_key = os.getenv("ANTHROPIC_API_KEY")
        if not api_key:
            raise ValueError(
                "ANTHROPIC_API_KEY not found. "
                "Add it to your .env file."
            )
        self.client = anthropic.Anthropic(api_key=api_key)
    
    def generate(
        self,
        concept: str,
        types: list[str] = None,
        culture: str = None,
        tier: str = "fully_evolved"
    ) -> dict:
        """
        Generate Pokemon stats and metadata.
        
        Args:
            concept: Core idea ("snow leopard guardian")
            types: Suggested types (["Ice", "Fighting"])
            culture: Cultural inspiration ("nepal")
            tier: Power tier (early_game, mid_game, fully_evolved, pseudo_legendary, legendary)
        
        Returns:
            Dictionary with name, types, stats, abilities, moves, pokedex entry
        """
        bst_min, bst_max = BST_TIERS.get(tier, (500, 550))
        
        type_hint = f"Suggested types: {'/'.join(types)}" if types else "Choose appropriate types"
        culture_hint = f"Cultural inspiration: {culture}" if culture else ""
        
        prompt = f"""You are a Pokemon game designer. Create a complete Pokemon based on this concept:

Concept: {concept}
{type_hint}
{culture_hint}
Power Tier: {tier} (Base Stat Total should be between {bst_min}-{bst_max})

Respond with ONLY valid JSON in this exact format, no other text:
{{
    "name": "Pokemon name (creative, 1-2 syllables, memorable)",
    "types": ["Type1", "Type2 or null if single type"],
    "stats": {{
        "hp": number,
        "attack": number,
        "defense": number,
        "sp_attack": number,
        "sp_defense": number,
        "speed": number
    }},
    "abilities": ["PrimaryAbility", "SecondaryAbility", "HiddenAbility"],
    "signature_move": {{
        "name": "Move name",
        "type": "Move type",
        "category": "Physical/Special/Status",
        "power": number or null,
        "accuracy": number,
        "description": "Brief move description"
    }},
    "pokedex_entry": "2-3 sentences in official Pokemon style. Reference the cultural inspiration subtly.",
    "category": "The ____ Pokemon (e.g., 'The Snow Guardian Pokemon')",
    "height_m": number,
    "weight_kg": number
}}

Rules for stats:
- Stats range from 1-255 (most are 40-130)
- Total of all stats (BST) must be {bst_min}-{bst_max}
- Distribute based on the Pokemon's design:
  - Bulky/defensive designs: higher HP, Defense, Sp.Defense
  - Fast/agile designs: higher Speed
  - Physical attackers: higher Attack
  - Special attackers: higher Sp.Attack
- Type influences stats: Steel types have high Defense, Psychic types have high Sp.Attack, etc."""

        message = self.client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1024,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        
        response_text = message.content[0].text
        
        try:
            pokemon_data = json.loads(response_text)
        except json.JSONDecodeError:
            start = response_text.find('{')
            end = response_text.rfind('}') + 1
            if start != -1 and end != 0:
                pokemon_data = json.loads(response_text[start:end])
            else:
                raise ValueError(f"Could not parse response: {response_text}")
        
        # Calculate and add BST
        stats = pokemon_data["stats"]
        pokemon_data["bst"] = sum(stats.values())
        pokemon_data["tier"] = tier
        pokemon_data["concept"] = concept
        pokemon_data["culture"] = culture
        
        return pokemon_data
    
    def display(self, pokemon: dict) -> str:
        """Format Pokemon data for display."""
        types_str = "/".join([t for t in pokemon["types"] if t])
        stats = pokemon["stats"]
        
        output = f"""
{'='*50}
{pokemon['name'].upper()} - {pokemon['category']}
{'='*50}
Type: {types_str}
Height: {pokemon['height_m']}m | Weight: {pokemon['weight_kg']}kg

STATS (BST: {pokemon['bst']})
  HP:         {stats['hp']:>3} {'█' * (stats['hp'] // 5)}
  Attack:     {stats['attack']:>3} {'█' * (stats['attack'] // 5)}
  Defense:    {stats['defense']:>3} {'█' * (stats['defense'] // 5)}
  Sp. Atk:    {stats['sp_attack']:>3} {'█' * (stats['sp_attack'] // 5)}
  Sp. Def:    {stats['sp_defense']:>3} {'█' * (stats['sp_defense'] // 5)}
  Speed:      {stats['speed']:>3} {'█' * (stats['speed'] // 5)}

ABILITIES
  {' | '.join(pokemon['abilities'])}

SIGNATURE MOVE
  {pokemon['signature_move']['name']} ({pokemon['signature_move']['type']})
  {pokemon['signature_move']['category']} | Power: {pokemon['signature_move']['power']} | Acc: {pokemon['signature_move']['accuracy']}
  "{pokemon['signature_move']['description']}"

POKÉDEX ENTRY
  {pokemon['pokedex_entry']}
{'='*50}
"""
        return output


def main():
    """Test the stats generator."""
    generator = PokemonStatsGenerator()
    
    # Test: Nepal-inspired Pokemon
    print("Generating Nepal-inspired Pokemon...")
    pokemon = generator.generate(
        concept="snow leopard guardian spirit",
        types=["Ice", "Fighting"],
        culture="Nepal",
        tier="fully_evolved"
    )
    
    print(generator.display(pokemon))
    
    # Save to JSON
    with open("outputs/nepal_snowleopard_stats.json", "w") as f:
        json.dump(pokemon, f, indent=2)
    print("Saved stats to outputs/nepal_snowleopard_stats.json")


if __name__ == "__main__":
    main()