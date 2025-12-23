"""
PokéDream Image Generator
Generates Pokémon images using Replicate's text-to-pokemon model.
"""

import os
import replicate
import requests
from pathlib import Path
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


class PokemonImageGenerator:
    """Generate Pokémon images using Replicate API."""
    
    # Lambda Labs text-to-pokemon model
    MODEL = "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b"
    
    def __init__(self, output_dir: str = "outputs"):
        """Initialize the generator."""
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        
        # Verify API token is set
        if not os.getenv("REPLICATE_API_TOKEN"):
            raise ValueError(
                "REPLICATE_API_TOKEN not found. "
                "Add it to your .env file or set as environment variable."
            )
    
    def generate(
        self,
        prompt: str,
        num_outputs: int = 1,
        seed: int = None,
        guidance_scale: float = 7.5,
        num_inference_steps: int = 50
    ) -> list[str]:
        """
        Generate Pokémon images from a text prompt.
        
        Args:
            prompt: Description of the Pokémon to generate
            num_outputs: Number of images to generate (1-4)
            seed: Random seed for reproducibility
            guidance_scale: How closely to follow the prompt (1-20)
            num_inference_steps: Denoising steps (more = better quality, slower)
        
        Returns:
            List of URLs to generated images
        """
        inputs = {
            "prompt": prompt,
            "num_outputs": min(num_outputs, 4),
            "guidance_scale": guidance_scale,
            "num_inference_steps": num_inference_steps,
        }
        
        if seed is not None:
            inputs["seed"] = seed
        
        print(f"Generating: {prompt}")
        output = replicate.run(self.MODEL, input=inputs)
        
        # Output is a list of FileOutput objects
        urls = [str(item) for item in output]
        print(f"Generated {len(urls)} image(s)")
        
        return urls
    
    def generate_and_save(
        self,
        prompt: str,
        name: str = None,
        **kwargs
    ) -> list[Path]:
        """
        Generate images and save them locally.
        
        Args:
            prompt: Description of the Pokémon
            name: Base name for saved files (default: timestamp)
            **kwargs: Additional args passed to generate()
        
        Returns:
            List of paths to saved images
        """
        urls = self.generate(prompt, **kwargs)
        
        if name is None:
            name = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        saved_paths = []
        for i, url in enumerate(urls):
            # Download image
            response = requests.get(url)
            response.raise_for_status()
            
            # Save to file
            suffix = f"_{i}" if len(urls) > 1 else ""
            filename = f"{name}{suffix}.png"
            filepath = self.output_dir / filename
            
            filepath.write_bytes(response.content)
            saved_paths.append(filepath)
            print(f"Saved: {filepath}")
        
        return saved_paths


# Cultural inspiration mappings for each region
CULTURE_THEMES = {
    "nepal": "Nepalese culture, Himalayan mythology, Buddhist and Hindu influences, temple architecture, prayer flags, snow leopard, yak, rhododendron",
    "mexico": "Mexican culture, Aztec and Mayan mythology, Day of the Dead, alebrijes folk art, jaguar, quetzal bird, cactus, vibrant patterns",
    "jordan": "Jordanian culture, Nabataean architecture, Petra, Arabian mythology, desert landscape, Bedouin patterns, sand cat, oryx",
    "saudi arabia": "Saudi Arabian culture, Arabian mythology, desert dunes, falcon, camel, geometric Islamic patterns, oasis",
    "colombia": "Colombian culture, pre-Columbian mythology, Muisca legend of El Dorado, Andean condor, orchids, emerald, coffee plants",
    "vietnam": "Vietnamese culture, dragon mythology, lotus flower, water buffalo, rice paddies, lantern festivals, ao dai patterns",
    "el salvador": "Salvadoran culture, Mayan heritage, Pipil mythology, torogoz bird, izote flower, volcanic landscape, indigo dye",
    "panama": "Panamanian culture, Kuna mola patterns, harpy eagle, golden frog, tropical rainforest, Panama Canal, Emberá traditions",
    "costa rica": "Costa Rican culture, pre-Columbian jade, quetzal bird, sloth, tropical rainforest, volcanic hot springs, oxcart patterns"
}


def structure_prompt(
    concept: str,
    types: list[str] = None,
    body_type: str = None,
    colors: list[str] = None,
    culture: str = None,
    extra: str = None
) -> str:
    """
    Structure a simple idea into an effective prompt.
    
    Args:
        concept: Core idea ("fire lizard", "electric mouse")
        types: Pokémon types (["Fire", "Dragon"])
        body_type: Physical form ("quadruped", "bipedal", "serpentine")
        colors: Color scheme (["red", "orange"])
        culture: Cultural inspiration ("nepal", "mexico", "jordan", etc.)
        extra: Additional descriptors
    
    Returns:
        Formatted prompt string
    """
    parts = []
    
    if types:
        parts.append(f"{'/'.join(types)} type")
    
    parts.append(concept)
    
    if body_type:
        parts.append(body_type)
    
    if colors:
        parts.append(f"{' and '.join(colors)} colored")
    
    if culture:
        culture_key = culture.lower()
        if culture_key in CULTURE_THEMES:
            parts.append(f"inspired by {CULTURE_THEMES[culture_key]}")
        else:
            parts.append(f"inspired by {culture} culture and mythology")
    
    if extra:
        parts.append(extra)
    
    return ", ".join(parts)


# Quick test function
def main():
    """Test the generator with culturally-inspired prompts."""
    generator = PokemonImageGenerator()
    
    # Test 1: Nepal-inspired Pokemon
    print("\n--- Test 1: Nepal-inspired Pokemon ---")
    prompt = structure_prompt(
        concept="snow leopard guardian spirit",
        types=["Ice", "Fighting"],
        body_type="quadruped",
        colors=["white", "blue", "gold"],
        culture="nepal"
    )
    print(f"Prompt: {prompt}\n")
    paths = generator.generate_and_save(prompt, name="nepal_snowleopard", seed=42)
    print(f"Saved: {paths}")
    
    # Test 2: Mexico-inspired Pokemon
    print("\n--- Test 2: Mexico-inspired Pokemon ---")
    prompt = structure_prompt(
        concept="skeletal jaguar spirit",
        types=["Ghost", "Dark"],
        body_type="quadruped",
        colors=["black", "orange", "turquoise"],
        culture="mexico"
    )
    print(f"Prompt: {prompt}\n")
    paths = generator.generate_and_save(prompt, name="mexico_jaguar", seed=42)
    print(f"Saved: {paths}")
    
    # Test 3: Jordan-inspired Pokemon
    print("\n--- Test 3: Jordan-inspired Pokemon ---")
    prompt = structure_prompt(
        concept="ancient sandstone guardian",
        types=["Rock", "Ghost"],
        body_type="bipedal",
        colors=["rose", "tan", "gold"],
        culture="jordan"
    )
    print(f"Prompt: {prompt}\n")
    paths = generator.generate_and_save(prompt, name="jordan_petra", seed=42)
    print(f"Saved: {paths}")


if __name__ == "__main__":
    main()