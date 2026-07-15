import { useEffect } from 'react'
import Navigation from './components/Navigation'
import Toasts from './components/Toasts'
import Board from './pages/Board'
import PostTask from './pages/PostTask'
import MyTasks from './pages/MyTasks'
import Profile from './pages/Profile'
import { useChronoStore } from './lib/store'

export default function App() {
  const { activeTab, refreshData, initWalletKit, isConnected, setWallet } = useChronoStore()

  // Auto-reconnect Freighter silently on every page load
  useEffect(() => {
    initWalletKit();
    if (!isConnected) {
      const kit = useChronoStore.getState().walletKit;
      if (!kit) return;
      kit.getAddress()
        .then(async ({ address }) => {
          if (address) {
            setWallet(address);
            await refreshData();
          }
        })
        .catch(() => { /* Not yet connected — user must connect manually */ });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Poll on-chain data every 10 seconds
  useEffect(() => {
    refreshData()
    const interval = setInterval(refreshData, 10000)
    return () => clearInterval(interval)
  }, [refreshData])

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
