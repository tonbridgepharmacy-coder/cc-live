"use client";

import { useState } from "react";
import { updatePageSetting } from "@/lib/actions/pageSettings";
import { IPageSetting } from "@/models/PageSetting";
import { Loader2, Save, ImageIcon } from "lucide-react";

export default function SettingsClient({ initialData, pageId }: { initialData: IPageSetting | null, pageId: string }) {
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [formData, setFormData] = useState({
        bannerImage: initialData?.bannerImage || '',
        bannerText: initialData?.bannerText || ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');

        const res = await updatePageSetting(pageId, formData);
        if (res.success) {
            setMessage('Settings saved successfully!');
            setTimeout(() => setMessage(''), 3000);
        } else {
            setMessage(`Error: ${res.error}`);
        }
        setIsLoading(false);
    };

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Vaccine Page Settings</h1>
                <p className="mt-2 text-gray-600">
                    Control the main banner image and text for the public-facing vaccines page.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-8">
                {/* Banner Text */}
                <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-900">
                        Main Banner Text
                    </label>
                    <input
                        type="text"
                        required
                        value={formData.bannerText}
                        onChange={(e) => setFormData({ ...formData, bannerText: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white"
                        placeholder="e.g., Protect Yourself and Your Loved Ones"
                    />
                </div>

                {/* Banner Image URL */}
                <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-900">
                        Banner Image (URL)
                    </label>
                    <div className="flex gap-3">
                        <div className="relative flex-grow">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <ImageIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="url"
                                required
                                value={formData.bannerImage}
                                onChange={(e) => setFormData({ ...formData, bannerImage: e.target.value })}
                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white"
                                placeholder="https://example.com/banner.jpg"
                            />
                        </div>
                    </div>
                </div>

                {/* Image Preview */}
                {formData.bannerImage && (
                    <div className="mt-6 aspect-[21/9] relative rounded-xl overflow-hidden border border-gray-100 shadow-inner bg-gray-50">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={formData.bannerImage}
                            alt="Banner Preview"
                            className="w-full h-full object-cover"
                            onError={(e) => (e.currentTarget.src = "/placeholder-image.jpg")}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-end p-8">
                            <h2 className="text-3xl font-bold text-white max-w-2xl">{formData.bannerText || 'Preview Text'}</h2>
                        </div>
                    </div>
                )}

                <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                    <span className={`text-sm font-medium ${message.includes('Error') ? 'text-red-500' : 'text-green-600'}`}>
                        {message}
                    </span>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        Save Settings
                    </button>
                </div>
            </form>
        </div>
    );
}
