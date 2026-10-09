import React from 'react';
import { Modal } from './Modal';
import { GoogleDocContent } from '../types';

interface GoogleDocPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    content: GoogleDocContent | null;
    projectName: string;
}

const renderContent = (content: GoogleDocContent) => {
    if (!content) return null;
    return content.map((item, index) => {
        switch (item.type) {
            case 'h1':
                return <h1 key={index} className="text-3xl font-bold text-black mb-4">{item.text}</h1>;
            case 'h2':
                return <h2 key={index} className="text-2xl font-semibold text-gray-800 mt-6 mb-2 pb-1 border-b">{item.text}</h2>;
            case 'h3':
                return <h3 key={index} className="text-xl font-semibold text-gray-700 mt-4 mb-1">{item.text}</h3>;
            case 'p':
                return <p key={index} className={`text-gray-800 mb-3 leading-relaxed ${item.isMuted ? 'text-sm text-gray-500' : ''}`}>{item.text}</p>;
            case 'bulletList':
                return <ul key={index} className="list-disc list-inside text-gray-800 mb-3 space-y-1">{item.items?.map((li, i) => <li key={i}>{li}</li>)}</ul>;
            case 'table':
                return (
                    <table key={index} className="w-full text-sm my-4 border-collapse border border-gray-300">
                        <thead>
                            <tr>{item.headers?.map((h, i) => <th key={i} className="border border-gray-300 p-2 bg-gray-100 text-left font-sans">{h}</th>)}</tr>
                        </thead>
                        <tbody>
                            {item.rows?.map((row, i) => <tr key={i} className="odd:bg-white even:bg-gray-50">{row.map((cell, j) => <td key={j} className="border border-gray-300 p-2">{cell}</td>)}</tr>)}
                        </tbody>
                    </table>
                );
            case 'image':
                return (
                    <div key={index} className="my-4 text-center">
                        <div className="p-4 bg-gray-200 border rounded flex flex-col items-center justify-center h-40">
                             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-gray-400 mb-2"><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg>
                             <p className="text-gray-500 text-sm font-sans">Simulated Image Upload</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 font-sans"><em>{item.caption}</em></p>
                    </div>
                );
            default:
                return null;
        }
    });
};

export const GoogleDocPreviewModal: React.FC<GoogleDocPreviewModalProps> = ({ isOpen, onClose, content, projectName }) => {
    return (
        <div className={`fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose}>
            <div className={`bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col border-2 border-gray-600 transition-transform duration-300 ${isOpen ? 'scale-100' : 'scale-95'}`} onClick={e => e.stopPropagation()}>
                <header className="flex justify-between items-center p-4 border-b border-gray-700 flex-shrink-0">
                    <div className='flex items-center gap-2'>
                        <svg className="w-6 h-6 text-blue-400" viewBox="0 0 24 24"><path fill="currentColor" d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M13.5,15V19H10.5V15H13.5M13,9V3.5L18.5,9H13Z" /></svg>
                        <h2 className="text-2xl font-bold text-brand-light">Simulated Google Doc: {projectName}</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition text-3xl font-bold">&times;</button>
                </header>
                 <main className="flex-1 p-2 bg-gray-900 overflow-y-auto">
                    <div className="bg-white text-black p-8 md:p-12 mx-auto max-w-3xl rounded-sm shadow-lg font-serif">
                        {renderContent(content)}
                    </div>
                </main>
            </div>
        </div>
    );
};