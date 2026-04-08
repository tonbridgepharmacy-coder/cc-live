"use client";

import { useState } from "react";
import Image from "next/image";
import { Upload, Trash2, GripVertical, Save, CheckCircle2, RotateCcw } from "lucide-react";
import { uploadImage } from "@/lib/actions/upload"; // Existing generic Cloudinary upload
import { uploadGalleryImage, updateImageOrder, toggleGalleryImageStatus, deleteGalleryImage } from "@/lib/actions/gallery";
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
        [...initialImages].sort((a, b) => a.order - b.order) // Ensure initially sorted by order
    );
    const [isUploading, setIsUploading] = useState(false);
    const [isSavingOrder, setIsSavingOrder] = useState(false);
    const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

    // --- Upload Logic ---
    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            // 1. Upload to Cloudinary using existing utility
            const formData = new FormData();
            formData.append("file", file);
            const uploadRes = await uploadImage(formData);

            if (uploadRes.success && uploadRes.url) {
                // 2. Save to DB 
                const dbRes = await uploadGalleryImage({ imageUrl: uploadRes.url });
                if (dbRes.success) {
                    setImages((prev) => [...prev, dbRes.image].sort((a, b) => a.order - b.order));
                    router.refresh();
                } else {
                    alert(dbRes.message);
                }
            } else {
                alert("Cloudinary upload failed.");
            }
        } catch (error) {
            console.error("Upload process failed:", error);
            alert("Something went wrong during upload.");
        } finally {
            setIsUploading(false);
        }
    };

    // --- Drag and Drop Reordering ---
    const handleDragStart = (e: React.DragEvent, index: number) => {
        setDraggedIdx(index);
        e.dataTransfer.effectAllowed = "move";
        // Slightly delay hiding the dragged element so thumbnail works
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
        // Create payload mapping ID to its new array index
        const updates = images.map((img, idx) => ({ id: img._id, order: idx }));
        const res = await updateImageOrder(updates);
        if (res.success) {
            // Update local state order explicitly to match
            const reordered = images.map((img, idx) => ({ ...img, order: idx }));
            setImages(reordered);
            router.refresh();
        } else {
            alert(res.message);
        }
        setIsSavingOrder(false);
    };

    // --- Actions ---
    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        const optimistic = images.map(img => img._id === id ? { ...img, isActive: !img.isActive } : img);
        setImages(optimistic);
        await toggleGalleryImageStatus(id, currentStatus);
        router.refresh();
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to permanently delete this image from the gallery?")) return;
        setImages(images.filter(img => img._id !== id));
        await deleteGalleryImage(id);
        router.refresh();
    };

    // Check if order has changed from original
    const hasOrderChanged = !images.every((img, idx) => img.order === idx);

    return (
        <div className="space-y-6">

            {/* Header Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-border">
                <div className="flex items-center gap-4">
                    <label className="relative cursor-pointer bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl font-semibold shadow-md shadow-primary/20 transition-all flex items-center justify-center gap-2 overflow-hidden">
                        <input
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            onChange={handleFileSelect}
                            disabled={isUploading}
                        />
                        {isUploading ? (
                            <RotateCcw className="w-5 h-5 animate-spin" />
                        ) : (
                            <Upload className="w-5 h-5" />
                        )}
                        <span>{isUploading ? "Uploading..." : "Upload Image"}</span>
                    </label>
                    <span className="text-sm text-slate-500 font-medium">
                        {images.length} images total • {images.filter(i => i.isActive).length} active
                    </span>
                </div>

                <div className="flex items-center gap-3">
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
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {images.map((img, index) => (
                        <div
                            key={img._id}
                            id={`grid-item-${index}`}
                            draggable
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragEnd={() => handleDragEnd(index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            className={`group relative bg-white rounded-2xl overflow-hidden border ${!img.isActive ? "border-red-200" : "border-border/60"
                                } shadow-sm hover:shadow-xl transition-all cursor-grab active:cursor-grabbing`}
                        >
                            {/* Drag Handle Indicator */}
                            <div className="absolute top-2 left-2 z-20 bg-black/60 backdrop-blur-sm text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                <GripVertical size={16} />
                            </div>

                            {/* Status Indicator */}
                            <div className="absolute top-2 right-2 z-20 bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-[10px] font-bold tracking-widest uppercase">
                                # {index + 1}
                            </div>

                            {/* Image Container */}
                            <div className={`relative aspect-square w-full bg-slate-100 ${!img.isActive ? "opacity-40 grayscale" : ""}`}>
                                <Image
                                    src={img.imageUrl}
                                    alt="Gallery Image"
                                    fill
                                    className="object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>

                            {/* Action Overlay */}
                            <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center justify-between translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-20">
                                <button
                                    onClick={() => handleToggleStatus(img._id, img.isActive)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${img.isActive
                                            ? "bg-amber-500/90 hover:bg-amber-600 text-white"
                                            : "bg-green-500/90 hover:bg-green-600 text-white"
                                        }`}
                                >
                                    {img.isActive ? "Hide" : "Show"}
                                </button>

                                <button
                                    onClick={() => handleDelete(img._id)}
                                    className="p-1.5 bg-red-500/90 hover:bg-red-600 text-white rounded-lg transition-colors"
                                    title="Delete Image"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
