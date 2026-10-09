
import React, { useState } from 'react';
import { User, Role } from '../../types';
import { Modal } from '../Modal';
import { Search, MoreVertical, Trash2, Edit2, ShieldAlert } from 'lucide-react';

interface UserManagementViewProps {
    authenticatedUser: User;
    users: User[];
    onUpdateUser: (user: User) => void;
    onDeleteUser: (userId: string) => void;
}

const RoleBadge = ({ role }: { role: Role }) => {
    /**
     * Fix: Added Admin, Manager, Editor, and Viewer roles to the colors mapping
     * to satisfy the Record<Role, string> type requirement.
     */
    const colors: Record<Role, string> = {
        [Role.Operator]: 'bg-purple-100 text-purple-700 border-purple-200',
        [Role.Institution]: 'bg-cyan-100 text-cyan-700 border-cyan-200',
        [Role.Inventor]: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        [Role.Apprentice]: 'bg-slate-100 text-slate-600 border-slate-200',
        [Role.Admin]: 'bg-indigo-100 text-indigo-700 border-indigo-200',
        [Role.Manager]: 'bg-teal-100 text-teal-700 border-teal-200',
        [Role.Editor]: 'bg-blue-100 text-blue-700 border-blue-200',
        [Role.Viewer]: 'bg-gray-100 text-gray-700 border-gray-200',
    };
    return <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest border rounded-md ${colors[role]}`}>{role}</span>;
}

export const UserManagementView = ({ authenticatedUser, users, onUpdateUser, onDeleteUser }: UserManagementViewProps) => {
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [filter, setFilter] = useState('');

    const handleRoleChange = (userId: string, newRole: Role) => {
        const userToUpdate = users.find(u => u.id === userId);
        if (userToUpdate) {
            onUpdateUser({ ...userToUpdate, role: newRole });
        }
    };
    
    const filteredUsers = users.filter(u => u.name.toLowerCase().includes(filter.toLowerCase()) || u.email.toLowerCase().includes(filter.toLowerCase()));

    return (
        <div className="space-y-12 animate-fade-in">
             <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">Identity Ledger</h2>
                    <p className="text-slate-500 text-[10px] mt-4 font-black uppercase tracking-[0.2em]">RBAC & Sovereign Permission Matrix</p>
                </div>
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-cyan transition-colors" />
                    <input 
                        type="text"
                        placeholder="Search Identity Nodes..."
                        value={filter}
                        onChange={e => setFilter(e.target.value)}
                        className="pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-brand-cyan outline-none transition-all shadow-sm w-72"
                    />
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
                <table className="w-full text-left table-fixed">
                    <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                        <tr>
                            <th className="px-8 py-5 w-[30%]">Auth Node (User)</th>
                            <th className="px-8 py-5 w-[20%]">Permission Tier</th>
                            <th className="px-8 py-5 w-[15%]">Synapses</th>
                            <th className="px-8 py-5 w-[20%]">Last Active</th>
                            <th className="px-8 py-5 w-[15%] text-center">Protocol</th>
                        </tr>
                    </thead>
                    <tbody className="text-[11px] font-bold text-slate-700">
                        {filteredUsers.map(user => (
                            <tr key={user.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-4">
                                        <img src={user.picture} className="w-10 h-10 rounded-full shadow-sm" alt={user.name} />
                                        <div className="min-w-0">
                                            <p className="text-slate-900 truncate uppercase tracking-tight">{user.name}</p>
                                            <p className="text-[9px] text-slate-400 font-medium truncate">{user.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-5">
                                    <select
                                        value={user.role}
                                        onChange={(e) => handleRoleChange(user.id, e.target.value as Role)}
                                        className="bg-transparent border-none p-0 text-[11px] font-black text-slate-900 uppercase focus:ring-0 cursor-pointer hover:text-brand-cyan transition-colors"
                                        disabled={authenticatedUser.id === user.id}
                                    >
                                        {Object.values(Role).map(role => <option key={role} value={role}>{role}</option>)}
                                    </select>
                                    <div className="mt-1"><RoleBadge role={user.role} /></div>
                                </td>
                                <td className="px-8 py-5 text-slate-500 font-mono">{user.analysesRun}</td>
                                <td className="px-8 py-5 text-slate-400">{new Date(user.lastActive).toLocaleDateString()}</td>
                                <td className="px-8 py-5 text-center">
                                    <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => setUserToDelete(user)} disabled={authenticatedUser.id === user.id} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="p-10 bg-purple-50 border border-purple-100 rounded-[3rem] flex items-center gap-8">
                <div className="p-4 bg-purple-600 rounded-2xl text-white shadow-lg shadow-purple-900/20">
                    <ShieldAlert className="w-8 h-8" />
                </div>
                <div>
                    <h4 className="text-xl font-black text-purple-950 uppercase italic tracking-tighter leading-none mb-2">Hierarchical Sovereignty Active</h4>
                    <p className="text-xs text-purple-800 leading-relaxed max-w-2xl font-medium">All Identity Nodes are currently strictly isolated. Changing a permission tier from Apprentice to Operator requires a dual-key HSM handshake for accounts with more than 100 Synapses.</p>
                </div>
            </div>

            <Modal isOpen={!!userToDelete} onClose={() => setUserToDelete(null)} onConfirm={() => { if(userToDelete) onDeleteUser(userToDelete.id); setUserToDelete(null); }} title="Confirm Identity Purge" confirmText="Physical Deletion">
                Permanent deletion of "<strong>{userToDelete?.name}</strong>" will terminate all sovereign keys and purge associated project buffers.
            </Modal>
        </div>
    );
};
