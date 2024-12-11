import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { projetManagementService } from '../../services/projectManagement';

const ProjectDetails = ({ projectId, onBack }) => {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching project details for:', projectId);

        const projects = await projetManagementService.getProjets();
        const projectData = projects.find(p => p.id === projectId);

        if (!projectData) {
          setError('Project not found');
          return;
        }

        const normalizedProject = {
          id: projectData.id,
          title: projectData.title || '',
          description: projectData.description || '',
          budget: projectData.budget || { amount: 0, currency: 'EUR', fundingType: 'fiat' },
          timeline: projectData.timeline || { startDate: '', endDate: '', milestones: [] },
          requiredSkills: projectData.requiredSkills || [],
          visibility: projectData.visibility || 'public',
          creator: projectData.creator || { uid: '', email: '', role: 'member' },
          status: projectData.status || { current: 'draft', lastUpdated: new Date() },
          comments: projectData.comments || {},
          createdAt: projectData.createdAt || new Date(),
          updatedAt: projectData.updatedAt || new Date()
        };

        setProject(normalizedProject);
      } catch (error) {
        console.error('Error loading project:', error);
        setError('Unable to load project details');
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  const handleStatusChange = async (newStatus) => {
    try {
      if (updatingStatus) return;

      setUpdatingStatus(true);
      setError(null);

      // Vérifier si l'utilisateur est le créateur
      if (project.creator.uid !== user.uid) {
        setError('Only the project creator can update the status');
        return;
      }

      console.log('Updating status to:', newStatus);
      await projetManagementService.updateProjectStatus(projectId, newStatus, user.uid);

      setProject(prev => ({
        ...prev,
        status: {
          current: newStatus,
          lastUpdated: new Date()
        }
      }));

      console.log('Status updated successfully');
    } catch (error) {
      console.error('Error updating status:', error);
      setError(error.message || 'Failed to update project status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || submittingComment) return;

    try {
      setSubmittingComment(true);
      setError(null);

      const commentData = {
        content: newComment.trim(),
        author: {
          uid: user.uid,
          email: user.email
        }
      };

      const addedComment = await projetManagementService.addComment(projectId, commentData);

      setProject(prev => ({
        ...prev,
        comments: {
          ...prev.comments,
          [addedComment.id]: {
            content: addedComment.content,
            userEmail: addedComment.userEmail,
            timestamp: addedComment.timestamp
          }
        }
      }));

      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
      setError('Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading project details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={onBack}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          Back to Projects
        </button>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-600 mb-4">Project not found</div>
        <button
          onClick={onBack}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          Back to Projects
        </button>
      </div>
    );
  }

  const commentsArray = Object.entries(project.comments || {}).map(([id, comment]) => ({
    id,
    ...comment
  }));

  const isCreator = project.creator.uid === user.uid;

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{project.title}</h2>
            <p className="mt-2 text-sm text-gray-500">
              Created by {project.creator.email} • {new Date(project.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status.current)}`}>
              {project.status.current}
            </span>
            {isCreator && (
              <select
                value={project.status.current}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={updatingStatus}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="inProgress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            )}
          </div>
        </div>
        {error && (
          <div className="mt-2 text-sm text-red-600">
            {error}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Description */}
        <div>
          <h3 className="text-lg font-medium text-gray-900">Description</h3>
          <p className="mt-2 text-gray-600">{project.description}</p>
        </div>

        {/* Budget */}
        {project.budget && (
          <div>
            <h3 className="text-lg font-medium text-gray-900">Budget</h3>
            <div className="mt-2 text-gray-600">
              {project.budget.amount} {project.budget.currency}
            </div>
          </div>
        )}

        {/* Required Skills */}
        {project.requiredSkills?.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-900">Required Skills</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {project.requiredSkills.map((skill, index) => (
                <span 
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Comments Section */}
        <div className="pt-6 border-t">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Comments ({commentsArray.length})
          </h3>


          {/* Comment Form */}
          <form onSubmit={handleCommentSubmit} className="mb-6">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows={3}
              placeholder="Add a comment..."
              disabled={submittingComment}
            />
            <div className="mt-2 flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                disabled={submittingComment || !newComment.trim()}
              >
                {submittingComment ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-4">
            {commentsArray.length === 0 ? (
              <p className="text-center text-gray-500">No comments yet</p>
            ) : (
              commentsArray.map((comment) => (
                <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="text-sm font-medium text-gray-900">
                      {comment.userEmail}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(comment.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <p className="mt-2 text-gray-600">{comment.content}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Back Button */}
        <div className="flex justify-start pt-6">
          <button
            onClick={onBack}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Back to Projects
          </button>
        </div>
      </div>
    </div>
  );
};

const getStatusColor = (status) => {
  const colors = {
    draft: 'bg-gray-100 text-gray-800',
    published: 'bg-blue-100 text-blue-800',
    inProgress: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800'
  };
  return colors[status] || colors.draft;
};

export default ProjectDetails;