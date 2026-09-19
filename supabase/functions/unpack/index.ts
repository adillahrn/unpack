// UNPACK Edge Function — Mind Dump → Structured Baggage
// Primary: Gemini
// Fallback: Groq GPT-OSS 20B

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface BaggageItem {
  title: string
  category: 'academic' | 'deadline' | 'social' | 'personal' | 'health' | 'financial' | 'other'
  urgency: 'high' | 'medium' | 'low'
  actionStep: string
}

interface UnpackResponse {
  items: BaggageItem[]
}

const VALID_CATEGORIES = [
  'academic',
  'deadline',
  'social',
  'personal',
  'health',
  'financial',
  'other',
]

const VALID_URGENCIES = [
  'high',
  'medium',
  'low',
]

const SYSTEM_PROMPT = `You are a supportive assistant that helps students organize their thoughts. You are NOT a therapist, counselor, or medical professional. You do NOT diagnose, assess mental health conditions, or provide psychological advice.

Your ONLY job is to:
1. Extract distinct concerns/tasks/thoughts from the user's mind dump
2. Categorize each item (academic, deadline, social, personal, health, financial, other)
3. Estimate urgency (high, medium, low)
4. Provide one small, concrete action step per item (something doable in under 5 minutes)

Action step guidelines:
- Must be specific and immediately actionable
- Good: "Open the slide deck and write the title slide"
- Bad: "Work on your presentation" (too vague)

Respond ONLY with valid JSON in this exact format, no markdown fences, no extra text:
{
  "items": [
    {
      "title": "short descriptive title",
      "category": "academic|deadline|social|personal|health|financial|other",
      "urgency": "high|medium|low",
      "actionStep": "one small concrete step to take right now"
    }
  ]
}`

function validateItems(parsed: unknown): UnpackResponse {
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Response is not an object')
  }

  const obj = parsed as Record<string, unknown>

  if (!Array.isArray(obj.items)) {
    throw new Error('Missing items array')
  }

  if (obj.items.length === 0) {
    throw new Error('Items array is empty')
  }

  const validatedItems: BaggageItem[] = obj.items.map(
    (item: unknown, i: number) => {
      if (!item || typeof item !== 'object') {
        throw new Error(`Item ${i} is not an object`)
      }

      const it = item as Record<string, unknown>

      if (
        typeof it.title !== 'string' ||
        !it.title.trim()
      ) {
        throw new Error(`Item ${i} missing title`)
      }

      if (
        typeof it.category !== 'string' ||
        !VALID_CATEGORIES.includes(it.category)
      ) {
        throw new Error(
          `Item ${i} invalid category: ${it.category}`,
        )
      }

      if (
        typeof it.urgency !== 'string' ||
        !VALID_URGENCIES.includes(it.urgency)
      ) {
        throw new Error(
          `Item ${i} invalid urgency: ${it.urgency}`,
        )
      }

      if (
        typeof it.actionStep !== 'string' ||
        !it.actionStep.trim()
      ) {
        throw new Error(
          `Item ${i} missing actionStep`,
        )
      }

      return {
        title: it.title.trim().slice(0, 100),
        category:
          it.category as BaggageItem['category'],
        urgency:
          it.urgency as BaggageItem['urgency'],
        actionStep:
          it.actionStep.trim().slice(0, 200),
      }
    },
  )

  return {
    items: validatedItems.slice(0, 20),
  }
}

/* =========================================================
   PRIMARY MODEL — GEMINI
   ========================================================= */

async function callGemini(
  rawText: string,
  apiKey: string,
): Promise<UnpackResponse> {

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
                text:
                  SYSTEM_PROMPT +
                  `\n\nUser's mind dump:\n"${rawText}"`,
              },
            ],
          },
        ],

        generationConfig: {
          responseMimeType: 'application/json',
        },
      }),
    },
  )

  if (!response.ok) {
    const errText = await response.text()

    throw new Error(
      `Gemini API error ${response.status}: ${errText}`,
    )
  }

  const geminiResult = await response.json()

  const generatedText =
    geminiResult.candidates?.[0]?.content?.parts?.[0]?.text

  if (!generatedText) {
    throw new Error(
      'No response text from Gemini',
    )
  }

  const parsed = JSON.parse(generatedText)

  return validateItems(parsed)
}

