// ================================================================
// IMPORTS ET CONFIGURATION
// ================================================================
import { db } from './firebase';
import { collection, getDocs, where, query } from 'firebase/firestore';
import OpenAI from 'openai';
import axios from 'axios';
import { embeddingService } from './embeddingService';
import { languageDetection } from './languageService';

// Constantes de configuration
const IPFS_GATEWAY = 'https://ipfs.io/ipfs/';  // Gateway IPFS pour accéder aux documents
const MAX_RESULTS = 3;                         // Nombre max de documents pertinents
const MAX_RETRIES = 3;                         // Tentatives max en cas d'erreur
const RETRY_DELAY = 1000;                      // Délai entre les tentatives (ms)

// ================================================================
// SERVICE PRINCIPAL DE CHAT
// ================================================================
class ChatService {
  constructor() {
    // Initialisation OpenAI et stockage conversations
    this.openai = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true
    });
    this.conversations = new Map(); // Pour historique futur
  }

  // ================================================================
  // GESTION IPFS - Récupération documents
  // ================================================================
  async fetchIPFSContent(ipfsCid, retries = 3) {
    try {
      // Nettoyage et validation CID
      let cid = ipfsCid.replace('ipfs://', '').trim();
      if (!cid.match(/^[a-zA-Z0-9]{46,62}$/)) return null;

      console.log('📥 Fetching IPFS:', cid);
      // Tentative récupération avec headers CORS
      const response = await axios.get(`${IPFS_GATEWAY}${cid}`, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        timeout: 5000 // Timeout 5s
      });
      return response.data;
    } catch (error) {
      // Retry si timeout ou erreur gateway
      if (retries > 0 && (error.code === 'ECONNABORTED' || error.response?.status === 504)) {
        await new Promise(r => setTimeout(r, RETRY_DELAY));
        return this.fetchIPFSContent(ipfsCid, retries - 1);
      }
      console.error('❌ IPFS error:', error);
      return null;
    }
  }

  // ================================================================
  // RECHERCHE SÉMANTIQUE - Trouver documents pertinents
  // ================================================================
  async findRelevantDocuments(queryEmbedding) {
    // Récupération documents publiés
    const docsRef = collection(db, 'web3IP');
    const q = query(docsRef, where('validationStatus', '==', 'PUBLISHED'));
    const snapshot = await getDocs(q);

    // Calcul similarités pour seuil dynamique
    const similarities = snapshot.docs
      .map(doc => {
        const data = doc.data();
        if (!data.contentEmbedding) return null;
        return this.cosineSimilarity(queryEmbedding[0], data.contentEmbedding);
      })
      .filter(Boolean);

    const threshold = this.getSimilarityThreshold(similarities);

    // Filtrage et tri des documents pertinents
    const candidates = snapshot.docs
      .map(doc => {
        const data = doc.data();
        if (!data.contentEmbedding) return null;
        const similarity = this.cosineSimilarity(queryEmbedding[0], data.contentEmbedding);
        return similarity > threshold ? {
          id: doc.id,
          similarity,
          title: data.title,
          description: data.description,
          authors: data.authors,
          programme: data.programme,
          ipfsCid: data.ipfsCid
        } : null;
      })
      .filter(Boolean)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, MAX_RESULTS);

    return candidates;
  }

  // ================================================================
  // UTILS - Fonctions utilitaires
  // ================================================================
  // Calcul seuil similarité dynamique
  getSimilarityThreshold(similarities) {
    if (!similarities.length) return 0.1;
    const mean = similarities.reduce((a,b) => a + b) / similarities.length;
    return Math.max(0.05, mean * 0.7); // Min 0.05, sinon 70% moyenne
  }

  // Calcul similarité cosinus entre vecteurs
  cosineSimilarity(vec1, vec2) {
    try {
      const dotProduct = vec1.reduce((acc, val, i) => acc + val * vec2[i], 0);
      const norm1 = Math.sqrt(vec1.reduce((acc, val) => acc + val * val, 0));
      const norm2 = Math.sqrt(vec2.reduce((acc, val) => acc + val * val, 0));
      return dotProduct / (norm1 * norm2);
    } catch {
      return 0;
    }
  }

  // Détection langue via service externe
  detectLanguage(text) {
    return languageDetection.detectLanguage(text);
  }

  // Message salutation selon heure
  getGreeting(lang) {
    const hour = new Date().getHours();
    if (lang === 'fr') {
      if (hour < 12) return "Bonjour";
      if (hour < 18) return "Bon après-midi";
      return "Bonsoir";
    }
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }

  // ================================================================
  // MÉTHODE PRINCIPALE - Traitement messages
  // ================================================================
  async chat(message, lang = null, retries = MAX_RETRIES) {
    try {
      const detectedLang = lang || this.detectLanguage(message);
      console.log('💬 Request:', message, `(${detectedLang})`);

      // 1. Gestion messages simples
      const greetings = /^(bonjour|hello|hi|salut|hey|coucou)$/i;
      if (greetings.test(message.trim())) {
        const greeting = this.getGreeting(detectedLang);
        return {
          answer: detectedLang === 'fr' 
            ? `${greeting} ! Je suis votre assistant I4TK. Comment puis-je vous aider aujourd'hui ?`
            : `${greeting}! I'm your I4TK assistant. How can I help you today?`,
          sources: []
        };
      }

      // 2. Questions sur la bibliothèque
      const isLibraryQuery = /quels.*documents|liste.*documents|documents.*accès/i.test(message);
      if (isLibraryQuery) {
        return {
          answer: detectedLang === 'fr' 
            ? "Je peux chercher dans notre bibliothèque de documents de recherche, principalement en anglais. Je traduirai les informations pertinentes en français."
            : "I can search through our research documents library. Feel free to ask any specific questions.",
          sources: []
        };
      }

      // 3. Recherche et réponse avec retry
      for (let i = 0; i < retries; i++) {
        try {
          // Obtention embedding de la question
          const queryEmbedding = await embeddingService.getEmbedding(message);
          const relevantDocs = await this.findRelevantDocuments(queryEmbedding);

          // Si pas de docs pertinents
          if (relevantDocs.length === 0) {
            return {
              answer: detectedLang === 'fr'
                ? "Je ne trouve pas de documents pertinents. Pourriez-vous reformuler votre question ?"
                : "I couldn't find relevant documents. Could you rephrase your question?",
              sources: []
            };
          }

          // Récupération contenu complet
          const fullDocs = await Promise.all(
            relevantDocs.map(async doc => ({
              ...doc,
              content: await this.fetchIPFSContent(doc.ipfsCid) || doc.description
            }))
          );

          // Préparation prompt selon langue
          const prompt = detectedLang === 'fr'
            ? `Assistant I4TK spécialisé dans les documents de recherche. Instructions:
               - Résumez les informations pertinentes
               - Citez vos sources avec [1], [2], etc.
               - Si les documents ne permettent pas de répondre précisément, dites-le
               - Traduisez les concepts clés en français`
            : `I4TK assistant specialized in research documents. Instructions:
               - Summarize relevant information
               - Cite sources using [1], [2], etc.
               - If documents don't allow for a precise answer, say so
               - Focus on key concepts`;

          // Formatage contexte pour GPT
          const context = fullDocs
            .map((doc, idx) => {
              const authorStr = Array.isArray(doc.authors) 
                ? doc.authors.join(', ') 
                : typeof doc.authors === 'string' 
                  ? doc.authors 
                  : 'N/A';
              return `[${idx + 1}] ${doc.title}\n${doc.content}\nAuthors: ${authorStr}`;
            })
            .join('\n\n');

          // Appel GPT-4
          const completion = await this.openai.chat.completions.create({
            model: "gpt-4-turbo-preview",
            messages: [
              { role: "system", content: prompt },
              { role: "user", content: `Question: ${message}\n\nSources:\n\n${context}` }
            ],
            temperature: 0.3,
            max_tokens: 800
          });

          // Retour réponse avec sources
          return {
            answer: completion.choices[0].message.content,
            sources: fullDocs.map(doc => ({
              title: doc.title,
              authors: doc.authors,
              programme: doc.programme,
              similarity: doc.similarity,
              url: `${IPFS_GATEWAY}${doc.ipfsCid.replace('ipfs://', '')}`
            }))
          };
        } catch (error) {
          // Retry si rate limit
          if (error.status === 429 && i < retries - 1) {
            await new Promise(r => setTimeout(r, RETRY_DELAY * (i + 1)));
            continue;
          }
          throw error;
        }
      }

      // Message si tous les retries échouent
      return {
        answer: detectedLang === 'fr'
          ? "Service temporairement indisponible. Veuillez réessayer dans quelques instants."
          : "Service temporarily unavailable. Please try again in a moment.",
        sources: []
      };

    } catch (error) {
      console.error('❌ Error:', error);
      throw error;
    }
  }
}

// Export instance unique
export const chatService = new ChatService();