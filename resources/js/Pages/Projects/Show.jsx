import { router } from '@inertiajs/react';
import ProjectLayout from '@/Layouts/ProjectLayout';
import TaskDetailModal from '@/Components/TaskDetailModal';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Head } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { Plus, Search, Flag, Zap, ChevronDown, Check } from 'lucide-react';

/* ── Helpers ── */

// Generate a stable color from a label string using the brand palette
const LABEL_COLORS = [
    { bg: 'oklch(92% 0.04 220)',  text: 'oklch(40% 0.08 220)' },   // cyan tint
    { bg: 'oklch(93% 0.12 121)',  text: 'oklch(35% 0.10 121)' },   // lime tint
    { bg: 'oklch(92% 0.10 57)',   text: 'oklch(40% 0.12 57)' },    // orange tint
    { bg: 'oklch(92% 0.10 25)',   text: 'oklch(40% 0.14 25)' },    // red tint
    { bg: 'oklch(92% 0.06 280)',  text: 'oklch(40% 0.10 280)' },   // purple tint
    { bg: 'oklch(92% 0.04 180)',  text: 'oklch(40% 0.06 180)' },   // teal tint
    { bg: 'oklch(92% 0.08 90)',   text: 'oklch(40% 0.10 90)' },    // yellow tint
];

function labelColor(label) {
    if (!label) return LABEL_COLORS[0];
    let hash = 0;
    for (let i = 0; i < label.length; i++) hash = (hash * 31 + label.charCodeAt(i)) | 0;
    return LABEL_COLORS[Math.abs(hash) % LABEL_COLORS.length];
}

function avatarColor(name) {
    if (!name) return 'oklch(60% 0.1 220)';
    let h = 0;
    for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
    const hues = [220, 121, 57, 25, 280, 180, 150];
    return `oklch(55% 0.12 ${hues[Math.abs(h) % hues.length]})`;
}

const COLUMNS = [
    { key: 'pending',     label: 'TO DO',        accent: 'var(--trac-orange)' },
    { key: 'in-progress', label: 'IN PROGRESS',  accent: 'var(--trac-primary)' },
    { key: 'in-review',   label: 'IN REVIEW',    accent: 'var(--trac-accent)' },
    { key: 'done',        label: 'DONE',         accent: 'var(--trac-success)', icon: Check },
];

/* ── Main Component ── */

