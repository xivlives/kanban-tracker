import { router } from "@inertiajs/react";
import { useState } from "react";

/** Shared "New project" modal — used from the sidebar and dashboard. */
export default function CreateProjectModal({ show, onClose }) {
    const [form, setForm] = useState({ name: "", description: "" });
    const [processing, setProcessing] = useState(false);

    if (!show) return null;

    const submit = (e) => {
        e.preventDefault();
        setProcessing(true);
        router.post(route("projects.store"), form, {
            onSuccess: () => {
                setForm({ name: "", description: "" });
                onClose?.();
            },
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={onClose}>
            <div className="w-full max-w-md rounded-2xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
                <h2 className="mb-4 text-xl font-bold text-gray-900">Create New Project</h2>
                <form onSubmit={submit}>
                    <div className="mb-4">
                        <label className="mb-2 block text-sm font-medium text-gray-700">Project Name</label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="trac-input w-full rounded-lg border-gray-300"
                            required
                            autoFocus
                        />
                    </div>
                    <div className="mb-6">
                        <label className="mb-2 block text-sm font-medium text-gray-700">Description (optional)</label>
                        <textarea
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            className="trac-input w-full rounded-lg border-gray-300"
                            rows="3"
                            placeholder="What is this project about?"
                        />
                    </div>
                    <div className="flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="rounded-lg bg-gray-100 px-4 py-2 text-gray-700 transition hover:bg-gray-200">
                            Cancel
                        </button>
                        <button type="submit" disabled={processing} className="trac-btn-primary rounded-lg px-4 py-2 font-semibold disabled:opacity-50">
                            {processing ? "Creating..." : "Create Project"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
