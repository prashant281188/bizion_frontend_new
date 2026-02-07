import Image from "next/image";
import React from "react";

const AboutPage = () => {
  return (
    <section className="relative w-full bg-white py-24">
      <div className="container mx-auto px-6">
        <div className="grid items-center gap-16 md:grid-cols-2">
          {/* Left: Content */}
          <div>
            <span className="mb-4 block h-1 w-14 rounded-full bg-amber-500" />

            <h2 className="text-3xl md:text-4xl font-semibold text-gray-900">
              About HINI
            </h2>

            <p className="mt-6 text-muted-foreground leading-relaxed">
              HINI is a premium architectural hardware brand dedicated to
              enhancing modern interiors through thoughtful design, precision
              engineering, and uncompromising quality.
            </p>

            <p className="mt-4 text-muted-foreground leading-relaxed">
              From door and cabinet handles to aluminium profiles and
              accessories, our collections are crafted to meet the expectations
              of architects, interior designers, builders, and retailers across
              India.
            </p>

            {/* Highlights */}
            <div className="mt-8 grid grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-semibold text-gray-900">
                  Premium Quality
                </h4>
                <p className="mt-1 text-sm text-muted-foreground">
                  Durable materials, refined finishes, and consistent
                  performance.
                </p>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900">
                  Design-Driven
                </h4>
                <p className="mt-1 text-sm text-muted-foreground">
                  Modern aesthetics aligned with functional excellence.
                </p>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900">
                  Trusted Partners
                </h4>
                <p className="mt-1 text-sm text-muted-foreground">
                  Working closely with professionals and retailers.
                </p>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900">
                  Wide Range
                </h4>
                <p className="mt-1 text-sm text-muted-foreground">
                  Complete hardware solutions for every space.
                </p>
              </div>
            </div>
          </div>

          {/* Right: Images */}
          <div className="relative grid grid-cols-2 gap-6">
            <div className="overflow-hidden rounded-2xl shadow-sm">
              <Image
                src="/images/about/about-1.jpg"
                alt="Premium interior hardware"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="overflow-hidden rounded-2xl shadow-sm">
              <Image
                src="/images/about/about-2.jpg"
                alt="Modern hardware detailing"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutPage;
