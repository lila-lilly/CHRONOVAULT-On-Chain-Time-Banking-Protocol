import { useState, useEffect } from 'react'
import { Loader2, Copy, ExternalLink, TrendingUp, Clock, CheckCircle } from 'lucide-react'
import { useChronoStore } from '../lib/store'
import StandingBadge from '../components/StandingBadge'
import ClockFace from '../components/ClockFace'
import { MOCK_PROFILES } from '../lib/mockData'
import { STANDING_META } from '../lib/constants'
import { timeBankClient, signAndSubmit } from '../lib/contract'

export default function Profile() {
  const { isConnected, pubKey, setWallet, disconnect, setProfile, setTimeBalance, timeBalance, profile, addToast, initWalletKit } = useChronoStore()
  const [loading, setLoading] = useState(false)

  const handleConnect = async () => {
    setLoading(true)
    try {
      initWalletKit();
      const kit = useChronoStore.getState().walletKit;
      if (!kit) throw new Error("Wallet kit not initialized");

      await kit.openModal({
        onWalletSelected: async (option) => {
          kit.setWallet(option.id);
          const { address } = await kit.getAddress();
          setWallet(address);

          // Fetch real on-chain balance and data
          await useChronoStore.getState().refreshData();
          addToast('success', 'Wallet connected!')
        }
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      addToast('error', `Failed to connect wallet: ${msg}`)
    } finally {
      setLoading(false)
    }
  }

  // Auto-reconnect: try to get address from Freighter on page load
  useEffect(() => {
    if (isConnected) return;
    initWalletKit();
    const kit = useChronoStore.getState().walletKit;
    if (!kit) return;
    kit.getAddress()
      .then(async ({ address }) => {
        if (address) {
          setWallet(address);
          await useChronoStore.getState().refreshData();
        }
      })
      .catch(() => { /* Not connected, ignore */ });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const copy = (s: string) => { navigator.clipboard.writeText(s); addToast('info', 'Copied to clipboard') }

  if (!isConnected) {
    return (
      <div className="max-w-md mx-auto px-4 sm:px-6 pb-20 pt-8">
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-5">
            <ClockFace size={90} />
          </div>
          <h1 className="font-display text-3xl text-silver mb-2">Connect Wallet</h1>
          <p className="text-sm text-muted">Enter your Stellar secret key or generate a testnet keypair to join ChronoVault.</p>
        </div>

        <div className="vault-card p-6 space-y-4" style={{ borderColor: 'rgba(212,168,67,0.15)' }}>
          <div className="text-xs text-muted bg-black/20 rounded-md p-3 border border-white/[0.05]">
            Please install the <a href="https://www.freighter.app/" target="_blank" rel="noreferrer" className="text-blue-lt hover:underline">Freighter</a> browser extension and switch to Testnet before connecting.
          </div>
          <button onClick={handleConnect} disabled={loading} className="btn-gold w-full flex items-center justify-center gap-2 py-3">
            {loading ? <><Loader2 size={14} className="animate-spin" />Connecting…</> : 'Connect Freighter Wallet'}
          </button>
        </div>
      </div>
    )
  }

  const standing      = profile?.standing || 'Seedling'
  const meta          = STANDING_META[standing]
  const score         = profile?.community_score || 0
  const standingOrder = ['Seedling','Grower','Contributor','Steward','Pillar','Elder']
  const currentIdx    = standingOrder.indexOf(standing)
  const nextStanding  = standingOrder[currentIdx + 1]
  const nextMeta      = nextStanding ? STANDING_META[nextStanding] : null
  const progress      = nextMeta
    ? Math.min(((score - meta.min) / (nextMeta.min - meta.min)) * 100, 100)
    : 100

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 pb-20 pt-8 space-y-5">

      {/* Wallet card */}
      <div className="vault-card p-5" style={{ borderColor: 'rgba(212,168,67,0.12)' }}>
        <div className="label mb-3">Connected Wallet</div>
        <div className="flex items-center justify-between gap-3">
          <div className="font-mono text-xs text-silver break-all flex-1">{pubKey}</div>
          <div className="flex gap-2 shrink-0">
            <button onClick={() => copy(pubKey)} className="btn-ghost py-1.5 px-2"><Copy size={12} /></button>
            <a href={`https://stellar.expert/explorer/testnet/account/${pubKey}`} target="_blank" rel="noopener noreferrer" className="btn-ghost py-1.5 px-2">
              <ExternalLink size={12} />
            </a>
          </div>
        </div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/[0.05]">
          <div className="flex items-center gap-2 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-lt animate-pulse" />
            <span className="font-clock text-muted">Testnet · Active</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={async () => {
                setLoading(true)
                try {
                  const hash = await signAndSubmit(async () => await timeBankClient.mint({ admin: pubKey, recipient: pubKey, amount: BigInt(100) }, { publicKey: pubKey }))
                  addToast('success', 'Minted 100 TIME!', `https://stellar.expert/explorer/testnet/tx/${hash}`)
                  useChronoStore.getState().refreshData()
                } catch (e: unknown) {
                  const msg = e instanceof Error ? e.message : 'Unknown error';
                  addToast('error', `Mint failed (Are you admin?): ${msg}`)
                } finally {
                  setLoading(false)
                }
              }}
              disabled={loading}
              className="btn-ghost py-1 text-[10px] px-3"
            >
              Faucet (Admin Only)
            </button>
            <div className="flex items-center gap-2">
              <Clock size={12} className="text-gold" />
              <span className="time-display text-xl font-bold text-gold-gradient">{timeBalance}</span>
              <span className="font-clock text-xs text-muted uppercase">TIME</span>
            </div>
          </div>
        </div>
      </div>

      {/* Community standing */}
      {profile && (
        <div className="vault-card p-6">
          <div className="label mb-5">Community Standing</div>
          <div className="flex items-center gap-5 mb-6">
            <div
              className="clock-ring w-20 h-20 shrink-0 flex flex-col items-center justify-center"
              style={{ background: `${meta.color}10` }}
            >
              <span className="font-mono text-2xl" style={{ color: meta.color }}>{meta.glyph}</span>
            </div>
            <div className="space-y-2">
              <StandingBadge standing={standing} size="lg" />
              <p className="text-xs text-muted">{meta.desc}</p>
              <div className="font-clock text-xs text-blue-lt">{score} community points</div>
            </div>
          </div>

          {/* Progress to next */}
          {nextMeta && (
            <div className="mb-5">
              <div className="flex justify-between text-[10px] font-clock text-muted mb-1.5">
                <span>{meta.label}</span>
                <span>{nextMeta.label} ({nextMeta.min} pts)</span>
              </div>
              <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${meta.color}, ${nextMeta.color})` }}
                />
              </div>
            </div>
          )}

          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: CheckCircle, label: 'Tasks Given',  value: profile.tasks_given,  color: '#34D399' },
              { icon: Clock,       label: 'Hours Given',  value: `${profile.hours_given}h`, color: '#D4A843' },
              { icon: TrendingUp,  label: 'Tasks Taken',  value: profile.tasks_taken,  color: '#3B82F6' },
              { icon: Clock,       label: 'Hours Taken',  value: `${profile.hours_taken}h`, color: '#60A5FA' },
            ].map(s => {
              const Icon = s.icon
              return (
                <div key={s.label} className="vault-card p-3 text-center">
                  <Icon size={12} className="mx-auto mb-1" style={{ color: s.color }} />
                  <div className="time-display text-lg font-bold text-silver">{s.value}</div>
                  <div className="label">{s.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Scoring breakdown */}
      <div className="vault-card p-5">
        <div className="label mb-3">How Community Score is Computed</div>
        <div className="space-y-1.5 text-xs text-muted font-mono">
          <div className="flex gap-3"><span className="text-gold w-28">+80 per hour</span><span>given to community</span></div>
          <div className="flex gap-3"><span className="text-blue-lt w-28">+20 per task</span><span>completed as provider</span></div>
          <div className="flex gap-3"><span className="text-ruby w-28">−15 per hour</span><span>taken from community</span></div>
          <div className="flex gap-3"><span className="text-cyan w-28">+10 per hr</span><span>give surplus bonus (max +200)</span></div>
          <div className="flex gap-3"><span className="text-ruby w-28">−8 per hr</span><span>take surplus penalty (max −80)</span></div>
        </div>
      </div>

      <button onClick={disconnect} className="btn-ghost w-full border-ruby/20 text-ruby hover:border-ruby/40">
        Disconnect Wallet
      </button>
    </div>
  )
}
