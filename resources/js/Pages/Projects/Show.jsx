import { router } from '@inertiajs/react';
import SidebarLayout from '@/Layouts/SidebarLayout';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useState } from 'react';

export default function Show({ project, tasks, users }) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        assigned_to: '',
        due_date: '',
        status: 'pending',
    });

    const columns = {
        pending: { title: 'Pending', color: 'bg-gray-100 border-gray-200 text-gray-700' },
        'in-progress': { title: 'In Progress', color: 'bg-[oklch(93.28%_0.1821_121.5/0.2)] border-[oklch(93.28%_0.1821_121.5/0.4)] text-[var(--trac-ink)]' },
        done: { title: 'Done', color: 'bg-green-50 border-green-200 text-green-800' },
    };

    const handleDragEnd = (result) => {
        if (!result.destination) return;

        const { draggableId, destination } = result;
        const taskId = draggableId.replace('task-', '');
        const newStatus = destination.droppableId;

        router.patch(
            route('tasks.updateStatus', taskId),
            { status: newStatus },
            {
                preserveScroll: true,
                preserveState: true,
            }
        );
    };

    const handleCreateTask = (e) => {
        e.preventDefault();

        router.post(
            route('tasks.store'),
            {
                ...formData,
                project_id: project.id,
            },
            {
                onSuccess: () => {
                    setShowCreateModal(false);
                    setFormData({
                        title: '',
                        description: '',
                        assigned_to: '',
                        due_date: '',
                        status: 'pending',
                    });
                },
            }
        );
    };

    const handleDeleteTask = (taskId) => {
        if (confirm('Are you sure you want to delete this task?')) {
            router.delete(route('tasks.destroy', taskId), {
                preserveScroll: true,
            });
        }
    };

    return (
        <SidebarLayout>
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
                    <p className="text-gray-600 mt-1">{project.description}</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="trac-btn-primary rounded-lg px-4 py-2 font-semibold shadow-sm"
                >
                    Add Task
                </button>
            </div>

            <DragDropContext onDragEnd={handleDragEnd}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {Object.entries(columns).map(([status, column]) => (
                        <div key={status} className="flex flex-col">
                            <div className="mb-4">
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center justify-between">
                                    {column.title}
                                    <span className="text-sm font-normal text-gray-500">
                                        {tasks[status]?.length || 0}
                                    </span>
                                </h2>
                            </div>

                            <Droppable droppableId={status}>
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className={`flex-1 rounded-2xl border-2 border-dashed p-4 min-h-[500px] ${
                                            column.color
                                        } ${
                                            snapshot.isDraggingOver ? 'ring-2 ring-[var(--trac-primary)] bg-white/50' : ''
                                        }`}
                                    >
                                        <div className="space-y-3">
                                            {tasks[status]?.map((task, index) => (
                                                <Draggable
                                                    key={task.id}
                                                    draggableId={`task-${task.id}`}
                                                    index={index}
                                                >
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            className={`bg-white rounded-xl p-4 shadow-sm border border-gray-100 ${
                                                                snapshot.isDragging
                                                                    ? 'shadow-xl ring-2 ring-[var(--trac-primary)] scale-[1.02]'
                                                                    : 'hover:shadow-md hover:border-gray-200'
                                                            } transition-all cursor-move`}
                                                        >
                                                            <div className="flex justify-between items-start mb-2">
                                                                <h3 className="font-medium text-gray-900">
                                                                    {task.title}
                                                                </h3>
                                                                <button
                                                                    onClick={() => handleDeleteTask(task.id)}
                                                                    className="text-red-500 hover:text-red-700 text-sm"
                                                                >
                                                                    ×
                                                                </button>
                                                            </div>
                                                            {task.description && (
                                                                <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                                                                    {task.description}
                                                                </p>
                                                            )}
                                                            {task.source_ref?.meeting_title && (
                                                                <div className="mb-4 rounded-lg bg-[var(--trac-primary-950)] p-3 text-white trac-brand-gradient">
                                                                    <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--trac-accent)] uppercase tracking-wider mb-1">
                                                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                                        </svg>
                                                                        From Meeting
                                                                    </div>
                                                                    <div className="text-sm font-medium line-clamp-1 truncate">
                                                                        {task.source_ref.meeting_title}
                                                                    </div>
                                                                    {task.source_ref.meeting_url && (
                                                                        <a href={task.source_ref.meeting_url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center text-xs font-semibold text-white/80 hover:text-white transition-colors">
                                                                            View transcript &rarr;
                                                                        </a>
                                                                    )}
                                                                </div>
                                                            )}
                                                            <div className="flex items-center justify-between text-xs text-gray-500">
                                                                {task.assigned_user && (
                                                                    <span className="px-2 py-1 bg-gray-100 rounded">
                                                                        {task.assigned_user.name}
                                                                    </span>
                                                                )}
                                                                {task.due_date && (
                                                                    <span>Due: {task.due_date}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                        </div>
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    ))}
                </div>
            </DragDropContext>

            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h2 className="text-2xl font-bold mb-4">Create Task</h2>
                        <form onSubmit={handleCreateTask}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Task Title
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) =>
                                        setFormData({ ...formData, title: e.target.value })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) =>
                                        setFormData({ ...formData, description: e.target.value })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows="3"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Status
                                </label>
                                <select
                                    value={formData.status}
                                    onChange={(e) =>
                                        setFormData({ ...formData, status: e.target.value })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="in-progress">In Progress</option>
                                    <option value="done">Done</option>
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Assign To
                                </label>
                                <select
                                    value={formData.assigned_to}
                                    onChange={(e) =>
                                        setFormData({ ...formData, assigned_to: e.target.value })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Unassigned</option>
                                    {users.map((user) => (
                                        <option key={user.id} value={user.id}>
                                            {user.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Due Date
                                </label>
                                <input
                                    type="date"
                                    value={formData.due_date}
                                    onChange={(e) =>
                                        setFormData({ ...formData, due_date: e.target.value })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="trac-btn-primary rounded-lg px-4 py-2 font-semibold"
                                >
                                    Create Task
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </SidebarLayout>
    );
}