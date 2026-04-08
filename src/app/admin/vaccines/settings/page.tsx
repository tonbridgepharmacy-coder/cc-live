import SettingsClient from "./SettingsClient";
import { getPageSetting } from "@/lib/actions/pageSettings";

export const dynamic = 'force-dynamic';

export default async function VaccinesSettingsPage() {
    const res = await getPageSetting('vaccines');

    // We expect getting or creating the default one to succeed
    const initialData = res.success ? res.setting : null;

    return <SettingsClient initialData={initialData} pageId="vaccines" />;
}
