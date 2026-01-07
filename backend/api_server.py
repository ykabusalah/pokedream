"""
PokeDream API Server
Connects the React frontend to the Python generator.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from pathlib import Path
from typing import Optional
import uvicorn
import traceback
import random
import re

from pokemon_generator import PokeDream
from src.pokedex_db import get_db
from src.daily_challenges import generate_daily_challenge, get_challenge_db

# ==================== RANDOM GENERATION POOLS ====================

RANDOM_CONCEPTS = [
    "a fox made of crystalline ice",
    "a flaming peacock with ember feathers",
    "a deep sea anglerfish that lures prey with bioluminescence",
    "a wolf composed of living shadows",
    "a hummingbird that drinks lightning",
    "a tortoise with a miniature ecosystem on its shell",
    "a jellyfish that floats through the sky",
    "a snake made entirely of flowing water",
    "a moth that spreads healing dust from its wings",
    "a bear that hibernates inside a pocket dimension",
    "a tiny dragon that lives in teacups",
    "a phoenix chick still learning to combust",
    "a kitsune with digital glitching tails",
    "a golem made of ancient library books",
    "a sphinx that asks riddles about memes",
    "a sentient bowl of ramen with noodle tentacles",
    "a pastry creature filled with magical cream",
    "a sushi roll that rolls into battle",
    "a spicy pepper that breathes fire",
    "a bubble tea with boba ball minions",
    "a haunted vintage camera that captures souls",
    "a living origami crane",
    "a lightbulb that has achieved sentience",
    "a clock that controls local time flow",
    "a mirror that reflects alternate dimensions",
    "a creature born from a supernova",
    "a being made of compressed stardust",
    "a living aurora borealis",
    "a sentient earthquake",
    "a creature that is a walking rainforest",
    "the physical manifestation of a nightmare",
    "a creature made of crystallized music",
    "a being that embodies the feeling of nostalgia",
    "a pokemon that is literally just vibes",
    "the monster under the bed, but friendly",
    "a samurai beetle with katana horns",
    "a dia de los muertos spirit cat",
    "a viking walrus with runic tusks",
    "an Egyptian scarab that pushes the sun",
    "a celtic fairy trapped in amber",
]

RANDOM_CULTURES = [
    "original", "japanese", "chinese", "indian", "mexican",
    "egyptian", "norse", "greek", "african", "polynesian",
    "celtic", "arabian", "vietnamese", "korean", "brazilian"
]

RANDOM_TYPE_COMBOS = [
    ["Fire"], ["Water"], ["Grass"], ["Electric"], ["Psychic"],
    ["Ghost"], ["Dragon"], ["Dark"], ["Fairy"], ["Steel"],
    ["Fire", "Water"], ["Ghost", "Fairy"], ["Dragon", "Steel"],
    ["Psychic", "Dark"], ["Ice", "Fire"], ["Grass", "Ghost"],
    ["Electric", "Flying"], ["Water", "Dragon"], ["Bug", "Steel"],
    ["Poison", "Fairy"], ["Ground", "Flying"], ["Rock", "Psychic"],
]

# ==================== NAME VALIDATION ====================

BLOCKED_PATTERNS = [
    r'\bn[i1]gg', r'\bf[a@]g', r'\bk[i1]ke', r'\bch[i1]nk',
    r'\bf+u+c+k', r'\bs+h+[i1]+t+', r'\ba+s+s+h+o+l+e', r'\bb[i1]tch',
    r'\bc+u+n+t', r'\bd[i1]ck', r'\bcock', r'\bpussy', r'\bwh[o0]re', r'\bslut',
    r'\bporn', r'\bsex', r'\brape', r'\bpedo',
]

COMPILED_PATTERNS = [re.compile(p, re.IGNORECASE) for p in BLOCKED_PATTERNS]

# ==================== APP SETUP ====================

app = FastAPI(title="PokeDream API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/outputs", StaticFiles(directory="outputs"), name="outputs")

generator = PokeDream()

# ==================== REQUEST MODELS ====================

class GenerateRequest(BaseModel):
    concept: str
    types: list[str]
    culture: str = "original"
    tier: str = "fully_evolved"
    body_type: str | None = None
    colors: list[str] | None = None
    trainer_name: str = "Trainer"
    challenge_id: str | None = None


class QuickGenerateRequest(BaseModel):
    description: str
    trainer_name: str = "Trainer"
    challenge_id: str | None = None


class RandomGenerateRequest(BaseModel):
    trainer_name: str = "Trainer"


class ValidateNameRequest(BaseModel):
    name: str


class CompleteChallengeRequest(BaseModel):
    trainer_id: str
    pokemon_id: str


# ==================== DAILY CHALLENGE ENDPOINTS ====================

@app.get("/api/daily-challenge")
def get_daily_challenge(trainer_id: Optional[str] = None):
    """Get today's daily challenge."""
    challenge = generate_daily_challenge()
    
    # Check if trainer has completed it
    if trainer_id:
        challenge_db = get_challenge_db()
        challenge["completed"] = challenge_db.has_completed(trainer_id, challenge["id"])
    else:
        challenge["completed"] = False
    
    return challenge


