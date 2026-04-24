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
  title: "Refund & Returns Policy | Clarke & Coleman Pharmacy",
  description:
    "Refund, returns, and exchange policy information for Clarke & Coleman Pharmacy.",
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

export default function RefundPage() {
  return (
    <main className="bg-background min-h-screen py-12 sm:py-16">
      <div className="section-container section-padding max-w-5xl">
        <Breadcrumb items={[{ label: "Refund Policy" }]} />

        <div className="mt-6 mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-text-primary">Refund & Returns Policy</h1>
          <p className="mt-3 text-text-secondary">
            Last Reviewed: {policies.effectiveDate}. If you have questions, contact us at {policies.contact.email}.
          </p>
        </div>

        <div className="space-y-6">
          <PolicyCard policy={policies.refundPolicy as PolicyBlock} />
          
          <div className="bg-primary/5 rounded-2xl p-8 border border-primary/10">
            <h3 className="text-xl font-bold text-primary mb-4">Contact Information</h3>
            <div className="grid sm:grid-cols-2 gap-6 text-sm">
              <div>
                <p className="text-text-muted uppercase tracking-wider text-[10px] font-bold mb-1">Pharmacy Name</p>
                <p className="font-semibold text-text-primary">{policies.organization}</p>
              </div>
              <div>
                <p className="text-text-muted uppercase tracking-wider text-[10px] font-bold mb-1">Email Address</p>
                <p className="font-semibold text-text-primary">{policies.contact.email}</p>
              </div>
              <div>
                <p className="text-text-muted uppercase tracking-wider text-[10px] font-bold mb-1">Telephone</p>
                <p className="font-semibold text-text-primary">{policies.contact.phone}</p>
              </div>
              <div>
                <p className="text-text-muted uppercase tracking-wider text-[10px] font-bold mb-1">Address</p>
                <p className="font-semibold text-text-primary">{policies.contact.address}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
