import { getJobs } from "@/lib/actions/job";
import { getApplications } from "@/lib/actions/jobApplication";
import CareerDashboardClient from "./CareerDashboardClient";

export const dynamic = 'force-dynamic';

export default async function CareersAdminPage() {
    const jobsRes = await getJobs();
    const appsRes = await getApplications();

    const jobs = jobsRes.success ? jobsRes.jobs : [];
    const applications = appsRes.success ? appsRes.applications : [];

    return <CareerDashboardClient jobs={jobs} applications={applications} />;
}
