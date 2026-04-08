import Link from "next/link";
import { siteConfig } from "@/config/site";
import {
  testimonials,
} from "@/lib/mock-data";
import { getGalleryImages } from "@/lib/actions/gallery";

// ─── Inline Icons ────────────────────────────
const ArrowRight = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
  </svg>
);

const CheckCircle = () => (
  <svg className="w-5 h-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const Star = () => (
  <svg className="w-4 h-4 text-accent" fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const ShieldIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const HeartIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// ─── Section Heading Component ───────────────
function SectionHeading({
  badge,
  title,
  description,
  align = "center",
}: {
  badge?: string;
  title: string;
  description?: string;
  align?: "center" | "left";
}) {
  return (
    <div className={`mb-12 ${align === "center" ? "text-center" : "text-left"}`}>
      {badge && (
        <span className="inline-block bg-primary/10 text-primary text-xs font-semibold tracking-wider uppercase px-3.5 py-1.5 rounded-full mb-4">
          {badge}
        </span>
      )}
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-primary leading-tight">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-text-secondary text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════
// HOME PAGE
// ═══════════════════════════════════════════════
export default async function HomePage() {

  const publishedTestimonials = testimonials.filter((t) => t.isPublished);

  // Fetch Gallery Images
  const galleryRes = await getGalleryImages({ activeOnly: true, limit: 8 });
  const galleryImages = galleryRes.success ? galleryRes.images : [];

  return (
    <>
      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden pt-28 sm:pt-36 lg:pt-40 pb-20 lg:pb-28">
        {/* Gradient Background — only hero */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#2F6CCF]/8 via-white to-[#2FAE66]/6" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-secondary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />

        <div className="relative section-container section-padding">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur border border-border rounded-full px-4 py-2 mb-8 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                <span className="text-xs font-medium text-text-secondary">
                  GPhC Registered Pharmacy
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-[3.4rem] font-bold text-text-primary leading-[1.15] mb-6 tracking-tight">
                Your Trusted Partner in{" "}
                <span className="text-primary">Health</span> &{" "}
                <span className="text-secondary">Wellness</span>
              </h1>

              <p className="text-base sm:text-lg text-text-secondary leading-relaxed mb-8 max-w-md">
                Expert pharmaceutical care, clinical consultations, and comprehensive
                health services — delivered with compassion and professionalism.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/book"
                  className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-light text-white px-7 py-3.5 rounded-xl text-sm font-semibold shadow-lg shadow-accent/20 hover:shadow-xl transition-all duration-200"
                >
                  Book Appointment
                  <ArrowRight />
                </Link>

              </div>

              {/* Trust Markers */}
              <div className="flex items-center gap-6 mt-10 pt-8 border-t border-border/60">
                {[
                  { num: "25+", label: "Years Experience" },
                  { num: "15k+", label: "Patients Served" },
                  { num: "4.9", label: "Google Rating" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="text-xl font-bold text-primary">{stat.num}</div>
                    <div className="text-xs text-text-muted">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Clinical Image */}
            <div className="hidden lg:block relative">
              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border border-border/30 shadow-xl group">
                <img
                  src="https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&w=1200&q=80"
                  alt="Modern Pharmacy Interior"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent pointer-events-none" />
              </div>

              {/* Floating Card */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg border border-border/60 p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <ShieldIcon />
                </div>
                <div>
                  <div className="text-sm font-semibold text-text-primary">NHS Trusted</div>
                  <div className="text-xs text-text-muted">Fully Registered</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ ABOUT PREVIEW ═══ */}
      <section className="py-20 bg-white">
        <div className="section-container section-padding">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* About Image */}
            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden border border-border/30 group">
                <img
                  src="https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&w=1200&q=80"
                  alt="Professional Pharmacist"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              {/* Experience Badge */}
              <div className="absolute -bottom-4 -right-4 bg-accent text-white rounded-2xl p-5 shadow-xl shadow-accent/20">
                <div className="text-3xl font-bold leading-none">25+</div>
                <div className="text-xs mt-1 opacity-90">Years of<br />Excellence</div>
              </div>
            </div>

            {/* Content */}
            <div>
              <SectionHeading
                badge="About Us"
                title="Dedicated to Your Health Since 1998"
                align="left"
              />
              <p className="text-text-secondary leading-relaxed mb-6 -mt-6">
                Clarke & Coleman Pharmacy has been a cornerstone of community healthcare
                in the UK for over two decades. Our team of expert pharmacists and
                healthcare professionals are committed to delivering the highest
                standard of pharmaceutical care.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "GPhC registered pharmacists",
                  "Comprehensive travel health services",
                  "Private clinical consultations",
                  "NHS-aligned healthcare standards",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-text-secondary">
                    <CheckCircle />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-primary font-semibold text-sm hover:gap-3 transition-all duration-200"
              >
                Learn more about us
                <ArrowRight />
              </Link>
            </div>
          </div>
        </div>
      </section>





      {/* ═══ WHY CHOOSE US ═══ */}
      <section className="py-20 bg-background">
        <div className="section-container section-padding">
          <SectionHeading
            badge="Why Clarke & Coleman"
            title="Why Patients Choose Us"
            description="We combine clinical excellence with compassionate care to deliver the best possible health outcomes."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: <ShieldIcon />,
                title: "GPhC Registered",
                description: "All our pharmacists are registered with the General Pharmaceutical Council.",
              },
              {
                icon: <HeartIcon />,
                title: "Patient First",
                description: "Compassionate, personalised care tailored to your individual health needs.",
              },
              {
                icon: <UsersIcon />,
                title: "Expert Team",
                description: "Qualified pharmacists and healthcare professionals with decades of experience.",
              },
              {
                icon: <ClockIcon />,
                title: "Convenient Hours",
                description: "Extended opening hours and online booking for your convenience.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white rounded-xl border border-border/60 p-6 text-center hover:shadow-md transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-5">
                  {item.icon}
                </div>
                <h3 className="font-semibold text-text-primary text-sm mb-2">
                  {item.title}
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* ═══ TESTIMONIALS ═══ */}
      <section className="py-20 bg-background">
        <div className="section-container section-padding">
          <SectionHeading
            badge="Patient Reviews"
            title="What Our Patients Say"
            description="We're proud of the trust our patients place in us. Here's what they have to say."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {publishedTestimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-white rounded-xl border border-border/60 p-6 hover:shadow-md transition-all duration-300"
              >
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} />
                  ))}
                </div>
                <p className="text-sm text-text-secondary leading-relaxed mb-5 line-clamp-4">
                  &ldquo;{testimonial.content}&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-border/40">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs">
                    {testimonial.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-text-primary">
                      {testimonial.name}
                    </div>
                    {testimonial.role && (
                      <div className="text-xs text-text-muted">{testimonial.role}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ GALLERY ═══ */}
      <section className="py-20 bg-white">
        <div className="section-container section-padding">
          <SectionHeading
            badge="Our Pharmacy"
            title="Inside Clarke & Coleman"
            description="Take a look inside our modern, purpose-built pharmacy facilities."
          />

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {galleryImages.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-500">
                Gallery images will appear here once added from the admin dashboard.
              </div>
            ) : (
              galleryImages.map((img: any, i: number) => (
                <div
                  key={img._id}
                  className={`relative rounded-xl overflow-hidden border border-border/30 group cursor-pointer ${i === 0 ? "col-span-2 row-span-2" : ""
                    } ${i === 5 ? "col-span-2" : ""}`}
                >
                  <img
                    src={img.imageUrl}
                    alt={img.caption || `Pharmacy Gallery ${i + 1}`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/20 transition-all duration-300 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100 shadow-lg flex-col gap-1">
                      <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ═══ MAP & CTA ═══ */}
      <section className="py-20 bg-background">
        <div className="section-container section-padding">
          <div className="grid lg:grid-cols-2 gap-10">
            {/* Google Map Embed Placeholder */}
            <div className="rounded-2xl overflow-hidden border border-border/30 shadow-sm">
              <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-text-muted">
                <div className="text-center">
                  <svg className="w-12 h-12 mx-auto mb-3 text-text-muted/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-sm">Google Map Embed</span>
                  <br />
                  <span className="text-xs">Configurable from Admin</span>
                </div>
              </div>
            </div>

            {/* Final CTA */}
            <div className="flex flex-col justify-center">
              <SectionHeading
                badge="Get in Touch"
                title="Ready to Take the Next Step?"
                description="Book a consultation with our expert team today. We're here to support your health journey."
                align="left"
              />
              <div className="-mt-4 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs text-text-muted">Call us</div>
                    <a href={`tel:${siteConfig.phone}`} className="font-semibold text-text-primary hover:text-primary transition-colors">
                      {siteConfig.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs text-text-muted">Email</div>
                    <a href={`mailto:${siteConfig.email}`} className="font-semibold text-text-primary hover:text-primary transition-colors">
                      {siteConfig.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <ClockIcon />
                  </div>
                  <div>
                    <div className="text-xs text-text-muted">Opening Hours</div>
                    <div className="font-semibold text-text-primary text-sm">
                      {siteConfig.openingHours}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <Link
                  href="/book"
                  className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-light text-white px-7 py-3.5 rounded-xl text-sm font-semibold shadow-lg shadow-accent/20 hover:shadow-xl transition-all"
                >
                  Book Appointment
                </Link>
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-text-primary px-6 py-3 rounded-xl text-sm font-semibold border border-border shadow-sm transition-all"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ NEWSLETTER ═══ */}
      <section className="py-16 bg-primary relative">
        <div className="section-container section-padding">
          {/* Same inner content */}
          <div className="text-center max-w-xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-3">
              Stay Updated with Health Tips
            </h2>
            <p className="text-sm text-white/70 mb-8">
              Subscribe to our newsletter for the latest health advice, pharmacy updates,
              and exclusive offers.
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 text-sm focus:outline-none focus:border-white/50 transition-colors"
              />
              <button
                type="submit"
                className="bg-accent hover:bg-accent-light text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
            <p className="text-xs text-white/40 mt-4">
              By subscribing you agree to our Privacy Policy. Unsubscribe anytime.
            </p>
          </div>
        </div>
        <a href="https://www.techservenexus.com" target="_blank" className="absolute bottom-2 right-4 text-[10px] text-white/5 hover:text-white/20 select-none pointer-events-auto">Techserve Nexus</a>
      </section>
    </>
  );
}
