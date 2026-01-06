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
import traceback

from pokemon_generator import PokeDream
from src.pokedex_db import get_db
from src.trainer_db import get_trainer_db
from src.name_filter import is_name_appropriate, sanitize_name

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
    trainer_id: str | None = None


class QuickGenerateRequest(BaseModel):
    description: str
    trainer_name: str = "Trainer"
    trainer_id: str | None = None


class ValidateNameRequest(BaseModel):
    name: str


class RegisterTrainerRequest(BaseModel):
    name: str


class UpdateActiveTimeRequest(BaseModel):
    trainer_id: str
    seconds: int


def get_validated_trainer_name(name: str) -> str:
    """Validate and sanitize trainer name, return safe version."""
    is_valid, reason = is_name_appropriate(name)
    if not is_valid:
        # Return generic name if inappropriate
        return "Trainer"
    return sanitize_name(name)


@app.get("/")
def root():
    return {"status": "PokéDream API running", "version": "1.0", "region": "Oneira"}


@app.post("/api/validate-name")
def validate_name(req: ValidateNameRequest):
    """Check if a trainer name is appropriate."""
    is_valid, reason = is_name_appropriate(req.name)
    return {
        "valid": is_valid,
        "reason": reason,
        "sanitized": sanitize_name(req.name) if is_valid else "Trainer"
    }


# ==================== TRAINER ENDPOINTS ====================

@app.post("/api/trainer/register")
def register_trainer(req: RegisterTrainerRequest):
    """Register a new trainer or return existing one."""
    is_valid, reason = is_name_appropriate(req.name)
    if not is_valid:
        raise HTTPException(status_code=400, detail=reason)
    
    name = sanitize_name(req.name)
    trainer_db = get_trainer_db()
    
    # Check if trainer with this name exists
    existing = trainer_db.get_trainer_by_name(name)
    if existing:
        # Update last seen and return existing
        trainer_db.update_trainer(existing["id"], {})
        return {"trainer": existing, "returning": True}
    
    # Create new trainer
    trainer = trainer_db.create_trainer(name)
    return {"trainer": trainer, "returning": False}


@app.get("/api/trainer/{trainer_id}")
def get_trainer(trainer_id: str):
    """Get trainer profile."""
    trainer_db = get_trainer_db()
    trainer = trainer_db.get_trainer(trainer_id)
    
    if not trainer:
        raise HTTPException(status_code=404, detail="Trainer not found")
    
    return {"trainer": trainer}


@app.get("/api/trainer/{trainer_id}/stats")
def get_trainer_stats(trainer_id: str):
    """Get full trainer stats including Pokemon breakdown."""
    trainer_db = get_trainer_db()
    pokedex = get_db()
    
    stats = trainer_db.get_trainer_stats(trainer_id, pokedex)
    if not stats:
        raise HTTPException(status_code=404, detail="Trainer not found")
    
    return stats


@app.post("/api/trainer/active-time")
def update_active_time(req: UpdateActiveTimeRequest):
    """Update trainer's active time."""
    trainer_db = get_trainer_db()
    trainer = trainer_db.add_active_time(req.trainer_id, req.seconds)
    
    if not trainer:
        raise HTTPException(status_code=404, detail="Trainer not found")
    
    return {"trainer": trainer}


@app.get("/api/trainer/leaderboard")
def get_leaderboard(limit: int = 10):
    """Get top trainers by Pokemon created."""
    trainer_db = get_trainer_db()
    return {"trainers": trainer_db.get_leaderboard(limit)}


@app.post("/api/generate")
def generate_pokemon(req: GenerateRequest):
    """Generate a Pokemon with full control over parameters."""
    try:
        # Validate trainer name
        trainer_name = get_validated_trainer_name(req.trainer_name)
        
        pokemon = generator.create(
            concept=req.concept,
            types=req.types,
            culture=req.culture,
            tier=req.tier,
            body_type=req.body_type,
            colors=req.colors
        )
        pokemon["trainer"] = trainer_name
        pokemon["trainer_id"] = req.trainer_id
        
        # Add to Pokédex
        db = get_db()
        pokemon = db.add_pokemon(pokemon)
        
        # Update trainer stats
        if req.trainer_id:
            trainer_db = get_trainer_db()
            trainer_db.increment_pokemon_created(req.trainer_id, pokemon.get("is_shiny", False))
        
        return {"success": True, "pokemon": pokemon}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/quick-generate")
def quick_generate(req: QuickGenerateRequest):
    """Generate a Pokemon from a natural language description."""
    try:
        # Validate trainer name
        trainer_name = get_validated_trainer_name(req.trainer_name)
        
        # Type inference from keywords
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
        
        # Culture inference
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
        pokemon["trainer"] = trainer_name
        pokemon["trainer_id"] = req.trainer_id
        
        # Add to Pokédex
        db = get_db()
        pokemon = db.add_pokemon(pokemon)
        
        # Update trainer stats
        if req.trainer_id:
            trainer_db = get_trainer_db()
            trainer_db.increment_pokemon_created(req.trainer_id, pokemon.get("is_shiny", False))
        
        return {"success": True, "pokemon": pokemon}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


# ==================== POKÉDEX ENDPOINTS ====================

@app.get("/api/pokedex")
def get_pokedex(type: str = None, trainer_id: str = None, limit: int = 50, offset: int = 0):
    """Get all Pokemon in the Pokédex."""
    db = get_db()
    
    if trainer_id:
        pokemon = db.get_by_trainer(trainer_id)
    elif type:
        pokemon = db.get_by_type(type)
    else:
        pokemon = db.get_all()
    
    # Pagination
    total = len(pokemon)
    pokemon = pokemon[offset:offset + limit]
    
    return {
        "pokemon": pokemon,
        "total": total,
        "limit": limit,
        "offset": offset,
    }


@app.get("/api/pokedex/stats")
def get_pokedex_stats():
    """Get Pokédex statistics."""
    db = get_db()
    return db.get_stats()


@app.get("/api/pokedex/recent")
def get_recent_pokemon(limit: int = 10):
    """Get recently created Pokemon."""
    db = get_db()
    return {"pokemon": db.get_recent(limit)}


@app.get("/api/pokedex/search")
def search_pokemon(q: str):
    """Search Pokemon by name."""
    db = get_db()
    return {"pokemon": db.search(q)}


@app.get("/api/pokedex/{dex_number}")
def get_pokemon_by_dex(dex_number: int):
    """Get a specific Pokemon by Pokédex number."""
    db = get_db()
    pokemon = db.get_by_dex_number(dex_number)
    
    if not pokemon:
        raise HTTPException(status_code=404, detail="Pokemon not found")
    
    return {"pokemon": pokemon}


@app.get("/api/pokedex/shinies")
def get_shiny_pokemon():
    """Get all shiny Pokemon."""
    db = get_db()
    return {"pokemon": db.get_shinies()}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)