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
        # Add consistent Pokemon style to all prompts
        style_suffix = ", pokemon style, ken sugimori art, official pokemon artwork, simple background, full body"
        styled_prompt = prompt + style_suffix
        
        inputs = {
            "prompt": styled_prompt,
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


def structure_prompt(
    concept: str,
    types: list[str] = None,
    body_type: str = None,
    colors: list[str] = None,
    extra: str = None
) -> str:
    """
    Structure a simple idea into an effective prompt.
    
    Args:
        concept: Core idea ("fire lizard", "electric mouse")
        types: Pokémon types (["Fire", "Dragon"])
        body_type: Physical form ("quadruped", "bipedal", "serpentine")
        colors: Color scheme (["red", "orange"])
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
    
    if extra:
        parts.append(extra)
    
    return ", ".join(parts)


# Quick test function
def main():
    """Test the generator with a sample prompt."""
    generator = PokemonImageGenerator()
    
    # Simple prompt
    print("\n--- Test 1: Simple prompt ---")
    urls = generator.generate("cute water dragon", seed=42)
    print(f"URLs: {urls}")
    
    # Structured prompt
    print("\n--- Test 2: Structured prompt ---")
    prompt = structure_prompt(
        concept="fierce dragon with crystalline scales",
        types=["Dragon", "Ice"],
        body_type="quadruped",
        colors=["blue", "white"]
    )
    print(f"Prompt: {prompt}")
    
    paths = generator.generate_and_save(
        prompt=prompt,
        name="ice_dragon",
        num_outputs=2,
        seed=123
    )
    print(f"Saved to: {paths}")


if __name__ == "__main__":
    main()