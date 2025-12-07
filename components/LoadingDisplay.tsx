import React, { useState, useEffect } from 'react';
import { Anchor, Fish, Ship, Sun, Waves, Cloud } from 'lucide-react';

const MESSAGES = [
  "Préparation du matériel de pêche...",
  "Analyse de la météo bretonne...",
  "Recherche du meilleur spot en baie de Morlaix...",
  "Ferrage du poisson...",
  "Lutte avec le thon...",
  "Remontée du filet...",
  "Ajustement de la lumière du phare...",
  "Développement de la photo souvenir...",
  "La légende s'écrit..."
];

const LoadingDisplay: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    // Progress animation: non-linear to feel realistic
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 98) return 98;
        // Fast at start (0-30), medium (30-70), slow at end (70-98)
        let increment = 0;
        if (prev < 30) increment = Math.random() * 2 + 1;
        else if (prev < 70) increment = Math.random() * 1 + 0.5;
        else increment = Math.random() * 0.2 + 0.1;
        
        return Math.min(prev + increment, 98);
      });
    }, 150);

    // Message rotation
    const messageInterval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % MESSAGES.length);
    }, 3000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(messageInterval);
    };
  }, []);

  const icons = [Fish, Ship, Anchor, Waves, Cloud];
  const CurrentIcon = icons[messageIndex % icons.length];

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 w-full animate-in fade-in duration-700">
      
      {/* Icon Area */}
      <div className="relative mb-10">
        {/* Rotating outer ring */}
        <div className="absolute inset-0 border-4 border-dashed border-breton-blue/30 rounded-full animate-spin-slow"></div>
        
        {/* Central circle */}
        <div className="w-32 h-32 bg-breton-white border-4 border-breton-blue rounded-full flex items-center justify-center shadow-lg relative z-10">
            <CurrentIcon className="w-14 h-14 text-breton-blue animate-bounce-gentle transition-all duration-500" />
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -bottom-2 -right-2 bg-breton-accent text-breton-blue p-2 rounded-full shadow-md z-20 animate-pulse">
           <Sun className="w-5 h-5" />
        </div>
      </div>

      {/* Progress Bar Container */}
      <div className="w-full max-w-xs space-y-3 mb-8">
        <div className="flex justify-between items-end px-1">
            <span className="text-xs font-bold text-breton-blue uppercase tracking-widest opacity-80">Génération</span>
            <span className="text-sm font-bold text-breton-blue">{Math.round(progress)}%</span>
        </div>
        
        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden shadow-inner border border-gray-200">
            <div 
              className="bg-breton-blue h-full rounded-full transition-all duration-300 ease-out relative"
              style={{ width: `${progress}%` }}
            >
                {/* Glossy overlay */}
                <div className="absolute top-0 left-0 w-full h-1/2 bg-white/30 rounded-t-full"></div>
                {/* Moving stripe */}
                <div className="absolute inset-0 w-full h-full bg-white/20 animate-pulse"></div>
            </div>
        </div>
      </div>

      {/* Dynamic Text */}
      <div className="h-16 flex flex-col items-center justify-center w-full max-w-sm text-center">
        <p key={messageIndex} className="text-breton-dark font-medium text-lg animate-fade-slide-up">
          {MESSAGES[messageIndex]}
        </p>
        <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">Patientez quelques instants</p>
      </div>

      {/* Internal Styles for custom animations not in standard Tailwind */}
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 12s linear infinite;
        }
        @keyframes bounce-gentle {
          0%, 100% { transform: translateY(-5%); }
          50% { transform: translateY(5%); }
        }
        .animate-bounce-gentle {
          animation: bounce-gentle 2s ease-in-out infinite;
        }
        @keyframes fade-slide-up {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-slide-up {
          animation: fade-slide-up 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default LoadingDisplay;