import { create } from 'zustand'

export type TaskStatus = 'Open' | 'Claimed' | 'Submitted' | 'Completed' | 'Cancelled' | 'Disputed'

export interface Task {
  id: number
  requester: string
  provider: string
  title: string
  description: string
  category: string
  hours: number
  deadline: number
  status: TaskStatus
  created_at: number
  completed_at: number
}

export interface MemberProfile {
  member: string
  hours_given: number
  hours_taken: number
  tasks_given: number
  tasks_taken: number
  community_score: number
  standing: string
  joined_at: number
  last_active: number
}

interface Toast { id: string; type: 'success' | 'error' | 'info'; message: string }

interface ChronoStore {
  pubKey: string; secretKey: string; isConnected: boolean
  setWallet: (pub: string, sec: string) => void
  disconnect: () => void
  timeBalance: number
  setTimeBalance: (n: number) => void
  tasks: Task[]
  setTasks: (t: Task[]) => void
  upsertTask: (t: Task) => void
  profile: MemberProfile | null
  setProfile: (p: MemberProfile | null) => void
  activeTab: 'board' | 'post' | 'mytasks' | 'profile'
  setTab: (t: 'board' | 'post' | 'mytasks' | 'profile') => void
  toasts: Toast[]
  addToast: (type: Toast['type'], message: string) => void
  removeToast: (id: string) => void
}

export const useChronoStore = create<ChronoStore>((set, get) => ({
  pubKey: '', secretKey: '', isConnected: false,
  setWallet: (pub, sec) => set({ pubKey: pub, secretKey: sec, isConnected: true }),
  disconnect: () => set({ pubKey: '', secretKey: '', isConnected: false, profile: null, timeBalance: 0, tasks: [] }),

  timeBalance: 0,
  setTimeBalance: (n) => set({ timeBalance: n }),

  tasks: [],
  setTasks: (t) => set({ tasks: t }),
  upsertTask: (t) => set(s => {
    const idx = s.tasks.findIndex(x => x.id === t.id)
    if (idx >= 0) { const a = [...s.tasks]; a[idx] = t; return { tasks: a } }
    return { tasks: [t, ...s.tasks] }
  }),

  profile: null,
  setProfile: (p) => set({ profile: p }),

  activeTab: 'board',
  setTab: (t) => set({ activeTab: t }),

  toasts: [],
  addToast: (type, message) => {
    const id = Math.random().toString(36).slice(2)
    set(s => ({ toasts: [...s.toasts, { id, type, message }] }))
    setTimeout(() => get().removeToast(id), 4500)
  },
  removeToast: (id) => set(s => ({ toasts: s.toasts.filter(n => n.id !== id) })),
}))
