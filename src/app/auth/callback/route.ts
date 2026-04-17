import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const cookieStore = await cookies()
    
    // We use the canonical site URL for the final redirect to ensure session persistence
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || origin
    const redirectUrl = new URL(next, siteUrl).toString()
    const response = NextResponse.redirect(redirectUrl)

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              const extendedOptions = { 
                ...options, 
                domain: '.eastdawn.in', 
                path: '/',
                sameSite: 'lax' as const,
                secure: true
              }
              // Dual-sync: set on both the live cookie store and the redirect response
              cookieStore.set(name, value, extendedOptions)
              response.cookies.set(name, value, extendedOptions)
            })
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      return response
    }
  }

  // Fallback to register with error if exchange fails
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || origin
  return NextResponse.redirect(`${siteUrl}/register?error=AuthError`)
}
