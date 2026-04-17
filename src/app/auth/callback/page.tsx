'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function AuthCallback() {
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const run = async () => {
            const { data } = await supabase.auth.getSession()

            if (data.session) {
                router.replace('/dashboard') // use replace to avoid back loop
            } else {
                router.replace('/login')
            }
        }

        run()
    }, [])

    return <p>Authenticating...</p>
}