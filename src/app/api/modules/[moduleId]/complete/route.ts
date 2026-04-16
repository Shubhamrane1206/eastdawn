import { createClient } from '@/utils/supabase/server'
import { db } from '@/lib/db'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ moduleId: string }> }
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { moduleId } = await params
  const { isCompleted } = await request.json()

  const module = await db.module.findUnique({
    where: { id: moduleId },
    include: { course: { select: { userId: true } } },
  })

  if (!module) {
    return Response.json({ error: 'Module not found' }, { status: 404 })
  }

  // Verify ownership: user must own the course
  const dbUser = await db.user.findUnique({ where: { email: user.email! }, select: { id: true } })
  if (!dbUser || module.course.userId !== dbUser.id) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  await db.module.update({
    where: { id: moduleId },
    data: { isCompleted: Boolean(isCompleted) },
  })

  return Response.json({ ok: true })
}
