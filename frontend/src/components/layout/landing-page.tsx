import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles, FileText, Target, BookOpen, BarChart3 } from 'lucide-react'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b">
        <div className="container flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg">CareerForge AI</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Dashboard
            </Link>
            <Link to="/chat" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              AI Chat
            </Link>
          </nav>
          <Link to="/dashboard">
            <Button variant="gradient" size="sm">
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent" />
        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary mb-6">
              <Sparkles className="w-4 h-4" />
              AI-Powered Career Development
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Your Personal{' '}
              <span className="text-gradient">AI Career Coach</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Master interviews, perfect your resume, discover your ideal career path, 
              and bridge skill gaps — all powered by advanced AI.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/dashboard">
                <Button variant="gradient" size="xl">
                  Start Your Journey <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/chat">
                <Button variant="outline" size="xl">
                  Try AI Chat
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 border-t">
        <div className="container">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="glass-card rounded-xl p-6 hover:border-primary/50 transition-all duration-300">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container text-center text-sm text-muted-foreground">
          CareerForge AI — Built with AI for the Vibe Coding Competition
        </div>
      </footer>
    </div>
  )
}

const features = [
  {
    title: 'Mock Interviews',
    description: 'Practice with AI-powered interview simulations tailored to your target role.',
    icon: <Target className="w-5 h-5 text-primary" />,
  },
  {
    title: 'Resume Analysis',
    description: 'Get ATS-optimized scores and actionable improvements for your resume.',
    icon: <FileText className="w-5 h-5 text-accent" />,
  },
  {
    title: 'Skill Gap Analysis',
    description: 'Identify missing skills and get a personalized learning roadmap.',
    icon: <BookOpen className="w-5 h-5 text-primary" />,
  },
  {
    title: 'Career Health',
    description: 'Track your career readiness with comprehensive scoring and insights.',
    icon: <BarChart3 className="w-5 h-5 text-accent" />,
  },
]