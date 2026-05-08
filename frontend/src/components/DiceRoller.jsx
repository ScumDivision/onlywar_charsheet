import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Dices } from 'lucide-react';
import clsx from 'clsx';
import { toInt } from '../utils';

const DiceRoller = ({ label, target }) => {
  const { triggerFeedback, addToLog, t } = useGame();
  const [modifier, setModifier] = useState(0);
  const [lastRoll, setLastRoll] = useState(null);

  const safeTarget = toInt(target);
  const effectiveTarget = safeTarget + toInt(modifier);

  const rollDice = () => {
    const roll = Math.floor(Math.random() * 100) + 1;
    const degrees = Math.floor((effectiveTarget - roll) / 10);

    let resultType = 'failure';
    let message = t('failure');

    if (roll === 1) {
        resultType = 'crit_success';
        message = t('crit_success');
    } else if (roll === 100) {
        resultType = 'crit_fail';
        message = t('crit_fail');
    } else if (roll <= effectiveTarget) {
        resultType = 'success';
        message = `${t('success')} (${degrees} ${t('dos')})`;
    } else {
        resultType = 'failure';
        message = `${t('failure')} (${Math.abs(degrees)} ${t('dof')})`;
    }

    setLastRoll(roll);
    addToLog({
        label,
        target: effectiveTarget,
        roll,
        result: message,
        type: resultType
    });
    triggerFeedback(resultType, `${label}: ${roll} vs ${effectiveTarget} - ${message}`);
  };

  return (
    <div className="relative flex items-center justify-between bg-imperial-green/30 p-2 rounded border border-phosphor-dim/30 hover:border-phosphor-green/60 transition-colors group">
      <div className="flex flex-col">
        <span className="text-xs uppercase text-tarnished-gold tracking-wider">{label}</span>
        <span className="text-xl font-mono font-bold text-phosphor-green">{safeTarget}</span>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="number"
          value={modifier}
          onChange={(e) => setModifier(toInt(e.target.value))}
          className="w-12 bg-black/50 border border-phosphor-dim text-right text-xs p-1 text-phosphor-green focus:outline-none focus:border-phosphor-green"
          placeholder="+0"
        />
        <button
          onClick={rollDice}
          className="p-2 bg-imperial-dark border border-phosphor-dim rounded hover:bg-phosphor-green hover:text-black transition-all active:scale-95 group-hover:animate-pulse"
          title={t('rollD100')}
        >
          <Dices size={18} />
        </button>
      </div>

      {lastRoll !== null && (
          <div className={clsx(
              "absolute -top-2 -right-2 text-[10px] px-1 rounded font-bold",
              lastRoll <= effectiveTarget ? "bg-phosphor-green text-black" : "bg-mechanicus-red text-white"
          )}>
              {lastRoll}
          </div>
      )}
    </div>
  );
};

export default DiceRoller;
