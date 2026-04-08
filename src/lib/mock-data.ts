// =============================================
// Clarke & Coleman Pharmacy — Mock Database
// =============================================
// Simulates MongoDB collections with local JSON data.
// Easy to swap with Mongoose later.

import type {
    ServiceCategory,
    Service,
    Vaccine,
    Blog,
    Testimonial,
    GalleryImage,
    JobListing,
} from "@/types";

// ─── Service Categories ──────────────────────
export const serviceCategories: ServiceCategory[] = [
    {
        id: "cat-1",
        name: "Travel Vaccines",
        slug: "travel-vaccines",
        description:
            "Comprehensive travel vaccination services tailored to your destination.",
        icon: "✈️",
        order: 1,
        isActive: true,
        createdAt: "2025-01-01",
        updatedAt: "2025-01-01",
    },
    {
        id: "cat-2",
        name: "Travel Clinic",
        slug: "travel-clinic",
        description:
            "Expert travel health consultations and preventive care services.",
        icon: "🌍",
        order: 2,
        isActive: true,
        createdAt: "2025-01-01",
        updatedAt: "2025-01-01",
    },
    {
        id: "cat-3",
        name: "Private Vaccines",
        slug: "private-vaccines",
        description:
            "Private vaccination services for individuals and families.",
        icon: "💉",
        order: 3,
        isActive: true,
        createdAt: "2025-01-01",
        updatedAt: "2025-01-01",
    },
    {
        id: "cat-4",
        name: "Ear Wax Removal",
        slug: "ear-wax-removal",
        description:
            "Safe, professional ear wax removal using clinically approved methods.",
        icon: "👂",
        order: 4,
        isActive: true,
        createdAt: "2025-01-01",
        updatedAt: "2025-01-01",
    },
    {
        id: "cat-5",
        name: "Weight Loss Clinic",
        slug: "weight-loss-clinic",
        description:
            "Evidence-based weight management programmes with ongoing support.",
        icon: "⚖️",
        order: 5,
        isActive: true,
        createdAt: "2025-01-01",
        updatedAt: "2025-01-01",
    },
    {
        id: "cat-6",
        name: "Skin Care",
        slug: "skin-care",
        description:
            "Clinical skincare treatments and dermatological consultations.",
        icon: "✨",
        order: 6,
        isActive: true,
        createdAt: "2025-01-01",
        updatedAt: "2025-01-01",
    },
    {
        id: "cat-7",
        name: "B12 Wellness",
        slug: "b12-wellness",
        description:
            "Vitamin B12 injections and wellness support programmes.",
        icon: "💪",
        order: 7,
        isActive: true,
        createdAt: "2025-01-01",
        updatedAt: "2025-01-01",
    },
    {
        id: "cat-8",
        name: "Aesthetics",
        slug: "aesthetics",
        description:
            "Professional aesthetic treatments including dermal fillers and skin boosters.",
        icon: "💎",
        order: 8,
        isActive: true,
        createdAt: "2025-01-01",
        updatedAt: "2025-01-01",
    },
    {
        id: "cat-9",
        name: "Hormone Replacement Therapy",
        slug: "hormone-replacement-therapy",
        description:
            "Personalised HRT consultations and treatment plans.",
        icon: "🧬",
        order: 9,
        isActive: true,
        createdAt: "2025-01-01",
        updatedAt: "2025-01-01",
    },
];

