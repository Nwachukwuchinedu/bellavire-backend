import natural from 'natural';

export class TextProcessor {
    constructor() {
        this.tokenizer = new natural.WordTokenizer();
        this.stemmer = natural.PorterStemmer;
    }

    // Split text into chunks with overlap
    chunkText(text, chunkSize = 512, overlap = 50) {
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const chunks = [];
        let currentChunk = '';
        let wordCount = 0;

        for (const sentence of sentences) {
            const sentenceWords = this.tokenizer.tokenize(sentence.trim());

            if (wordCount + sentenceWords.length > chunkSize && currentChunk) {
                chunks.push(currentChunk.trim());

                // Create overlap by keeping last few words
                const words = this.tokenizer.tokenize(currentChunk);
                const overlapWords = words.slice(-overlap);
                currentChunk = overlapWords.join(' ') + ' ' + sentence.trim();
                wordCount = overlapWords.length + sentenceWords.length;
            } else {
                currentChunk += ' ' + sentence.trim();
                wordCount += sentenceWords.length;
            }
        }

        if (currentChunk.trim()) {
            chunks.push(currentChunk.trim());
        }

        return chunks.filter(chunk => chunk.length > 20);
    }

    // Simple keyword extraction for better retrieval
    extractKeywords(text) {
        const tokens = this.tokenizer.tokenize(text.toLowerCase());
        const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those']);

        return tokens
            .filter(token => token.length > 2 && !stopWords.has(token))
            .map(token => this.stemmer.stem(token));
    }
}

const textProcessor = new TextProcessor();
export default textProcessor;