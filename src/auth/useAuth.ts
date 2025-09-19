import { useEffect, useMemo, useState } from 'react'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { auth } from './firebase'

export type UseAuthOptions = {
  requireAuth?: boolean
  redirectTo?: string // defaults to '/login'
}

export type UserData = {
  id: string
  name: string
  lastName: string
}

export type Business = {
  id: string
  name: string
}

export function useAuth(options: UseAuthOptions = {}) {
  const { requireAuth = false, redirectTo = '/login' } = options
  const navigate = useNavigate()

  const [user, setUser] = useState<User | null>(auth.currentUser)
  const [loading, setLoading] = useState<boolean>(!auth.currentUser)

  // Backend profile data
  const [userData, setUserData] = useState<UserData | null>(null)
  const [businesses, setBusinesses] = useState<Business[] | null>(null)
  const [profileLoading, setProfileLoading] = useState<boolean>(false)
  const [profileError, setProfileError] = useState<string | null>(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
    })
    return () => unsub()
  }, [])

  // Centralized auth guard: if required and not authenticated once loading finishes, redirect
  useEffect(() => {
    if (!loading && requireAuth && !user) {
      navigate(redirectTo, { replace: true })
    }
  }, [loading, requireAuth, user, redirectTo, navigate])

  // Fetch profile + businesses from backend when authenticated
  useEffect(() => {
    let cancelled = false
    const run = async () => {
      setProfileError(null)
      setUserData(null)
      setBusinesses(null)
      if (!user) return
      setProfileLoading(true)
      try {
        const token = await user.getIdToken()
        const res = await fetch('/api/user', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error(`backend error ${res.status}`)
        type MeResponse = { id: string; name?: string | null; last_name?: string | null; businesses: Array<{ id: string; name: string }>} 
        const data: MeResponse = await res.json()
        if (cancelled) return
        setUserData({ id: data.id, name: data.name!, lastName: data.last_name! })
        setBusinesses(data.businesses ?? [])
      } catch (e: any) {
        if (cancelled) return
        setProfileError(e?.message ?? 'failed to load profile')
      } finally {
        if (!cancelled) setProfileLoading(false)
      }
    }
    run()
    return () => { cancelled = true }
  }, [user])

  return useMemo(() => ({ user, loading, userData, businesses, profileLoading, profileError }), [user, loading, userData, businesses, profileLoading, profileError])
}
