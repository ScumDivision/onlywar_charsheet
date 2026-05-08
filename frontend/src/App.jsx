import React from 'react';
import { GameProvider, useGame, SYSTEMS } from './context/GameContext';
import CharacterSheet from './components/CharacterSheet';
import ParticleEffects from './components/ParticleEffects';
import DiceLog from './components/DiceLog';

const Shell = () => {
  const { character, t } = useGame();
  const isRT = character?.system === SYSTEMS.RT;

  const themeAttr = isRT ? 'rt' : 'ow';
  const title = isRT ? 'Rogue Trader' : 'Only War';
  const subtitle = isRT ? t('subtitleRT') : t('subtitleOW');

  return (
    <div
      data-theme={themeAttr}
      className="min-h-screen bg-imperial-dark text-phosphor-green font-mono selection:bg-phosphor-green selection:text-black relative overflow-hidden"
    >
      <div className="fixed inset-0 z-50 pointer-events-none crt-overlay opacity-30"></div>
      <div className="fixed inset-0 z-40 pointer-events-none bg-[url('https://transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
      <div className="fixed inset-0 z-40 pointer-events-none bg-[radial-gradient(circle_at_center,_transparent_50%,_rgba(0,0,0,0.8)_100%)]"></div>

      <div className="flex relative z-10">
        <main className="flex-1 py-10 px-4 md:px-8 md:mr-80 overflow-y-auto h-screen custom-scrollbar">
          <header className="text-center mb-10 relative">
            <h1 className="text-5xl md:text-7xl font-gothic text-tarnished-gold mb-2 text-glow">
              {title}
            </h1>
            <p className="text-xs tracking-[0.5em] uppercase text-phosphor-dim opacity-70">
              {subtitle}
            </p>
            <div className="w-32 h-1 bg-tarnished-gold mx-auto mt-4 shadow-[0_0_10px_currentColor]"></div>
          </header>

          <CharacterSheet />
        </main>

        <DiceLog />
      </div>

      <ParticleEffects />
    </div>
  );
};

function App() {
  return (
    <GameProvider>
      <Shell />
    </GameProvider>
  );
}

export default App;
