import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { initScrollAnimations } from '@/lib/animate'
import {
  ArrowRight,
  Sparkles,
  FileText,
  Target,
  BookOpen,
  BarChart3,
  CheckCircle2,
  Quote,
  Star,
  Users,
  TrendingUp,
} from 'lucide-react'

export function LandingPage() {
  useEffect(() => {
    const cleanup = initScrollAnimations()
    return cleanup
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b">
        <div className="container flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center transition-transform group-hover:scale-110">
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
            <Link to="/settings" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Settings
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
        <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-accent/5 to-transparent" />
        <div className="absolute top-1/4 -left-32 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center" data-animate>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary mb-6 animate-fade-in">
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
                <Button variant="gradient" size="xl" className="group">
                  Start Your Journey <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
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

      {/* Stats Bar */}
      <section className="py-12 border-t border-b bg-secondary/30" data-animate>
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-gradient mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20" data-animate>
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-3">Everything You Need</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Comprehensive career tools powered by cutting-edge AI to accelerate your professional growth.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="glass-card rounded-xl p-6 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 border-t bg-secondary/20" data-animate>
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-3">How It Works</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Three simple steps to transform your career trajectory.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((step, i) => (
              <div key={step.title} className="text-center relative">
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-px bg-gradient-to-r from-primary/40 to-transparent" />
                )}
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-white relative z-10">
                  {i + 1}
                </div>
                <h3 className="font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20" data-animate>
        <div className="container">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight mb-3">Loved by Professionals</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Join thousands of professionals who have accelerated their careers.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((t) => (
              <div key={t.name} className="glass-card rounded-xl p-6 hover:border-primary/30 transition-all">
                <Quote className="w-8 h-8 text-primary/30 mb-3" />
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{t.text}</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-sm font-bold text-white">
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t relative overflow-hidden" data-animate>
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10" />
        <div className="container relative">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Ready to Transform Your Career?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Start your AI-powered career journey today. No credit card required.
            </p>
            <Link to="/dashboard">
              <Button variant="gradient" size="xl" className="group">
                Get Started Free <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold">CareerForge AI</span>
              </div>
              <p className="text-sm text-muted-foreground">
                AI-powered career development platform.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-3">Features</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Mock Interviews</li>
                <li>Resume Analysis</li>
                <li>Skill Gap Analysis</li>
                <li>Career Planning</li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-3">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Help Center</li>
                <li>Career Guides</li>
                <li>Blog</li>
                <li>FAQ</li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Cookie Policy</li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 text-center text-sm text-muted-foreground">
            CareerForge AI — Built with AI for the Vibe Coding Competition
          </div>
        </div>
      </footer>
    </div>
  )
}

const stats = [
  { value: '10K+', label: 'Active Users' },
  { value: '50K+', label: 'Interviews Practiced' },
  { value: '95%', label: 'Satisfaction Rate' },
  { value: '4.9', label: 'Average Rating' },
]

const features = [
  {
    title: 'Mock Interviews',
    description: 'Practice with AI-powered interview simulations tailored to your target role and industry.',
    icon: <Target className="w-5 h-5 text-primary" />,
  },
  {
    title: 'Resume Analysis',
    description: 'Get ATS-optimized scores, keyword suggestions, and actionable improvements for your resume.',
    icon: <FileText className="w-5 h-5 text-accent" />,
  },
  {
    title: 'Skill Gap Analysis',
    description: 'Identify missing skills, compare with market demands, and get a personalized learning roadmap.',
    icon: <BookOpen className="w-5 h-5 text-primary" />,
  },
  {
    title: 'Career Health',
    description: 'Track your career readiness with comprehensive scoring, insights, and personalized recommendations.',
    icon: <BarChart3 className="w-5 h-5 text-accent" />,
  },
]

const steps = [
  {
    title: 'Create Your Profile',
    description: 'Share your experience, skills, and career goals to get personalized AI guidance.',
  },
  {
    title: 'Practice & Analyze',
    description: 'Engage in mock interviews, analyze your resume, and identify skill gaps with AI feedback.',
  },
  {
    title: 'Track Progress',
    description: 'Monitor your career health scores, review activity history, and see your improvement over time.',
  },
]

const testimonials = [
  {
    text: 'CareerForge AI helped me land my dream job. The mock interview practice was incredibly realistic and the feedback was spot-on.',
    name: 'Sarah Chen',
    role: 'Software Engineer at Google',
    initials: 'SC',
  },
  {
    text: 'The resume analysis feature identified gaps I never noticed. After implementing the suggestions, my interview callbacks doubled.',
    name: 'Marcus Johnson',
    role: 'Product Manager at Meta',
    initials: 'MJ',
  },
  {
    text: 'The skill gap analysis gave me a clear roadmap for upskilling. I landed a promotion within 3 months of using CareerForge.',
    name: 'Priya Patel',
    role: 'Data Scientist at Amazon',
    initials: 'PP',
  },
]