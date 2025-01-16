// -------------------------------------------
// GovernanceView.jsx
// Composant de gestion de la gouvernance de l'association
// Accessible uniquement aux membres et administrateurs
// -------------------------------------------

import React, { useState, useEffect } from 'react';
import { Edit, Save, X, Plus, Trash2, Mail, Linkedin } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { useMembers } from './MembersContext';

// -------------------------------------------
// Types et constantes
// -------------------------------------------
const GOVERNANCE_TYPES = {
  PRESIDENCY: 'Presidency',
  STEERING: 'Steering Committee',
  ETHICS: 'Ethics Committee',
  OPERATING: 'Operating Team'
};

// -------------------------------------------
// Composant de formulaire d'édition
// -------------------------------------------
const EditForm = ({ member, type, onSave, onCancel, availableOrganizations }) => {
  const [formData, setFormData] = useState(member);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(type, formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Organization</label>
        <select
          value={formData.organization}
          onChange={(e) => setFormData(prev => ({ ...prev, organization: e.target.value }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
          required
        >
          <option value="">Select an organization</option>
          {availableOrganizations.map(org => (
            <option key={org} value={org}>{org}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">LinkedIn URL</label>
        <input
          type="url"
          value={formData.linkedin}
          onChange={(e) => setFormData(prev => ({ ...prev, linkedin: e.target.value }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Comments</label>
        <textarea
          value={formData.comments}
          onChange={(e) => setFormData(prev => ({ ...prev, comments: e.target.value }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
          rows="3"
        />
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm bg-amber-600 text-white rounded-md hover:bg-amber-700"
        >
          Save
        </button>
      </div>
    </form>
  );
};

// -------------------------------------------
// Composant section de gouvernance
// -------------------------------------------
const GovernanceSection = ({ title, type, members: governanceMembers, onAdd, onEdit, onDelete, onSave, editMode, editingItem, availableOrganizations }) => (
  <div className="mb-8">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
      {onAdd && (
        <button
          onClick={() => onAdd(type)}
          className="flex items-center px-3 py-2 text-sm bg-amber-600 text-white rounded-md hover:bg-amber-700"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Member
        </button>
      )}
    </div>
    <div className="space-y-4">
      {governanceMembers.map(member => (
        <div key={member.id} className="bg-white rounded-lg shadow-sm p-4">
          {editMode && editingItem?.id === member.id ? (
            <EditForm
              member={member}
              type={type}
              onSave={onSave}
              onCancel={() => onEdit(null)}
              availableOrganizations={availableOrganizations}
            />
          ) : (
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <h3 className="font-medium text-gray-900">{member.name}</h3>
                <p className="text-sm text-gray-600">{member.organization}</p>
                <div className="flex space-x-4">
                  {member.linkedin && (
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                    >
                      <Linkedin className="h-4 w-4 mr-1" />
                      LinkedIn
                    </a>
                  )}
                  {member.email && (
                    <a
                      href={`mailto:${member.email}`}
                      className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                    >
                      <Mail className="h-4 w-4 mr-1" />
                      Email
                    </a>
                  )}
                </div>
                {member.comments && (
                  <p className="text-sm text-gray-500">{member.comments}</p>
                )}
              </div>
              {onEdit && onDelete && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => onEdit(member)}
                    className="p-1 text-gray-600 hover:text-gray-900"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDelete(type, member.id)}
                    className="p-1 text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
);

// -------------------------------------------
// Composant principal GovernanceView
// -------------------------------------------
const GovernanceView = () => {
  const { user } = useAuth();
  const { members } = useMembers();
  const [governanceData, setGovernanceData] = useState(() => {
    const saved = localStorage.getItem('governanceData');
    return saved ? JSON.parse(saved) : {
      [GOVERNANCE_TYPES.PRESIDENCY]: [],
      [GOVERNANCE_TYPES.STEERING]: [],
      [GOVERNANCE_TYPES.ETHICS]: [],
      [GOVERNANCE_TYPES.OPERATING]: []
    };
  });

  const [editMode, setEditMode] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Persistance des données
  useEffect(() => {
    localStorage.setItem('governanceData', JSON.stringify(governanceData));
  }, [governanceData]);

  // Gestion des actions (uniquement pour les admins)
  const handleAdd = (type) => {
    if (user?.role !== 'admin') return;

    const newMember = {
      id: Date.now(),
      name: '',
      organization: '',
      linkedin: '',
      email: '',
      comments: ''
    };

    setGovernanceData(prev => ({
      ...prev,
      [type]: [...prev[type], newMember]
    }));
    setEditingItem(newMember);
    setEditMode(true);
  };

  const handleEdit = (member) => {
    if (user?.role !== 'admin') return;
    setEditingItem(member);
    setEditMode(true);
  };

  const handleSave = (type, editedMember) => {
    setGovernanceData(prev => ({
      ...prev,
      [type]: prev[type].map(m => 
        m.id === editedMember.id ? editedMember : m
      )
    }));
    setEditMode(false);
    setEditingItem(null);
  };

  const handleDelete = (type, memberId) => {
    if (user?.role !== 'admin' || !window.confirm('Are you sure you want to delete this member?')) return;

    setGovernanceData(prev => ({
      ...prev,
      [type]: prev[type].filter(m => m.id !== memberId)
    }));
  };

  // Vérification des permissions
  if (!user || (user.role !== 'admin' && user.role !== 'member')) {
    return (
      <div className="p-4 text-center text-gray-600">
        You need to be logged in as a member or administrator to view this page.
      </div>
    );
  }

  // Props communs pour les sections
  const sectionProps = {
    onAdd: user?.role === 'admin' ? handleAdd : null,
    onEdit: user?.role === 'admin' ? handleEdit : null,
    onDelete: user?.role === 'admin' ? handleDelete : null,
    onSave: handleSave,
    editMode,
    editingItem,
    availableOrganizations: members.map(m => m.name)
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      {Object.entries(GOVERNANCE_TYPES).map(([key, title]) => (
        <GovernanceSection
          key={key}
          title={title}
          type={title}
          members={governanceData[title]}
          {...sectionProps}
        />
      ))}
    </div>
  );
};

export default GovernanceView;