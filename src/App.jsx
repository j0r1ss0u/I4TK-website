import React, { useState } from 'react';
import * as LucideIcons from 'lucide-react';

// 1. Destructuration des icônes

const { 
  Book, 
  ExternalLink, 
  Users, 
  MessageSquare, 
  Globe2, 
  Calendar, 
  Building2, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Search, 
  Filter, 
  MapPin, 
  List, 
  ArrowLeft, 
  Share2, 
  Bookmark, 
  MoreHorizontal, 
  ThumbsUp, 
  Flag, 
  Clock, 
  Send, 
  Vote, 
  Gavel, 
  Users2, 
  AlertTriangle, 
  Settings, 
  Database, 
  GraduationCap, 
  Shield 
} = LucideIcons;

// 2. Constantes

const MEMBERS_DATA = [
  {
    name: "#Leplusimportant",
    city: "Paris",
    country: "France",
    website: "www.leplusimportant.org",
    category: "Civil society",
    region: "Europe"
  },
  {
    name: "AMIC",
    fullName: "Asian Media Information and Communication Centre",
    city: "Manila",
    country: "Philippines",
    website: "amic.asia",
    category: "Civil society",
    region: "Asia-Pacific"
  },
  {
    name: "Berkman Klein Center",
    fullName: "Berkman Klein Center for Internet & Society",
    city: "Cambridge",
    country: "United States",
    website: "cyber.harvard.edu",
    category: "Academic",
    region: "North America"
  }
];

const FORUM_CATEGORIES = [
  {
    id: 'elections',
    title: 'Digital Platforms vs. Elections',
    description: 'Discussions about digital platforms impact on electoral processes',
    isPublic: true,
    icon: <Vote className="h-8 w-8" />,
    color: 'bg-rose-100 text-rose-600',
    borderColor: 'border-rose-200'
  },
  {
    id: 'regulator',
    title: 'Digital Platforms Regulator Agenda',
    description: 'Updates and discussions about regulatory frameworks',
    isPublic: true,
    icon: <Gavel className="h-8 w-8" />,
    color: 'bg-amber-100 text-amber-600',
    borderColor: 'border-amber-200'
  },
  {
    id: 'populations',
    title: 'Populations vs. Digital Platforms Regulator',
    description: 'Community expectations and regulatory impacts',
    isPublic: true,
    icon: <Users2 className="h-8 w-8" />,
    color: 'bg-emerald-100 text-emerald-600',
    borderColor: 'border-emerald-200'
  },
  {
    id: 'crisis',
    title: 'Digital Platforms vs. Crisis',
    description: 'Crisis management and platform governance',
    isPublic: true,
    icon: <AlertTriangle className="h-8 w-8" />,
    color: 'bg-blue-100 text-blue-600',
    borderColor: 'border-blue-200'
  }
];

// 3. Navigation

