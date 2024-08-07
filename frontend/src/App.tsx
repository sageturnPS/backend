// * Routing functionality imports
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useUserStore } from './store'

// * Toast Functionality
import { Toaster } from 'react-hot-toast'

// * Page imports
import Home from '@/pages/Home'
import AdManagement from '@/pages/AdManagement'
import ViewPlaylist from './pages/viewPlaylist'
import Login from './pages/Login'
import ProfilePage from '@/pages/Profile'
import ViewAd from './pages/ViewAd'
import UploadAd from '@/pages/UploadAd'
import ViewSchedule from './pages/ViewSchedule'
import UnauthorizedPage from './pages/UnauthorizedPage'
import ErrorPage from './pages/Error'

function App() {
  const loggedIn = useUserStore((state) => state.loggedIn)

  return (
    <>
      <Router>
        {loggedIn ? (
          <Routes>
            <Route index element={<Home />} />
            <Route path="*" element={<ErrorPage />} />
            <Route path="/login" element={<Login />} />

            {/* If logged in and valid user */}

            <Route path="/search" element={<AdManagement />} />
            <Route path="/view/:id" element={<ViewAd />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/upload" element={<UploadAd />} />
            <Route path="/schedule" element={<ViewSchedule />} />
            <Route
              path="/playlist/store/:store_id/date/:date"
              element={<ViewPlaylist />}
            />
          </Routes>
        ) : (
          <Routes>
            <Route index element={<Home />} />
            <Route path="*" element={<UnauthorizedPage />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        )}
      </Router>
      <Toaster position="top-right" />
    </>
  )
}

export default App
