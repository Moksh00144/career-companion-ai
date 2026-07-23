import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useUIStore } from '@/stores/ui-store'
import { toast } from '@/hooks/use-toast'
import {
  User,
  Palette,
  Bot,
  Sun,
  Moon,
  Save,
  Sparkles,
  Trash2,
  Loader2,
} from 'lucide-react'

export function SettingsPage() {
  const queryClient = useQueryClient()
  const { theme, toggleTheme } = useUIStore()

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => api.getProfile(),
  })

  const [formData, setFormData] = useState({
    fullName: '',
    currentRole: '',
    targetRole: '',
    yearsExperience: 0,
    skills: '',
    interests: '',
  })

  // Initialize form when profile loads
  React.useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || '',
        currentRole: profile.currentRole || '',
        targetRole: profile.targetRole || '',
        yearsExperience: profile.yearsExperience || 0,
        skills: (profile.skills || []).join(', '),
        interests: (profile.interests || []).join(', '),
      })
    }
  }, [profile])

  const updateMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => api.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      queryClient.invalidateQueries({ queryKey: ['career-health'] })
      queryClient.invalidateQueries({ queryKey: ['activities'] })
      toast({
        title: 'Profile updated',
        description: 'Your career profile has been saved successfully.',
        variant: 'default',
      })
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      })
    },
  })

  const clearMutation = useMutation({
    mutationFn: () => api.clearData(),
    onSuccess: () => {
      // Invalidate all queries to refresh UI
      queryClient.invalidateQueries()
      toast({
        title: 'Data cleared',
        description: 'All your data has been removed successfully.',
        variant: 'default',
      })
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to clear data. Please try again.',
        variant: 'destructive',
      })
    },
  })

  const handleSave = () => {
    updateMutation.mutate({
      full_name: formData.fullName || undefined,
      current_role: formData.currentRole || undefined,
      target_role: formData.targetRole || undefined,
      years_experience: formData.yearsExperience || undefined,
      skills: formData.skills.split(',').map((s) => s.trim()).filter(Boolean),
      interests: formData.interests.split(',').map((s) => s.trim()).filter(Boolean),
    })
  }

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all your data? This action cannot be undone.')) {
      clearMutation.mutate()
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your profile and preferences</p>
      </div>

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            <CardTitle>Profile</CardTitle>
          </div>
          <CardDescription>Your career information helps the AI provide personalized advice</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <Input
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Years of Experience</label>
              <Input
                type="number"
                value={formData.yearsExperience}
                onChange={(e) => setFormData({ ...formData, yearsExperience: parseInt(e.target.value) || 0 })}
                placeholder="5"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Current Role</label>
              <Input
                value={formData.currentRole}
                onChange={(e) => setFormData({ ...formData, currentRole: e.target.value })}
                placeholder="Software Engineer"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Target Role</label>
              <Input
                value={formData.targetRole}
                onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                placeholder="Senior Software Engineer"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Skills (comma-separated)</label>
            <Input
              value={formData.skills}
              onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              placeholder="React, Python, AWS, TypeScript"
            />
            {formData.skills && (
              <div className="flex flex-wrap gap-1 mt-2">
                {formData.skills.split(',').map((s) => s.trim()).filter(Boolean).map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>
                ))}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Interests (comma-separated)</label>
            <Input
              value={formData.interests}
              onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
              placeholder="Machine Learning, System Design, Leadership"
            />
          </div>
          <Button onClick={handleSave} disabled={updateMutation.isPending} className="w-full md:w-auto">
            <Save className="w-4 h-4 mr-2" />
            {updateMutation.isPending ? 'Saving...' : 'Save Profile'}
          </Button>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            <CardTitle>Appearance</CardTitle>
          </div>
          <CardDescription>Customize how the application looks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === 'dark' ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-amber-500" />}
              <div>
                <p className="text-sm font-medium">Theme</p>
                <p className="text-xs text-muted-foreground">{theme === 'dark' ? 'Dark mode' : 'Light mode'}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={toggleTheme}>
              Switch to {theme === 'dark' ? 'Light' : 'Dark'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Preferences */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary" />
            <CardTitle>AI Preferences</CardTitle>
          </div>
          <CardDescription>Configure how the AI assistant responds</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm font-medium">AI Model</p>
                <p className="text-xs text-muted-foreground">Gemini 2.0 Flash (fast & cost-effective)</p>
              </div>
            </div>
            <Badge variant="secondary">Active</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-destructive" />
            <CardTitle>Danger Zone</CardTitle>
          </div>
          <CardDescription>Irreversible actions</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Clearing your data will remove all conversations, career profiles, memories, and uploaded documents.
          </p>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleClearData}
            disabled={clearMutation.isPending}
          >
            {clearMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4 mr-2" />
            )}
            {clearMutation.isPending ? 'Clearing...' : 'Clear All Data'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}