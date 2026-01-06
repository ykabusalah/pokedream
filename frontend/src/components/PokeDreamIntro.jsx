import { useState, useEffect } from 'react';

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
  
  return <span>{displayed}<span className={`${done ? 'opacity-0' : 'animate-pulse'}`}>▌</span></span>;
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

// Text input
const PixelInput = ({ value, onChange, placeholder, onSubmit }) => (
  <div className="flex gap-3 mt-4">
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      onKeyDown={(e) => e.key === 'Enter' && value.trim() && onSubmit()}
      className="flex-1 bg-gray-100 text-gray-900 text-xl px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-amber-400"
      style={{ border: '3px solid #303030' }}
      autoFocus
    />
    <button
      onClick={() => value.trim() && onSubmit()}
      disabled={!value.trim()}
      className="px-6 py-3 bg-amber-500 text-white font-bold rounded-lg transition-all hover:bg-amber-400 disabled:opacity-50"
      style={{ border: '3px solid #92400e' }}
    >
      OK
    </button>
  </div>
);

// Platinum-style gold pattern background
const GoldPatternBackground = () => (
  <div className="absolute inset-0 overflow-hidden bg-gradient-to-b from-stone-900 via-amber-950 to-stone-900">
    {/* Panning pattern */}
    <div 
      className="absolute inset-0"
      style={{ animation: 'panLeft 12s linear infinite' }}
    >
      <svg width="200%" height="100%" className="opacity-30">
        {[0, 800, 1600].map((offset) => (
          <g key={offset} transform={`translate(${offset}, 0)`}>
            {/* Ornate circles */}
            <circle cx="400" cy="50%" r="280" fill="none" stroke="#d4af37" strokeWidth="3" />
            <circle cx="400" cy="50%" r="260" fill="none" stroke="#b8860b" strokeWidth="2" />
            <circle cx="400" cy="50%" r="220" fill="none" stroke="#d4af37" strokeWidth="4" />
            <circle cx="400" cy="50%" r="180" fill="none" stroke="#b8860b" strokeWidth="2" />
            {/* Radial spokes */}
            {[...Array(12)].map((_, i) => (
              <line key={i} x1="400" y1="50%" x2={400 + Math.cos(i * 30 * Math.PI / 180) * 300} 
                y2={`calc(50% + ${Math.sin(i * 30 * Math.PI / 180) * 300}px)`}
                stroke="#8b7355" strokeWidth="1" opacity="0.5" />
            ))}
          </g>
        ))}
        {/* Horizontal lines */}
        <line x1="0" y1="30%" x2="200%" y2="30%" stroke="#8b7355" strokeWidth="2" opacity="0.3" />
        <line x1="0" y1="70%" x2="200%" y2="70%" stroke="#8b7355" strokeWidth="2" opacity="0.3" />
      </svg>
    </div>
    {/* Sparkles */}
    {[...Array(25)].map((_, i) => (
      <div 
        key={i}
        className="absolute bg-amber-200 rounded-full"
        style={{
          width: Math.random() > 0.9 ? '3px' : '2px',
          height: Math.random() > 0.9 ? '3px' : '2px',
          left: `${Math.random() * 100}%`,
          top: `-10px`,
          animation: `fall ${4 + Math.random() * 4}s linear infinite`,
          animationDelay: `${Math.random() * 4}s`,
          opacity: 0.4 + Math.random() * 0.6
        }}
      />
    ))}
  </div>
);

export default function PokeDreamIntro({ onComplete }) {
  const [phase, setPhase] = useState('black'); // black -> pan -> fadeToBlack -> professor
  const [dialogIndex, setDialogIndex] = useState(0);
  const [textComplete, setTextComplete] = useState(false);
  const [trainerName, setTrainerName] = useState('');
  const [confirmedName, setConfirmedName] = useState('');
  
  const dialogs = [
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
    { text: `Right! So your name is ${confirmedName}!`, type: "speech", dynamic: true },
    { text: `${confirmedName}! Your very own Pokémon dream is about to unfold!`, type: "speech", dynamic: true },
    { text: "A world of dreams and adventures with AI-generated Pokémon awaits!", type: "speech" },
    { text: "Let's go!", type: "speech" },
  ];
  
  // Phase timing
  useEffect(() => {
    const t1 = setTimeout(() => setPhase('pan'), 800);
    const t2 = setTimeout(() => setPhase('fadeToBlack'), 5500);
    const t3 = setTimeout(() => setPhase('professor'), 6500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);
  
  const currentDialog = dialogs[dialogIndex];
  const displayText = currentDialog?.dynamic 
    ? currentDialog.text.replace('${confirmedName}', confirmedName)
    : currentDialog?.text;
  
  const handleContinue = () => {
    if (!textComplete && currentDialog?.type === 'speech') return;
    if (dialogIndex < dialogs.length - 1) {
      setDialogIndex(d => d + 1);
      setTextComplete(false);
    } else {
      onComplete?.(confirmedName);
    }
  };
  
  const handleNameSubmit = () => {
    if (trainerName.trim()) {
      setConfirmedName(trainerName.trim());
      setDialogIndex(d => d + 1);
      setTextComplete(false);
    }
  };
  
  const handleSkip = () => {
    const name = trainerName.trim() || 'Trainer';
    onComplete?.(name);
  };
  
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center p-8 overflow-hidden bg-black">
      
      {/* Phase: Black */}
      <div className={`absolute inset-0 bg-black z-20 transition-opacity duration-700 
        ${phase === 'black' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
      />
      
      {/* Phase: Pan (gold patterns) */}
      <div className={`absolute inset-0 transition-opacity duration-1000 
        ${phase === 'pan' ? 'opacity-100' : phase === 'fadeToBlack' ? 'opacity-0' : 'opacity-0'}`}>
        <GoldPatternBackground />
      </div>
      
      {/* Phase: Professor */}
      <div className={`relative z-10 flex flex-col items-center transition-all duration-1000 
        ${phase === 'professor' ? 'opacity-100' : 'opacity-0'}`}>
        
        {/* Subtle gold background for professor scene */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-amber-950/50 via-stone-900 to-stone-950" />
        
        {/* Blaine sprite */}
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
        
        {/* Dialog */}
        {currentDialog && (
          <DialogBox showContinue={textComplete && currentDialog.type === 'speech'} onContinue={handleContinue}>
            {currentDialog.type === 'speech' && (
              <TypewriterText
                key={dialogIndex}
                text={displayText}
                speed={35}
                isActive={phase === 'professor'}
                onComplete={() => setTextComplete(true)}
              />
            )}
            {currentDialog.type === 'nameInput' && (
              <>
                <TypewriterText
                  key={dialogIndex}
                  text={displayText}
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
                  />
                )}
              </>
            )}
          </DialogBox>
        )}
        
        {/* Skip */}
        <button 
          onClick={handleSkip}
          className="mt-8 text-amber-200/40 hover:text-amber-200/70 text-sm transition-colors"
        >
          Skip Intro →
        </button>
      </div>
      
      <style>{`
        @keyframes panLeft {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
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