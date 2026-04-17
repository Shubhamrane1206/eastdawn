'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { db } from '@/lib/db'

export async function login(formData: FormData) {
  const supabase = await createClient()

  // Get email and password from formData
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  // Next steps on successful login
  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: name || '',
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/api/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  // If session is present, it means email confirmation is disabled or the user is auto-confirmed
  if (data?.session) {
    revalidatePath('/', 'layout')
    redirect('/dashboard')
  }

  // Otherwise, return a success message indicating that a verification link has been sent
  return { 
    success: true, 
    message: 'Verification link sent. Access granted upon link acknowledgement in your terminal (email).' 
  }
}


export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}

export async function markOnboardingComplete() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: 'Unauthorized' }
  
  try {
    await db.user.update({
      where: { email: user.email! },
      data: { onboardingComplete: true }
    })
    
    revalidatePath('/dashboard', 'layout')
    return { success: true }
  } catch (error) {
    console.error('Failed to update onboarding status:', error)
    return { error: 'Failed to update onboarding status' }
  }
}
