// ================ IMPORTS ================
import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';
import OpenAI from 'openai';
import axios from 'axios';

// ================ CONSTANTS ================
const IPFS_GATEWAY = 'https://ipfs.io/ipfs/';
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ================ CHAT SERVICE CLASS ================
class ChatService {
  // ===== INITIALIZATION =====
  constructor() {
    console.log('Initializing OpenAI client...');
    this.openai = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true
    });
    console.log('OpenAI client initialized with API key length:', import.meta.env.VITE_OPENAI_API_KEY?.length);
  }

  // ===== IPFS OPERATIONS =====
  async fetchIPFSContent(ipfsHash) {
    console.log('Fetching IPFS content:', ipfsHash);
    const response = await axios.get(`${IPFS_GATEWAY}${ipfsHash}`);
    return response.data;
  }

  // ===== EMBEDDING OPERATIONS =====
  async getEmbedding(text) {
    console.log('Starting embedding request...');
    const startTime = Date.now();
    try {
      const response = await this.openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: text,
      });
      console.log(`Embedding request completed in ${Date.now() - startTime}ms`);
      return response.data[0].embedding;
    } catch (error) {
      console.error('Embedding request failed:', {
        status: error.response?.status,
        message: error.message,
        duration: Date.now() - startTime
      });
      throw error;
    }
  }

  // ===== VECTOR OPERATIONS =====
  cosineSimilarity(vec1, vec2) {
    const dotProduct = vec1.reduce((acc, val, i) => acc + val * vec2[i], 0);
    const norm1 = Math.sqrt(vec1.reduce((acc, val) => acc + val * val, 0));
    const norm2 = Math.sqrt(vec2.reduce((acc, val) => acc + val * val, 0));
    return dotProduct / (norm1 * norm2);
  }

  // ===== DOCUMENT OPERATIONS =====
  async searchSimilarDocuments(queryEmbedding, threshold = 0.7, maxResults = 3) {
    console.log('Searching similar documents...');
    const docsRef = collection(db, 'web3IP');
    const snapshot = await getDocs(docsRef);

    const contentPromises = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.contentEmbedding) {
        const similarity = this.cosineSimilarity(queryEmbedding, data.contentEmbedding);
        if (similarity > threshold) {
          contentPromises.push(this.fetchIPFSContent(data.ipfsHash).then(content => ({
            id: doc.id,
            similarity,
            content: content || data.description,
            metadata: {
              title: data.title,
              authors: data.authors,
              programme: data.programme,
              ipfsHash: data.ipfsHash
            }
          })));
        }
      }
    });

    const results = await Promise.all(contentPromises);
    return results.sort((a, b) => b.similarity - a.similarity).slice(0, maxResults);
  }

  // ===== CHAT OPERATIONS =====
  async chat(message, lang = 'en') {
    console.log('Starting chat request with model: gpt-4o-mini');
    const startTime = Date.now();

    try {
      const queryEmbedding = await this.getEmbedding(message);
      const relevantDocs = await this.searchSimilarDocuments(queryEmbedding);

      const context = relevantDocs
        .map(doc => `Title: ${doc.metadata.title}
Content: ${doc.content}
Authors: ${doc.metadata.authors?.join(', ')}
Programme: ${doc.metadata.programme}`)
        .join('\n\n');

      const systemPrompt = lang === 'en' 
        ? 'You are a helpful assistant answering questions about policy documents.'
        : 'Vous êtes un assistant utile qui répond aux questions sur les documents de politique.';

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: `Question: ${message}\n\nAvailable sources:\n${relevantDocs.map(doc => 
              `- ${doc.metadata.title} (${doc.metadata.authors?.join(', ')}): ${doc.content}`
            ).join('\n')}\n\nPlease answer using these sources and cite them in your response.`
          }
        ],
        temperature: 0.7,
        max_tokens: 800
      });

      console.log(`Chat request completed in ${Date.now() - startTime}ms`);
      return {
        answer: completion.choices[0].message.content,
        sources: relevantDocs.map(doc => ({
          ...doc.metadata,
          similarity: doc.similarity
        }))
      };
    } catch (error) {
      console.error('Chat request failed:', {
        status: error.response?.status,
        message: error.message,
        duration: Date.now() - startTime
      });
      throw error;
    }
  }
}

// ================ EXPORT ================
export const chatService = new ChatService();