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
from src.tournament_system import get_tournament_system
from src.voting_system import get_voting_system
from src.hall_of_fame import get_hall_of_fame

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

# ==================== AUTO-CREATE TOURNAMENT ON STARTUP ====================

@app.on_event("startup")
async def startup_event():
    """Auto-create tournament if none exists."""
    try:
        tournament_system = get_tournament_system()
        current = tournament_system.get_current_tournament()
        
        if not current:
            db = get_db()
            pokemon_count = db.get_count()
            
            # Only create if we have at least 16 Pokémon
            if pokemon_count >= 16:
                tournament = tournament_system.create_tournament(db)
                print(f"✓ Auto-created tournament: {tournament['id']}")
                print(f"  Participants: {len(tournament['participants'])} Pokémon")
            else:
                print(f"⚠ Need at least 16 Pokémon to create tournament (current: {pokemon_count})")
        else:
            print(f"✓ Active tournament exists: {current['id']}")
    except Exception as e:
        print(f"⚠ Failed to auto-create tournament: {e}")

# ==================== REQUEST MODELS ====================

class GenerateRequest(BaseModel):
    concept: str
    types: list[str]
    culture: str = "original"
    tier: str = "fully_evolved"
    body_type: str | None = None
    colors: list[str] | None = None
    trainer_name: str = "Trainer"
    trainer_id: str | None = None
    challenge_id: str | None = None


class QuickGenerateRequest(BaseModel):
    description: str
    trainer_name: str = "Trainer"
    trainer_id: str | None = None
    challenge_id: str | None = None


class RandomGenerateRequest(BaseModel):
    trainer_name: str = "Trainer"
    trainer_id: str | None = None


class ValidateNameRequest(BaseModel):
    name: str


class CompleteChallengeRequest(BaseModel):
    trainer_id: str
    pokemon_id: str


class VoteRequest(BaseModel):
    matchup_id: str
    trainer_id: str
    pokemon_id: int


class InductChampionRequest(BaseModel):
    pokemon_id: int
    tournament_id: str
    total_votes: int
    creator_quote: str | None = None


class InductProfessorsChoiceRequest(BaseModel):
    pokemon_id: int
    reason: str
    creator_quote: str | None = None


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
        pokemon["trainer_id"] = req.trainer_id

        db = get_db()
        pokemon = db.add_pokemon(pokemon)

        # If this was for a challenge, mark it complete
        if req.challenge_id and req.trainer_id:
            try:
                challenge_db = get_challenge_db()
                challenge_db.mark_completed(req.trainer_id, req.challenge_id, pokemon.get("id", ""))
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
        pokemon["trainer_id"] = req.trainer_id

        db = get_db()
        pokemon = db.add_pokemon(pokemon)

        # If this was for a challenge, mark it complete
        if req.challenge_id and req.trainer_id:
            try:
                challenge_db = get_challenge_db()
                challenge_db.mark_completed(req.trainer_id, req.challenge_id, pokemon.get("id", ""))
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
        pokemon["trainer_id"] = req.trainer_id
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


# ==================== TRAINER-SPECIFIC ENDPOINTS ====================

@app.get("/api/trainer/{trainer_id}/stats")
def get_trainer_stats(trainer_id: str):
    """Get stats for a specific trainer's Pokemon."""
    db = get_db()
    all_pokemon = db.get_all()
    
    # Filter by trainer_id
    trainer_pokemon = [p for p in all_pokemon if p.get("trainer_id") == trainer_id]
    
    # Calculate stats
    total = len(trainer_pokemon)
    shinies = len([p for p in trainer_pokemon if p.get("is_shiny")])
    
    type_counts = {}
    for p in trainer_pokemon:
        for t in p.get("types", []):
            if t:
                type_counts[t] = type_counts.get(t, 0) + 1
    
    return {
        "total": total,
        "shinies": shinies,
        "type_counts": type_counts,
        "trainer_id": trainer_id
    }


