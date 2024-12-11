import React from 'react';
import { Globe2, Users, ChartBar, Network } from 'lucide-react';

const Timeline = ({ events }) => (
  <div className="space-y-8">
    {events.map((event, index) => (
      <div key={index} className="flex gap-4">
        <div className="flex-none w-24 font-bold">{event.date}</div>
        <div className="flex-grow bg-white/50 p-4 rounded-lg">{event.description}</div>
      </div>
    ))}
  </div>
);

const StatCard = ({ value, label, color }) => (
  <div className="bg-white/50 p-6 rounded-lg backdrop-blur-sm">
    <div className={`text-4xl font-bold ${color} mb-2`}>{value}</div>
    <p className="text-gray-600">{label}</p>
  </div>
);

const AboutPage = () => {
  const timelineEvents = [
    {
      date: "11/2023",
      description: "UNESCO completes the drafting of its Principles for an Internet for Trust (I4T), aiming to equip Member States, regulators and businesses with rules to guarantee freedom of expression."
    },
    {
      date: "02/2024",
      description: "An independent community of leading international think tanks and research centers forms the I4T Knowledge network (I4TK)."
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-serif font-bold text-gray-900 mb-6">
          Internet for Trust Knowledge Network
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Our community aims to shape a "global digital village for trust"
        </p>
      </div>

      {/* Timeline */}
      <section className="mb-16">
        <h2 className="text-2xl font-serif font-bold text-gray-900 mb-8">Our Journey</h2>
        <Timeline events={timelineEvents} />
      </section>

      {/* Stats */}
      <section className="mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <StatCard 
            value="65+" 
            label="Research Centers & Think Tanks"
            color="text-orange-600"
          />
          <StatCard 
            value="55%" 
            label="Members from Global South"
            color="text-green-700"
          />
          <StatCard 
            value="4" 
            label="Research Programs"
            color="text-purple-400"
          />
        </div>
      </section>

      {/* Core Mission */}
      <section className="mb-16">
        <div className="bg-white/50 rounded-xl p-8">
          <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6">
            Core Mission
          </h2>
          <p className="text-lg text-gray-600 mb-4">
            I4TK core mission is to serve as a 'trusted interface' on the issue of digital platforms/spaces and human rights.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            <div className="p-4 bg-white/70 rounded-lg">
              <h3 className="font-bold mb-2">World-class knowledge producers</h3>
              <p>Bringing together leading research centers and think tanks</p>
            </div>
            <div className="p-4 bg-white/70 rounded-lg">
              <h3 className="font-bold mb-2">Collective action</h3>
              <p>Fostering collaboration for better digital governance</p>
            </div>
            <div className="p-4 bg-white/70 rounded-lg">
              <h3 className="font-bold mb-2">Independent network</h3>
              <p>Maintaining autonomy in research and recommendations</p>
            </div>
            <div className="p-4 bg-white/70 rounded-lg">
              <h3 className="font-bold mb-2">Output-driven</h3>
              <p>Focused on producing actionable insights and solutions</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="bg-white/50 rounded-xl p-8 text-center">
        <div className="space-y-4">

          <p className="text-lg">
            Contact us at{" "}
            <a href="mailto:general.secretary@i4tknowledge.net" className="text-blue-600 hover:underline">
              general.secretary@i4tknowledge.net
            </a>
          </p>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;