'use server'

import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
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
  try {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const name = formData.get('name') as string
    const securityQuestion = formData.get('securityQuestion') as string
    const securityAnswer = formData.get('securityAnswer') as string

    if (!email || !password) {
      return { error: 'Email and password are required' }
    }

    // Use Admin Client to bypass rate limits and auto-confirm
    const adminClient = await createAdminClient()
    
    const { data: { user }, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm the user
      user_metadata: {
        name: name || '',
        security_question: securityQuestion || '',
        security_answer: securityAnswer?.toLowerCase().trim() || '',
      }
    })

    if (createError) {
      // Handle "User already exists" or other errors
      if (createError.message.includes('already registered')) {
        return { error: 'Identity already exists in the matrix. Try logging in.' }
      }
      return { error: createError.message }
    }

    // Since we used Admin API, the user is created but NOT signed in on the client side.
    // We now perform a standard login to establish the session.
    const supabase = await createClient()
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (loginError) {
      return { error: 'Account created, but automatic handshake failed. Please login manually.' }
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')

  } catch (error: any) {
    if (error.digest?.startsWith('NEXT_REDIRECT')) {
      throw error
    }
    console.error('[Signup Override] Error:', error)
    if (error.message?.includes('Missing Supabase Admin configuration')) {
      return { error: 'Neural link failed: Missing Supabase Admin Key. If you just added it to Vercel, please trigger a redeploy for it to take effect.' }
    }
    return { error: error.message || 'Neural link initialization failed.' }
  }
}

export async function forgotPassword(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string

  if (!email) {
    return { error: 'Email is required' }
  }

  const headerList = await headers()
  const host = headerList.get('host') || 'localhost:3000'
  const protocol = host.includes('localhost') ? 'http' : 'https'
  // Prioritize current host to ensure we stay in the same environment (dev vs prod)
  const siteUrl = `${protocol}://${host}`

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/api/auth/callback?next=${encodeURIComponent('/auth/reset-password')}`,
  })

  if (error) {
    return { error: error.message }
  }

  return { 
    success: true, 
    message: 'Password reset link sent. Check your secure comm link (email).' 
  }
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient()
  const password = formData.get('password') as string

  if (!password) {
    return { error: 'New password is required' }
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/login?message=Password updated successfully. Authenticate with your new key.')
}



export async function getSecurityQuestion(email: string) {
  try {
    const user = await db.user.findUnique({
      where: { email },
      select: { securityQuestion: true }
    })

    if (!user || !user.securityQuestion) {
      return { error: 'No security protocol found for this identity.' }
    }

    return { question: user.securityQuestion }
  } catch (error) {
    return { error: 'Database handshake failed.' }
  }
}

export async function resetPasswordWithSecurityAnswer(formData: FormData) {
  const email = formData.get('email') as string
  const answer = formData.get('answer') as string
  const newPassword = formData.get('newPassword') as string

  if (!email || !answer || !newPassword) {
    return { error: 'All neural parameters are required.' }
  }

  try {
    const user = await db.user.findUnique({
      where: { email },
      select: { id: true, securityAnswer: true }
    })

    if (!user || !user.securityAnswer) {
      return { error: 'Identity not recognized.' }
    }

    if (user.securityAnswer !== answer.toLowerCase().trim()) {
      return { error: 'Neural cipher mismatch. Access denied.' }
    }

    // Correct answer! Use Admin API to update password
    const adminClient = await createAdminClient()
    
    // Get the Supabase user ID by email
    const { data: { users }, error: listError } = await adminClient.auth.admin.listUsers()
    const supabaseUser = users.find(u => u.email === email)
    
    if (listError || !supabaseUser) {
      return { error: 'Core auth link failed.' }
    }

    const { error: updateError } = await adminClient.auth.admin.updateUserById(
      supabaseUser.id,
      { password: newPassword }
    )

    if (updateError) {
      return { error: updateError.message }
    }

    return { success: true, message: 'Neural link recalibrated. Authenticate with your new key.' }
  } catch (error) {
    console.error('Reset error:', error)
    return { error: 'System error during override.' }
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
