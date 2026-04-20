"use client";

import locationData from "@/data/location.json";

interface LocationMapProps {
  variant?: "landing" | "about";
}

// ─── Icons ────────────────────────────────────
const PhoneIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const MapPinIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const DirectionsIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg className="w-4 h-4 opacity-60 group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
  </svg>
);

const MapsLogoIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
  </svg>
);

// ─── Component ───────────────────────────────
export default function LocationMap({ variant = "landing" }: LocationMapProps) {
  const isAbout = variant === "about";
  const { badge, tagline, description, mapEmbedUrl, mapsLink, iframeTitle, mapLabelPill, address, phone, hours, cta } = locationData;

  return (
    <section className={`relative overflow-hidden ${isAbout ? "py-24 bg-background" : "py-20 bg-background"}`}>
      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-secondary/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none" />

      <div className="relative section-container section-padding">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="inline-block bg-primary/10 text-primary text-xs font-semibold tracking-wider uppercase px-3.5 py-1.5 rounded-full mb-4">
            {badge}
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-primary leading-tight">
            {tagline}
          </h2>
          <p className="mt-4 text-text-secondary text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            {description}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 items-stretch">
          {/* ── Map Embed ── */}
          <div className="lg:col-span-2 relative rounded-2xl overflow-hidden border border-border/40 shadow-lg group min-h-[380px]">
            {/* Floating pill */}
            <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm border border-border/60 rounded-full px-3 py-1.5 flex items-center gap-2 shadow-sm text-xs font-medium text-text-secondary">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              {mapLabelPill}
            </div>

            <iframe
              title={iframeTitle}
              src={mapEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: "380px" }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full"
            />

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-all duration-500 pointer-events-none" />
          </div>

          {/* ── Info Card ── */}
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-2xl border border-border/50 p-6 shadow-sm hover:shadow-md transition-shadow duration-300 flex-1">

              {/* Address */}
              <div className="flex items-start gap-4 mb-5">
                <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                  <MapPinIcon />
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary mb-1">{address.label}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {address.line1}<br />
                    {address.line2}<br />
                    {address.line3}
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-4 pt-4 border-t border-border/50 mb-4">
                <div className="w-11 h-11 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                  <PhoneIcon />
                </div>
                <div>
                  <p className="text-xs text-text-muted mb-0.5">{phone.label}</p>
                  <a
                    href={phone.href}
                    className="text-sm font-semibold text-text-primary hover:text-primary transition-colors"
                  >
                    {phone.display}
                  </a>
                </div>
              </div>

              {/* Hours */}
              <div className="flex items-center gap-4 pt-4 border-t border-border/50">
                <div className="w-11 h-11 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
                  <ClockIcon />
                </div>
                <div>
                  <p className="text-xs text-text-muted mb-0.5">{hours.label}</p>
                  <p className="text-sm font-semibold text-text-primary">{hours.weekdays}</p>
                  <p className="text-xs text-text-muted">{hours.saturday}</p>
                </div>
              </div>
            </div>

            {/* Get Directions CTA */}
            <a
              href={mapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center gap-2.5 bg-primary hover:bg-primary/90 text-white px-6 py-4 rounded-2xl text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
            >
              <DirectionsIcon />
              <span>{cta.directions}</span>
              <ArrowRightIcon />
            </a>

            {/* Open in Google Maps */}
            <a
              href={mapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-text-primary border border-border px-6 py-3.5 rounded-2xl text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200"
            >
              <MapsLogoIcon />
              {cta.openInMaps}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
