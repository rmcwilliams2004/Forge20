
import React from 'react';
import { User, Role } from '../../types';

type AdminView = 'dashboard' | 'users' | 'analytics' | 'personas';

interface SidebarProps {
    activeView: AdminView;
    setActiveView: (view: AdminView) => void;
    onOpenTechDoc: () => void;
    authenticatedUser: User;
}

const NavItem = ({ label, icon, isActive, onClick }: { label: string, icon: React.ReactNode, isActive: boolean, onClick: () => void }) => (
    <button
        onClick={onClick}
        className={`flex items-center w-full px-4 py-3 text-left rounded-lg transition-all duration-200 active:scale-95 ${
            isActive
                ? 'bg-purple-600 text-white font-bold'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
        }`}
    >
        {icon}
        <span className="ml-3">{label}</span>
    </button>
);

const Icons = {
    Dashboard: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
    Users: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197" /></svg>,
    Analytics: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>,
    TechDoc: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" /></svg>,
    Primes: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.048 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.467 5.99 5.99 0 0 0-1.925 3.546 5.974 5.974 0 0 1-2.133-1A3.75 3.75 0 0 0 12 18Z" /></svg>
};

export const Sidebar = ({ activeView, setActiveView, onOpenTechDoc, authenticatedUser }: SidebarProps) => {
    return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 h-full">
            <nav className="space-y-2">
                {authenticatedUser.role === Role.Admin && (
                    <>
                        <NavItem label="Dashboard" icon={<Icons.Dashboard />} isActive={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} />
                        <NavItem label="User Management" icon={<Icons.Users />} isActive={activeView === 'users'} onClick={() => setActiveView('users')} />
                        <NavItem label="Creative Primes" icon={<Icons.Primes />} isActive={activeView === 'personas'} onClick={() => setActiveView('personas')} />
                    </>
                )}
                {[Role.Admin, Role.Manager].includes(authenticatedUser.role) && (
                     <NavItem label="Analytics" icon={<Icons.Analytics />} isActive={activeView === 'analytics'} onClick={() => setActiveView('analytics')} />
                )}
                <div className="pt-2 mt-2 border-t border-gray-700">
                    <NavItem label="Technical Doc" icon={<Icons.TechDoc />} isActive={false} onClick={onOpenTechDoc} />
                </div>
            </nav>
        </div>
    );
};
