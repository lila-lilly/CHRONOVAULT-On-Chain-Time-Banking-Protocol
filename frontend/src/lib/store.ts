import { create } from 'zustand'
import {
  StellarWalletsKit,
  WalletNetwork,
  allowAllModules,
  FREIGHTER_ID,
} from '@creit.tech/stellar-wallets-kit'
import { timeBankClient } from './contract'

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

interface Toast { id: string; type: 'success' | 'error' | 'info'; message: string; link?: string }

interface ChronoStore {
  pubKey: string;
  isConnected: boolean;
  walletKit: StellarWalletsKit | null;
  initWalletKit: () => void;
  setWallet: (pub: string) => void;
  disconnect: () => void;
  timeBalance: number;
  setTimeBalance: (n: number) => void;
  tasks: Task[];
  setTasks: (t: Task[]) => void;
  upsertTask: (t: Task) => void;
  profile: MemberProfile | null;
  setProfile: (p: MemberProfile | null) => void;
  activeTab: 'board' | 'post' | 'mytasks' | 'profile';
  setTab: (t: 'board' | 'post' | 'mytasks' | 'profile') => void;
  toasts: Toast[];
  addToast: (type: Toast['type'], message: string, link?: string) => void;
  removeToast: (id: string) => void;
  refreshData: () => Promise<void>;
}

export const useChronoStore = create<ChronoStore>((set, get) => ({
  pubKey: '',
  isConnected: false,
  walletKit: null,

  initWalletKit: () => {
    if (get().walletKit) return;
    const kit = new StellarWalletsKit({
      network: WalletNetwork.TESTNET,
      selectedWalletId: FREIGHTER_ID,
      modules: allowAllModules(),
    });
    set({ walletKit: kit });
  },

  setWallet: (pub) => set({ pubKey: pub, isConnected: true }),

  disconnect: () => set({ pubKey: '', isConnected: false, profile: null, timeBalance: 0, tasks: [] }),

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
  addToast: (type, message, link) => {
    const id = Math.random().toString(36).slice(2)
    set(s => ({ toasts: [...s.toasts, { id, type, message, link }] }))
    setTimeout(() => get().removeToast(id), 4500)
  },
  removeToast: (id: string) => set(s => ({ toasts: s.toasts.filter(n => n.id !== id) })),
  refreshData: async () => {
    try {
      const { pubKey, isConnected } = get();
      if (isConnected && pubKey) {
        // Fetch balance
        try {
          const balTx = await timeBankClient.get_balance({ user: pubKey });
          set({ timeBalance: Number(balTx.result) });
        } catch (e) { console.error("Balance error", e) }
      }

      // Fetch tasks (unauthenticated read)
      const totalTx = await timeBankClient.get_total_tasks();
      const total = Number(totalTx.result);
      
      const fetchedTasks = [];
      for (let i = 1; i <= total; i++) {
        try {
          const tx = await timeBankClient.get_task({ task_id: BigInt(i) });
          const result = tx.result;
          if (result) {
            const statusMap = ["Open", "Claimed", "Submitted", "Completed", "Cancelled", "Disputed"];
            fetchedTasks.push({
              id: Number(i),
              requester: result.requester,
              provider: result.provider,
              title: result.title,
              description: result.description,
              category: result.category,
              hours: Number(result.hours),
              deadline: Number(result.deadline),
              status: statusMap[result.status.tag] as any,
              created_at: Number(result.created_at),
              completed_at: Number(result.completed_at),
            });
          }
        } catch (err) {
          console.error(`Failed to fetch task ${i}`, err);
        }
      }
      set({ tasks: fetchedTasks.sort((a, b) => b.created_at - a.created_at) });
    } catch (e) {
      console.error("Failed to fetch data", e);
    }
  }
}))
