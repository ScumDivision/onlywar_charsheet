import React, { useRef, useState } from 'react';
import { useGame } from '../context/GameContext';
import { Crop, Trash2, Upload, ImageOff } from 'lucide-react';
import clsx from 'clsx';

const ACCEPTED = 'image/jpeg,image/png,image/webp';

const Portrait = () => {
  const { character, saveCharacter, uploadPortrait, recropPortrait, removePortrait, portraitUrl, triggerFeedback, t } = useGame();
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const url = character.has_portrait ? portraitUrl() : null;
  const canUpload = !busy;

  const ensureSavedThenHandle = async (file) => {
    if (!file || !ACCEPTED.split(',').includes(file.type)) {
      triggerFeedback('failure', 'Use JPEG, PNG, or WebP');
      return;
    }
    setBusy(true);
    try {
      // Backend needs an existing row before we can attach a portrait.
      // Auto-save unsaved characters so the upload UX feels seamless.
      if (!character.id) {
        await saveCharacter();
      }
      await uploadPortrait(file);
    } finally {
      setBusy(false);
    }
  };

  const onSelect = (e) => {
    const f = e.target.files?.[0];
    if (f) ensureSavedThenHandle(f);
    e.target.value = '';
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (!canUpload) return;
    const f = e.dataTransfer.files?.[0];
    if (f) ensureSavedThenHandle(f);
  };

  return (
    <div className="flex flex-col gap-2">
      <div
        onDragOver={(e) => { if (canUpload) { e.preventDefault(); setDragOver(true); } }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => canUpload && !busy && inputRef.current?.click()}
        className={clsx(
          "relative aspect-[3/4] w-full bg-black/40 border-2 overflow-hidden",
          "border-phosphor-dim/40 transition-colors",
          dragOver && canUpload && "border-phosphor-green",
          canUpload && "cursor-pointer hover:border-phosphor-dim",
          !canUpload && "cursor-default"
        )}
      >
        {url ? (
          <img
            src={url}
            alt={t('portrait')}
            className="w-full h-full object-cover"
            draggable={false}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-center p-2 text-phosphor-dim/60 gap-2">
            <ImageOff size={32} className="opacity-40" />
            <span className="text-[10px] uppercase tracking-widest">
              {canUpload ? t('dragImageHere') : t('noPortraitYet')}
            </span>
          </div>
        )}

        {busy && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-phosphor-green text-xs uppercase tracking-wider">
            {t('uploading')}
          </div>
        )}

        {/* corner sigils, matching StatBlock */}
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-phosphor-green pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-phosphor-green pointer-events-none"></div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        className="hidden"
        onChange={onSelect}
      />

      {canUpload && (
        <div className="flex gap-1">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
            disabled={busy}
            className="flex-1 flex items-center justify-center gap-1 text-[10px] uppercase tracking-widest p-1 border border-phosphor-dim/40 hover:border-phosphor-green hover:text-phosphor-green transition-colors disabled:opacity-50"
            title={t('uploadPortrait')}
          >
            <Upload size={12} />
            <span>{t('uploadPortrait')}</span>
          </button>
          {character.has_portrait && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); recropPortrait(); }}
                disabled={busy}
                className="px-2 flex items-center justify-center text-[10px] uppercase tracking-widest border border-phosphor-dim/40 hover:border-phosphor-green hover:text-phosphor-green transition-colors disabled:opacity-50"
                title={t('recropPortrait')}
              >
                <Crop size={12} />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removePortrait(); }}
                disabled={busy}
                className="px-2 flex items-center justify-center text-[10px] uppercase tracking-widest border border-red-900/40 text-red-500 hover:bg-red-900/20 transition-colors disabled:opacity-50"
                title={t('removePortrait')}
              >
                <Trash2 size={12} />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Portrait;
