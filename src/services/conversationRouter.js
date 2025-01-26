// ================================================================
// CONVERSATION ROUTER SERVICE
// ================================================================
export class ConversationRouter {
  // Types de messages possibles
  static MESSAGE_TYPES = {
    GREETING: 'greeting',          // Salutations
    CHITCHAT: 'chitchat',         // Discussion générale
    DOC_QUERY: 'doc_query',       // Question sur les documents
    RESEARCH_QUERY: 'research',    // Recherche spécifique
    CLARIFICATION: 'clarification' // Demande de clarification
  };

  constructor() {
    // Patterns pour la détection d'intention
    this.patterns = {
      greeting: /^(bonjour|hello|hi|salut|hey|coucou)$/i,
      docQuery: /documents?|recherches?|publications?|études?/i,
      research: /(que|comment|pourquoi|quand|où|qui|quel|quelle|quels|quelles).*\?$/i,
      chitchat: /(merci|d'accord|ok|bien|super|génial|parfait)/i
    };

    // Mots-clés de recherche spécifiques à I4TK
    this.researchKeywords = [
      'UNESCO', 'I4TK', 'digital', 'trust', 'knowledge',
      'research', 'studies', 'findings', 'results',
      'innovation', 'technology', 'network'
    ];
  }

  detectIntent(message, lang = 'fr') {
    const normalizedMessage = message.toLowerCase().trim();

    if (this.patterns.greeting.test(normalizedMessage)) {
      return ConversationRouter.MESSAGE_TYPES.GREETING;
    }

    const containsResearchKeywords = this.researchKeywords.some(
      keyword => normalizedMessage.includes(keyword.toLowerCase())
    );

    if (this.patterns.docQuery.test(normalizedMessage)) {
      return ConversationRouter.MESSAGE_TYPES.DOC_QUERY;
    }

    if (this.patterns.research.test(normalizedMessage) || containsResearchKeywords) {
      return ConversationRouter.MESSAGE_TYPES.RESEARCH_QUERY;
    }

    if (this.patterns.chitchat.test(normalizedMessage)) {
      return ConversationRouter.MESSAGE_TYPES.CHITCHAT;
    }

    return ConversationRouter.MESSAGE_TYPES.RESEARCH_QUERY;
  }

  getSystemPrompt(messageType, lang = 'fr') {
    switch (messageType) {
      case ConversationRouter.MESSAGE_TYPES.GREETING:
        return lang === 'fr' 
          ? "Vous êtes un assistant I4TK accueillant et professionnel."
          : "You are a welcoming and professional I4TK assistant.";

      case ConversationRouter.MESSAGE_TYPES.CHITCHAT:
        return lang === 'fr'
          ? "Vous êtes un assistant I4TK sympathique qui maintient une conversation naturelle."
          : "You are a friendly I4TK assistant maintaining natural conversation.";

      case ConversationRouter.MESSAGE_TYPES.DOC_QUERY:
        return lang === 'fr'
          ? "Vous êtes un assistant I4TK qui aide à naviguer dans la base documentaire."
          : "You are an I4TK assistant helping navigate the document base.";

      case ConversationRouter.MESSAGE_TYPES.RESEARCH_QUERY:
        return lang === 'fr'
          ? `Assistant I4TK spécialisé dans les documents de recherche. Instructions:
             - Résumez les informations pertinentes
             - Citez vos sources avec [1], [2], etc.
             - Traduisez les concepts clés en français`
          : `I4TK assistant specialized in research documents. Instructions:
             - Summarize relevant information
             - Cite sources using [1], [2], etc.
             - Focus on key concepts`;

      default:
        return lang === 'fr'
          ? "Vous êtes l'assistant I4TK."
          : "You are the I4TK assistant.";
    }
  }

  shouldSearchDocuments(messageType) {
    return [
      ConversationRouter.MESSAGE_TYPES.RESEARCH_QUERY,
      ConversationRouter.MESSAGE_TYPES.DOC_QUERY
    ].includes(messageType);
  }
}

export const conversationRouter = new ConversationRouter();