import React from 'react';
import { GameProvider } from './context/GameContext';
import CharacterSheet from './components/CharacterSheet';
import ParticleEffects from './components/ParticleEffects';

function App() {
  return (
    <GameProvider>
      <div className="min-h-screen bg-imperial-dark text-phosphor-green font-mono selection:bg-phosphor-green selection:text-black relative overflow-hidden">
        
        {/* CRT Scanline Overlay */}
        <div className="fixed inset-0 z-50 pointer-events-none crt-overlay opacity-30"></div>
        <div className="fixed inset-0 z-40 pointer-events-none bg-[url('https://transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
        
        {/* Vignette */}
        <div className="fixed inset-0 z-40 pointer-events-none bg-[radial-gradient(circle_at_center,_transparent_50%,_rgba(0,0,0,0.8)_100%)]"></div>

        {/* Content */}
        <main className="relative z-10 py-10">
          <header className="text-center mb-10 relative">
            <h1 className="text-5xl md:text-7xl font-gothic text-tarnished-gold mb-2 text-glow">
              Only War
            </h1>
            <p className="text-xs tracking-[0.5em] uppercase text-phosphor-dim opacity-70">
              Departmento Munitorum Dataslate // Auth: Lambda-7
            </p>
            <div className="w-32 h-1 bg-tarnished-gold mx-auto mt-4 shadow-[0_0_10px_#c5a059]"></div>
          </header>

          <CharacterSheet />
        </main>

        <ParticleEffects />
      </div>
    </GameProvider>
  );
}

export default App;