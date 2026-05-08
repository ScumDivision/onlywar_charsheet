import React, { useRef, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import clsx from 'clsx';
import { History, Trash2 } from 'lucide-react';

const DiceLog = () => {
  const { rollLog, clearRollLog, t } = useGame();
  const bottomRef = useRef(null);

  return (
    <div className="bg-black/80 border-l border-phosphor-dim/30 h-full flex flex-col w-full md:w-80 fixed right-0 top-0 bottom-0 z-40 transform transition-transform translate-x-full md:translate-x-0 pt-20 pb-4 px-4 overflow-hidden">
        <div className="flex items-center gap-2 text-tarnished-gold mb-4 border-b border-phosphor-dim/30 pb-2">
            <History size={18} />
            <h3 className="font-gothic uppercase tracking-wider flex-1">{t('voxLog')}</h3>
            {rollLog.length > 0 && (
                <button
                    onClick={clearRollLog}
                    title={t('clearLog')}
                    className="text-red-900 hover:text-red-500 transition-colors"
                >
                    <Trash2 size={14} />
                </button>
            )}
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
            {rollLog.length === 0 && (
                <div className="text-xs text-gray-600 italic text-center mt-10">{t('voxIdle')}</div>
            )}
            {rollLog.map((entry) => (
                <div key={entry.id} className={clsx(
                    "p-2 rounded border-l-2 text-xs font-mono mb-2",
                    entry.type.includes('success') ? "border-phosphor-green bg-phosphor-green/5" : "border-mechanicus-red bg-mechanicus-red/5"
                )}>
                    <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-gray-300 uppercase">{entry.label}</span>
                        <span className="text-[10px] text-gray-500">{new Date(entry.id).toLocaleTimeString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className={clsx(
                            "font-bold",
                            entry.type.includes('success') ? "text-phosphor-green" : "text-mechanicus-red"
                        )}>
                            {t('rollLabel')}: {entry.roll}
                        </span>
                        <span className="text-gray-400">{t('vs')} {entry.target}</span>
                    </div>
                    <div className="mt-1 text-right text-tarnished-gold font-bold uppercase text-[10px]">
                        {entry.result}
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};

export default DiceLog;
