import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { db } from '@/lib/db'
import CourseReader from './CourseReader'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const course = await db.course.findUnique({ where: { id }, select: { title: true } })
  return {
    title: course ? `${course.title} | EASTDAWN` : 'Course | EASTDAWN',
  }
}

export default async function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { id } = await params

  const course = await db.course.findUnique({
    where: { id },
    include: {
      modules: { orderBy: { orderIndex: 'asc' } },
      user: { select: { name: true } },
    },
  })

  if (!course) notFound()

  return <CourseReader course={course} />
}
