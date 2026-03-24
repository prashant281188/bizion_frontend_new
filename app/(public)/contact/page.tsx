import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "HINI | Contact Us",
  description: "Reach out to HINI for product enquiries, dealer partnerships, bulk orders, or project support.",
};

const infoBlocks = [
  {
    label: "Office Address",
    content: (
      <>
        Himani Enterprises
        <br />
        Opposite Park, Vasundhara Colony,
        <br />
        Mathura Road, Aligarh — 202001
        <br />
        Uttar Pradesh, India
      </>
    ),
  },
  { label: "Phone", content: "+91 70880 99933" },
  {
    label: "Email",
    content: (
      <>
        sales@hini.in
        <br />
        support@hini.in
      </>
    ),
  },
  {
    label: "Business Hours",
    content: (
      <>
        Monday – Saturday
        <br />
        10:00 AM – 6:30 PM IST
      </>
    ),
  },
];

const PublicContactPage = () => {
  return (
    <>
      {/* Hero */}
      <section className="relative w-full bg-neutral-50 py-12 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <span className="mx-auto mb-3 block h-1 w-12 rounded-full bg-amber-500" />
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-900">Get in Touch</h1>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto px-2">
            We are here for product enquiries, dealer partnerships, bulk orders, and project support.
            Expect a response within one business day.
          </p>
        </div>
      </section>

      {/* Main */}
      <section className="w-full bg-white py-12 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid gap-10 sm:gap-16 md:grid-cols-2">
            {/* Left: Info */}
            <div>
              <span className="mb-4 block h-1 w-10 rounded-full bg-amber-500" />
              <h2 className="text-2xl font-semibold text-gray-900">We&apos;d Love to Hear from You</h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Whether you are an architect specifying hardware for a project, a retailer looking
                to stock HINI, or a distributor exploring partnership, our team is ready to assist
                with the right solutions.
              </p>

              <div className="mt-10 space-y-6">
                {infoBlocks.map((block) => (
                  <div
                    key={block.label}
                    className="flex gap-4 rounded-xl bg-neutral-50 p-4 ring-1 ring-black/5"
                  >
                    <div className="mt-0.5 h-5 w-1 flex-shrink-0 rounded-full bg-amber-500" />
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                        {block.label}
                      </h4>
                      <p className="mt-1 text-sm text-gray-800 leading-relaxed">
                        {block.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Form */}
            <div className="rounded-2xl bg-neutral-50 p-5 sm:p-8 ring-1 ring-black/5">
              <span className="mb-3 block h-1 w-8 rounded-full bg-amber-500" />
              <h3 className="text-xl font-semibold text-gray-900">Send an Enquiry</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Fill in your details and we&apos;ll get back to you within 24 hours.
              </p>

              <form className="mt-6 space-y-4">
                <input type="text" placeholder="Full Name" className="input-base" />
                <input type="email" placeholder="Email Address" className="input-base" />
                <input type="tel" placeholder="Phone Number" className="input-base" />
                <select className="input-base" defaultValue="">
                  <option value="" disabled>Nature of Enquiry</option>
                  <option>Product Information</option>
                  <option>Dealer / Distributor Enquiry</option>
                  <option>Project / Bulk Order</option>
                  <option>Pricing &amp; Catalogue</option>
                  <option>After-Sales Support</option>
                </select>
                <textarea
                  placeholder="Tell us about your requirement…"
                  rows={4}
                  className="input-base"
                />
                <button
                  type="submit"
                  className="w-full rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-black transition hover:bg-amber-400"
                >
                  Submit Enquiry
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default PublicContactPage;
