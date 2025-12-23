"""
PokéDream Image Generator
Generates Pokémon images using Replicate's API.
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
    
    # SDXL model
    MODEL = "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b"
    
    # Simple Pokemon style - emphasize simplicity
    STYLE_SUFFIX = ", pokemon, ken sugimori art, official pokemon artwork, simple design, flat colors, minimal shading, clean lines, cute creature, white background, full body, centered"
    
    # Block complexity and realism
    NEGATIVE_PROMPT = "realistic, photo, 3d, complex, detailed, intricate, busy, cluttered, background, scenery, environment, shadow, gradient, texture, human, text, watermark, multiple creatures, extra limbs, deformed"
    
    def __init__(self, output_dir: str = "outputs"):
        """Initialize the generator."""
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        
        if not os.getenv("REPLICATE_API_TOKEN"):
            raise ValueError("REPLICATE_API_TOKEN not found.")
    
    def generate(
        self,
        prompt: str,
        num_outputs: int = 1,
        seed: int = None,
        guidance_scale: float = 10.0,
        num_inference_steps: int = 40
    ) -> list[str]:
        """Generate Pokémon images from a text prompt."""
        print(f"Generating: {prompt}")
        
        styled_prompt = prompt + self.STYLE_SUFFIX
        
        inputs = {
            "prompt": styled_prompt,
            "negative_prompt": self.NEGATIVE_PROMPT,
            "num_outputs": min(num_outputs, 4),
            "guidance_scale": guidance_scale,
            "num_inference_steps": num_inference_steps,
            "width": 1024,
            "height": 1024,
        }
        
        if seed is not None:
            inputs["seed"] = seed
        
        output = replicate.run(self.MODEL, input=inputs)
        urls = [str(item) for item in output]
        print(f"Generated {len(urls)} image(s)")
        
        return urls
    
    def generate_and_save(
        self,
        prompt: str,
        name: str = None,
        **kwargs
    ) -> list[Path]:
        """Generate images and save them locally."""
        urls = self.generate(prompt, **kwargs)
        
        if name is None:
            name = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        saved_paths = []
        for i, url in enumerate(urls):
            response = requests.get(url)
            response.raise_for_status()
            
            suffix = f"_{i}" if len(urls) > 1 else ""
            filename = f"{name}{suffix}.png"
            filepath = self.output_dir / filename
            
            filepath.write_bytes(response.content)
            saved_paths.append(filepath)
            print(f"Saved: {filepath}")
        
        return saved_paths


def structure_prompt(
    concept: str,
    types: list[str] = None,
    colors: list[str] = None,
) -> str:
    """
    Create a SIMPLE prompt - less is more for Pokemon style.
    """
    parts = []
    
    # Keep it simple - just type + concept + colors
    if types:
        parts.append(f"{types[0]} type")
    
    parts.append(concept)
    
    if colors:
        parts.append(f"{colors[0]} colored")
    
    return ", ".join(parts)


def main():
    """Test with simple prompts."""
    generator = PokemonImageGenerator()
    
    # SIMPLE prompt - don't overload it
    prompt = structure_prompt(
        concept="lion cub creature",
        types=["Rock"],
        colors=["gold"]
    )
    print(f"Prompt: {prompt}\n")
    paths = generator.generate_and_save(prompt, name="test_lion", seed=42)
    print(f"Saved: {paths}")


if __name__ == "__main__":
    main()
