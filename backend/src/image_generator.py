"""
PokéDream Image Generator
Generates Pokemon-style creature images using Replicate.
"""

import os
import time
import random
import replicate
import requests
from pathlib import Path
from datetime import datetime


class PokemonImageGenerator:
    """Generate Pokemon images using Replicate API."""
    
    # Use Flux Schnell - faster, less restrictive, better quality
    MODEL = "black-forest-labs/flux-schnell"
    
    def __init__(self, output_dir: str = "outputs"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
    
    def _build_prompt(self, pokemon_type: str, concept: str) -> str:
        """Build a clean Pokemon-style prompt without triggering filters."""
        
        # Simple, clean keywords - no "safe" or "family" terms
        style_keywords = [
            "pokemon creature design",
            "ken sugimori art style",
            "official pokemon artwork",
            "full body illustration",
            "white background",
            "single character",
            "clean lineart",
            "vibrant colors",
        ]
        
        prompt = f"{pokemon_type} type pokemon, {concept}, {', '.join(style_keywords)}"
        return prompt
    
    def _get_negative_prompt(self) -> str:
        """Minimal negative prompt - avoid mentioning NSFW terms entirely."""
        return (
            "multiple pokemon, reference sheet, multiple views, turnaround, "
            "collage, grid, comparison, realistic photo, photograph, "
            "blurry, low quality, watermark, signature, text, "
            "deformed, bad anatomy, extra limbs, human, person"
        )
    
    def generate(self, prompt: str, **kwargs) -> list:
        """Generate image with retry logic."""
        
        max_retries = 5  # More retries
        
        for attempt in range(max_retries):
            try:
                seed = kwargs.get("seed") or random.randint(1, 999999)
                if attempt > 0:
                    seed = random.randint(1, 999999)  # Completely new seed each retry
                    print(f"      Retry {attempt}/{max_retries} with new seed {seed}...")
                
                # Flux Schnell parameters
                inputs = {
                    "prompt": prompt,
                    "num_outputs": kwargs.get("num_outputs", 1),
                    "aspect_ratio": "1:1",
                    "output_format": "png",
                    "output_quality": 90,
                    "seed": seed,
                }
                
                output = replicate.run(self.MODEL, input=inputs)
                return output if isinstance(output, list) else [output]
                
            except replicate.exceptions.ModelError as e:
                error_msg = str(e)
                if "NSFW" in error_msg or "safety" in error_msg.lower():
                    if attempt < max_retries - 1:
                        print(f"      Filter triggered, trying new seed...")
                        time.sleep(0.5)
                        continue
                    else:
                        raise Exception(
                            "Generation failed after multiple attempts. "
                            "Try a slightly different description."
                        )
                else:
                    raise
        
        raise Exception("Failed to generate image after retries")
    
    def generate_and_save(self, prompt: str, pokemon_name: str = None, **kwargs) -> list:
        """Generate and save image to disk with unique filename."""
        
        urls = self.generate(prompt, **kwargs)
        saved_paths = []
        
        for i, url in enumerate(urls):
            # Download
            response = requests.get(url)
            response.raise_for_status()
            
            # Create UNIQUE filename with timestamp + random suffix
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
            random_suffix = random.randint(1000, 9999)
            name = pokemon_name or "pokemon"
            name = name.lower().replace(" ", "_")[:20]
            suffix = f"_{i}" if len(urls) > 1 else ""
            
            filename = f"{name}_{timestamp}_{random_suffix}{suffix}.png"
            
            filepath = self.output_dir / filename
            with open(filepath, "wb") as f:
                f.write(response.content)
            
            saved_paths.append(str(filepath))
            print(f"Image saved: {filepath}")
        
        return saved_paths


def structure_prompt(concept: str, types: list, culture: str = None, 
                     body_type: str = None, colors: list = None) -> str:
    """Build a Pokemon-style prompt."""
    
    type_str = "/".join(types) if types else "Normal"
    
    parts = [
        f"{type_str} type pokemon",
        concept,
        f"inspired by {culture} mythology" if culture and culture != "original" else "",
        f"{body_type} body shape" if body_type else "",
        f"color palette: {', '.join(colors)}" if colors else "",
        "pokemon official art style",
        "ken sugimori illustration",
        "single pokemon centered",
        "full body on white background",
        "clean vector illustration",
    ]
    
    return ", ".join(p for p in parts if p)


# Test
if __name__ == "__main__":
    gen = PokemonImageGenerator()
    prompt = structure_prompt(
        concept="soup bowl creature with noodles",
        types=["Fire", "Water"],
        culture="vietnam"
    )
    print(f"Prompt: {prompt}")
    paths = gen.generate_and_save(prompt, pokemon_name="Pholicious", seed=42)
    print(f"Saved: {paths}")