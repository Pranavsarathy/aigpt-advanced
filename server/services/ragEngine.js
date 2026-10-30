// server/services/ragEngine.js
class RAGEngine {
  constructor() {
    this.userStores = new Map(); // userId -> [{ id, text, filename, page, embedding }]
  }

  // 900-character chunking with 150-character sliding overlap
  chunkDocument(text, filename, pageSize = 2500) {
    const chunks = [];
    const chunkSize = 900;
    const overlap = 150;
    
    for (let i = 0; i < text.length; i += (chunkSize - overlap)) {
      const chunkText = text.substring(i, i + chunkSize).trim();
      if (chunkText.length > 40) {
        const estimatedPage = Math.floor(i / pageSize) + 1;
        chunks.push({
          id: `${filename}-p${estimatedPage}-${chunks.length + 1}`,
          text: chunkText,
          filename,
          page: estimatedPage
        });
      }
    }
    return chunks;
  }

  // Fast word-frequency embedding vector with stop-word filtering
  getEmbedding(text) {
    const stopWords = new Set(['the', 'is', 'at', 'which', 'on', 'and', 'a', 'an', 'in', 'to', 'for', 'of', 'with', 'by']);
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    const vector = {};
    for (const word of words) {
      if (word.length > 2 && !stopWords.has(word)) {
        vector[word] = (vector[word] || 0) + 1;
      }
    }
    return vector;
  }

  cosineSimilarity(v1, v2) {
    let dot = 0;
    let mag1 = 0;
    let mag2 = 0;
    for (const k in v1) {
      if (v2[k]) dot += v1[k] * v2[k];
      mag1 += v1[k] * v1[k];
    }
    for (const k in v2) mag2 += v2[k] * v2[k];
    if (!mag1 || !mag2) return 0;
    return dot / (Math.sqrt(mag1) * Math.sqrt(mag2));
  }

  // Hybrid Search: BM25 Keyword Match + Vector Cosine Reranking
  async search(userId, query, topK = 3) {
    const store = this.userStores.get(userId) || [];
    if (store.length === 0) return { results: [], notFound: true };

    const queryVec = this.getEmbedding(query);
    const queryTokens = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);

    const scored = store.map(doc => {
      const vectorScore = this.cosineSimilarity(queryVec, doc.embedding);
      
      // BM25 / keyword term frequency bonus
      let keywordHits = 0;
      const lowerText = doc.text.toLowerCase();
      for (const token of queryTokens) {
        if (lowerText.includes(token)) keywordHits++;
      }
      const keywordScore = queryTokens.length > 0 ? (keywordHits / queryTokens.length) : 0;

      // Reranker: 60% semantic vector + 40% keyword precision
      const combinedScore = (vectorScore * 0.6) + (keywordScore * 0.4);

      return { ...doc, score: combinedScore };
    });

    const relevant = scored
      .filter(item => item.score > 0.08)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

    if (relevant.length === 0 || relevant[0].score < 0.1) {
      return { results: [], notFound: true };
    }

    return { results: relevant, notFound: false };
  }

  ingest(userId, text, filename) {
    if (!this.userStores.has(userId)) {
      this.userStores.set(userId, []);
    }
    const chunks = this.chunkDocument(text, filename);
    const enriched = chunks.map(chunk => ({
      ...chunk,
      embedding: this.getEmbedding(chunk.text)
    }));
    this.userStores.get(userId).push(...enriched);
    return { ingestedChunks: enriched.length, filename };
  }

  clear(userId) {
    this.userStores.delete(userId);
  }
}

module.exports = new RAGEngine();
