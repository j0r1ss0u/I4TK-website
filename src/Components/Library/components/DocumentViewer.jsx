import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { ExternalLink, Download, FileText, AlertCircle, RefreshCw } from 'lucide-react';

// === PDF.JS CONFIGURATION ===
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const cacheConfig = {
  cMapUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdfjs-dist/${pdfjsLib.version}/cmaps/`,
  cMapPacked: true,
  standardFontDataUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdfjs-dist/${pdfjsLib.version}/standard_fonts/`
};

// === IPFS GATEWAYS CONFIG ===
const IPFS_GATEWAYS = [
  'https://cloudflare-ipfs.com/ipfs/',
  'https://gateway.ipfs.io/ipfs/',
  'https://ipfs.io/ipfs/',
  'https://dweb.link/ipfs/',
  'https://gateway.pinata.cloud/ipfs/',
  'https://ipfs.fleek.co/ipfs/',
  'https://ipfs.infura.io/ipfs/',
  'https://ipfs.gateway.valist.io/ipfs/'
];

// === CACHE MANAGEMENT ===
const thumbnailCache = new Map();
const gatewayCache = new Map();
const RETRY_DELAY = 2000; // 2 seconds between retries
const MAX_RETRIES = 3;

const DocumentViewer = ({ documentCid }) => {
  const [viewerState, setViewerState] = useState({
    isLoading: true,
    error: null,
    fileInfo: null,
    thumbnail: null,
    activeGateway: null,
    retryCount: 0
  });

  const abortControllerRef = useRef(null);
  const retryTimeoutRef = useRef(null);

  // === GATEWAY TESTING WITH PARALLEL REQUESTS ===
  const findWorkingGateway = async (cid) => {
    if (gatewayCache.has(cid)) {
      const cachedGateway = gatewayCache.get(cid);
      try {
        const response = await fetch(`${cachedGateway}${cid}`, {
          method: 'HEAD',
          signal: abortControllerRef.current.signal,
        });
        if (response.ok) return cachedGateway;
      } catch (error) {
        gatewayCache.delete(cid);
      }
    }

    const timeout = 3000; // 3 seconds timeout per gateway
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const testGateway = async (gateway) => {
      try {
        const response = await fetch(`${gateway}${cid}`, {
          method: 'HEAD',
          signal: controller.signal,
        });
        if (response.ok) return gateway;
      } catch {
        return null;
      }
    };

    // Test all gateways in parallel
    const results = await Promise.race([
      Promise.all(IPFS_GATEWAYS.map(testGateway)),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('All gateways timed out')), timeout)
      )
    ]);

    const workingGateway = results.find(gateway => gateway !== null);
    if (workingGateway) {
      gatewayCache.set(cid, workingGateway);
      return workingGateway;
    }

    throw new Error('Aucun gateway accessible');
  };

  // === RETRY LOGIC ===
  const retryLoad = () => {
    setViewerState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      retryCount: prev.retryCount + 1
    }));
    loadDocument();
  };

  // === DOCUMENT LOADING ===
  const loadDocument = async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }

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

      setViewerState(prev => ({
        ...prev,
        isLoading: false,
        error: null,
        fileInfo: { type: contentType, size },
        thumbnail,
        activeGateway: gateway
      }));

    } catch (error) {
      console.error('Erreur:', error);

      // Implement exponential backoff for retries
      if (viewerState.retryCount < MAX_RETRIES) {
        const delay = RETRY_DELAY * Math.pow(2, viewerState.retryCount);
        retryTimeoutRef.current = setTimeout(retryLoad, delay);

        setViewerState(prev => ({
          ...prev,
          isLoading: true,
          error: `Tentative de reconnexion... (${prev.retryCount + 1}/${MAX_RETRIES})`,
          activeGateway: null
        }));
      } else {
        setViewerState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Le document est temporairement inaccessible',
          activeGateway: null
        }));
      }
    }
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

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d', { alpha: false });

      const desiredWidth = window.innerWidth < 768 ? 150 : 200;
      const viewport = page.getViewport({ scale: 1.0 });
      const scale = desiredWidth / viewport.width;
      const scaledViewport = page.getViewport({ scale });

      canvas.width = scaledViewport.width;
      canvas.height = scaledViewport.height;

      await page.render({
        canvasContext: context,
        viewport: scaledViewport,
        intent: 'print'
      }).promise;

      const thumbnail = canvas.toDataURL('image/jpeg', 0.7);
      thumbnailCache.set(pdfUrl, thumbnail);
      return thumbnail;
    } catch (error) {
      console.error('Erreur de génération de la miniature:', error);
      return null;
    }
  };

  useEffect(() => {
    loadDocument();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
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
            <p className="text-xs md:text-sm text-gray-500 mt-2">{viewerState.error || 'Chargement...'}</p>
          </div>
        ) : viewerState.error ? (
          <div className="flex flex-col items-center text-center p-2">
            <AlertCircle className="w-6 h-6 md:w-8 md:h-8 mb-1 text-red-500" />
            <p className="text-xs md:text-sm text-red-500 mb-2">{viewerState.error}</p>
            <button
              onClick={retryLoad}
              className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs hover:bg-blue-200 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              Réessayer
            </button>
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