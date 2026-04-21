"use client";

import { useState } from "react";
import Image from "next/image";
import { Upload, Trash2, GripVertical, Save, CheckCircle2, RotateCcw, Square, CheckSquare, X } from "lucide-react";
import { uploadImage } from "@/lib/actions/upload";
import { updateImageOrder, toggleGalleryImageStatus, deleteGalleryImage, deleteGalleryImages, uploadGalleryImagesBatch } from "@/lib/actions/gallery";
import { useRouter } from "next/navigation";

interface GalleryImage {
    _id: string;
    imageUrl: string;
    caption?: string;
    order: number;
    isActive: boolean;
    createdAt: string;
}

export default function GalleryClient({ initialImages }: { initialImages: GalleryImage[] }) {
    const router = useRouter();
    const [images, setImages] = useState<GalleryImage[]>(
        [...initialImages].sort((a, b) => a.order - b.order)
    );
    const [isUploading, setIsUploading] = useState(false);
    const [isSavingOrder, setIsSavingOrder] = useState(false);
    const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isDeletingBulk, setIsDeletingBulk] = useState(false);

    // --- Upload Logic ---
    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setIsUploading(true);

        try {
            // Parallel upload for better performance
            const uploadPromises = Array.from(files).map(async (file) => {
                const formData = new FormData();
                formData.append("file", file);
                return await uploadImage(formData);
            });

            const uploadResults = await Promise.all(uploadPromises);
            const successfulUploads = uploadResults
                .filter(res => res.success && res.url)
                .map(res => ({ imageUrl: res.url!, publicId: (res as any).publicId }));

            if (successfulUploads.length > 0) {
                const dbRes = await uploadGalleryImagesBatch(successfulUploads);
                if (dbRes.success) {
                    setImages((prev) => [...prev, ...dbRes.images].sort((a, b) => a.order - b.order));
                    router.refresh();
                } else {
                    alert(dbRes.message);
                }
            } else {
                alert("No images were successfully uploaded to Cloudinary.");
            }
        } catch (error) {
            console.error("Upload process failed:", error);
            alert("Something went wrong during upload.");
        } finally {
            setIsUploading(false);
            // Reset the input
            e.target.value = "";
        }
    };

    // --- Drag and Drop Reordering ---
    const handleDragStart = (e: React.DragEvent, index: number) => {
        if (selectedIds.length > 0) return; // Disable drag during selection
        setDraggedIdx(index);
        e.dataTransfer.effectAllowed = "move";
        setTimeout(() => {
            const el = document.getElementById(`grid-item-${index}`);
            if (el) el.classList.add("opacity-50");
        }, 0);
    };

    const handleDragEnd = (index: number) => {
        setDraggedIdx(null);
        const el = document.getElementById(`grid-item-${index}`);
        if (el) el.classList.remove("opacity-50");
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        if (draggedIdx === null || draggedIdx === index) return;

        const newImages = [...images];
        const draggedImage = newImages[draggedIdx];
        newImages.splice(draggedIdx, 1);
        newImages.splice(index, 0, draggedImage);

        setDraggedIdx(index);
        setImages(newImages);
    };

    const saveNewOrder = async () => {
        setIsSavingOrder(true);
        const updates = images.map((img, idx) => ({ id: img._id, order: idx }));
        const res = await updateImageOrder(updates);
        if (res.success) {
            const reordered = images.map((img, idx) => ({ ...img, order: idx }));
            setImages(reordered);
            router.refresh();
        } else {
            alert(res.message);
        }
        setIsSavingOrder(false);
    };

    // --- Selection Logic ---
    const toggleSelect = (id: string, e?: React.MouseEvent) => {
        // If clicking the selection checkbox/icon or if we are in "selection mode"
        if (e) {
            e.stopPropagation();
        }
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const selectAll = () => {
        if (selectedIds.length === images.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(images.map(img => img._id));
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        if (!confirm(`Are you sure you want to delete ${selectedIds.length} images?`)) return;

        setIsDeletingBulk(true);
        try {
            const res = await deleteGalleryImages(selectedIds);
            if (res.success) {
                setImages(prev => prev.filter(img => !selectedIds.includes(img._id)));
                setSelectedIds([]);
                router.refresh();
            } else {
                alert(res.message);
            }
        } catch (err) {
            alert("Bulk delete failed");
        } finally {
            setIsDeletingBulk(false);
        }
    };

    // --- Actions ---
    const handleToggleStatus = async (id: string, currentStatus: boolean, e: React.MouseEvent) => {
        e.stopPropagation();
        const optimistic = images.map(img => img._id === id ? { ...img, isActive: !img.isActive } : img);
        setImages(optimistic);
        await toggleGalleryImageStatus(id, currentStatus);
        router.refresh();
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to permanently delete this image from the gallery?")) return;
        setImages(images.filter(img => img._id !== id));
        await deleteGalleryImage(id);
        router.refresh();
    };

    const hasOrderChanged = !images.every((img, idx) => img.order === idx);

    return (
        <div className="space-y-6">

            {/* Header Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-border">
                <div className="flex flex-wrap items-center gap-4">
                    <label className="relative cursor-pointer bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl font-semibold shadow-md shadow-primary/20 transition-all flex items-center justify-center gap-2 overflow-hidden">
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            onChange={handleFileSelect}
                            disabled={isUploading}
                        />
                        {isUploading ? (
                            <RotateCcw className="w-5 h-5 animate-spin" />
                        ) : (
                            <Upload className="w-5 h-5" />
                        )}
                        <span>{isUploading ? "Uploading..." : "Upload Images"}</span>
                    </label>

                    <div className="h-8 w-[1px] bg-slate-200 hidden sm:block" />

                    <div className="flex items-center gap-2">
                        <button
                            onClick={selectAll}
                            className="text-sm font-medium text-slate-600 hover:text-primary flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                            {selectedIds.length === images.length && images.length > 0 ? (
                                <CheckSquare className="w-4 h-4 text-primary" />
                            ) : (
                                <Square className="w-4 h-4" />
                            )}
                            {selectedIds.length === images.length && images.length > 0 ? "Deselect All" : "Select All"}
                        </button>

                        {selectedIds.length > 0 && (
                            <button
                                onClick={handleBulkDelete}
                                disabled={isDeletingBulk}
                                className="text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors border border-red-100"
                            >
                                {isDeletingBulk ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                Delete Selected ({selectedIds.length})
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-500 font-medium hidden lg:inline">
                        {images.length} images total • {images.filter(i => i.isActive).length} active
                    </span>
                    <button
                        onClick={saveNewOrder}
                        disabled={!hasOrderChanged || isSavingOrder}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all ${hasOrderChanged
                                ? "bg-green-600 hover:bg-green-700 text-white shadow-md shadow-green-500/20"
                                : "bg-slate-100 text-slate-400 cursor-not-allowed"
                            }`}
                    >
                        {isSavingOrder ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Order
                    </button>
                </div>
            </div>

            {/* Grid Container */}
            {images.length === 0 ? (
                <div className="bg-white rounded-3xl border border-dashed border-slate-300 py-24 flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 mb-4">
                        <Upload size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-700">Gallery is empty</h3>
                    <p className="text-slate-500 mt-2">Upload your first image to begin building the homepage gallery.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                    {images.map((img, index) => {
                        const isSelected = selectedIds.includes(img._id);
                        return (
                            <div
                                key={img._id}
                                id={`grid-item-${index}`}
                                draggable={selectedIds.length === 0}
                                onDragStart={(e) => handleDragStart(e, index)}
                                onDragEnd={() => handleDragEnd(index)}
                                onDragOver={(e) => handleDragOver(e, index)}
                                onClick={() => toggleSelect(img._id)}
                                className={`group relative bg-white rounded-2xl overflow-hidden border transition-all duration-300 ${isSelected
                                        ? "border-primary ring-2 ring-primary/20 shadow-lg scale-[0.98]"
                                        : !img.isActive
                                            ? "border-red-200"
                                            : "border-border/60 shadow-sm hover:shadow-xl"
                                    } ${selectedIds.length === 0 ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"}`}
                            >
                                {/* Selection Overlay */}
                                <div className={`absolute top-3 left-3 z-[25] transition-all duration-300 ${isSelected || selectedIds.length > 0 ? "opacity-100 scale-100" : "opacity-0 scale-50 group-hover:opacity-100 group-hover:scale-100"}`}>
                                    <div className={`p-1 rounded-lg backdrop-blur-md shadow-sm border ${isSelected ? "bg-primary text-white border-primary" : "bg-white/80 text-slate-400 border-slate-200"}`}>
                                        {isSelected ? <CheckSquare size={18} /> : <Square size={18} />}
                                    </div>
                                </div>

                                {/* Drag Handle Indicator (only when no selection) */}
                                {selectedIds.length === 0 && (
                                    <div className="absolute top-3 right-3 z-20 bg-black/40 backdrop-blur-sm text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                        <GripVertical size={16} />
                                    </div>
                                )}

                                {/* Status Indicator */}
                                <div className="absolute bottom-3 left-3 z-20 bg-black/60 backdrop-blur-md text-white px-2 py-1 rounded-lg text-[10px] font-bold tracking-widest uppercase pointer-events-none">
                                    # {index + 1}
                                </div>

                                {/* Image Container */}
                                <div className={`relative aspect-square w-full bg-slate-100 transition-all duration-500 ${!img.isActive ? "opacity-40 grayscale" : ""} ${isSelected ? "brightness-90" : ""}`}>
                                    <Image
                                        src={img.imageUrl}
                                        alt="Gallery Image"
                                        fill
                                        className="object-cover"
                                    />
                                    <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent transition-opacity duration-300 ${selectedIds.length > 0 ? "opacity-0" : "opacity-0 group-hover:opacity-100"}`} />
                                </div>

                                {/* Action Overlay (only when no selection) */}
                                {selectedIds.length === 0 && (
                                    <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center justify-between translate-y-full group-hover:translate-y-0 transition-all duration-300 z-20">
                                        <button
                                            onClick={(e) => handleToggleStatus(img._id, img.isActive, e)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${img.isActive
                                                    ? "bg-amber-500/90 hover:bg-amber-600 text-white"
                                                    : "bg-green-500/90 hover:bg-green-600 text-white"
                                                }`}
                                        >
                                            {img.isActive ? "Hide" : "Show"}
                                        </button>

                                        <button
                                            onClick={(e) => handleDelete(img._id, e)}
                                            className="p-1.5 bg-red-500/90 hover:bg-red-600 text-white rounded-lg transition-colors border border-red-400/20"
                                            title="Delete Image"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Selection Status Floating Bar */}
            {selectedIds.length > 0 && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-6 border border-slate-800 backdrop-blur-lg">
                        <div className="flex flex-col">
                            <span className="text-sm font-bold">{selectedIds.length} images selected</span>
                            <span className="text-[10px] text-slate-400 uppercase tracking-wider">Bulk Actions</span>
                        </div>
                        <div className="h-8 w-[1px] bg-slate-700" />
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleBulkDelete}
                                disabled={isDeletingBulk}
                                className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-xl text-sm font-bold transition-all shadow-lg shadow-red-500/20"
                            >
                                {isDeletingBulk ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Trash2 size={16} />}
                                Delete
                            </button>
                            <button
                                onClick={() => setSelectedIds([])}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-bold transition-all"
                            >
                                <X size={16} />
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