const Navigation = ({ currentPage, setCurrentPage }) => {
  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'members', label: 'Members' },
    { id: 'library', label: 'Library' },
    { id: 'forum', label: 'Forum' }
  ];

  return (
    <nav className="flex space-x-4">
      {navItems.map(item => (
        <button 
          key={item.id}
          onClick={() => setCurrentPage(item.id)}
          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            currentPage === item.id 
              ? 'bg-gray-900 text-white' 
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
};

// 4. Header

const Header = ({ currentPage, setCurrentPage }) => {
  return (
    <header className="bg-white border-b" role="banner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <img
              src="/api/placeholder/120/40"
              alt="I4TK Logo"
              className="h-10"
            />
          </div>
          <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} />
        </div>
      </div>
    </header>
  );
};

// 5. HomePage
const HomePage = () => (
  <div className="bg-white">
    <div className="relative bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:pb-28 xl:pb-32">
          <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
            <div className="text-center">
              <h1 className="text-4xl tracking-tight font-serif text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">Internet for Trust</span>
                <span className="block text-amber-600 mt-2">Knowledge Network</span>
              </h1>
              <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                A global knowledge network supported by UNESCO to foster rigorous research on initiatives for the better governance of digital platforms.
              </p>
              <div className="mt-8 flex justify-center space-x-4">
                <button className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gray-800 hover:bg-gray-700 transition-colors">
                  Discover our network
                </button>
                <button className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                  Access our library
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>

    <div className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3 text-center">
          <div>
            <div className="text-orange-600 font-serif text-5xl font-bold">65+</div>
            <p className="mt-3 text-lg text-gray-600">Research Centers<br />& Think Tanks</p>
          </div>
          <div>
            <div className="text-orange-600 font-serif text-5xl font-bold">55%</div>
            <p className="mt-3 text-lg text-gray-600">Members from<br />Global South</p>
          </div>
          <div>
            <div className="text-orange-600 font-serif text-5xl font-bold">6</div>
            <p className="mt-3 text-lg text-gray-600">Research<br />Programs</p>
          </div>
        </div>
      </div>
    </div>
  </div>
  );

// 6. MembersPage
const MembersPage = () => {
  const [viewMode, setViewMode] = useState('list');
  const [selectedCategory, setSelectedCategory] = useState('all');

  return (
    <div className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-serif font-bold text-gray-900">Our Global Network</h2>
          <p className="mt-4 text-lg text-gray-600">
            Connecting {MEMBERS_DATA.length} members worldwide
          </p>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row justify-between items-center">
          <div className="flex space-x-4 mb-4 sm:mb-0">
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-md flex items-center ${
                viewMode === 'list' ? 'bg-blue-800 text-white' : 'bg-gray-100'
              }`}
            >
              <List className="w-4 h-4 mr-2" />
              List View
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-4 py-2 rounded-md flex items-center ${
                viewMode === 'map' ? 'bg-blue-800 text-white' : 'bg-gray-100'
              }`}
            >
              <MapPin className="w-4 h-4 mr-2" />
              Map View
            </button>
          </div>

          <div className="flex space-x-4">
            {['all', 'Academic', 'Civil society'].map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-md flex items-center ${
                  selectedCategory === category ? 'bg-blue-800 text-white' : 'bg-gray-100'
                }`}
              >
                {category === 'Academic' && <Building2 className="w-4 h-4 mr-2" />}
                {category === 'Civil society' && <Users className="w-4 h-4 mr-2" />}
                {category === 'all' && <Filter className="w-4 h-4 mr-2" />}
                {category === 'all' ? 'All' : category}
              </button>
            ))}
          </div>
        </div>

        {viewMode === 'list' && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {MEMBERS_DATA
              .filter(m => selectedCategory === 'all' || m.category === selectedCategory)
              .map((member, idx) => (
                <div key={idx} className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-lg">{member.name}</h3>
                      {member.fullName && (
                        <p className="text-sm text-gray-600 mt-1">{member.fullName}</p>
                      )}
                    </div>
                    {member.category === 'Academic' ? (
                      <Building2 className="w-5 h-5 text-blue-800 flex-shrink-0" />
                    ) : (
                      <Users className="w-5 h-5 text-green-700 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {member.city}, {member.country}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      member.category === 'Academic' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {member.category}
                    </span>
                    <a 
                      href={`http://${member.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Website
                    </a>
                  </div>
                </div>
              ))}
          </div>
        )}

        {viewMode === 'map' && (
          <div className="mt-8 bg-gray-100 rounded-lg overflow-hidden relative">
            <div className="h-96 bg-blue-50">
              <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                Interactive map will be integrated here
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// 7. LibraryPage
const LibraryPage = () => (
  <div className="bg-white py-16">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <h2 className="text-3xl font-serif font-bold text-gray-900">
          I4T Knowledge Library
        </h2>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          Trusted Library for an Internet for Trust
        </p>

        <div className="mt-8">
          <a 
            href="https://i4-tk-network.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
          >
            <Book className="mr-2 h-5 w-5" />
            Access the Library
            <ExternalLink className="ml-2 h-4 w-4" />
          </a>
        </div>
      </div>

      <div className="mt-16">
        <div className="bg-gray-50 rounded-xl p-8">
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <img 
              src="/api/placeholder/800/400" 
              alt="Library Process Flowchart"
              className="w-full h-auto"
            />
          </div>

          <div className="prose prose-lg max-w-none">
            <p className="mb-6">
              This diagram <strong>maps the processes and functionalities</strong> integrated into our solution.
            </p>

            <ul className="space-y-4">
              <li className="flex items-start">
                <span className="inline-block w-3 h-3 rounded-full bg-emerald-500 mt-2 mr-3 flex-shrink-0"></span>
                <div>
                  <strong>User Authentication</strong>: Recognition of profiles based on wallet addresses.
                </div>
              </li>

              <li className="flex items-start">
                <span className="inline-block w-3 h-3 rounded-full bg-amber-500 mt-2 mr-3 flex-shrink-0"></span>
                <div>
                  <strong>Publication</strong>: Content security and availability through the decentralized IPFS platform.
                </div>
              </li>

              <li className="flex items-start">
                <span className="inline-block w-3 h-3 rounded-full bg-rose-500 mt-2 mr-3 flex-shrink-0"></span>
                <div>
                  <strong>Content Authentication</strong>: Creation, attribution, and distribution of tokenized intellectual property in the form of ERC1155.
                </div>
              </li>

              <li className="flex items-start">
                <span className="inline-block w-3 h-3 rounded-full bg-blue-500 mt-2 mr-3 flex-shrink-0"></span>
                <div>
                  <strong>Peer Review</strong>: Validation of proposed content by peers and monitoring of validation numbers triggering smart contract behavior changes.
                </div>
              </li>

              <li className="flex items-start">
                <span className="inline-block w-3 h-3 rounded-full bg-purple-500 mt-2 mr-3 flex-shrink-0"></span>
                <div>
                  <strong>Web of Trust</strong>: Smart contract reading/monitoring to track and trace ERC1155 lineage.
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
  );


// 8. Forum Page
const ForumCategoryCard = ({ category }) => (
  <div className={`p-6 rounded-lg border ${category.borderColor} ${category.color}`}>
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center">
          {category.icon}
          <h3 className="ml-3 text-lg font-medium">{category.title}</h3>
        </div>
        <p className="mt-2 text-sm opacity-90">
          {category.description}
        </p>
      </div>
      {category.isPublic && (
        <span className="inline-flex items-center px-2 py-1 rounded-full bg-white bg-opacity-50 text-xs">
          <Globe2 className="w-3 h-3 mr-1" />
          Public
        </span>
      )}
    </div>
  </div>
);

const ForumPage = () => (
  <div className="bg-white py-16">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <h2 className="text-3xl font-serif font-bold text-gray-900">Discussion Forum</h2>
        <p className="mt-4 text-lg text-gray-600">
          Exchange ideas and share insights about digital platform governance
        </p>
      </div>

      <div className="mt-12">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {FORUM_CATEGORIES.map((category) => (
            <ForumCategoryCard key={category.id} category={category} />
          ))}
        </div>
      </div>

      <div className="mt-12 bg-gray-50 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Forum Guidelines</h3>
          <GraduationCap className="h-6 w-6 text-gray-400" />
        </div>
        <ul className="mt-4 space-y-3">
          <li className="flex items-start text-sm text-gray-600">
            <Shield className="h-5 w-5 mr-3 text-emerald-500 flex-shrink-0" />
            <span>Maintain professional and respectful communication</span>
          </li>
          <li className="flex items-start text-sm text-gray-600">
            <MessageSquare className="h-5 w-5 mr-3 text-blue-500 flex-shrink-0" />
            <span>Share concrete examples and evidence to support discussions</span>
          </li>
          <li className="flex items-start text-sm text-gray-600">
            <Users className="h-5 w-5 mr-3 text-amber-500 flex-shrink-0" />
            <span>Consider diverse perspectives and regional contexts</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
);

// 9. App component
const App = () => {
  const [currentPage, setCurrentPage] = useState('home');

  return (
    <div className="min-h-screen bg-gray-100">
      <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <main>
        {currentPage === 'home' && <HomePage />}
        {currentPage === 'members' && <MembersPage />}
        {currentPage === 'library' && <LibraryPage />}
        {currentPage === 'forum' && <ForumPage />}
      </main>
    </div>
  );
};

// 10. Export
export default App;