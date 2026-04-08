import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IJobApplication extends Document {
    job: mongoose.Types.ObjectId;
    fullName: string;
    email: string;
    phone: string;
    resumeUrl: string;
    coverLetter?: string;
    status: 'new' | 'reviewed' | 'rejected' | 'hired';
    appliedDate: Date;
    createdAt: Date;
    updatedAt: Date;
}

const jobApplicationSchema = new Schema<IJobApplication>(
    {
        job: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
        fullName: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
        resumeUrl: { type: String, required: true },
        coverLetter: { type: String },
        status: { type: String, enum: ['new', 'reviewed', 'rejected', 'hired'], default: 'new' },
        appliedDate: { type: Date, default: Date.now }
    },
    { timestamps: true }
);

const JobApplication: Model<IJobApplication> = mongoose.models.JobApplication || mongoose.model<IJobApplication>('JobApplication', jobApplicationSchema);

export default JobApplication;
