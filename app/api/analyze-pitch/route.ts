import { type NextRequest, NextResponse } from "next/server"
import { generateObject } from "ai"
import { openai } from "@ai-sdk/openai"
import { z } from "zod"

const analysisSchema = z.object({
  clarity_score: z.number().min(0).max(100),
  suggestions: z.array(z.string()),
  local_tips: z.array(z.string()),
})

export async function POST(request: NextRequest) {
  try {
    const { pitch } = await request.json()

    if (!pitch || pitch.trim().length === 0) {
      return NextResponse.json({ error: "Pitch content is required" }, { status: 400 })
    }

    const { object } = await generateObject({
      model: openai("gpt-4o"),
      schema: analysisSchema,
      prompt: `
        Analyze this Ethiopian startup pitch and provide feedback:

        "${pitch}"

        Please provide:
        1. A clarity score (0-100) based on how clear, concise, and compelling the pitch is
        2. 3-5 specific suggestions for improvement (focus on clarity, market positioning, value proposition)
        3. 3-4 Ethiopian market context tips (local partnerships, cultural considerations, market opportunities, regulatory insights)

        Consider the Ethiopian business environment, including:
        - Mobile-first technology adoption
        - Agricultural economy transitioning to services
        - Growing tech ecosystem in Addis Ababa
        - Infrastructure challenges and opportunities
        - Local payment systems and banking
        - Government digitization initiatives
        - Youth demographic and entrepreneurship culture

        Be constructive and specific in your feedback.
      `,
    })

    return NextResponse.json(object)
  } catch (error) {
    console.error("Error analyzing pitch:", error)
    return NextResponse.json({ error: "Failed to analyze pitch" }, { status: 500 })
  }
}