/* =========================================================
   FALLBACK MODEL — GROQ
   ========================================================= */

async function callGroq(
  rawText: string,
  apiKey: string,
): Promise<UnpackResponse> {

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

        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content:
              `User's mind dump:\n"${rawText}"`,
          },
        ],

        temperature: 0.3,

        max_tokens: 1024,

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

  const groqResult = await response.json()

  const generatedText =
    groqResult.choices?.[0]?.message?.content

  if (!generatedText) {
    throw new Error(
      'No response text from Groq',
    )
  }

  const parsed = JSON.parse(generatedText)

  return validateItems(parsed)
}

/* =========================================================
   MAIN
   ========================================================= */

serve(async (req: Request) => {

  // CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders,
    })
  }

  try {

    const {
      raw_text,
      unload_id,
    } = await req.json()

    // Validate raw text
    if (
      !raw_text ||
      typeof raw_text !== 'string' ||
      !raw_text.trim()
    ) {
      return new Response(
        JSON.stringify({
          error: 'raw_text is required',
          errorKey: 'unpack.error.empty',
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

    // Validate unload ID
    if (
      !unload_id ||
      typeof unload_id !== 'string'
    ) {
      return new Response(
        JSON.stringify({
          error: 'unload_id is required',
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

    /* =====================================================
       AUTHENTICATION
       ===================================================== */

    const authHeader =
      req.headers.get('Authorization')

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: {
            Authorization:
              authHeader ?? '',
          },
        },
      },
    )

    const {
      data: { user },
      error: userError,
    } =
      await supabaseClient.auth.getUser()

    if (userError || !user) {
      return new Response(
        JSON.stringify({
          error: 'Unauthorized',
          errorKey:
            'unpack.error.unauthorized',
        }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            'Content-Type':
              'application/json',
          },
        },
      )
    }

    /* =====================================================
       API KEYS
       ===================================================== */

    const geminiApiKey =
      Deno.env.get('GEMINI_API_KEY')

    const groqApiKey =
      Deno.env.get('GROQ_API_KEY')

    /* =====================================================
       1. TRY GEMINI FIRST
       ===================================================== */

    let result: UnpackResponse | null = null

    if (geminiApiKey) {

      try {

        console.log(
          'UNPACK: Trying Gemini...',
        )

        result = await callGemini(
          raw_text,
          geminiApiKey,
        )

        console.log(
          'UNPACK: Gemini succeeded',
        )

      } catch (error) {

        console.warn(
          'UNPACK: Gemini failed. Switching to Groq...',
          error,
        )
      }
    }

    /* =====================================================
       2. FALLBACK TO GROQ
       ===================================================== */

    if (!result && groqApiKey) {

      try {

        console.log(
          'UNPACK: Trying Groq fallback...',
        )

        result = await callGroq(
          raw_text,
          groqApiKey,
        )

        console.log(
          'UNPACK: Groq fallback succeeded',
        )

      } catch (error) {

        console.error(
          'UNPACK: Groq fallback failed',
          error,
        )
      }
    }

    /* =====================================================
       3. BOTH MODELS FAILED
       ===================================================== */

    if (!result) {

      return new Response(
        JSON.stringify({
          error:
            'AI processing failed',
          errorKey:
            'unpack.error.parse',
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

    /* =====================================================
       SUCCESS
       ===================================================== */

    return new Response(
      JSON.stringify({
        items: result.items,
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
      'Unpack error:',
      error,
    )

    return new Response(
      JSON.stringify({
        error:
          'Failed to unpack. Please try again.',
        errorKey:
          'unpack.error.server',
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