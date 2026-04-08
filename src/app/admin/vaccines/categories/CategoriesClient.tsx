"use client";

import { useState } from "react";
import { createVaccineCategory, updateVaccineCategory, deleteVaccineCategory } from "@/lib/actions/vaccineCategory";
import { Plus, Trash2, Edit2, X } from "lucide-react";

export default function CategoriesClient({ initialData }: { initialData: any[] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({ name: "", slug: "" });
    const [loading, setLoading] = useState(false);

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        setFormData({ name, slug: generateSlug(name) });
    };

    const handleOpenModal = (category?: any) => {
        if (category) {
            setEditingId(category._id);
            setFormData({ name: category.name, slug: category.slug });
        } else {
            setEditingId(null);
            setFormData({ name: "", slug: "" });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const res = editingId
            ? await updateVaccineCategory(editingId, formData)
            : await createVaccineCategory(formData);

        if (res.success) {
            setIsModalOpen(false);
        } else {
            alert("Error: " + res.error);
        }
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this vaccine category?")) {
            await deleteVaccineCategory(id);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in max-w-4xl mx-auto p-4 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Vaccine Categories</h1>
                    <p className="text-slate-500 mt-1">Manage the categories for your vaccines.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-blue-500/20 transition-all"
                >
                    <Plus size={18} />
                    New Category
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-border/60 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-border/60">
                            <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Name</th>
                            <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Slug</th>
                            <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                        {initialData.map((cat) => (
                            <tr key={cat._id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="py-4 px-6 font-semibold text-slate-900">{cat.name}</td>
                                <td className="py-4 px-6 text-slate-500 font-mono text-sm">{cat.slug}</td>
                                <td className="py-4 px-6 text-right space-x-2">
                                    <button
                                        onClick={() => handleOpenModal(cat)}
                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(cat._id)}
                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {initialData.length === 0 && (
                            <tr>
                                <td colSpan={3} className="py-12 text-center text-slate-500">
                                    No categories found. Create your first one to get started.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between p-6 border-b border-border/60">
                            <h2 className="text-xl font-bold text-slate-900">
                                {editingId ? "Edit Category" : "New Category"}
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">Category Name</label>
                                <input
                                    required
                                    value={formData.name}
                                    onChange={handleNameChange}
                                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-gray-50 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    placeholder="e.g. Flu Vaccines"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">URL Slug</label>
                                <input
                                    required
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-gray-50 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono text-slate-500"
                                />
                            </div>
                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 text-white shadow-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                                >
                                    {loading ? "Saving..." : "Save Category"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
