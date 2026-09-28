import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-blue-600">📝 Review Synthesizer</div>
          <div className="space-x-4">
            <Link href="/pricing" className="text-slate-600 hover:text-slate-900">
              Pricing
            </Link>
            <Link href="/auth/signin" className="bg-blue-600 text-white px-4 py-2 rounded-lg">
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
            Synthesize Your Shopify Reviews with AI
          </h1>
          <p className="text-xl text-slate-600 mb-8">
            Automatically summarize customer reviews using Claude AI and receive summaries on Telegram
          </p>
          <Link
            href="/auth/signin"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg"
          >
            Get Started Free →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg p-8 shadow-sm">
            <div className="text-3xl mb-4">🛍️</div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Shopify Integration</h3>
            <p className="text-slate-600">Automatically fetch all reviews from your Shopify store</p>
          </div>

          <div className="bg-white rounded-lg p-8 shadow-sm">
            <div className="text-3xl mb-4">✨</div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">AI Synthesis</h3>
            <p className="text-slate-600">Claude AI creates concise summaries of every review</p>
          </div>

          <div className="bg-white rounded-lg p-8 shadow-sm">
            <div className="text-3xl mb-4">💬</div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Telegram Alerts</h3>
            <p className="text-slate-600">Get instant summaries delivered to your Telegram</p>
          </div>
        </div>
      </div>
    </main>
  )
}
