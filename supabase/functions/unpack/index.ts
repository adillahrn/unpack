// UNPACK Edge Function — Mind Dump → Structured Baggage
// Calls Gemini API to extract, categorize, estimate urgency, and suggest action steps

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

const VALID_CATEGORIES = ['academic', 'deadline', 'social', 'personal', 'health', 'financial', 'other']
const VALID_URGENCIES = ['high', 'medium', 'low']

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

  const validatedItems: BaggageItem[] = obj.items.map((item: unknown, i: number) => {
    if (!item || typeof item !== 'object') {
      throw new Error(`Item ${i} is not an object`)
    }

    const it = item as Record<string, unknown>

    if (typeof it.title !== 'string' || !it.title.trim()) {
      throw new Error(`Item ${i} missing title`)
    }
    if (typeof it.category !== 'string' || !VALID_CATEGORIES.includes(it.category)) {
      throw new Error(`Item ${i} invalid category: ${it.category}`)
    }
    if (typeof it.urgency !== 'string' || !VALID_URGENCIES.includes(it.urgency)) {
      throw new Error(`Item ${i} invalid urgency: ${it.urgency}`)
    }
    if (typeof it.actionStep !== 'string' || !it.actionStep.trim()) {
      throw new Error(`Item ${i} missing actionStep`)
    }

    return {
      title: it.title.trim().slice(0, 100),
      category: it.category as BaggageItem['category'],
      urgency: it.urgency as BaggageItem['urgency'],
      actionStep: it.actionStep.trim().slice(0, 200),
    }
  })

  return { items: validatedItems.slice(0, 20) }
}

async function callGemini(rawText: string, apiKey: string): Promise<UnpackResponse> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: SYSTEM_PROMPT + `\n\nUser's mind dump:\n"${rawText}"` }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: 'application/json'
        }
      })
    }
  )

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`Gemini API error ${response.status}: ${errText}`)
  }

  const geminiResult = await response.json()
  const generatedText = geminiResult.candidates?.[0]?.content?.parts?.[0]?.text

  if (!generatedText) {
    throw new Error('No response text from Gemini')
  }

  const parsed = JSON.parse(generatedText)
  return validateItems(parsed)
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { raw_text, unload_id } = await req.json()

    if (!raw_text || typeof raw_text !== 'string' || !raw_text.trim()) {
      return new Response(
        JSON.stringify({ error: 'raw_text is required', errorKey: 'unpack.error.empty' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!unload_id || typeof unload_id !== 'string') {
      return new Response(
        JSON.stringify({ error: 'unload_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Set up Supabase client bound to the caller's auth header
    const authHeader = req.headers.get('Authorization')
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: { headers: { Authorization: authHeader ?? '' } }
      }
    )

    // ADDED: verify the caller is a logged-in user before doing anything else
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized', errorKey: 'unpack.error.unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get API key from environment secret
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) {
      console.error('GEMINI_API_KEY not configured in environment secrets')
      throw new Error('AI service not configured')
    }

    // Call Gemini with retry
    let result: UnpackResponse
    try {
      result = await callGemini(raw_text, geminiApiKey)
    } catch (firstError) {
      console.warn('First Gemini attempt failed, retrying...', firstError)
      try {
        result = await callGemini(raw_text, geminiApiKey)
      } catch (retryError) {
        console.error('Retry also failed:', retryError)
        return new Response(
          JSON.stringify({ error: 'AI processing failed after retry', errorKey: 'unpack.error.parse' }),
          { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    const insertRows = result.items.map((item) => ({
      unload_id: unload_id,
      title: item.title,
      category: item.category,
      urgency: item.urgency,
      action_step: item.actionStep,
      user_id: user.id, // ADDED: tie each row to the authenticated user
    }))

    const { data: insertedItems, error: dbError } = await supabaseClient
      .from('baggage_items')
      .insert(insertRows)
      .select()

    if (dbError) {
      console.error('Database insert error:', dbError)
      // Still return AI results even if DB save fails
      return new Response(
        JSON.stringify({ ...result, dbError: 'Failed to save, but results are available' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ items: result.items, savedItems: insertedItems }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Unpack error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to unpack. Please try again.', errorKey: 'unpack.error.server' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})