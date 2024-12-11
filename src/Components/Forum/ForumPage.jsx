import React, { useState } from 'react';
import { withAuth } from '../AuthContext';
import ProjectList from './ProjectList';
import ProjectSubmission from './ProjectSubmission';
import ProjectDetails from './ProjectDetails';
const ForumPage = () => {
  const [currentView, setCurrentView] = useState('list');
  const [selectedProject, setSelectedProject] = useState(null);
  const renderContent = () => {
    switch (currentView) {
      case 'new':
        return <ProjectSubmission onSubmit={() => setCurrentView('list')} />;
      case 'details':
        if (!selectedProject) {
          setCurrentView('list');
          return <ProjectList 
            onProjectSelect={(project) => {
              setSelectedProject(project);
              setCurrentView('details');
            }} 
          />;
        }
        return (
          <ProjectDetails 
            projectId={selectedProject} 
            onBack={() => setCurrentView('list')} 
          />
        );
      case 'list':
      default:
        return (
          <ProjectList 
            onProjectSelect={(project) => {
              setSelectedProject(project);
              setCurrentView('details');
            }} 
          />
        );
    }
  };
  return (
    <div className="bg-white bg-opacity-90 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-serif font-bold text-gray-900">
              Project Marketplace
            </h2>
            <p className="mt-2 text-lg text-gray-600">
              Support and collaborate on I4TK projects
            </p>
          </div>
          {currentView === 'list' ? (
            <button
              onClick={() => {
                setCurrentView('new');
                setSelectedProject(null);  // Reset selectedProject
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              New Project
            </button>
          ) : (
            <button
              onClick={() => {
                setCurrentView('list');
                setSelectedProject(null);  // Reset selectedProject
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700"
            >
              Back to List
            </button>
          )}
        </div>
        {renderContent()}
      </div>
    </div>
  );
};
export const ProtectedForumPage = withAuth(ForumPage, ["member", "admin"]);
export default ForumPage;