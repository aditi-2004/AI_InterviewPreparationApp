const axios = require('axios');
const Resume = require('../../models/Resume');
require('dotenv').config();

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

/**
 * Formulates the next interview question based on type, topic, difficulty, resume, and chat history.
 */
const generateAdaptiveQuestion = async ({
  type,
  topic,
  difficulty,
  resumeId,
  history = []
}) => {
  let resumeContext = "";
  if (resumeId) {
    const resume = await Resume.findById(resumeId);
    if (resume) {
      resumeContext = `Candidate Resume Profile:
- Skills: ${resume.skills.join(', ')}
- Experience: ${JSON.stringify(resume.experience)}
- Projects: ${JSON.stringify(resume.projects)}
`;
    }
  }

  const dialogueHistory = history.map((turn, i) => 
    `Turn ${i + 1}:
Interviewer Question: ${turn.question}
Candidate Answer: ${turn.answer || '[No Answer Provided]'}
`
  ).join('\n');

  const { retrieveRelevantContext } = require('../ragService');
  const groundingContext = await retrieveRelevantContext(topic);

  const prompt = `You are an expert AI Interviewer conducting a Mock Interview.
Interview Configuration:
- Round Type: ${type} (Technical, HR, Hiring Manager, or System Design)
- Topic / Focus Area: ${topic}
- Target Difficulty: ${difficulty}

${resumeContext ? `${resumeContext}\nUse this resume to tailor questions to their real projects and skills.` : 'No resume provided. Ask standard industry questions for this role.'}

${groundingContext}

Dialogue History so far:
${dialogueHistory || 'This is the start of the interview. Ask the first question.'}

Your Goal:
- If this is the start (no history), generate a strong opening question tailored to the topic and resume.
- If there is history, read the candidate's last answer and ask an adaptive follow-up question. Dig deeper into their technical gaps, architectural decisions (if System Design), or behavioral/leadership points (if HR/HM).
- Output your response strictly in the JSON format below. Do not include extra comments, markdown formatting, or reasoning outside the JSON.

Expected JSON format:
{
  "question": "The interview question text",
  "ideal_answer": "Key concepts, bullet points, or expectations for a top-tier answer to this question"
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
        temperature: 0.7,
        max_tokens: 1024
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
    console.log('Adaptive Question Agent Response:', content);

    content = content.replace(/```json\n|```/g, '').trim();
    const parsedData = JSON.parse(content);
    return parsedData;
  } catch (error) {
    console.error('generateAdaptiveQuestion Error:', error.message);
    throw new Error(`Failed to generate interview question: ${error.message}`);
  }
};

/**
 * Evaluates the candidate's response in detail with explainability.
 */
const evaluateCandidateResponse = async ({
  question,
  userAnswer,
  idealAnswer,
  type
}) => {
  const prompt = `You are a professional Mock Interview Evaluator.
Evaluate the candidate's response to the interview question below.

Context:
- Interview Round Type: ${type}
- Question Asked: ${question}
- Expected Ideal Points: ${idealAnswer}
- Candidate's Response: ${userAnswer}

Provide a deep, constructive analysis. Assess correctness, communication skills, technical depth, and identify gaps.
Output your response strictly in the JSON format below. Do not include extra comments, markdown formatting, or reasoning outside the JSON.

Expected JSON format:
{
  "score": number (0-100),
  "is_correct": boolean,
  "feedback": "Overall summary of their response",
  "evaluation": {
    "strengths": ["Strength 1", "Strength 2"],
    "weaknesses": ["Weakness 1", "Weakness 2"],
    "communicationGaps": ["Communication gap points, e.g., structure, clarity, leadership expression"],
    "technicalGaps": ["Technical concepts missed or incorrectly explained"],
    "improvements": ["Actionable optimization or improvement tips"],
    "reasoning": "Step-by-step reasoning explaining why the score was assigned"
  }
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
        temperature: 0.3, // Low temperature for high evaluation accuracy
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
    console.log('Evaluation Agent Response:', content);

    content = content.replace(/```json\n|```/g, '').trim();
    const parsedData = JSON.parse(content);
    return parsedData;
  } catch (error) {
    console.error('evaluateCandidateResponse Error:', error.message);
    throw new Error(`Failed to evaluate candidate answer: ${error.message}`);
  }
};

/**
 * Compiles a final mock interview report and computes overall readiness score.
 */
const generateSessionSummary = async (transcript) => {
  const prompt = `You are a Senior Principal Interviewer compiling a final Mock Interview Report.
Analyze the following transcript of the mock interview session:

${JSON.stringify(transcript, null, 2)}

Provide a structured overall evaluation.
Output your response strictly in the JSON format below. Do not include extra comments, markdown formatting, or reasoning outside the JSON.

Expected JSON format:
{
  "readinessScore": number (0-100),
  "summary": "High-level summary of candidate performance",
  "overallStrengths": ["Key overall strength 1", "Key overall strength 2"],
  "overallWeaknesses": ["Key overall weakness 1", "Key overall weakness 2"],
  "gapsIdentified": ["Key gap 1", "Key gap 2"]
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
    content = content.replace(/```json\n|```/g, '').trim();
    const parsedData = JSON.parse(content);
    return parsedData;
  } catch (error) {
    console.error('generateSessionSummary Error:', error.message);
    throw new Error(`Failed to generate interview summary report: ${error.message}`);
  }
};

module.exports = {
  generateAdaptiveQuestion,
  evaluateCandidateResponse,
  generateSessionSummary
};
