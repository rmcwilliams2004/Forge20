import React, { useState } from 'react';
import { SUITE_NAVIGATION } from '../../constants';

interface SuiteSidebarProps {
  activeTool: string;
  onSelectTool: (toolId: string) => void;
}

export const SuiteSidebar: React.FC<SuiteSidebarProps> = ({ activeTool, onSelectTool }) => {
  const [openModules, setOpenModules] = useState<Set<string>>(new Set(['cm1', 'cm2', 'cm3', 'cm4']));

  const toggleModule = (moduleId: string) => {
    setOpenModules(prev => {
      const newSet = new Set(prev);
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId);
      } else {
        newSet.add(moduleId);
      }
      return newSet;
    });
  };

  return (
    <aside className="w-80 bg-gray-800/50 border-r border-gray-700 p-4 flex-shrink-0 overflow-y-auto">
      <nav className="space-y-4">
        {SUITE_NAVIGATION.map(module => {
          const isOpen = openModules.has(module.id);
          const isModuleActive = module.tools.some(tool => tool.id === activeTool);
          return (
            <div key={module.id}>
              <button
                onClick={() => toggleModule(module.id)}
                className={`w-full flex items-center justify-between text-left px-3 py-2 rounded-lg transition-colors ${isModuleActive ? 'bg-gray-700' : 'hover:bg-gray-700/50'}`}
              >
                <span className={`font-bold ${isModuleActive ? 'text-brand-cyan' : 'text-brand-light'}`}>{module.name}</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-90' : ''}`}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </button>
              {isOpen && (
                <ul className="pl-4 mt-2 space-y-1 border-l-2 border-gray-700">
                  {module.tools.map(tool => (
                    <li key={tool.id}>
                      <button
                        onClick={() => onSelectTool(tool.id)}
                        className={`w-full text-left px-3 py-1.5 text-sm rounded-md transition-colors ${activeTool === tool.id ? 'bg-cyan-900/50 text-brand-cyan font-semibold' : 'text-gray-400 hover:text-white'}`}
                      >
                        {tool.name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
};
