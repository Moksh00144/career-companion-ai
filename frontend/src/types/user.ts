export interface UserProfile {
  id: string
  fullName?: string
  email?: string
  currentRole?: string
  yearsExperience?: number
  skills: string[]
  interests: string[]
  education?: {
    degree?: string
    field?: string
    institution?: string
    year?: number
  }
  targetRole?: string
  resumeText?: string
  resumeFileName?: string
}

export interface CareerHealth {
  overall: number
  resumeScore: number
  interviewScore: number
  skillGapScore: number
  careerReadiness: number
  lastUpdated: string
}

export interface Activity {
  id: string
  type: 'resume_analyzed' | 'interview_practice' | 'skill_gap' | 'career_advice'
  title: string
  description: string
  timestamp: string
  score?: number
}