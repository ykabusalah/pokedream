import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:8000';

// ============================================
// VISIT TRACKING HELPERS (NEW IN COMMIT 2)
// ============================================
const getVisitCount = () => {
  return parseInt(localStorage.getItem('pokedream_visit_count') || '0', 10);
};

const incrementVisitCount = () => {
  const count = getVisitCount() + 1;
  localStorage.setItem('pokedream_visit_count', count.toString());
  return count;
};

// ============================================
// HIDDEN MILESTONE DIALOGUE (NEW IN COMMIT 2)
// ============================================
const getMilestoneDialogue = (visitCount, name) => {
  const milestones = {
    5: [
      { text: `${name}! Back again? That's 5 visits now!`, type: "speech" },
      { text: `You know, dedication like yours reminds me of my days training Fire-types on Cinnabar...`, type: "speech" },
      { text: `Before the volcano incident, of course. *adjusts sunglasses*`, type: "speech" },
    ],
    10: [
      { text: `Well, well! ${name}, visit number 10!`, type: "speech" },
      { text: `At this point, you might know the Oneira region better than I do!`, type: "speech" },
      { text: `Here's a riddle: What gets stronger every time it's created?`, type: "speech" },
      { text: `...Your imagination!`, type: "speech" },
    ],
    25: [
      { text: `${name}... 25 visits. I'm genuinely impressed.`, type: "speech" },
      { text: `You've become a true Pokémon researcher. Professor Oak would be proud.`, type: "speech" },
      { text: `Between you and me... I think your Pokédex might be more interesting than the official one!`, type: "speech" },
    ],
    50: [
      { text: `*Blaine removes his sunglasses in shock*`, type: "speech" },
      { text: `${name}... 50 visits?! You're not a trainer anymore...`, type: "speech" },
      { text: `You're a LEGEND. The Oneira region owes you a debt of gratitude.`, type: "speech" },
      { text: `I hereby grant you the unofficial title of "Pokémon Dream Master"!`, type: "speech" },
    ],
    100: [
      { text: `...`, type: "speech" },
      { text: `${name}. 100 visits.`, type: "speech" },
      { text: `I... I don't have a riddle for this. I'm speechless.`, type: "speech" },
      { text: `You've created more Pokémon than some entire regions have discovered.`, type: "speech" },
      { text: `Thank you. Truly. For believing in dreams.`, type: "speech" },
    ],
  };

  return milestones[visitCount] || null;
};

// Varied returning user dialogue (keeps it fresh)
const getReturningUserDialogue = (visitCount, name) => {
  // Check for milestone first
  const milestone = getMilestoneDialogue(visitCount, name);
  if (milestone) {
    return [...milestone, { text: `Now, let's create some more Pokémon!`, type: "speech" }];
  }

  // Regular returning dialogue - varies based on visit count
  const dialogueOptions = [
    [
      { text: `Oh! Well, well, well... if it isn't ${name}!`, type: "speech" },
      { text: "I knew you'd come crawling back. They always do.", type: "speech" },
      { text: "What's the matter? Couldn't resist my charming personality?", type: "speech" },
      { text: "...Or was it the AI-generated Pokémon? It's the Pokémon, isn't it.", type: "speech" },
      { text: "Let's make some more, shall we?", type: "speech" },
    ],
    [
      { text: `${name}! Welcome back to the Oneira region!`, type: "speech" },
      { text: "The servers are warm, the AI is ready, and I've got new riddles!", type: "speech" },
      { text: "Here's one: What sleeps in your mind but wakes up on screen?", type: "speech" },
      { text: "...A dream Pokémon! Get it? ...You don't want to hear the riddles? Fine, fine.", type: "speech" },
      { text: "Let's just make some Pokémon then!", type: "speech" },
    ],
    [
      { text: `Ah, ${name}! The dream researcher returns!`, type: "speech" },
      { text: "I was just calibrating the neural networks. Perfect timing!", type: "speech" },
      { text: "Your Pokédex awaits. What will you create today?", type: "speech" },
    ],
    [
      { text: `${name}! *adjusts suitcase excitedly*`, type: "speech" },
      { text: "I've been experimenting with new algorithms since your last visit!", type: "speech" },
      { text: "The Pokémon we can create now... they're even more magnificent!", type: "speech" },
      { text: "Ready to see what dreams await?", type: "speech" },
    ],
    [
      { text: `Back so soon, ${name}?`, type: "speech" },
      { text: "Not that I'm complaining! Business has been... well, you're my only visitor.", type: "speech" },
      { text: "But that just means more GPU power for YOUR Pokémon!", type: "speech" },
      { text: "Oh! Before we start - a riddle: What has no body but lives in every trainer's heart?", type: "speech" },
      { text: "...The dream of a new Pokémon! Now let's make that dream real!", type: "speech" },
    ],
    [
      { text: `${name}! Excellent timing!`, type: "speech" },
      { text: "I was just about to take a coffee break, but Pokémon creation is MORE important!", type: "speech" },
      { text: "...Don't tell anyone I said that. Professors need their coffee.", type: "speech" },
      { text: "Anyway, let's dream up some new creatures!", type: "speech" },
    ],
  ];

  // Pick dialogue based on visit count to ensure variety
  const index = visitCount % dialogueOptions.length;
  return dialogueOptions[index];
};

