
import React, { useState } from 'react';
import { ProjectTask } from '../../types';
import { Plus, ChevronDown, ChevronRight, CheckCircle2, Circle, MoreVertical, Trash2, Edit2, AlertCircle } from 'lucide-react';

interface TaskBoardProps {
    tasks: ProjectTask[];
    onUpdateTasks: (tasks: ProjectTask[]) => void;
    isViewer: boolean;
}

const TaskItem: React.FC<{
    task: ProjectTask;
    onUpdate: (updatedTask: ProjectTask) => void;
    onDelete: () => void;
    onAddSubtask: (parentTask: ProjectTask) => void;
    depth: number;
    isViewer: boolean;
}> = ({ task, onUpdate, onDelete, onAddSubtask, depth, isViewer }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(task.title);

    const toggleStatus = () => {
        if (isViewer) return;
        const nextStatus: ProjectTask['status'] = 
            task.status === 'TODO' ? 'IN_PROGRESS' : 
            task.status === 'IN_PROGRESS' ? 'DONE' : 'TODO';
        onUpdate({ ...task, status: nextStatus });
    };

    const handleSave = () => {
        onUpdate({ ...task, title: editValue });
        setIsEditing(false);
    };

    const handleUpdateSubtask = (index: number, updatedSubtask: ProjectTask) => {
        const newSubtasks = [...(task.subtasks || [])];
        newSubtasks[index] = updatedSubtask;
        onUpdate({ ...task, subtasks: newSubtasks });
    };

    const handleDeleteSubtask = (index: number) => {
        const newSubtasks = (task.subtasks || []).filter((_, i) => i !== index);
        onUpdate({ ...task, subtasks: newSubtasks });
    };

    const getStatusIcon = () => {
        switch (task.status) {
            case 'DONE': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
            case 'IN_PROGRESS': return <Circle className="w-5 h-5 text-amber-500 fill-amber-500/20" />;
            default: return <Circle className="w-5 h-5 text-gray-500" />;
        }
    };

    const getPriorityColor = () => {
        switch (task.priority) {
            case 'HIGH': return 'text-red-400 bg-red-400/10 border-red-400/20';
            case 'MEDIUM': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
            default: return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
        }
    };

    const subtasks = task.subtasks || [];

    return (
        <div className={`space-y-2 animate-fade-in`} style={{ marginLeft: depth > 0 ? '24px' : '0' }}>
            <div className={`group flex items-center gap-3 p-3 bg-gray-800/40 rounded-xl border border-gray-700/50 hover:border-brand-cyan/30 transition-all ${task.status === 'DONE' ? 'opacity-60' : ''}`}>
                <button onClick={toggleStatus} disabled={isViewer} className="flex-shrink-0">
                    {getStatusIcon()}
                </button>
                
                <div className="flex-1 min-w-0 flex items-center gap-2">
                    {isEditing ? (
                        <input 
                            value={editValue} 
                            onChange={e => setEditValue(e.target.value)}
                            onBlur={handleSave}
                            onKeyDown={e => e.key === 'Enter' && handleSave()}
                            autoFocus
                            className="w-full bg-gray-900 border border-brand-cyan/50 rounded px-2 py-1 text-sm text-white focus:outline-none"
                        />
                    ) : (
                        <>
                            <span className={`text-sm font-bold truncate ${task.status === 'DONE' ? 'line-through text-gray-500' : 'text-gray-200'}`}>
                                {task.title}
                            </span>
                            <span className={`text-[8px] px-1.5 py-0.5 rounded border uppercase font-black tracking-tighter ${getPriorityColor()}`}>
                                {task.priority}
                            </span>
                        </>
                    )}
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!isViewer && (
                        <>
                            <button onClick={() => setIsEditing(true)} className="p-1.5 text-gray-500 hover:text-white transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                            <button onClick={() => onAddSubtask(task)} title="Add Subtask" className="p-1.5 text-brand-cyan/60 hover:text-brand-cyan transition-colors"><Plus className="w-4 h-4" /></button>
                            <button onClick={onDelete} className="p-1.5 text-red-500/60 hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                        </>
                    )}
                </div>

                {subtasks.length > 0 && (
                    <button onClick={() => setIsExpanded(!isExpanded)} className="p-1 text-gray-500 hover:text-white transition-colors">
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                )}
            </div>

            {isExpanded && subtasks.length > 0 && (
                <div className="space-y-2 border-l-2 border-gray-800 ml-2.5">
                    {subtasks.map((sub, i) => (
                        <TaskItem 
                            key={sub.id} 
                            task={sub} 
                            onUpdate={(updated) => handleUpdateSubtask(i, updated)}
                            onDelete={() => handleDeleteSubtask(i)}
                            onAddSubtask={onAddSubtask}
                            depth={depth + 1}
                            isViewer={isViewer}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export const TaskBoard: React.FC<TaskBoardProps> = ({ tasks, onUpdateTasks, isViewer }) => {
    const [isAddingRoot, setIsAddingRoot] = useState(false);
    const [rootTitle, setRootTitle] = useState('');

    const addRootTask = () => {
        if (!rootTitle.trim()) return;
        const newTask: ProjectTask = {
            id: `task-${Date.now()}`,
            title: rootTitle,
            status: 'TODO',
            priority: 'MEDIUM',
            subtasks: [],
            createdAt: new Date().toISOString()
        };
        onUpdateTasks([...tasks, newTask]);
        setRootTitle('');
        setIsAddingRoot(false);
    };

    const handleUpdateTask = (index: number, updatedTask: ProjectTask) => {
        const newTasks = [...tasks];
        newTasks[index] = updatedTask;
        onUpdateTasks(newTasks);
    };

    const handleDeleteTask = (index: number) => {
        onUpdateTasks(tasks.filter((_, i) => i !== index));
    };

    const addSubtaskToParent = (parent: ProjectTask) => {
        const newSub: ProjectTask = {
            id: `task-${Date.now()}`,
            title: 'New Subtask',
            status: 'TODO',
            priority: 'MEDIUM',
            subtasks: [],
            createdAt: new Date().toISOString()
        };
        
        const updateRecursive = (taskArray: ProjectTask[]): ProjectTask[] => {
            return taskArray.map(t => {
                if (t.id === parent.id) {
                    return { ...t, subtasks: [...(t.subtasks || []), newSub] };
                }
                if (t.subtasks && t.subtasks.length > 0) {
                    return { ...t, subtasks: updateRecursive(t.subtasks) };
                }
                return t;
            });
        };

        onUpdateTasks(updateRecursive(tasks));
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center px-1">
                <div>
                    <h3 className="text-brand-cyan font-black uppercase tracking-[0.2em] text-xs">Engineering Task Ledger</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Hierarchical backlog for reverse engineering</p>
                </div>
                {!isViewer && (
                    <button 
                        onClick={() => setIsAddingRoot(true)}
                        className="px-4 py-1.5 bg-brand-cyan text-gray-900 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-cyan-400 transition-all flex items-center gap-2 shadow-lg shadow-cyan-900/20"
                    >
                        <Plus className="w-4 h-4" /> New Milestone
                    </button>
                )}
            </div>

            <div className="space-y-4">
                {isAddingRoot && (
                    <div className="p-4 bg-gray-900/60 rounded-2xl border border-brand-cyan/30 animate-scale-in">
                        <input 
                            autoFocus
                            placeholder="Enter milestone title..."
                            value={rootTitle}
                            onChange={e => setRootTitle(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && addRootTask()}
                            className="w-full bg-black/40 border border-gray-700 rounded-xl p-3 text-white text-sm outline-none focus:border-brand-cyan transition-all"
                        />
                        <div className="flex justify-end gap-3 mt-3">
                            <button onClick={() => setIsAddingRoot(false)} className="text-[10px] font-black uppercase text-gray-500 hover:text-white transition-colors">Cancel</button>
                            {/* Fix: Replaced malformed attribute with proper onClick handler */}
                            <button onClick={addRootTask} className="text-[10px] font-black uppercase text-brand-cyan hover:underline">Deploy Milestone</button>
                        </div>
                    </div>
                )}

                <div className="space-y-3">
                    {tasks.length === 0 && !isAddingRoot ? (
                        <div className="p-12 border-2 border-dashed border-gray-800 rounded-[2rem] text-center space-y-4">
                            <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto text-gray-600">
                                <AlertCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Backlog Depleted</p>
                                <p className="text-[10px] text-gray-600 mt-1 italic">No tasks mapped to this project environment.</p>
                            </div>
                        </div>
                    ) : (
                        tasks.map((task, i) => (
                            <TaskItem 
                                key={task.id} 
                                task={task} 
                                onUpdate={(updated) => handleUpdateTask(i, updated)}
                                onDelete={() => handleDeleteTask(i)}
                                onAddSubtask={addSubtaskToParent}
                                depth={0}
                                isViewer={isViewer}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