@app.post("/api/daily-challenge/complete")
def complete_daily_challenge(req: CompleteChallengeRequest):
    """Mark daily challenge as completed."""
    challenge = generate_daily_challenge()
    challenge_db = get_challenge_db()
    
    # Check if already completed
    if challenge_db.has_completed(req.trainer_id, challenge["id"]):
        return {"success": False, "message": "Challenge already completed today"}
    
    # Mark as completed
    challenge_db.mark_completed(req.trainer_id, challenge["id"], req.pokemon_id)
    
    return {"success": True, "message": "Challenge completed!", "challenge_id": challenge["id"]}


@app.get("/api/daily-challenge/history/{trainer_id}")
def get_challenge_history(trainer_id: str):
    """Get trainer's challenge completion history."""
    challenge_db = get_challenge_db()
    completions = challenge_db.get_trainer_completions(trainer_id)
    total = challenge_db.get_completion_count(trainer_id)
    
    return {
        "completions": completions,
        "total_completed": total
    }


# ==================== MAIN ENDPOINTS ====================

@app.get("/")
def root():
    return {"status": "PokeDream API running", "version": "1.0", "region": "Oneira"}


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

        db = get_db()
        pokemon = db.add_pokemon(pokemon)

        # If this was for a challenge, mark it complete
        if req.challenge_id:
            try:
                challenge_db = get_challenge_db()
                trainer_id = str(hash(req.trainer_name) % 100000000)
                challenge_db.mark_completed(trainer_id, req.challenge_id, pokemon.get("id", ""))
                pokemon["challenge_completed"] = True
            except Exception as e:
                print(f"Failed to mark challenge complete: {e}")

        return {"success": True, "pokemon": pokemon}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/quick-generate")
def quick_generate(req: QuickGenerateRequest):
    """Generate a Pokemon from a natural language description."""
    try:
        desc_lower = req.description.lower()
        types = []

        type_keywords = {
            "Fire": ["fire", "flame", "hot", "burn", "lava", "volcanic", "spicy", "heat"],
            "Water": ["water", "ocean", "sea", "rain", "aqua", "soup", "broth", "liquid", "pho"],
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

        db = get_db()
        pokemon = db.add_pokemon(pokemon)

        # If this was for a challenge, mark it complete
        if req.challenge_id:
            try:
                challenge_db = get_challenge_db()
                trainer_id = str(hash(req.trainer_name) % 100000000)
                challenge_db.mark_completed(trainer_id, req.challenge_id, pokemon.get("id", ""))
                pokemon["challenge_completed"] = True
            except Exception as e:
                print(f"Failed to mark challenge complete: {e}")

        return {"success": True, "pokemon": pokemon}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/random-generate")
def random_generate(req: RandomGenerateRequest):
    """Generate a completely random Pokemon with no user input."""
    try:
        concept = random.choice(RANDOM_CONCEPTS)
        culture = random.choice(RANDOM_CULTURES)
        types = random.choice(RANDOM_TYPE_COMBOS)

        print(f"Random generation: concept='{concept}', types={types}, culture={culture}")

        pokemon = generator.create(
            concept=concept,
            types=types,
            culture=culture,
            tier="fully_evolved"
        )
        pokemon["trainer"] = req.trainer_name
        pokemon["random_generated"] = True

        db = get_db()
        pokemon = db.add_pokemon(pokemon)

        return {"success": True, "pokemon": pokemon}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/validate-name")
def validate_name(req: ValidateNameRequest):
    """Validate a trainer name."""
    name = req.name.strip() if req.name else ""

    if not name:
        return {"valid": False, "reason": "Name cannot be empty"}

    if len(name) < 2:
        return {"valid": False, "reason": "Name must be at least 2 characters"}

    if len(name) > 20:
        return {"valid": False, "reason": "Name must be 20 characters or less"}

    for pattern in COMPILED_PATTERNS:
        if pattern.search(name):
            return {"valid": False, "reason": "Name contains inappropriate content"}

    sanitized = " ".join(name.split())

    return {"valid": True, "sanitized": sanitized}


# ==================== POKEDEX ENDPOINTS ====================

@app.get("/api/pokedex")
def get_pokedex(type: str = None, limit: int = 50, offset: int = 0):
    """Get all Pokemon in the Pokedex."""
    db = get_db()

    if type:
        pokemon = db.get_by_type(type)
    else:
        pokemon = db.get_all()

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
    """Get Pokedex statistics."""
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
    """Get a specific Pokemon by Pokedex number."""
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


# ==================== RUN SERVER ====================

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)