// ============================================
// BLAINE'S NAME VALIDATION RESPONSES
// ============================================
const BLANK_NAME_RESPONSES = [
  "A blank name? What are you, a Ditto trying to blend in?",
  "You DO have a name, right? Even my Magmar has a name!",
  "No name? Did a Psyduck steal your memory?",
  "Come on now, even MissingNo. had more of an identity than that!",
  "I can't just call you 'Hey You!' ...Actually, I could, but I won't.",
  "Nice try, but 'nothing' isn't a name. Trust me, I've checked the records.",
];

const INAPPROPRIATE_NAME_RESPONSES = [
  "Whoa there! Let's keep it family-friendly. This isn't the Celadon Game Corner!",
  "I've seen some things in my Gym Leader days, but that name? No way.",
  "My Rapidash just fainted from reading that. Try again!",
  "That name would get us both banned from the Pokémon League. Next!",
];

const SHORT_NAME_RESPONSES = [
  "That's a bit short, don't you think? Give me at least 2 characters to work with!",
  "One letter? Even Unown uses more than that! Try again.",
  "I need at least 2 characters. My old eyes can't read anything shorter!",
];

// ============================================
// UI COMPONENTS
// ============================================

// Typewriter effect
const TypewriterText = ({ text, speed = 35, isActive, onComplete }) => {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  
  useEffect(() => {
    if (!isActive) return;
    setDisplayed('');
    setDone(false);
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
        setDone(true);
        onComplete?.();
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, isActive]);
  
  return <span>{displayed}<span className={`${done ? 'opacity-0' : 'animate-pulse'}`}>|</span></span>;
};

// Sparkle particle
const Sparkle = ({ x, delay }) => (
  <div
    className="absolute w-1 h-1 bg-yellow-100 rounded-full"
    style={{
      left: `${x}%`,
      boxShadow: '0 0 6px 2px rgba(255,255,200,0.8)',
      animation: `fall 3.5s linear ${delay}s infinite`,
    }}
  />
);

