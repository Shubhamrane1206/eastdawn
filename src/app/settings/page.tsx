import { createClient } from '@/utils/supabase/server'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { Hexagon, UserCircle } from 'lucide-react'
import { revalidatePath } from 'next/cache'

const CYBERPUNK_AVATARS = [
  'https://api.dicebear.com/7.x/bottts/svg?seed=Felix&backgroundColor=0f1f3a',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Jack&backgroundColor=0f1f3a',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Aneka&backgroundColor=0f1f3a',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Nico&backgroundColor=0f1f3a',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Jude&backgroundColor=0f1f3a',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Leo&backgroundColor=0f1f3a',
]

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const dbUser = await db.user.upsert({
    where: { email: user.email! },
    update: {},
    create: { email: user.email! },
  })

  async function updateProfile(formData: FormData) {
    'use server'
    const name = formData.get('name') as string
    const avatarUrl = formData.get('avatarUrl') as string

    await db.user.update({
      where: { id: dbUser.id },
      data: { name, avatarUrl }
    })
    
    revalidatePath('/', 'layout')
  }

  return (
    <div className="flex flex-col min-h-screen px-4 py-24 sm:px-8 max-w-4xl mx-auto w-full">
      <div className="mb-12 border-b border-[var(--color-surface-3)] pb-8">
        <h1 className="text-4xl font-display font-bold text-white uppercase tracking-tight drop-shadow-[0_0_15px_rgba(0,200,255,0.3)] flex items-center gap-4">
          <UserCircle className="w-10 h-10 text-[var(--color-primary)]" />
          Operator Profile
        </h1>
        <p className="text-[var(--color-text-secondary)] mt-2 font-mono text-sm">
          Update your neural identity and avatar configuration.
        </p>
      </div>

      <form action={updateProfile} className="space-y-12">
        <section className="p-8 border border-[var(--color-surface-3)] rounded-xl bg-[var(--color-surface-1)]">
           <h2 className="text-xl font-display font-bold text-white uppercase mb-6 flex items-center gap-2">
             <Hexagon className="w-5 h-5 text-[var(--color-secondary)]" /> Identity Configuration
           </h2>
           <div>
             <label className="block text-xs font-mono text-[var(--color-text-tertiary)] uppercase mb-2">Display Name</label>
             <input
                type="text"
                name="name"
                defaultValue={dbUser.name || 'Operator'}
                className="w-full max-w-md bg-[var(--color-surface-3)] border border-[var(--color-surface-3)] focus:border-[var(--color-primary)] rounded h-12 px-4 text-white font-mono text-sm focus:outline-none transition-colors"
                required
             />
           </div>
        </section>

        <section className="p-8 border border-[var(--color-surface-3)] rounded-xl bg-[var(--color-surface-1)]">
           <h2 className="text-xl font-display font-bold text-white uppercase mb-6 flex items-center gap-2">
             <Hexagon className="w-5 h-5 text-[var(--color-success)]" /> Neural Avatar Selection
           </h2>
           <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
             {CYBERPUNK_AVATARS.map((url, i) => (
                <label key={i} className="cursor-pointer group relative">
                  <input type="radio" name="avatarUrl" value={url} defaultChecked={dbUser.avatarUrl === url || (!dbUser.avatarUrl && i === 0)} className="peer sr-only" />
                  <div className="aspect-square rounded-2xl bg-[var(--color-surface-3)] border border-[var(--color-surface-3)] peer-checked:border-[var(--color-primary)] peer-checked:shadow-[0_0_15px_rgba(0,200,255,0.3)] transition-all overflow-hidden p-2 group-hover:border-[var(--color-text-secondary)]">
                    <img src={url} alt={`Avatar ${i}`} className="w-full h-full object-cover rounded-xl" />
                  </div>
                </label>
             ))}
           </div>
        </section>

        <div className="flex justify-end">
          <button type="submit" className="px-8 py-4 bg-[var(--color-primary)] text-[#03050a] font-display font-bold uppercase rounded-lg hover:bg-[var(--color-success)] transition-colors shadow-[0_0_15px_rgba(0,200,255,0.2)] hover:shadow-[0_0_20px_rgba(0,220,120,0.3)] inline-flex items-center gap-2">
            Save Configuration
          </button>
        </div>
      </form>
    </div>
  )
}
