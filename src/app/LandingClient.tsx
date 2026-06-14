'use client'

import Link from 'next/link'

export function LandingClient() {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col font-sans overflow-x-hidden">
      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">Spreetail</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
              Log in
            </Link>
            <Link href="/register" className="px-5 py-2.5 bg-white hover:bg-gray-100 text-gray-900 text-sm font-bold rounded-full transition-colors shadow-lg">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
          {/* Ambient Background */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute top-[20%] left-[50%] -translate-x-[50%] w-[800px] h-[500px] bg-emerald-500/20 rounded-full blur-[120px] opacity-50 animate-pulse" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold mb-8 animate-fade-in-up">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Spreetail is now in public beta
            </div>
            <h1 className="text-5xl lg:text-7xl font-extrabold text-white tracking-tight mb-8 leading-tight animate-fade-in-up animation-delay-100">
              The smartest way to split <br className="hidden lg:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                shared expenses
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-12 animate-fade-in-up animation-delay-200">
              Track balances, split bills evenly or by percentages, and settle up with your flatmates. No more spreadsheet headaches.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up animation-delay-300">
              <Link href="/register" className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-white text-lg font-bold rounded-full transition-colors shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 group">
                Start splitting
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <Link href="/login" className="w-full sm:w-auto px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white text-lg font-bold rounded-full transition-colors flex items-center justify-center border border-gray-700 hover:border-gray-600">
                Sign in
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-gray-900 border-y border-gray-800 relative z-10">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Everything you need to stay fair</h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">Built for modern flatmates who want to spend less time doing math and more time living.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Feature 1 */}
              <div className="bg-gray-950 border border-gray-800 rounded-2xl p-8 hover:border-emerald-500/50 transition-colors group">
                <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center mb-6 group-hover:bg-emerald-500/10 transition-colors">
                  <span className="text-2xl">💸</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Any Split Type</h3>
                <p className="text-gray-400 leading-relaxed">Split equally, by exact amounts, percentages, or shares. Spreetail handles the complex math automatically.</p>
              </div>

              {/* Feature 2 */}
              <div className="bg-gray-950 border border-gray-800 rounded-2xl p-8 hover:border-emerald-500/50 transition-colors group">
                <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center mb-6 group-hover:bg-emerald-500/10 transition-colors">
                  <span className="text-2xl">💱</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Multi-Currency</h3>
                <p className="text-gray-400 leading-relaxed">Traveled abroad? Log expenses in USD, EUR, or any currency and we convert it to a base currency for fair settling.</p>
              </div>

              {/* Feature 3 */}
              <div className="bg-gray-950 border border-gray-800 rounded-2xl p-8 hover:border-emerald-500/50 transition-colors group">
                <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center mb-6 group-hover:bg-emerald-500/10 transition-colors">
                  <span className="text-2xl">🤖</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Debt Simplifier</h3>
                <p className="text-gray-400 leading-relaxed">Our smart algorithm minimizes the total number of transactions needed to settle everyone's balances.</p>
              </div>

              {/* Feature 4 */}
              <div className="bg-gray-950 border border-gray-800 rounded-2xl p-8 hover:border-emerald-500/50 transition-colors group">
                <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center mb-6 group-hover:bg-emerald-500/10 transition-colors">
                  <span className="text-2xl">💬</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Real-time Chat</h3>
                <p className="text-gray-400 leading-relaxed">Discuss specific expenses with built-in real-time chat powered by Supabase. No more WhatsApp confusion.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-emerald-900/20" />
          <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
            <h2 className="text-4xl font-bold text-white mb-6">Ready to ditch the spreadsheet?</h2>
            <p className="text-xl text-emerald-100/70 mb-10">Join thousands of flatmates keeping their finances transparent and fair.</p>
            <Link href="/register" className="inline-flex items-center justify-center px-8 py-4 bg-white text-emerald-900 hover:bg-gray-100 text-lg font-bold rounded-full transition-colors shadow-xl">
              Create your free account
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-gray-950 border-t border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <div className="w-6 h-6 rounded bg-emerald-500 flex items-center justify-center opacity-80">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75" />
              </svg>
            </div>
            <span className="text-gray-400 font-semibold tracking-tight">Spreetail</span>
          </div>
          <p className="text-gray-500 text-sm">© {new Date().getFullYear()} Spreetail Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
