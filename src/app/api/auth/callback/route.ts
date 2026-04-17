import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/dashboard'
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Revalidate the dashboard to ensure the session is picked up
      revalidatePath('/dashboard', 'layout')
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Return the user to an error page if code exchange fails
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
