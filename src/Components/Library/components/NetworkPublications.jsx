import React, { useState } from 'react';
import { useContractWrite } from 'wagmi';
import { contractConfig } from '../../../config/wagmiConfig';

const MOCK_PUBLICATIONS = [
  {
    id: 1,
    title: "Internet for Trust Guidelines",
    authors: "UNESCO Guidelines Committee",
    description: "Guidelines for an Internet for Trust Safeguarding freedom of expression.",
    tags: ["Policy", "Guidelines"],
    publicationDate: "2024-01-15",
    status: "published",
    ipfsCid: "QmX..."
  },
  {
    id: 2,
    title: "Digital Platform Governance Framework",
    authors: "John Doe, Jane Smith",
    description: "A comprehensive analysis of digital platform governance mechanisms.",
    tags: ["Research", "Governance"],
    publicationDate: "2024-02-01",
    status: "under_review",
    ipfsCid: "QmY...",
    comments: [
      {
        id: 1,
        author: "0xe2Fb7190B439d1A24cbd72CD815695fB7d10B7da",
        text: "Please expand section 3.2 on regulatory frameworks.",
        timestamp: "2024-02-02T10:00:00Z"
      }
    ]
  }
];

const NetworkPublications = ({ 
  isWeb3Validator,  // From wallet connection
  isWeb3Admin,      // From wallet connection
  isWebMember,      // From web authentication
  isWebAdmin,       // From web authentication
  address 
}) => {
  const [comments, setComments] = useState({});

  const { write: validateDocument } = useContractWrite({
    ...contractConfig,
    functionName: 'validateDocument'
  });

  const { write: addComment } = useContractWrite({
    ...contractConfig,
    functionName: 'addComment'
  });

  // Filter documents based on user's access level
  const getVisibleDocuments = () => {
    return MOCK_PUBLICATIONS.filter(doc => {
      if (doc.status === 'published') {
        return true; // Published documents are visible to everyone
      }
      // Under review documents are only visible to authenticated members and admins
      return isWebMember || isWebAdmin;
    });
  };

  // Check if user can validate (Web3 validator or admin)
  const canValidate = isWeb3Validator || isWeb3Admin;

  const handleAddComment = (docId) => {
    if (!comments[docId]?.trim()) return;

    addComment({
      args: [docId, comments[docId]],
      onSuccess: () => {
        setComments(prev => ({ ...prev, [docId]: '' }));
      }
    });
  };

  const handleValidate = (docId, approved) => {
    validateDocument({
      args: [docId, approved],
      onSuccess: () => {
        // Handle success
      }
    });
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      {getVisibleDocuments().map((doc) => (
        <div key={doc.id} className="bg-white/50 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          {/* Document header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-serif font-bold text-gray-900">{doc.title}</h3>
            <div className="flex space-x-2">
              {doc.tags.map((tag, index) => (
                <span 
                  key={index}
                  className="px-3 py-1 text-xs bg-green-100 text-green-600 rounded-full font-medium"
                >
                  {tag}
                </span>
              ))}
              {doc.status === 'under_review' && (
                <span className="px-3 py-1 text-xs bg-yellow-100 text-yellow-600 rounded-full font-medium">
                  Under Review
                </span>
              )}
            </div>
          </div>

          {/* Document content */}
          <p className="text-gray-600 mb-4 text-lg leading-relaxed">{doc.description}</p>
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span className="font-medium">Authors: {doc.authors}</span>
            <span>Published: {doc.publicationDate}</span>
          </div>

          {/* Comments and validation section - only visible for under review documents */}
          {doc.status === 'under_review' && (isWebMember || isWebAdmin) && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              {/* Comments section */}
              <div className="space-y-4 mb-4">
                <h4 className="font-medium text-gray-900">Review Comments</h4>
                {doc.comments?.map((comment) => (
                  <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">
                        {comment.author.slice(0, 6)}...{comment.author.slice(-4)}
                      </span>
                      <span className="text-gray-500">
                        {new Date(comment.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="mt-1 text-gray-600">{comment.text}</p>
                  </div>
                ))}

                {/* Comment input */}
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={comments[doc.id] || ''}
                    onChange={(e) => setComments(prev => ({...prev, [doc.id]: e.target.value}))}
                    placeholder="Add a comment..."
                    className="flex-1 rounded-md border-gray-300 shadow-sm"
                  />
                  <button 
                    onClick={() => handleAddComment(doc.id)}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Comment
                  </button>
                </div>
              </div>

              {/* Validation buttons - only visible for Web3 validators/admins */}
              {canValidate && (
                <div className="flex space-x-4 mt-4">
                  <button 
                    onClick={() => handleValidate(doc.id, true)}
                    className="flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
                  >
                    Approve Publication
                  </button>
                                  </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default NetworkPublications;