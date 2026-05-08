import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import axios from 'axios';

const API = 'http://localhost:8000';

const GameContext = createContext();

export const useGame = () => useContext(GameContext);

export const SYSTEMS = { OW: 'only_war', RT: 'rogue_trader' };

const blankArmour = () => ({
  "Head": { ap: 0, type: "-" },
  "Body": { ap: 0, type: "-" },
  "Left Arm": { ap: 0, type: "-" },
  "Right Arm": { ap: 0, type: "-" },
  "Left Leg": { ap: 0, type: "-" },
  "Right Leg": { ap: 0, type: "-" }
});

const owDefault = () => ({
  system: SYSTEMS.OW,
  name: "New Trooper",
  regiment: "",
  specialty: "",
  demeanour: "",
  career: null,
  profit_factor: null,
  ws: 30, bs: 30, s: 30, t: 30, ag: 30, int_: 30, per: 30, wp: 30, fel: 30,
  current_wounds: 10, total_wounds: 10,
  current_fate: 1, total_fate: 1,
  fatigue: 0, insanity: 0, corruption: 0, movement: 3,
  skills: [], weapons: [], talents: [],
  armour: blankArmour(),
  gear: "",
  xp: { current: 0, spent: 0, total: 0 },
  inventory: {},
  ship_id: null,
  has_portrait: false,
});

const rtDefault = () => ({
  system: SYSTEMS.RT,
  name: "Lord Captain",
  regiment: null,
  specialty: null,
  demeanour: "",
  career: "Rogue Trader",
  profit_factor: 30,
  ws: 30, bs: 30, s: 30, t: 30, ag: 30, int_: 30, per: 30, wp: 30, fel: 30,
  current_wounds: 11, total_wounds: 11,
  current_fate: 3, total_fate: 3,
  fatigue: 0, insanity: 0, corruption: 0, movement: 3,
  skills: [], weapons: [], talents: [],
  armour: blankArmour(),
  gear: "",
  xp: { current: 0, spent: 0, total: 0 },
  inventory: {},
  ship_id: null,
  has_portrait: false,
});

