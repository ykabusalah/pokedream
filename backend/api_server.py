"""
PokéDream API Server
Connects the React frontend to the Python generator.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from pathlib import Path
import uvicorn

from pokemon_generator import PokeDream

app = FastAPI(title="PokéDream API")

# Allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve generated images
app.mount("/outputs", StaticFiles(directory="outputs"), name="outputs")

# Initialize generator
generator = PokeDream()


class GenerateRequest(BaseModel):
    concept: str
    types: list[str]
    culture: str = "original"
    tier: str = "fully_evolved"
    body_type: str | None = None
    colors: list[str] | None = None
    trainer_name: str = "Trainer"


class QuickGenerateRequest(BaseModel):
    description: str
    trainer_name: str = "Trainer"


@app.get("/")
def root():
    return {"status": "PokéDream API running", "version": "1.0"}


@app.post("/api/generate")
def generate_pokemon(req: GenerateRequest):
    """Generate a Pokemon with full control over parameters."""
    try:
        pokemon = generator.create(
            concept=req.concept,
            types=req.types,
            culture=req.culture,
            tier=req.tier,
            body_type=req.body_type,
            colors=req.colors
        )
        pokemon["trainer"] = req.trainer_name
        return {"success": True, "pokemon": pokemon}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/quick-generate")
def quick_generate(req: QuickGenerateRequest):
    """
    Generate a Pokemon from a natural language description.
    Infers types from the description.
    """
    try:
        # Simple type inference from keywords
        desc_lower = req.description.lower()
        types = []
        
        type_keywords = {
            "Fire": ["fire", "flame", "hot", "burn", "lava", "volcanic", "spicy", "heat"],
            "Water": ["water", "ocean", "sea", "rain", "aqua", "soup", "broth", "liquid", "pho", "bun bo"],
            "Grass": ["grass", "plant", "leaf", "flower", "tree", "forest", "herb", "vegetable"],
            "Electric": ["electric", "lightning", "thunder", "shock", "volt"],
            "Ice": ["ice", "snow", "frost", "frozen", "cold", "winter"],
            "Fighting": ["fighting", "martial", "warrior", "combat", "punch", "kick"],
            "Psychic": ["psychic", "mind", "mental", "telekinetic", "mystic"],
            "Ghost": ["ghost", "spirit", "phantom", "haunted", "spectral"],
            "Dragon": ["dragon", "drake", "serpent", "draconic"],
            "Dark": ["dark", "shadow", "night", "evil", "sinister"],
            "Steel": ["steel", "metal", "iron", "mechanical", "robot"],
            "Fairy": ["fairy", "magical", "pixie", "cute", "enchanted"],
            "Poison": ["poison", "toxic", "venom", "acid"],
            "Ground": ["ground", "earth", "sand", "mud", "dirt"],
            "Flying": ["flying", "bird", "wing", "sky", "air"],
            "Bug": ["bug", "insect", "beetle", "spider", "moth"],
            "Rock": ["rock", "stone", "boulder", "mineral"],
            "Normal": ["normal", "common"],
        }
        
        for pokemon_type, keywords in type_keywords.items():
            if any(kw in desc_lower for kw in keywords):
                types.append(pokemon_type)
                if len(types) >= 2:
                    break
        
        if not types:
            types = ["Normal"]
        
        # Infer culture from keywords
        culture = "original"
        culture_keywords = {
            "vietnam": ["vietnam", "pho", "bun bo", "banh mi", "ao dai"],
            "japan": ["japan", "samurai", "ninja", "sakura", "oni", "yokai"],
            "mexico": ["mexico", "aztec", "mayan", "dia de los muertos"],
            "india": ["india", "hindu", "curry", "elephant", "ganesh"],
            "china": ["china", "chinese", "dragon", "panda", "jade"],
            "korea": ["korea", "korean", "kimchi", "hanbok"],
        }
        
        for cult, keywords in culture_keywords.items():
            if any(kw in desc_lower for kw in keywords):
                culture = cult
                break
        
        print(f"Inferred types: {types}, culture: {culture}")
        
        pokemon = generator.create(
            concept=req.description,
            types=types,
            culture=culture,
            tier="fully_evolved"
        )
        pokemon["trainer"] = req.trainer_name
        return {"success": True, "pokemon": pokemon}
    except Exception as e:
        import traceback
        traceback.print_exc()  # Print full error to terminal
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/recent")
def get_recent_pokemon(limit: int = 10):
    """Get recently generated Pokemon."""
    outputs = Path("outputs")
    jsons = sorted(outputs.glob("*.json"), key=lambda x: x.stat().st_mtime, reverse=True)
    
    recent = []
    for j in jsons[:limit]:
        import json
        with open(j) as f:
            recent.append(json.load(f))
    
    return {"pokemon": recent}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)