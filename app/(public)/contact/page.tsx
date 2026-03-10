import { Metadata } from "next";
import React from "react";

export const metadata:Metadata={
  title: "Hini | Contact Page"
}

const PublicContactPage = () => {
  return (
    <section className="relative w-full bg-white py-24">
      <div className="container mx-auto px-6">
        {/* Page Header */}
        <div className="mb-20 text-center">
          <span className="mx-auto mb-4 block h-1 w-14 rounded-full bg-amber-500" />
          <h1 className="text-3xl md:text-4xl font-semibold text-gray-900">
            Contact Us
          </h1>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Get in touch with us for product enquiries, dealer partnerships, or
            project support.
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid gap-16 md:grid-cols-2">
          {/* Left: Contact Info */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Let’s Talk</h2>

            <p className="mt-4 text-muted-foreground leading-relaxed">
              Whether you are an architect, interior designer, retailer, or
              distributor, our team is here to help you find the right hardware
              solutions for your projects.
            </p>

            {/* Info Blocks */}
            <div className="mt-10 space-y-6">
              <div>
                <h4 className="text-sm font-semibold uppercase tracking-wider">
                  Office Address
                </h4>
                <p className="mt-1 text-muted-foreground">
                  HIMANI ENTERPRISES
                  <br />
                  Opposite Park, Vasundhara Colony, 
                  <br />
                  Mathura Road, Aligarh, 202001 
                  <br />
                  UP, India
                </p>
              </div>

              <div>
                <h4 className="text-sm font-semibold uppercase tracking-wider">
                  Phone
                </h4>
                <p className="mt-1 text-muted-foreground">+91 7088099933</p>
              </div>

              <div>
                <h4 className="text-sm font-semibold uppercase tracking-wider">
                  Email
                </h4>
                <p className="mt-1 text-muted-foreground">
                  sales@hini.in
                  <br />
                  support@hini.in
                </p>
              </div>

              <div>
                <h4 className="text-sm font-semibold uppercase tracking-wider">
                  Business Hours
                </h4>
                <p className="mt-1 text-muted-foreground">
                  Monday – Saturday
                  <br />
                  10:00 AM – 6:30 PM
                </p>
              </div>
            </div>
          </div>

          {/* Right: Contact Form */}
          <div className="rounded-2xl bg-neutral-50 p-8 ring-1 ring-black/5">
            <h3 className="text-xl font-semibold text-gray-900">
              Send Us a Message
            </h3>

            <form className="mt-6 space-y-5">
              <input
                type="text"
                placeholder="Full Name"
                className="w-full rounded-md border border-black/10 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />

              <input
                type="email"
                placeholder="Email Address"
                className="w-full rounded-md border border-black/10 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />

              <input
                type="tel"
                placeholder="Phone Number"
                className="w-full rounded-md border border-black/10 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />

              <select className="w-full rounded-md border border-black/10 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500">
                <option>Nature of Enquiry</option>
                <option>Product Information</option>
                <option>Dealer / Distributor Enquiry</option>
                <option>Project / Bulk Order</option>
                <option>Support</option>
              </select>

              <textarea
                placeholder="Your Message"
                rows={4}
                className="w-full rounded-md border border-black/10 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />

              <button
                type="submit"
                className="w-full rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-black transition hover:bg-amber-600"
              >
                Submit Enquiry
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PublicContactPage;
