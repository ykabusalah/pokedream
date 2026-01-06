import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:8000';

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
  
  return <span>{displayed}<span className={`${done ? 'opacity-0' : 'animate-pulse'}`}>▼</span></span>;
};

// Dialog box
const DialogBox = ({ children, showContinue, onContinue }) => (
  <div className="w-full max-w-2xl mx-auto">
    <div 
      className="relative bg-white rounded-lg p-5 cursor-pointer"
      style={{
        border: '4px solid #303030',
        boxShadow: 'inset 0 0 0 3px #f8f8f8, inset 0 0 0 5px #b0b0b0',
      }}
      onClick={onContinue}
    >
      <div className="text-gray-900 text-xl leading-relaxed min-h-[80px]" style={{ fontFamily: 'system-ui' }}>
        {children}
      </div>
      {showContinue && (
        <div className="absolute bottom-2 right-3 animate-bounce">
          <span className="text-gray-600 text-sm">▼</span>
        </div>
      )}
    </div>
  </div>
);

// Text input with validation
const PixelInput = ({ value, onChange, placeholder, onSubmit, isValidating }) => (
  <div className="mt-4">
    <div className="flex gap-3">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
        maxLength={20}
        className="flex-1 bg-gray-100 text-gray-900 text-xl px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-amber-400"
        style={{ border: '3px solid #303030' }}
        autoFocus
        disabled={isValidating}
      />
      <button
        onClick={onSubmit}
        disabled={isValidating}
        className="px-6 py-3 bg-amber-500 text-white font-bold rounded-lg transition-all hover:bg-amber-400 disabled:opacity-50"
        style={{ border: '3px solid #92400e' }}
      >
        {isValidating ? '...' : 'OK'}
      </button>
    </div>
    <p className="text-gray-500 text-xs mt-2">
      2-20 characters, letters and numbers only
    </p>
  </div>
);

// Simple gold sparkle background
const GoldPatternBackground = () => (
  <div className="absolute inset-0 overflow-hidden bg-black">
    {/* Gold sparkles falling */}
    {[...Array(40)].map((_, i) => (
      <div 
        key={i}
        className="absolute bg-amber-300 rounded-full"
        style={{
          width: Math.random() > 0.8 ? '4px' : Math.random() > 0.5 ? '3px' : '2px',
          height: Math.random() > 0.8 ? '4px' : Math.random() > 0.5 ? '3px' : '2px',
          left: `${Math.random() * 100}%`,
          top: `-10px`,
          animation: `fall ${5 + Math.random() * 5}s linear infinite`,
          animationDelay: `${Math.random() * 5}s`,
          opacity: 0.3 + Math.random() * 0.7,
          boxShadow: '0 0 6px 1px rgba(251, 191, 36, 0.6)'
        }}
      />
    ))}
  </div>
);

const BLANK_NAME_RESPONSES = [
  "...You DO have a name, right? Even my Magmar has a name!",
  "A blank name? What are you, a Ditto trying to blend in?",
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

export default function PokeDreamIntro({ onComplete, savedTrainerName }) {
  const [phase, setPhase] = useState('black');
  const [dialogIndex, setDialogIndex] = useState(0);
  const [textComplete, setTextComplete] = useState(false);
  const [trainerName, setTrainerName] = useState(savedTrainerName || '');
  const [confirmedName, setConfirmedName] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [blaineResponse, setBlaineResponse] = useState(null);
  const [isReturningUser] = useState(!!savedTrainerName);
  
  // Dialog for NEW users
  const newUserDialogs = [
    { text: "Hello there! Welcome to the world of PokéDream!", type: "speech" },
    { text: "My name is Blaine. I'm going to be your Pokémon Professor today!", type: "speech" },
    { text: "It's a pleasure to meet you.", type: "speech" },
    { text: "...What's that? You recognize me?", type: "speech" },
    { text: "Ah yes... from Cinnabar Island. In Kanto. The Fire-type Gym Leader.", type: "speech" },
    { text: "Well... let's just say we had a few lawsuits after the volcano in the gym went off.", type: "speech" },
    { text: "Had to leave town in a hurry. Very hush-hush. You understand.", type: "speech" },
    { text: "And if you don't keep quiet about it... you don't get a Pokémon! Capisce?", type: "speech" },
    { text: "...Ahem. ANYWAY!", type: "speech" },
    { text: "I've reinvented myself! Now I use the power of ARTIFICIAL INTELLIGENCE to create brand new Pokémon!", type: "speech" },
    { text: "It's like breeding, but with more GPUs and fewer Dittos. Much more sanitary.", type: "speech" },
    { text: "But first, tell me a little about yourself.", type: "speech" },
    { text: "What's your name?", type: "nameInput" },
    { text: "Right! So your name is NAME_PLACEHOLDER!", type: "speech", dynamic: true },
    { text: "NAME_PLACEHOLDER, your very own Pokémon dream is about to unfold!", type: "speech", dynamic: true },
    { text: "A world of dreams and adventures with AI-generated Pokémon awaits!", type: "speech" },
    { text: "Let's go!", type: "speech" },
  ];
  
  // Dialog for RETURNING users
  const returningUserDialogs = [
    { text: `Oh! Well, well, well... if it isn't NAME_PLACEHOLDER!`, type: "speech", dynamic: true },
    { text: "I knew you'd come crawling back! They always do.", type: "speech" },
    { text: "What's the matter? Couldn't resist my charming personality?", type: "speech" },
    { text: "...Or was it the AI-generated Pokémon? It's the Pokémon, isn't it.", type: "speech" },
    { text: "No matter! Professor Blaine is ALWAYS ready to create more digital creatures!", type: "speech" },
    { text: "The lab is warmed up, the servers are humming, and my incredibly legal AI is ready to go!", type: "speech" },
    { text: "Let's make some more Pokémon, shall we?", type: "speech" },
  ];
  
  const dialogs = isReturningUser ? returningUserDialogs : newUserDialogs;
  
  useEffect(() => {
    const t1 = setTimeout(() => setPhase('pan'), 800);
    const t2 = setTimeout(() => setPhase('fadeToBlack'), 5500);
    const t3 = setTimeout(() => setPhase('professor'), 6500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);
  
  const currentDialog = dialogs[dialogIndex];
  
  const getDisplayText = () => {
    if (blaineResponse) return blaineResponse;
    if (!currentDialog) return '';
    if (currentDialog.dynamic) {
      const nameToUse = isReturningUser ? savedTrainerName : confirmedName;
      return currentDialog.text.replace(/NAME_PLACEHOLDER/g, nameToUse);
    }
    return currentDialog.text;
  };
  
  const handleContinue = () => {
    // If showing a Blaine error response, go back to name input
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
      // End of dialog - use saved name for returning users
      const finalName = isReturningUser ? savedTrainerName : confirmedName;
      onComplete?.(finalName);
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
    
    // Check length
    if (name.length < 2) {
      setBlaineResponse("That's a bit short, don't you think? Give me at least 2 characters to work with!");
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
        setConfirmedName(data.sanitized);
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
    // Returning users can always skip
    if (isReturningUser) {
      onComplete?.(savedTrainerName);
      return;
    }
    
    // New users with confirmed name can skip
    if (confirmedName) {
      onComplete?.(confirmedName);
    } else {
      // Skip to name input
      setPhase('professor');
      setDialogIndex(12);
      setTextComplete(true);
      setBlaineResponse(null);
    }
  };
  
  // Determine if we should show the skip button
  const showSkipButton = isReturningUser || confirmedName || (currentDialog?.type !== 'nameInput' && !blaineResponse);
  
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center p-8 overflow-hidden bg-black">
      
      <div className={`absolute inset-0 bg-black z-20 transition-opacity duration-700 
        ${phase === 'black' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
      />
      
      <div className={`absolute inset-0 transition-opacity duration-1000 
        ${phase === 'pan' ? 'opacity-100' : phase === 'fadeToBlack' ? 'opacity-0' : 'opacity-0'}`}>
        <GoldPatternBackground />
      </div>
      
      <div className={`relative z-10 flex flex-col items-center transition-all duration-1000 
        ${phase === 'professor' ? 'opacity-100' : 'opacity-0'}`}>
        
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-amber-950/50 via-stone-900 to-stone-950" />
        
        <div className="mb-8 relative" style={{ animation: 'float 3s ease-in-out infinite' }}>
          <div className="absolute inset-0 blur-2xl opacity-40 bg-orange-500 rounded-full scale-150" />
          <img 
            src="/blaine.png"
            alt="Professor Blaine"
            className="relative z-10 w-32 h-auto"
            style={{ 
              imageRendering: 'pixelated',
              filter: 'drop-shadow(0 0 20px rgba(251, 146, 60, 0.5))'
            }}
          />
        </div>
        
        {(currentDialog || blaineResponse) && (
          <DialogBox 
            showContinue={textComplete && (blaineResponse || currentDialog?.type === 'speech')} 
            onContinue={handleContinue}
          >
            {blaineResponse ? (
              <TypewriterText
                key={`error-${blaineResponse}`}
                text={blaineResponse}
                speed={35}
                isActive={phase === 'professor'}
                onComplete={() => setTextComplete(true)}
              />
            ) : currentDialog?.type === 'speech' ? (
              <TypewriterText
                key={dialogIndex}
                text={getDisplayText()}
                speed={35}
                isActive={phase === 'professor'}
                onComplete={() => setTextComplete(true)}
              />
            ) : currentDialog?.type === 'nameInput' ? (
              <>
                <TypewriterText
                  key={dialogIndex}
                  text={getDisplayText()}
                  speed={35}
                  isActive={phase === 'professor'}
                  onComplete={() => setTextComplete(true)}
                />
                {textComplete && (
                  <PixelInput
                    value={trainerName}
                    onChange={setTrainerName}
                    placeholder="Enter your name..."
                    onSubmit={handleNameSubmit}
                    isValidating={isValidating}
                  />
                )}
              </>
            ) : null}
          </DialogBox>
        )}
        
        {showSkipButton && (
          <button 
            onClick={handleSkip}
            className="mt-8 text-amber-200/40 hover:text-amber-200/70 text-sm transition-colors"
          >
            {isReturningUser ? "Skip to Generator →" : (confirmedName ? "Skip to Generator →" : "Skip Intro →")}
          </button>
        )}
      </div>
      
      <style>{`
        @keyframes fall {
          0% { transform: translateY(-10px); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
}