import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import axios from 'axios';

const GameContext = createContext();

export const useGame = () => useContext(GameContext);

const translations = {
  en: {
    // UI
    new: "New",
    load: "Load",
    save: "Save",
    delete: "Delete",
    viewOnly: "View Only",
    editingActive: "Editing Active",
    close: "Close",
    selectRecord: "Select Record",
    noRecords: "No records found.",
    
    // Headers
    personnelRecord: "Personnel Record",
    characteristics: "Characteristics",
    knownSkills: "Known Skills",
    weaponsAuth: "Weapons Authorization",
    talentsTraits: "Talents & Traits",
    vitalsCondition: "Vitals & Condition",
    armourConfig: "Armour",
    issuedEquipment: "Issued Equipment",
    
    // Fields
    name: "Name",
    regiment: "Regiment",
    specialty: "Specialty",
    demeanour: "Demeanour",
    total: "Total",
    spent: "Spent",
    available: "Available",
    base: "Base",
    
    // Characteristics
    ws: "Weapon Skill", ws_short: "WS",
    bs: "Ballistic Skill", bs_short: "BS",
    s: "Strength", s_short: "S",
    t: "Toughness", t_short: "T",
    ag: "Agility", ag_short: "Ag",
    int: "Intelligence", int_short: "Int",
    per: "Perception", per_short: "Per",
    wp: "Willpower", wp_short: "WP",
    fel: "Fellowship", fel_short: "Fel",
    
    // Vitals
    wounds: "Wounds",
    fate: "Fate",
    fatigue: "Fatigue",
    insanity: "Insanity",
    corruption: "Corruption",
    movement: "Base Move (Half)",
    move_half: "Half",
    move_full: "Full",
    move_charge: "Charge",
    move_run: "Run",
    
    // Weapons Table
    w_name: "Name",
    w_class: "Class",
    w_range: "Range",
    w_rof: "RoF",
    w_dmg: "Dmg",
    w_type: "Type",
    w_pen: "Pen",
    w_clip: "Clip",
    w_rld: "Rld",
    w_special: "Special",
    w_test: "Test",
    
    // Actions
    addSkill: "Add Skill",
    addWeapon: "Add Weapon",
    addTalent: "Add Talent",
    
    // Roll Results
    success: "Success",
    failure: "Failure",
    crit_success: "EMPEROR PROTECTS!",
    crit_fail: "WARP PERIL!",
    dos: "DoS",
    dof: "DoF",
    damage: "Damage"
  },
  de: {
    // UI
    new: "Neu",
    load: "Laden",
    save: "Speichern",
    delete: "Löschen",
    viewOnly: "Ansicht",
    editingActive: "Bearbeiten",
    close: "Schließen",
    selectRecord: "Akte Wählen",
    noRecords: "Keine Akten gefunden.",
    
    // Headers
    personnelRecord: "Personalliste",
    characteristics: "Attribute",
    knownSkills: "Fertigkeiten",
    weaponsAuth: "Waffenautorisierung",
    talentsTraits: "Talente & Eigenschaften",
    vitalsCondition: "Vitalwerte & Zustand",
    armourConfig: "Rüstung",
    issuedEquipment: "Ausrüstung",
    
    // Fields
    name: "Name",
    regiment: "Regiment",
    specialty: "Spezialität",
    demeanour: "Wesenszug",
    total: "Gesamt",
    spent: "Ausg.",
    available: "Verfügbar",
    base: "Basis",
    
    // Characteristics (Using standard German RPG abbreviations)
    ws: "Kampfgeschick", ws_short: "KG",
    bs: "Ballistische F.", bs_short: "BF",
    s: "Stärke", s_short: "S",
    t: "Widerstand", t_short: "W",
    ag: "Gewandtheit", ag_short: "GE",
    int: "Intelligenz", int_short: "IN",
    per: "Wahrnehmung", per_short: "WA",
    wp: "Willenskraft", wp_short: "WK",
    fel: "Charisma", fel_short: "CH",
    
    // Vitals
    wounds: "Lebenspunkte",
    fate: "Schicksal",
    fatigue: "Erschöpfung",
    insanity: "Wahnsinn",
    corruption: "Verderbnis",
    movement: "Bewegung (Halb)",
    move_half: "Halb",
    move_full: "Voll",
    move_charge: "Angriff",
    move_run: "Rennen",
    
    // Weapons Table
    w_name: "Name",
    w_class: "Klasse",
    w_range: "Reichw.",
    w_rof: "Feuerrate",
    w_dmg: "Schaden",
    w_type: "Art",
    w_pen: "DS",
    w_clip: "Mag",
    w_rld: "Laden",
    w_special: "Spezial",
    w_test: "Test",
    
    // Actions
    addSkill: "Fertigkeit Hinzufügen",
    addWeapon: "Waffe Hinzufügen",
    addTalent: "Talent Hinzufügen",
    
    // Roll Results
    success: "Erfolg",
    failure: "Fehlschlag",
    crit_success: "DER IMPERATOR BESCHÜTZT!",
    crit_fail: "GEFAHR AUS DEM IMMATERIUM!",
    dos: "EG",
    dof: "MG",
    damage: "Schaden"
  }
};

