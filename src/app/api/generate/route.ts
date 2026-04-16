import { createClient } from '@/utils/supabase/server'
import { db } from '@/lib/db'
import { streamCourse } from '@/lib/gemini'

export const dynamic = 'force-dynamic'
export const maxDuration = 60 // Vercel: allow up to 60s for AI generation

interface GeminiModule {
  title: string
  type: 'READING' | 'LAB' | 'QUIZ'
  orderIndex: number
  content: string
  quizData?: any
}

interface GeminiCourse {
  title: string
  summary: string
  domain: string
  level: string
  modules: GeminiModule[]
}

function extractJson(rawText: string): string {
  // Find the first { and the last }
  const start = rawText.indexOf('{')
  const end = rawText.lastIndexOf('}')
  if (start !== -1 && end !== -1 && end > start) {
    return rawText.substring(start, end + 1)
  }
  return rawText.trim()
}

export async function POST(request: Request) {
  // Auth check
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const dbUser = await db.user.upsert({
    where: { email: user.email! },
    update: {},
    create: {
      email: user.email!,
      name: user.user_metadata?.name || '',
    },
    select: { id: true },
  })

  const { prompt } = await request.json()

  if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 5) {
    return Response.json({ error: 'A valid prompt is required' }, { status: 400 })
  }

  const encoder = new TextEncoder()

  const responseStream = new ReadableStream({
    async start(controller) {
      let accumulated = ''

      try {
        // Use Vercel AI SDK textStream — async iterable of string chunks
        const result = await streamCourse(prompt.trim())

        for await (const chunk of result.textStream) {
          accumulated += chunk

          // Forward live chunk to client
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'chunk', text: chunk })}\n\n`)
          )
        }

        // Parse & save to DB
        try {
          const { jsonrepair } = await import('jsonrepair')
          const cleanJson = extractJson(accumulated)
          const repaired = jsonrepair(cleanJson)
          const courseData: GeminiCourse = JSON.parse(repaired)

          const course = await db.course.create({
            data: {
              title: courseData.title,
              summary: courseData.summary,
              promptUsed: prompt.trim(),
              domain: courseData.domain,
              level: courseData.level,
              userId: dbUser.id,
              modules: {
                create: courseData.modules.map((m) => ({
                  title: m.title,
                  type: m.type,
                  orderIndex: m.orderIndex,
                  content: m.content,
                  quizData: m.quizData || undefined,
                })),
              },
            },
          })

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'done', courseId: course.id })}\n\n`)
          )
        } catch (parseErr) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: 'error', message: `Failed to parse course JSON: ${String(parseErr)}` })}\n\n`
            )
          )
        }

        controller.close()
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: 'error', message: `[Route] ${msg}` })}\n\n`)
        )
        controller.close()
      }
    },
  })

  return new Response(responseStream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
