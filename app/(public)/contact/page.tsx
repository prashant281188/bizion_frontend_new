import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Hini | Contact Us",
};

const infoBlocks = [
  {
    label: "Office Address",
    content: (
      <>
        HIMANI ENTERPRISES
        <br />
        Opposite Park, Vasundhara Colony,
        <br />
        Mathura Road, Aligarh, 202001
        <br />
        UP, India
      </>
    ),
  },
  { label: "Phone", content: "+91 7088099933" },
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
        10:00 AM – 6:30 PM
      </>
    ),
  },
];

const inputCls =
  "w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition";

const PublicContactPage = () => {
  return (
    <>
      {/* Hero */}
      <section className="relative w-full bg-neutral-50 py-20">
        <div className="container mx-auto px-6 text-center">
          <span className="mx-auto mb-4 block h-1 w-14 rounded-full bg-amber-500" />
          <h1 className="text-3xl md:text-4xl font-semibold text-gray-900">Contact Us</h1>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            Get in touch for product enquiries, dealer partnerships, or project support.
          </p>
        </div>
      </section>

      {/* Main */}
      <section className="w-full bg-white py-20">
        <div className="container mx-auto px-6">
          <div className="grid gap-16 md:grid-cols-2">
            {/* Left: Info */}
            <div>
              <span className="mb-4 block h-1 w-10 rounded-full bg-amber-500" />
              <h2 className="text-2xl font-semibold text-gray-900">Let's Talk</h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Whether you are an architect, interior designer, retailer, or distributor, our
                team is here to help you find the right hardware solutions for your projects.
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
            <div className="rounded-2xl bg-neutral-50 p-8 ring-1 ring-black/5">
              <span className="mb-3 block h-1 w-8 rounded-full bg-amber-500" />
              <h3 className="text-xl font-semibold text-gray-900">Send Us a Message</h3>
              <p className="mt-1 text-sm text-muted-foreground">We'll get back to you within 24 hours.</p>

              <form className="mt-6 space-y-4">
                <input type="text" placeholder="Full Name" className={inputCls} />
                <input type="email" placeholder="Email Address" className={inputCls} />
                <input type="tel" placeholder="Phone Number" className={inputCls} />
                <select className={inputCls} defaultValue="">
                  <option value="" disabled>Nature of Enquiry</option>
                  <option>Product Information</option>
                  <option>Dealer / Distributor Enquiry</option>
                  <option>Project / Bulk Order</option>
                  <option>Support</option>
                </select>
                <textarea
                  placeholder="Your Message"
                  rows={4}
                  className={inputCls}
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
