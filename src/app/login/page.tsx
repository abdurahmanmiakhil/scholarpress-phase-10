'use client'

import React, { useState, useTransition, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, ArrowLeft, Loader2, Lock, Shield } from 'lucide-react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/admin'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (!email || !password) {
      setErrorMsg('Please enter both email and password.')
      return
    }

    startTransition(async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
          setErrorMsg(error.message || 'Invalid login credentials.')
          return
        }

        if (data.session) {
          router.push(redirectTo)
          router.refresh()
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'An unexpected authentication error occurred.')
      }
    })
  }

  return (
    <Card className="rounded-none border-border/80 shadow-sm bg-card text-card-foreground">
      <CardHeader className="space-y-2 pb-6">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted-foreground">
          <Shield className="size-4" />
          <span>Restricted Portal</span>
        </div>
        <CardTitle className="font-serif text-2xl font-bold tracking-tight">
          Author Authentication
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Sign in to access editorial management, article composition, and publication settings.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleLogin}>
        <CardContent className="space-y-4">
          {errorMsg && (
            <div className="flex items-start gap-3 p-3 text-xs border border-destructive/30 bg-destructive/10 text-destructive rounded-none">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <p className="leading-relaxed font-sans">{errorMsg}</p>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="email" className="font-mono text-xs uppercase tracking-wider">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="author@institution.edu"
              required
              autoComplete="email"
              disabled={isPending}
              className="rounded-none font-sans"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="font-mono text-xs uppercase tracking-wider">
                Password
              </Label>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              autoComplete="current-password"
              disabled={isPending}
              className="rounded-none font-sans"
            />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4 pt-2">
          <Button
            type="submit"
            className="w-full rounded-none gap-2 font-mono text-xs uppercase tracking-wider"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <Lock className="size-4" />
                <span>Sign In to Admin</span>
              </>
            )}
          </Button>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 text-xs text-muted-foreground hover:text-foreground font-mono transition-colors"
          >
            <ArrowLeft className="size-3" />
            <span>Return to publication</span>
          </Link>
        </CardFooter>
      </form>
    </Card>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center px-4 py-12 selection:bg-neutral-900 selection:text-white">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block">
            <span className="font-serif text-2xl font-bold tracking-tight">ScholarPress</span>
          </Link>
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
            Academic & Research Publishing
          </p>
        </div>

        <Suspense fallback={
          <div className="p-8 border border-border bg-card text-center text-sm font-mono text-muted-foreground">
            Loading authentication interface...
          </div>
        }>
          <LoginForm />
        </Suspense>

        <p className="text-center text-xs font-mono text-muted-foreground">
          Single-Author Installation • Public registration is disabled
        </p>
      </div>
    </div>
  )
}

