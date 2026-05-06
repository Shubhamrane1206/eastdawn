import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  let next = requestUrl.searchParams.get('next') ?? '/dashboard'

  console.log('[Auth Callback] Request URL:', request.url)
  
  // Robust check for recovery flow: if reset-password is in the URL or 'next' param
  if (request.url.includes('reset-password') || next.includes('reset-password')) {
    next = '/auth/reset-password'
  }

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      console.log('[Auth Callback] Success. Redirecting to:', next)
      // Revalidate to ensure the session is picked up
      revalidatePath('/', 'layout')
      
      // Use the origin from the request URL to ensure consistency
      const redirectUrl = new URL(next, requestUrl.origin)
      return NextResponse.redirect(redirectUrl)
    }
    
    console.error('[Auth Callback] Error:', error.message)
    return NextResponse.redirect(`${requestUrl.origin}/auth/auth-code-error?error=${encodeURIComponent(error.message)}`)
  }

  return NextResponse.redirect(`${requestUrl.origin}/auth/auth-code-error?error=Missing+code`)
}
