import React from 'react';
import { Faction, User, FactionId, Role } from '../types';
import { ENGINEERING_PHILOSOPHIES } from '../constants';

interface FactionSelectorProps {
  selectedFaction: Faction | null;
  onSelectFaction: (faction: Faction) => void;
  disabled: boolean;
  authenticatedUser: User;
}

// Fix: Define props interface and type component as React.FC to handle 'key' prop correctly.
interface FactionCardProps {
  faction: Faction;
  isSelected: boolean;
  onSelect: () => void;
  disabled: boolean;
}

const FactionCard: React.FC<FactionCardProps> = ({ faction, isSelected, onSelect, disabled }) => {
  const Icon = faction.icon;

  // Color schemes for each faction
  const factionColors: Record<FactionId, { selected: string; hover: string; icon: string }> = {
    [FactionId.ADVANCED_MATERIALS]: {
      selected: 'border-brand-cyan bg-cyan-50 dark:bg-cyan-900/40 shadow-lg shadow-cyan-500/20 dark:shadow-cyan-900/50',
      hover: 'hover:border-brand-cyan',
      icon: 'text-brand-cyan',
    },
    [FactionId.PRAGMATIC_PRODUCTION]: {
      selected: 'border-amber-500 bg-amber-50 dark:bg-amber-900/40 shadow-lg shadow-amber-500/20 dark:shadow-amber-900/50',
      hover: 'hover:border-amber-500',
      icon: 'text-amber-500',
    },
    [FactionId.SYSTEMS_AUTOMATION]: {
      selected: 'border-purple-500 bg-purple-50 dark:bg-purple-900/40 shadow-lg shadow-purple-500/20 dark:shadow-purple-900/50',
      hover: 'hover:border-purple-500',
      icon: 'text-purple-500',
    },
  };

  const colors = factionColors[faction.id];

  return (
    <div
      onClick={() => !disabled && onSelect()}
      className={`p-4 border-2 rounded-lg transition-all duration-300 ${
        isSelected
          ? colors.selected
          : `border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 ${colors.hover}`
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:-translate-y-1'}`}
    >
      <div className="flex items-center mb-2">
        <Icon className={`w-8 h-8 mr-3 ${colors.icon}`} />
        <h3 className="text-lg font-bold text-gray-900 dark:text-brand-light">{faction.name}</h3>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 font-mono mb-2">
        <strong>Focus:</strong> {faction.focus}
      </p>
      <p className="text-sm text-gray-600 dark:text-gray-300">{faction.philosophy}</p>
    </div>
  );
};

export const FactionSelector = ({ selectedFaction, onSelectFaction, disabled, authenticatedUser }: FactionSelectorProps) => {
  // Fix: Use Role.Viewer from enum instead of string literal to resolve "unintentional comparison" type error.
  const isViewer = authenticatedUser.role === Role.Viewer;
  return (
    <div id="tour-step-1">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-brand-light mb-3">1. Select an Analytical Lens</h2>
      <div className="grid grid-cols-1 gap-4">
        {ENGINEERING_PHILOSOPHIES.map((faction) => (
          <FactionCard
            key={faction.id}
            faction={faction}
            isSelected={selectedFaction?.id === faction.id}
            onSelect={() => onSelectFaction(faction)}
            disabled={disabled || isViewer}
          />
        ))}
      </div>
    </div>
  );
};
