// -------------------------------------------
// MembersPage.jsx
// Page principale de gestion des membres du réseau
// Composant parent qui gère l'affichage des différentes vues
// -------------------------------------------

import React, { useState, useEffect } from 'react';
import { MapPin, Building2, Mail, Edit, Trash2, Plus, X, Search, Users, Globe2 } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { useMembers } from './MembersContext';
import MapView from './MapView';
import GovernanceView from './GovernanceView';

// -------------------------------------------
// Composant MemberCard
// Carte individuelle affichant les informations d'un membre
// -------------------------------------------
const MemberCard = ({ member }) => (
  <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <h3 className="text-lg font-medium text-gray-900">
          {member.name}
          {member.fullName && (
            <span className="block text-sm text-gray-500 mt-1">
              {member.fullName}
            </span>
          )}
        </h3>
        <div className="mt-4 space-y-2">
          <div className="flex items-center text-sm text-gray-500">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{member.city}, {member.country}</span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Users className="h-4 w-4 mr-1" />
            <span>{member.category}</span>
          </div>
          {member.website && (
            <div className="flex items-center text-sm text-blue-500 hover:text-blue-600">
              <Globe2 className="h-4 w-4 mr-1" />
              <a href={`https://${member.website}`} target="_blank" rel="noopener noreferrer">
                {member.website}
              </a>
            </div>
          )}
        </div>
      </div>
      {member.logo ? (
        <img 
          src={member.logo} 
          alt={member.name} 
          className="h-16 w-16 rounded-full object-cover"
        />
      ) : (
        <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
          <Building2 className="h-8 w-8 text-gray-400" />
        </div>
      )}
    </div>
  </div>
);

// -------------------------------------------
// Composant CardsView
// Vue principale affichant la liste des membres sous forme de cartes
// -------------------------------------------
const CardsView = () => {
  const { members } = useMembers();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    console.log("Données des membres:", members);
    console.log("Nombre total de membres:", members.length);
  }, [members]);

  const filteredMembers = members.filter(member => {
    if (!member) return false;
    const searchLower = searchTerm.toLowerCase();
    return (
      member.name?.toLowerCase().includes(searchLower) ||
      member.fullName?.toLowerCase().includes(searchLower) ||
      member.city?.toLowerCase().includes(searchLower) ||
      member.country?.toLowerCase().includes(searchLower) ||
      member.category?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div>
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by name, location, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md"
          />
          <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredMembers.map((member) => (
          <MemberCard key={member.id} member={member} />
        ))}
      </div>
    </div>
  );
};

// -------------------------------------------
// Composant MapViewWrapper
// Wrapper pour la vue carte
// -------------------------------------------
const MapViewWrapper = () => <MapView />;

