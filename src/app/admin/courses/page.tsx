import { getAllCourses } from '@/app/admin-actions'
import CoursesClient from './CoursesClient'

export const metadata = {
  title: 'Course Index | EASTDAWN Admin',
}

export default async function AdminCoursesPage() {
  const courses = await getAllCourses()
  return (
    <div className="p-8 max-w-7xl">
      <div className="mb-8">
        <p className="text-[10px] font-mono text-[var(--color-primary)] uppercase tracking-widest mb-1">
          / admin / courses
        </p>
        <h1 className="text-3xl font-display font-bold text-white uppercase tracking-tight">
          Course Index
        </h1>
        <p className="text-sm font-mono text-[var(--color-text-tertiary)] mt-1">
          All {courses.length} courses generated across the platform
        </p>
      </div>
      <CoursesClient initialCourses={courses} />
    </div>
  )
}
