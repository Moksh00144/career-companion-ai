import { Sparkles, MessageSquare, FileText, Target, BookOpen, BarChart3 } from 'lucide-react'
import type { ConversationMode } from '@/types/chat'

interface EmptyStateProps {
  mode: ConversationMode
  onSuggestionClick: (text: string) => void
}

const suggestions: Record<ConversationMode, string[]> = {
  general: [
    'What career path is right for me?',
    'How do I negotiate a salary offer?',
    'Tips for networking effectively',
    'How to write a great cover letter',
  ],
  interview: [
    'Tell me about yourself',
    'Why do you want to work here?',
    'Describe a challenge you overcame',
    'Where do you see yourself in 5 years?',
  ],
  resume_analysis: [
    'Analyze my resume for ATS compatibility',
    'How can I improve my bullet points?',
    'What keywords should I add?',
    'Review my resume summary',
  ],
  skill_gap: [
    'What skills do I need for a senior role?',
    'How to transition from developer to manager',
    'Skills needed for cloud architecture',
    'What certifications should I pursue?',
  ],
  career_advice: [
    'Should I switch industries?',
    'How to get promoted faster',
    'Best career paths for my skills',
    'How to build a personal brand',
  ],
}

const modeIcons: Record<ConversationMode, typeof Sparkles> = {
  general: MessageSquare,
  interview: Target,
  resume_analysis: FileText,
  skill_gap: BookOpen,
  career_advice: BarChart3,
}

const modeDescriptions: Record<ConversationMode, string> = {
  general: 'Ask anything about career development, job searching, or professional growth.',
  interview: 'Practice your interview skills with AI-powered mock interviews tailored to your target role.',
  resume_analysis: 'Paste your resume text for ATS scoring and actionable improvement suggestions.',
  skill_gap: 'Identify missing skills between your current role and your dream job.',
  career_advice: 'Get personalized career path recommendations and strategic advice.',
}

export function EmptyState({ mode, onSuggestionClick }: EmptyStateProps) {
  const Icon = modeIcons[mode]

  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-4">
      {/* Icon */}
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-5 ring-1 ring-primary/10">
        <Icon className="w-8 h-8 text-primary" />
      </div>

      {/* Title */}
      <h2 className="text-xl font-semibold mb-2">
        {mode === 'general' && 'How can I help your career?'}
        {mode === 'interview' && 'Ready for your mock interview?'}
        {mode === 'resume_analysis' && 'Let\'s analyze your resume'}
        {mode === 'skill_gap' && 'Find your skill gaps'}
        {mode === 'career_advice' && 'Plan your career strategy'}
      </h2>

      {/* Description */}
      <p className="text-sm text-muted-foreground max-w-md mb-8">
        {modeDescriptions[mode]}
      </p>

      {/* Suggestions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
        {suggestions[mode].map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => onSuggestionClick(suggestion)}
            className="text-left px-4 py-3 rounded-xl bg-secondary/50 border border-border/30 hover:bg-secondary hover:border-border/60 transition-all duration-200 text-sm text-muted-foreground hover:text-foreground group"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-primary/40 group-hover:text-primary/70 transition-colors flex-shrink-0" />
              {suggestion}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
