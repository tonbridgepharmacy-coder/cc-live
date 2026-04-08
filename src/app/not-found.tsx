import Link from "next/link";

export default function NotFound() {
    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 bg-background">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6 text-4xl">
                🔍
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-text-primary mb-4">
                Page Not Found
            </h1>
            <p className="text-lg text-text-secondary max-w-md mb-8">
                Sorry, we couldn't find the page you're looking for. It might have been
                moved or deleted.
            </p>
            <div className="flex gap-4">
                <Link
                    href="/"
                    className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-semibold transition-all"
                >
                    Back to Home
                </Link>
                <Link
                    href="/contact"
                    className="bg-white hover:bg-gray-50 text-text-primary border border-border px-6 py-3 rounded-xl font-semibold transition-all"
                >
                    Contact Us
                </Link>
            </div>
        </div>
    );
}
