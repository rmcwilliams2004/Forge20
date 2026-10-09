import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';

interface CommitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (commitMessage: string) => void;
}

export const CommitModal: React.FC<CommitModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
        setMessage(''); // Reset on open
    }
  }, [isOpen]);

  const handleConfirm = () => {
    if (message.trim()) {
      onConfirm(message.trim());
    } else {
        alert('Please enter a commit message.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleConfirm}
      title="Save New Version"
      confirmText="Save Version"
      confirmDisabled={!message.trim()}
    >
      <p className="text-sm text-gray-400 mb-4">
        Enter a brief message describing the changes you've made (e.g., refined prompt, added new drawings). This will be saved in the project's version history.
      </p>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="e.g., 'Refined prompt for gearbox analysis.'"
        rows={3}
        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan"
        autoFocus
      />
    </Modal>
  );
};
