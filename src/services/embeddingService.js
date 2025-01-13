import * as tf from '@tensorflow/tfjs';
import { load } from '@tensorflow-models/universal-sentence-encoder';

class EmbeddingService {
  constructor() {
    this.model = null;
  }

  async initialize() {
    if (!this.model) {
      console.log('Initializing embedding model...');
      try {
        this.model = await load();
        console.log('Model loaded successfully');
      } catch (error) {
        console.error('Error loading model:', error);
        throw error;
      }
    }
  }

  async getEmbedding(text) {
    if (!this.model) {
      await this.initialize();
    }

    try {
      const embeddings = await this.model.embed(text);
      return await embeddings.array();
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw error;
    }
  }
}

export const embeddingService = new EmbeddingService();