// Blaine sprite with suitcase - aligned to Blaine's visual center
const BlaineSprite = () => {
  // Adjust this value to align suitcase with Blaine's head
  // Negative = move left, Positive = move right
  const suitcaseOffset = -4; // pixels - tweak as needed
  
  return (
    <div 
      className="flex flex-col items-center justify-center" 
      style={{ animation: 'float 3s ease-in-out infinite' }}
    >
      {/* Blaine image */}
      <img 
        src="/blaine.png"
        alt="Blaine"
        className="h-32"
        style={{ imageRendering: 'pixelated' }}
      />
      
      {/* Suitcase - positioned relative to Blaine's visual center */}
      <div 
        className="-mt-1"
        style={{ marginLeft: `${suitcaseOffset}px` }}
      >
        <svg viewBox="0 0 60 35" className="w-16 h-10" style={{ imageRendering: 'pixelated' }}>
          {/* Suitcase body */}
          <rect x="5" y="8" width="50" height="25" rx="3" fill="#8B4513" stroke="#5D2E0C" strokeWidth="2" />
          {/* Top band */}
          <rect x="5" y="8" width="50" height="6" rx="2" fill="#A0522D" />
          {/* Handle */}
          <rect x="24" y="2" width="12" height="8" rx="2" fill="#5D2E0C" />
          <rect x="26" y="4" width="8" height="4" rx="1" fill="#8B4513" />
          {/* Latches */}
          <rect x="15" y="18" width="6" height="4" rx="1" fill="#DAA520" stroke="#B8860B" strokeWidth="1" />
          <rect x="39" y="18" width="6" height="4" rx="1" fill="#DAA520" stroke="#B8860B" strokeWidth="1" />
          {/* Center clasp */}
          <rect x="26" y="16" width="8" height="6" rx="1" fill="#DAA520" stroke="#B8860B" strokeWidth="1" />
          <circle cx="30" cy="19" r="2" fill="#B8860B" />
        </svg>
      </div>
    </div>
  );
};

// Dialog box
const DialogBox = ({ speaker, children, showArrow, onClick }) => (
  <div className="w-full max-w-xl mx-auto px-4" onClick={onClick}>
    {speaker && (
      <div 
        className="inline-block px-3 py-1 text-sm font-medium text-gray-700 ml-3"
        style={{
          background: 'linear-gradient(180deg, #f0f0e8 0%, #d8d8c8 100%)',
          border: '2px solid #707070',
          borderBottom: 'none',
          borderRadius: '6px 6px 0 0',
        }}
      >
        {speaker}
      </div>
    )}
    <div 
      className="relative p-4 cursor-pointer select-none"
      style={{
        background: 'linear-gradient(180deg, #f8f8f0 0%, #e8e8d8 100%)',
        border: '3px solid #606060',
        borderRadius: speaker ? '0 10px 10px 10px' : '10px',
      }}
    >
      <div className="text-gray-800 text-lg leading-relaxed min-h-[45px]">
        {children}
      </div>
      {showArrow && (
        <div className="absolute bottom-2 right-3 animate-bounce text-gray-500">▼</div>
      )}
    </div>
  </div>
);