export const GameProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');
  
  const t = useCallback((key) => {
    return translations[language][key] || key;
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'de' : 'en');
  };

  const [character, setCharacter] = useState({
    name: "Trooper Jenkins",
    regiment: "Cadian 412th",
    specialty: "Operator",
    demeanour: "Stoic",
    ws: 35, bs: 40, s: 30, t: 35, ag: 30, int_: 30, per: 35, wp: 30, fel: 25,
    current_wounds: 10, total_wounds: 12,
    current_fate: 1, total_fate: 2,
    fatigue: 0,
    insanity: 0,
    corruption: 0,
    movement: 3,
    skills: [
        { name: "Athletics", characteristic: "S", bonus: 0 },
        { name: "Awareness", characteristic: "Per", bonus: 10 },
        { name: "Dodge", characteristic: "Ag", bonus: 0 }
    ],
    weapons: [],
    talents: [],
    armour: {
        "Head": { ap: 0, type: "-" },
        "Body": { ap: 0, type: "-" },
        "Left Arm": { ap: 0, type: "-" },
        "Right Arm": { ap: 0, type: "-" },
        "Left Leg": { ap: 0, type: "-" },
        "Right Leg": { ap: 0, type: "-" }
    },
    gear: "",
    xp: { current: 0, spent: 0, total: 0 },
    inventory: {}
  });

  const [savedCharacters, setSavedCharacters] = useState([]);
  const [feedback, setFeedback] = useState(null); 
  const [rollLog, setRollLog] = useState([]);

  const triggerFeedback = useCallback((type, message) => {
    setFeedback({ type, message, id: Date.now() });
    setTimeout(() => setFeedback(null), 3000);
  }, []);

  const addToLog = useCallback((entry) => {
      setRollLog(prev => [{...entry, id: Date.now()}, ...prev].slice(0, 50));
  }, []);

  const fetchAllCharacters = async () => {
      try {
          const res = await axios.get('http://localhost:8000/characters/');
          setSavedCharacters(res.data);
      } catch (error) {
          console.error("Failed to fetch characters list", error);
      }
  };

  const loadCharacter = async (id) => {
    try {
      const res = await axios.get(`http://localhost:8000/characters/${id}`);
      const loaded = res.data;
      if (!loaded.weapons) loaded.weapons = [];
      if (!loaded.talents) loaded.talents = [];
      if (!loaded.armour) loaded.armour = {
        "Head": { ap: 0, type: "-" },
        "Body": { ap: 0, type: "-" },
        "Left Arm": { ap: 0, type: "-" },
        "Right Arm": { ap: 0, type: "-" },
        "Left Leg": { ap: 0, type: "-" },
        "Right Leg": { ap: 0, type: "-" }
      };
      if (!loaded.gear) loaded.gear = "";
      if (!loaded.xp) loaded.xp = { current: 0, spent: 0, total: 0 };
      
      setCharacter(loaded);
      triggerFeedback('success', t('load') + ' ' + t('success'));
    } catch (error) {
      console.error("Failed to fetch character", error);
      triggerFeedback('failure', 'Load Failed');
    }
  };

  const saveCharacter = async () => {
      try {
          let res;
          if (character.id) {
              res = await axios.put(`http://localhost:8000/characters/${character.id}`, character);
          } else {
              res = await axios.post(`http://localhost:8000/characters/`, character);
          }
          setCharacter(res.data);
          fetchAllCharacters();
          triggerFeedback('success', t('save') + ' ' + t('success'));
      } catch (error) {
          console.error("Failed to save character", error);
          triggerFeedback('failure', 'Save Failed');
      }
  };

  const deleteCharacter = async (id) => {
      if (!id) return;
      try {
          await axios.delete(`http://localhost:8000/characters/${id}`);
          if (character.id === id) {
             createNewCharacter();
          }
          fetchAllCharacters();
          triggerFeedback('success', t('delete') + ' ' + t('success'));
      } catch (error) {
          console.error("Failed to delete character", error);
          triggerFeedback('failure', 'Delete Failed');
      }
  };

  const createNewCharacter = () => {
    setCharacter({
        name: "New Trooper",
        regiment: "",
        specialty: "",
        demeanour: "",
        ws: 30, bs: 30, s: 30, t: 30, ag: 30, int_: 30, per: 30, wp: 30, fel: 30,
        current_wounds: 10, total_wounds: 10,
        current_fate: 1, total_fate: 1,
        fatigue: 0,
        insanity: 0,
        corruption: 0,
        movement: 3,
        skills: [],
        weapons: [],
        talents: [],
        armour: {
            "Head": { ap: 0, type: "-" },
            "Body": { ap: 0, type: "-" },
            "Left Arm": { ap: 0, type: "-" },
            "Right Arm": { ap: 0, type: "-" },
            "Left Leg": { ap: 0, type: "-" },
            "Right Leg": { ap: 0, type: "-" }
        },
        gear: "",
        xp: { current: 0, spent: 0, total: 0 },
        inventory: {}
     });
     triggerFeedback('success', t('new') + ' ' + t('success'));
  };
  
  const rollDamage = (weaponName, formula) => {
      try {
          const parts = formula.toLowerCase().split('d');
          if (parts.length !== 2) throw new Error("Invalid Format");
          
          const numDice = parseInt(parts[0]) || 1;
          let dieType = 10;
          let bonus = 0;
          
          if (parts[1].includes('+')) {
              const sub = parts[1].split('+');
              dieType = parseInt(sub[0]);
              bonus = parseInt(sub[1]);
          } else if (parts[1].includes('-')) {
              const sub = parts[1].split('-');
              dieType = parseInt(sub[0]);
              bonus = -parseInt(sub[1]);
          } else {
              dieType = parseInt(parts[1]);
          }

          let total = 0;
          let rolls = [];
          for (let i = 0; i < numDice; i++) {
              const r = Math.floor(Math.random() * dieType) + 1;
              rolls.push(r);
              total += r;
          }
          total += bonus;

          const msg = `${total} ${t('damage')} (${rolls.join('+')} + ${bonus})`;
          
          addToLog({
            label: `${weaponName} ${t('damage')}`,
            target: formula,
            roll: total,
            result: msg,
            type: 'neutral'
          });
          
          triggerFeedback('success', msg);

      } catch (e) {
          triggerFeedback('failure', "Invalid Damage Formula (e.g., 1d10+3)");
      }
  };

  useEffect(() => {
      fetchAllCharacters();
  }, []);

  return (
    <GameContext.Provider value={{ 
        character, 
        setCharacter, 
        savedCharacters, 
        feedback, 
        rollLog,
        addToLog,
        triggerFeedback, 
        loadCharacter, 
        saveCharacter, 
        deleteCharacter, 
        createNewCharacter,
        rollDamage,
        language,
        toggleLanguage,
        t
    }}>
      {children}
    </GameContext.Provider>
  );
};
