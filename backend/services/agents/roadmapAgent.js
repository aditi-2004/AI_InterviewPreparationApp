const axios = require('axios');
require('dotenv').config();

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

/**
 * Generates a step-by-step personalized learning roadmap based on user analytics.
 */
const generateRoadmap = async (analyticsData) => {
  const prompt = `You are a Lead Career Coach and Technical Architect.
Based on the candidate's topic-wise performance details below, generate a personalized learning roadmap.
Identify weak topics and construct step-by-step milestones to bring them to production-readiness.

Candidate Performance Profile:
${JSON.stringify(analyticsData, null, 2)}

Respond ONLY with a JSON object in this exact format (no markdown formatting, no comments, no extra text):
{
  "readinessSummary": "High-level summary of their overall preparedness and suggestions.",
  "weakTopics": ["Topic 1", "Topic 2"],
  "milestones": [
    {
      "phase": "Phase 1: Foundations",
      "targetTopic": "Topic Name",
      "tasks": [
        "Task 1 (e.g., Learn Async Flow)",
        "Task 2 (e.g., Read about Event Loop)"
      ],
      "resources": ["Suggested link/resource name"],
      "estimatedDays": 4
    }
  ]
}`;

  try {
    const response = await axios.post(
      GROQ_API_URL,
      {
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1500
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
        },
        timeout: 15000
      }
    );

    let content = response.data.choices[0].message.content;
    console.log('Roadmap Agent Response:', content);

    content = content.replace(/```json\n|```/g, '').trim();
    const parsedData = JSON.parse(content);
    return parsedData;
  } catch (error) {
    console.error('Roadmap Agent Error:', error.message);
    throw new Error(`Failed to generate roadmap: ${error.message}`);
  }
};

module.exports = { generateRoadmap };
