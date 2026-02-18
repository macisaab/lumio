import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useChildren } from '../contexts/ChildContext'
import { supabase } from '../lib/supabase'
import { getColorConfig } from '../lib/colors'

interface ChildStats {
  childId: string
  totalStories: number
  completedStories: number
  totalStickers: number
  thisWeek: number
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { children: childProfiles } = useChildren()
  const [stats, setStats] = useState<ChildStats[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)
      const childStats: ChildStats[] = []

      for (const child of childProfiles) {
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)

        const [storiesRes, completedRes, prizesRes, weekRes] =
          await Promise.all([
            supabase
              .from('stories')
              .select('*', { count: 'exact', head: true })
              .eq('child_id', child.id),
            supabase
              .from('stories')
              .select('*', { count: 'exact', head: true })
              .eq('child_id', child.id)
              .not('completed_at', 'is', null),
            supabase
              .from('prizes')
              .select('*', { count: 'exact', head: true })
              .eq('child_id', child.id),
            supabase
              .from('stories')
              .select('*', { count: 'exact', head: true })
              .eq('child_id', child.id)
              .gte('created_at', weekAgo.toISOString()),
          ])

        childStats.push({
          childId: child.id,
          totalStories: storiesRes.count || 0,
          completedStories: completedRes.count || 0,
          totalStickers: prizesRes.count || 0,
          thisWeek: weekRes.count || 0,
        })
      }

      setStats(childStats)
      setLoading(false)
    }

    if (childProfiles.length > 0) {
      fetchStats()
    } else {
      setLoading(false)
    }
  }, [childProfiles])

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-800">Parent Dashboard</h1>
        <p className="text-sm text-gray-500">{user?.email}</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-8 h-8 border-3 border-uppi-primary/30 border-t-uppi-primary rounded-full animate-spin" />
        </div>
      ) : childProfiles.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No child profiles yet</p>
          <Link
            to="/children/new"
            className="px-6 py-3 bg-uppi-primary text-white font-semibold rounded-xl hover:bg-purple-700 transition-colors"
          >
            Add your child
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {childProfiles.map((child) => {
            const childStat = stats.find((s) => s.childId === child.id)
            const color = getColorConfig(child.favorite_color)

            return (
              <div
                key={child.id}
                className="bg-white rounded-2xl p-5 shadow-sm border border-purple-100"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: color.hex }}
                  >
                    {child.name[0]}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {child.name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      Age {child.age} • Loves {child.favorite_color.toLowerCase()}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div
                    className="text-center p-3 rounded-xl"
                    style={{ backgroundColor: color.bg }}
                  >
                    <div className="text-2xl font-bold text-gray-800">
                      {childStat?.completedStories || 0}
                    </div>
                    <div className="text-xs text-gray-500">Stories</div>
                  </div>
                  <div
                    className="text-center p-3 rounded-xl"
                    style={{ backgroundColor: color.bg }}
                  >
                    <div className="text-2xl font-bold text-gray-800">
                      {childStat?.totalStickers || 0}
                    </div>
                    <div className="text-xs text-gray-500">Stickers</div>
                  </div>
                  <div
                    className="text-center p-3 rounded-xl"
                    style={{ backgroundColor: color.bg }}
                  >
                    <div className="text-2xl font-bold text-gray-800">
                      {childStat?.thisWeek || 0}
                    </div>
                    <div className="text-xs text-gray-500">This week</div>
                  </div>
                </div>

                {child.interests.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {child.interests.map((interest) => (
                      <span
                        key={interest}
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: color.pastel,
                          color: color.hex,
                        }}
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-gray-800">Settings</h2>
        <div className="bg-white rounded-2xl divide-y divide-purple-50">
          <Link
            to="/children/new"
            className="flex items-center justify-between p-4 hover:bg-purple-50/50 transition-colors rounded-t-2xl"
          >
            <span className="text-gray-700">Add child profile</span>
            <span className="text-gray-400">›</span>
          </Link>
          <Link
            to="/settings"
            className="flex items-center justify-between p-4 hover:bg-purple-50/50 transition-colors rounded-b-2xl"
          >
            <span className="text-gray-700">Account settings</span>
            <span className="text-gray-400">›</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
