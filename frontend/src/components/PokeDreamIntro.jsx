import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:8000';

// Blaine's humorous responses for blank names
const BLANK_NAME_RESPONSES = [
  "A blank name? What are you, a Ditto trying to blend in?",
  "You DO have a name, right? Even my Magmar has a name!",
  "No name? Did a Psyduck steal your memory?",
  "Come on now, even MissingNo. had more of an identity than that!",
  "I can't just call you 'Hey You!' ...Actually, I could, but I won't.",
  "Nice try, but 'nothing' isn't a name. Trust me, I've checked the records.",
];

// Blaine's responses for inappropriate names
const INAPPROPRIATE_NAME_RESPONSES = [
  "Whoa there! Let's keep it family-friendly. This isn't the Celadon Game Corner!",
  "I've seen some things in my Gym Leader days, but that name? No way.",
  "My Rapidash just fainted from reading that. Try again!",
  "That name would get us both banned from the Pokémon League. Next!",
];

// Blaine's responses for too-short names
const SHORT_NAME_RESPONSES = [
  "That's a bit short, don't you think? Give me at least 2 characters to work with!",
  "One letter? Even Unown uses more than that! Try again.",
  "I need at least 2 characters. My old eyes can't read anything shorter!",
];

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

// Blaine sprite
const BlaineSprite = () => (
  <div className="flex flex-col items-center" style={{ animation: 'float 3s ease-in-out infinite' }}>
    <img 
      src="/blaine.png"
      alt="Blaine"
      className="h-32"
      style={{ imageRendering: 'pixelated' }}
    />
    <svg viewBox="0 0 40 24" className="w-14 h-8 -mt-1">
      <rect x="2" y="5" width="36" height="17" rx="2" fill="#8B5A2B" stroke="#5D3A1A" strokeWidth="1.5"/>
      <rect x="2" y="5" width="36" height="4" fill="#A0522D"/>
      <rect x="15" y="1" width="10" height="5" rx="1" fill="#5D3A1A"/>
      <rect x="17" y="2" width="6" height="3" fill="#8B5A2B"/>
      <rect x="9" y="12" width="4" height="2" fill="#DAA520"/>
      <rect x="27" y="12" width="4" height="2" fill="#DAA520"/>
    </svg>
  </div>
);

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

export default function PokeDreamIntro({ onComplete, savedTrainerName }) {
  const [phase, setPhase] = useState('black');
  const [dialogIndex, setDialogIndex] = useState(0);
  const [textComplete, setTextComplete] = useState(false);
  const [trainerName, setTrainerName] = useState('');
  const [confirmedName, setConfirmedName] = useState(savedTrainerName || '');
  const [isValidating, setIsValidating] = useState(false);
  const [blaineResponse, setBlaineResponse] = useState(null);
  const [showProfessor, setShowProfessor] = useState(false);
  
  // Check if returning user
  const isReturningUser = !!savedTrainerName;

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

  // Dialogs for RETURNING users (short and funny)
  const returningUserDialogs = [
    { text: `Oh! Well, well, well... if it isn't ${savedTrainerName}!`, type: "speech" },
    { text: "I knew you'd come crawling back. They always do.", type: "speech" },
    { text: "What's the matter? Couldn't resist my charming personality?", type: "speech" },
    { text: "...Or was it the AI-generated Pokémon? It's the Pokémon, isn't it.", type: "speech" },
    { text: "No matter! Professor Blaine is ALWAYS ready to create more digital creatures!", type: "speech" },
    { text: "The lab is warmed up, the servers are humming, and my incredibly legal AI is ready to go!", type: "speech" },
    { text: "Let's make some more Pokémon, shall we?", type: "speech" },
  ];

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
    // If showing a Blaine error response, dismiss it and go back to name input
    if (blaineResponse) {
      setBlaineResponse(null);
      setTextComplete(false);
      return;
    }
    
    // Don't advance if text is still typing
    if (!textComplete && currentDialog?.type === 'speech') return;
    
    // Don't advance if we're on name input - must use the OK button
    if (currentDialog?.type === 'nameInput') return;
    
    if (dialogIndex < dialogs.length - 1) {
      setDialogIndex(d => d + 1);
      setTextComplete(false);
    } else {
      // Save name to localStorage and complete
      const finalName = isReturningUser ? savedTrainerName : confirmedName;
      if (finalName) {
        localStorage.setItem('pokedream_trainer_name', finalName);
      }
      onComplete?.(finalName || 'Trainer');
    }
  };

  const handleNameSubmit = async () => {
    const name = trainerName.trim();
    
    // Check for blank name
    if (!name) {
      const randomMsg = BLANK_NAME_RESPONSES[Math.floor(Math.random() * BLANK_NAME_RESPONSES.length)];
      setBlaineResponse(randomMsg);
      setTextComplete(false);
      return;
    }
    
    // Check length (minimum 2 characters)
    if (name.length < 2) {
      const randomMsg = SHORT_NAME_RESPONSES[Math.floor(Math.random() * SHORT_NAME_RESPONSES.length)];
      setBlaineResponse(randomMsg);
      setTextComplete(false);
      return;
    }
    
    setIsValidating(true);
    
    try {
      // Validate name with backend
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
      // If API fails, do basic validation and allow
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
      // Returning user can always skip to generator
      onComplete?.(savedTrainerName);
    } else if (confirmedName) {
      // New user with confirmed name can skip to generator
      localStorage.setItem('pokedream_trainer_name', confirmedName);
      onComplete?.(confirmedName);
    } else {
      // New user without name - skip to name input dialog
      setDialogIndex(13); // "What's your name?" is index 13
      setTextComplete(true);
      setBlaineResponse(null);
    }
  };

  // Determine if skip button should show
  // For returning users: always show
  // For new users: hide during name input AND when showing Blaine's error response
  const showSkipButton = isReturningUser || confirmedName || (currentDialog?.type !== 'nameInput' && !blaineResponse);
  
  // Skip button text
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
          {/* Blaine sprite - show earlier for returning users */}
          {showProfessor && (isReturningUser || dialogIndex >= 3) && (
            <div className="mb-4 flex justify-center w-full">
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
              
              {/* Name input field (new users only) */}
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

          {/* Skip button - below dialog */}
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