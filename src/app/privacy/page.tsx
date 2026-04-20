import type { Metadata } from "next";
import Breadcrumb from "@/components/ui/Breadcrumb";
import policies from "@/data/policies.json";

type PolicySection = {
  heading: string;
  points: string[];
};

type PolicyBlock = {
  title: string;
  summary: string;
  sections: PolicySection[];
};

export const metadata: Metadata = {
  title: "Privacy Policy | Clarke & Coleman Pharmacy",
  description:
    "Privacy, GDPR, and data protection policy information for Clarke & Coleman Pharmacy.",
};

function PolicyCard({ policy }: { policy: PolicyBlock }) {
  return (
    <section className="bg-white rounded-2xl border border-border/60 p-6 sm:p-8 shadow-sm">
      <h2 className="text-2xl font-bold text-text-primary">{policy.title}</h2>
      <p className="mt-3 text-text-secondary leading-relaxed">{policy.summary}</p>

      <div className="mt-6 space-y-6">
        {policy.sections.map((section) => (
          <div key={section.heading}>
            <h3 className="text-lg font-semibold text-text-primary">{section.heading}</h3>
            <ul className="mt-3 space-y-2 list-disc pl-5 text-text-secondary">
              {section.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <main className="bg-background min-h-screen py-12 sm:py-16">
      <div className="section-container section-padding max-w-5xl">
        <Breadcrumb items={[{ label: "Privacy Policy" }]} />

        <div className="mt-6 mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-text-primary">Privacy and Data Protection</h1>
          <p className="mt-3 text-text-secondary">
            Effective date: {policies.effectiveDate}. If you have questions, contact us at {policies.contact.email}.
          </p>
        </div>

        <div className="space-y-6">
          <PolicyCard policy={policies.privacyPolicy as PolicyBlock} />
          <PolicyCard policy={policies.gdprPolicy as PolicyBlock} />
          <PolicyCard policy={policies.dataProtectionPolicy as PolicyBlock} />
        </div>
      </div>
    </main>
  );
}
