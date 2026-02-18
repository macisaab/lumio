import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../../lib/supabase'
import { useChildren } from '../../contexts/ChildContext'
import type { Prize, Milestone } from '../../types'
import { getColorConfig } from '../../lib/colors'

const MILESTONE_THRESHOLDS = [
  { count: 5, label: '5 Stories', badge: '🌟' },
  { count: 10, label: '10 Stories', badge: '🏆' },
  { count: 25, label: '25 Stories', badge: '👑' },
  { count: 50, label: '50 Stories', badge: '💎' },
]

export default function StickerBook() {
  const { activeChild } = useChildren()
  const [prizes, setPrizes] = useState<Prize[]>([])
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!activeChild) return

    const fetchPrizes = async () => {
      setLoading(true)
      const [prizesRes, milestonesRes] = await Promise.all([
        supabase
          .from('prizes')
          .select('*')
          .eq('child_id', activeChild.id)
          .order('earned_at', { ascending: false }),
        supabase
          .from('milestones')
          .select('*')
          .eq('child_id', activeChild.id),
      ])

      if (prizesRes.data) setPrizes(prizesRes.data)
      if (milestonesRes.data) setMilestones(milestonesRes.data)
      setLoading(false)
    }

    fetchPrizes()
  }, [activeChild])

  if (!activeChild) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        Select a child to view their sticker book
      </div>
    )
  }

  const color = getColorConfig(activeChild.favorite_color)
  const totalSlots = Math.max(prizes.length, 12)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-3 border-uppi-primary/30 border-t-uppi-primary rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-1">
          {activeChild.name}'s Sticker Book
        </h2>
        <p className="text-sm text-gray-500">
          {prizes.length} sticker{prizes.length !== 1 ? 's' : ''} collected
        </p>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {MILESTONE_THRESHOLDS.map((m) => {
          const earned = milestones.some(
            (ms) => ms.milestone_type === `${m.count}_stories`
          )
          return (
            <div
              key={m.count}
              className={`flex-shrink-0 flex flex-col items-center gap-1 p-3 rounded-xl border-2 ${
                earned
                  ? 'border-uppi-primary bg-uppi-shimmer'
                  : 'border-gray-200 bg-gray-50 opacity-50'
              }`}
            >
              <span className="text-2xl">{earned ? m.badge : '🔒'}</span>
              <span className="text-xs font-medium text-gray-600">
                {m.label}
              </span>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {Array.from({ length: totalSlots }).map((_, i) => {
          const prize = prizes[i]
          return (
            <motion.div
              key={i}
              initial={prize ? { scale: 0 } : {}}
              animate={prize ? { scale: 1 } : {}}
              transition={{ delay: i * 0.05 }}
              className={`aspect-square rounded-2xl flex flex-col items-center justify-center ${
                prize
                  ? 'bg-white shadow-sm'
                  : 'bg-gray-100 border-2 border-dashed border-gray-200'
              }`}
              style={
                prize
                  ? { borderColor: color.hex, borderWidth: '2px' }
                  : undefined
              }
            >
              {prize ? (
                <>
                  <span className="text-4xl">{prize.sticker_emoji}</span>
                  <span className="text-xs text-gray-500 mt-1 px-1 truncate max-w-full">
                    {prize.sticker_type}
                  </span>
                </>
              ) : (
                <span className="text-2xl text-gray-300">?</span>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
