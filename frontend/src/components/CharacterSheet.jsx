import React, { useState } from 'react';
import { useGame, SYSTEMS } from '../context/GameContext';
import DiceRoller from './DiceRoller';
import Portrait from './Portrait';
import ShipSheet from './ShipSheet';
import { User, Activity, Shield, Brain, Eye, Zap, Heart, Skull, AlertOctagon, Save, Trash2, FolderOpen, Plus, FilePlus, Edit3, Lock, Star, Sword, Globe, Crown, Anchor, Coins, ChevronDown, PawPrint } from 'lucide-react';
import clsx from 'clsx';
import { toInt } from '../utils';

const StatBlock = ({ title, children, className }) => (
  <div className={`p-4 border border-phosphor-dim/50 bg-black/20 relative ${className}`}>
    <div className="absolute top-0 left-0 bg-phosphor-dim/20 px-2 py-1 text-xs uppercase text-tarnished-gold font-bold">
      {title}
    </div>
    <div className="mt-4 grid gap-4">
      {children}
    </div>
    <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-phosphor-green"></div>
    <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-phosphor-green"></div>
  </div>
);

const CharacterSheet = () => {
  const { character, setCharacter, saveCharacter, savedCharacters, loadCharacter, deleteCharacter, createNewCharacter, rollDamage, t, toggleLanguage, language } = useGame();
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showBridge, setShowBridge] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  // Per-companion collapse state — keyed by current index. Re-keys on add/remove,
  // which is fine: the panel just defaults to expanded again.
  const [collapsedCompanions, setCollapsedCompanions] = useState(() => new Set());

  const isRT = character?.system === SYSTEMS.RT;

  // Armour location keys are stable English strings in the DB; display
  // labels are translated. Unknown/custom keys fall back to the raw string.
  const ARMOUR_LOC_LABEL_KEYS = {
      'Head': 'loc_head',
      'Body': 'loc_body',
      'Left Arm': 'loc_leftArm',
      'Right Arm': 'loc_rightArm',
      'Left Leg': 'loc_leftLeg',
      'Right Leg': 'loc_rightLeg',
  };
  const armourLocLabel = (loc) => {
      const key = ARMOUR_LOC_LABEL_KEYS[loc];
      return key ? t(key) : loc;
  };

  const updateField = (field, value) => {
      setCharacter(prev => ({ ...prev, [field]: value }));
  };

  const updateNestedField = (category, key, subkey, value) => {
      setCharacter(prev => ({
          ...prev,
          [category]: {
              ...prev[category],
              [key]: subkey ? { ...prev[category][key], [subkey]: value } : value
          }
      }));
  };

  // --- Skills Logic ---
  const handleSkillChange = (index, field, value) => {
      const newSkills = [...character.skills];
      newSkills[index] = { ...newSkills[index], [field]: value };
      setCharacter(prev => ({ ...prev, skills: newSkills }));
  };
  const addSkill = () => setCharacter(prev => ({ ...prev, skills: [...prev.skills, { name: "New Skill", characteristic: "int", bonus: 0 }] }));
  const removeSkill = (index) => setCharacter(prev => ({ ...prev, skills: prev.skills.filter((_, i) => i !== index) }));

  // --- Weapons Logic ---
  const addWeapon = () => setCharacter(prev => ({ 
      ...prev, 
      weapons: [...prev.weapons, { 
          name: "Lasgun", class: "Basic", range: "100m", rof: "S/3/-", 
          dmg: "1d10+3", type: "E", pen: 0, clip: 60, rld: "Full", special: "Reliable" 
      }] 
  }));
  const removeWeapon = (index) => setCharacter(prev => ({ ...prev, weapons: prev.weapons.filter((_, i) => i !== index) }));
  const updateWeapon = (index, field, value) => {
      const newWeapons = [...character.weapons];
      newWeapons[index] = { ...newWeapons[index], [field]: value };
      setCharacter(prev => ({ ...prev, weapons: newWeapons }));
  };

  // --- Talents Logic ---
  const addTalent = () => setCharacter(prev => ({ ...prev, talents: [...prev.talents, { name: "New Talent", description: "" }] }));
  const removeTalent = (index) => setCharacter(prev => ({ ...prev, talents: prev.talents.filter((_, i) => i !== index) }));
  const updateTalent = (index, field, value) => {
      const newTalents = [...character.talents];
      newTalents[index] = { ...newTalents[index], [field]: value };
      setCharacter(prev => ({ ...prev, talents: newTalents }));
  };

  // --- Companions Logic ---
  const blankCompanion = () => ({
      name: "New Companion", type: "",
      ws: 25, bs: 25, s: 25, t: 25, ag: 25, int_: 25, per: 25, wp: 25, fel: 25,
      current_wounds: 5, total_wounds: 5, movement: 3,
      weapons: [],
      notes: "",
  });
  const addCompanion = () => setCharacter(prev => ({
      ...prev,
      companions: [...(prev.companions || []), blankCompanion()],
  }));
  const removeCompanion = (index) => setCharacter(prev => ({
      ...prev,
      companions: (prev.companions || []).filter((_, i) => i !== index),
  }));
  const updateCompanion = (index, field, value) => {
      const list = [...(character.companions || [])];
      list[index] = { ...list[index], [field]: value };
      setCharacter(prev => ({ ...prev, companions: list }));
  };
  const addCompanionWeapon = (cIdx) => {
      const list = [...(character.companions || [])];
      const weapons = [...(list[cIdx].weapons || []), { name: "", dmg: "1d10", type: "I", pen: 0, special: "" }];
      list[cIdx] = { ...list[cIdx], weapons };
      setCharacter(prev => ({ ...prev, companions: list }));
  };
  const removeCompanionWeapon = (cIdx, wIdx) => {
      const list = [...(character.companions || [])];
      const weapons = (list[cIdx].weapons || []).filter((_, i) => i !== wIdx);
      list[cIdx] = { ...list[cIdx], weapons };
      setCharacter(prev => ({ ...prev, companions: list }));
  };
  const updateCompanionWeapon = (cIdx, wIdx, field, value) => {
      const list = [...(character.companions || [])];
      const weapons = [...(list[cIdx].weapons || [])];
      weapons[wIdx] = { ...weapons[wIdx], [field]: value };
      list[cIdx] = { ...list[cIdx], weapons };
      setCharacter(prev => ({ ...prev, companions: list }));
  };
  const toggleCompanionCollapsed = (idx) => {
      setCollapsedCompanions(prev => {
          const next = new Set(prev);
          if (next.has(idx)) next.delete(idx); else next.add(idx);
          return next;
      });
  };


  const characteristics = [
    { key: 'ws', label: t('ws'), short: t('ws_short'), icon: Shield },
    { key: 'bs', label: t('bs'), short: t('bs_short'), icon: Eye },
    { key: 's', label: t('s'), short: t('s_short'), icon: Zap },
    { key: 't', label: t('t'), short: t('t_short'), icon: Shield },
    { key: 'ag', label: t('ag'), short: t('ag_short'), icon: Activity },
    { key: 'int_', label: t('int'), short: t('int_short'), icon: Brain },
    { key: 'per', label: t('per'), short: t('per_short'), icon: Eye },
    { key: 'wp', label: t('wp'), short: t('wp_short'), icon: Brain },
    { key: 'fel', label: t('fel'), short: t('fel_short'), icon: User },
  ];

  const charMap = {
      'WS': 'ws', 'BS': 'bs', 'S': 's', 'T': 't', 'Ag': 'ag', 
      'Int': 'int_', 'Per': 'per', 'WP': 'wp', 'Fel': 'fel',
      // German fallback for logic if stored strings differ, though ideally we store keys
      'KG': 'ws', 'BF': 'bs', 'W': 't', 'GE': 'ag', 
      'IN': 'int_', 'WA': 'per', 'WK': 'wp', 'CH': 'fel'
  };
  
  // Helper to find char value from standard or localized key
  const getCharValue = (key) => {
      // Normalize key
      const mapped = charMap[key] || charMap[Object.keys(charMap).find(k => k.toLowerCase() === key.toLowerCase())];
      return character[mapped] || 0;
  };

  return (
    <div className="max-w-7xl mx-auto p-2 space-y-6 relative z-10 pb-20">
      
      {/* Control Bar */}
      <div className="flex flex-wrap gap-2 justify-between items-center mb-4 p-2 bg-black/40 border-b border-phosphor-dim/30 sticky top-0 z-50 backdrop-blur-md">
        <div className="flex gap-2 items-center">
            <button onClick={() => setShowNewModal(true)} className="btn-control flex items-center gap-2 hover:text-white"><FilePlus size={16}/> {t('new')}</button>
            <button onClick={() => setShowLoadModal(true)} className="btn-control flex items-center gap-2 hover:text-white"><FolderOpen size={16}/> {t('load')}</button>
            <button onClick={saveCharacter} className="btn-control flex items-center gap-2 hover:text-phosphor-green"><Save size={16}/> {t('save')}</button>
            <span className={clsx(
                "ml-2 text-[10px] uppercase tracking-widest px-2 py-0.5 border",
                isRT ? "border-tarnished-gold text-tarnished-gold" : "border-phosphor-dim text-phosphor-dim"
            )}>
                {isRT ? <><Crown size={10} className="inline mb-0.5 mr-1"/>{t('systemRT')}</> : <><Shield size={10} className="inline mb-0.5 mr-1"/>{t('systemOW')}</>}
            </span>
            {isRT && (
                <button
                    onClick={() => setShowBridge(b => !b)}
                    className={clsx(
                        "btn-control flex items-center gap-2 ml-2 transition-colors",
                        showBridge ? "text-phosphor-green border-b border-phosphor-green" : "hover:text-phosphor-green"
                    )}
                    title={t('bridge')}
                >
                    <Anchor size={14}/> {t('bridge')}
                </button>
            )}
        </div>

        <div className="flex items-center gap-4">
             <button onClick={toggleLanguage} className="btn-control flex items-center gap-2 hover:text-tarnished-gold">
                <Globe size={16}/> {language.toUpperCase()}
             </button>

             <button
                onClick={() => setIsEditMode(!isEditMode)}
                className={clsx(
                    "btn-control flex items-center gap-2 transition-all px-4 py-1 rounded border",
                    isEditMode ? "bg-phosphor-green/20 border-phosphor-green text-phosphor-green shadow-[0_0_10px_rgba(72,187,120,0.3)]" : "bg-transparent border-white/10 text-gray-500 hover:text-white"
                )}
            >
                {isEditMode ? <><Edit3 size={16}/> {t('editingActive')}</> : <><Lock size={16}/> {t('viewOnly')}</>}
            </button>

            {character.id && isEditMode && (
                <button onClick={() => deleteCharacter(character.id)} className="btn-control flex items-center gap-2 text-red-500 hover:text-red-400 border-l border-white/10 pl-4"><Trash2 size={16}/> {t('delete')}</button>
            )}
        </div>
      </div>

      {/* New Character Modal — system picker */}
      {showNewModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setShowNewModal(false)}>
              <div className="bg-imperial-dark border border-tarnished-gold p-6 w-full max-w-lg shadow-[0_0_20px_rgba(197,160,89,0.2)]" onClick={(e) => e.stopPropagation()}>
                  <h3 className="font-gothic text-xl text-tarnished-gold mb-4 border-b border-white/10 pb-2">{t('chooseSystem')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <button
                          onClick={() => { createNewCharacter(SYSTEMS.OW); setShowNewModal(false); }}
                          className="p-4 border border-phosphor-dim/40 hover:border-phosphor-green hover:bg-phosphor-green/5 transition-colors text-left"
                      >
                          <div className="flex items-center gap-2 mb-2">
                              <Shield size={20} className="text-phosphor-green"/>
                              <span className="font-gothic text-lg text-phosphor-green">{t('systemOW')}</span>
                          </div>
                          <p className="text-[11px] text-gray-400">{t('systemOWDesc')}</p>
                      </button>
                      <button
                          onClick={() => { createNewCharacter(SYSTEMS.RT); setShowNewModal(false); }}
                          className="p-4 border border-tarnished-gold/40 hover:border-tarnished-gold hover:bg-tarnished-gold/20 transition-colors text-left"
                      >
                          <div className="flex items-center gap-2 mb-2">
                              <Crown size={20} className="text-tarnished-gold"/>
                              <span className="font-gothic text-lg text-tarnished-gold">{t('systemRT')}</span>
                          </div>
                          <p className="text-[11px] text-gray-400">{t('systemRTDesc')}</p>
                      </button>
                  </div>
                  <button onClick={() => setShowNewModal(false)} className="mt-4 w-full py-2 bg-red-900/30 border border-red-800 text-red-400 hover:bg-red-900/50">{t('close')}</button>
              </div>
          </div>
      )}

      {/* Load Modal */}
      {showLoadModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm">
              <div className="bg-imperial-dark border border-tarnished-gold p-6 w-full max-w-md shadow-[0_0_20px_rgba(197,160,89,0.2)]">
                  <h3 className="font-gothic text-xl text-tarnished-gold mb-4 border-b border-white/10 pb-2">{t('selectRecord')}</h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                      {savedCharacters.map(char => (
                          <div key={char.id} className="flex justify-between items-center p-2 hover:bg-white/5 cursor-pointer group"
                               onClick={() => { loadCharacter(char.id); setShowLoadModal(false); setShowBridge(false); }}>
                              <div>
                                  <div className="font-bold text-phosphor-green group-hover:text-white">{char.name}</div>
                                  <div className="text-xs text-gray-500">
                                      {char.system === SYSTEMS.RT
                                        ? `${char.career || '—'}${char.profit_factor != null ? ` • ${t('pf_short')} ${char.profit_factor}` : ''}`
                                        : `${char.regiment || '—'}${char.specialty ? ` • ${char.specialty}` : ''}`}
                                  </div>
                              </div>
                              <div className="flex items-center gap-2">
                                  <span className={clsx(
                                      "text-[9px] uppercase tracking-widest px-1 border",
                                      char.system === SYSTEMS.RT ? "border-tarnished-gold text-tarnished-gold" : "border-phosphor-dim text-phosphor-dim"
                                  )}>{char.system === SYSTEMS.RT ? 'RT' : 'OW'}</span>
                                  <div className="text-xs text-tarnished-gold">ID: {char.id}</div>
                              </div>
                          </div>
                      ))}
                      {savedCharacters.length === 0 && <div className="text-gray-500 italic">{t('noRecords')}</div>}
                  </div>
                  <button onClick={() => setShowLoadModal(false)} className="mt-4 w-full py-2 bg-red-900/30 border border-red-800 text-red-400 hover:bg-red-900/50">{t('close')}</button>
              </div>
          </div>
      )}

      {/* Header Info & XP */}
      <StatBlock title={t('personnelRecord')} className="border-t-4 border-t-tarnished-gold">
        <div className="flex flex-col md:flex-row gap-6">

            {/* Portrait column */}
            <div className="w-full md:w-48 flex-shrink-0">
                <Portrait />
            </div>

            {/* Identity fields — system-aware */}
            <div className="grid grid-cols-2 md:grid-cols-2 gap-4 flex-1">
                {[
                    { field: 'name', label: t('name') },
                    isRT
                        ? { field: 'career', label: t('career') }
                        : { field: 'regiment', label: t('regiment') },
                    isRT
                        ? null
                        : { field: 'specialty', label: t('specialty') },
                    { field: 'demeanour', label: t('demeanour') },
                ].filter(Boolean).map(({ field, label }) => (
                    <div key={field} className="flex flex-col">
                        <label className="text-[10px] uppercase text-gray-500 mb-1">{label}</label>
                        <input
                            type="text"
                            value={character[field] ?? ''}
                            disabled={!isEditMode}
                            onChange={(e) => updateField(field, e.target.value)}
                            className="bg-transparent border-b border-phosphor-dim text-phosphor-green font-gothic text-lg focus:outline-none focus:border-phosphor-green w-full disabled:border-transparent disabled:text-gray-400"
                        />
                    </div>
                ))}

                {/* Profit Factor — RT only, takes the slot freed by removing 'specialty' */}
                {isRT && (
                    <div className="flex flex-col">
                        <label className="text-[10px] uppercase text-gray-500 mb-1 flex items-center gap-1">
                            <Coins size={10} /> {t('profitFactor')}
                        </label>
                        <input
                            type="number"
                            value={character.profit_factor ?? 0}
                            disabled={!isEditMode}
                            onChange={(e) => updateField('profit_factor', toInt(e.target.value))}
                            className="bg-transparent border-b border-tarnished-gold text-tarnished-gold font-gothic text-lg focus:outline-none focus:border-phosphor-green w-full disabled:border-transparent disabled:text-gray-400"
                        />
                    </div>
                )}
            </div>

            {/* XP Tracker */}
            <div className="bg-black/40 p-2 rounded border border-white/5 w-full md:w-48 flex flex-col gap-2">
                <div className="text-xs text-tarnished-gold flex items-center gap-1"><Star size={12}/> XP</div>
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="text-[10px] text-gray-500">{t('total')}</label>
                        <input
                            type="number"
                            disabled={!isEditMode}
                            value={character.xp?.total || 0}
                            onChange={(e) => updateNestedField('xp', 'total', null, toInt(e.target.value))}
                            className="w-full bg-transparent border-b border-gray-700 text-right font-bold text-sm disabled:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] text-gray-500">{t('spent')}</label>
                        <input
                            type="number"
                            disabled={!isEditMode}
                            value={character.xp?.spent || 0}
                            onChange={(e) => updateNestedField('xp', 'spent', null, toInt(e.target.value))}
                            className="w-full bg-transparent border-b border-gray-700 text-right font-bold text-sm disabled:border-transparent"
                        />
                    </div>
                </div>
                <div className="text-center border-t border-white/10 pt-1">
                    <span className="text-[10px] text-gray-500 uppercase">{t('available')}: </span>
                    <span className="text-phosphor-green font-bold">{(character.xp?.total || 0) - (character.xp?.spent || 0)}</span>
                </div>
            </div>
        </div>
      </StatBlock>

      {showBridge && isRT && <ShipSheet onClose={() => setShowBridge(false)} />}

      {!showBridge && (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div className="lg:col-span-2 space-y-6">
            {/* Characteristics */}
            <StatBlock title={t('characteristics')}>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {characteristics.map((char) => (
                        <div key={char.key} className="relative group flex items-start"> 
                            {isEditMode && (
                                <div className="absolute left-10 top-7 z-20 flex flex-col">
                                    <input 
                                        type="number" 
                                        className="w-12 text-center bg-black/90 text-sm font-bold text-phosphor-green border border-phosphor-green/50 rounded shadow-[0_0_5px_rgba(72,187,120,0.5)] focus:outline-none"
                                        value={character[char.key]}
                                        onChange={(e) => updateField(char.key, toInt(e.target.value))}
                                    />
                                    <span className="text-[8px] text-center text-phosphor-dim uppercase">{t('base')}</span>
                                </div>
                            )}
                            <div className="flex-1">
                                <DiceRoller 
                                    label={`${char.label} (${char.short})`}
                                    target={character[char.key]} 
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </StatBlock>

            {/* Skills */}
            <StatBlock title={t('knownSkills')}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {character.skills.map((skill, idx) => {
                        const targetCharVal = getCharValue(skill.characteristic);
                        const totalTarget = targetCharVal + skill.bonus;

                        return (
                            <div key={idx} className="flex flex-col bg-black/40 p-2 rounded border border-white/5 gap-1 group hover:border-phosphor-dim/40 transition-colors">
                                <div className="flex justify-between items-center">
                                    <input 
                                        type="text" 
                                        disabled={!isEditMode}
                                        value={skill.name} 
                                        onChange={(e) => handleSkillChange(idx, 'name', e.target.value)}
                                        className="bg-transparent text-phosphor-green font-bold text-sm w-full focus:outline-none disabled:text-gray-300"
                                        placeholder={t('skillName')}
                                    />
                                    {isEditMode && (
                                        <button onClick={() => removeSkill(idx)} className="text-red-900 hover:text-red-500 transition-opacity"><Trash2 size={12}/></button>
                                    )}
                                </div>
                                
                                <div className="flex justify-between items-center text-xs">
                                    <div className="flex gap-2">
                                        <select 
                                            disabled={!isEditMode}
                                            value={skill.characteristic} 
                                            onChange={(e) => handleSkillChange(idx, 'characteristic', e.target.value)}
                                            className="bg-transparent text-tarnished-gold focus:outline-none disabled:appearance-none disabled:bg-none"
                                        >
                                            {/* We keep internal keys as values but could display localized keys */}
                                            {Object.keys(charMap).filter(k => k.length <= 3 && k !== 'int').map(k => <option key={k} value={k}>{k}</option>)}
                                        </select>
                                        
                                        <select 
                                            disabled={!isEditMode}
                                            value={skill.bonus}
                                            onChange={(e) => handleSkillChange(idx, 'bonus', toInt(e.target.value))}
                                            className="bg-transparent text-gray-400 focus:outline-none text-right disabled:appearance-none disabled:bg-none"
                                        >
                                            <option value={0}>+0</option>
                                            <option value={10}>+10</option>
                                            <option value={20}>+20</option>
                                            <option value={30}>+30</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center mt-1 border-t border-white/5 pt-1">
                                    <span className="text-[10px] text-gray-600">Target: {totalTarget}</span>
                                    <div className="scale-75 origin-right">
                                        <DiceRoller label="" target={totalTarget} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {isEditMode && (
                        <button onClick={addSkill} className="border border-dashed border-phosphor-dim/40 text-phosphor-dim/60 hover:text-phosphor-green hover:border-phosphor-green hover:bg-phosphor-green/5 transition-all flex justify-center items-center h-full min-h-[80px] uppercase tracking-widest text-xs rounded">
                            <Plus size={14} /> {t('addSkill')}
                        </button>
                    )}
                </div>
            </StatBlock>

             {/* Weapons */}
            <StatBlock title={t('weaponsAuth')}>
                <div className="grid grid-cols-1 gap-2">
                    {character.weapons?.map((wpn, idx) => {
                        const isMelee = (wpn.class || '').toLowerCase().includes('melee')
                                     || (wpn.class || '').toLowerCase().includes('nahkampf');
                        const statFields = [
                            { key: 'class',  label: t('w_class') },
                            { key: 'range',  label: t('w_range') },
                            { key: 'rof',    label: t('w_rof') },
                            { key: 'dmg',    label: t('w_dmg') },
                            { key: 'type',   label: t('w_type') },
                            { key: 'pen',    label: t('w_pen') },
                            { key: 'clip',   label: t('w_clip') },
                            { key: 'rld',    label: t('w_rld') },
                        ];
                        return (
                            <div
                                key={idx}
                                className="bg-black/30 border border-white/5 hover:border-phosphor-dim/40 transition-colors p-3 group"
                            >
                                {/* Header row: name + actions */}
                                <div className="flex items-center gap-3 mb-2 pb-2 border-b border-white/5">
                                    <input
                                        type="text"
                                        disabled={!isEditMode}
                                        value={wpn.name}
                                        onChange={(e) => updateWeapon(idx, 'name', e.target.value)}
                                        className="flex-1 bg-transparent text-phosphor-green font-bold text-base focus:text-white focus:outline-none disabled:text-gray-300"
                                        placeholder={t('w_name')}
                                    />
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <div className="scale-90 origin-right">
                                            <DiceRoller
                                                label={isMelee ? t('ws_short') : t('bs_short')}
                                                target={isMelee ? character.ws : character.bs}
                                            />
                                        </div>
                                        <button
                                            onClick={() => rollDamage(wpn.name, wpn.dmg)}
                                            className="p-1.5 rounded bg-red-900/30 border border-red-900 text-red-400 hover:bg-red-900 hover:text-white transition-colors"
                                            title={t('rollDamage')}
                                        >
                                            <Sword size={14} />
                                        </button>
                                        {isEditMode && (
                                            <button onClick={() => removeWeapon(idx)} className="text-red-900 hover:text-red-500" title={t('delete')}>
                                                <Trash2 size={14}/>
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Stats grid: 8 fields, 4-col on mobile, 8-col on wide */}
                                <div className="grid grid-cols-4 md:grid-cols-8 gap-2 mb-2">
                                    {statFields.map(({ key, label }) => (
                                        <div key={key} className="flex flex-col">
                                            <label className="text-[9px] uppercase text-tarnished-gold/70 mb-0.5 tracking-wider">{label}</label>
                                            <input
                                                type="text"
                                                disabled={!isEditMode}
                                                value={wpn[key] ?? ''}
                                                onChange={(e) => updateWeapon(idx, key, e.target.value)}
                                                className="bg-black/40 border border-white/10 px-1.5 py-0.5 text-xs text-phosphor-dim focus:text-white focus:border-phosphor-green focus:outline-none disabled:border-transparent disabled:text-gray-400"
                                            />
                                        </div>
                                    ))}
                                </div>

                                {/* Special — full width, can wrap */}
                                <div className="flex flex-col">
                                    <label className="text-[9px] uppercase text-tarnished-gold/70 mb-0.5 tracking-wider">{t('w_special')}</label>
                                    <input
                                        type="text"
                                        disabled={!isEditMode}
                                        value={wpn.special ?? ''}
                                        onChange={(e) => updateWeapon(idx, 'special', e.target.value)}
                                        className="bg-black/40 border border-white/10 px-1.5 py-0.5 text-xs text-phosphor-dim focus:text-white focus:border-phosphor-green focus:outline-none disabled:border-transparent disabled:text-gray-400"
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
                {isEditMode && (
                    <button onClick={addWeapon} className="w-full py-2 mt-2 border border-dashed border-phosphor-dim/40 text-phosphor-dim/60 hover:text-phosphor-green hover:border-phosphor-green hover:bg-phosphor-green/5 transition-all flex justify-center items-center gap-2 uppercase tracking-widest text-xs">
                        <Plus size={14} /> {t('addWeapon')}
                    </button>
                )}
            </StatBlock>
            
            {/* Talents & Traits */}
            <StatBlock title={t('talentsTraits')}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {character.talents?.map((talent, idx) => (
                        <div key={idx} className="bg-black/40 p-2 rounded border border-white/5 group hover:border-phosphor-dim/40 transition-colors">
                             <div className="flex justify-between items-start mb-1">
                                <input 
                                    type="text" 
                                    disabled={!isEditMode}
                                    value={talent.name} 
                                    onChange={(e) => updateTalent(idx, 'name', e.target.value)}
                                    className="bg-transparent text-phosphor-green font-bold text-sm w-full focus:outline-none disabled:text-gray-300 placeholder-gray-600"
                                    placeholder={t('talentName')}
                                />
                                {isEditMode && (
                                    <button onClick={() => removeTalent(idx)} className="text-red-900 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={12}/></button>
                                )}
                             </div>
                             <textarea 
                                disabled={!isEditMode}
                                value={talent.description}
                                onChange={(e) => updateTalent(idx, 'description', e.target.value)}
                                className="w-full bg-transparent text-xs text-gray-400 focus:outline-none focus:text-white resize-none h-12 custom-scrollbar disabled:text-gray-500"
                                placeholder={t('talentDesc')}
                             />
                        </div>
                    ))}
                    {isEditMode && (
                        <button onClick={addTalent} className="border border-dashed border-phosphor-dim/40 text-phosphor-dim/60 hover:text-phosphor-green hover:border-phosphor-green hover:bg-phosphor-green/5 transition-all flex justify-center items-center h-full min-h-[80px] uppercase tracking-widest text-xs rounded">
                            <Plus size={14} /> {t('addTalent')}
                        </button>
                    )}
                </div>
            </StatBlock>

            {/* Companions */}
            <StatBlock title={t('companions')}>
                <div className="grid grid-cols-1 gap-3">
                    {(character.companions || []).map((comp, idx) => {
                        const collapsed = collapsedCompanions.has(idx);
                        const compChars = [
                            { key: 'ws',   short: t('ws_short') },
                            { key: 'bs',   short: t('bs_short') },
                            { key: 's',    short: t('s_short') },
                            { key: 't',    short: t('t_short') },
                            { key: 'ag',   short: t('ag_short') },
                            { key: 'int_', short: t('int_short') },
                            { key: 'per',  short: t('per_short') },
                            { key: 'wp',   short: t('wp_short') },
                            { key: 'fel',  short: t('fel_short') },
                        ];
                        return (
                            <div key={idx} className="bg-black/30 border border-tarnished-gold/30 hover:border-tarnished-gold/60 transition-colors">
                                {/* Header — always visible */}
                                <div className="flex items-center gap-2 p-2 bg-black/40 border-b border-white/5">
                                    <button
                                        onClick={() => toggleCompanionCollapsed(idx)}
                                        className="text-tarnished-gold hover:text-phosphor-green transition-transform flex-shrink-0"
                                        title={collapsed ? t('expand') : t('collapse')}
                                    >
                                        <ChevronDown size={16} className={collapsed ? '-rotate-90' : ''} />
                                    </button>
                                    <PawPrint size={14} className="text-tarnished-gold flex-shrink-0" />
                                    <input
                                        type="text"
                                        disabled={!isEditMode}
                                        value={comp.name ?? ''}
                                        onChange={(e) => updateCompanion(idx, 'name', e.target.value)}
                                        className="flex-1 min-w-0 bg-transparent text-phosphor-green font-bold text-sm focus:text-white focus:outline-none disabled:text-gray-300"
                                        placeholder={t('compName')}
                                    />
                                    <input
                                        type="text"
                                        disabled={!isEditMode}
                                        value={comp.type ?? ''}
                                        onChange={(e) => updateCompanion(idx, 'type', e.target.value)}
                                        className="w-32 bg-transparent text-xs text-tarnished-gold/80 text-right focus:text-white focus:outline-none disabled:text-gray-500"
                                        placeholder={t('compType')}
                                    />
                                    {/* Inline wounds tracker */}
                                    <div className="flex items-center gap-1 text-red-400 flex-shrink-0">
                                        <Heart size={12} />
                                        <input
                                            type="number"
                                            value={comp.current_wounds ?? 0}
                                            onChange={(e) => updateCompanion(idx, 'current_wounds', toInt(e.target.value))}
                                            className="w-10 bg-transparent text-right text-sm font-bold focus:outline-none p-0"
                                        />
                                        <span className="text-gray-600">/</span>
                                        <input
                                            type="number"
                                            disabled={!isEditMode}
                                            value={comp.total_wounds ?? 0}
                                            onChange={(e) => updateCompanion(idx, 'total_wounds', toInt(e.target.value))}
                                            className="w-10 bg-transparent text-left text-sm text-red-900 focus:outline-none p-0 disabled:text-red-900/70"
                                        />
                                    </div>
                                    {isEditMode && (
                                        <button onClick={() => removeCompanion(idx)} className="text-red-900 hover:text-red-500 flex-shrink-0" title={t('delete')}>
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>

                                {!collapsed && (
                                    <div className="p-3 space-y-3">
                                        {/* 9 characteristics */}
                                        <div className="grid grid-cols-3 md:grid-cols-9 gap-1.5">
                                            {compChars.map(c => (
                                                <div key={c.key} className="flex flex-col items-center bg-black/40 border border-white/5 p-1 rounded">
                                                    <label className="text-[9px] uppercase text-tarnished-gold/70 tracking-wider">{c.short}</label>
                                                    <input
                                                        type="number"
                                                        disabled={!isEditMode}
                                                        value={comp[c.key] ?? 0}
                                                        onChange={(e) => updateCompanion(idx, c.key, toInt(e.target.value))}
                                                        className="w-full bg-transparent text-center text-sm font-bold text-phosphor-green focus:text-white focus:outline-none disabled:text-gray-300"
                                                    />
                                                </div>
                                            ))}
                                        </div>

                                        {/* Movement */}
                                        <div className="flex items-center gap-3 text-xs">
                                            <span className="uppercase text-blue-400 tracking-wider">{t('compMove')}</span>
                                            <input
                                                type="number"
                                                disabled={!isEditMode}
                                                value={comp.movement ?? 0}
                                                onChange={(e) => updateCompanion(idx, 'movement', toInt(e.target.value))}
                                                className="w-14 bg-black/40 border border-white/10 px-2 py-0.5 text-blue-400 focus:outline-none focus:border-phosphor-green disabled:border-transparent"
                                            />
                                            <span className="text-gray-500">m</span>
                                        </div>

                                        {/* Companion weapons */}
                                        <div className="space-y-1">
                                            <div className="text-[10px] uppercase text-tarnished-gold tracking-wider">{t('weaponsAuth')}</div>
                                            {(comp.weapons || []).map((w, wIdx) => (
                                                <div key={wIdx} className="grid grid-cols-12 gap-1 items-center bg-black/40 border border-white/5 p-1 text-xs">
                                                    <input
                                                        type="text"
                                                        disabled={!isEditMode}
                                                        value={w.name ?? ''}
                                                        onChange={(e) => updateCompanionWeapon(idx, wIdx, 'name', e.target.value)}
                                                        placeholder={t('w_name')}
                                                        className="col-span-4 bg-transparent text-phosphor-green focus:text-white focus:outline-none disabled:text-gray-400"
                                                    />
                                                    <input
                                                        type="text"
                                                        disabled={!isEditMode}
                                                        value={w.dmg ?? ''}
                                                        onChange={(e) => updateCompanionWeapon(idx, wIdx, 'dmg', e.target.value)}
                                                        placeholder={t('w_dmg')}
                                                        className="col-span-2 bg-transparent text-center text-phosphor-dim focus:text-white focus:outline-none disabled:text-gray-500"
                                                    />
                                                    <input
                                                        type="text"
                                                        disabled={!isEditMode}
                                                        value={w.type ?? ''}
                                                        onChange={(e) => updateCompanionWeapon(idx, wIdx, 'type', e.target.value)}
                                                        placeholder={t('w_type')}
                                                        className="col-span-1 bg-transparent text-center text-phosphor-dim focus:text-white focus:outline-none disabled:text-gray-500"
                                                    />
                                                    <input
                                                        type="text"
                                                        disabled={!isEditMode}
                                                        value={w.special ?? ''}
                                                        onChange={(e) => updateCompanionWeapon(idx, wIdx, 'special', e.target.value)}
                                                        placeholder={t('w_special')}
                                                        className="col-span-3 bg-transparent text-phosphor-dim focus:text-white focus:outline-none disabled:text-gray-500"
                                                    />
                                                    <button
                                                        onClick={() => rollDamage(`${comp.name} — ${w.name}`, w.dmg)}
                                                        className="col-span-1 p-1 rounded bg-red-900/30 border border-red-900 text-red-400 hover:bg-red-900 hover:text-white transition-colors flex justify-center"
                                                        title={t('rollDamage')}
                                                    >
                                                        <Sword size={12} />
                                                    </button>
                                                    {isEditMode ? (
                                                        <button
                                                            onClick={() => removeCompanionWeapon(idx, wIdx)}
                                                            className="col-span-1 text-red-900 hover:text-red-500 flex justify-center"
                                                            title={t('delete')}
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    ) : (
                                                        <span className="col-span-1" />
                                                    )}
                                                </div>
                                            ))}
                                            {isEditMode && (
                                                <button
                                                    onClick={() => addCompanionWeapon(idx)}
                                                    className="w-full py-1 border border-dashed border-phosphor-dim/40 text-phosphor-dim/60 hover:text-phosphor-green hover:border-phosphor-green hover:bg-phosphor-green/5 transition-all flex justify-center items-center gap-2 uppercase tracking-widest text-[10px]"
                                                >
                                                    <Plus size={12} /> {t('addWeapon')}
                                                </button>
                                            )}
                                        </div>

                                        {/* Notes — covers traits, abilities, behavior */}
                                        <textarea
                                            disabled={!isEditMode}
                                            value={comp.notes ?? ''}
                                            onChange={(e) => updateCompanion(idx, 'notes', e.target.value)}
                                            className="w-full h-20 bg-black/40 border border-phosphor-dim/30 p-2 text-xs text-phosphor-green focus:outline-none focus:border-phosphor-green resize-none custom-scrollbar disabled:border-transparent disabled:text-gray-400"
                                            placeholder={t('compNotesPlaceholder')}
                                        />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    {isEditMode && (
                        <button
                            onClick={addCompanion}
                            className="w-full py-2 border border-dashed border-phosphor-dim/40 text-phosphor-dim/60 hover:text-phosphor-green hover:border-phosphor-green hover:bg-phosphor-green/5 transition-all flex justify-center items-center gap-2 uppercase tracking-widest text-xs"
                        >
                            <Plus size={14} /> {t('addCompanion')}
                        </button>
                    )}
                </div>
            </StatBlock>

        </div>

        {/* Right Column: Vitals, Armour, Gear */}
        <div className="space-y-6">
             {/* Vitals & Condition */}
            <StatBlock title={t('vitalsCondition')}>
                <div className="space-y-6 text-sm">
                    {/* Wounds & Fate */}
                    <div className="grid gap-4">
                        <div className="bg-black/30 p-3 rounded border border-white/5 flex justify-between items-center">
                            <span className="text-xs uppercase text-red-400 flex items-center gap-2"><Heart size={14}/> {t('wounds')}</span>
                            <div className="flex items-center gap-1">
                                <input type="number" className="w-12 bg-transparent text-right font-bold text-2xl text-red-500 focus:outline-none p-0" 
                                    value={character.current_wounds} onChange={(e) => updateField('current_wounds', toInt(e.target.value))} />
                                <span className="text-gray-600 text-xl font-bold">/</span>
                                <input type="number" className="w-10 bg-transparent text-left font-bold text-lg text-red-900 focus:outline-none p-0" 
                                    disabled={!isEditMode}
                                    value={character.total_wounds} onChange={(e) => updateField('total_wounds', toInt(e.target.value))} />
                            </div>
                        </div>
                        <div className="bg-black/30 p-3 rounded border border-white/5 flex justify-between items-center">
                            <span className="text-xs uppercase text-tarnished-gold flex items-center gap-2"><Shield size={14}/> {t('fate')}</span>
                            <div className="flex items-center gap-1">
                                <input type="number" className="w-12 bg-transparent text-right font-bold text-2xl text-tarnished-gold focus:outline-none p-0" 
                                    value={character.current_fate} onChange={(e) => updateField('current_fate', toInt(e.target.value))} />
                                <span className="text-gray-600 text-xl font-bold">/</span>
                                <input type="number" className="w-10 bg-transparent text-left font-bold text-lg text-yellow-900 focus:outline-none p-0" 
                                    disabled={!isEditMode}
                                    value={character.total_fate} onChange={(e) => updateField('total_fate', toInt(e.target.value))} />
                            </div>
                        </div>
                    </div>
                    
                    {/* Secondary Vitals */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center bg-black/30 p-2 rounded">
                            <div className="text-xs text-yellow-600 uppercase flex items-center gap-2"><Activity size={14}/> {t('fatigue')}</div>
                            <input type="number" className="w-16 bg-transparent text-right font-bold text-xl text-yellow-600 focus:outline-none p-0" 
                                value={character.fatigue} onChange={(e) => updateField('fatigue', toInt(e.target.value))} />
                        </div>
                        <div className="flex justify-between items-center bg-black/30 p-2 rounded">
                            <div className="text-xs text-purple-400 uppercase flex items-center gap-2"><Brain size={14}/> {t('insanity')}</div>
                            <input type="number" className="w-16 bg-transparent text-right font-bold text-xl text-purple-400 focus:outline-none p-0" 
                                value={character.insanity} onChange={(e) => updateField('insanity', toInt(e.target.value))} />
                        </div>
                        <div className="flex justify-between items-center bg-black/30 p-2 rounded">
                            <div className="text-xs text-green-900 uppercase flex items-center gap-2"><Skull size={14}/> {t('corruption')}</div>
                            <input type="number" className="w-16 bg-transparent text-right font-bold text-xl text-green-900 focus:outline-none p-0" 
                                value={character.corruption} onChange={(e) => updateField('corruption', toInt(e.target.value))} />
                        </div>
                    </div>

                    {/* Movement */}
                    <div className="pt-4 border-t border-phosphor-dim/30">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-xs uppercase text-blue-400">{t('movement')}</span>
                            <input type="number" className="w-12 bg-black/30 border border-blue-900/50 text-right text-blue-400 p-1 focus:outline-none disabled:border-transparent disabled:text-gray-500"
                                disabled={!isEditMode}
                                value={character.movement} onChange={(e) => updateField('movement', toInt(e.target.value))} />
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-center text-[10px] text-gray-500">
                            {['move_half', 'move_full', 'move_charge', 'move_run'].map((modeKey, i) => {
                                const mult = [1, 2, 3, 6][i];
                                return (
                                    <div key={modeKey} className="bg-black/40 p-1 rounded border border-white/5 flex justify-between px-2">
                                        <div className="uppercase">{t(modeKey)}</div>
                                        <div className="text-white font-bold">{character.movement * mult}m</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </StatBlock>

            {/* Armour */}
            <StatBlock title={t('armourConfig')}>
                <div className="grid gap-2">
                    {Object.entries(character.armour || {}).map(([loc, stats]) => (
                        <div key={loc} className="flex items-center justify-between bg-black/40 p-2 rounded border border-white/5">
                            <span className="text-xs uppercase w-20 text-gray-400">{armourLocLabel(loc)}</span>
                            <div className="flex gap-2 items-center">
                                <div className="flex flex-col items-center">
                                    <label className="text-[8px] text-gray-600 uppercase">{t('ap_short')}</label>
                                    <input
                                        type="number"
                                        disabled={!isEditMode}
                                        value={stats.ap}
                                        onChange={(e) => updateNestedField('armour', loc, 'ap', toInt(e.target.value))}
                                        className="w-10 bg-black/50 text-center text-white border border-white/10 text-sm p-1 focus:outline-none disabled:border-transparent"
                                    />
                                </div>
                                <div className="flex flex-col items-end">
                                    <label className="text-[8px] text-gray-600 uppercase">{t('type_short')}</label>
                                    <input 
                                        type="text" 
                                        placeholder="-"
                                        disabled={!isEditMode}
                                        value={stats.type} 
                                        onChange={(e) => updateNestedField('armour', loc, 'type', e.target.value)}
                                        className="w-20 bg-transparent text-xs text-gray-400 text-right focus:text-white focus:outline-none disabled:text-gray-600"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </StatBlock>

            {/* Gear / Inventory */}
            <StatBlock title={t('issuedEquipment')}>
                <textarea 
                    className="w-full h-48 bg-black/40 border border-phosphor-dim/30 p-2 text-sm text-phosphor-green font-mono focus:outline-none focus:border-phosphor-green resize-none custom-scrollbar disabled:border-transparent disabled:text-gray-400"
                    placeholder={t('gearPlaceholder')}
                    disabled={!isEditMode}
                    value={character.gear || ""}
                    onChange={(e) => updateField('gear', e.target.value)}
                />
            </StatBlock>
        </div>

      </div>
      )}
    </div>
  );
};

export default CharacterSheet;
