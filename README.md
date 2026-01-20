# PokeDream

A full-stack web application for generating original Pokemon using AI. Users describe a concept, and the system produces a complete Pokemon with balanced stats, a moveset, lore, and original artwork.

## Features

- **Three generation modes**: Full control with type swhelection, quick generation from natural language, or fully randomized creation
- **AI-generated content**: Stats, abilities, signature moves, and Pokedex entries via Claude API
- **AI-generated artwork**: Ken Sugimori-style illustrations via Replicate's Flux model
- **Game-accurate balancing**: Base stat totals follow official Pokemon tier conventions (early-game, mid-game, fully-evolved, pseudo-legendary, legendary)
- **Shiny system**: 1/4096 chance for shiny variants, matching official Pokemon odds
- **Tournament system**: Bi-weekly community voting brackets with 16 participants
- **Daily challenges**: Themed creation prompts that rotate daily
- **Achievement system**: Track milestones and unlock badges
- **Hall of Fame**: Showcase for tournament champions

## Tech Stack

**Frontend**: React 18, Vite, TailwindCSS

**Backend**: Python, FastAPI, Uvicorn

**AI Services**: Anthropic Claude API, Replicate API (Flux Schnell)

**Deployment**: Vercel (frontend), Render (backend)

**Storage**: JSON file-based database with persistent disk

## Project Structure

```
pokedream/
├── api_server.py              # FastAPI application
├── pokemon_generator.py       # Generation pipeline orchestrator
├── requirements.txt
├── src/
│   ├── image_generator.py     # Replicate integration
│   ├── stats_generator.py     # Claude integration
│   ├── moves_generator.py     # Moveset assignment
│   ├── pokedex_db.py          # Pokemon storage
│   ├── trainer_db.py          # Trainer profiles
│   ├── tournament_system.py   # Tournament logic
│   └── ...
├── data/                      # JSON data files
├── outputs/                   # Generated images
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   └── components/
    │       ├── PokemonGenerator.jsx
    │       ├── Pokedex.jsx
    │       ├── Tournament.jsx
    │       └── ...
    └── ...
```

## Setup

### Prerequisites

- Python 3.9+
- Node.js 18+
- Anthropic API key
- Replicate API token

### Backend

```bash
# Install dependencies
pip install -r requirements.txt

# Create .env file
ANTHROPIC_API_KEY=your-key-here
REPLICATE_API_TOKEN=your-token-here
FRONTEND_URL=http://localhost:5173

# Run server
uvicorn api_server:app --reload --port 8000
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
VITE_API_URL=http://localhost:8000

# Run dev server
npm run dev
```

Open http://localhost:5173 in your browser.

## API Endpoints

### Generation
- `POST /api/generate` - Full control generation with type selection
- `POST /api/quick-generate` - Natural language generation
- `POST /api/random-generate` - Randomized generation

### Pokedex
- `GET /api/pokedex` - List all Pokemon (paginated)
- `GET /api/pokedex/{dex_number}` - Get single Pokemon
- `GET /api/pokedex/search?q=` - Search by name

### Tournament
- `GET /api/tournament/current` - Active tournament
- `POST /api/tournament/vote` - Cast vote

### Trainer
- `GET /api/trainer/{id}/stats` - Trainer statistics
- `GET /api/trainer/{id}/pokemon` - Trainer's Pokemon

## Generation Pipeline

1. User submits a concept description
2. Claude generates name, stats, abilities, signature move, and Pokedex entry
3. Name is checked against existing Pokedex to prevent duplicates
4. Moveset is assigned from the move database based on type
5. Replicate generates artwork using a structured prompt
6. Shiny roll determines variant status
7. Pokemon is saved to the Pokedex with a unique dex number

## Stat Balancing

Pokemon are generated within specific base stat total (BST) ranges:

| Tier | BST Range |
|------|-----------|
| Early Game | 250-350 |
| Mid Game | 400-500 |
| Fully Evolved | 500-550 |
| Pseudo-Legendary | 600 |
| Legendary | 580-680 |

## Deployment

The application auto-deploys on push to main:
- Frontend deploys to Vercel
- Backend deploys to Render

## License

MIT

## Author

Yousef Abu-Salah