@app.get("/api/trainer/{trainer_id}/recent")
def get_trainer_recent(trainer_id: str, limit: int = 10):
    """Get recently created Pokemon for a specific trainer."""
    db = get_db()
    all_pokemon = db.get_all()
    
    # Filter by trainer_id and sort by dex_number (most recent first)
    trainer_pokemon = [p for p in all_pokemon if p.get("trainer_id") == trainer_id]
    trainer_pokemon.sort(key=lambda p: p.get("dex_number", 0), reverse=True)
    
    return {"pokemon": trainer_pokemon[:limit]}


@app.get("/api/trainer/{trainer_id}/pokemon")
def get_trainer_pokemon(trainer_id: str, type: str = None, limit: int = 50, offset: int = 0):
    """Get Pokemon for a specific trainer (optionally filtered by type)."""
    db = get_db()
    all_pokemon = db.get_all()

    # Filter by trainer_id
    trainer_pokemon = [p for p in all_pokemon if p.get("trainer_id") == trainer_id]

    # Optional type filter
    if type:
        trainer_pokemon = [p for p in trainer_pokemon if type in p.get("types", [])]

    total = len(trainer_pokemon)

    # Sort by dex_number (most recent first) and paginate
    trainer_pokemon.sort(key=lambda p: p.get("dex_number", 0), reverse=True)
    trainer_pokemon = trainer_pokemon[offset:offset + limit]

    return {
        "pokemon": trainer_pokemon,
        "total": total,
        "limit": limit,
        "offset": offset
    }


@app.get("/api/trainer/{trainer_id}/pokemon/search")
def search_trainer_pokemon(trainer_id: str, q: str, type: str = None, limit: int = 50, offset: int = 0):
    """Search a trainer's Pokemon by name (optionally filtered by type)."""
    db = get_db()
    all_pokemon = db.get_all()

    # Filter by trainer_id first
    trainer_pokemon = [p for p in all_pokemon if p.get("trainer_id") == trainer_id]

    # Apply search
    q_lower = q.lower()
    trainer_pokemon = [p for p in trainer_pokemon if q_lower in p.get("name", "").lower()]

    # Optional type filter
    if type:
        trainer_pokemon = [p for p in trainer_pokemon if type in p.get("types", [])]

    total = len(trainer_pokemon)

    # Sort by dex_number (most recent first) and paginate
    trainer_pokemon.sort(key=lambda p: p.get("dex_number", 0), reverse=True)
    trainer_pokemon = trainer_pokemon[offset:offset + limit]

    return {
        "pokemon": trainer_pokemon,
        "total": total,
        "limit": limit,
        "offset": offset
    }


# ==================== TOURNAMENT ENDPOINTS ====================

@app.get("/api/tournament/current")
def get_current_tournament():
    """Get the currently active tournament."""
    tournament_system = get_tournament_system()
    tournament = tournament_system.get_current_tournament()
    
    if not tournament:
        return {"tournament": None, "message": "No active tournament"}
    
    # Enrich with actual Pokémon data
    db = get_db()
    enriched_bracket = {}
    
    for round_key, matchups in tournament["bracket"].items():
        enriched_matchups = []
        
        for matchup in matchups:
            pokemon_a = None
            pokemon_b = None
            
            if matchup["pokemon_a_id"]:
                pokemon_a = db.get_by_dex_number(matchup["pokemon_a_id"])
            
            if matchup["pokemon_b_id"]:
                pokemon_b = db.get_by_dex_number(matchup["pokemon_b_id"])
            
            enriched_matchups.append({
                **matchup,
                "pokemon_a": pokemon_a,
                "pokemon_b": pokemon_b
            })
        
        enriched_bracket[round_key] = enriched_matchups
    
    tournament["bracket"] = enriched_bracket
    
    return {"tournament": tournament}


