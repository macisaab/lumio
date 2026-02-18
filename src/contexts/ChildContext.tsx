import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'
import type { Child } from '../types'

interface ChildContextType {
  children: Child[]
  activeChild: Child | null
  setActiveChild: (child: Child) => void
  loading: boolean
  addChild: (
    child: Omit<Child, 'id' | 'user_id' | 'created_at'>
  ) => Promise<Child>
  updateChild: (id: string, updates: Partial<Child>) => Promise<void>
  deleteChild: (id: string) => Promise<void>
  refreshChildren: () => Promise<void>
}

const ChildContext = createContext<ChildContextType | undefined>(undefined)

export function ChildProvider({ children: reactChildren }: { children: ReactNode }) {
  const { user } = useAuth()
  const [children, setChildren] = useState<Child[]>([])
  const [activeChild, setActiveChild] = useState<Child | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshChildren = useCallback(async () => {
    if (!user) {
      setChildren([])
      setActiveChild(null)
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('children')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching children:', error)
      setLoading(false)
      return
    }

    setChildren(data || [])
    if (data && data.length > 0 && !activeChild) {
      setActiveChild(data[0])
    }
    setLoading(false)
  }, [user, activeChild])

  useEffect(() => {
    refreshChildren()
  }, [refreshChildren])

  const addChild = async (
    childData: Omit<Child, 'id' | 'user_id' | 'created_at'>
  ): Promise<Child> => {
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('children')
      .insert({
        ...childData,
        user_id: user.id,
      })
      .select()
      .single()

    if (error) throw error
    await refreshChildren()
    if (data) setActiveChild(data)
    return data
  }

  const updateChild = async (id: string, updates: Partial<Child>) => {
    const { error } = await supabase
      .from('children')
      .update(updates)
      .eq('id', id)

    if (error) throw error
    await refreshChildren()
  }

  const deleteChild = async (id: string) => {
    const { error } = await supabase.from('children').delete().eq('id', id)

    if (error) throw error
    if (activeChild?.id === id) {
      setActiveChild(null)
    }
    await refreshChildren()
  }

  return (
    <ChildContext.Provider
      value={{
        children,
        activeChild,
        setActiveChild,
        loading,
        addChild,
        updateChild,
        deleteChild,
        refreshChildren,
      }}
    >
      {reactChildren}
    </ChildContext.Provider>
  )
}

export function useChildren() {
  const context = useContext(ChildContext)
  if (context === undefined) {
    throw new Error('useChildren must be used within a ChildProvider')
  }
  return context
}