// -------------------------------------------
// Composant AdminView
// Vue d'administration pour la gestion des membres
// Accessible uniquement aux administrateurs
// -------------------------------------------
const AdminView = () => {
  const { members, updateMembers } = useMembers();
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Handlers pour les actions CRUD
  const handleEdit = (member) => {
    setEditingMember(member);
    setShowForm(true);
  };

  const handleDelete = (memberId) => {
    if (window.confirm('Are you sure you want to delete this member?')) {
      const newMembers = members.filter(m => m.id !== memberId);
      updateMembers(newMembers);
    }
  };

  const handleSubmit = (formData) => {
    let newMembers;
    if (editingMember) {
      newMembers = members.map(m => 
        m.id === editingMember.id ? { ...formData, id: m.id } : m
      );
    } else {
      const newMember = {
        ...formData,
        id: Date.now(),
        isVisible: true
      };
      newMembers = [...members, newMember];
    }
    updateMembers(newMembers);
    setShowForm(false);
    setEditingMember(null);
  };

  // Filtrage des membres
  const filteredMembers = members.filter(member => {
    const searchLower = searchTerm.toLowerCase();
    return (
      member.name?.toLowerCase().includes(searchLower) ||
      member.city?.toLowerCase().includes(searchLower) ||
      member.country?.toLowerCase().includes(searchLower) ||
      member.category?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="w-full">
      {/* Barre d'actions */}
      <div className="mb-6 flex justify-between items-center">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md"
          />
          <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="ml-4 px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Member
        </button>
      </div>

      {/* Table des membres */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Website</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    {member.name}
                    {member.fullName && (
                      <span className="block text-sm text-gray-500">{member.fullName}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">{member.city}, {member.country}</td>
                  <td className="px-6 py-4">{member.category}</td>
                  <td className="px-6 py-4">
                    {member.website && (
                      <a 
                        href={`https://${member.website}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {member.website}
                      </a>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(member)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(member.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de formulaire */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full m-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingMember ? 'Edit Member' : 'Add Member'}
              </h3>
              <button onClick={() => {
                setShowForm(false);
                setEditingMember(null);
              }}>
                <X className="h-5 w-5 text-gray-400 hover:text-gray-500" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = {
                name: e.target.name.value,
                fullName: e.target.fullName.value,
                city: e.target.city.value,
                country: e.target.country.value,
                website: e.target.website.value,
                category: e.target.category.value,
                region: e.target.region.value,
                lat: parseFloat(e.target.lat.value),
                lng: parseFloat(e.target.lng.value)
              };
              handleSubmit(formData);
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  name="name"
                  type="text"
                  defaultValue={editingMember?.name}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  name="fullName"
                  type="text"
                  defaultValue={editingMember?.fullName}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">City</label>
                <input
                  name="city"
                  type="text"
                  defaultValue={editingMember?.city}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Country</label>
                <input
                  name="country"
                  type="text"
                  defaultValue={editingMember?.country}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Website</label>
                <input
                  name="website"
                  type="text"
                  defaultValue={editingMember?.website}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select
                  name="category"
                  defaultValue={editingMember?.category}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                  required
                >
                  <option value="">Select a category</option>
                  <option value="Academic">Academic</option>
                  <option value="Civil society">Civil society</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Region</label>
                <select
                  name="region"
                  defaultValue={editingMember?.region}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                  required
                >
                  <option value="">Select a region</option>
                  <option value="Europe">Europe</option>
                  <option value="Asia-Pacific">Asia-Pacific</option>
                  <option value="North America">North America</option>
                  <option value="South America">South America</option>
                  <option value="Africa">Africa</option>
                  <option value="Middle East">Middle East</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Latitude</label>
                <input
                  name="lat"
                  type="number"
                  step="0.000001"
                  defaultValue={editingMember?.lat}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Longitude</label>
                <input
                  name="lng"
                  type="number"
                  step="0.000001"
                  defaultValue={editingMember?.lng}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingMember(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700"
                >
                  {editingMember ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// -------------------------------------------
// Composant ViewSelector
// Gère la sélection des différentes vues
// -------------------------------------------
const ViewSelector = ({ viewMode, setViewMode, userRole }) => {
  const showGovernance = userRole === 'admin' || userRole === 'member';

  return (
    <div className="flex gap-4">
      <button
        onClick={() => setViewMode('cards')}
        className={`px-3 py-2 rounded ${viewMode === 'cards' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100'}`}
      >
        Members Details
      </button>
      <button
        onClick={() => setViewMode('map')}
        className={`px-3 py-2 rounded ${viewMode === 'map' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100'}`}
      >
        Map View
      </button>
      {userRole === 'admin' && (
        <button
          onClick={() => setViewMode('table')}
          className={`px-3 py-2 rounded ${viewMode === 'table' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100'}`}
        >
          Admin View
        </button>
      )}
      {showGovernance && (
        <button
          onClick={() => setViewMode('governance')}
          className={`px-3 py-2 rounded ${viewMode === 'governance' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100'}`}
        >
          Governance
        </button>
      )}
    </div>
  );
};

// -------------------------------------------
// Composant principal MembersPageWrapper
// -------------------------------------------
const MembersPageWrapper = ({ initialView }) => {  // Ajout de initialView dans les props
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState(initialView || 'cards');  // Utilisation de initialView

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-serif font-bold text-gray-900">Network Members</h1>
        <ViewSelector viewMode={viewMode} setViewMode={setViewMode} userRole={user?.role} />
      </div>

      {viewMode === 'cards' && <CardsView />}
      {viewMode === 'map' && <MapViewWrapper />}
      {viewMode === 'table' && user?.role === 'admin' && <AdminView />}
      {viewMode === 'governance' && (user?.role === 'admin' || user?.role === 'member') && <GovernanceView />}
    </div>
  );
};

// -------------------------------------------
// Export des composants
// -------------------------------------------
const components = {
  CardsView,
  MapViewWrapper,
  AdminView,
  MembersPageWrapper: ({ currentLang, initialView }) => (  // Ajout de initialView ici aussi
    <MembersPageWrapper currentLang={currentLang} initialView={initialView} />
  )
};

export default components;