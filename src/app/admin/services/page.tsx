import { getServices } from "@/lib/actions/service";
import ServicesClient from "./ServicesClient";

export const dynamic = 'force-dynamic';

export default async function AdminServicesPage() {
    const res = await getServices();
    const services = res.success ? res.services : [];

    return <ServicesClient services={services} />;
}
