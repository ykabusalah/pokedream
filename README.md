# PokéDream

**AI-Powered Custom Pokémon Generator with Balanced Stats**

Generate unique, never-before-seen Pokémon complete with balanced stats, movesets, abilities, and lore-accurate Pokédex entries — all powered by cutting-edge AI.

![Python](https://img.shields.io/badge/Python-3.10+-blue?logo=python)
![PyTorch](https://img.shields.io/badge/PyTorch-2.0+-red?logo=pytorch)
![License](https://img.shields.io/badge/License-MIT-green)

---

## Features

- **AI-Generated Designs** — Create visually unique Pokémon using fine-tuned Stable Diffusion
- **Balanced Stat Generation** — ML-driven stat allocation that respects game design principles
- **Procedural Movesets** — Context-aware move generation based on type, stats, and lore
- **Pokédex Entry Writer** — LLM-generated flavor text matching the official Pokémon style
- **Type & Ability Assignment** — Intelligent classification based on visual and thematic cues

---

## AI Technologies Used

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Image Generation** | Stable Diffusion (fine-tuned) | Generate novel Pokémon artwork |
| **Stat Balancing** | Custom ML Model (PyTorch) | Ensure competitive viability and game balance |
| **Text Generation** | LLM (GPT-4 / Claude API) | Create Pokédex entries, names, and lore |
| **Type Classification** | Vision Transformer (ViT) | Infer Pokémon types from generated images |
| **Move Generation** | Retrieval-Augmented Generation (RAG) | Generate thematically appropriate movesets |

---

## Project Structure

```
pokedream/
├── models/
│   ├── diffusion/          # Fine-tuned Stable Diffusion checkpoints
│   ├── stat_balancer/      # Stat generation model
│   └── type_classifier/    # Vision model for type inference
├── src/
│   ├── generators/
│   │   ├── image_gen.py    # Pokémon image generation
│   │   ├── stats_gen.py    # Balanced stat allocation
│   │   ├── moves_gen.py    # Moveset generation
│   │   └── pokedex_gen.py  # Pokédex entry writer
│   ├── utils/
│   │   ├── balance.py      # Game balance constraints
│   │   └── validation.py   # Output validation
│   └── api/
│       └── main.py         # FastAPI endpoints
├── data/
│   ├── pokemon_stats.csv   # Training data for stat model
│   └── moves_database.json # Move pool reference
├── notebooks/
│   └── training.ipynb      # Model training experiments
├── tests/
├── requirements.txt
└── README.md
```

---

## Getting Started

### Prerequisites

- Python 3.10+
- CUDA-compatible GPU (recommended)
- API keys for LLM provider (OpenAI/Anthropic)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/pokedream.git
cd pokedream

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Add your API keys to .env
```

### Usage

```python
from pokedream import PokemonGenerator

generator = PokemonGenerator()

# Generate a new Pokémon
pokemon = generator.create(
    theme="volcanic fire lizard",
    evolution_stage=2,
    stat_total=500  # BST constraint
)

print(pokemon.name)        # "Magmavern"
print(pokemon.types)       # ["Fire", "Dragon"]
print(pokemon.stats)       # {"hp": 75, "atk": 110, ...}
print(pokemon.pokedex)     # "This Pokémon dwells in active volcanoes..."
pokemon.image.show()       # Display generated artwork
```

---

## Game Balance Philosophy

PokéDream enforces competitive balance through learned constraints:

- **Base Stat Total (BST)** — Configurable limits matching official tiers (300-600)
- **Stat Distribution** — Trained on 900+ official Pokémon to learn natural stat spreads
- **Move Pool Coherence** — Moves align with type, stats, and thematic identity
- **Ability Synergy** — Abilities complement the Pokémon's intended battle role

---

## Model Training

### Image Generation (Stable Diffusion)
Fine-tuned on official Pokémon artwork using DreamBooth/LoRA techniques to capture the distinctive art style while enabling novel designs.

### Stat Balancer
Trained on the complete National Pokédex dataset to learn the relationship between:
- Visual features → Type assignment
- Type combinations → Stat distributions  
- Evolution stage → Power scaling

---

## API Reference

```bash
# Start the API server
uvicorn src.api.main:app --reload
```

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/generate` | POST | Create a new Pokémon |
| `/pokemon/{id}` | GET | Retrieve generated Pokémon |
| `/evolve/{id}` | POST | Generate an evolution |

---

## Roadmap

- [ ] Web UI with Gradio/Streamlit
- [ ] Evolution chain generation
- [ ] Shiny variant support
- [ ] Battle simulator integration
- [ ] Community gallery & voting

---

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

## Disclaimer

This is a fan project for educational purposes demonstrating generative AI techniques. Pokémon is a trademark of Nintendo/Game Freak/The Pokémon Company. This project is not affiliated with or endorsed by them.

---


### ✨ Created by [Yousef Abu-Salah](https://ykabusalah.me)

<p align="center">
  <i>Gotta generate 'em all!</i>
</p>
