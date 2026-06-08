import SidebarLayout from "@/Layouts/SidebarLayout";
import { Head, useForm, router } from "@inertiajs/react";
import { useState } from "react";
import PrimaryButton from "@/Components/PrimaryButton";
import DangerButton from "@/Components/DangerButton";
import TextInput from "@/Components/TextInput";
import InputLabel from "@/Components/InputLabel";

export default function Integration({ tokens = [], newToken = null, meenitsUrl }) {
    const { data, setData, post, processing, reset } = useForm({ name: "" });
    const [copied, setCopied] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        post(route("integration.tokens.store"), { onSuccess: () => reset("name") });
    };

    const revoke = (id) => {
        if (confirm("Revoke this token? Meenits will no longer be able to push tasks with it."))
            router.delete(route("integration.tokens.destroy", id), { preserveScroll: true });
    };

    const copy = () => {
        navigator.clipboard?.writeText(newToken);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <SidebarLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Meenits Integration</h2>}
        >
            <Head title="Meenits Integration" />

            <div className="py-12">
                <div className="mx-auto max-w-3xl space-y-6 sm:px-6 lg:px-8">
                    <div className="bg-white p-6 shadow sm:rounded-lg">
                        <h3 className="text-lg font-medium text-gray-900">Connect Meenits</h3>
                        <p className="mt-1 max-w-xl text-sm text-gray-600">
                            Generate a token here, then paste it into Meenits at{" "}
                            <span className="font-medium">Settings → Integrations → MeenitsTrac</span>.
                            Action items from your meetings will then appear as tasks on your board.
                        </p>

                        {newToken && (
                            <div className="mt-4 rounded-md border border-green-300 bg-green-50 p-4">
                                <p className="text-sm font-medium text-green-800">
                                    Token created — copy it now. You won't be able to see it again.
                                </p>
                                <div className="mt-2 flex items-center gap-2">
                                    <code className="flex-1 overflow-x-auto rounded bg-white px-3 py-2 text-xs text-gray-800 ring-1 ring-gray-200">
                                        {newToken}
                                    </code>
                                    <PrimaryButton type="button" onClick={copy}>
                                        {copied ? "Copied" : "Copy"}
                                    </PrimaryButton>
                                </div>
                            </div>
                        )}

                        <form onSubmit={submit} className="mt-6 flex items-end gap-3">
                            <div className="flex-1">
                                <InputLabel htmlFor="name" value="Token name (optional)" />
                                <TextInput
                                    id="name"
                                    className="mt-1 block w-full"
                                    value={data.name}
                                    placeholder="Meenits Integration"
                                    onChange={(e) => setData("name", e.target.value)}
                                />
                            </div>
                            <PrimaryButton disabled={processing}>Generate token</PrimaryButton>
                        </form>
                    </div>

                    <div className="bg-white p-6 shadow sm:rounded-lg">
                        <h3 className="text-lg font-medium text-gray-900">Your tokens</h3>
                        {tokens.length === 0 ? (
                            <p className="mt-2 text-sm text-gray-500">No tokens yet.</p>
                        ) : (
                            <ul className="mt-4 divide-y divide-gray-100">
                                {tokens.map((t) => (
                                    <li key={t.id} className="flex items-center justify-between py-3">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{t.name}</p>
                                            <p className="text-xs text-gray-500">
                                                Created {t.created_at}
                                                {t.last_used_at ? ` · last used ${t.last_used_at}` : " · never used"}
                                            </p>
                                        </div>
                                        <DangerButton type="button" onClick={() => revoke(t.id)}>
                                            Revoke
                                        </DangerButton>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </SidebarLayout>
    );
}
