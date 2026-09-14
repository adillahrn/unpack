// UNPACK Edge Function — Mind Dump → Structured Baggage
// Calls Gemini API to extract, categorize, and estimate urgency

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
}

interface UnpackResponse {
  items: BaggageItem[]
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { raw_text } = await req.json()

    if (!raw_text || typeof raw_text !== 'string') {
      return new Response(
        JSON.stringify({ error: 'raw_text is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY not configured')
    }

    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are a supportive assistant that helps students organize their thoughts. You are NOT a therapist, counselor, or medical professional. You do NOT diagnose, assess mental health conditions, or provide psychological advice.

Your ONLY job is to:
1. Extract distinct concerns/tasks/thoughts from the user's mind dump
2. Categorize each item (academic, deadline, social, personal, health, financial, other)
3. Estimate urgency (high, medium, low)

Respond ONLY with valid JSON in this exact format:
{
  "items": [
    {
      "title": "short descriptive title",
      "category": "academic|deadline|social|personal|health|financial|other",
      "urgency": "high|medium|low"
    }
  ]
}

User's mind dump:
"${raw_text}"`
                }
              ]
            }
          ],
          generationConfig: {
            responseMimeType: 'application/json'
          }
        })
      }
    )

    const geminiResult = await response.json()
    const generatedText = geminiResult.candidates?.[0]?.content?.parts?.[0]?.text

    if (!generatedText) {
      throw new Error('No response from Gemini')
    }

    const parsed: UnpackResponse = JSON.parse(generatedText)

    return new Response(
      JSON.stringify(parsed),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Unpack error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to unpack. Please try again.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
