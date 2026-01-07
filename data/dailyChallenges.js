// ============================================
// DAILY CHALLENGES SYSTEM
// Create this file at: frontend/src/data/dailyChallenges.js
// ============================================

export const DAILY_CHALLENGES = [
  // ============================================
  // TYPE COMBINATION CHALLENGES
  // ============================================
  {
    id: 'bug-steel',
    title: 'Industrial Evolution',
    description: 'Create a Bug/Steel type Pokémon',
    hint: 'Think mechanical insects, clockwork beetles...',
    requirements: { types: ['Bug', 'Steel'] },
    difficulty: 'medium',
    xp: 50,
  },
  {
    id: 'fire-water',
    title: 'Elemental Paradox',
    description: 'Create a Fire/Water type Pokémon',
    hint: 'Steam-powered? Hot springs? Volcanic ocean vents?',
    requirements: { types: ['Fire', 'Water'] },
    difficulty: 'hard',
    xp: 100,
  },
  {
    id: 'ghost-fairy',
    title: 'Spectral Blessing',
    description: 'Create a Ghost/Fairy type Pokémon',
    hint: 'Will-o-wisps, spirit guardians, haunted dolls...',
    requirements: { types: ['Ghost', 'Fairy'] },
    difficulty: 'medium',
    xp: 50,
  },
  {
    id: 'dragon-ice',
    title: 'Frozen Fury',
    description: 'Create a Dragon/Ice type Pokémon',
    hint: 'Frost wyrms, glacial serpents, arctic dragons...',
    requirements: { types: ['Dragon', 'Ice'] },
    difficulty: 'medium',
    xp: 50,
  },
  {
    id: 'psychic-dark',
    title: 'Mind Games',
    description: 'Create a Psychic/Dark type Pokémon',
    hint: 'Nightmare beings, shadow psychics, dark prophets...',
    requirements: { types: ['Psychic', 'Dark'] },
    difficulty: 'hard',
    xp: 75,
  },
  {
    id: 'electric-ground',
    title: 'Grounded Energy',
    description: 'Create an Electric/Ground type Pokémon',
    hint: 'Lightning rods, magnetic moles, storm burrowers...',
    requirements: { types: ['Electric', 'Ground'] },
    difficulty: 'medium',
    xp: 50,
  },
  {
    id: 'fire-grass',
    title: 'Burning Bloom',
    description: 'Create a Fire/Grass type Pokémon',
    hint: 'Sun flowers, volcanic plants, pepper Pokémon...',
    requirements: { types: ['Fire', 'Grass'] },
    difficulty: 'medium',
    xp: 50,
  },
  {
    id: 'ice-fighting',
    title: 'Cold Warrior',
    description: 'Create an Ice/Fighting type Pokémon',
    hint: 'Arctic martial artists, frozen warriors, ice monks...',
    requirements: { types: ['Ice', 'Fighting'] },
    difficulty: 'medium',
    xp: 50,
  },
  {
    id: 'poison-fairy',
    title: 'Toxic Beauty',
    description: 'Create a Poison/Fairy type Pokémon',
    hint: 'Poisonous flowers, venomous pixies, deadly cute...',
    requirements: { types: ['Poison', 'Fairy'] },
    difficulty: 'medium',
    xp: 50,
  },
  {
    id: 'rock-ghost',
    title: 'Living Fossil',
    description: 'Create a Rock/Ghost type Pokémon',
    hint: 'Haunted fossils, possessed statues, ancient spirits...',
    requirements: { types: ['Rock', 'Ghost'] },
    difficulty: 'medium',
    xp: 50,
  },

  // ============================================
  // CULTURAL INSPIRATION CHALLENGES
  // ============================================
  {
    id: 'japanese',
    title: 'Land of the Rising Sun',
    description: 'Create a Pokémon inspired by Japanese mythology',
    hint: 'Yokai, samurai, shrine spirits, kitsune, oni, tanuki...',
    requirements: { keywords: ['japan', 'japanese', 'yokai', 'samurai', 'oni', 'kitsune', 'tanuki', 'shrine', 'origami'] },
    difficulty: 'medium',
    xp: 50,
  },
  {
    id: 'egyptian',
    title: "Pharaoh's Dream",
    description: 'Create a Pokémon inspired by ancient Egypt',
    hint: 'Pyramids, scarabs, Anubis, sphinxes, mummies, the Nile...',
    requirements: { keywords: ['egypt', 'pharaoh', 'pyramid', 'scarab', 'anubis', 'sphinx', 'mummy', 'nile', 'hieroglyph'] },
    difficulty: 'medium',
    xp: 50,
  },
  {
    id: 'nordic',
    title: "Valhalla's Champion",
    description: 'Create a Pokémon inspired by Norse mythology',
    hint: 'Vikings, runes, Yggdrasil, frost giants, Valkyries...',
    requirements: { keywords: ['norse', 'viking', 'nordic', 'rune', 'odin', 'thor', 'frost', 'valkyrie', 'yggdrasil'] },
    difficulty: 'medium',
    xp: 50,
  },
  {
    id: 'mexican',
    title: 'Día de los Muertos',
    description: 'Create a Pokémon inspired by Mexican culture',
    hint: 'Sugar skulls, alebrijes, Aztec gods, Quetzalcoatl...',
    requirements: { keywords: ['mexican', 'aztec', 'maya', 'alebrije', 'calavera', 'quetzal', 'lucha', 'cactus'] },
    difficulty: 'medium',
    xp: 50,
  },
  {
    id: 'chinese',
    title: 'Eastern Dragon',
    description: 'Create a Pokémon inspired by Chinese mythology',
    hint: 'Dragons, phoenixes, jade, the Zodiac, lanterns...',
    requirements: { keywords: ['chinese', 'china', 'dragon', 'phoenix', 'jade', 'zodiac', 'lunar', 'panda', 'lantern'] },
    difficulty: 'medium',
    xp: 50,
  },
  {
    id: 'african',
    title: 'Safari Dreams',
    description: 'Create a Pokémon inspired by African wildlife or mythology',
    hint: 'Savanna animals, Anansi, tribal patterns, baobab trees...',
    requirements: { keywords: ['african', 'safari', 'savanna', 'tribal', 'anansi', 'lion', 'elephant', 'baobab'] },
    difficulty: 'medium',
    xp: 50,
  },
  {
    id: 'greek',
    title: 'Mount Olympus',
    description: 'Create a Pokémon inspired by Greek mythology',
    hint: 'Gods, titans, heroes, minotaurs, hydras, pegasus...',
    requirements: { keywords: ['greek', 'olympus', 'titan', 'hydra', 'pegasus', 'minotaur', 'medusa', 'centaur'] },
    difficulty: 'medium',
    xp: 50,
  },
  {
    id: 'indian',
    title: 'Mystic Subcontinent',
    description: 'Create a Pokémon inspired by Indian mythology',
    hint: 'Elephants, cobras, peacocks, mandalas, lotus flowers...',
    requirements: { keywords: ['indian', 'india', 'elephant', 'cobra', 'peacock', 'mandala', 'lotus', 'tiger', 'ganesh'] },
    difficulty: 'medium',
    xp: 50,
  },
  {
    id: 'celtic',
    title: 'Ancient Druids',
    description: 'Create a Pokémon inspired by Celtic mythology',
    hint: 'Druids, faeries, leprechauns, standing stones, clovers...',
    requirements: { keywords: ['celtic', 'druid', 'faerie', 'leprechaun', 'clover', 'irish', 'scotland', 'stone'] },
    difficulty: 'medium',
    xp: 50,
  },
  {
    id: 'polynesian',
    title: 'Island Spirits',
    description: 'Create a Pokémon inspired by Polynesian culture',
    hint: 'Tiki, ocean voyagers, volcanoes, tribal tattoos, Maui...',
    requirements: { keywords: ['polynesian', 'hawaii', 'tiki', 'maori', 'ocean', 'island', 'volcano', 'tribal'] },
    difficulty: 'medium',
    xp: 50,
  },

  // ============================================
  // CONCEPT CHALLENGES
  // ============================================
  {
    id: 'food-pokemon',
    title: 'Gourmet Creature',
    description: 'Create a Pokémon based on food or cooking',
    hint: 'Sushi, pizza, sentient vegetables, dessert creatures...',
    requirements: { keywords: ['food', 'cook', 'chef', 'sushi', 'pizza', 'cake', 'fruit', 'vegetable', 'candy', 'dessert'] },
    difficulty: 'easy',
    xp: 30,
  },
  {
    id: 'music-pokemon',
    title: 'Symphony Spirit',
    description: 'Create a Pokémon based on music or instruments',
    hint: 'Guitar, drums, singing creatures, sound wave beings...',
    requirements: { keywords: ['music', 'instrument', 'guitar', 'drum', 'sing', 'melody', 'rhythm', 'piano', 'flute'] },
    difficulty: 'medium',
    xp: 50,
  },
  {
    id: 'space-pokemon',
    title: 'Cosmic Entity',
    description: 'Create a Pokémon from outer space',
    hint: 'Stars, nebulae, black holes, aliens, comets, asteroids...',
    requirements: { keywords: ['space', 'star', 'cosmic', 'nebula', 'galaxy', 'alien', 'meteor', 'comet', 'moon', 'planet'] },
    difficulty: 'medium',
    xp: 50,
  },
  {
    id: 'ocean-depths',
    title: 'Abyssal Horror',
    description: 'Create a Pokémon from the deep sea',
    hint: 'Anglerfish, giant squid, bioluminescence, trenches...',
    requirements: { keywords: ['deep', 'ocean', 'abyss', 'anglerfish', 'squid', 'bioluminescent', 'trench', 'pressure'] },
    difficulty: 'medium',
    xp: 50,
  },
  {
    id: 'fossil-pokemon',
    title: 'Prehistoric Revival',
    description: 'Create a fossil Pokémon from a prehistoric era',
    hint: 'Dinosaurs, trilobites, ancient plants, amber...',
    requirements: { keywords: ['fossil', 'prehistoric', 'dinosaur', 'ancient', 'extinct', 'trilobite', 'amber', 'jurassic'] },
    difficulty: 'medium',
    xp: 50,
  },
  {
    id: 'tech-pokemon',
    title: 'Digital Entity',
    description: 'Create a Pokémon based on technology',
    hint: 'Robots, AI, viruses, circuits, holographic beings...',
    requirements: { keywords: ['robot', 'tech', 'digital', 'cyber', 'AI', 'machine', 'circuit', 'computer', 'hologram'] },
    difficulty: 'medium',
    xp: 50,
  },
  {
    id: 'weather-pokemon',
    title: 'Storm Bringer',
    description: 'Create a Pokémon that embodies weather phenomena',
    hint: 'Hurricanes, tornadoes, lightning storms, blizzards...',
    requirements: { keywords: ['weather', 'storm', 'hurricane', 'tornado', 'lightning', 'blizzard', 'rain', 'thunder', 'cloud'] },
    difficulty: 'medium',
    xp: 50,
  },
  {
    id: 'crystal-pokemon',
    title: 'Gem Guardian',
    description: 'Create a Pokémon made of or inspired by crystals/gems',
    hint: 'Diamonds, amethyst, crystal caves, precious gems...',
    requirements: { keywords: ['crystal', 'gem', 'diamond', 'amethyst', 'ruby', 'sapphire', 'jewel', 'prism'] },
    difficulty: 'easy',
    xp: 30,
  },
  {
    id: 'plant-pokemon',
    title: 'Botanical Beast',
    description: 'Create a unique plant-based Pokémon',
    hint: 'Carnivorous plants, ancient trees, magical flowers...',
    requirements: { keywords: ['plant', 'flower', 'tree', 'vine', 'botanical', 'carnivorous', 'forest', 'garden', 'seed'] },
    difficulty: 'easy',
    xp: 30,
  },
  {
    id: 'time-pokemon',
    title: 'Temporal Anomaly',
    description: 'Create a Pokémon related to time',
    hint: 'Clocks, hourglasses, time loops, ancient/futuristic...',
    requirements: { keywords: ['time', 'clock', 'hourglass', 'temporal', 'future', 'past', 'ancient', 'eternal'] },
    difficulty: 'hard',
    xp: 75,
  },

  // ============================================
  // SPECIAL CHALLENGES
  // ============================================
  {
    id: 'shiny-hunter',
    title: 'Shiny Hunter',
    description: 'Find a shiny Pokémon! (1/4096 chance)',
    hint: 'Keep creating... luck will find you eventually!',
    requirements: { shiny: true },
    difficulty: 'legendary',
    xp: 500,
  },
  {
    id: 'cute-pokemon',
    title: 'Adorable Creation',
    description: 'Create the cutest Pokémon you can imagine',
    hint: 'Big eyes, fluffy, small, round, pastel colors...',
    requirements: { keywords: ['cute', 'adorable', 'fluffy', 'small', 'baby', 'round', 'soft', 'cuddly'] },
    difficulty: 'easy',
    xp: 30,
  },
  {
    id: 'scary-pokemon',
    title: 'Nightmare Fuel',
    description: 'Create a genuinely terrifying Pokémon',
    hint: 'Horror themes, dark creatures, things that lurk in shadows...',
    requirements: { keywords: ['scary', 'horror', 'dark', 'nightmare', 'terror', 'creepy', 'sinister', 'shadow'] },
    difficulty: 'medium',
    xp: 50,
  },
  {
    id: 'legendary-concept',
    title: 'Legendary Aspirations',
    description: 'Create a Pokémon worthy of legendary status',
    hint: 'God-like beings, ancient guardians, cosmic entities...',
    requirements: { keywords: ['legendary', 'mythical', 'god', 'guardian', 'ancient', 'powerful', 'cosmic', 'divine'] },
    difficulty: 'hard',
    xp: 100,
  },
  {
    id: 'starter-style',
    title: 'Starter Material',
    description: 'Create a Pokémon that could be a regional starter',
    hint: 'Fire, Water, or Grass type with evolution potential...',
    requirements: { keywords: ['starter', 'first', 'partner', 'beginning', 'young', 'evolve'] },
    difficulty: 'medium',
    xp: 50,
  },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get today's challenge based on the date
 * Changes at midnight local time
 */
export const getTodaysChallenge = () => {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24)
  );
  const index = dayOfYear % DAILY_CHALLENGES.length;
  return DAILY_CHALLENGES[index];
};

