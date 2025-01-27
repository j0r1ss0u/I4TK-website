import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { ExternalLink, Download, FileText, AlertCircle } from 'lucide-react';

// === PDF.JS CONFIGURATION ===
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const cacheConfig = {
  cMapUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdfjs-dist/${pdfjsLib.version}/cmaps/`,
  cMapPacked: true,
  standardFontDataUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdfjs-dist/${pdfjsLib.version}/standard_fonts/`
};

// === IPFS GATEWAYS CONFIG ===
const IPFS_GATEWAYS = [
  'https://ipfs.io/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
  'https://gateway.pinata.cloud/ipfs/',
  'https://dweb.link/ipfs/'
];

// === CACHE MANAGEMENT ===
const thumbnailCache = new Map();
const gatewayCache = new Map();

const DocumentViewer = ({ documentCid }) => {
  const [viewerState, setViewerState] = useState({
    isLoading: true,
    error: null,
    fileInfo: null,
    thumbnail: null,
    activeGateway: null
  });

  const canvasRef = useRef(null);
  const abortControllerRef = useRef(null);

  // === GATEWAY TESTING ===
  const findWorkingGateway = async (cid) => {
    // Check cache first
    if (gatewayCache.has(cid)) {
      return gatewayCache.get(cid);
    }

    const timeout = 5000; // 5 seconds timeout per gateway
    abortControllerRef.current = new AbortController();

    for (const gateway of IPFS_GATEWAYS) {
      try {
        const url = `${gateway}${cid}`;
        const response = await fetch(url, {
          method: 'HEAD',
          signal: abortControllerRef.current.signal,
          timeout
        });

        if (response.ok) {
          gatewayCache.set(cid, gateway);
          return gateway;
        }
      } catch (error) {
        console.warn(`Gateway ${gateway} failed:`, error);
        continue;
      }
    }
    throw new Error('Aucun gateway IPFS accessible');
  };

  // === THUMBNAIL GENERATION ===
  const generateThumbnail = async (pdfUrl) => {
    if (thumbnailCache.has(pdfUrl)) {
      return thumbnailCache.get(pdfUrl);
    }

    try {
      const loadingTask = pdfjsLib.getDocument({
        url: pdfUrl,
        ...cacheConfig
      });

      const pdf = await loadingTask.promise;
      const page = await pdf.getPage(1);

      // Optimize canvas for mobile
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d', { alpha: false });

      // Smaller thumbnail for mobile
      const desiredWidth = window.innerWidth < 768 ? 150 : 200;
      const viewport = page.getViewport({ scale: 1.0 });
      const scale = desiredWidth / viewport.width;
      const scaledViewport = page.getViewport({ scale });

      canvas.width = scaledViewport.width;
      canvas.height = scaledViewport.height;

      await page.render({
        canvasContext: context,
        viewport: scaledViewport,
        intent: 'print' // Optimize for speed over quality
      }).promise;

      const thumbnail = canvas.toDataURL('image/jpeg', 0.7); // Use JPEG with compression
      thumbnailCache.set(pdfUrl, thumbnail);
      return thumbnail;
    } catch (error) {
      console.error('Erreur de génération de la miniature:', error);
      return null;
    }
  };

  // === DOCUMENT LOADING ===
  useEffect(() => {
    const loadDocument = async () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      setViewerState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const gateway = await findWorkingGateway(documentCid);
        const url = `${gateway}${documentCid}`;

        const response = await fetch(url, {
          method: 'HEAD',
          signal: abortControllerRef.current.signal
        });

        const contentType = response.headers.get('content-type');
        const contentLength = response.headers.get('content-length');
        const size = contentLength ? Math.round(parseInt(contentLength) / 1024) : null;

        // Generate thumbnail in background
        const thumbnail = await generateThumbnail(url);

        setViewerState({
          isLoading: false,
          error: null,
          fileInfo: { type: contentType, size },
          thumbnail,
          activeGateway: gateway
        });

      } catch (error) {
        console.error('Erreur:', error);
        setViewerState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Document temporairement inaccessible, veuillez réessayer',
          activeGateway: null
        }));
      }
    };

    loadDocument();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [documentCid]);

  // === UTILITY FUNCTIONS ===
  const formatFileSize = (size) => {
    if (!size) return '';
    if (size < 1024) return `${size} KB`;
    return `${(size / 1024).toFixed(1)} MB`;
  };

  const getDocumentUrl = () => {
    return viewerState.activeGateway ? `${viewerState.activeGateway}${documentCid}` : null;
  };

  // === RENDER ===
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
      {/* Preview Container */}
      <div className="w-full h-24 md:h-[120px] mb-3 md:mb-4 border rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
        {viewerState.isLoading ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-5 w-5 md:h-6 md:w-6 border-b-2 border-blue-500"></div>
            <p className="text-xs md:text-sm text-gray-500 mt-2">Chargement...</p>
          </div>
        ) : viewerState.error ? (
          <div className="flex flex-col items-center text-red-500 p-2 text-center">
            <AlertCircle className="w-6 h-6 md:w-8 md:h-8 mb-1" />
            <p className="text-xs md:text-sm">{viewerState.error}</p>
          </div>
        ) : viewerState.thumbnail ? (
          <div className="relative w-full h-full">
            <img 
              src={viewerState.thumbnail} 
              alt="Aperçu du document"
              className="object-contain w-full h-full"
            />
            {viewerState.fileInfo?.size && (
              <div className="absolute bottom-1 right-1 bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                {formatFileSize(viewerState.fileInfo.size)}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <FileText className="w-12 h-12 md:w-16 md:h-16 text-blue-600 mb-1" />
            <p className="text-xs md:text-sm text-gray-600">Document PDF</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {getDocumentUrl() && (
        <div className="space-y-2 md:space-y-3">
          <div>
            <p className="text-xs text-gray-500 font-medium mb-1">Ouvrir :</p>
            <a
              href={getDocumentUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-sm flex items-center group"
            >
              <ExternalLink className="w-4 h-4 mr-1 group-hover:scale-110 transition-transform" />
              Ouvrir le document
            </a>
          </div>

          <div>
            <p className="text-xs text-gray-500 font-medium mb-1">Télécharger :</p>
            <a
              href={getDocumentUrl()}
              download
              className="text-gray-600 hover:text-gray-800 hover:underline text-sm flex items-center group"
            >
              <Download className="w-4 h-4 mr-1 group-hover:scale-110 transition-transform" />
              Télécharger {viewerState.fileInfo?.size && `(${formatFileSize(viewerState.fileInfo.size)})`}
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentViewer;