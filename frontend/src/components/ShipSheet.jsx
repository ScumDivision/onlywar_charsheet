import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import {
    Anchor, Save, Trash2, FolderOpen, FilePlus, Plus,
    Shield, Zap, Users, Compass, Battery, Box, ScrollText,
    Edit3, Lock, Unlink2, X, Package
} from 'lucide-react';
import clsx from 'clsx';
import { toInt } from '../utils';

const StatBlock = ({ title, icon: Icon, children, className }) => (
  <div className={`p-4 border border-phosphor-dim/50 bg-black/20 relative ${className || ''}`}>
    <div className="absolute top-0 left-0 bg-phosphor-dim/20 px-2 py-1 text-xs uppercase text-tarnished-gold font-bold flex items-center gap-1">
      {Icon && <Icon size={12} />} {title}
    </div>
    <div className="mt-4 grid gap-3">
      {children}
    </div>
    <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-phosphor-green"></div>
    <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-phosphor-green"></div>
  </div>
);

const Field = ({ label, children, className }) => (
    <div className={clsx("flex flex-col gap-1", className)}>
        <label className="text-[10px] uppercase text-gray-500 tracking-widest">{label}</label>
        {children}
    </div>
);

const NumInput = ({ value, onChange, disabled, className }) => (
    <input
        type="number"
        value={value ?? 0}
        disabled={disabled}
        onChange={(e) => onChange(toInt(e.target.value))}
        className={clsx(
            "bg-black/40 border border-phosphor-dim/40 text-phosphor-green text-right p-1 focus:outline-none focus:border-phosphor-green disabled:border-transparent disabled:text-gray-400 font-mono",
            className
        )}
    />
);

const TextInput = ({ value, onChange, disabled, placeholder, className }) => (
    <input
        type="text"
        value={value ?? ''}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={clsx(
            "bg-transparent border-b border-phosphor-dim text-phosphor-green focus:outline-none focus:border-phosphor-green disabled:border-transparent disabled:text-gray-400",
            className
        )}
    />
);

const CREW_RATINGS = ['Untrained', 'Competent', 'Crack', 'Elite', 'Veteran'];

