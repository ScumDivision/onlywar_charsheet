import React from 'react';
import { useGame } from '../context/GameContext';
import DiceRoller from './DiceRoller';
import { User, Activity, Shield, Brain, Eye, Zap, Heart } from 'lucide-react';

const StatBlock = ({ title, children, className }) => (
  <div className={`p-4 border border-phosphor-dim/50 bg-black/20 relative ${className}`}>
    <div className="absolute top-0 left-0 bg-phosphor-dim/20 px-2 py-1 text-xs uppercase text-tarnished-gold font-bold">
      {title}
    </div>
    <div className="mt-4 grid gap-4">
      {children}
    </div>
    {/* Corner accents */}
    <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-phosphor-green"></div>
    <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-phosphor-green"></div>
  </div>
);

const CharacterSheet = () => {
  const { character, updateCharacter } = useGame();

  const handleCharChange = (key, value) => {
    // In a real app, we'd debounce this or have a save button
    // For now, let's just update local state logic if we were fully connecting
    // But since context has setters, we assume immediate update for UI feel
    // We can't easily deep update the context object without a specific setter in this simplified version
    // So we will just display read-only or local edit for now in this prototype phase
    // Or better, trigger an update
    console.log("Update requested:", key, value);
    // updateCharacter(character.id, { ...character, [key]: value });
  };

  const characteristics = [
    { key: 'ws', label: 'Weapon Skill', icon: Shield },
    { key: 'bs', label: 'Ballistic Skill', icon: Eye },
    { key: 's', label: 'Strength', icon: Zap },
    { key: 't', label: 'Toughness', icon: Shield },
    { key: 'ag', label: 'Agility', icon: Activity },
    { key: 'int_', label: 'Intelligence', icon: Brain },
    { key: 'per', label: 'Perception', icon: Eye },
    { key: 'wp', label: 'Willpower', icon: Brain },
    { key: 'fel', label: 'Fellowship', icon: User },
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6 relative z-10">
      
      {/* Header Info */}
      <StatBlock title="Personnel Record" className="border-t-4 border-t-tarnished-gold">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {['name', 'regiment', 'specialty', 'demeanour'].map((field) => (
            <div key={field} className="flex flex-col">
              <label className="text-[10px] uppercase text-gray-500 mb-1">{field}</label>
              <input 
                type="text" 
                defaultValue={character[field]}
                className="bg-transparent border-b border-phosphor-dim text-phosphor-green font-gothic text-lg focus:outline-none focus:border-phosphor-green"
              />
            </div>
          ))}
        </div>
      </StatBlock>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Characteristics */}
        <StatBlock title="Characteristics" className="lg:col-span-2">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {characteristics.map((char) => (
                    <DiceRoller 
                        key={char.key} 
                        label={char.label} 
                        target={character[char.key]} 
                    />
                ))}
            </div>
        </StatBlock>

        {/* Vitals */}
        <StatBlock title="Vitals & Condition">
            <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                    <span className="text-sm uppercase text-red-400 flex items-center gap-2"><Heart size={14}/> Wounds</span>
                    <div className="flex items-baseline gap-2">
                        <input type="number" className="w-12 bg-transparent text-right font-bold text-2xl text-red-500" defaultValue={character.current_wounds} />
                        <span className="text-gray-500">/ {character.total_wounds}</span>
                    </div>
                </div>
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                    <span className="text-sm uppercase text-tarnished-gold flex items-center gap-2"><Shield size={14}/> Fate</span>
                    <div className="flex items-baseline gap-2">
                        <input type="number" className="w-12 bg-transparent text-right font-bold text-2xl text-tarnished-gold" defaultValue={character.current_fate} />
                        <span className="text-gray-500">/ {character.total_fate}</span>
                    </div>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-sm uppercase text-yellow-600 flex items-center gap-2"><Activity size={14}/> Fatigue</span>
                    <input type="number" className="w-12 bg-transparent text-right font-bold text-2xl text-yellow-600" defaultValue={character.fatigue} />
                </div>
            </div>
        </StatBlock>
      </div>

      {/* Skills */}
      <StatBlock title="Known Skills">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {Object.entries(character.skills).map(([skillName, bonus]) => (
                <div key={skillName} className="flex justify-between items-center bg-black/40 p-2 rounded">
                    <span className="text-sm">{skillName}</span>
                    <div className="flex gap-2 items-center">
                        <span className="text-xs text-gray-500">{bonus >= 0 ? `+${bonus}` : bonus}</span>
                        {/* Simplification: Assuming base characteristic for skill checks is Int or Ag, usually depends on skill */}
                        <DiceRoller label={skillName} target={30 + bonus} /> 
                    </div>
                </div>
            ))}
        </div>
      </StatBlock>

    </div>
  );
};

export default CharacterSheet;
