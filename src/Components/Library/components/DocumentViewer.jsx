import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { ExternalLink, FileText, AlertCircle, RefreshCw } from 'lucide-react';

// Configuration PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// Gateway principal avec proxy CORS public
const GATEWAY = 'https://nftstorage.link/ipfs/';
const CORS_PROXY = 'https://cors.eu.org/';  // Proxy CORS fiable et gratuit

// Gateway de fallback en cas d'échec
const FALLBACK_GATEWAY = 'https://cloudflare-ipfs.com/ipfs/';

// Cache simple pour les documents
const documentCache = new Map();

const DocumentViewer = ({ documentCid }) => {
  const [state, setState] = useState({
    isLoading: true,
    error: null,
    thumbnail: null,
    useProxy: true // On commence avec le proxy
  });

  const loadingRef = useRef(false);
  const canvasRef = useRef(null);

  const fetchDocument = async (url, useProxy = true) => {
    // Vérifier le cache d'abord
    const cacheKey = `${documentCid}-${useProxy}`;
    if (documentCache.has(cacheKey)) {
      return documentCache.get(cacheKey);
    }

    const finalUrl = useProxy ? `${CORS_PROXY}${url}` : url;

    const response = await fetch(finalUrl, {
      headers: {
        'Accept': 'application/pdf,*/*',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) throw new Error('Erreur de chargement du PDF');

    const data = await response.arrayBuffer();
    documentCache.set(cacheKey, data); // Mettre en cache
    return data;
  };

  const loadDocument = async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Essayer d'abord avec le gateway principal + proxy
      const pdfBuffer = await fetchDocument(`${GATEWAY}${documentCid}`, state.useProxy)
        .catch(async () => {
          // Si ça échoue, essayer sans proxy
          return await fetchDocument(`${GATEWAY}${documentCid}`, false)
            .catch(async () => {
              // En dernier recours, utiliser le fallback gateway
              return await fetchDocument(`${FALLBACK_GATEWAY}${documentCid}`, false);
            });
        });

      const loadingTask = pdfjsLib.getDocument({
        data: pdfBuffer,
        cMapUrl: `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/cmaps/`,
        cMapPacked: true
      });

      const pdf = await loadingTask.promise;
      const page = await pdf.getPage(1);

      if (!canvasRef.current) {
        canvasRef.current = document.createElement('canvas');
      }
      const canvas = canvasRef.current;

      const context = canvas.getContext('2d', {
        willReadFrequently: true,
        alpha: false
      });

      const scale = window.innerWidth < 768 ? 0.3 : 0.5;
      const viewport = page.getViewport({ scale });
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({
        canvasContext: context,
        viewport,
        background: 'white',
        intent: 'print'
      }).promise;

      const thumbnail = canvas.toDataURL('image/jpeg', 0.7);

      setState({
        isLoading: false,
        error: null,
        thumbnail,
        useProxy: true
      });

    } catch (error) {
      console.error('Erreur:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Le document est temporairement inaccessible',
        thumbnail: null,
        useProxy: !prev.useProxy // Alterner l'utilisation du proxy au prochain essai
      }));
    } finally {
      loadingRef.current = false;
    }
  };

  useEffect(() => {
    loadDocument();

    return () => {
      if (canvasRef.current) {
        const context = canvasRef.current.getContext('2d');
        if (context) {
          context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
      }
    };
  }, [documentCid]);

  // Fonction pour obtenir l'URL d'ouverture appropriée
  const getOpenUrl = () => {
    // Si on a réussi avec le fallback, utiliser celui-ci
    if (!state.useProxy) {
      return `${FALLBACK_GATEWAY}${documentCid}`;
    }
    // Sinon utiliser le gateway principal
    return `${GATEWAY}${documentCid}`;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
      <div className="w-full h-24 md:h-[120px] mb-3 md:mb-4 border rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
        {state.isLoading ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-5 w-5 md:h-6 md:w-6 border-b-2 border-blue-500"></div>
            <p className="text-xs md:text-sm text-gray-500 mt-2">Chargement...</p>
          </div>
        ) : state.error ? (
          <div className="flex flex-col items-center text-center p-2">
            <AlertCircle className="w-6 h-6 md:w-8 md:h-8 mb-1 text-red-500" />
            <p className="text-xs md:text-sm text-red-500 mb-2">{state.error}</p>
            <button
              onClick={loadDocument}
              className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs hover:bg-blue-200 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              Réessayer
            </button>
          </div>
        ) : state.thumbnail ? (
          <img 
            src={state.thumbnail} 
            alt="Aperçu du document"
            className="object-contain w-full h-full"
          />
        ) : (
          <div className="flex flex-col items-center">
            <FileText className="w-12 h-12 md:w-16 md:h-16 text-blue-600 mb-1" />
            <p className="text-xs md:text-sm text-gray-600">Document PDF</p>
          </div>
        )}
      </div>

      {state.thumbnail && (
        <div>
          <p className="text-xs text-gray-500 font-medium mb-1">Ouvrir :</p>
          <a
            href={getOpenUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline text-sm flex items-center group"
          >
            <ExternalLink className="w-4 h-4 mr-1 group-hover:scale-110 transition-transform" />
            Ouvrir le document
          </a>
        </div>
      )}
    </div>
  );
};

export default DocumentViewer;