import { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function SharePopup({ pokemon, onClose }) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const shareText = `I just created ${pokemon.name}, a ${pokemon.types?.join('/')} type Pokémon using AI! ${pokemon.is_shiny ? '✨ It\'s SHINY! ✨' : ''} #PokéDream #Pokemon #AI`;
  
  const shareUrl = typeof window !== 'undefined' ? window.location.origin : '';

  const handleDownload = async () => {
    if (!pokemon.image_path) return;
    
    setDownloading(true);
    try {
      const response = await fetch(`${API_URL}/${pokemon.image_path}`);
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${pokemon.name.toLowerCase()}_pokedream.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const handleTwitterShare = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'width=550,height=420');
  };

  const handleFacebookShare = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'width=550,height=420');
  };

  const handleRedditShare = () => {
    const url = `https://reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(`I created ${pokemon.name} using AI! #PokéDream`)}`;
    window.open(url, '_blank', 'width=550,height=420');
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-gray-900 rounded-2xl p-6 max-w-md w-full border border-gray-700"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Share {pokemon.name}</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        {/* Pokemon Preview */}
        <div className="bg-gray-800 rounded-xl p-4 mb-6 flex items-center gap-4">
          {pokemon.image_path && (
            <img 
              src={`${API_URL}/${pokemon.image_path}`}
              alt={pokemon.name}
              className="w-20 h-20 object-contain rounded-lg bg-gray-700"
            />
          )}
          <div>
            <div className="font-bold text-white flex items-center gap-2">
              {pokemon.name}
              {pokemon.is_shiny && <span className="text-yellow-400">✨</span>}
            </div>
            <div className="text-sm text-gray-400">
              {pokemon.types?.join(' / ')} Type
            </div>
          </div>
        </div>

        {/* Download Button */}
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-white font-bold rounded-lg transition-all mb-4 flex items-center justify-center gap-2"
        >
          {downloading ? (
            <>
              <span className="animate-spin">⏳</span> Downloading...
            </>
          ) : (
            <>
              <span>📥</span> Download Image
            </>
          )}
        </button>

        {/* Social Buttons */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <button
            onClick={handleTwitterShare}
            className="py-3 bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2"
          >
            <span>𝕏</span>
          </button>
          <button
            onClick={handleFacebookShare}
            className="py-3 bg-[#4267B2] hover:bg-[#365899] text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2"
          >
            <span>f</span>
          </button>
          <button
            onClick={handleRedditShare}
            className="py-3 bg-[#FF4500] hover:bg-[#e03d00] text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2"
          >
            <span>↗</span>
          </button>
        </div>

        {/* Copy Link */}
        <button
          onClick={handleCopyLink}
          className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2"
        >
          {copied ? (
            <>
              <span>✓</span> Copied!
            </>
          ) : (
            <>
              <span>📋</span> Copy to Clipboard
            </>
          )}
        </button>

        {/* Share Text Preview */}
        <div className="mt-4 p-3 bg-gray-800 rounded-lg">
          <p className="text-sm text-gray-400">{shareText}</p>
        </div>
      </div>
    </div>
  );
}