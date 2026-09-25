'use client'

import { useEffect, useState } from 'react'

interface Template {
  id: string
  name: string
  message: string
  trigger_score: number
  is_active: boolean
}

const DEFAULT_MESSAGES = [
  "Hey {{username}}! 👋 Just wanted to check in — we'd love to keep you in the loop. Any questions or topics you'd like us to cover?",
  "Hi {{username}}, noticed you've been quiet lately. We're always improving — is there anything we can do better for you?",
  "Hey {{username}}! We miss having you around. Here's what you've been missing lately — let us know if you want to reconnect! 🚀",
]

export default function WinbackSection() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', message: DEFAULT_MESSAGES[0], trigger_score: 30 })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/winback/templates')
      .then(r => r.json())
      .then(d => setTemplates(d.templates ?? []))
      .finally(() => setLoading(false))
  }, [])

  const createTemplate = async () => {
    if (!form.name.trim() || !form.message.trim()) {
      setError('Name and message are required.')
      return
    }
    setSaving(true)
    setError('')
    const res = await fetch('/api/winback/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json() as { template?: Template; error?: string }
    if (data.template) {
      setTemplates(prev => [...prev, data.template!])
      setShowForm(false)
      setForm({ name: '', message: DEFAULT_MESSAGES[0], trigger_score: 30 })
    } else {
      setError(data.error ?? 'Something went wrong.')
    }
    setSaving(false)
  }

  const toggleActive = async (t: Template) => {
    const updated = { ...t, is_active: !t.is_active }
    setTemplates(prev => prev.map(x => x.id === t.id ? updated : x))
    await fetch(`/api/winback/templates/${t.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: updated.is_active }),
    })
  }

  const deleteTemplate = async (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id))
    await fetch(`/api/winback/templates/${id}`, { method: 'DELETE' })
  }

  return (
    <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Win-back DMs</h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Auto-send a DM when a subscriber's health score drops below your trigger.
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          + New template
        </button>
      </div>

      {/* DM scope notice */}
      <div className="bg-amber-900/20 border border-amber-700/30 rounded-xl p-3 flex gap-3 text-sm text-amber-300">
        <span className="text-base">ℹ️</span>
        <span>
          Win-back DMs require X's <strong>dm.write</strong> permission.{' '}
          If you connected before this feature was added,{' '}
          <a href="/api/auth/x" className="underline hover:text-amber-200">
            reconnect your X account
          </a>{' '}
          to grant it.
        </span>
      </div>

      {/* Template list */}
      {loading ? (
        <div className="animate-pulse space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="h-20 bg-slate-800/60 rounded-xl" />
          ))}
        </div>
      ) : templates.length === 0 && !showForm ? (
        <div className="text-center py-10 text-slate-500">
          <p className="text-3xl mb-2">💬</p>
          <p className="text-sm">No templates yet. Create one to start winning back subscribers.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {templates.map(t => (
            <div
              key={t.id}
              className={`border rounded-xl p-4 transition-all ${
                t.is_active
                  ? 'border-indigo-500/30 bg-indigo-950/20'
                  : 'border-slate-700/30 bg-slate-800/20 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-white">{t.name}</span>
                    <span className="text-xs bg-slate-700/60 text-slate-400 px-2 py-0.5 rounded-full">
                      score &lt; {t.trigger_score}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2">{t.message}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {/* Toggle */}
                  <button
                    onClick={() => toggleActive(t)}
                    className={`relative w-10 h-5 rounded-full transition-colors ${
                      t.is_active ? 'bg-indigo-500' : 'bg-slate-700'
                    }`}
                    title={t.is_active ? 'Disable' : 'Enable'}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                        t.is_active ? 'translate-x-5' : ''
                      }`}
                    />
                  </button>
                  {/* Delete */}
                  <button
                    onClick={() => deleteTemplate(t.id)}
                    className="text-slate-600 hover:text-red-400 transition-colors text-lg leading-none"
                    title="Delete"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New template form */}
      {showForm && (
        <div className="border border-slate-600/50 rounded-xl p-5 space-y-4 bg-slate-800/30">
          <h3 className="text-sm font-semibold text-white">New template</h3>

          {error && (
            <p className="text-sm text-red-400 bg-red-900/20 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="space-y-1">
            <label className="text-xs text-slate-400">Template name</label>
            <input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. 30-day re-engagement"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-400">
              Trigger: send when health score drops below
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={10}
                max={60}
                step={5}
                value={form.trigger_score}
                onChange={e => setForm(f => ({ ...f, trigger_score: Number(e.target.value) }))}
                className="flex-1 accent-indigo-500"
              />
              <span className="text-sm font-mono text-indigo-400 w-8">{form.trigger_score}</span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-400">
              Message — use <code className="text-indigo-400">{'{{username}}'}</code> for the subscriber's handle
            </label>
            <textarea
              rows={4}
              value={form.message}
              onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={createTemplate}
              disabled={saving}
              className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {saving ? 'Saving…' : 'Save template'}
            </button>
            <button
              onClick={() => { setShowForm(false); setError('') }}
              className="px-4 py-2 text-slate-400 hover:text-white text-sm rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
