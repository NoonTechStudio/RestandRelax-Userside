import React from "react";
import {
  Waves,
  Clock,
  Users,
  ArrowRight,
  CheckCircle2,
  MapPin,
} from "lucide-react";

const PoolParty = () => {
  const primaryColor = "#008DDA";

  const sessions = [
    {
      title: "Morning Session",
      startTime: "08:00 AM",
      endTime: "02:00 PM",
      description:
        "Start your day with a refreshing splash and bright morning vibes.",
      icon: "☀️",
    },
    {
      title: "Evening Session",
      startTime: "03:00 PM",
      endTime: "09:00 PM",
      description:
        "Perfect for sunset gatherings and beautiful evening lighting.",
      icon: "🌙",
    },
    {
      title: "Full Day Session",
      startTime: "08:00 AM",
      endTime: "08:00 PM",
      description:
        "The ultimate experience for all-day celebrations and maximum fun.",
      icon: "🌊",
    },
  ];

  return (
    <section className="py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center gap-2 bg-[#008DDA]/10 text-[#008DDA] px-4 py-1.5 rounded-full mb-4">
            <Waves className="w-5 h-5" />
            <span className="text-sm font-bold uppercase tracking-widest">
              Premium Experience
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl text-gray-900 leading-tight mb-6">
            Pool Party <span className="text-[#008DDA]">Bookings</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Make a splash at your next celebration. Choose from our flexible
            session timings designed to fit your event perfectly.
          </p>
        </div>

        {/* Sessions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {sessions.map((session, index) => (
            <div
              key={index}
              className="relative group bg-gray-50 rounded-3xl p-8 border border-transparent hover:border-[#008DDA]/30 hover:bg-white hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
            >
              <div className="text-4xl mb-6">{session.icon}</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {session.title}
              </h3>
              <p className="text-gray-600 mb-6 line-clamp-2">
                {session.description}
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-gray-700 font-medium">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-[#008DDA]">
                    <Clock className="w-4 h-4" />
                  </div>
                  <span>
                    {session.startTime} — {session.endTime}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-gray-700 font-medium">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-[#008DDA]">
                    <Users className="w-4 h-4" />
                  </div>
                  <span>Session Capacity Applicable</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <ul className="space-y-2 mb-6">
                  {["Private Access", "Change Rooms", "Music Support"].map(
                    (item, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-2 text-sm text-gray-500"
                      >
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        {item}
                      </li>
                    ),
                  )}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Information Banner */}
        <div className="bg-gray-900 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden text-center text-white shadow-2xl">
          {/* Decorative Background Blur */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-[#008DDA]/20 rounded-full blur-[80px]"></div>

          <div className="relative z-10">
            <div className="inline-flex items-center justify-center gap-2 bg-[#008DDA]/20 text-[#008DDA] px-4 py-2 rounded-full mb-6">
              <MapPin className="w-5 h-5 text-white" />
              <span className="text-sm font-bold uppercase tracking-widest text-white">
                Location Details
              </span>
            </div>

            <h3 className="text-3xl md:text-4xl font-bold mb-4">
              Want to Book a Pool Party?
            </h3>
            <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
              Visit our Location page to find complete details about pool party
              bookings, pricing, availability, and amenities at each of our
              venues.
            </p>

            <a
              href="/location"
              className="inline-flex items-center justify-center gap-2 px-10 py-4 bg-[#008DDA] hover:bg-[#0278b8] text-white rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-[#008DDA]/25"
            >
              View Location Details
              <ArrowRight className="w-5 h-5" />
            </a>

            <p className="mt-8 text-sm text-gray-400">
              For immediate assistance or custom requirements, call us at{" "}
              <span className="text-white font-medium">+91 90990 48961</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PoolParty;
