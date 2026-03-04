import { useEffect, useRef } from 'react'
import { useNotificationStore } from '../../store/notificationStore'
import type { AppCampaignEvent } from '../../types/app/event'
import { Button, Badge } from '../ui'

const AUTO_DISMISS_MS = 10_000

function getEventMeta(type: AppCampaignEvent['type']): {
  label: string
  badgeClass: string
  accentClass: string
} {
  switch (type) {
    case 'spell_cast':
      return { label: 'Varázslat', badgeClass: 'bg-violet-700 text-violet-100', accentClass: 'border-violet-500' }
    case 'save_required':
      return { label: 'Mentődobás', badgeClass: 'bg-red-700 text-red-100', accentClass: 'border-red-500' }
    case 'dc_set':
      return { label: 'Célszám', badgeClass: 'bg-amber-700 text-amber-100', accentClass: 'border-amber-500' }
    case 'condition_applied':
      return { label: 'Állapot', badgeClass: 'bg-green-800 text-green-100', accentClass: 'border-green-600' }
  }
}

function EventBody({ event }: { event: AppCampaignEvent }) {
  switch (event.type) {
    case 'spell_cast':
      return (
        <div className="text-center">
          <p className="text-3xl font-black text-white mb-1">{event.payload.spellName}</p>
          <p className="text-violet-300 text-lg font-semibold">
            {event.payload.savingThrow} Mentődobás DC {event.payload.dc}
          </p>
          <p className="mt-4 text-text-secondary text-sm">
            Dobj d20-szal, a sikerhez{' '}
            <span className="text-accent font-bold">{event.payload.dc}+</span> kell
          </p>
        </div>
      )
    case 'save_required':
      return (
        <div className="text-center">
          <p className="text-3xl font-black text-white mb-1">{event.payload.ability} Mentődobás</p>
          <p className="text-red-300 text-lg font-semibold">DC {event.payload.dc}</p>
          {event.payload.context && (
            <p className="text-text-muted text-sm mt-1">{event.payload.context}</p>
          )}
          <p className="mt-4 text-text-secondary text-sm">
            Dobj d20-szal, a sikerhez{' '}
            <span className="text-red-400 font-bold">{event.payload.dc}+</span> kell
          </p>
        </div>
      )
    case 'dc_set':
      return (
        <div className="text-center">
          <p className="text-text-secondary text-sm mb-2">DM célszám beállítva</p>
          <p className="text-6xl font-black text-accent">DC {event.payload.dc}</p>
          {event.payload.reason && (
            <p className="text-text-muted text-sm mt-2">{event.payload.reason}</p>
          )}
        </div>
      )
    case 'condition_applied':
      return (
        <div className="text-center">
          <p className="text-3xl font-black text-white mb-1">{event.payload.conditionName}</p>
          <p className="text-green-300 text-sm">{event.payload.targetName} állapota aktív</p>
        </div>
      )
  }
}

export function NotificationModal() {
  const queue = useNotificationStore(s => s.queue)
  const dismiss = useNotificationStore(s => s.dismiss)

  const current = queue[0]
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (!current) return

    timerRef.current = setTimeout(() => {
      dismiss(current.id)
    }, AUTO_DISMISS_MS)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [current?.id, dismiss])

  if (!current) return null

  const meta = getEventMeta(current.event.type)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/60">
      <div className={`relative w-full max-w-sm bg-surface-overlay border-2 ${meta.accentClass} rounded-card shadow-2xl p-8`}>
        {/* Badge */}
        <div className="flex justify-center mb-6">
          <Badge className={meta.badgeClass}>{meta.label}</Badge>
        </div>

        {/* Tartalom */}
        <EventBody event={current.event} />

        {/* Sor jelző */}
        {queue.length > 1 && (
          <p className="text-center text-text-disabled text-xs mt-4">
            +{queue.length - 1} további értesítés
          </p>
        )}

        {/* Bezárás */}
        <Button variant="neutral" fullWidth className="mt-6" onClick={() => dismiss(current.id)}>
          Rendben
        </Button>

        {/* Auto-dismiss progress sáv */}
        <div className="absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl overflow-hidden">
          <div
            className="h-full bg-accent origin-left"
            style={{ animation: `shrink ${AUTO_DISMISS_MS}ms linear forwards` }}
          />
        </div>
      </div>

      <style>{`
        @keyframes shrink {
          from { transform: scaleX(1); }
          to { transform: scaleX(0); }
        }
      `}</style>
    </div>
  )
}
