// app/dashboard/page.tsx
'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface ShopStore {
  id: string
  shopName: string
  isActive: boolean
  createdAt: string
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const [stores, setStores] = useState<ShopStore[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/auth/signin')
    }
  }, [status])

  useEffect(() => {
    if (session?.user?.id) {
      fetchStores()
    }
  }, [session])

  async function fetchStores() {
    try {
      const res = await fetch('/api/shops')
      const data = await res.json()
      setStores(data)
    } catch (error) {
      console.error('Error fetching stores:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-600 mt-2">Welcome back, {session?.user?.name}</p>
          </div>
          <Link
            href="/dashboard/shops/new"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition"
          >
            Add Shopify Store
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <StatCard label="Connected Stores" value={stores.length} />
          <StatCard label="Active Integrations" value={stores.filter(s => s.isActive).length} />
          <StatCard label="Subscription" value="Pro" />
        </div>

        {/* Stores Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {stores.map(store => (
            <StoreCard key={store.id} store={store} onRefresh={fetchStores} />
          ))}
        </div>

        {stores.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
            <p className="text-slate-600 mb-4">No Shopify stores connected yet</p>
            <Link
              href="/dashboard/shops/new"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Connect your first store →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
      <p className="text-slate-600 text-sm font-medium">{label}</p>
      <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
    </div>
  )
}

function StoreCard({ store, onRefresh }: { store: ShopStore; onRefresh: () => void }) {
  const [syncing, setSyncing] = useState(false)

  async function handleSync() {
    setSyncing(true)
    try {
      const res = await fetch(`/api/shops/${store.id}/sync-reviews`, {
        method: 'POST',
      })
      const data = await res.json()
      alert(`Synced ${data.stats.syncedCount} reviews`)
      onRefresh()
    } catch (error) {
      alert('Sync failed')
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm hover:shadow-md transition">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">{store.shopName}</h3>
          <p className="text-slate-600 text-sm mt-1">
            Added {new Date(store.createdAt).toLocaleDateString()}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          store.isActive
            ? 'bg-green-100 text-green-700'
            : 'bg-slate-100 text-slate-700'
        }`}>
          {store.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleSync}
          disabled={syncing}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white px-4 py-2 rounded-lg font-medium transition"
        >
          {syncing ? 'Syncing...' : 'Sync Reviews'}
        </button>
        <Link
          href={`/dashboard/shops/${store.id}`}
          className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-900 px-4 py-2 rounded-lg font-medium text-center transition"
        >
          Settings
        </Link>
      </div>
    </div>
  )
}

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  )
}
