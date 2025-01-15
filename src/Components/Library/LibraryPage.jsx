// =============== IMPORTS ===============
import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { useAccount, useContractRead } from 'wagmi';
import { useAuth } from '../AuthContext';
import WalletConnect from "./WalletConnect";
import { contractConfig } from '../../config/wagmiConfig';
import NetworkPublications from './components/NetworkPublications';
import SubmitContribution from './components/SubmitContribution';
import LibrarianSpace from './components/LibrarianSpace';
import { documentsService } from '../../services/documentsService';
import I4TKDashboard from './components/I4TDashboard';

// =============== ROLE HASHES ===============
const ROLE_HASHES = {
  ADMIN: '0xa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c21775',
  CONTRIBUTOR: '0xe2889e7308860b3fe8df0daa86fccfea4d71e43776719a57be28cf90b6db81e9',
  VALIDATOR: '0x21702c8af46127c7fa207f89d0b0a8441bb32959a0ac7df790e9ab1a25c98926'
};

// =============== TABS CONFIGURATION ===============
const TABS = {
  NETWORK_PUBLICATIONS: 'network-publications',
  SUBMIT_CONTRIBUTION: 'submit-contribution',
  PEER_REVIEW: 'peer-review',
  LIBRARIAN_SPACE: 'librarian-space',
  I4T_AND_I: 'i4t-and-i',
};

const LibraryPage = () => {
  // =============== STATES ===============
  const [activeTab, setActiveTab] = useState(TABS.NETWORK_PUBLICATIONS);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);
  const [web3Roles, setWeb3Roles] = useState({
    isValidator: false,
    isAdmin: false,
    isContributor: false
  });

  // =============== HOOKS ===============
  const { address, isConnected } = useAccount({
    onConnect({ address }) {
      updateWeb3Roles(address);
    },
    onDisconnect() {
      setWeb3Roles({
        isValidator: false,
        isAdmin: false,
        isContributor: false
      });
    }
  });

  const { user } = useAuth();

  // =============== CONTRACT READS ===============
  const { data: hasContributorRole } = useContractRead({
    ...contractConfig,
    functionName: 'hasRole',
    args: [ROLE_HASHES.CONTRIBUTOR, address],
    enabled: !!address,
    watch: true
  });

  const { data: hasValidatorRole } = useContractRead({
    ...contractConfig,
    functionName: 'hasRole',
    args: [ROLE_HASHES.VALIDATOR, address],
    enabled: !!address,
    watch: true
  });

  const { data: hasAdminRole } = useContractRead({
    ...contractConfig,
    functionName: 'hasRole',
    args: [ROLE_HASHES.ADMIN, address],
    enabled: !!address,
    watch: true
  });

  // =============== AUTHENTICATION STATES ===============
  const isWebMember = user && (user.role === 'member' || user.role === 'admin');
  const isWebAdmin = user?.role === 'admin';

  // =============== REAL-TIME SEARCH ===============
  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (searchTerm.trim()) {
        setIsSearching(true);
        setError(null);

        try {
          const results = await documentsService.semanticSearch(searchTerm, 'en');
          setSearchResults(results);
        } catch (err) {
          console.error('Erreur de recherche:', err);
          setError(err.message || 'Erreur lors de la recherche');
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300); // Délai de 300ms

    return () => clearTimeout(searchTimeout);
  }, [searchTerm]);

  // =============== EFFECTS ===============
  useEffect(() => {
    updateWeb3Roles(address);
  }, [address, hasContributorRole, hasValidatorRole, hasAdminRole]);

  // =============== HELPER FUNCTIONS ===============
  const updateWeb3Roles = (addr) => {
    if (!addr) {
      setWeb3Roles({
        isValidator: false,
        isAdmin: false,
        isContributor: false
      });
      return;
    }

    setWeb3Roles({
      isContributor: hasContributorRole,
      isValidator: hasValidatorRole,
      isAdmin: hasAdminRole
    });
  };

  const getAvailableTabs = () => {
    const tabs = {
      [TABS.NETWORK_PUBLICATIONS]: 'Peer reviews'
    };

    if (web3Roles.isContributor) {
      tabs[TABS.SUBMIT_CONTRIBUTION] = 'Submit Contribution';
    }

    if (web3Roles.isAdmin) {
      tabs[TABS.LIBRARIAN_SPACE] = 'Librarian Space';
    }

    if (isWebMember) {
      tabs[TABS.I4T_AND_I] = 'IP monitoring';
    }
    return tabs;
  };

  // =============== RENDER FUNCTIONS ===============
  const renderSubmitContributionTab = () => (
    <div className="max-w-3xl mx-auto">
      <SubmitContribution />
    </div>
  );

  const renderI4TAndITab = () => (
    <div className="max-w-6xl mx-auto space-y-6">
      <h2 className="text-2xl font-serif font-bold">I4T & I Dashboard</h2>
      <div className="mt-4">
        <I4TKDashboard />
      </div>
    </div>
  );

  const renderLibrarianSpaceTab = () => (
    <div className="max-w-3xl mx-auto">
      <LibrarianSpace />
    </div>
  );

  return (
    <div className="bg-transparent">
      <div className="relative">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8">
              <div className="text-center mb-12">
                <h1 className="text-4xl tracking-tight font-serif text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block">I4T Knowledge Library</span>
                </h1>

                {isWebMember && (
                  <div className="mt-6">
                    <WalletConnect />
                  </div>
                )}

                <div className="mt-6 max-w-xl mx-auto">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search documents..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search 
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" 
                    />
                  </div>
                </div>

                {!isWebMember && (
                  <div className="mt-4 text-sm text-gray-600">
                    Login as a member to access peer-review features
                  </div>
                )}

                {isWebMember && (
                  <div className="mt-8 border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8 justify-center">
                      {Object.entries(getAvailableTabs()).map(([key, label]) => (
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
                )}
              </div>

              <div className="mt-8">
                {(() => {
                  switch (activeTab) {
                    case TABS.SUBMIT_CONTRIBUTION:
                      return web3Roles.isContributor && renderSubmitContributionTab();
                    case TABS.I4T_AND_I:
                      return isWebMember && renderI4TAndITab();
                    case TABS.LIBRARIAN_SPACE:
                      return web3Roles.isAdmin && renderLibrarianSpaceTab();
                    default:
                      return (
                        <NetworkPublications
                          isWeb3Validator={web3Roles.isValidator}
                          isWeb3Admin={web3Roles.isAdmin}
                          isWebMember={isWebMember}
                          isWebAdmin={isWebAdmin}
                          address={address}
                          searchTerm={searchTerm}
                          searchResults={searchResults}
                          isSearching={isSearching}
                          error={error}
                        />
                      );
                  }
                })()}
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LibraryPage;