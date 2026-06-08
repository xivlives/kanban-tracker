import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { X, Flag, Calendar, User, Tag, Zap } from 'lucide-react';

const PRIORITY_OPTIONS = [
    { value: 'low', label: 'Low', color: 'oklch(70% 0 0)' },
    { value: 'medium', label: 'Medium', color: 'oklch(60% 0 0)' },
    { value: 'high', label: 'High', color: 'var(--trac-orange)' },
    { value: 'urgent', label: 'Urgent', color: 'var(--trac-danger)' },
];

const STATUS_OPTIONS = [
    { value: 'pending', label: 'To Do' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'in-review', label: 'In Review' },
    { value: 'done', label: 'Done' },
];

export default function TaskDetailModal({ task, users = [], labels = [], onClose }) {
    const [form, setForm] = useState({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'pending',
        label: task.label || '',
        priority: task.priority || 'medium',
        assigned_to: task.assigned_to || '',
        due_date: task.due_date ? task.due_date.split('T')[0] : '',
    });
    const [saving, setSaving] = useState(false);

    // Close on Escape
    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onClose]);

    const handleSave = () => {
        setSaving(true);
        router.put(route('tasks.update', task.id), form, {
            preserveScroll: true,
            onSuccess: () => { setSaving(false); onClose(); },
            onError: () => setSaving(false),
        });
    };

    const handleDelete = () => {
        if (confirm('Delete this task? This cannot be undone.')) {
            router.delete(route('tasks.destroy', task.id), {
                preserveScroll: true,
                onSuccess: onClose,
            });
        }
    };

    const Field = ({ label, icon: Icon, children }) => (
        <div className="flex items-start gap-3 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2 w-28 shrink-0 text-xs font-medium text-gray-500 pt-1.5">
                {Icon && <Icon size={14} />}
                {label}
            </div>
            <div className="flex-1">{children}</div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm p-4 pt-[10vh] overflow-y-auto" onClick={onClose}>
            <div className="w-full max-w-2xl rounded-xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded font-mono">
                            {task.task_key || `#${task.id}`}
                        </span>
                        {task.source_app === 'MeenitsApp' && (
                            <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full"
                                  style={{ backgroundColor: 'var(--trac-accent)', color: 'var(--trac-ink)' }}>
                                <Zap size={10} strokeWidth={3} /> From Meeting
                            </span>
                        )}
                    </div>
                    <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Title */}
                <div className="px-6 pt-4 pb-2">
                    <input
                        type="text"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        className="w-full text-xl font-bold text-gray-900 border-0 p-0 focus:ring-0 focus:outline-none placeholder-gray-300"
                        placeholder="Task title..."
                    />
                </div>

                {/* Description */}
                <div className="px-6 pb-4">
                    <textarea
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        className="w-full text-sm text-gray-700 border-0 p-0 focus:ring-0 focus:outline-none resize-none placeholder-gray-300"
                        placeholder="Add a description..."
                        rows={3}
                    />
                </div>

                {/* Meeting Context (if from MeenitsApp) */}
                {task.source_ref?.meeting_title && (
                    <div className="mx-6 mb-4 rounded-lg p-4 trac-brand-gradient text-white">
                        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--trac-accent)' }}>
                            <Zap size={12} strokeWidth={3} />
                            From Meeting
                        </div>
                        <div className="text-sm font-medium">{task.source_ref.meeting_title}</div>
                        {task.source_ref.meeting_url && (
                            <a href={task.source_ref.meeting_url} target="_blank" rel="noreferrer"
                               className="mt-2 inline-flex items-center text-xs font-semibold text-white/80 hover:text-white transition-colors">
                                View transcript →
                            </a>
                        )}
                    </div>
                )}

                {/* Fields */}
                <div className="px-6">
                    <Field label="Status" icon={null}>
                        <select
                            value={form.status}
                            onChange={(e) => setForm({ ...form, status: e.target.value })}
                            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:border-[var(--trac-primary)] focus:ring-1 focus:ring-[var(--trac-primary)]"
                        >
                            {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    </Field>

                    <Field label="Label" icon={Tag}>
                        <input
                            type="text"
                            value={form.label}
                            onChange={(e) => setForm({ ...form, label: e.target.value })}
                            list="label-suggestions"
                            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:border-[var(--trac-primary)] focus:ring-1 focus:ring-[var(--trac-primary)]"
                            placeholder="e.g. BILLING, ACCOUNTS, FORMS..."
                        />
                        <datalist id="label-suggestions">
                            {labels.map(l => <option key={l} value={l} />)}
                        </datalist>
                    </Field>

                    <Field label="Priority" icon={Flag}>
                        <div className="flex gap-2">
                            {PRIORITY_OPTIONS.map(o => (
                                <button
                                    key={o.value}
                                    type="button"
                                    onClick={() => setForm({ ...form, priority: o.value })}
                                    className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                                        form.priority === o.value
                                            ? 'border-current shadow-sm'
                                            : 'border-gray-200 text-gray-500 hover:border-gray-300'
                                    }`}
                                    style={form.priority === o.value ? { color: o.color, borderColor: o.color } : {}}
                                >
                                    {o.label}
                                </button>
                            ))}
                        </div>
                    </Field>

                    <Field label="Assignee" icon={User}>
                        <select
                            value={form.assigned_to}
                            onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}
                            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:border-[var(--trac-primary)] focus:ring-1 focus:ring-[var(--trac-primary)]"
                        >
                            <option value="">Unassigned</option>
                            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                        </select>
                    </Field>

                    <Field label="Due Date" icon={Calendar}>
                        <input
                            type="date"
                            value={form.due_date}
                            onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:border-[var(--trac-primary)] focus:ring-1 focus:ring-[var(--trac-primary)]"
                        />
                    </Field>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4 mt-4">
                    <button
                        type="button"
                        onClick={handleDelete}
                        className="text-sm font-medium text-red-500 hover:text-red-700 transition-colors"
                    >
                        Delete task
                    </button>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={saving}
                            className="trac-btn-primary rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
