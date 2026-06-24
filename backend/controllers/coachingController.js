const Analytics = require('../models/Analytics');
const KnowledgeDoc = require('../models/KnowledgeDoc');
const { generateRoadmap } = require('../services/agents/roadmapAgent');

const getRoadmap = async (req, res) => {
  try {
    const analytics = await Analytics.find({ user_id: req.user._id });

    // Seed default documents if database is completely empty
    await seedKnowledgeDocs();

    if (analytics.length === 0) {
      return res.json({
        readinessSummary: "No analytics history yet. Complete mock interviews to build your profile and unlock personalized roadmaps!",
        weakTopics: [],
        milestones: []
      });
    }

    console.log('Generating learning roadmap using Roadmap Agent...');
    const roadmap = await generateRoadmap(analytics);
    res.json(roadmap);
  } catch (error) {
    console.error('Coaching Roadmap Controller Error:', error.message);
    res.status(500).json({ message: 'Server error generating roadmap.', error: error.message });
  }
};

const getKnowledgeDocs = async (req, res) => {
  try {
    const docs = await KnowledgeDoc.find({
      $or: [
        { user_id: null }, // Global public documents
        { user_id: req.user._id } // User's private notes
      ]
    }).sort({ createdAt: -1 });

    res.json(docs);
  } catch (error) {
    console.error('Get Knowledge Docs Error:', error.message);
    res.status(500).json({ message: 'Server error fetching preparation materials.', error: error.message });
  }
};

const addKnowledgeDoc = async (req, res) => {
  try {
    const { title, category, content, tags } = req.body;

    const doc = new KnowledgeDoc({
      title,
      category,
      content,
      user_id: req.user._id,
      tags: tags || []
    });

    await doc.save();
    res.status(201).json({ success: true, message: 'Document added to preparation materials.', doc });
  } catch (error) {
    console.error('Add Knowledge Doc Error:', error.message);
    res.status(500).json({ message: 'Server error adding preparation materials.', error: error.message });
  }
};

const seedKnowledgeDocs = async () => {
  try {
    const count = await KnowledgeDoc.countDocuments({ user_id: null });
    if (count === 0) {
      console.log('Seeding initial preparation study materials...');
      await KnowledgeDoc.insertMany([
        {
          title: 'System Design: Scalability and Distributed Caching',
          category: 'study_material',
          content: 'To design scalable architectures, introduce caching layers like Redis or Memcached. Avoid database hits for static read-heavy queries. Use consistent hashing for distributed caching and database partitioning.',
          tags: ['System Design', 'Caching', 'Scalability'],
          user_id: null
        },
        {
          title: 'DBMS: Transactions and ACID Isolation Levels',
          category: 'study_material',
          content: 'ACID isolation levels (Read Uncommitted, Read Committed, Repeatable Read, Serializable) handle concurrency issues. Serializable prevents dirty reads, non-repeatable reads, and phantom reads using locking.',
          tags: ['DBMS', 'SQL', 'ACID'],
          user_id: null
        },
        {
          title: 'Algorithms: Dynamic Programming Guide',
          category: 'study_material',
          content: 'Dynamic Programming solves overlapping subproblems by memoizing subproblem answers. Standard problems include the 0/1 Knapsack, Longest Common Subsequence (LCS), and Edit Distance.',
          tags: ['Algorithms', 'DP', 'Dynamic Programming'],
          user_id: null
        }
      ]);
    }
  } catch (err) {
    console.error('Failed to seed preparation docs:', err);
  }
};

module.exports = { getRoadmap, getKnowledgeDocs, addKnowledgeDoc };
