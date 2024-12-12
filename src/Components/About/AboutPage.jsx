import React from 'react';
import { Globe2, Users, Shield, Target } from 'lucide-react';

const MissionCard = ({ title, description, icon: Icon, color }) => (
  <div className="backdrop-blur-sm bg-white/30 p-6 rounded-lg text-center h-[200px] flex flex-col items-center justify-center hover:bg-white/40 transition-all">
    <Icon className={`w-8 h-8 ${color} mb-4`} />
    <h3 className={`font-serif text-xl font-bold mb-2 ${color}`}>{title}</h3>
    <p className="text-gray-600 text-sm">{description}</p>
  </div>
);

const TimelineEvent = ({ date, title, location, isDeliverable = false }) => (
  <div className="flex items-center min-h-[60px]">
    {!isDeliverable ? (
      <>
        <div className="w-[45%] text-right pr-8">
          <div>
            <p className="text-sm text-gray-500">{date}</p>
            <p className="font-medium">{title}</p>
            {location && <p className="text-sm text-gray-500">{location}</p>}
          </div>
        </div>
        <div className="relative flex flex-col items-center w-[10%]">
          <div className="h-full w-px bg-orange-200"></div>
          <div className="absolute w-2 h-2 bg-orange-400 rounded-full"></div>
        </div>
        <div className="w-[45%]"></div>
      </>
    ) : (
      <>
        <div className="w-[45%]"></div>
        <div className="relative flex flex-col items-center w-[10%]">
          <div className="h-full w-px bg-orange-200"></div>
          <div className="absolute w-2 h-2 bg-orange-400 rounded-full"></div>
        </div>
        <div className="w-[45%] pl-8">
          <div>
            <p className="text-sm text-gray-500">{date}</p>
            <p className="font-medium">{title}</p>
            {location && <p className="text-sm text-gray-500">{location}</p>}
          </div>
        </div>
      </>
    )}
  </div>
);

const AboutPage = () => {
  const missionCards = [
    {
      title: "World-class knowledge producers",
      description: "Bringing together leading research centers and think tanks",
      icon: Globe2,
      color: "text-orange-600"
    },
    {
      title: "Collective action",
      description: "Fostering collaboration for better digital governance",
      icon: Users,
      color: "text-emerald-600"
    },
    {
      title: "Independent network",
      description: "Maintaining autonomy in research and recommendations",
      icon: Shield,
      color: "text-blue-600"
    },
    {
      title: "Output-driven",
      description: "Focused on producing actionable insights and solutions",
      icon: Target,
      color: "text-purple-600"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Mission Cards Section */}
      <section className="mb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {missionCards.map((card, index) => (
            <MissionCard key={index} {...card} />
          ))}
        </div>
      </section>

      {/* Timeline Section */}
      <section className="mb-16">
        <h2 className="text-2xl font-serif font-bold text-gray-900 mb-12 text-center">
          Our Journey & Milestones
        </h2>
        <div className="relative space-y-12">
          {/* 2025 */}
          <TimelineEvent 
            date="Dec 2025" 
            title="G20" 
            location="South Africa"
          />
          <TimelineEvent
            date="Dec 2025"
            title="I4TK Side event"
            isDeliverable={true}
          />
          <TimelineEvent
            date="Nov 2025"
            title="Paris Peace Forum"
            location="Paris"
          />
          <TimelineEvent
            date="Q4 2025"
            title="Capacity Building INDIA"
            isDeliverable={true}
          />
          <TimelineEvent
            date="Sept 2025"
            title="MondiaCULT"
            location="Barcelona"
          />
          <TimelineEvent
            date="Q3 2025"
            title="Capacity Building AFRICA"
            isDeliverable={true}
          />
          <TimelineEvent
            date="Q2 2025"
            title="Capacity Building LATAM"
            isDeliverable={true}
          />
          <TimelineEvent
            date="Apr 2025"
            title="I4TK 2024 Report"
            isDeliverable={true}
          />
          <TimelineEvent
            date="Feb 2025"
            title="AI Action Summit"
            location="Paris"
          />
          <TimelineEvent
            date="Q1 2025"
            title="Capacity Building EUROPE"
            isDeliverable={true}
          />

          {/* 2024 */}
          <TimelineEvent
            date="Nov 2024"
            title="G20"
            location="Brazil"
          />
          <TimelineEvent
            date="Sept 2024"
            title="Working paper on ppl expectations from regulation"
            isDeliverable={true}
          />
          <TimelineEvent
            date="Sept 2024"
            title="Summit 4 Future"
            location="NYC"
          />
          <TimelineEvent
            date="June 2024"
            title="Working paper on relations with I4T regulators network"
            isDeliverable={true}
          />
          <TimelineEvent
            date="June 2024"
            title="I4T Regulators' network meeting"
            location="Croatia"
          />
          <TimelineEvent
            date="May 2024"
            title="Press Freedom Day"
            location="Chile"
          />
          <TimelineEvent
            date="Apr 2024"
            title="T20 Brazil"
            location="Brazil"
          />
          <TimelineEvent
            date="Mar 2024"
            title="Policy Brief for T20 Brasil"
            isDeliverable={true}
          />
          <TimelineEvent
            date="Mar 2024"
            title="Global map of I4T knowledge players"
            isDeliverable={true}
          />
          <TimelineEvent
            date="Feb 2024"
            title="I4T GKN Launch seminar"
            location="Brazil"
          />
          <TimelineEvent
            date="Feb 2024"
            title="I4T GKN Concept note"
            isDeliverable={true}
          />
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