@app.get("/api/tournament/current/matchups")
def get_current_matchups(trainer_id: Optional[str] = None):
    """Get active matchups for voting in current tournament."""
    tournament_system = get_tournament_system()
    voting_system = get_voting_system()
    
    tournament = tournament_system.get_current_tournament()
    
    if not tournament:
        return {"matchups": [], "message": "No active tournament"}
    
    matchups = tournament_system.get_active_matchups(tournament["id"])
    
    # Enrich with Pokémon data and vote counts
    db = get_db()
    enriched_matchups = []
    
    for matchup in matchups:
        pokemon_a = db.get_by_dex_number(matchup["pokemon_a_id"])
        pokemon_b = db.get_by_dex_number(matchup["pokemon_b_id"])
        
        # Get vote counts
        votes = voting_system.get_matchup_votes(matchup["matchup_id"])
        votes_a = votes.get(matchup["pokemon_a_id"], 0)
        votes_b = votes.get(matchup["pokemon_b_id"], 0)
        
        # Check if trainer has voted
        has_voted = False
        if trainer_id:
            has_voted = voting_system.has_voted(matchup["matchup_id"], trainer_id)
        
        enriched_matchups.append({
            "matchup_id": matchup["matchup_id"],
            "pokemon_a": pokemon_a,
            "pokemon_b": pokemon_b,
            "votes_a": votes_a,
            "votes_b": votes_b,
            "has_voted": has_voted,
            "status": matchup["status"]
        })
    
    return {
        "tournament": {
            "id": tournament["id"],
            "season": tournament["season"],
            "week": tournament["week"],
            "current_round": tournament["current_round"],
            "start_date": tournament["start_date"],
            "end_date": tournament["end_date"]
        },
        "matchups": enriched_matchups
    }


@app.post("/api/tournament/vote")
def cast_tournament_vote(req: VoteRequest):
    """Cast a vote in a tournament matchup."""
    voting_system = get_voting_system()
    tournament_system = get_tournament_system()
    
    # Verify tournament exists and is active
    tournament = tournament_system.get_current_tournament()
    if not tournament:
        raise HTTPException(status_code=404, detail="No active tournament")
    
    # Verify matchup exists and is active
    matchups = tournament_system.get_active_matchups(tournament["id"])
    matchup = next((m for m in matchups if m["matchup_id"] == req.matchup_id), None)
    
    if not matchup:
        raise HTTPException(status_code=404, detail="Matchup not found or not active")
    
    # Verify trainer isn't voting on their own Pokémon
    db = get_db()
    pokemon = db.get_by_dex_number(req.pokemon_id)
    
    if pokemon and pokemon.get("trainer_id") == req.trainer_id:
        raise HTTPException(status_code=400, detail="You cannot vote for your own Pokémon")
    
    # Cast vote
    result = voting_system.cast_vote(
        matchup_id=req.matchup_id,
        trainer_id=req.trainer_id,
        pokemon_id=req.pokemon_id
    )
    
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])
    
    return result


@app.get("/api/tournament/history")
def get_tournament_history(limit: int = 10):
    """Get past tournaments."""
    tournament_system = get_tournament_system()
    tournaments = tournament_system.get_tournament_history(limit)
    
    return {"tournaments": tournaments}


@app.get("/api/tournament/{tournament_id}")
def get_tournament_details(tournament_id: str):
    """Get details for a specific tournament."""
    tournament_system = get_tournament_system()
    tournament = tournament_system._get_tournament_by_id(tournament_id)
    
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    # Enrich with Pokémon data
    db = get_db()
    enriched_bracket = {}
    
    for round_key, matchups in tournament["bracket"].items():
        enriched_matchups = []
        
        for matchup in matchups:
            pokemon_a = None
            pokemon_b = None
            
            if matchup["pokemon_a_id"]:
                pokemon_a = db.get_by_dex_number(matchup["pokemon_a_id"])
            
            if matchup["pokemon_b_id"]:
                pokemon_b = db.get_by_dex_number(matchup["pokemon_b_id"])
            
            enriched_matchups.append({
                **matchup,
                "pokemon_a": pokemon_a,
                "pokemon_b": pokemon_b
            })
        
        enriched_bracket[round_key] = enriched_matchups
    
    tournament["bracket"] = enriched_bracket
    
    return {"tournament": tournament}


