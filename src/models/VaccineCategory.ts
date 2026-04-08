import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IVaccineCategory extends Document {
    name: string;
    slug: string;
    createdAt: Date;
    updatedAt: Date;
}

const vaccineCategorySchema = new Schema<IVaccineCategory>(
    {
        name: { type: String, required: true },
        slug: { type: String, required: true, unique: true },
    },
    { timestamps: true }
);

const VaccineCategory: Model<IVaccineCategory> = mongoose.models.VaccineCategory || mongoose.model<IVaccineCategory>('VaccineCategory', vaccineCategorySchema);

export default VaccineCategory;
