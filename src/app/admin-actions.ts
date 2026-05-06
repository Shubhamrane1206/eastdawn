'use server'

import { db } from '@/lib/db'
import { Role } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

// ─── Auth Guard ────────────────────────────────────────────────────────────────

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const dbUser = await db.user.findUnique({
    where: { email: user.email! },
    select: { role: true },
  })
  if (!dbUser || dbUser.role !== 'ADMIN') redirect('/dashboard')
}

// ─── Platform Stats ─────────────────────────────────────────────────────────

export async function getPlatformStats() {
  await requireAdmin()
  const [totalUsers, totalCourses, totalBadgesAwarded, totalXp] = await Promise.all([
    db.user.count(),
    db.course.count(),
    db.userBadge.count(),
    db.user.aggregate({ _sum: { totalXp: true } }),
  ])

  const usersOnStreak = await db.user.count({
    where: { currentStreak: { gt: 0 } },
  })

  return {
    totalUsers,
    totalCourses,
    totalBadgesAwarded,
    totalXp: totalXp._sum.totalXp ?? 0,
    usersOnStreak,
  }
}

// ─── Users ───────────────────────────────────────────────────────────────────

export async function getAllUsers() {
  await requireAdmin()
  return db.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { badges: true, courses: true } },
    },
  })
}

export async function getUserById(id: string) {
  await requireAdmin()
  return db.user.findUnique({
    where: { id },
    include: {
      badges: { include: { badge: true } },
      courses: { orderBy: { createdAt: 'desc' } },
      quizAttempts: { orderBy: { createdAt: 'desc' }, take: 10 },
    },
  })
}

export async function updateUserRole(id: string, role: Role) {
  await requireAdmin()
  await db.user.update({ where: { id }, data: { role } })
  revalidatePath('/admin/users')
  revalidatePath(`/admin/users/${id}`)
}

export async function updateUserXp(id: string, xp: number) {
  await requireAdmin()
  await db.user.update({ where: { id }, data: { totalXp: xp } })
  revalidatePath('/admin/users')
  revalidatePath(`/admin/users/${id}`)
}

export async function deleteUser(id: string) {
  await requireAdmin()
  await db.user.delete({ where: { id } })
  revalidatePath('/admin/users')
}

// ─── Badges ──────────────────────────────────────────────────────────────────

export async function getAllBadges() {
  await requireAdmin()
  return db.badge.findMany({
    include: { _count: { select: { users: true } } },
    orderBy: { tier: 'asc' },
  })
}

export async function awardBadgeToUser(userId: string, badgeId: string) {
  await requireAdmin()
  await db.userBadge.upsert({
    where: { userId_badgeId: { userId, badgeId } },
    create: { userId, badgeId },
    update: {},
  })
  revalidatePath('/admin/badges')
  revalidatePath(`/admin/users/${userId}`)
}

export async function revokeBadgeFromUser(userId: string, badgeId: string) {
  await requireAdmin()
  await db.userBadge.delete({
    where: { userId_badgeId: { userId, badgeId } },
  })
  revalidatePath('/admin/badges')
  revalidatePath(`/admin/users/${userId}`)
}

// ─── Courses ─────────────────────────────────────────────────────────────────

export async function getAllCourses() {
  await requireAdmin()
  return db.course.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true, email: true } },
      _count: { select: { modules: true } },
    },
  })
}

export async function deleteCourse(id: string) {
  await requireAdmin()
  await db.course.delete({ where: { id } })
  revalidatePath('/admin/courses')
}

// ─── Quiz Attempts ────────────────────────────────────────────────────────────

export async function getQuizAttempts() {
  await requireAdmin()
  return db.quizAttempt.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true, email: true } },
      module: { select: { title: true, course: { select: { title: true } } } },
    },
    take: 200,
  })
}

export async function getQuizStats() {
  await requireAdmin()
  const [total, avgResult, topDomain] = await Promise.all([
    db.quizAttempt.count(),
    db.quizAttempt.aggregate({ _avg: { score: true } }),
    db.quizAttempt.groupBy({
      by: ['domain'],
      _count: { domain: true },
      orderBy: { _count: { domain: 'desc' } },
      take: 1,
    }),
  ])

  return {
    total,
    avgScore: Math.round(avgResult._avg.score ?? 0),
    topDomain: topDomain[0]?.domain ?? 'N/A',
  }
}

// ─── Create / Delete Badge ────────────────────────────────────────────────────

export async function createBadge(formData: FormData) {
  await requireAdmin()
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const tier = formData.get('tier') as string
  const imageUrl = formData.get('imageUrl') as string

  if (!name || !description || !tier) {
    return { error: 'All fields required.' }
  }

  try {
    await db.badge.create({ data: { name, description, tier, imageUrl: imageUrl || null } })
    revalidatePath('/admin/badges')
    return { success: true }
  } catch (e: any) {
    return { error: e.message || 'Failed to create badge.' }
  }
}

export async function deleteBadge(id: string) {
  await requireAdmin()
  await db.badge.delete({ where: { id } })
  revalidatePath('/admin/badges')
}