@app.get("/api/trainer/{trainer_id}/tournament-stats")
def get_trainer_tournament_stats(trainer_id: str):
    """Get tournament participation stats for a trainer."""
    voting_system = get_voting_system()
    tournament_system = get_tournament_system()
    db = get_db()
    
    # Get voting stats
    voting_stats = voting_system.get_trainer_voting_stats(trainer_id)
    
    # Get Pokémon in tournaments
    trainer_pokemon = db.get_by_trainer(trainer_id)
    tournament = tournament_system.get_current_tournament()
    
    pokemon_in_current = []
    if tournament:
        for pokemon in trainer_pokemon:
            if pokemon["dex_number"] in tournament["participants"]:
                # Get vote count
                total_votes = voting_system.get_pokemon_total_votes(pokemon["dex_number"])
                pokemon_in_current.append({
                    **pokemon,
                    "total_votes": total_votes
                })
    
    return {
        "voting_stats": voting_stats,
        "pokemon_in_current_tournament": pokemon_in_current
    }


# ==================== HALL OF FAME ENDPOINTS ====================

@app.get("/api/hall-of-fame")
def get_hall_of_fame_inductees(type: str = None):
    """
    Get all Hall of Fame inductees.
    
    Query params:
        type: Filter by induction type (champion, fan_favorite, professors_choice)
    """
    hof = get_hall_of_fame()
    db = get_db()
    
    inductees = hof.get_all_inductees(induction_type=type)
    
    # Enrich with Pokémon data
    enriched = []
    for inductee in inductees:
        pokemon = db.get_by_dex_number(inductee["pokemon_id"])
        if pokemon:
            enriched.append({
                **inductee,
                "pokemon": pokemon
            })
    
    # Sort by induction date (most recent first)
    enriched.sort(key=lambda x: x["induction_date"], reverse=True)
    
    return {"inductees": enriched, "total": len(enriched)}


@app.get("/api/hall-of-fame/stats")
def get_hall_of_fame_stats():
    """Get Hall of Fame statistics."""
    hof = get_hall_of_fame()
    return hof.get_stats()


@app.get("/api/hall-of-fame/{pokemon_id}")
def get_hall_of_fame_inductee(pokemon_id: int):
    """Get Hall of Fame details for a specific Pokémon."""
    hof = get_hall_of_fame()
    db = get_db()
    
    inductee = hof.get_inductee(pokemon_id)
    if not inductee:
        raise HTTPException(status_code=404, detail="Pokémon not in Hall of Fame")
    
    pokemon = db.get_by_dex_number(pokemon_id)
    
    return {
        **inductee,
        "pokemon": pokemon
    }


@app.post("/api/hall-of-fame/induct-champion")
def induct_champion(req: InductChampionRequest):
    """Induct a tournament champion into the Hall of Fame."""
    hof = get_hall_of_fame()
    db = get_db()
    tournament_system = get_tournament_system()
    
    # Verify Pokémon exists
    pokemon = db.get_by_dex_number(req.pokemon_id)
    if not pokemon:
        raise HTTPException(status_code=404, detail="Pokémon not found")
    
    # Verify tournament exists
    tournament = tournament_system._get_tournament_by_id(req.tournament_id)
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    # Induct as champion
    result = hof.induct_champion(
        pokemon_id=req.pokemon_id,
        tournament_id=req.tournament_id,
        total_votes=req.total_votes,
        creator_quote=req.creator_quote
    )
    
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])
    
    return result


@app.post("/api/hall-of-fame/induct-professors-choice")
def induct_professors_choice(req: InductProfessorsChoiceRequest):
    """Induct a Pokémon as Professor's Choice into the Hall of Fame."""
    hof = get_hall_of_fame()
    db = get_db()
    
    # Verify Pokémon exists
    pokemon = db.get_by_dex_number(req.pokemon_id)
    if not pokemon:
        raise HTTPException(status_code=404, detail="Pokémon not found")
    
    # Induct as Professor's Choice
    result = hof.induct_professors_choice(
        pokemon_id=req.pokemon_id,
        reason=req.reason,
        creator_quote=req.creator_quote
    )
    
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])
    
    return result


# ==================== SERVER ====================

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)