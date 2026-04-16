import { createClient } from '@/utils/supabase/server'
import { db } from '@/lib/db'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ moduleId: string }> }
) {
  const { moduleId } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const dbUser = await db.user.upsert({
    where: { email: user.email! },
    update: {},
    create: { email: user.email!, name: user.user_metadata?.name || '' },
  })

  const { answers } = await request.json()
  if (!Array.isArray(answers)) {
    return Response.json({ error: 'Invalid answers array' }, { status: 400 })
  }

  // Fetch the module
  const module = await db.module.findUnique({
    where: { id: moduleId },
    include: { course: true }
  })

  if (!module) {
    return Response.json({ error: 'Module not found' }, { status: 404 })
  }

  if (module.type !== 'QUIZ' || !module.quizData) {
    return Response.json({ error: 'Module is not a valid quiz' }, { status: 400 })
  }

  const quizData: any = module.quizData
  const questions = quizData.questions || []
  
  if (questions.length === 0) {
    return Response.json({ error: 'Quiz has no questions' }, { status: 400 })
  }

  let correctCount = 0
  questions.forEach((q: any, i: number) => {
    if (answers[i] === q.answerIndex) {
      correctCount++
    }
  })

  const scorePct = Math.round((correctCount / questions.length) * 100)
  const passed = scorePct >= 60

  // Points calculation
  const xpEarned = correctCount * 50
  const minutesEarned = passed && !module.isCompleted ? 20 : 0 // Only award time if passed for first time

  // Build a transaction to save all this data safely
  await db.$transaction([
    // Log the attempt
    db.quizAttempt.create({
      data: {
        score: scorePct,
        domain: module.course.domain,
        userId: dbUser.id,
        moduleId: module.id
      }
    }),
    
    // Mark module complete if passed
    ...(passed && !module.isCompleted ? [
      db.module.update({
        where: { id: module.id },
        data: { isCompleted: true }
      })
    ] : []),

    // Update User Stats
    db.user.update({
      where: { id: dbUser.id },
      data: {
        totalXp: { increment: xpEarned },
        totalStudyMinutes: { increment: minutesEarned }
      }
    })
  ])

  // Simple Badge Reward Logic (Fire and Forget)
  // Fetch updated user to see if they pass a threshold
  const updatedUser = await db.user.findUnique({ where: { id: dbUser.id }, include: { badges: true } })
  const userBadgeIds = new Set(updatedUser?.badges.map(b => b.badgeId))

  const tryAwardBadge = async (name: string, desc: string, tier: string) => {
    // Find or create badge
    let badge = await db.badge.findUnique({ where: { name } })
    if (!badge) {
      badge = await db.badge.create({ data: { name, description: desc, tier } })
    }
    // If not awarded, award it
    if (!userBadgeIds.has(badge.id)) {
       await db.userBadge.create({
         data: { userId: dbUser.id, badgeId: badge.id }
       })
    }
  }

  // Award basic badges dynamically based on progression
  if (updatedUser!.totalStudyMinutes >= 60) {
    await tryAwardBadge("Dedicated Scholar", "Studied for 1 hour.", "BRONZE")
  }
  if (updatedUser!.totalXp >= 1000) {
    await tryAwardBadge("Byte Master", "Earned 1000 XP.", "SILVER")
  }
  if (passed && scorePct === 100) {
    await tryAwardBadge("Flawless Execution", "Scored 100% on a Quiz.", "GOLD")
  }

  return Response.json({
    success: true,
    score: scorePct,
    passed,
    xpEarned,
    minutesEarned
  })
}
