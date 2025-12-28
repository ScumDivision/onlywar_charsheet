import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../context/GameContext';
import { Sparkles, Skull, ShieldCheck, AlertTriangle } from 'lucide-react';

const ParticleEffects = () => {
  const { feedback } = useGame();

  if (!feedback) return null;

  const getEffectConfig = (type) => {
    switch (type) {
      case 'success':
        return { color: 'text-phosphor-green', icon: ShieldCheck, scale: 1.2 };
      case 'failure':
        return { color: 'text-mechanicus-red', icon: AlertTriangle, scale: 1 };
      case 'crit_success':
        return { color: 'text-tarnished-gold', icon: Sparkles, scale: 2 };
      case 'crit_fail':
        return { color: 'text-void-black', icon: Skull, scale: 2 };
      default:
        return { color: 'text-white', icon: Sparkles, scale: 1 };
    }
  };

  const config = getEffectConfig(feedback.type);
  const Icon = config.icon;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-50 overflow-hidden">
        {/* Background Flash */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.2 }}
          exit={{ opacity: 0 }}
          className={`absolute inset-0 ${feedback.type.includes('success') ? 'bg-phosphor-green' : 'bg-red-900'}`}
        />

        {/* Central Icon/Message */}
        <motion.div
          key={feedback.id}
          initial={{ scale: 0, opacity: 0, y: 50 }}
          animate={{ scale: config.scale, opacity: 1, y: 0 }}
          exit={{ scale: 2, opacity: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className={`flex flex-col items-center ${config.color} drop-shadow-lg`}
        >
          <Icon size={120} className="mb-4 animate-pulse" />
          <h2 className="text-4xl font-gothic font-bold uppercase tracking-widest text-glow bg-black/50 px-4 py-2 rounded">
            {feedback.message}
          </h2>
        </motion.div>

        {/* Particle/Sparks Simulation (Simplified CSS/Motion) */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: 0, 
              y: 0, 
              opacity: 1, 
              scale: Math.random() * 0.5 + 0.5 
            }}
            animate={{ 
              x: (Math.random() - 0.5) * 800, 
              y: (Math.random() - 0.5) * 800, 
              opacity: 0,
              rotate: Math.random() * 360
            }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className={`absolute w-2 h-2 rounded-full ${feedback.type.includes('success') ? 'bg-phosphor-green' : 'bg-red-500'}`}
          />
        ))}
      </div>
    </AnimatePresence>
  );
};

export default ParticleEffects;
