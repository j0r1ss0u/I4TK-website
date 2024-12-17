import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { ExternalLink, Download } from 'lucide-react';

// Configuration globale de PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const DocumentViewer = ({ documentCid }) => {
  const primaryUrl = `https://ipfs.io/ipfs/${documentCid}`;
  const ipfsUrl = `ipfs://${documentCid}`;

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isTimeout, setIsTimeout] = useState(false); // Ajouter un état pour le timeout
  const canvasRef = useRef(null);
  const [timeoutHandler, setTimeoutHandler] = useState(null); // Ajouter un état pour gérer le timeout

  const fetchAndRenderPDF = async () => {
    try {
      console.log('🔄 Étape 1: Téléchargement du PDF depuis :', primaryUrl);

      const response = await fetch(primaryUrl);
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      console.log('✅ Étape 2: PDF téléchargé avec succès.');

      const pdfBlob = await response.blob();
      const url = URL.createObjectURL(pdfBlob);

      console.log('🔄 Étape 3: Chargement du PDF avec PDF.js...');
      const loadingTask = pdfjsLib.getDocument(url);
      const pdf = await loadingTask.promise;
      console.log('✅ Étape 4: PDF chargé.');

      const firstPage = await pdf.getPage(1);
      console.log('📄 Étape 5: Première page récupérée.');

      const viewport = firstPage.getViewport({ scale: 1 });

      // Vérification de la référence canvas après le rendu
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        if (!context) {
          throw new Error("Impossible d'obtenir le contexte du canvas.");
        }

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        console.log('🔄 Étape 6: Rendu de la première page...');
        await firstPage.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;

        console.log('🎉 Étape 7: Rendu terminé.');
        URL.revokeObjectURL(url);
        setIsLoading(false);
        setIsTimeout(false);  // Si le PDF est chargé, annuler le timeout
        clearTimeout(timeoutHandler); // Annuler le timeout quand le rendu est effectué
      } else {
        throw new Error('Canvas non trouvé après le rendu.');
      }
    } catch (err) {
      console.error('❌ Erreur lors du chargement du PDF:', err);
      setError("Impossible de charger l’aperçu du document.");
      setIsLoading(false);
      setIsTimeout(false);  // Annuler le timeout si une erreur se produit
      clearTimeout(timeoutHandler); // Annuler le timeout en cas d'erreur
    }
  };

  useEffect(() => {
    // Gérer le timeout de 5 secondes pour afficher le placeholder
    const timeout = setTimeout(() => {
      if (isLoading) {
        setIsTimeout(true); // Déclencher le timeout si le PDF ne charge pas en 5 secondes
      }
    }, 5000);  // Délai de 5 secondes

    setTimeoutHandler(timeout); // Sauvegarder le handler du timeout

    if (!isTimeout) {
      console.log('🔄 Vérification du montage du canvas...');
      if (canvasRef.current) {
        console.log('🔄 Canvas trouvé, chargement du PDF...');
        fetchAndRenderPDF();
      } else {
        console.log('🔄 Canvas non trouvé après 500ms');
      }
    }

    return () => clearTimeout(timeout); // Nettoyer le timeout au démontage du composant
  }, [isTimeout]); // Dépendance à `isTimeout`

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      {/* Miniature sans le titre et le statut */}
      <div className="w-full h-[120px] mb-4 border rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
        {isTimeout ? (
          <img
            src="/assets/logos/I4TK logo.jpg"
            alt="Placeholder Logo"
            className="w-full h-full object-contain" // Conserver les proportions sans déformation
          />
        ) : isLoading ? (
          <p className="text-gray-500 text-sm">Chargement...</p>
        ) : error ? (
          <p className="text-red-500 text-sm">{error}</p>
        ) : (
          <canvas ref={canvasRef} className="w-full h-full" />
        )}
      </div>

      {/* Liens */}
      <div className="space-y-3">
        <div>
          <p className="text-xs text-gray-500 font-medium mb-1">Ouvrir le document :</p>
          <a
            href={primaryUrl}  // Lien direct vers le document IPFS
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline text-sm flex items-center"
          >
            <ExternalLink className="w-4 h-4 mr-1" />
            Ouvrir le document
          </a>
        </div>

        <div>
          <p className="text-xs text-gray-500 font-medium mb-1">Télécharger avec :</p>
          <a
            href={primaryUrl}  // Même URL pour le téléchargement
            className="text-gray-600 hover:underline text-sm flex items-center"
          >
            <Download className="w-4 h-4 mr-1" />
            Télécharger
          </a>
        </div>
      </div>
    </div>
  );
};

export default DocumentViewer;