// ─── Services ────────────────────────────────
export const services: Service[] = [
    {
        id: "svc-1",
        categoryId: "cat-1",
        title: "Hepatitis A Vaccination",
        slug: "hepatitis-a-vaccination",
        shortDescription:
            "Protect yourself against Hepatitis A before travelling to high-risk regions.",
        content:
            "Hepatitis A is a viral liver disease that can cause mild to severe illness. Our expert pharmacists provide the full course of Hepatitis A vaccinations with thorough pre-travel health advice.",
        procedure:
            "Consultation → Risk assessment → Vaccination administered → Follow-up appointment scheduled.",
        benefits: [
            "Protection for up to 25 years",
            "WHO-approved vaccines",
            "Expert pharmacist administration",
            "Certificate of vaccination provided",
        ],
        pricing: "From £45 per dose",
        isActive: true,
        order: 1,
        createdAt: "2025-01-01",
        updatedAt: "2025-01-01",
    },
    {
        id: "svc-2",
        categoryId: "cat-2",
        title: "Pre-Travel Health Consultation",
        slug: "pre-travel-health-consultation",
        shortDescription:
            "Comprehensive travel health assessment tailored to your destination.",
        content:
            "Our travel clinic offers thorough pre-travel consultations covering required and recommended vaccinations, malaria prophylaxis, altitude sickness prevention, and destination-specific health advice.",
        procedure:
            "Online booking → Health questionnaire → Face-to-face consultation → Personalised travel health plan.",
        benefits: [
            "Destination-specific advice",
            "Full vaccination schedule planning",
            "Anti-malarial prescriptions",
            "Travel health certificate",
        ],
        pricing: "From £30 consultation fee",
        isActive: true,
        order: 1,
        createdAt: "2025-01-01",
        updatedAt: "2025-01-01",
    },
    {
        id: "svc-3",
        categoryId: "cat-4",
        title: "Microsuction Ear Wax Removal",
        slug: "microsuction-ear-wax-removal",
        shortDescription:
            "Safe and gentle ear wax removal using microsuction technology.",
        content:
            "Microsuction is the gold standard in ear wax removal. Our trained specialists use a gentle suction device under direct visualisation to safely remove excess ear wax without any water irrigation.",
        procedure:
            "Ear examination → Microsuction procedure → Post-procedure check → Aftercare advice.",
        benefits: [
            "No water used — dry and comfortable",
            "Immediate results",
            "Performed by trained specialists",
            "Suitable for all ages",
        ],
        pricing: "£45 for one ear, £65 for both",
        isActive: true,
        order: 1,
        createdAt: "2025-01-01",
        updatedAt: "2025-01-01",
    },
    {
        id: "svc-4",
        categoryId: "cat-5",
        title: "Medicated Weight Loss Programme",
        slug: "medicated-weight-loss-programme",
        shortDescription:
            "Clinically supervised weight management with prescription support.",
        content:
            "Our weight loss clinic offers a comprehensive, evidence-based programme combining lifestyle counselling, dietary planning, and where clinically appropriate, prescription weight loss medication under pharmacist supervision.",
        procedure:
            "BMI assessment → Health screening → Treatment plan → Regular follow-ups.",
        benefits: [
            "Clinically supervised programme",
            "Prescription medications where appropriate",
            "Personalised meal and exercise plans",
            "Ongoing pharmacist support",
        ],
        pricing: "From £99 initial consultation",
        isActive: true,
        order: 1,
        createdAt: "2025-01-01",
        updatedAt: "2025-01-01",
    },
    {
        id: "svc-5",
        categoryId: "cat-6",
        title: "Dermatology Consultation",
        slug: "dermatology-consultation",
        shortDescription:
            "Expert skin assessments and personalised treatment plans.",
        content:
            "Our skin clinic provides thorough dermatological consultations for acne, eczema, psoriasis, pigmentation, and age-related skin concerns. We offer prescription-strength treatments and advanced skincare protocols.",
        procedure:
            "Skin analysis → Diagnosis → Treatment plan → Follow-up review.",
        benefits: [
            "Expert clinical assessment",
            "Prescription-grade treatments",
            "Personalised skincare protocols",
            "Follow-up monitoring",
        ],
        pricing: "From £75 per consultation",
        isActive: true,
        order: 1,
        createdAt: "2025-01-01",
        updatedAt: "2025-01-01",
    },
    {
        id: "svc-6",
        categoryId: "cat-7",
        title: "B12 Injection Programme",
        slug: "b12-injection-programme",
        shortDescription:
            "Boost your energy and wellbeing with vitamin B12 injections.",
        content:
            "Vitamin B12 is essential for nerve health, energy production, and red blood cell formation. Our B12 injection programme provides rapid absorption and noticeable benefits, ideal for those with dietary deficiencies or absorption issues.",
        procedure:
            "Health assessment → Blood test (if required) → B12 injection → Wellness review.",
        benefits: [
            "Rapid energy boost",
            "Improved mood and concentration",
            "Supports nerve and blood health",
            "Quick and painless procedure",
        ],
        pricing: "From £35 per injection",
        isActive: true,
        order: 1,
        createdAt: "2025-01-01",
        updatedAt: "2025-01-01",
    },
];

