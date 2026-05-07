import React from "react";
import { Zap, Heart, Cpu } from "lucide-react";

export const metadata = {
  title: "About Us | ELECTROMART",
  description: "Learn about ELECTROMART's mission to provide affordable electronic components for students.",
};

export default function AboutPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-16 lg:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <img
              src="/images/logo.jpg"
              alt="ELECTROMART Logo"
              className="w-40 h-40 md:w-48 md:h-48 object-contain drop-shadow-xl"
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-6">
            Fueling Tomorrow's Tech Today
          </h1>
          <div className="w-24 h-1 bg-brand-orange mx-auto rounded-full"></div>
        </div>

        {/* Story Section */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative">
          {/* Decorative element */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-orange/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none"></div>

          <div className="p-8 md:p-12 lg:p-16 relative z-10">
            <div className="prose prose-lg md:prose-xl text-gray-600 max-w-none">
              <p className="font-medium text-gray-900 text-2xl leading-relaxed mb-8">
                ELECTROMART was started by students who faced a common problem, electronic components were overpriced and not easily affordable for students.
              </p>

              <p className="mb-6">
                While working on prototype, we realized many students couldn't build their ideas due to high hardware costs. The gap between an innovative concept and a working prototype was often just the price of components.
              </p>

              <div className="my-10 p-8 bg-gray-50 rounded-2xl border-l-4 border-brand-orange">
                <p className="text-xl font-medium text-gray-800 m-0 italic">
                  "So we created ELECTROMART, A platform that provide electronics components at near wholesale prices across Tamil Nadu."
                </p>
              </div>

              <p>
                We source directly from reliable manufacturers to cut out the middlemen, passing the savings directly to you. Whether you are working on your final year project, participating in a hackathon, or just tinkering in your dorm room, we want to be your trusted partner.
              </p>
            </div>
          </div>
        </div>

        {/* Mission Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-brand-black text-white p-10 rounded-3xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-orange/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <Heart className="text-brand-orange mb-6" size={40} />
            <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
            <p className="text-gray-300 leading-relaxed text-lg">
              To make hardware affordable so students can innovate without limits. We believe that cost should never be a barrier to technological advancement.
            </p>
          </div>

          <div className="bg-white border border-gray-200 p-10 rounded-3xl relative overflow-hidden group hover:border-brand-orange/30 hover:shadow-lg transition-all duration-300">
            <Cpu className="text-brand-orange mb-6" size={40} />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
            <p className="text-gray-600 leading-relaxed text-lg">
              To become the backbone of student innovation across tamil nadu, creating an ecosystem where every idea can be brought to life quickly and affordably.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
