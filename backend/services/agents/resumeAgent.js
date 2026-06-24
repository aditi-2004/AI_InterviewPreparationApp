const axios = require('axios');
require('dotenv').config();

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

/**
 * Extracts structured skills, experience, and projects from raw resume text.
 */
const analyzeResume = async (resumeText) => {
  const prompt = `You are an expert Resume Analysis Agent.
Analyze the following raw text extracted from a resume and extract the key skills, professional work experience, and projects.

Resume Text:
${resumeText}

Respond ONLY with a JSON object in this exact format (no markdown formatting, no comments, no extra text):
{
  "skills": ["Skill 1", "Skill 2", ...],
  "experience": [
    {
      "role": "Job Title",
      "company": "Company Name",
      "duration": "e.g., June 2021 - Present",
      "description": "Short summary of responsibilities and achievements"
    }
  ],
  "projects": [
    {
      "title": "Project Title",
      "technologies": ["Tech 1", "Tech 2", ...],
      "description": "Short summary of what was built and accomplished"
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
        temperature: 0.2, // Low temperature for precise structuring
        max_tokens: 2048
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
    console.log('Raw Resume Agent Response:', content);

    // Clean up any potential markdown code blocks
    content = content.replace(/```json\n|```/g, '').trim();
    const parsedData = JSON.parse(content);
    return parsedData;
  } catch (error) {
    console.error('Resume Agent Analysis Error:', error.message);
    throw new Error(`Resume structuring failed: ${error.message}`);
  }
};

module.exports = { analyzeResume };