// ─── Vaccines ────────────────────────────────
export const vaccines: Vaccine[] = [
    {
        id: "vac-1",
        title: "Hepatitis A",
        slug: "hepatitis-a",
        realPrice: 45,
        crossPrice: 60,
        about:
            "Hepatitis A is a highly contagious liver infection caused by the hepatitis A virus. Vaccination is recommended for travellers to endemic areas.",
        benefits: [
            "Long-lasting immunity (up to 25 years)",
            "Safe and well-tolerated",
            "Single dose provides rapid protection",
        ],
        riskIfDelayed:
            "Travellers to high-risk areas without vaccination face severe liver disease risk.",
        isActive: true,
        createdAt: "2025-01-01",
        updatedAt: "2025-01-01",
    },
    {
        id: "vac-2",
        title: "Hepatitis B",
        slug: "hepatitis-b",
        realPrice: 40,
        crossPrice: 55,
        about:
            "Hepatitis B is a potentially life-threatening liver infection. The vaccine is safe and highly effective at preventing infection.",
        benefits: [
            "Complete protection after full course",
            "Essential for healthcare workers",
            "Protects against chronic liver disease",
        ],
        riskIfDelayed:
            "Chronic Hepatitis B can lead to cirrhosis, liver failure, and liver cancer.",
        isActive: true,
        createdAt: "2025-01-01",
        updatedAt: "2025-01-01",
    },
    {
        id: "vac-3",
        title: "Rabies",
        slug: "rabies",
        realPrice: 55,
        crossPrice: 70,
        about:
            "Rabies is a fatal viral disease transmitted through animal bites. Pre-exposure vaccination is recommended for travellers to high-risk regions.",
        benefits: [
            "Pre-exposure protection",
            "Simplifies post-exposure treatment",
            "Essential for adventure travellers",
        ],
        riskIfDelayed:
            "Rabies is almost always fatal once symptoms appear. Vaccination is critical before travel.",
        isActive: true,
        createdAt: "2025-01-01",
        updatedAt: "2025-01-01",
    },
    {
        id: "vac-4",
        title: "Japanese Encephalitis",
        slug: "japanese-encephalitis",
        realPrice: 90,
        crossPrice: 110,
        about:
            "Japanese Encephalitis is a mosquito-borne viral infection prevalent in rural Asia. The vaccine provides essential protection for travellers.",
        benefits: [
            "Protection for travellers to Asia",
            "Well-tolerated vaccine",
            "Two-dose schedule for convenience",
        ],
        riskIfDelayed:
            "Can cause severe brain inflammation with high mortality in unvaccinated individuals.",
        isActive: true,
        createdAt: "2025-01-01",
        updatedAt: "2025-01-01",
    },
    {
        id: "vac-5",
        title: "Typhoid",
        slug: "typhoid",
        realPrice: 30,
        crossPrice: 40,
        about:
            "Typhoid fever is a bacterial infection spread through contaminated food and water. Vaccination is recommended for travellers to South Asia, Africa, and Central America.",
        benefits: [
            "Quick single-dose protection",
            "Ideal for short-notice travel",
            "Up to 3 years of protection",
        ],
        riskIfDelayed:
            "Typhoid can cause prolonged high fever, organ damage, and can be life-threatening without treatment.",
        isActive: true,
        createdAt: "2025-01-01",
        updatedAt: "2025-01-01",
    },
    {
        id: "vac-6",
        title: "Flu Vaccination",
        slug: "flu-vaccination",
        realPrice: 15,
        crossPrice: 25,
        about:
            "Annual influenza vaccination is recommended for all adults, especially those in high-risk groups. Available privately throughout the year.",
        benefits: [
            "Reduces flu severity",
            "Protects vulnerable contacts",
            "Available without GP referral",
        ],
        riskIfDelayed:
            "Flu can cause severe complications including pneumonia, especially in the elderly and immunocompromised.",
        isActive: true,
        createdAt: "2025-01-01",
        updatedAt: "2025-01-01",
    },
];

// ─── Blogs ───────────────────────────────────
export const blogs: Blog[] = [
    {
        id: "blog-1",
        title: "The Importance of Travel Vaccinations",
        slug: "importance-of-travel-vaccinations",
        excerpt:
            "Planning a trip abroad? Learn why travel vaccinations are essential and which ones you might need for your destination.",
        content:
            "Travelling abroad is exciting, but it also exposes you to diseases that may not be common in the UK. Travel vaccinations are your first line of defence...",
        author: "Dr. Sarah Coleman",
        readingTime: 5,
        status: "published",
        tags: ["travel", "vaccines", "health"],
        createdAt: "2025-06-15",
        updatedAt: "2025-06-15",
    },
    {
        id: "blog-2",
        title: "Understanding Vitamin B12 Deficiency",
        slug: "understanding-vitamin-b12-deficiency",
        excerpt:
            "Feeling tired and low on energy? B12 deficiency is more common than you think. Here's what to look out for.",
        content:
            "Vitamin B12 plays a crucial role in the body's ability to produce red blood cells, DNA, and support nerve function. A deficiency can lead to anaemia, fatigue, and neurological issues...",
        author: "Dr. James Clarke",
        readingTime: 4,
        status: "published",
        tags: ["b12", "wellness", "nutrition"],
        createdAt: "2025-07-02",
        updatedAt: "2025-07-02",
    },
    {
        id: "blog-3",
        title: "Ear Wax: When to Seek Professional Removal",
        slug: "ear-wax-when-to-seek-professional-removal",
        excerpt:
            "Cotton buds do more harm than good. Learn when it's time to see a professional for ear wax removal.",
        content:
            "Ear wax is a natural substance that protects your ears from dust and bacteria. However, excessive build-up can cause hearing loss, discomfort, and even infections...",
        author: "Dr. Sarah Coleman",
        readingTime: 3,
        status: "published",
        tags: ["ear care", "health tips"],
        createdAt: "2025-08-10",
        updatedAt: "2025-08-10",
    },
];

// ─── Testimonials ────────────────────────────
export const testimonials: Testimonial[] = [
    {
        id: "test-1",
        name: "Margaret Thompson",
        role: "Patient",
        content:
            "Clarke & Coleman have been our family pharmacy for years. The staff are incredibly knowledgeable and always go above and beyond. I wouldn't trust anyone else with our health.",
        rating: 5,
        isPublished: true,
        createdAt: "2025-03-15",
    },
    {
        id: "test-2",
        name: "David Richardson",
        role: "Travel Client",
        content:
            "Visited the travel clinic before my trip to Southeast Asia. The pharmacist was thorough, professional, and made the whole vaccination process stress-free. Highly recommend!",
        rating: 5,
        isPublished: true,
        createdAt: "2025-04-22",
    },
    {
        id: "test-3",
        name: "Sofia Petrova",
        role: "B12 Wellness Client",
        content:
            "I've been getting B12 injections at Clarke & Coleman for six months now. The difference in my energy levels and overall wellbeing has been remarkable. The team are lovely.",
        rating: 5,
        isPublished: true,
        createdAt: "2025-05-08",
    },
    {
        id: "test-4",
        name: "James Owen",
        role: "Weight Loss Programme",
        content:
            "The weight loss programme here is genuinely life-changing. Proper medical supervision, realistic advice, and consistent support. I've lost 3 stone in 4 months.",
        rating: 5,
        isPublished: true,
        createdAt: "2025-06-14",
    },
];

