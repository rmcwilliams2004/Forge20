
import React from 'react';
import { Persona, User } from '../types';

interface PersonaSelectorProps {
  personas: Persona[];
  selectedPersona: Persona | null;
  onSelectPersona: (persona: Persona) => void;
  disabled: boolean;
  authenticatedUser: User;
}

const PersonaCard: React.FC<{
  persona: Persona;
  isSelected: boolean;
  onSelect: () => void;
  disabled: boolean;
}> = ({ persona, isSelected, onSelect, disabled }) => {
  return (
    <div
      onClick={() => !disabled && onSelect()}
      className={`p-4 border-2 rounded-2xl transition-all duration-300 flex items-center gap-4 ${
        isSelected
          ? 'border-brand-cyan bg-cyan-900/20 shadow-lg shadow-cyan-900/40'
          : 'border-gray-700 bg-gray-800/40 hover:border-gray-500'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:-translate-y-1'}`}
    >
      <img src={persona.avatar} alt={persona.name} className="w-16 h-16 rounded-xl border border-gray-600 bg-gray-900 object-cover" />
      <div className="flex-1 min-w-0">
        <h3 className={`font-black uppercase tracking-tight italic ${isSelected ? 'text-brand-cyan' : 'text-white'}`}>{persona.name}</h3>
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest truncate">{persona.title}</p>
        <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-snug">{persona.bio}</p>
      </div>
    </div>
  );
};

export const PersonaSelector: React.FC<PersonaSelectorProps> = ({ personas, selectedPersona, onSelectPersona, disabled, authenticatedUser }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
      {personas.map((persona) => (
        <PersonaCard
          key={persona.id}
          persona={persona}
          isSelected={selectedPersona?.id === persona.id}
          onSelect={() => onSelectPersona(persona)}
          disabled={disabled}
        />
      ))}
    </div>
  );
};
