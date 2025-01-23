// === IMPORTS ===
import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { ExternalLink, Download, FileText, AlertCircle } from 'lucide-react';

// === PDF.JS CONFIGURATION ===
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// Cache configuration for better performance
const cacheConfig = {
  cMapUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdfjs-dist/${pdfjsLib.version}/cmaps/`,
  cMapPacked: true,
  standardFontDataUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdfjs-dist/${pdfjsLib.version}/standard_fonts/`
};

// === COMPONENT ===
const DocumentViewer = ({ documentCid }) => {
  // === STATE MANAGEMENT ===
  const [viewerState, setViewerState] = useState({
    isLoading: true,
    error: null,
    fileInfo: null,
    thumbnail: null
  });

  const canvasRef = useRef(null);
  const primaryUrl = `https://ipfs.io/ipfs/${documentCid}`;

  // === THUMBNAIL GENERATION ===
  const generateThumbnail = async (pdfUrl) => {
    try {
      const loadingTask = pdfjsLib.getDocument({
        url: pdfUrl,
        ...cacheConfig
      });

      const pdf = await loadingTask.promise;
      const page = await pdf.getPage(1);

      // Canvas configuration optimized for performance
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d', { willReadFrequently: true });

      // Fixed thumbnail dimensions
      const desiredWidth = 200;
      const viewport = page.getViewport({ scale: 1.0 });
      const scale = desiredWidth / viewport.width;
      const scaledViewport = page.getViewport({ scale });

      canvas.width = scaledViewport.width;
      canvas.height = scaledViewport.height;

      await page.render({
        canvasContext: context,
        viewport: scaledViewport
      }).promise;

      return canvas.toDataURL();
    } catch (error) {
      console.error('Erreur de génération de la miniature:', error);
      return null;
    }
  };

  // === DOCUMENT LOADING ===
  useEffect(() => {
    const loadDocument = async () => {
      const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 30000)
      );

      try {
        // Race between fetch and timeout
        const response = await Promise.race([
          fetch(primaryUrl, { method: 'HEAD' }),
          timeout
        ]);

        if (!response.ok) throw new Error('Document non accessible');

        const contentType = response.headers.get('content-type');
        const contentLength = response.headers.get('content-length');
        const size = contentLength ? Math.round(parseInt(contentLength) / 1024) : null;

        const thumbnail = await generateThumbnail(primaryUrl);

        setViewerState({
          isLoading: false,
          error: null,
          fileInfo: {
            type: contentType,
            size: size
          },
          thumbnail
        });

      } catch (error) {
        console.error('Erreur:', error);
        setViewerState({
          isLoading: false,
          error: error.message === 'Timeout' ? 'Chargement trop long' : 'Document non accessible',
          fileInfo: null,
          thumbnail: null
        });
      }
    };

    loadDocument();
  }, [documentCid, primaryUrl]);

  // === UTILITY FUNCTIONS ===
  const formatFileSize = (size) => {
    if (!size) return '';
    if (size < 1024) return `${size} KB`;
    return `${(size / 1024).toFixed(1)} MB`;
  };

  // === RENDER ===
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      {/* Preview Container */}
      <div className="w-full h-[120px] mb-4 border rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
        {viewerState.isLoading ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            <p className="text-gray-500 text-sm mt-2">Chargement...</p>
          </div>
        ) : viewerState.error ? (
          <div className="flex flex-col items-center text-red-500">
            <AlertCircle className="w-8 h-8 mb-2" />
            <p className="text-sm">{viewerState.error}</p>
          </div>
        ) : viewerState.thumbnail ? (
          <div className="relative w-full h-full">
            <img 
              src={viewerState.thumbnail} 
              alt="Aperçu du document"
              className="object-contain w-full h-full"
            />
            {viewerState.fileInfo?.size && (
              <div className="absolute bottom-1 right-1 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                {formatFileSize(viewerState.fileInfo.size)}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="relative">
              <FileText className="w-16 h-16 text-blue-600 mb-1" />
              {viewerState.fileInfo?.size && (
                <div className="absolute bottom-0 right-0 transform translate-x-1/2 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                  {formatFileSize(viewerState.fileInfo.size)}
                </div>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-1">Document PDF</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <div>
          <p className="text-xs text-gray-500 font-medium mb-1">Ouvrir :</p>
          <a
            href={primaryUrl}
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
            href={primaryUrl}
            download
            className="text-gray-600 hover:text-gray-800 hover:underline text-sm flex items-center group"
          >
            <Download className="w-4 h-4 mr-1 group-hover:scale-110 transition-transform" />
            Télécharger {viewerState.fileInfo?.size && `(${formatFileSize(viewerState.fileInfo.size)})`}
          </a>
        </div>
      </div>
    </div>
  );
};

export default DocumentViewer;