// ─── Gallery ─────────────────────────────────
export const galleryImages: GalleryImage[] = [
    {
        id: "gal-1",
        url: "/images/gallery/pharmacy-exterior.jpg",
        alt: "Clarke & Coleman Pharmacy exterior",
        category: "Pharmacy",
        order: 1,
        createdAt: "2025-01-01",
    },
    {
        id: "gal-2",
        url: "/images/gallery/consultation-room.jpg",
        alt: "Private consultation room",
        category: "Facilities",
        order: 2,
        createdAt: "2025-01-01",
    },
    {
        id: "gal-3",
        url: "/images/gallery/team-photo.jpg",
        alt: "Our dedicated pharmacy team",
        category: "Team",
        order: 3,
        createdAt: "2025-01-01",
    },
    {
        id: "gal-4",
        url: "/images/gallery/dispensary.jpg",
        alt: "Modern dispensary area",
        category: "Pharmacy",
        order: 4,
        createdAt: "2025-01-01",
    },
    {
        id: "gal-5",
        url: "/images/gallery/travel-clinic.jpg",
        alt: "Travel clinic consultation",
        category: "Services",
        order: 5,
        createdAt: "2025-01-01",
    },
    {
        id: "gal-6",
        url: "/images/gallery/skin-clinic.jpg",
        alt: "Skin clinic treatment room",
        category: "Services",
        order: 6,
        createdAt: "2025-01-01",
    },
    {
        id: "gal-7",
        url: "/images/gallery/waiting-area.jpg",
        alt: "Comfortable waiting area",
        category: "Facilities",
        order: 7,
        createdAt: "2025-01-01",
    },
    {
        id: "gal-8",
        url: "/images/gallery/products.jpg",
        alt: "Health and wellness products",
        category: "Products",
        order: 8,
        createdAt: "2025-01-01",
    },
];

// ─── Job Listings ────────────────────────────
export const jobListings: JobListing[] = [
    {
        id: "job-1",
        title: "Pharmacist",
        slug: "pharmacist",
        department: "Dispensary",
        type: "full-time",
        location: "London",
        salary: "£45,000 - £55,000",
        description:
            "We are looking for a GPhC-registered pharmacist to join our dispensary team. The ideal candidate will have excellent patient communication skills and a passion for community health.",
        requirements: [
            "GPhC registered pharmacist",
            "Minimum 2 years post-registration experience",
            "Excellent patient communication skills",
            "Right to work in the UK",
        ],
        isActive: true,
        postedDate: "2025-09-01",
        createdAt: "2025-09-01",
        updatedAt: "2025-09-01",
    },
    {
        id: "job-2",
        title: "Healthcare Assistant",
        slug: "healthcare-assistant",
        department: "Clinical Services",
        type: "part-time",
        location: "London",
        salary: "£12.50 per hour",
        description:
            "Join our growing clinical services team as a Healthcare Assistant. You'll support our pharmacists in delivering travel clinic, vaccination, and wellness services.",
        requirements: [
            "NVQ Level 2 in Healthcare or equivalent",
            "Phlebotomy certification (desirable)",
            "Strong organisational skills",
            "Compassionate and patient-focused attitude",
        ],
        isActive: true,
        postedDate: "2025-09-15",
        createdAt: "2025-09-15",
        updatedAt: "2025-09-15",
    },
];
