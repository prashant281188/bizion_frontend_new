import Link from "next/link";

const collections = [
  { label: "Door Handles", href: "/catalog" },
  { label: "Cabinet Handles", href: "/catalog" },
  { label: "Profile Handles", href: "/catalog" },
  { label: "Aluminium Profiles", href: "/catalog" },
  { label: "Bathroom Accessories", href: "/catalog" },
  { label: "Browse Full Catalogue", href: "/catalog" },
];

const support = [
  { label: "Contact Us", href: "/contact" },
  { label: "Product Catalogue", href: "/catalog" },
  { label: "All Products", href: "/products" },
  { label: "About HINI", href: "/about" },
  { label: "Dealer Enquiry", href: "/contact" },
];

const business = [
  { label: "Admin Login", href: "/login" },
  { label: "Become a Dealer", href: "/contact" },
  { label: "Request a Quote", href: "/contact" },
  { label: "Bulk Orders", href: "/contact" },
];

const PublicFooter = () => {
  return (
    <footer className="w-full bg-neutral-50">
      <div className="container mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {/* Top Divider */}
        <div className="mb-8 sm:mb-12 h-px w-full bg-gradient-to-r from-transparent via-black/10 to-transparent" />

        {/* Footer Grid */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <span className="text-amber-500">●</span> HINI
            </h2>
            <p className="mt-4 text-sm text-muted-foreground max-w-xs">
              Architectural hardware built for precision and refined for modern interiors.
              Trusted by designers, builders, and retailers across India.
            </p>
          </div>

          {/* Collections */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">
              Collections
            </h3>
            <ul className="space-y-2">
              {collections.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-black transition"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {support.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-black transition"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Business */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">
              Business
            </h3>
            <ul className="space-y-2">
              {business.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-black transition"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 sm:mt-16 flex flex-col items-center justify-between gap-4 border-t border-black/5 pt-6 text-sm text-muted-foreground md:flex-row">
          <p>© 2025–26 HINI by Himani Enterprises. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/contact" className="hover:text-black">
              Privacy Policy
            </Link>
            <Link href="/contact" className="hover:text-black">
              Terms of Use
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;
