const KnowledgeDoc = require('../models/KnowledgeDoc');

/**
 * Basic keyword-based search on KnowledgeDoc collection to retrieve grounded context.
 */
const retrieveRelevantContext = async (topic, tags = []) => {
  try {
    const searchTerms = [topic, ...tags].filter(Boolean);
    
    if (searchTerms.length === 0) return '';

    // Create regex matching query across title, content, and tags
    const queryConditions = searchTerms.map(term => ({
      $or: [
        { title: { $regex: term, $options: 'i' } },
        { content: { $regex: term, $options: 'i' } },
        { tags: { $regex: term, $options: 'i' } }
      ]
    }));

    const matchedDocs = await KnowledgeDoc.find({
      $or: queryConditions
    }).limit(3); // Limit to top 3 relevant documents

    if (matchedDocs.length === 0) return '';

    const formattedContext = matchedDocs.map((doc, idx) => 
      `Document [${idx + 1}] - Category: ${doc.category} - Title: ${doc.title}:
${doc.content}
`
    ).join('\n');

    return `\nGrounding Context / Preparation Material:\n${formattedContext}`;
  } catch (error) {
    console.error('RAG Retrieval Error:', error);
    return ''; // Fallback gracefully if database query fails
  }
};

module.exports = { retrieveRelevantContext };
