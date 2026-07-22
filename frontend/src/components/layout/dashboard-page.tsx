import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Link } from 'react-router-dom'
import {
  FileText,
  Target,
  BookOpen,
  BarChart3,
  ArrowRight,
  Sparkles,
  Upload,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Clock,
  Activity,
  Zap,
  Award,
} from 'lucide-react'

const scoreCards = [
  { key: 'resumeScore', label: 'Resume Score', icon: FileText, color: 'from-blue-500 to-blue-600' },
  { key: 'interviewScore', label: 'Interview Score', icon: Target, color: 'from-purple-500 to-purple-600' },
  { key: 'skillGapScore', label: 'Skill Gap', icon: BookOpen, color: 'from-emerald-500 to-emerald-600' },
  { key: 'careerReadiness', label: 'Career Readiness', icon: BarChart3, color: 'from-amber-500 to-amber-600' },
]

export function DashboardPage() {
  const { data: health, isLoading: healthLoading } = useQuery({
    queryKey: ['career-health'],
    queryFn: () => api.getCareerHealth(),
  })

  const { data: activitiesData, isLoading: activitiesLoading } = useQuery({
    queryKey: ['activities'],
    queryFn: () => api.getActivities(),
  })

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Your career health overview</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/chat">
            <Button variant="outline" size="sm">
              <MessageSquare className="w-4 h-4 mr-2" />
              AI Chat
            </Button>
          </Link>
          <Link to="/chat?mode=resume_analysis">
            <Button variant="gradient" size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Upload Resume
            </Button>
          </Link>
        </div>
      </div>

      {/* Career Health Score */}
      <Card className="relative overflow-hidden border-glow hover-lift">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-transparent" />
        <CardContent className="p-6 md:p-8 relative">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent p-1">
                <div className="w-full h-full rounded-full bg-card flex items-center justify-center">
                  <span className="text-3xl font-bold text-gradient">
                    {healthLoading ? '--' : health?.overall ?? 0}
                  </span>
                </div>
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-accent flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-1">Career Health Score</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Your overall career readiness based on resume quality, interview performance, skills, and career planning.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="text-xs">
                  <Clock className="w-3 h-3 mr-1" />
                  {health?.lastUpdated ? 'Updated recently' : 'Not yet analyzed'}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <Award className="w-3 h-3 mr-1" />
                  Target: {health?.careerReadiness ?? 0}% readiness
                </Badge>
              </div>
            </div>
            <Link to="/chat?mode=career_advice">
              <Button variant="outline" size="sm">
                Get Advice <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Score Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {scoreCards.map((card) => {
          const score = health ? (health as any)[card.key] as number ?? 0 : 0
          const trend = score >= 50 ? 'up' : 'down'
          return (
            <Card key={card.key} className="hover:border-primary/30 transition-all duration-300 hover-lift">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                    <card.icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-lg font-bold">
                    {healthLoading ? '--' : score}
                    <span className="text-xs text-muted-foreground font-normal">/100</span>
                  </span>
                </div>
                <p className="text-sm font-medium">{card.label}</p>
                <div className="mt-2 h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${trend === 'up' ? 'from-primary to-accent' : 'from-amber-500 to-red-500'} transition-all duration-500`}
                    style={{ width: `${healthLoading ? 0 : score}%` }}
                  />
                </div>
                <div className="flex items-center gap-1 mt-1">
                  {trend === 'up' ? (
                    <TrendingUp className="w-3 h-3 text-emerald-500" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-red-500" />
                  )}
                  <span className={`text-xs ${trend === 'up' ? 'text-emerald-500' : 'text-red-500'}`}>
                    {trend === 'up' ? 'Improving' : 'Needs attention'}
                  </span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <Link key={action.label} to={action.href}>
              <Card className="hover:border-primary/30 hover:bg-primary/5 transition-all duration-300 cursor-pointer group hover-lift">
                <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <action.icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium">{action.label}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        {activitiesLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : activitiesData?.activities && activitiesData.activities.length > 0 ? (
          <div className="space-y-2">
            {activitiesData.activities.map((activity) => (
              <Card key={activity.id} className="hover:border-primary/20 transition-colors hover-lift">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                    {activityIcons[activity.type as keyof typeof activityIcons] || <Sparkles className="w-4 h-4 text-primary" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{activity.title}</p>
                    {activity.description && (
                      <p className="text-xs text-muted-foreground truncate">{activity.description}</p>
                    )}
                  </div>
                  {activity.score !== null && activity.score !== undefined && (
                    <Badge variant={activity.score >= 70 ? 'success' : activity.score >= 40 ? 'warning' : 'destructive'}>
                      {activity.score}/100
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Sparkles className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No activity yet. Start by analyzing your resume or practicing an interview!</p>
              <Link to="/chat">
                <Button variant="outline" size="sm" className="mt-4">
                  Start Chatting <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

const quickActions = [
  { label: 'Mock Interview', icon: Target, href: '/chat?mode=interview' },
  { label: 'Analyze Resume', icon: FileText, href: '/chat?mode=resume_analysis' },
  { label: 'Skill Gap', icon: BookOpen, href: '/chat?mode=skill_gap' },
  { label: 'Career Advice', icon: BarChart3, href: '/chat?mode=career_advice' },
]

const activityIcons = {
  resume_analyzed: <FileText className="w-4 h-5 text-blue-500" />,
  interview_practice: <Target className="w-4 h-5 text-purple-500" />,
  skill_gap: <BookOpen className="w-4 h-5 text-emerald-500" />,
  career_advice: <BarChart3 className="w-4 h-5 text-amber-500" />,
}