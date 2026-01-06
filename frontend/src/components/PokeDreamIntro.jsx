import { useState, useEffect, useCallback } from 'react';

// Platinum-style dialog box
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

// Typewriter effect
const Typewriter = ({ text, onDone, active }) => {
  const [shown, setShown] = useState('');
  const [done, setDone] = useState(false);
  
  useEffect(() => {
    if (!active || !text) return;
    setShown('');
    setDone(false);
    let i = 0;
    const id = setInterval(() => {
      if (i < text.length) {
        setShown(text.slice(0, ++i));
      } else {
        setDone(true);
        clearInterval(id);
        onDone?.();
      }
    }, 28);
    return () => clearInterval(id);
  }, [text, active]);
  
  return <>{shown}{!done && <span className="animate-pulse">|</span>}</>;
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

// Blaine with suitcase
const BlaineSprite = () => (
  <div className="flex flex-col items-center" style={{ animation: 'float 3s ease-in-out infinite' }}>
    <img 
      src="/blaine.png"
      alt="Blaine"
      className="h-32"
      style={{ imageRendering: 'pixelated' }}
    />
    {/* Suitcase */}
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

export default function PokeDreamIntro({ onComplete }) {
  const [bg, setBg] = useState(0);
  const [msgIdx, setMsgIdx] = useState(0);
  const [typed, setTyped] = useState(false);
  const [name, setName] = useState('');
  const [confirmedName, setConfirmedName] = useState('');
  const [done, setDone] = useState(false);
  const [showProfessor, setShowProfessor] = useState(false);

  const messages = [
    { s: "???", t: "Hello there!" },
    { s: "???", t: "It's so nice to meet you." },
    { s: "???", t: "Welcome to the world of Pokémon!" },
    { s: "Blaine", t: "My name is Blaine. I'm going to be your Pokémon Professor today!" },
    { s: "Blaine", t: "It's a pleasure to meet you." },
    { s: "Blaine", t: "...What's that? You recognize me?" },
    { s: "Blaine", t: "Ah yes... from Cinnabar Island. In Kanto. The Fire-type Gym Leader." },
    { s: "Blaine", t: "Well... let's just say we had a few lawsuits after the volcano in the gym went off." },
    { s: "Blaine", t: "Had to leave town in a hurry. Very hush-hush. You understand." },
    { s: "Blaine", t: "And if you don't keep quiet about it... you don't get a Pokémon! Capisce?" },
    { s: "Blaine", t: "...Ahem. ANYWAY!" },
    { s: "Blaine", t: "I've reinvented myself! Now I use ARTIFICIAL INTELLIGENCE to create brand new Pokémon!" },
    { s: "Blaine", t: "It's like breeding, but with more GPUs and fewer Dittos. Much more sanitary." },
    { s: "Blaine", t: "But first, tell me about yourself. What's your name?", input: true },
    { s: "Blaine", t: `Right! So your name is ${confirmedName || '[NAME]'}!` },
    { s: "Blaine", t: "Today, we're demoing a new way to give trainers a Pokémon." },
    { s: "Blaine", t: "Through the power of new technologies, we are actively creating NEW Pokémon!" },
    { s: "Blaine", t: `${confirmedName || 'Trainer'}! Your very own Pokémon dream is about to unfold!` },
    { s: "Blaine", t: "A world of dreams and adventures with AI-generated Pokémon awaits!" },
    { s: "Blaine", t: "Let's go!" },
  ];

  const msg = messages[msgIdx];
  const displayText = msg?.t.replace(/\[NAME\]/g, confirmedName || '[NAME]');

  // Background fade in
  useEffect(() => {
    const t1 = setTimeout(() => setBg(1), 500);
    const t2 = setTimeout(() => setShowProfessor(true), 1500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // Handle done state
  useEffect(() => {
    if (done && onComplete) {
      onComplete(confirmedName || 'Trainer');
    }
  }, [done, confirmedName, onComplete]);

  const advance = useCallback(() => {
    if (!typed) return;
    if (msg?.input && !confirmedName) return;
    
    if (msgIdx < messages.length - 1) {
      setMsgIdx(i => i + 1);
      setTyped(false);
    } else {
      setDone(true);
    }
  }, [typed, msg, confirmedName, msgIdx, messages.length]);

  const submitName = () => {
    if (name.trim()) {
      setConfirmedName(name.trim());
      setTimeout(() => {
        setMsgIdx(i => i + 1);
        setTyped(false);
      }, 300);
    }
  };

  if (done) return null;

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      {/* Platinum gold gradient background */}
      <div 
        className={`absolute inset-0 transition-opacity duration-1000 ${bg ? 'opacity-100' : 'opacity-0'}`}
        style={{
          background: 'linear-gradient(180deg, #2a2520 0%, #3d362d 30%, #4a4035 50%, #3d362d 70%, #2a2520 100%)',
        }}
      />
      
      {/* Sparkles */}
      <div className={`absolute inset-0 overflow-hidden transition-opacity duration-1000 ${bg ? 'opacity-100' : 'opacity-0'}`}>
        {[...Array(20)].map((_, i) => (
          <Sparkle key={i} x={Math.random() * 100} delay={Math.random() * 3} />
        ))}
      </div>

      {/* Main content - CENTERED */}
      <div className="relative z-10 flex flex-col items-center justify-center p-4 w-full min-h-screen">
        {/* Center container for Blaine and dialog */}
        <div className="flex flex-col items-center w-full max-w-xl">
          {showProfessor && msgIdx >= 3 && (
            <div className="mb-4 flex justify-center w-full">
              <BlaineSprite />
            </div>
          )}

          {msg && bg >= 1 && (
            <DialogBox speaker={msg.s} showArrow={typed && !msg.input} onClick={advance}>
              <Typewriter text={displayText} active={true} onDone={() => setTyped(true)} />
              {msg.input && typed && !confirmedName && (
                <div className="flex gap-2 mt-2">
                  <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && submitName()}
                    className="flex-1 px-2 py-1 border-2 border-gray-400 rounded text-gray-800"
                    placeholder="Your name..."
                    autoFocus
                  />
                  <button onClick={submitName} className="px-4 py-1 bg-amber-500 text-white rounded font-bold">
                    OK
                  </button>
                </div>
              )}
            </DialogBox>
          )}
        </div>

        <button onClick={() => setDone(true)} className="fixed bottom-3 right-3 text-white/30 hover:text-white/60 text-xs">
          Skip →
        </button>
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