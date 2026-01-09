"""
PokeDream API Server - Fan Favorite Addition
Adds automatic Fan Favorite detection and induction endpoint.
"""

# Add this to the request models section (after InductChampionRequest):

class InductFanFavoriteRequest(BaseModel):
    pokemon_id: int
    creator_quote: str | None = None


# Add these endpoints after the existing Hall of Fame endpoints:

@app.get("/api/hall-of-fame/fan-favorite-candidates")
def get_fan_favorite_candidates(min_votes: int = 50, min_tournaments: int = 2):
    """
    Get Pokémon eligible for Fan Favorite induction.
    
    Criteria:
    - Not already in Hall of Fame
    - Never won a tournament championship
    - Participated in multiple tournaments
    - High total vote count across tournaments
    
    Query params:
        min_votes: Minimum total votes required (default: 50)
        min_tournaments: Minimum tournaments participated (default: 2)
    """
    voting_system = get_voting_system()
    tournament_system = get_tournament_system()
    hof = get_hall_of_fame()
    db = get_db()
    
    # Get all tournament history
    all_tournaments = tournament_system.get_tournament_history(limit=100)
    
    # Track vote stats per Pokémon
    pokemon_stats = {}
    champions = set()
    
    for tournament in all_tournaments:
        # Track champions to exclude them
        if tournament.get("winner_id"):
            champions.add(tournament["winner_id"])
        
        # Count participation and votes
        for participant_id in tournament.get("participants", []):
            if participant_id not in pokemon_stats:
                pokemon_stats[participant_id] = {
                    "pokemon_id": participant_id,
                    "total_votes": 0,
                    "tournaments_participated": 0
                }
            
            pokemon_stats[participant_id]["tournaments_participated"] += 1
            
            # Get votes for this Pokémon in this tournament
            votes = voting_system.get_pokemon_tournament_votes(participant_id, tournament["id"])
            pokemon_stats[participant_id]["total_votes"] += votes
    
    # Filter candidates
    candidates = []
    for pokemon_id, stats in pokemon_stats.items():
        # Skip if already inducted
        if hof.is_inducted(pokemon_id):
            continue
        
        # Skip if won a championship
        if pokemon_id in champions:
            continue
        
        # Check if meets criteria
        if (stats["total_votes"] >= min_votes and 
            stats["tournaments_participated"] >= min_tournaments):
            
            pokemon = db.get_by_dex_number(pokemon_id)
            if pokemon:
                candidates.append({
                    **stats,
                    "pokemon": pokemon
                })
    
    # Sort by total votes (highest first)
    candidates.sort(key=lambda x: x["total_votes"], reverse=True)
    
    return {
        "candidates": candidates,
        "total": len(candidates),
        "criteria": {
            "min_votes": min_votes,
            "min_tournaments": min_tournaments
        }
    }


@app.post("/api/hall-of-fame/induct-fan-favorite")
def induct_fan_favorite(req: InductFanFavoriteRequest):
    """
    Induct a Pokémon as Fan Favorite into the Hall of Fame.
    
    This should be used for Pokémon that:
    - Have high vote counts across multiple tournaments
    - Never won a championship but are community favorites
    """
    hof = get_hall_of_fame()
    db = get_db()
    voting_system = get_voting_system()
    tournament_system = get_tournament_system()
    
    # Verify Pokémon exists
    pokemon = db.get_by_dex_number(req.pokemon_id)
    if not pokemon:
        raise HTTPException(status_code=404, detail="Pokémon not found")
    
    # Get tournament stats
    all_tournaments = tournament_system.get_tournament_history(limit=100)
    
    total_votes = 0
    tournaments_participated = 0
    
    for tournament in all_tournaments:
        if req.pokemon_id in tournament.get("participants", []):
            tournaments_participated += 1
            votes = voting_system.get_pokemon_tournament_votes(req.pokemon_id, tournament["id"])
            total_votes += votes
    
    # Verify they didn't win a championship
    champions = [t.get("winner_id") for t in all_tournaments if t.get("winner_id")]
    if req.pokemon_id in champions:
        raise HTTPException(
            status_code=400, 
            detail="Tournament champions cannot be inducted as Fan Favorites"
        )
    
    # Induct as Fan Favorite
    result = hof.induct_fan_favorite(
        pokemon_id=req.pokemon_id,
        total_votes=total_votes,
        tournaments_participated=tournaments_participated,
        creator_quote=req.creator_quote
    )
    
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])
    
    return result