const blankShip = () => ({
  name: "Unnamed Voidship",
  ship_class: "",
  hull_integrity_current: 0, hull_integrity_total: 0,
  speed: 0, manoeuvrability: 0, detection: 0,
  armour: 0, turret_rating: 0,
  crew_population: 0, crew_rating: "Competent",
  morale_current: 0, morale_total: 0,
  power_used: 0, power_total: 0,
  space_used: 0, space_total: 0,
  components: [], weapons: [],
  background: "", notes: "",
});

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
    damage: "Damage",

    // Systems
    chooseSystem: "Select System",
    systemOW: "Only War",
    systemOWDesc: "Imperial Guard regimental dataslate",
    systemRT: "Rogue Trader",
    systemRTDesc: "Dynasty patent of nobility",

    // RT character fields
    career: "Career",
    profitFactor: "Profit Factor",
    pf_short: "PF",

    // Portrait
    portrait: "Portrait",
    uploadPortrait: "Upload Portrait",
    recropPortrait: "Re-Crop",
    removePortrait: "Remove",
    dragImageHere: "Drop image or click to select",
    noPortraitYet: "No imago",
    uploading: "Uploading...",

    // Ship
    bridge: "Bridge",
    voidshipDossier: "Voidship Dossier",
    voidship: "Voidship",
    selectVoidship: "Select Voidship",
    newVoidship: "New Voidship",
    noShips: "No voidships on record.",
    unlinkShip: "Unlink",
    shipName: "Vessel Name",
    shipClass: "Class",
    hullIntegrity: "Hull Integrity",
    hi_short: "HI",
    speed: "Speed",
    manoeuvrability: "Manoeuvrability",
    detection: "Detection",
    armourRating: "Armour",
    turretRating: "Turrets",
    crewPopulation: "Population",
    crewRating: "Rating",
    morale: "Morale",
    power: "Power",
    space: "Space",
    used: "Used",
    capacity: "Capacity",
    componentsHeader: "Essential Components",
    shipWeaponsHeader: "Ship Weapons",
    shipBackground: "Past History",
    shipNotes: "Captain's Notes",
    addComponent: "Add Component",
    addShipWeapon: "Add Weapon Battery",
    componentName: "Designation",
    componentType: "Type",
    componentLocation: "Location",
    componentIntegrity: "Integrity",
    componentNotes: "Notes",
    mount: "Mount",
    strength: "Strength",
    critRating: "Crit",
    weaponRange: "Range",
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
    damage: "Schaden",

    // Systems
    chooseSystem: "System Wählen",
    systemOW: "Only War",
    systemOWDesc: "Datenschild der Imperialen Armee",
    systemRT: "Rogue Trader",
    systemRTDesc: "Dynastisches Adelspatent",

    // RT character fields
    career: "Laufbahn",
    profitFactor: "Profitwert",
    pf_short: "PW",

    // Portrait
    portrait: "Porträt",
    uploadPortrait: "Porträt Hochladen",
    recropPortrait: "Neu Zuschneiden",
    removePortrait: "Entfernen",
    dragImageHere: "Bild hier ablegen oder klicken",
    noPortraitYet: "Kein Imago",
    uploading: "Lädt hoch...",

    // Ship
    bridge: "Brücke",
    voidshipDossier: "Voidschiff-Dossier",
    voidship: "Voidschiff",
    selectVoidship: "Voidschiff Wählen",
    newVoidship: "Neues Voidschiff",
    noShips: "Keine Voidschiffe verzeichnet.",
    unlinkShip: "Trennen",
    shipName: "Schiffsname",
    shipClass: "Klasse",
    hullIntegrity: "Rumpfintegrität",
    hi_short: "RI",
    speed: "Tempo",
    manoeuvrability: "Wendigkeit",
    detection: "Aufklärung",
    armourRating: "Panzerung",
    turretRating: "Geschütztürme",
    crewPopulation: "Mannschaft",
    crewRating: "Erfahrung",
    morale: "Moral",
    power: "Energie",
    space: "Raum",
    used: "Belegt",
    capacity: "Kapazität",
    componentsHeader: "Wesentliche Komponenten",
    shipWeaponsHeader: "Schiffswaffen",
    shipBackground: "Vergangenheit",
    shipNotes: "Notizen des Kapitäns",
    addComponent: "Komponente Hinzufügen",
    addShipWeapon: "Waffenbatterie Hinzufügen",
    componentName: "Bezeichnung",
    componentType: "Typ",
    componentLocation: "Standort",
    componentIntegrity: "Integrität",
    componentNotes: "Notizen",
    mount: "Lafette",
    strength: "Stärke",
    critRating: "Krit",
    weaponRange: "Reichweite",
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
    ...owDefault(),
    name: "Trooper Jenkins",
    regiment: "Cadian 412th",
    specialty: "Operator",
    demeanour: "Stoic",
    ws: 35, bs: 40, s: 30, t: 35, ag: 30, int_: 30, per: 35, wp: 30, fel: 25,
    total_wounds: 12,
    total_fate: 2,
    skills: [
        { name: "Athletics", characteristic: "S", bonus: 0 },
        { name: "Awareness", characteristic: "Per", bonus: 10 },
        { name: "Dodge", characteristic: "Ag", bonus: 0 }
    ],
  });

  const [savedCharacters, setSavedCharacters] = useState([]);
  const [savedShips, setSavedShips] = useState([]);
  const [ship, setShip] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [rollLog, setRollLog] = useState([]);
  const [portraitVersion, setPortraitVersion] = useState(0);

  const triggerFeedback = useCallback((type, message) => {
    setFeedback({ type, message, id: Date.now() });
    setTimeout(() => setFeedback(null), 3000);
  }, []);

  const addToLog = useCallback((entry) => {
      setRollLog(prev => [{...entry, id: Date.now()}, ...prev].slice(0, 50));
  }, []);

  const fetchAllCharacters = async () => {
      try {
          const res = await axios.get(`${API}/characters/`);
          setSavedCharacters(res.data);
      } catch (error) {
          console.error("Failed to fetch characters list", error);
      }
  };

  const fetchAllShips = async () => {
      try {
          const res = await axios.get(`${API}/ships/`);
          setSavedShips(res.data);
      } catch (error) {
          console.error("Failed to fetch ships list", error);
      }
  };

  const normalizeLoadedCharacter = (loaded) => {
      if (!loaded.system) loaded.system = SYSTEMS.OW;
      if (!loaded.weapons) loaded.weapons = [];
      if (!loaded.talents) loaded.talents = [];
      if (!loaded.skills) loaded.skills = [];
      if (!loaded.armour || Object.keys(loaded.armour).length === 0) {
          loaded.armour = blankArmour();
      }
      if (!loaded.gear) loaded.gear = "";
      if (!loaded.xp) loaded.xp = { current: 0, spent: 0, total: 0 };
      if (loaded.has_portrait === undefined) loaded.has_portrait = false;
      return loaded;
  };

  const loadCharacter = async (id) => {
    try {
      const res = await axios.get(`${API}/characters/${id}`);
      const loaded = normalizeLoadedCharacter(res.data);
      setCharacter(loaded);
      setPortraitVersion(Date.now());
      if (loaded.ship_id) {
          await loadShip(loaded.ship_id);
      } else {
          setShip(null);
      }
      triggerFeedback('success', t('load') + ' ' + t('success'));
    } catch (error) {
      console.error("Failed to fetch character", error);
      triggerFeedback('failure', 'Load Failed');
    }
  };

  const saveCharacter = async () => {
      try {
          // Strip read-only fields the server adds before sending
          const { id, has_portrait, ...payload } = character;
          let res;
          if (id) {
              res = await axios.put(`${API}/characters/${id}`, payload);
          } else {
              res = await axios.post(`${API}/characters/`, payload);
          }
          setCharacter(normalizeLoadedCharacter(res.data));
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
          await axios.delete(`${API}/characters/${id}`);
          if (character.id === id) {
             createNewCharacter(character.system || SYSTEMS.OW);
          }
          fetchAllCharacters();
          triggerFeedback('success', t('delete') + ' ' + t('success'));
      } catch (error) {
          console.error("Failed to delete character", error);
          triggerFeedback('failure', 'Delete Failed');
      }
  };

  const createNewCharacter = (system = SYSTEMS.OW) => {
    const blank = system === SYSTEMS.RT ? rtDefault() : owDefault();
    setCharacter(blank);
    setShip(null);
    setPortraitVersion(Date.now());
    triggerFeedback('success', t('new') + ' ' + t('success'));
  };

  const uploadPortrait = async (file) => {
      if (!character.id) {
          triggerFeedback('failure', 'Save character before uploading a portrait');
          return;
      }
      try {
          const form = new FormData();
          form.append('file', file);
          await axios.post(`${API}/characters/${character.id}/portrait`, form, {
              headers: { 'Content-Type': 'multipart/form-data' },
          });
          setCharacter(prev => ({ ...prev, has_portrait: true }));
          setPortraitVersion(Date.now());
          triggerFeedback('success', t('portrait') + ' ✓');
      } catch (error) {
          console.error("Portrait upload failed", error);
          const detail = error?.response?.data?.detail || 'Upload failed';
          triggerFeedback('failure', detail);
      }
  };

  const recropPortrait = async () => {
      if (!character.id || !character.has_portrait) return;
      try {
          await axios.post(`${API}/characters/${character.id}/portrait/recrop`);
          setPortraitVersion(Date.now());
          triggerFeedback('success', t('recropPortrait') + ' ✓');
      } catch (error) {
          console.error("Recrop failed", error);
          triggerFeedback('failure', 'Recrop failed');
      }
  };

  const removePortrait = async () => {
      if (!character.id || !character.has_portrait) return;
      try {
          await axios.delete(`${API}/characters/${character.id}/portrait`);
          setCharacter(prev => ({ ...prev, has_portrait: false }));
          setPortraitVersion(Date.now());
          triggerFeedback('success', t('removePortrait') + ' ✓');
      } catch (error) {
          console.error("Remove portrait failed", error);
          triggerFeedback('failure', 'Remove failed');
      }
  };

  const portraitUrl = (id = character.id) =>
      id ? `${API}/characters/${id}/portrait?v=${portraitVersion}` : null;

  // -----------------------------------------------------------
  //  Ship CRUD
  // -----------------------------------------------------------

  const loadShip = async (id) => {
      try {
          const res = await axios.get(`${API}/ships/${id}`);
          setShip(res.data);
      } catch (error) {
          console.error("Failed to load ship", error);
          triggerFeedback('failure', 'Ship Load Failed');
      }
  };

  const saveShip = async () => {
      if (!ship) return null;
      try {
          const { id, ...payload } = ship;
          let res;
          if (id) {
              res = await axios.put(`${API}/ships/${id}`, payload);
          } else {
              res = await axios.post(`${API}/ships/`, payload);
          }
          setShip(res.data);
          // Auto-link the new ship to the current character if unlinked
          if (!id && character.id && !character.ship_id) {
              const updated = { ...character, ship_id: res.data.id };
              const { id: cid, has_portrait, ...payload2 } = updated;
              await axios.put(`${API}/characters/${cid}`, payload2);
              setCharacter(updated);
          }
          fetchAllShips();
          triggerFeedback('success', t('voidship') + ' ' + t('save'));
          return res.data;
      } catch (error) {
          console.error("Failed to save ship", error);
          triggerFeedback('failure', 'Ship Save Failed');
          return null;
      }
  };

  const createNewShip = () => {
      setShip(blankShip());
      triggerFeedback('success', t('newVoidship'));
  };

  const linkShipToCharacter = async (shipId) => {
      if (!character.id) {
          triggerFeedback('failure', 'Save character first');
          return;
      }
      const updated = { ...character, ship_id: shipId };
      const { id, has_portrait, ...payload } = updated;
      try {
          await axios.put(`${API}/characters/${id}`, payload);
          setCharacter(updated);
          if (shipId) await loadShip(shipId);
          else setShip(null);
      } catch (error) {
          console.error("Failed to link ship", error);
          triggerFeedback('failure', 'Link failed');
      }
  };

  const deleteShip = async (id) => {
      if (!id) return;
      try {
          await axios.delete(`${API}/ships/${id}`);
          if (ship?.id === id) setShip(null);
          fetchAllShips();
          triggerFeedback('success', t('voidship') + ' ' + t('delete'));
      } catch (error) {
          const detail = error?.response?.data?.detail || 'Delete failed';
          triggerFeedback('failure', detail);
      }
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
      fetchAllShips();
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
        t,
        // Portrait
        uploadPortrait,
        recropPortrait,
        removePortrait,
        portraitUrl,
        portraitVersion,
        // Ships
        ship,
        setShip,
        savedShips,
        loadShip,
        saveShip,
        createNewShip,
        deleteShip,
        linkShipToCharacter,
    }}>
      {children}
    </GameContext.Provider>
  );
};