export default function Show({ project, tasks, users, labels = [] }) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterLabel, setFilterLabel] = useState('');
    const [filterAssignee, setFilterAssignee] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        assigned_to: '',
        due_date: '',
        status: 'pending',
        label: '',
        priority: 'medium',
    });

    // Client-side filtering
    const filteredTasks = useMemo(() => {
        const result = {};
        for (const col of COLUMNS) {
            const colTasks = tasks[col.key] || [];
            result[col.key] = colTasks.filter(task => {
                if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())
                    && !(task.task_key || '').toLowerCase().includes(searchQuery.toLowerCase())) {
                    return false;
                }
                if (filterLabel && task.label !== filterLabel) return false;
                if (filterAssignee && String(task.assigned_to) !== String(filterAssignee)) return false;
                return true;
            });
        }
        return result;
    }, [tasks, searchQuery, filterLabel, filterAssignee]);

    const handleDragEnd = (result) => {
        if (!result.destination) return;
        const { draggableId, source, destination } = result;
        const taskId = draggableId.replace('task-', '');
        const newStatus = destination.droppableId;

        // Build the reordered list for the destination column
        const destTasks = [...(filteredTasks[newStatus] || [])];

        // If moving within same column, reorder
        if (source.droppableId === destination.droppableId) {
            const [moved] = destTasks.splice(source.index, 1);
            destTasks.splice(destination.index, 0, moved);
        } else {
            // Moving to a different column: insert at the destination index
            const sourceTask = (filteredTasks[source.droppableId] || []).find(t => String(t.id) === taskId);
            if (sourceTask) {
                destTasks.splice(destination.index, 0, sourceTask);
            }
        }

        // Update status
        router.patch(
            route('tasks.updateStatus', taskId),
            { status: newStatus },
            { preserveScroll: true, preserveState: true }
        );

        // Persist sort order for the destination column
        const reorderPayload = destTasks.map((t, i) => ({ id: t.id, sort_order: i }));
        fetch(route('tasks.reorder'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
            },
            body: JSON.stringify({ tasks: reorderPayload }),
        });
    };

    const handleCreateTask = (e) => {
        e.preventDefault();
        router.post(
            route('tasks.store'),
            { ...formData, project_id: project.id },
            {
                onSuccess: () => {
                    setShowCreateModal(false);
                    setFormData({ title: '', description: '', assigned_to: '', due_date: '', status: 'pending', label: '', priority: 'medium' });
                },
            }
        );
    };

    const totalTasks = COLUMNS.reduce((sum, col) => sum + (tasks[col.key]?.length || 0), 0);

    // Unique assignees for filter
    const assignees = useMemo(() => {
        const map = {};
        for (const col of COLUMNS) {
            for (const t of tasks[col.key] || []) {
                if (t.assigned_user) map[t.assigned_user.id] = t.assigned_user;
            }
        }
        return Object.values(map);
    }, [tasks]);

    return (
        <ProjectLayout
            project={project}
            tab="board"
            title="Board"
            actions={
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="trac-btn-primary rounded-lg px-4 py-2 text-sm font-semibold flex items-center gap-1.5"
                >
                    <Plus size={16} strokeWidth={2.5} />
                    Create
                </button>
            }
        >
            <Head title={`${project.name} — Board`} />

            {/* Board Toolbar */}
            <div className="mb-6 flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search tasks..."
                        className="pl-9 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg w-48 focus:border-[var(--trac-primary)] focus:ring-1 focus:ring-[var(--trac-primary)] focus:outline-none"
                    />
                </div>

                {/* Assignee avatars */}
                <div className="flex items-center -space-x-1">
                    {assignees.slice(0, 5).map(u => (
                        <button
                            key={u.id}
                            onClick={() => setFilterAssignee(filterAssignee === String(u.id) ? '' : String(u.id))}
                            title={u.name}
                            className={`trac-avatar trac-avatar-sm border-2 transition-all ${
                                filterAssignee === String(u.id) ? 'border-[var(--trac-primary)] ring-2 ring-[var(--trac-primary)]/30 scale-110 z-10' : 'border-white'
                            }`}
                            style={{ backgroundColor: avatarColor(u.name) }}
                        >
                            {u.name.charAt(0)}
                        </button>
                    ))}
                </div>

                {/* Label filter */}
                {labels.length > 0 && (
                    <select
                        value={filterLabel}
                        onChange={(e) => setFilterLabel(e.target.value)}
                        className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:border-[var(--trac-primary)] focus:ring-1 focus:ring-[var(--trac-primary)]"
                    >
                        <option value="">All labels</option>
                        {labels.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                )}

                {/* Clear filters */}
                {(searchQuery || filterLabel || filterAssignee) && (
                    <button
                        onClick={() => { setSearchQuery(''); setFilterLabel(''); setFilterAssignee(''); }}
                        className="text-xs font-medium text-[var(--trac-primary)] hover:underline"
                    >
                        Clear filters
                    </button>
                )}
            </div>

            {/* Kanban Board */}
            <DragDropContext onDragEnd={handleDragEnd}>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4" style={{ minHeight: '70vh' }}>
                    {COLUMNS.map((col) => {
                        const ColIcon = col.icon;
                        const colTasks = filteredTasks[col.key] || [];
                        return (
                            <div key={col.key} className="flex flex-col min-w-0">
                                {/* Column header */}
                                <div className="trac-column-header mb-2" style={{ borderLeft: `3px solid ${col.accent}`, paddingLeft: '0.75rem' }}>
                                    {ColIcon && <ColIcon size={14} style={{ color: col.accent }} />}
                                    <span>{col.label}</span>
                                    <span className="count">{colTasks.length}</span>
                                </div>

                                <Droppable droppableId={col.key}>
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            className={`flex-1 rounded-lg p-2 space-y-2 trac-scroll overflow-y-auto transition-colors ${
                                                snapshot.isDraggingOver
                                                    ? 'bg-[var(--trac-primary-50)] ring-1 ring-[var(--trac-primary-200)]'
                                                    : 'bg-gray-100/60'
                                            }`}
                                            style={{ maxHeight: 'calc(100vh - 220px)' }}
                                        >
                                            {colTasks.map((task, index) => (
                                                <Draggable key={task.id} draggableId={`task-${task.id}`} index={index}>
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            onClick={() => setSelectedTask(task)}
                                                            className={`trac-card ${snapshot.isDragging ? 'is-dragging' : ''}`}
                                                        >
                                                            {/* Title */}
                                                            <h3 className="text-sm font-medium text-gray-900 leading-snug mb-2">
                                                                {task.title}
                                                            </h3>

                                                            {/* Label badge */}
                                                            {task.label && (
                                                                <div className="mb-2">
                                                                    <span
                                                                        className="trac-label"
                                                                        style={{
                                                                            backgroundColor: labelColor(task.label).bg,
                                                                            color: labelColor(task.label).text,
                                                                        }}
                                                                    >
                                                                        {task.label}
                                                                    </span>
                                                                </div>
                                                            )}

                                                            {/* Bottom row: key + flags + avatar */}
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-2">
                                                                    {/* Meeting lightning bolt */}
                                                                    {task.source_app === 'MeenitsApp' && (
                                                                        <span title="From Meenits Meeting" className="flex items-center justify-center w-4 h-4 rounded"
                                                                              style={{ color: 'var(--trac-accent)' }}>
                                                                            <Zap size={12} strokeWidth={3} fill="currentColor" />
                                                                        </span>
                                                                    )}
                                                                    {/* Task key */}
                                                                    <span className="text-[0.65rem] font-semibold text-gray-400 font-mono">
                                                                        {task.task_key || `#${task.id}`}
                                                                    </span>
                                                                    {/* Priority flag */}
                                                                    {(task.priority === 'high' || task.priority === 'urgent') && (
                                                                        <Flag
                                                                            size={12}
                                                                            className={task.priority === 'urgent' ? 'trac-priority-urgent' : 'trac-priority-high'}
                                                                            fill="currentColor"
                                                                        />
                                                                    )}
                                                                </div>
                                                                {/* Assignee avatar */}
                                                                {task.assigned_user && (
                                                                    <div
                                                                        className="trac-avatar trac-avatar-sm"
                                                                        style={{ backgroundColor: avatarColor(task.assigned_user.name) }}
                                                                        title={task.assigned_user.name}
                                                                    >
                                                                        {task.assigned_user.name.charAt(0)}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </div>
                        );
                    })}
                </div>
            </DragDropContext>

            {/* Task Detail Modal */}
            {selectedTask && (
                <TaskDetailModal
                    task={selectedTask}
                    users={users}
                    labels={labels}
                    onClose={() => setSelectedTask(null)}
                />
            )}

            {/* Create Task Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center p-4 pt-[10vh] z-50" onClick={() => setShowCreateModal(false)}>
                    <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-xl font-bold mb-5 text-gray-900">Create Task</h2>
                        <form onSubmit={handleCreateTask} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[var(--trac-primary)] focus:ring-1 focus:ring-[var(--trac-primary)] focus:outline-none"
                                    required
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[var(--trac-primary)] focus:ring-1 focus:ring-[var(--trac-primary)] focus:outline-none"
                                    rows="2"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
                                    <input
                                        type="text"
                                        value={formData.label}
                                        onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                                        list="create-label-list"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[var(--trac-primary)] focus:ring-1 focus:ring-[var(--trac-primary)] focus:outline-none"
                                        placeholder="e.g. BILLING"
                                    />
                                    <datalist id="create-label-list">
                                        {labels.map(l => <option key={l} value={l} />)}
                                    </datalist>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                                    <select
                                        value={formData.priority}
                                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[var(--trac-primary)] focus:ring-1 focus:ring-[var(--trac-primary)] focus:outline-none"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="urgent">Urgent</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
                                    <select
                                        value={formData.assigned_to}
                                        onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[var(--trac-primary)] focus:ring-1 focus:ring-[var(--trac-primary)] focus:outline-none"
                                    >
                                        <option value="">Unassigned</option>
                                        {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                                    <input
                                        type="date"
                                        value={formData.due_date}
                                        onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[var(--trac-primary)] focus:ring-1 focus:ring-[var(--trac-primary)] focus:outline-none"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setShowCreateModal(false)} className="rounded-lg bg-gray-100 px-4 py-2 text-sm text-gray-700 hover:bg-gray-200">Cancel</button>
                                <button type="submit" className="trac-btn-primary rounded-lg px-4 py-2 text-sm font-semibold">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </ProjectLayout>
    );
}