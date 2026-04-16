import { createGroq } from '@ai-sdk/groq'
import { streamText } from 'ai'

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY!,
})

const SYSTEM_PROMPT = `You are EASTDAWN's AI course engine — an expert cybersecurity curriculum designer.
Given a user's learning goal, generate a complete, professional cybersecurity course.

CRITICAL: You must respond with ONLY valid JSON. No markdown fences, no explanation, no extra text — pure JSON only.

The JSON must follow this exact schema:
{
  "title": "string (compelling course title, concise)",
  "summary": "string (2-3 sentence executive summary of what the learner will achieve)",
  "domain": "string (e.g. 'Web Security', 'Network Security', 'Cloud Security', 'Malware Analysis', 'Cryptography', 'OSINT', 'Reverse Engineering', 'Threat Intelligence', 'Incident Response', 'Forensics')",
  "level": "Beginner" | "Intermediate" | "Advanced" | "Expert",
  "modules": [
    {
      "title": "string (clear, specific module title)",
      "type": "READING" | "LAB" | "QUIZ",
      "orderIndex": 0,
      "content": "string (rich markdown. If READING/LAB: 1000-1500 words, highly technical. Include: learning objectives, deep concepts with real-world context, code examples, CVE/MITRE references. If QUIZ: brief 50-word intro text.)",
      "quizData": {
        "questions": [
          {
            "question": "string (The technical question)",
            "options": ["string", "string", "string", "string"],
            "answerIndex": 0
          }
        ]
      }
    }
  ]
}

Rules:
- Generate exactly 8 modules
- Alternate types: READING, LAB, QUIZ, READING, LAB, QUIZ, READING, LAB
- Module orderIndex must be 0-7 in sequence
- If type is 'QUIZ', you MUST populate the 'quizData' object with exactly 3 highly technical multiple-choice questions. If it is NOT a quiz, leave 'quizData' missing or null.
- All content must be accurate, professional, and match cybersecurity best practices (OWASP, NIST, MITRE ATT&CK)
- Code samples must be in appropriate languages (Python, Bash, Go, etc.) and be commented
- Infer the skill level from the user's prompt phrasing — adjust depth accordingly
- Do NOT generate working exploits for production systems; use demonstration contexts only
- No trailing commas in JSON; ensure it is fully parse-ready
- CRITICAL: You must escape all newlines (as \\n) and quotes inside string values. Do not output literal newline characters inside the "content" field.`

export type CourseStream = Awaited<ReturnType<typeof streamCourse>>

export async function streamCourse(prompt: string) {
  return streamText({
    model: groq('llama-3.3-70b-versatile'),
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `User learning goal: ${prompt}`,
      },
    ],
    temperature: 0.7,
  })
}
