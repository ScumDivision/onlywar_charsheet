import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';

const GameContext = createContext();

export const useGame = () => useContext(GameContext);

export const GameProvider = ({ children }) => {
  const [character, setCharacter] = useState({
    name: "Trooper Jenkins",
    regiment: "Cadian 412th",
    specialty: "Operator",
    demeanour: "Stoic",
    ws: 35, bs: 40, s: 30, t: 35, ag: 30, int_: 30, per: 35, wp: 30, fel: 25,
    current_wounds: 10, total_wounds: 12,
    current_fate: 1, total_fate: 2,
    fatigue: 0,
    skills: { "Athletics": 0, "Awareness": 10, "Dodge": 0 },
    inventory: {}
  });

  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'failure' | 'crit_success' | 'crit_fail', message: string }

  const triggerFeedback = useCallback((type, message) => {
    setFeedback({ type, message, id: Date.now() });
    setTimeout(() => setFeedback(null), 3000);
  }, []);

  const fetchCharacter = async (id) => {
    try {
      const res = await axios.get(`http://localhost:8000/characters/${id}`);
      setCharacter(res.data);
    } catch (error) {
      console.error("Failed to fetch character", error);
    }
  };

  const updateCharacter = async (id, data) => {
      try {
          const res = await axios.put(`http://localhost:8000/characters/${id}`, data);
          setCharacter(res.data);
      } catch (error) {
          console.error("Failed to update character", error);
      }
  }

  return (
    <GameContext.Provider value={{ character, setCharacter, feedback, triggerFeedback, fetchCharacter, updateCharacter }}>
      {children}
    </GameContext.Provider>
  );
};