/**
 * Get a random challenge
 */
export const getRandomChallenge = () => {
  const index = Math.floor(Math.random() * DAILY_CHALLENGES.length);
  return DAILY_CHALLENGES[index];
};

/**
 * Get challenges by difficulty
 */
export const getChallengesByDifficulty = (difficulty) => {
  return DAILY_CHALLENGES.filter(c => c.difficulty === difficulty);
};

/**
 * Check if a Pokémon meets challenge requirements
 * @param {Object} pokemon - The created Pokémon
 * @param {Object} challenge - The challenge to check against
 * @returns {boolean}
 */
export const checkChallengeCompletion = (pokemon, challenge) => {
  if (!challenge.requirements) return false;

  const { types, keywords, shiny } = challenge.requirements;

  // Type check - must have ALL required types
  if (types) {
    const pokemonTypes = pokemon.types || [];
    const hasAllTypes = types.every(t => 
      pokemonTypes.map(pt => pt.toLowerCase()).includes(t.toLowerCase())
    );
    if (!hasAllTypes) return false;
  }

  // Keyword check - must have AT LEAST ONE keyword in name or description
  if (keywords) {
    const searchText = `${pokemon.name || ''} ${pokemon.description || ''} ${pokemon.concept || ''}`.toLowerCase();
    const hasKeyword = keywords.some(k => searchText.includes(k.toLowerCase()));
    if (!hasKeyword) return false;
  }

  // Shiny check
  if (shiny && !pokemon.is_shiny) return false;

  return true;
};

/**
 * Get difficulty color for UI
 */
export const getDifficultyColor = (difficulty) => {
  const colors = {
    easy: '#22c55e',      // green
    medium: '#f59e0b',    // amber
    hard: '#ef4444',      // red
    legendary: '#a855f7', // purple
  };
  return colors[difficulty] || '#6b7280';
};

/**
 * Get difficulty label
 */
export const getDifficultyLabel = (difficulty) => {
  const labels = {
    easy: '⭐ Easy',
    medium: '⭐⭐ Medium',
    hard: '⭐⭐⭐ Hard',
    legendary: '👑 Legendary',
  };
  return labels[difficulty] || difficulty;
};

export default DAILY_CHALLENGES;