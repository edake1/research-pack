'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useTheme } from 'next-themes'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Loader2,
  Save,
  ArrowLeft,
  Github,
  Trash2,
  Monitor,
  Sun,
  Moon,
  CheckCircle2,
  Link as LinkIcon,
} from 'lucide-react'
import { toast } from 'sonner'

interface UserSettings {
  id: string
  name: string | null
  email: string | null
  image: string | null
  bio: string | null
  website: string | null
  publicProfile: boolean
  publicEmail: boolean
  notifyThanks: boolean
  notifyForks: boolean
  notifyComments: boolean
  notifySuggestions: boolean
  createdAt: string
  accounts: { provider: string; providerAccountId: string }[]
  _count: { packs: number }
}

export default function SettingsPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { theme, setTheme } = useTheme()
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Form state
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [website, setWebsite] = useState('')
  const [publicProfile, setPublicProfile] = useState(true)
  const [publicEmail, setPublicEmail] = useState(false)
  const [notifyThanks, setNotifyThanks] = useState(true)
  const [notifyForks, setNotifyForks] = useState(true)
  const [notifyComments, setNotifyComments] = useState(true)
  const [notifySuggestions, setNotifySuggestions] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }
    if (status === 'authenticated') {
      fetchSettings()
    }
  }, [status])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings')
      if (!res.ok) throw new Error('Failed to fetch settings')
      const data: UserSettings = await res.json()
      setSettings(data)
      setName(data.name || '')
      setBio(data.bio || '')
      setWebsite(data.website || '')
      setPublicProfile(data.publicProfile)
      setPublicEmail(data.publicEmail)
      setNotifyThanks(data.notifyThanks)
      setNotifyForks(data.notifyForks)
      setNotifyComments(data.notifyComments)
      setNotifySuggestions(data.notifySuggestions)
    } catch (error) {
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          bio,
          website,
          publicProfile,
          publicEmail,
          notifyThanks,
          notifyForks,
          notifyComments,
          notifySuggestions,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save')
      }

      toast.success('Settings saved')
      setHasChanges(false)
      fetchSettings()
    } catch (error: any) {
      toast.error(error.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    setDeleting(true)
    try {
      const res = await fetch('/api/settings', { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete account')
      toast.success('Account deleted')
      signOut({ callbackUrl: '/' })
    } catch (error) {
      toast.error('Failed to delete account')
    } finally {
      setDeleting(false)
    }
  }

  const markChanged = () => setHasChanges(true)

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto" />
          <p className="text-sm text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    )
  }

  if (!settings) return null

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">Settings</h1>
          </div>
          <p className="text-muted-foreground ml-12">Manage your account and preferences</p>
        </div>
        {hasChanges && (
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</>
            ) : (
              <><Save className="h-4 w-4 mr-2" />Save Changes</>
            )}
          </Button>
        )}
      </div>

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Your public profile information</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar preview */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 ring-2 ring-border">
              <AvatarImage src={settings.image || undefined} alt={settings.name || 'User'} />
              <AvatarFallback className="bg-muted text-muted-foreground text-lg font-medium">
                {(settings.name || '?').split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{settings.name}</p>
              <p className="text-sm text-muted-foreground">
                Profile photo is synced from your GitHub account
              </p>
            </div>
          </div>

          <Separator />

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Display Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => { setName(e.target.value); markChanged() }}
              placeholder="Your name"
              maxLength={50}
            />
            <p className="text-xs text-muted-foreground">{name.length}/50 characters</p>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => { setBio(e.target.value); markChanged() }}
              placeholder="Tell others about your research interests..."
              maxLength={300}
              rows={3}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">{bio.length}/300 characters</p>
          </div>

          {/* Website */}
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="website"
                value={website}
                onChange={(e) => { setWebsite(e.target.value); markChanged() }}
                placeholder="https://yoursite.com"
                className="pl-9"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appearance Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize how Lumen looks for you</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'light', label: 'Light', icon: Sun },
              { value: 'dark', label: 'Dark', icon: Moon },
              { value: 'system', label: 'System', icon: Monitor },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setTheme(option.value)}
                className={`relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                  theme === option.value
                    ? 'border-foreground bg-muted/50'
                    : 'border-border/50 hover:border-border hover:bg-muted/30'
                }`}
              >
                <option.icon className={`h-5 w-5 ${theme === option.value ? 'text-foreground' : 'text-muted-foreground'}`} />
                <span className={`text-sm font-medium ${theme === option.value ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {option.label}
                </span>
                {theme === option.value && (
                  <CheckCircle2 className="absolute top-2 right-2 h-4 w-4 text-foreground" />
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notifications Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Choose what you want to be notified about</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-1">
          {[
            {
              id: 'notifyThanks',
              label: 'Thanks',
              description: 'When someone thanks your pack',
              value: notifyThanks,
              onChange: (v: boolean) => { setNotifyThanks(v); markChanged() },
            },
            {
              id: 'notifyForks',
              label: 'Forks',
              description: 'When someone forks your pack',
              value: notifyForks,
              onChange: (v: boolean) => { setNotifyForks(v); markChanged() },
            },
            {
              id: 'notifyComments',
              label: 'Comments',
              description: 'When someone comments on your pack',
              value: notifyComments,
              onChange: (v: boolean) => { setNotifyComments(v); markChanged() },
            },
            {
              id: 'notifySuggestions',
              label: 'Source suggestions',
              description: 'When someone suggests a source for your pack',
              value: notifySuggestions,
              onChange: (v: boolean) => { setNotifySuggestions(v); markChanged() },
            },
          ].map((item, i, arr) => (
            <div key={item.id}>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-sm">{item.label}</p>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                <Switch
                  checked={item.value}
                  onCheckedChange={item.onChange}
                />
              </div>
              {i < arr.length - 1 && <Separator />}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Privacy Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle>Privacy</CardTitle>
              <CardDescription>Control your visibility on Lumen</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-1">
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-sm">Public profile</p>
              <p className="text-sm text-muted-foreground">Allow others to see your profile page</p>
            </div>
            <Switch
              checked={publicProfile}
              onCheckedChange={(v) => { setPublicProfile(v); markChanged() }}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-sm">Show email on profile</p>
              <p className="text-sm text-muted-foreground">Display your email address on your public profile</p>
            </div>
            <Switch
              checked={publicEmail}
              onCheckedChange={(v) => { setPublicEmail(v); markChanged() }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Connected Accounts Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle>Connected Accounts</CardTitle>
              <CardDescription>Accounts linked to your Lumen profile</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {settings.accounts.map((account) => (
            <div key={account.provider} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <Github className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-sm capitalize">{account.provider}</p>
                  <p className="text-xs text-muted-foreground">Connected</p>
                </div>
              </div>
              <Badge variant="outline" className="text-green-600 dark:text-green-400 border-green-500/30">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Active
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-500/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-500" />
            <div>
              <CardTitle className="text-red-600 dark:text-red-400">Danger Zone</CardTitle>
              <CardDescription>Irreversible and destructive actions</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Delete account</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all your data. This cannot be undone.
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="border-red-500/30 text-red-600 hover:border-red-500/50 hover:bg-red-500/10 shrink-0">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete your account, all your research packs, comments,
                    and data. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    disabled={deleting}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {deleting ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Deleting...</>
                    ) : (
                      'Delete My Account'
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      {/* Floating save bar */}
      {hasChanges && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <div className="flex items-center gap-3 px-6 py-3 rounded-full border border-border/50 bg-background/80 backdrop-blur-xl shadow-2xl">
            <span className="text-sm text-muted-foreground">You have unsaved changes</span>
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving ? (
                <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Saving</>
              ) : (
                <><Save className="h-3.5 w-3.5 mr-1.5" />Save</>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
