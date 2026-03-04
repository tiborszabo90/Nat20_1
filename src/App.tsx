import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { HomePage } from './pages/HomePage'
import { JoinPage } from './pages/JoinPage'
import { LoginPage } from './pages/LoginPage'
import { CreateCampaignPage } from './pages/CreateCampaignPage'
import { DmDashboardPage } from './pages/DmDashboardPage'
import { PlayerDashboardPage } from './pages/PlayerDashboardPage'
import { CharacterBuilderPage } from './pages/CharacterBuilderPage'
import { CharacterSheetPage } from './pages/CharacterSheetPage'
import { EncyclopediaPage } from './pages/EncyclopediaPage'
import { BattlemapPage } from './pages/BattlemapPage'
import { NotificationModal } from './components/notifications/NotificationModal'
import { useDndData } from './hooks/useDndData'
import { useFirestoreSync } from './hooks/useFirestoreSync'
import { useAuth } from './hooks/useAuth'
import { useAuthStore } from './store/authStore'

/** Védett Route – nem bejelentkezett felhasználót a LoginPage-re irányít */
function RequireAuth({ children }: { children: ReactNode }) {
  const uid = useAuthStore(s => s.uid)
  if (!uid) return <Navigate to="/login" replace />
  return <>{children}</>
}

// AppContent: hook-ok hívása BrowserRouter-en belül, Routes felett
function AppContent() {
  useAuth()
  useDndData()
  useFirestoreSync()

  const isReady = useAuthStore(s => s.isReady)

  // Auth inicializálásig nem renderelünk – megelőzi a UID nélküli műveleteket
  if (!isReady) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <>
      <Routes>
        {/* Publikus útvonal */}
        <Route path="/login" element={<LoginPage />} />

        {/* Védett útvonalak */}
        <Route path="/"                               element={<RequireAuth><HomePage /></RequireAuth>} />
        <Route path="/join"                           element={<RequireAuth><JoinPage /></RequireAuth>} />
        <Route path="/create"                         element={<RequireAuth><CreateCampaignPage /></RequireAuth>} />
        <Route path="/dm/:campaignId"                 element={<RequireAuth><DmDashboardPage /></RequireAuth>} />
        <Route path="/player/:campaignId"             element={<RequireAuth><PlayerDashboardPage /></RequireAuth>} />
        <Route path="/player/:campaignId/build"       element={<RequireAuth><CharacterBuilderPage /></RequireAuth>} />
        <Route path="/player/:campaignId/sheet"       element={<RequireAuth><CharacterSheetPage /></RequireAuth>} />
        <Route path="/encyclopedia"                   element={<RequireAuth><EncyclopediaPage /></RequireAuth>} />
        <Route path="/player/:campaignId/encyclopedia" element={<RequireAuth><EncyclopediaPage /></RequireAuth>} />
        <Route path="/dm/:campaignId/encyclopedia"    element={<RequireAuth><EncyclopediaPage /></RequireAuth>} />
        <Route path="/dm/:campaignId/battlemap"       element={<RequireAuth><BattlemapPage /></RequireAuth>} />
        <Route path="/player/:campaignId/battlemap"   element={<RequireAuth><BattlemapPage /></RequireAuth>} />
      </Routes>
      <NotificationModal />
    </>
  )
}

export function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}
