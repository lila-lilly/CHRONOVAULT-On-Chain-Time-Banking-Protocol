import Navigation from './components/Navigation'
import Toasts from './components/Toasts'
import Board from './pages/Board'
import PostTask from './pages/PostTask'
import MyTasks from './pages/MyTasks'
import Profile from './pages/Profile'
import { useChronoStore } from './lib/store'

export default function App() {
  const { activeTab } = useChronoStore()
  return (
    <div className="min-h-screen relative">
      <div className="relative z-10">
        <Navigation />
        <main>
          {activeTab === 'board'   && <Board   />}
          {activeTab === 'post'    && <PostTask />}
          {activeTab === 'mytasks' && <MyTasks  />}
          {activeTab === 'profile' && <Profile  />}
        </main>
      </div>
      <Toasts />
    </div>
  )
}
