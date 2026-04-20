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
  title: "Terms and Returns | Clarke & Coleman Pharmacy",
  description:
    "Terms, conditions, and return/refund policy details for Clarke & Coleman Pharmacy appointments and products.",
};

export default function TermsPage() {
  const returnPolicy = policies.returnPolicy as PolicyBlock;

  return (
    <main className="bg-background min-h-screen py-12 sm:py-16">
      <div className="section-container section-padding max-w-5xl">
        <Breadcrumb items={[{ label: "Terms & Conditions" }]} />

        <div className="mt-6 mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-text-primary">Terms, Returns and Refunds</h1>
          <p className="mt-3 text-text-secondary">
            Effective date: {policies.effectiveDate}. These terms apply to product purchases and appointment bookings.
          </p>
        </div>

        <section className="bg-white rounded-2xl border border-border/60 p-6 sm:p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-text-primary">{returnPolicy.title}</h2>
          <p className="mt-3 text-text-secondary leading-relaxed">{returnPolicy.summary}</p>

          <div className="mt-6 space-y-6">
            {returnPolicy.sections.map((section) => (
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

          <div className="mt-8 p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-text-secondary">
            For return or refund support, email {policies.contact.email} and include your order or appointment reference.
          </div>
        </section>
      </div>
    </main>
  );
}
