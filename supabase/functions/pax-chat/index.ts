// PAX-CHAT Edge Function — Supportive AI companion for students
// Uses the same Gemini model as UNPACK

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SYSTEM_PROMPT = `You are PAX, a warm and supportive AI companion for university students. You are NOT a therapist, counselor, or medical professional. You do NOT diagnose conditions or provide clinical advice.

Your personality:
- Warm, empathetic, and non-judgmental
- Speak casually like a caring friend — not formal or clinical
- Use simple, comforting language
- Respond in the same language the user writes in (Indonesian or English)
- Keep responses concise (2-4 sentences usually, unless the topic needs more)

What you DO:
- Listen actively and validate feelings
- Offer practical, small self-care tips (breathing, hydration, rest)
- Encourage healthy habits and perspective shifts
- Suggest the user talk to a trusted person or professional when appropriate
- Help with study motivation and burnout prevention tips

What you DO NOT do:
- Diagnose mental health conditions
- Provide therapy or psychological treatment
- Prescribe medication or medical advice
- Make assumptions about the user's mental state
- Minimize or dismiss their feelings

If a user expresses thoughts of self-harm or suicide, respond with empathy and immediately encourage them to contact:
- Into The Light Indonesia: 119 ext 8
- Or talk to someone they trust

You MUST respond ONLY with valid JSON in this exact format:
{
  "reply": "your supportive response here",
  "mood": {
    "label": "happy|sad|anxious|calm|energized",
    "confidence": 0.0
  },
  "distress": false
}

Rules:
- confidence must be a number between 0 and 1
- distress must be true only when the user expresses self-harm, suicidal ideation, or severe emotional crisis
- Do not include markdown
- Do not include any text outside the JSON`

interface ChatHistory {
  role: 'user' | 'model'
  text: string
}

interface PaxResponse {
  reply: string
  mood: {
    label: string
    confidence: number
  }
  distress: boolean
}

function validateResponse(parsed: unknown): PaxResponse {
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Response is not an object')
  }

  const obj = parsed as Record<string, unknown>

  if (typeof obj.reply !== 'string' || !obj.reply.trim()) {
    throw new Error('Missing reply')
  }

  if (!obj.mood || typeof obj.mood !== 'object') {
    throw new Error('Missing mood')
  }

  const mood = obj.mood as Record<string, unknown>

  const validMoods = ['happy', 'sad', 'anxious', 'calm', 'energized']

  if (
    typeof mood.label !== 'string' ||
    !validMoods.includes(mood.label)
  ) {
    throw new Error(`Invalid mood: ${mood.label}`)
  }

  if (
    typeof mood.confidence !== 'number' ||
    mood.confidence < 0 ||
    mood.confidence > 1
  ) {
    throw new Error('Invalid mood confidence')
  }

  if (typeof obj.distress !== 'boolean') {
    throw new Error('Invalid distress value')
  }

  return {
    reply: obj.reply.trim(),
    mood: {
      label: mood.label,
      confidence: mood.confidence,
    },
    distress: obj.distress,
  }
}

async function callGemini(
  message: string,
  history: ChatHistory[],
  apiKey: string,
): Promise<PaxResponse> {

  // Build conversation history
  const conversation = history
    .map((msg) => {
      const role = msg.role === 'model' ? 'PAX' : 'User'
      return `${role}: ${msg.text}`
    })
    .join('\n')

  const prompt = `${SYSTEM_PROMPT}

${conversation ? `Conversation history:\n${conversation}\n\n` : ''}User's current message:
${message}`

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.7,
          maxOutputTokens: 512,
        },
      }),
    },
  )

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`Gemini API error ${response.status}: ${errText}`)
  }

  const result = await response.json()

  const generatedText =
    result.candidates?.[0]?.content?.parts?.[0]?.text

  if (!generatedText) {
    throw new Error('No response text from Gemini')
  }

  const parsed = JSON.parse(generatedText)

  return validateResponse(parsed)
}

serve(async (req: Request) => {

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders,
    })
  }

  try {
    const { message, history = [] } = await req.json()

    if (
      !message ||
      typeof message !== 'string' ||
      !message.trim()
    ) {
      return new Response(
        JSON.stringify({
          error: 'Message is required',
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        },
      )
    }

    // Get Gemini API key
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')

    if (!geminiApiKey) {
      console.error(
        'GEMINI_API_KEY not configured in environment secrets',
      )

      throw new Error('AI service not configured')
    }

    // Call Gemini with retry
    let result: PaxResponse

    try {
      result = await callGemini(
        message,
        history,
        geminiApiKey,
      )
    } catch (firstError) {

      console.warn(
        'First Gemini attempt failed, retrying...',
        firstError,
      )

      try {
        result = await callGemini(
          message,
          history,
          geminiApiKey,
        )
      } catch (retryError) {

        console.error(
          'Retry also failed:',
          retryError,
        )

        return new Response(
          JSON.stringify({
            error:
              'AI processing failed after retry',
          }),
          {
            status: 502,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
            },
          },
        )
      }
    }

    return new Response(
      JSON.stringify({
        reply: result.reply,
        mood: result.mood,
        distress: result.distress,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    )

  } catch (error) {

    console.error(
      'pax-chat error:',
      error,
    )

    return new Response(
      JSON.stringify({
        error:
          'Failed to process message. Please try again.',
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    )
  }
})