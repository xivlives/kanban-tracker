import { router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
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
        pending: { title: 'Pending', color: 'bg-yellow-50 border-yellow-200' },
        'in-progress': { title: 'In Progress', color: 'bg-blue-50 border-blue-200' },
        done: { title: 'Done', color: 'bg-green-50 border-green-200' },
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
        <AuthenticatedLayout>
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
                    <p className="text-gray-600 mt-1">{project.description}</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
                                        className={`flex-1 rounded-lg border-2 border-dashed p-4 min-h-[500px] ${
                                            column.color
                                        } ${
                                            snapshot.isDraggingOver ? 'ring-2 ring-blue-400' : ''
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
                                                            className={`bg-white rounded-lg p-4 shadow-sm border border-gray-200 ${
                                                                snapshot.isDragging
                                                                    ? 'shadow-lg ring-2 ring-blue-400'
                                                                    : 'hover:shadow-md'
                                                            } transition-shadow cursor-move`}
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
                                                                <p className="text-sm text-gray-600 mb-3">
                                                                    {task.description}
                                                                </p>
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
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Create Task
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}