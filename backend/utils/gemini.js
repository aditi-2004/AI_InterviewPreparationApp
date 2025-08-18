require('dotenv').config();
const axios = require('axios');

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent';

const generateQuestion = async (topic, difficulty) => {
  const prompt = `Generate a ${difficulty} level technical interview question about ${topic}. 
  IMPORTANT: Only respond with questions related to technical interviews, programming, algorithms, databases, or system design. 
  Do not answer any other type of questions.
  
  Format your response as JSON:
  {
    "question": "the interview question",
    "ideal_answer": "brief ideal answer or key points"
  }`;

  try {
    console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'Set' : 'Not set');
    console.log('Calling Gemini API with model: gemini-1.5-flash');
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    let content = response.data.candidates[0].content.parts[0].text;
    console.log('Raw Gemini API Response:', content);

content = content.replace(/```json\n|```/g, '').trim();
    const parsedContent = JSON.parse(content);
    return parsedContent;
  } catch (error) {
    console.error('Gemini API Error:', error.message, error.response?.status, error.response?.data);
    throw new Error(`Failed to generate question: ${error.message}`);
  }
};

const evaluateAnswer = async (question, userAnswer, idealAnswer) => {
  const prompt = `You are a technical interview evaluator. 
  ONLY evaluate technical interview responses related to programming, algorithms, databases, or system design.
  
  Question: ${question}
  User Answer: ${userAnswer}
  Ideal Answer: ${idealAnswer}
  
  Provide evaluation as JSON:
  {
    "score": number (0-100),
    "feedback": "brief constructive feedback",
    "is_correct": boolean
  }`;

  try {
    console.log('Calling Gemini API for evaluation');
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    let content = response.data.candidates[0].content.parts[0].text;
    console.log('Raw Gemini API Response:', content);

    content = content.replace(/```json\n|```/g, '').trim();

    const parsedContent = JSON.parse(content);
    return parsedContent;
  } catch (error) {
    console.error('Gemini API Error:', error.message, error.response?.status, error.response?.data);
    throw new Error(`Failed to evaluate answer: ${error.message}`);
  }
};

module.exports = { generateQuestion, evaluateAnswer };