const ShipSheet = ({ onClose }) => {
    const {
        ship, setShip, savedShips, loadShip, saveShip, createNewShip, deleteShip,
        linkShipToCharacter, character, t,
    } = useGame();

    const [isEditMode, setIsEditMode] = useState(false);
    const [showLoadModal, setShowLoadModal] = useState(false);

    const update = (field, value) => setShip(prev => ({ ...prev, [field]: value }));

    const updateComponent = (idx, field, value) =>
        setShip(prev => {
            const next = [...(prev.components || [])];
            next[idx] = { ...next[idx], [field]: value };
            return { ...prev, components: next };
        });
    const addComponent = () => setShip(prev => ({
        ...prev,
        components: [...(prev.components || []), { name: '', type: '', location: '', integrity: 1, notes: '' }],
    }));
    const removeComponent = (idx) => setShip(prev => ({
        ...prev,
        components: (prev.components || []).filter((_, i) => i !== idx),
    }));

    const updateShipWeapon = (idx, field, value) =>
        setShip(prev => {
            const next = [...(prev.weapons || [])];
            next[idx] = { ...next[idx], [field]: value };
            return { ...prev, weapons: next };
        });
    const addShipWeapon = () => setShip(prev => ({
        ...prev,
        weapons: [...(prev.weapons || []), { name: '', mount: 'Prow', strength: 1, damage: '1d10', crit_rating: 5, range: '3', notes: '' }],
    }));
    const removeShipWeapon = (idx) => setShip(prev => ({
        ...prev,
        weapons: (prev.weapons || []).filter((_, i) => i !== idx),
    }));

    // ---------- empty state ----------
    if (!ship) {
        return (
            <div className="border-t-4 border-t-tarnished-gold bg-black/30 p-8 flex flex-col items-center gap-4 relative">
                <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-white" title={t('close')}>
                    <X size={18}/>
                </button>
                <Anchor size={48} className="text-phosphor-dim/40"/>
                <p className="text-tarnished-gold font-gothic text-xl">{t('voidshipDossier')}</p>
                <p className="text-xs text-gray-500 max-w-md text-center">
                    {character.ship_id
                        ? t('voidship') + ' ID #' + character.ship_id
                        : t('selectVoidship')}
                </p>
                <div className="flex gap-2">
                    <button onClick={createNewShip} className="btn-control flex items-center gap-2 hover:text-phosphor-green border border-phosphor-dim/40 px-3 py-2">
                        <FilePlus size={14}/> {t('newVoidship')}
                    </button>
                    <button onClick={() => setShowLoadModal(true)} className="btn-control flex items-center gap-2 hover:text-tarnished-gold border border-phosphor-dim/40 px-3 py-2">
                        <FolderOpen size={14}/> {t('selectVoidship')}
                    </button>
                </div>

                {showLoadModal && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setShowLoadModal(false)}>
                        <div className="bg-imperial-dark border border-tarnished-gold p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                            <h3 className="font-gothic text-xl text-tarnished-gold mb-4 border-b border-white/10 pb-2">{t('selectVoidship')}</h3>
                            <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                                {savedShips.map(s => (
                                    <div key={s.id} className="flex justify-between items-center p-2 hover:bg-white/5 cursor-pointer group"
                                         onClick={() => { loadShip(s.id); linkShipToCharacter(s.id); setShowLoadModal(false); }}>
                                        <div>
                                            <div className="font-bold text-phosphor-green group-hover:text-white">{s.name}</div>
                                            <div className="text-xs text-gray-500">{s.ship_class || '—'}</div>
                                        </div>
                                        <div className="text-xs text-tarnished-gold">ID: {s.id}</div>
                                    </div>
                                ))}
                                {savedShips.length === 0 && <div className="text-gray-500 italic">{t('noShips')}</div>}
                            </div>
                            <button onClick={() => setShowLoadModal(false)} className="mt-4 w-full py-2 bg-red-900/30 border border-red-800 text-red-400 hover:bg-red-900/50">{t('close')}</button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // ---------- ship loaded ----------
    return (
        <div className="space-y-6 relative">
            {/* Ship-level control sub-bar */}
            <div className="flex flex-wrap gap-2 justify-between items-center p-2 bg-black/30 border border-phosphor-dim/30">
                <div className="flex gap-2">
                    <button onClick={onClose} className="btn-control flex items-center gap-2 hover:text-white">
                        <X size={14}/> {t('close')}
                    </button>
                    <button onClick={createNewShip} className="btn-control flex items-center gap-2 hover:text-white">
                        <FilePlus size={14}/> {t('newVoidship')}
                    </button>
                    <button onClick={() => setShowLoadModal(true)} className="btn-control flex items-center gap-2 hover:text-white">
                        <FolderOpen size={14}/> {t('selectVoidship')}
                    </button>
                    <button onClick={saveShip} className="btn-control flex items-center gap-2 hover:text-phosphor-green">
                        <Save size={14}/> {t('save')}
                    </button>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsEditMode(v => !v)}
                        className={clsx(
                            "btn-control flex items-center gap-2 px-3 py-1 rounded border",
                            isEditMode
                                ? "bg-phosphor-green/20 border-phosphor-green text-phosphor-green"
                                : "bg-transparent border-white/10 text-gray-500 hover:text-white"
                        )}
                    >
                        {isEditMode ? <><Edit3 size={14}/> {t('editingActive')}</> : <><Lock size={14}/> {t('viewOnly')}</>}
                    </button>
                    {character.ship_id === ship.id && (
                        <button onClick={() => linkShipToCharacter(null)} className="btn-control flex items-center gap-2 text-yellow-600 hover:text-yellow-500" title={t('unlinkShip')}>
                            <Unlink2 size={14}/> {t('unlinkShip')}
                        </button>
                    )}
                    {ship.id && isEditMode && (
                        <button onClick={() => deleteShip(ship.id)} className="btn-control flex items-center gap-2 text-red-500 hover:text-red-400">
                            <Trash2 size={14}/> {t('delete')}
                        </button>
                    )}
                </div>
            </div>

            {/* Header */}
            <StatBlock title={t('voidshipDossier')} icon={Anchor} className="border-t-4 border-t-tarnished-gold">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label={t('shipName')}>
                        <TextInput value={ship.name} onChange={(v) => update('name', v)} disabled={!isEditMode}
                            className="font-gothic text-2xl text-tarnished-gold border-b-tarnished-gold" />
                    </Field>
                    <Field label={t('shipClass')}>
                        <TextInput value={ship.ship_class} onChange={(v) => update('ship_class', v)} disabled={!isEditMode}
                            className="font-gothic text-lg" />
                    </Field>
                </div>
            </StatBlock>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Hull */}
                <StatBlock title={t('hullIntegrity')} icon={Shield}>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label={`${t('hi_short')} ${t('used')}`}>
                            <NumInput value={ship.hull_integrity_current} onChange={(v) => update('hull_integrity_current', v)} disabled={!isEditMode} className="text-2xl text-red-400" />
                        </Field>
                        <Field label={`${t('hi_short')} ${t('capacity')}`}>
                            <NumInput value={ship.hull_integrity_total} onChange={(v) => update('hull_integrity_total', v)} disabled={!isEditMode} className="text-2xl text-red-900" />
                        </Field>
                        <Field label={t('speed')}>
                            <NumInput value={ship.speed} onChange={(v) => update('speed', v)} disabled={!isEditMode} />
                        </Field>
                        <Field label={t('manoeuvrability')}>
                            <NumInput value={ship.manoeuvrability} onChange={(v) => update('manoeuvrability', v)} disabled={!isEditMode} />
                        </Field>
                        <Field label={t('detection')}>
                            <NumInput value={ship.detection} onChange={(v) => update('detection', v)} disabled={!isEditMode} />
                        </Field>
                        <Field label={t('armourRating')}>
                            <NumInput value={ship.armour} onChange={(v) => update('armour', v)} disabled={!isEditMode} />
                        </Field>
                        <Field label={t('turretRating')}>
                            <NumInput value={ship.turret_rating} onChange={(v) => update('turret_rating', v)} disabled={!isEditMode} />
                        </Field>
                    </div>
                </StatBlock>

                {/* Crew */}
                <StatBlock title={t('crewPopulation')} icon={Users}>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label={t('crewPopulation')}>
                            <NumInput value={ship.crew_population} onChange={(v) => update('crew_population', v)} disabled={!isEditMode} />
                        </Field>
                        <Field label={t('crewRating')}>
                            <select
                                value={ship.crew_rating || 'Competent'}
                                disabled={!isEditMode}
                                onChange={(e) => update('crew_rating', e.target.value)}
                                className="bg-black/40 border border-phosphor-dim/40 text-phosphor-green p-1 focus:outline-none focus:border-phosphor-green disabled:border-transparent disabled:text-gray-400"
                            >
                                {CREW_RATINGS.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </Field>
                        <Field label={`${t('morale')} ${t('used')}`}>
                            <NumInput value={ship.morale_current} onChange={(v) => update('morale_current', v)} disabled={!isEditMode} />
                        </Field>
                        <Field label={`${t('morale')} ${t('capacity')}`}>
                            <NumInput value={ship.morale_total} onChange={(v) => update('morale_total', v)} disabled={!isEditMode} />
                        </Field>
                    </div>
                </StatBlock>

                {/* Power */}
                <StatBlock title={t('power')} icon={Battery}>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label={t('used')}>
                            <NumInput value={ship.power_used} onChange={(v) => update('power_used', v)} disabled={!isEditMode} />
                        </Field>
                        <Field label={t('capacity')}>
                            <NumInput value={ship.power_total} onChange={(v) => update('power_total', v)} disabled={!isEditMode} />
                        </Field>
                    </div>
                    <div className="text-[10px] text-gray-500 text-right uppercase">
                        Δ {(ship.power_total || 0) - (ship.power_used || 0)}
                    </div>
                </StatBlock>

                {/* Space */}
                <StatBlock title={t('space')} icon={Box}>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label={t('used')}>
                            <NumInput value={ship.space_used} onChange={(v) => update('space_used', v)} disabled={!isEditMode} />
                        </Field>
                        <Field label={t('capacity')}>
                            <NumInput value={ship.space_total} onChange={(v) => update('space_total', v)} disabled={!isEditMode} />
                        </Field>
                    </div>
                    <div className="text-[10px] text-gray-500 text-right uppercase">
                        Δ {(ship.space_total || 0) - (ship.space_used || 0)}
                    </div>
                </StatBlock>
            </div>

            {/* Components */}
            <StatBlock title={t('componentsHeader')} icon={Compass}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {(ship.components || []).map((c, idx) => (
                        <div key={idx} className="bg-black/40 p-2 border border-white/5 hover:border-phosphor-dim/40 transition-colors group">
                            <div className="flex justify-between items-center mb-1">
                                <input
                                    type="text" disabled={!isEditMode}
                                    value={c.name || ''}
                                    onChange={(e) => updateComponent(idx, 'name', e.target.value)}
                                    placeholder={t('componentName')}
                                    className="bg-transparent text-phosphor-green font-bold text-sm w-full focus:outline-none disabled:text-gray-300"
                                />
                                {isEditMode && (
                                    <button onClick={() => removeComponent(idx)} className="text-red-900 hover:text-red-500"><Trash2 size={12}/></button>
                                )}
                            </div>
                            <div className="grid grid-cols-3 gap-1 text-[10px] mb-1">
                                <input type="text" disabled={!isEditMode} value={c.type || ''}
                                    onChange={(e) => updateComponent(idx, 'type', e.target.value)}
                                    placeholder={t('componentType')}
                                    className="bg-transparent text-tarnished-gold focus:outline-none disabled:text-gray-500"/>
                                <input type="text" disabled={!isEditMode} value={c.location || ''}
                                    onChange={(e) => updateComponent(idx, 'location', e.target.value)}
                                    placeholder={t('componentLocation')}
                                    className="bg-transparent text-gray-400 focus:outline-none disabled:text-gray-500"/>
                                <input type="number" disabled={!isEditMode} value={c.integrity ?? 1}
                                    onChange={(e) => updateComponent(idx, 'integrity', toInt(e.target.value))}
                                    className="bg-transparent text-right text-phosphor-green focus:outline-none disabled:text-gray-500"/>
                            </div>
                            <textarea
                                disabled={!isEditMode} value={c.notes || ''}
                                onChange={(e) => updateComponent(idx, 'notes', e.target.value)}
                                placeholder={t('componentNotes')}
                                className="w-full bg-transparent text-[11px] text-gray-400 focus:outline-none focus:text-white resize-none h-10 custom-scrollbar disabled:text-gray-500"
                            />
                        </div>
                    ))}
                    {isEditMode && (
                        <button onClick={addComponent} className="border border-dashed border-phosphor-dim/40 text-phosphor-dim/60 hover:text-phosphor-green hover:border-phosphor-green hover:bg-phosphor-green/5 transition-all flex justify-center items-center min-h-[80px] uppercase tracking-widest text-xs">
                            <Plus size={14}/> {t('addComponent')}
                        </button>
                    )}
                </div>
            </StatBlock>

            {/* Ship Weapons */}
            <StatBlock title={t('shipWeaponsHeader')} icon={Zap}>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-phosphor-dim border-collapse">
                        <thead>
                            <tr className="border-b border-white/10 text-[10px] uppercase text-tarnished-gold">
                                <th className="p-2">{t('w_name')}</th>
                                <th className="p-2">{t('mount')}</th>
                                <th className="p-2">{t('strength')}</th>
                                <th className="p-2">{t('w_dmg')}</th>
                                <th className="p-2">{t('critRating')}</th>
                                <th className="p-2">{t('weaponRange')}</th>
                                <th className="p-2">{t('w_special')}</th>
                                {isEditMode && <th className="p-2"></th>}
                            </tr>
                        </thead>
                        <tbody>
                            {(ship.weapons || []).map((w, idx) => (
                                <tr key={idx} className="bg-black/20 hover:bg-white/5 border-b border-white/5">
                                    <td className="p-1"><input type="text" disabled={!isEditMode} value={w.name || ''}
                                        onChange={(e) => updateShipWeapon(idx, 'name', e.target.value)}
                                        className="bg-transparent w-full focus:outline-none focus:text-white disabled:text-gray-400"/></td>
                                    <td className="p-1"><input type="text" disabled={!isEditMode} value={w.mount || ''}
                                        onChange={(e) => updateShipWeapon(idx, 'mount', e.target.value)}
                                        className="bg-transparent w-full focus:outline-none focus:text-white disabled:text-gray-400"/></td>
                                    <td className="p-1"><input type="number" disabled={!isEditMode} value={w.strength ?? 1}
                                        onChange={(e) => updateShipWeapon(idx, 'strength', toInt(e.target.value))}
                                        className="bg-transparent w-12 text-right focus:outline-none focus:text-white disabled:text-gray-400"/></td>
                                    <td className="p-1"><input type="text" disabled={!isEditMode} value={w.damage || ''}
                                        onChange={(e) => updateShipWeapon(idx, 'damage', e.target.value)}
                                        className="bg-transparent w-full focus:outline-none focus:text-white disabled:text-gray-400"/></td>
                                    <td className="p-1"><input type="number" disabled={!isEditMode} value={w.crit_rating ?? 5}
                                        onChange={(e) => updateShipWeapon(idx, 'crit_rating', toInt(e.target.value))}
                                        className="bg-transparent w-12 text-right focus:outline-none focus:text-white disabled:text-gray-400"/></td>
                                    <td className="p-1"><input type="text" disabled={!isEditMode} value={w.range || ''}
                                        onChange={(e) => updateShipWeapon(idx, 'range', e.target.value)}
                                        className="bg-transparent w-full focus:outline-none focus:text-white disabled:text-gray-400"/></td>
                                    <td className="p-1"><input type="text" disabled={!isEditMode} value={w.notes || ''}
                                        onChange={(e) => updateShipWeapon(idx, 'notes', e.target.value)}
                                        className="bg-transparent w-full focus:outline-none focus:text-white disabled:text-gray-400"/></td>
                                    {isEditMode && (
                                        <td className="p-1 text-center">
                                            <button onClick={() => removeShipWeapon(idx)} className="text-red-900 hover:text-red-500"><Trash2 size={12}/></button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {isEditMode && (
                    <button onClick={addShipWeapon} className="w-full py-2 mt-2 border border-dashed border-phosphor-dim/40 text-phosphor-dim/60 hover:text-phosphor-green hover:border-phosphor-green hover:bg-phosphor-green/5 transition-all flex justify-center items-center gap-2 uppercase tracking-widest text-xs">
                        <Plus size={14}/> {t('addShipWeapon')}
                    </button>
                )}
            </StatBlock>

            {/* Manifest — three sub-lists for crew/guests, cargo/loot, prisoners */}
            <StatBlock title={t('manifest')} icon={Package}>
                {(() => {
                    const manifest = ship.manifest || { crew: [], cargo: [], prisoners: [] };
                    const updateManifest = (slot, items) => setShip(prev => ({
                        ...prev,
                        manifest: { ...(prev.manifest || { crew: [], cargo: [], prisoners: [] }), [slot]: items },
                    }));
                    const addManifestEntry = (slot) => updateManifest(slot, [
                        { id: Date.now(), name: '', status: '', location: '', notes: '' },
                        ...(manifest[slot] || []),
                    ]);
                    const removeManifestEntry = (slot, id) =>
                        updateManifest(slot, (manifest[slot] || []).filter(e => e.id !== id));
                    const updateManifestEntry = (slot, id, field, value) =>
                        updateManifest(slot, (manifest[slot] || []).map(e => e.id === id ? { ...e, [field]: value } : e));

                    const slots = [
                        { key: 'crew',      label: t('manifestCrew'),      addLabel: t('addCrew'),      icon: Users,     accent: 'text-phosphor-green' },
                        { key: 'cargo',     label: t('manifestCargo'),     addLabel: t('addCargo'),     icon: Box,       accent: 'text-tarnished-gold' },
                        { key: 'prisoners', label: t('manifestPrisoners'), addLabel: t('addPrisoner'), icon: Lock,      accent: 'text-red-400' },
                    ];

                    return (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                            {slots.map(({ key, label, addLabel, icon: SlotIcon, accent }) => {
                                const items = manifest[key] || [];
                                return (
                                    <div key={key} className="bg-black/30 border border-phosphor-dim/30 p-2 flex flex-col gap-2">
                                        <div className={clsx("flex items-center gap-2 text-[11px] uppercase tracking-wider font-bold border-b border-white/5 pb-1", accent)}>
                                            <SlotIcon size={12} />
                                            <span className="flex-1">{label}</span>
                                            <span className="text-[10px] text-gray-600">{items.length}</span>
                                        </div>
                                        <div className="space-y-1.5 min-h-[2rem]">
                                            {items.length === 0 && (
                                                <div className="text-center text-gray-700 italic text-xs py-2">{t('noManifest')}</div>
                                            )}
                                            {items.map(item => (
                                                <div key={item.id} className="bg-black/40 border border-white/5 p-1.5 group">
                                                    <div className="flex items-center gap-1 mb-1">
                                                        <input
                                                            type="text"
                                                            disabled={!isEditMode}
                                                            value={item.name ?? ''}
                                                            onChange={(e) => updateManifestEntry(key, item.id, 'name', e.target.value)}
                                                            placeholder={t('manifestNamePlaceholder')}
                                                            className={clsx("flex-1 bg-transparent text-sm font-bold focus:text-white focus:outline-none placeholder-gray-700", accent)}
                                                        />
                                                        {isEditMode && (
                                                            <button
                                                                onClick={() => removeManifestEntry(key, item.id)}
                                                                className="text-red-900 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                title={t('delete')}
                                                            >
                                                                <Trash2 size={12} />
                                                            </button>
                                                        )}
                                                    </div>
                                                    <input
                                                        type="text"
                                                        disabled={!isEditMode}
                                                        value={item.status ?? ''}
                                                        onChange={(e) => updateManifestEntry(key, item.id, 'status', e.target.value)}
                                                        placeholder={t('manifestStatusPlaceholder')}
                                                        className="w-full bg-transparent text-[11px] text-tarnished-gold/80 focus:text-white focus:outline-none placeholder-gray-700"
                                                    />
                                                    <input
                                                        type="text"
                                                        disabled={!isEditMode}
                                                        value={item.location ?? ''}
                                                        onChange={(e) => updateManifestEntry(key, item.id, 'location', e.target.value)}
                                                        placeholder={t('manifestLocationPlaceholder')}
                                                        className="w-full bg-transparent text-[11px] text-blue-300/80 focus:text-white focus:outline-none placeholder-gray-700"
                                                    />
                                                    <input
                                                        type="text"
                                                        disabled={!isEditMode}
                                                        value={item.notes ?? ''}
                                                        onChange={(e) => updateManifestEntry(key, item.id, 'notes', e.target.value)}
                                                        placeholder={t('manifestNotesPlaceholder')}
                                                        className="w-full bg-transparent text-[11px] text-gray-400 focus:text-white focus:outline-none placeholder-gray-700"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                        {isEditMode && (
                                            <button
                                                onClick={() => addManifestEntry(key)}
                                                className="w-full py-1 border border-dashed border-phosphor-dim/40 text-phosphor-dim/60 hover:text-phosphor-green hover:border-phosphor-green hover:bg-phosphor-green/5 transition-all flex justify-center items-center gap-2 uppercase tracking-widest text-[10px]"
                                            >
                                                <Plus size={12} /> {addLabel}
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    );
                })()}
            </StatBlock>

            {/* Background + Notes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <StatBlock title={t('shipBackground')} icon={ScrollText}>
                    <textarea
                        disabled={!isEditMode}
                        value={ship.background || ''}
                        onChange={(e) => update('background', e.target.value)}
                        className="w-full h-40 bg-black/40 border border-phosphor-dim/30 p-2 text-sm text-phosphor-green font-mono focus:outline-none focus:border-phosphor-green resize-none custom-scrollbar disabled:border-transparent disabled:text-gray-400"
                    />
                </StatBlock>
                <StatBlock title={t('shipNotes')} icon={ScrollText}>
                    <textarea
                        disabled={!isEditMode}
                        value={ship.notes || ''}
                        onChange={(e) => update('notes', e.target.value)}
                        className="w-full h-40 bg-black/40 border border-phosphor-dim/30 p-2 text-sm text-phosphor-green font-mono focus:outline-none focus:border-phosphor-green resize-none custom-scrollbar disabled:border-transparent disabled:text-gray-400"
                    />
                </StatBlock>
            </div>

            {showLoadModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setShowLoadModal(false)}>
                    <div className="bg-imperial-dark border border-tarnished-gold p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                        <h3 className="font-gothic text-xl text-tarnished-gold mb-4 border-b border-white/10 pb-2">{t('selectVoidship')}</h3>
                        <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                            {savedShips.map(s => (
                                <div key={s.id} className="flex justify-between items-center p-2 hover:bg-white/5 cursor-pointer group"
                                     onClick={() => { loadShip(s.id); linkShipToCharacter(s.id); setShowLoadModal(false); }}>
                                    <div>
                                        <div className="font-bold text-phosphor-green group-hover:text-white">{s.name}</div>
                                        <div className="text-xs text-gray-500">{s.ship_class || '—'}</div>
                                    </div>
                                    <div className="text-xs text-tarnished-gold">ID: {s.id}</div>
                                </div>
                            ))}
                            {savedShips.length === 0 && <div className="text-gray-500 italic">{t('noShips')}</div>}
                        </div>
                        <button onClick={() => setShowLoadModal(false)} className="mt-4 w-full py-2 bg-red-900/30 border border-red-800 text-red-400 hover:bg-red-900/50">{t('close')}</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShipSheet;
