// ================ IMPORTS ================
import { db } from './firebase';
import { collection, getDocs, where, query } from 'firebase/firestore';
import OpenAI from 'openai';
import axios from 'axios';
import { embeddingService } from './embeddingService';

// ================ CONSTANTS ================
const IPFS_GATEWAY = 'https://ipfs.io/ipfs/';
const SIMILARITY_THRESHOLD = 0.1;
const MAX_RESULTS = 3;

// ================ CHAT SERVICE CLASS ================
class ChatService {
  // ===== INITIALIZATION =====
  constructor() {
    this.openai = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true
    });
  }

  // ===== IPFS OPERATIONS =====
  async fetchIPFSContent(ipfsCid) {
    try {
      let cid = ipfsCid.replace('ipfs://', '').trim();
      if (!cid.match(/^[a-zA-Z0-9]{46,62}$/)) return null;
      console.log('📥 Fetching IPFS:', cid);
      const response = await axios.get(`${IPFS_GATEWAY}${cid}`);
      return response.data;
    } catch (error) {
      console.error('❌ IPFS error:', error);
      return null;
    }
  }

  // ===== METADATA SEARCH =====
  async findRelevantDocuments(queryEmbedding) {
    console.log('🔍 Searching metadata');
    const docsRef = collection(db, 'web3IP');
    const q = query(docsRef, where('validationStatus', '==', 'PUBLISHED'));
    const snapshot = await getDocs(q);

    const candidates = snapshot.docs
      .map(doc => {
        const data = doc.data();
        if (!data.contentEmbedding) return null;
        return {
          id: doc.id,
          similarity: this.cosineSimilarity(queryEmbedding[0], data.contentEmbedding),
          title: data.title,
          description: data.description,
          authors: data.authors,
          programme: data.programme,
          ipfsCid: data.ipfsCid
        };
      })
      .filter(doc => doc && doc.similarity > SIMILARITY_THRESHOLD)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, MAX_RESULTS);

    console.log(`📚 Found ${candidates.length} relevant documents`);
    return candidates;
  }

  // ===== VECTOR OPERATIONS =====
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

  // ===== LANGUAGE DETECTION =====
  detectLanguage(text) {
    return /[àâçéèêëîïôûùüÿñæœ]|^(bonjour|salut|je|tu|il|nous|vous|le|la|les)/i.test(text) ? 'fr' : 'en';
  }

  // ===== CHAT OPERATIONS =====
  async chat(message, lang = null) {
    try {
      const detectedLang = lang || this.detectLanguage(message);
      console.log('💬 Request:', message, `(${detectedLang})`);

      const isLibraryQuery = /quels.*documents|liste.*documents|documents.*accès/i.test(message);
      if (isLibraryQuery) {
        return {
          answer: detectedLang === 'fr' 
            ? "Je suis votre assistant I4TK. Posez-moi des questions spécifiques sur nos documents."
            : "I am your I4TK assistant. Ask me specific questions about our documents.",
          sources: []
        };
      }

      const queryEmbedding = await embeddingService.getEmbedding(message);
      const relevantDocs = await this.findRelevantDocuments(queryEmbedding);

      if (relevantDocs.length === 0) {
        return {
          answer: detectedLang === 'fr'
            ? "Aucun document pertinent trouvé."
            : "No relevant documents found.",
          sources: []
        };
      }

      const fullDocs = await Promise.all(
        relevantDocs.map(async doc => ({
          ...doc,
          content: await this.fetchIPFSContent(doc.ipfsCid) || doc.description
        }))
      );

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

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { 
            role: "system", 
            content: detectedLang === 'fr'
              ? "Assistant I4TK - Citez vos sources avec [1], [2]. Répondez en français."
              : "I4TK Assistant - Cite sources using [1], [2]. Respond in English."
          },
          { 
            role: "user", 
            content: `Question: ${message}\n\nSources:\n\n${context}`
          }
        ],
        temperature: 0.3,
        max_tokens: 800
      });

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
      console.error('❌ Error:', error);
      throw error;
    }
  }
}

// ================ EXPORT ================
export const chatService = new ChatService();