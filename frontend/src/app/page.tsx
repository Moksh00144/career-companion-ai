import { Routes, Route } from 'react-router-dom'
import { LandingPage } from '@/components/layout/landing-page'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { DashboardPage } from '@/components/layout/dashboard-page'
import { ChatPage } from '@/components/chat/chat-page'
import { SettingsPage } from '@/components/layout/settings-page'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/chat/:conversationId" element={<ChatPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  )
}