import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { projetManagementService } from '../../services/projectManagement';
import { projectNotificationService } from '../../services/projectNotificationService';
import { motion } from 'framer-motion';

const ProjectSubmission = ({ onSubmit }) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    objectives: [''],
    budget: {
      amount: '',
      currency: 'EUR',
      fundingType: 'fiat',
    },
    timeline: {
      startDate: '',
      endDate: '',
      milestones: [{ title: '', date: '', description: '' }]
    },
    requiredSkills: [''],
    visibility: 'members'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const projectData = {
        ...formData,
        creator: {
          uid: user.uid,
          email: user.email,
          role: user.role
        }
      };

      // Créer le projet
      const newProject = await projetManagementService.ajouterProjet(projectData);
      console.log('Projet créé avec succès:', newProject);

      // Notification aux signataires du ToR
      await projectNotificationService.notifyNewProject(
        { ...projectData, id: newProject.id }
      );

      onSubmit();
    } catch (error) {
      console.error('Error creating project:', error);
      setError('Une erreur est survenue lors de la création du projet.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkillAdd = () => {
    setFormData({
      ...formData,
      requiredSkills: [...formData.requiredSkills, '']
    });
  };

  const handleSkillChange = (index, value) => {
    const newSkills = [...formData.requiredSkills];
    newSkills[index] = value;
    setFormData({
      ...formData,
      requiredSkills: newSkills
    });
  };

  const handleSkillRemove = (index) => {
    setFormData({
      ...formData,
      requiredSkills: formData.requiredSkills.filter((_, i) => i !== index)
    });
  };

  const handleMilestoneAdd = () => {
    setFormData({
      ...formData,
      timeline: {
        ...formData.timeline,
        milestones: [...formData.timeline.milestones, { title: '', date: '', description: '' }]
      }
    });
  };

  const handleMilestoneChange = (index, field, value) => {
    const newMilestones = [...formData.timeline.milestones];
    newMilestones[index] = {
      ...newMilestones[index],
      [field]: value
    };
    setFormData({
      ...formData,
      timeline: {
        ...formData.timeline,
        milestones: newMilestones
      }
    });
  };

  const handleMilestoneRemove = (index) => {
    setFormData({
      ...formData,
      timeline: {
        ...formData.timeline,
        milestones: formData.timeline.milestones.filter((_, i) => i !== index)
      }
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6"
    >
      <div className="border-b border-gray-200 pb-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Create New Project</h2>
        <p className="mt-1 text-sm text-gray-500">
          Fill in the details below to create a new project. All members will be notified.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Project Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          </div>
        </section>

        {/* Budget Information */}
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Budget Amount</label>
              <input
                type="number"
                value={formData.budget.amount}
                onChange={e => setFormData({
                  ...formData,
                  budget: { ...formData.budget, amount: e.target.value }
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Currency</label>
              <select
                value={formData.budget.currency}
                onChange={e => setFormData({
                  ...formData,
                  budget: { ...formData.budget, currency: e.target.value }
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
                <option value="ETH">ETH</option>
              </select>
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Timeline</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                <input
                  type="date"
                  value={formData.timeline.startDate}
                  onChange={e => setFormData({
                    ...formData,
                    timeline: { ...formData.timeline, startDate: e.target.value }
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">End Date</label>
                <input
                  type="date"
                  value={formData.timeline.endDate}
                  onChange={e => setFormData({
                    ...formData,
                    timeline: { ...formData.timeline, endDate: e.target.value }
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Milestones */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Milestones</label>
              {formData.timeline.milestones.map((milestone, index) => (
                <div key={index} className="mb-4 p-4 border rounded-md">
                  <div className="grid grid-cols-2 gap-4 mb-2">
                    <input
                      type="text"
                      value={milestone.title}
                      onChange={e => handleMilestoneChange(index, 'title', e.target.value)}
                      placeholder="Milestone title"
                      className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    <input
                      type="date"
                      value={milestone.date}
                      onChange={e => handleMilestoneChange(index, 'date', e.target.value)}
                      className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <textarea
                    value={milestone.description}
                    onChange={e => handleMilestoneChange(index, 'description', e.target.value)}
                    placeholder="Milestone description"
                    rows={2}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => handleMilestoneRemove(index)}
                      className="mt-2 text-sm text-red-600 hover:text-red-800"
                    >
                      Remove Milestone
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={handleMilestoneAdd}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800"
              >
                + Add Milestone
              </button>
            </div>
          </div>
        </section>

        {/* Required Skills */}
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Required Skills</h3>
          <div className="space-y-2">
            {formData.requiredSkills.map((skill, index) => (
              <div key={index} className="flex space-x-2">
                <input
                  type="text"
                  value={skill}
                  onChange={e => handleSkillChange(index, e.target.value)}
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter a required skill"
                />
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => handleSkillRemove(index)}
                    className="px-2 py-1 text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={handleSkillAdd}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800"
            >
              + Add Skill
            </button>
          </div>
        </section>

        {/* Submit Section */}
        <section className="border-t border-gray-200 pt-6">
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => onSubmit()}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
                isSubmitting
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isSubmitting ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </section>
      </form>
    </motion.div>
  );
};

export default ProjectSubmission;