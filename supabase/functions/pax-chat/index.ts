// PAX-CHAT Edge Function — Supportive AI companion for students
// Uses Groq with GPT-OSS 20B

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
}

const SYSTEM_PROMPT = `You are PAX, a warm and supportive AI companion for university students.

You are NOT a therapist, counselor, or medical professional.
You do NOT diagnose conditions or provide clinical advice.

Your personality:
- Warm, empathetic, and non-judgmental
- Speak casually like a caring friend
- Use simple and comforting language
- Respond in the same language as the user
- Keep responses concise, usually 2-4 sentences

What you DO:
- Listen actively and validate feelings
- Offer small practical self-care tips
- Encourage healthy habits
- Help with study motivation and burnout prevention
- Encourage talking to trusted people or professionals when appropriate

What you DO NOT do:
- Diagnose mental health conditions
- Provide psychological treatment
- Prescribe medication
- Make assumptions about the user's mental state
- Minimize or dismiss their feelings

If a user expresses thoughts of self-harm or suicide:
- Respond with empathy
- Encourage them to contact someone they trust
- Encourage contacting emergency or professional support

You MUST return ONLY valid JSON.

Format:
{
  "reply": "your response",
  "mood": {
    "label": "happy|sad|anxious|calm|energized",
    "confidence": 0.0
  },
  "distress": false
}

Rules:
- confidence must be between 0 and 1
- distress must be true only for self-harm, suicidal ideation, or severe emotional crisis
- No markdown
- No text outside the JSON`

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

  if (
    typeof obj.reply !== 'string' ||
    !obj.reply.trim()
  ) {
    throw new Error('Missing reply')
  }

  if (!obj.mood || typeof obj.mood !== 'object') {
    throw new Error('Missing mood')
  }

  const mood = obj.mood as Record<string, unknown>

  const validMoods = [
    'happy',
    'sad',
    'anxious',
    'calm',
    'energized',
  ]

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

async function callGroq(
  message: string,
  history: ChatHistory[],
  apiKey: string,
): Promise<PaxResponse> {

  const messages = [
    {
      role: 'system',
      content: SYSTEM_PROMPT,
    },
  ]

  // Add conversation history
  for (const msg of history) {
    messages.push({
      role: msg.role === 'model'
        ? 'assistant'
        : 'user',
      content: msg.text,
    })
  }

  // Add current message
  messages.push({
    role: 'user',
    content: message,
  })

  const response = await fetch(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },

      body: JSON.stringify({
        model: 'openai/gpt-oss-20b',

        messages,

        temperature: 0.7,

        max_tokens: 512,

        response_format: {
          type: 'json_object',
        },
      }),
    },
  )

  if (!response.ok) {
    const errText = await response.text()

    throw new Error(
      `Groq API error ${response.status}: ${errText}`,
    )
  }

  const result = await response.json()

  const generatedText =
    result.choices?.[0]?.message?.content

  if (!generatedText) {
    throw new Error('No response text from Groq')
  }

  const parsed = JSON.parse(generatedText)

  return validateResponse(parsed)
}

serve(async (req: Request) => {

  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders,
    })
  }

  try {

    const {
      message,
      history = [],
    } = await req.json()

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
            'Content-Type':
              'application/json',
          },
        },
      )
    }

    // Get Groq API key
    const groqApiKey =
      Deno.env.get('GROQ_API_KEY')

    if (!groqApiKey) {

      console.error(
        'GROQ_API_KEY not configured',
      )

      throw new Error(
        'AI service not configured',
      )
    }

    let result: PaxResponse

    // First attempt
    try {

      result = await callGroq(
        message,
        history,
        groqApiKey,
      )

    } catch (firstError) {

      console.warn(
        'First Groq attempt failed, retrying...',
        firstError,
      )

      // Retry once
      try {

        result = await callGroq(
          message,
          history,
          groqApiKey,
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
              'Content-Type':
                'application/json',
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
          'Content-Type':
            'application/json',
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
          'Content-Type':
            'application/json',
        },
      },
    )
  }
})