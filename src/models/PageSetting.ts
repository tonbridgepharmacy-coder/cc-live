import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IPageSetting extends Document {
    pageId: string;
    bannerImage: string;
    bannerText: string;
    createdAt: Date;
    updatedAt: Date;
}

const pageSettingSchema = new Schema<IPageSetting>(
    {
        pageId: { type: String, required: true, unique: true, index: true },
        bannerImage: { type: String, required: true },
        bannerText: { type: String, required: true },
    },
    { timestamps: true }
);

const PageSetting: Model<IPageSetting> = mongoose.models.PageSetting || mongoose.model<IPageSetting>('PageSetting', pageSettingSchema);

export default PageSetting;
