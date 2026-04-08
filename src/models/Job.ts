import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IJob extends Document {
    title: string;
    slug: string;
    department: string;
    location: string;
    type: 'Full-time' | 'Part-time' | 'Contract';
    jobId: string;
    aboutRole: string;
    requirements: string;
    status: 'Active' | 'Closed';
    postedDate: Date;
    createdAt: Date;
    updatedAt: Date;
}

const jobSchema = new Schema<IJob>(
    {
        title: { type: String, required: true },
        slug: { type: String, required: true, unique: true },
        department: { type: String, required: true },
        location: { type: String, required: true },
        type: { type: String, enum: ['Full-time', 'Part-time', 'Contract'], required: true },
        jobId: { type: String, required: true, unique: true },
        aboutRole: { type: String, required: true },
        requirements: { type: String, required: true },
        status: { type: String, enum: ['Active', 'Closed'], default: 'Active' },
        postedDate: { type: Date, default: Date.now }
    },
    { timestamps: true }
);

const Job: Model<IJob> = mongoose.models.Job || mongoose.model<IJob>('Job', jobSchema);

export default Job;
