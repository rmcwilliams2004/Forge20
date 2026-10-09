import React, { useState, useEffect } from 'react';
import { Project } from '../types';
import { ExtractedProjectDetails } from '../services/geminiService';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (details: { name: string; description: string; tags: string[] }) => void;
  project: Project | null; // null for create mode, project object for edit mode
  initialData?: Omit<ExtractedProjectDetails, 'initialPrompt'>;
}

export const ProjectModal = ({ isOpen, onClose, onSave, project, initialData }: ProjectModalProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (project) {
        // Edit mode
        setName(project.name);
        setDescription(project.description);
        setTags(project.tags.join(', '));
      } else if (initialData) {
        // Create mode with pre-filled data
        setName(initialData.name);
        setDescription(initialData.description);
        setTags(initialData.tags.join(', '));
      } else {
        // Create mode from scratch
        setName('');
        setDescription('');
        setTags('');
      }
    }
  }, [isOpen, project, initialData]);

  const handleSave = () => {
    if (!name.trim()) {
      alert('Project name is required.');
      return;
    }
    const tagArray = tags.split(',').map(tag => tag.trim()).filter(Boolean);
    onSave({ name: name.trim(), description: description.trim(), tags: tagArray });
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        handleSave();
    }
  };


  if (!isOpen) return null;

  const title = project ? 'Edit Project Details' : 'Create New Project';
  const confirmText = project ? 'Save Changes' : 'Create Project';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 animate-fade-in" style={{ animationDuration: '0.2s' }} onClick={onClose}>
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg border border-gray-700 animate-scale-in" onClick={e => e.stopPropagation()} onKeyDown={handleKeyDown}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-brand-light">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition text-2xl font-bold">&times;</button>
        </div>
        <div className="space-y-4">
          <div>
            <label htmlFor="projectName" className="block text-sm font-medium text-gray-300 mb-1">Project Name <span className="text-red-500">*</span></label>
            <input
              id="projectName"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan"
              required
            />
          </div>
          <div>
            <label htmlFor="projectDescription" className="block text-sm font-medium text-gray-300 mb-1">Description</label>
            <textarea
              id="projectDescription"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={4}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan"
              placeholder="A brief summary of the project's goals..."
            />
          </div>
          <div>
            <label htmlFor="projectTags" className="block text-sm font-medium text-gray-300 mb-1">Tags</label>
            <input
              id="projectTags"
              type="text"
              value={tags}
              onChange={e => setTags(e.target.value)}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan"
              placeholder="e.g., prototype, electronics, consumer-product"
            />
            <p className="text-xs text-gray-500 mt-1">Enter comma-separated tags.</p>
          </div>
        </div>
        <div className="flex justify-end gap-4 mt-6">
          <button onClick={onClose} className="py-2 px-4 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-500 transition active:scale-95">
            Cancel
          </button>
          <button onClick={handleSave} disabled={!name.trim()} className="py-2 px-4 bg-brand-cyan text-white font-bold rounded-lg hover:bg-cyan-500 transition active:scale-95 disabled:opacity-50">
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};