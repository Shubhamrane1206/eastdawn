import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import GenerateClient from './GenerateClient'

export const metadata = {
  title: 'Generate Course | EASTDAWN',
  description: 'Type a prompt. Get a full AI-generated cybersecurity course in seconds.',
}

export default async function GeneratePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return <GenerateClient />
}
