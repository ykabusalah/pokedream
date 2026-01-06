import { useState, useEffect } from 'react';

export default function BlaineErrorPopup({ error, onRetry, onClose }) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  
  // Determine message based on error type
  const getMessage = () => {
    if (error?.includes('NSFW')) {
      return "Hmm... I'm afraid that concept triggered some safety filters. Try describing something more family-friendly! Remember, Pokémon are for trainers of all ages.";
    }
    if (error?.includes('rate') || error?.includes('limit')) {
      return "Whoa there, slow down! We're generating too fast. Give it a moment and try again.";
    }
    if (error?.includes('API') || error?.includes('key')) {
      return "Looks like there's a problem with our laboratory equipment. The technical team has been notified!";
    }
    return "Something went wrong in the lab! Don't worry, even the best experiments fail sometimes. Give it another shot with a different concept.";
  };
  
  const message = getMessage();
  
  // Typewriter effect
  useEffect(() => {
    setDisplayedText('');
    setIsTyping(true);
    let i = 0;
    const interval = setInterval(() => {
      if (i < message.length) {
        setDisplayedText(message.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 25);
    return () => clearInterval(interval);
  }, [message]);

  return (
    <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-4">
      <div 
        className="bg-gray-900 rounded-xl p-6 max-w-lg w-full"
        style={{ border: '4px solid #ef4444' }}
      >
        {/* Blaine + Message */}
        <div className="flex items-start gap-4 mb-6">
          {/* Blaine sprite */}
          <div className="flex-shrink-0">
            <div className="relative">
              <div className="absolute inset-0 bg-red-500/30 blur-xl rounded-full" />
              <img 
                src="/blaine.png" 
                alt="Professor Blaine"
                className="relative w-20 h-20 object-contain"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>
          </div>
          
          {/* Dialog box */}
          <div 
            className="flex-1 bg-white rounded-lg p-4 relative"
            style={{ 
              border: '3px solid #303030',
              minHeight: '100px'
            }}
          >
            {/* Speech bubble pointer */}
            <div 
              className="absolute left-0 top-6 -translate-x-2 w-0 h-0"
              style={{
                borderTop: '8px solid transparent',
                borderBottom: '8px solid transparent',
                borderRight: '8px solid #303030',
              }}
            />
            <div 
              className="absolute left-0 top-6 -translate-x-1 w-0 h-0"
              style={{
                borderTop: '6px solid transparent',
                borderBottom: '6px solid transparent',
                borderRight: '6px solid white',
              }}
            />
            
            <p className="text-gray-800 text-sm leading-relaxed">
              {displayedText}
              {isTyping && <span className="animate-pulse">▌</span>}
            </p>
          </div>
        </div>
        
        {/* Buttons */}
        <div className="flex gap-3">
          <button 
            onClick={onRetry}
            className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-lg transition-all"
          >
            Try Again
          </button>
          <button 
            onClick={onClose}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}