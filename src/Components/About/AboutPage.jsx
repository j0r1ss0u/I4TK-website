import React, { useState } from 'react';
import { Globe2, Users, Shield, Target } from 'lucide-react';

const TABS = {
  ABOUT: 'about',
  PRESS_RELEASE: 'press-release',
  PRAI_PARTNERSHIP: 'prai-partnership'
};

const MissionCard = ({ title, description, icon: Icon, color }) => (
  <div className="backdrop-blur-sm bg-white/30 p-6 rounded-lg text-center h-[200px] flex flex-col items-center justify-center hover:bg-white/40 transition-all">
    <Icon className={`w-8 h-8 ${color} mb-4`} />
    <h3 className={`font-serif text-xl font-bold mb-2 ${color}`}>{title}</h3>
    <p className="text-gray-600 text-sm">{description}</p>
  </div>
);

const TimelineEvent = ({ date, title, location, isDeliverable = false }) => (
  <div className="flex items-center min-h-[80px] group relative">
    {!isDeliverable ? (
      <>
        <div className="w-[45%] text-right pr-8">
          <div className="group-hover:transform group-hover:scale-105 transition-transform">
            <p className="text-base font-medium text-orange-600">{date}</p>
            <p className="font-semibold text-xl">{title}</p>
            {location && <p className="text-base text-gray-600">{location}</p>}
          </div>
        </div>
        <div className="relative flex flex-col items-center w-[10%]">
          <div className="absolute top-0 bottom-0 w-1 bg-gradient-to-b from-orange-300 to-orange-500" 
               style={{ transform: 'translateY(-50%)', height: 'calc(100% + 80px)' }}>
          </div>
          <div className="relative w-4 h-4 bg-orange-500 rounded-full border-4 border-orange-200 z-10 
                        transition-all duration-200 group-hover:scale-150 group-hover:border-orange-100">
          </div>
        </div>
        <div className="w-[45%]"></div>
      </>
    ) : (
      <>
        <div className="w-[45%]"></div>
        <div className="relative flex flex-col items-center w-[10%]">
          <div className="absolute top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-300 to-emerald-500"
               style={{ transform: 'translateY(-50%)', height: 'calc(100% + 80px)' }}>
          </div>
          <div className="relative w-4 h-4 bg-orange-500 rounded-full border-4 border-orange-200 z-10 
                        transition-all duration-200 group-hover:scale-150 group-hover:border-orange-100">
          </div>
        </div>
        <div className="w-[45%] pl-8">
          <div className="group-hover:transform group-hover:scale-105 transition-transform">
            <p className="text-base font-medium text-orange-600">{date}</p>
            <p className="font-semibold text-xl">{title}</p>
            {location && <p className="text-base text-gray-600">{location}</p>}
          </div>
        </div>
      </>
    )}
  </div>
);

const PressRelease = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6">Press Releases</h2>
    <div className="space-y-8">
      <div className="bg-white/50 rounded-lg p-6">
        <h3 className="text-xl font-bold mb-2">UNESCO launches I4T Global Knowledge Network</h3>
        <p className="text-gray-600 mb-4">22 February 2024</p>
        <p className="text-gray-800">UNESCO launches the Internet for Trust Global Knowledge Network (I4T GKN), gathering 16 research centers and think tanks from all regions. This initiative aims to strengthen digital cooperation through collective knowledge production.</p>
        <a href="#" className="text-blue-600 hover:underline mt-2 inline-block">Download PDF</a>
      </div>

      <div className="bg-white/50 rounded-lg p-6">
        <h3 className="text-xl font-bold mb-2">I4TK's Contribution to the UN Global Digital Compact</h3>
        <p className="text-gray-600 mb-4">February 2024</p>
        <p className="text-gray-800">I4TK submitted its contribution to the UN Global Digital Compact, emphasizing research-based digital governance and promoting inclusive international cooperation for a trustworthy digital space.</p>
        <a href="#" className="text-blue-600 hover:underline mt-2 inline-block">Download PDF</a>
      </div>

      <div className="bg-white/50 rounded-lg p-6">
        <h3 className="text-xl font-bold mb-2">Policy Commentary for T20 Brazil 2024: Global Election Datafication</h3>
        <p className="text-gray-600 mb-4">February 2024</p>
        <p className="text-gray-800">I4TK contributed to T20 Brazil 2024 with a policy brief on Global Election Datafication, addressing digital technologies in electoral processes and promoting safeguards for democratic integrity.</p>
        <a href="#" className="text-blue-600 hover:underline mt-2 inline-block">Read More</a>
      </div>
    </div>
  </div>
);

const PRAIPartnership = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6">PRAI Partnership</h2>
    <div className="prose max-w-none">
      <p>
        The Partnership for Rights and AI (PRAI) is a collaboration between civil society organizations, 
        academic institutions, and other stakeholders committed to ensuring that AI development and 
        deployment respects human rights.
      </p>
    </div>
  </div>
);

const AboutPage = () => {
  const [activeTab, setActiveTab] = useState(TABS.ABOUT);

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

  const renderContent = () => {
    switch (activeTab) {
      case TABS.PRESS_RELEASE:
        return <PressRelease />;
      case TABS.PRAI_PARTNERSHIP:
        return <PRAIPartnership />;
      default:
        return (
          <>
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
          </>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Tab Navigation */}
      <div className="mb-8 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {Object.entries({
            [TABS.ABOUT]: 'About',
            [TABS.PRESS_RELEASE]: 'Press Release',
            [TABS.PRAI_PARTNERSHIP]: 'PRAI Partnership'
          }).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {renderContent()}

      {/* Contact Section */}
      <section className="bg-white/50 rounded-xl p-8 text-center mt-12">
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