import React from 'react';
import { Anchor, Fish } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-breton-blue text-white shadow-lg sticky top-0 z-50 pt-[env(safe-area-inset-top)]">
      <div className="py-6 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Anchor className="w-8 h-8 text-breton-accent" />
            <div>
              <h1 className="text-2xl font-serif font-bold tracking-wider">LÉGENDE DE LA MER</h1>
              <p className="text-xs text-breton-sand uppercase tracking-widest opacity-80">Studio Photo Breton & IA</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center space-x-2 opacity-80">
            <Fish className="w-5 h-5" />
            <span className="text-sm font-medium">Finistère Nord</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;