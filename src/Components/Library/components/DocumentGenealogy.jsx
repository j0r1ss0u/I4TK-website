// =================================================================================
// 1. IMPORTS & DEPENDENCIES
// =================================================================================
import React, { useState, useEffect } from 'react';
import { useContractRead } from 'wagmi';
import { 
  GitFork, 
  ChevronDown, 
  ChevronRight, 
  Info, 
  Network 
} from 'lucide-react';
import { contractConfig } from '../../../config/wagmiConfig';
import { documentsService } from '../../../services/documentsService';
import { I4TKTokenAddress, I4TKTokenABI } from '../../../constants';

// =================================================================================
// 2. CONSTANTS & TYPES
// =================================================================================
const TREE_DEPTH_LIMIT = 5;
const BATCH_SIZE = 10;

// =================================================================================
// 3. AUXILIARY COMPONENTS
// =================================================================================
const TreeNode = ({ node, level = 0, onSelect, selectedId }) => {
  const [isExpanded, setIsExpanded] = useState(level < 2);
  const hasChildren = node.children?.length > 0;

  const handleToggle = (e) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="relative pl-6">
      <div 
        className={`
          flex items-center p-2 mb-2 rounded-lg cursor-pointer
          ${selectedId === node.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50 border-gray-200'}
          border transition-colors
        `}
        onClick={() => onSelect(node)}
      >
        {hasChildren && (
          <button
            onClick={handleToggle}
            className="absolute left-0 top-3 w-4 h-4 flex items-center justify-center"
          >
            {isExpanded ? 
              <ChevronDown className="w-4 h-4" /> : 
              <ChevronRight className="w-4 h-4" />
            }
          </button>
        )}
        <div className="flex flex-col">
          <span className="font-medium truncate max-w-md">{node.title}</span>
          <span className="text-sm text-gray-500">Token #{node.id}</span>
          <span className="text-xs text-gray-400">
            Citations: {node.citations?.length || 0}
          </span>
        </div>
      </div>
      {isExpanded && hasChildren && (
        <div className="border-l border-gray-200">
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              onSelect={onSelect}
              selectedId={selectedId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// =================================================================================
// 4. MAIN COMPONENT
// =================================================================================
const DocumentGenealogy = ({ tokenId }) => {
  // -----------------------------------------------------------------------------
  // 4.1 State Management
  // -----------------------------------------------------------------------------
  const [genealogyData, setGenealogyData] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // -----------------------------------------------------------------------------
  // 4.2 Contract Reads
  // -----------------------------------------------------------------------------
  const { data: tokenURI } = useContractRead({
    ...contractConfig,
    abi: I4TKTokenABI,
    functionName: 'uri',
    args: [BigInt(tokenId)],
    enabled: !!tokenId,
  });

  // -----------------------------------------------------------------------------
  // 4.3 Data Fetching Functions
  // -----------------------------------------------------------------------------
  const buildGenealogyTree = async (id, depth = 0, visited = new Set()) => {
    if (depth > TREE_DEPTH_LIMIT || visited.has(id)) return null;
    visited.add(id);

    try {
      const docData = await documentsService.getDocumentByTokenId(id.toString());
      if (!docData) return null;

      const citations = docData.citations || [];

      const children = [];
      for (let i = 0; i < citations.length; i += BATCH_SIZE) {
        const batch = citations.slice(i, i + BATCH_SIZE);
        const batchResults = await Promise.all(
          batch.map(citationId => buildGenealogyTree(citationId, depth + 1, visited))
        );
        children.push(...batchResults.filter(Boolean));
      }

      return {
        id,
        title: docData.title || `Document #${id}`,
        description: docData.description,
        author: docData.authors || docData.author,
        createdAt: docData.createdAt,
        citations,
        children
      };
    } catch (error) {
      console.error('Error building genealogy tree:', error);
      setError(error.message);
      return null;
    }
  };

  // -----------------------------------------------------------------------------
  // 4.4 Effects
  // -----------------------------------------------------------------------------
  useEffect(() => {
    const fetchGenealogy = async () => {
      if (!tokenId) return;

      setLoading(true);
      setError(null);

      try {
        const tree = await buildGenealogyTree(tokenId);
        setGenealogyData(tree);
      } catch (error) {
        setError('Error fetching genealogy: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGenealogy();
  }, [tokenId]);

  // -----------------------------------------------------------------------------
  // 4.5 Render Helpers
  // -----------------------------------------------------------------------------
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg">
        <p className="flex items-center gap-2">
          <Info className="w-5 h-5" />
          {error}
        </p>
      </div>
    );
  }

  // -----------------------------------------------------------------------------
  // 4.6 Main Render
  // -----------------------------------------------------------------------------
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 overflow-auto max-h-screen p-4">
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200 p-4">
            <div className="flex items-center gap-2">
              <GitFork className="w-6 h-6" />
              <h2 className="text-xl font-medium">Arbre de citations</h2>
            </div>
          </div>
          <div className="p-4">
            {genealogyData ? (
              <TreeNode
                node={genealogyData}
                onSelect={setSelectedNode}
                selectedId={selectedNode?.id}
              />
            ) : (
              <div className="text-center text-gray-500">
                Aucune donnée disponible
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200 p-4">
            <h2 className="text-xl font-medium">Détails du document</h2>
          </div>
          <div className="p-4">
            {selectedNode ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-lg">{selectedNode.title}</h3>
                  <p className="text-sm text-gray-600">Token #{selectedNode.id}</p>
                </div>
                {selectedNode.author && (
                  <div>
                    <h4 className="font-semibold text-sm text-gray-700">Auteur</h4>
                    <p className="text-sm">{selectedNode.author}</p>
                  </div>
                )}
                {selectedNode.description && (
                  <div>
                    <h4 className="font-semibold text-sm text-gray-700">Description</h4>
                    <p className="text-sm">{selectedNode.description}</p>
                  </div>
                )}
                <div>
                  <h4 className="font-semibold text-sm text-gray-700">Citations</h4>
                  {selectedNode.citations?.length > 0 ? (
                    <ul className="list-disc pl-4 text-sm">
                      {selectedNode.citations.map((citation, index) => (
                        <li key={index}>Référence #{citation}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">Aucune citation</p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-gray-500">
                Sélectionnez un document pour voir les détails
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentGenealogy;