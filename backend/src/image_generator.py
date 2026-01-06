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
    
    MODEL = "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b"
    
    def __init__(self, output_dir: str = "outputs"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
    
    def _build_safe_prompt(self, pokemon_type: str, concept: str) -> str:
        """Build a prompt that won't trigger NSFW filters."""
        
        # Clean up the concept - remove potentially problematic words
        safe_concept = concept.lower()
        safe_concept = safe_concept.replace("sexy", "cute")
        safe_concept = safe_concept.replace("hot", "warm")
        
        # Pokemon-style safe keywords
        safe_keywords = [
            "pokemon creature",
            "ken sugimori art style",
            "nintendo official art",
            "cute creature design",
            "family friendly",
            "game freak style",
            "clean illustration",
            "white background",
            "full body shot",
            "trading card art",
        ]
        
        prompt = f"{pokemon_type} type pokemon, {safe_concept}, {', '.join(safe_keywords)}"
        return prompt
    
    def _get_negative_prompt(self) -> str:
        """Negative prompt to avoid bad outputs and NSFW triggers."""
        return (
            "multiple views, reference sheet, multiple angles, turnaround, model sheet, "
            "variations, many pokemon, collage, grid, comparison, "
            "nsfw, nude, naked, sexy, explicit, adult, gore, blood, violent, "
            "realistic photo, photograph, human, person, "
            "blurry, low quality, watermark, signature, text, "
            "deformed, ugly, bad anatomy, extra limbs"
        )
    
    def generate(self, prompt: str, **kwargs) -> list:
        """Generate image with retry logic for NSFW false positives."""
        
        max_retries = 3
        
        for attempt in range(max_retries):
            try:
                # Add more safety keywords on retries
                current_prompt = prompt
                if attempt > 0:
                    current_prompt = f"cute cartoon {prompt}, child friendly, pokemon style, single pokemon, centered"
                    print(f"      Retry {attempt} with safer prompt...")
                
                # Always use a unique seed to avoid duplicates
                seed = kwargs.get("seed", random.randint(1, 999999))
                if attempt > 0:
                    seed = seed + attempt * 1000  # Different seed on retry
                
                inputs = {
                    "prompt": current_prompt,
                    "negative_prompt": self._get_negative_prompt(),
                    "width": 1024,
                    "height": 1024,
                    "num_outputs": kwargs.get("num_outputs", 1),
                    "guidance_scale": 7.5,
                    "num_inference_steps": 30,
                    "seed": seed,
                }
                
                output = replicate.run(self.MODEL, input=inputs)
                return output if isinstance(output, list) else [output]
                
            except replicate.exceptions.ModelError as e:
                if "NSFW" in str(e) and attempt < max_retries - 1:
                    print(f"      NSFW filter triggered, retrying...")
                    time.sleep(1)
                    continue
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
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")  # Includes microseconds
            random_suffix = random.randint(1000, 9999)
            name = pokemon_name or "pokemon"
            name = name.lower().replace(" ", "_")[:20]
            suffix = f"_{i}" if len(urls) > 1 else ""
            
            # Filename: pholame_20260105_143022_123456_5678.png (always unique)
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
        f"inspired by {culture} culture" if culture and culture != "original" else "",
        f"{body_type} body" if body_type else "",
        f"colors: {', '.join(colors)}" if colors else "",
        "single pokemon only",
        "one character",
        "centered composition",
        "full body portrait",
        "simple white background",
        "ken sugimori style",
        "official pokemon artwork",
        "clean illustration",
        "no multiple views",
        "no reference sheet",
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