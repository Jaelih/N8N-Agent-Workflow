import { useState } from 'react'
import { Wifi, Shield, PhoneCall, Tag, Award, Users, BookOpen, PanelLeftClose, Timer, MapPin } from 'lucide-react'
import ChatContainer from './components/ChatContainer'
import pldtLogo from '../img/PLDT-Logo.png'

// Detect desktop (≥1024px) for initial sidebar state
const isDesktop = () => typeof window !== 'undefined' && window.innerWidth >= 1024

const BENEFITS = [
  { stat: '10M+',   desc: 'Customers nationwide' },
  { stat: '99.9%',  desc: 'Network uptime guaranteed' },
  { stat: '24/7',   desc: 'AI support, always on' },
  { stat: '<30s',   desc: 'Average AI response time' },
]

function App() {
  // Desktop (≥1024px): sidebar open by default. Mobile: closed.
  const [sidebarOpen, setSidebarOpen] = useState(() => isDesktop())

  return (
    <div className="h-screen bg-white flex overflow-hidden">

      {/* ══ Mobile/Tablet backdrop — tap outside to close ═══════ */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ══ Sidebar ══════════════════════════════════════════════
          Mobile (<lg) : fixed overlay drawer, slides from left
          Desktop (lg+): relative flex column, collapses to w-0
      ════════════════════════════════════════════════════════════ */}
      <aside
        className={`
          fixed lg:relative inset-y-0 left-0 z-30
          flex flex-col flex-shrink-0 h-screen
          bg-white border-r border-gray-100 overflow-y-auto
          transition-all duration-300 ease-in-out
          w-[85vw] max-w-[360px]
          ${sidebarOpen
            ? 'translate-x-0 lg:w-[35%] lg:max-w-[400px]'
            : '-translate-x-full lg:translate-x-0 lg:w-0 lg:overflow-hidden lg:border-r-0'}
        `}
      >
        {/* ── Brand / greeting ─────────────────────────────────── */}
        <div className="px-6 pt-6 pb-5 border-b border-gray-100">
          <div className="flex items-center justify-between mb-5">
            <img src={pldtLogo} alt="PLDT" className="h-9 object-contain" />
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
              title="Close sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-2 mb-3.5">
            <Award className="w-4 h-4 text-amber-500" />
            <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">
              Philippines' #1 Fiber Provider
            </span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 leading-tight mb-1.5">
            We're here to help you.
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            Chat with Stelle for instant support, or explore our latest plans and offers below.
          </p>
        </div>

        {/* ── FAQ / Help Center link ───────────────────────────── */}
        <div className="px-6 py-5 border-b border-gray-100">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
            Quick Help
          </p>
          <a
            href="https://pldthome.com/support"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 w-full p-4 rounded-xl
              border-2 border-gray-200 bg-white
              hover:border-pldt-red hover:bg-red-50
              active:scale-[0.98] transition-all duration-150 group shadow-sm"
          >
            <BookOpen className="w-4 h-4 text-gray-400 group-hover:text-pldt-red flex-shrink-0 transition-colors" />
            <span className="text-sm font-bold text-gray-700 group-hover:text-pldt-red transition-colors">
              Browse FAQ & Help Center
            </span>
            <span className="ml-auto text-gray-400 group-hover:text-pldt-red text-sm transition-colors">→</span>
          </a>
        </div>

        {/* ── Fiber advertisement card ──────────────────────────── */}
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="rounded-2xl bg-gradient-to-br from-[#C8002A] to-[#780018] p-5 text-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                  <Wifi className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/70">
                  Now Available
                </span>
              </div>
              <span className="bg-amber-400 text-amber-900 text-[10px] font-extrabold
                px-2.5 py-1 rounded-full uppercase tracking-wide shadow-sm">
                Most Popular
              </span>
            </div>
            <h3 className="font-extrabold text-[17px] leading-snug mb-2">
              Stream, Work & Game<br />Without Limits
            </h3>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-white/50 text-xs line-through">₱1,699/mo</span>
              <span className="text-white font-extrabold text-xl">₱1,299</span>
              <span className="text-white/70 text-xs">/mo</span>
            </div>
            <div className="flex items-center gap-1.5 mb-3.5">
              <Users className="w-3.5 h-3.5 text-white/60" />
              <span className="text-white/70 text-[11px]">Trusted by 1M+ Filipino households</span>
            </div>
            <div className="flex items-center gap-1.5 mb-3.5">
              <MapPin className="w-3.5 h-3.5 text-white/60 flex-shrink-0" />
              <span className="text-white/70 text-[11px]">Limited slots available in your area</span>
            </div>
            <a
              href="https://pldthome.com/fiber?gad_source=1&gad_campaignid=15787909598&gbraid=0AAAAADqA8v53qpMiF8BSjoE63mtOq5-EE"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-white text-[#C8002A] text-sm font-extrabold
                py-3 rounded-xl hover:bg-gray-50 active:scale-[0.98]
                transition-all text-center shadow-md hover:shadow-lg"
            >
              Claim Your Fiber Plan →
            </a>
          </div>
        </div>

        {/* ── Promos card ──────────────────────────────────────── */}
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="rounded-2xl border-2 border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Tag className="w-4 h-4 text-pldt-red" />
                </div>
                <span className="text-sm font-bold text-gray-900">Exclusive Promos</span>
              </div>
              <span className="bg-green-100 text-green-700 text-[10px] font-bold
                px-2.5 py-1 rounded-full uppercase tracking-wide">
                New
              </span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed mb-2">
              Don't miss out — special rates, bundles, and limited-time offers
              for new <strong className="text-gray-700">and</strong> existing subscribers.
            </p>
            <div className="flex items-center gap-1.5 mb-4">
              <Timer className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
              <span className="text-[11px] text-amber-600 font-semibold">Some offers end soon</span>
            </div>
            <a
              href="https://pldthome.com/promos"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full border-2 border-pldt-red
                text-pldt-red text-xs font-bold py-3 rounded-xl
                hover:bg-red-50 active:scale-[0.98] transition-all text-center shadow-sm"
            >
              Browse All Promos →
            </a>
          </div>
        </div>

        {/* ── Trust metrics ─────────────────────────────────────── */}
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-3.5">
            <Shield className="w-3.5 h-3.5 text-pldt-red" />
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              Why PLDT?
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {BENEFITS.map(({ stat, desc }) => (
              <div key={stat} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <p className="text-base font-extrabold text-pldt-red leading-none">{stat}</p>
                <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Hotline ──────────────────────────────────────────── */}
        <div className="px-6 py-5 mt-auto">
          <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-gray-50 border border-gray-100">
            <PhoneCall className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <p className="text-xs text-gray-500">
              Still need help? Call{' '}
              <strong className="text-gray-800 font-bold">171</strong> — PLDT Hotline
            </p>
          </div>
        </div>
      </aside>

      {/* ══ Main: Chat ═══════════════════════════════════════════ */}
      <main className="flex-1 flex flex-col h-screen bg-gray-50 overflow-hidden min-w-0">
        <ChatContainer
          onMenuClick={() => setSidebarOpen(true)}
          sidebarOpen={sidebarOpen}
        />
      </main>
    </div>
  )
}

export default App