// ============================================
// MAIN COMPONENT
// ============================================
export default function PokeDreamIntro({ onComplete, savedTrainerName }) {
  const [phase, setPhase] = useState('black');
  const [dialogIndex, setDialogIndex] = useState(0);
  const [textComplete, setTextComplete] = useState(false);
  const [trainerName, setTrainerName] = useState('');
  const [confirmedName, setConfirmedName] = useState(savedTrainerName || '');
  const [isValidating, setIsValidating] = useState(false);
  const [blaineResponse, setBlaineResponse] = useState(null);
  const [showProfessor, setShowProfessor] = useState(false);
  const [visitCount, setVisitCount] = useState(0);
  
  // Check if returning user
  const isReturningUser = !!savedTrainerName;

  // Track visit on mount (NEW IN COMMIT 2)
  useEffect(() => {
    const count = incrementVisitCount();
    setVisitCount(count);
  }, []);

  // Dialogs for NEW users
  const newUserDialogs = [
    { text: "Hello there!", type: "speech" },
    { text: "It's so nice to meet you.", type: "speech" },
    { text: "Welcome to the world of Pokémon!", type: "speech" },
    { text: "My name is Blaine. I'm going to be your Pokémon Professor today!", type: "speech" },
    { text: "It's a pleasure to meet you.", type: "speech" },
    { text: "...What's that? You recognize me?", type: "speech" },
    { text: "Ah yes... from Cinnabar Island. In Kanto. The Fire-type Gym Leader.", type: "speech" },
    { text: "Well... let's just say we had a few lawsuits after the volcano in the gym went off.", type: "speech" },
    { text: "Had to leave town in a hurry. Very hush-hush. You understand.", type: "speech" },
    { text: "And if you don't keep quiet about it... you don't get a Pokémon! Capisce?", type: "speech" },
    { text: "Ahem. ANYWAY!", type: "speech" },
    { text: "I've reinvented myself! Now I use ARTIFICIAL INTELLIGENCE to create brand new Pokémon!", type: "speech" },
    { text: "It's like breeding, but with more GPUs and fewer Dittos. Much more sanitary.", type: "speech" },
    { text: "But first, tell me about yourself. What's your name?", type: "nameInput" },
    { text: "Right! So your name is NAME_PLACEHOLDER!", type: "speech", dynamic: true },
    { text: "Today, we're demoing a new way to give trainers a Pokémon.", type: "speech" },
    { text: "Through the power of new technologies, we are actively creating NEW Pokémon!", type: "speech" },
    { text: "NAME_PLACEHOLDER! Your very own Pokémon dream is about to unfold!", type: "speech", dynamic: true },
    { text: "A world of dreams and adventures with AI-generated Pokémon awaits!", type: "speech" },
    { text: "Let's go!", type: "speech" },
  ];

  // Get returning user dialogs dynamically based on visit count (UPDATED IN COMMIT 2)
  const returningUserDialogs = isReturningUser 
    ? getReturningUserDialogue(visitCount, savedTrainerName)
    : [];

  // Choose dialog set based on user type
  const dialogs = isReturningUser ? returningUserDialogs : newUserDialogs;

  // Phase transitions
  useEffect(() => {
    const t1 = setTimeout(() => setPhase('fadein'), 500);
    const t2 = setTimeout(() => {
      setPhase('dialog');
      setShowProfessor(true);
    }, 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const currentDialog = dialogs[dialogIndex];
  
  const getDisplayText = () => {
    if (blaineResponse) return blaineResponse;
    if (!currentDialog) return '';
    if (currentDialog.dynamic) {
      return currentDialog.text.replace(/NAME_PLACEHOLDER/g, confirmedName);
    }
    return currentDialog.text;
  };

  const handleContinue = () => {
    if (blaineResponse) {
      setBlaineResponse(null);
      setTextComplete(false);
      return;
    }
    
    if (!textComplete && currentDialog?.type === 'speech') return;
    if (currentDialog?.type === 'nameInput') return;
    
    if (dialogIndex < dialogs.length - 1) {
      setDialogIndex(d => d + 1);
      setTextComplete(false);
    } else {
      const finalName = isReturningUser ? savedTrainerName : confirmedName;
      if (finalName) {
        localStorage.setItem('pokedream_trainer_name', finalName);
      }
      onComplete?.(finalName || 'Trainer');
    }
  };

  // Keyboard support for advancing dialogue (Enter and Space)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if user is typing in the name input
      if (currentDialog?.type === 'nameInput' && textComplete && !blaineResponse) {
        return;
      }
      
      // Enter or Space advances dialogue
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleContinue();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [textComplete, blaineResponse, dialogIndex, currentDialog]);

  const handleNameSubmit = async () => {
    const name = trainerName.trim();
    
    if (!name) {
      const randomMsg = BLANK_NAME_RESPONSES[Math.floor(Math.random() * BLANK_NAME_RESPONSES.length)];
      setBlaineResponse(randomMsg);
      setTextComplete(false);
      return;
    }
    
    if (name.length < 2) {
      const randomMsg = SHORT_NAME_RESPONSES[Math.floor(Math.random() * SHORT_NAME_RESPONSES.length)];
      setBlaineResponse(randomMsg);
      setTextComplete(false);
      return;
    }
    
    setIsValidating(true);
    
    try {
      const res = await fetch(`${API_URL}/api/validate-name`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      
      const data = await res.json();
      
      if (data.valid) {
        setConfirmedName(data.sanitized || name);
        setDialogIndex(d => d + 1);
        setTextComplete(false);
        setBlaineResponse(null);
      } else {
        const randomMsg = INAPPROPRIATE_NAME_RESPONSES[Math.floor(Math.random() * INAPPROPRIATE_NAME_RESPONSES.length)];
        setBlaineResponse(randomMsg);
        setTextComplete(false);
      }
    } catch (err) {
      if (name.length >= 2 && name.length <= 20) {
        setConfirmedName(name);
        setDialogIndex(d => d + 1);
        setTextComplete(false);
        setBlaineResponse(null);
      } else {
        setBlaineResponse("Something went wrong! But hey, if your name is valid, just try again.");
        setTextComplete(false);
      }
    } finally {
      setIsValidating(false);
    }
  };

  const handleSkip = () => {
    if (isReturningUser) {
      onComplete?.(savedTrainerName);
    } else if (confirmedName) {
      localStorage.setItem('pokedream_trainer_name', confirmedName);
      onComplete?.(confirmedName);
    } else {
      setDialogIndex(13);
      setTextComplete(true);
      setBlaineResponse(null);
    }
  };

  const showSkipButton = isReturningUser || confirmedName || (currentDialog?.type !== 'nameInput' && !blaineResponse);
  
  const getSkipButtonText = () => {
    if (isReturningUser) return "Skip to generator →";
    if (confirmedName) return "Skip to generator →";
    return "Skip to name →";
  };

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      {/* Platinum gold gradient background */}
      <div 
        className={`absolute inset-0 transition-opacity duration-1000 ${phase !== 'black' ? 'opacity-100' : 'opacity-0'}`}
        style={{
          background: 'linear-gradient(180deg, #2a2520 0%, #3d362d 30%, #4a4035 50%, #3d362d 70%, #2a2520 100%)',
        }}
      />
      
      {/* Sparkles */}
      <div className={`absolute inset-0 overflow-hidden transition-opacity duration-1000 ${phase !== 'black' ? 'opacity-100' : 'opacity-0'}`}>
        {[...Array(20)].map((_, i) => (
          <Sparkle key={i} x={Math.random() * 100} delay={Math.random() * 3} />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center p-4 w-full min-h-screen">
        <div className="flex flex-col items-center w-full max-w-xl">
          {/* Blaine sprite - show immediately for returning users */}
          {showProfessor && (isReturningUser || dialogIndex >= 3) && (
            <div className="w-full max-w-md mx-auto flex justify-center mb-4">
              <BlaineSprite />
            </div>
          )}

          {/* Dialog box */}
          {currentDialog && phase === 'dialog' && (
            <DialogBox 
              speaker={(!isReturningUser && dialogIndex < 3) ? "???" : "Blaine"} 
              showArrow={textComplete && currentDialog.type === 'speech' && !blaineResponse} 
              onClick={handleContinue}
            >
              <TypewriterText 
                key={`${dialogIndex}-${blaineResponse}`}
                text={getDisplayText()} 
                isActive={true} 
                onComplete={() => setTextComplete(true)} 
              />
              
              {currentDialog.type === 'nameInput' && textComplete && !blaineResponse && (
                <div className="flex gap-2 mt-3">
                  <input
                    value={trainerName}
                    onChange={e => setTrainerName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleNameSubmit()}
                    className="flex-1 px-3 py-2 border-2 border-gray-400 rounded text-gray-800 text-lg"
                    placeholder="Your name..."
                    maxLength={20}
                    autoFocus
                    disabled={isValidating}
                  />
                  <button 
                    onClick={handleNameSubmit} 
                    disabled={isValidating}
                    className="px-5 py-2 bg-amber-500 text-white rounded font-bold hover:bg-amber-400 disabled:opacity-50"
                  >
                    {isValidating ? '...' : 'OK'}
                  </button>
                </div>
              )}
            </DialogBox>
          )}

          {/* Skip button */}
          <div className="mt-4 h-6">
            {showSkipButton && (
              <button 
                onClick={handleSkip}
                className="text-white/40 hover:text-white/70 text-sm transition-colors"
              >
                {getSkipButtonText()}
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fall {
          0% { top: -10px; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 0.8; }
          100% { top: 100vh; opacity: 0; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  );
}