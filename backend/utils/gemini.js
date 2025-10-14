require('dotenv').config();
const axios = require('axios');

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const generateQuestion = async (topic, difficulty) => {
  const prompt = `don't repeat the question the interview question. Generate a ${difficulty} level technical interview question about ${topic}. 
  IMPORTANT: Only respond with questions related to technical interviews, programming, algorithms, databases, or system design. 
  Do not answer any other type of questions.
  
  Format your response as JSON:
  {
    "question": "don't repeat the question the interview question",
    "ideal_answer": "brief ideal answer or key points"
  }`;

  try {
    console.log('GROQ_API_KEY:', process.env.GROQ_API_KEY ? 'Set' : 'Not set');
    console.log('Calling Groq API with model: llama-3.3-70b-versatile');
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
        temperature: 0.7,
        max_tokens: 1024
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
        },
        timeout: 10000
      }
    );

    let content = response.data.choices[0].message.content;
    console.log('Raw Groq API Response:', content);

    content = content.replace(/```json\n|```/g, '').trim();
    const parsedContent = JSON.parse(content);
    return parsedContent;
  } catch (error) {
    console.error('Groq API Error:', error.message, error.response?.status, error.response?.data);
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
    console.log('Calling Groq API for evaluation');
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
        temperature: 0.7,
        max_tokens: 1024
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
        },
        timeout: 10000
      }
    );

    let content = response.data.choices[0].message.content;
    console.log('Raw Groq API Response:', content);

    content = content.replace(/```json\n|```/g, '').trim();

    const parsedContent = JSON.parse(content);
    return parsedContent;
  } catch (error) {
    console.error('Groq API Error:', error.message, error.response?.status, error.response?.data);
    throw new Error(`Failed to evaluate answer: ${error.message}`);
  }
};

const generateTopQuestions = async (topic, difficulty = 'medium', count = 10) => {
  const prompt = `Generate ${count} ${difficulty} level technical interview questions about ${topic}. 
  IMPORTANT: Only respond with questions related to technical interviews, programming, algorithms, databases, or system design. 
  Do not answer any other type of questions.
  
  Format your response as JSON:
  {
    "questions": [
      {
        "question": "interview question 1",
        "ideal_answer": "brief ideal answer or key points"
      },
      {
        "question": "interview question 2",
        "ideal_answer": "brief ideal answer or key points"
      }
    ]
  }`;

  try {
    console.log('GROQ_API_KEY:', process.env.GROQ_API_KEY ? 'Set' : 'Not set');
    console.log('Calling Groq API with model: llama-3.3-70b-versatile for top questions');
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
        temperature: 0.7,
        max_tokens: 2048
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
        },
        timeout: 10000
      }
    );

    let content = response.data.choices[0].message.content;
    console.log('Raw Groq API Response for top questions:', content);

    content = content.replace(/```json\n|```/g, '').trim();
    const parsedContent = JSON.parse(content);
    return parsedContent.questions || [];
  } catch (error) {
    console.error('Groq API Error for top questions:', error.message, error.response?.status, error.response?.data);
    throw new Error(`Failed to generate top questions: ${error.message}`);
  }
};

module.exports = { generateQuestion, evaluateAnswer, generateTopQuestions };