import { useState, useCallback } from 'react'
import { QuickLink } from '../../../main-menu/types'

export const useQuickNavManager = () => {
  const [tempQuickLinks, setTempQuickLinks] = useState<QuickLink[]>([])
  const [committedQuickLinks, setCommittedQuickLinks] = useState<QuickLink[]>([])

  const addQuickLink = useCallback(() => {
    const newId = Date.now()
    const newLink: QuickLink = {
      id: newId,
      label: 'New Button',
      order: tempQuickLinks.length,
    }
    setTempQuickLinks(prev => [...prev, newLink])
  }, [tempQuickLinks])

  const updateQuickLink = useCallback((id: number, config: Partial<QuickLink>) => {
    setTempQuickLinks(prev => prev.map(link => 
      link.id === id ? { ...link, ...config } : link
    ))
  }, [])

  const removeQuickLink = useCallback((id: number) => {
    setTempQuickLinks(prev => prev.filter(link => link.id !== id))
  }, [])

  const reorderQuickLinks = useCallback((startIndex: number, endIndex: number) => {
    setTempQuickLinks(prev => {
      const result = Array.from(prev)
      const [removed] = result.splice(startIndex, 1)
      result.splice(endIndex, 0, removed)
      return result.map((item, index) => ({ ...item, order: index }))
    })
  }, [])

  const setAllQuickLinks = useCallback((links: QuickLink[]) => {
    const sorted = [...links].sort((a, b) => a.order - b.order)
    setTempQuickLinks(sorted)
    setCommittedQuickLinks(sorted)
  }, [])

  return {
    tempQuickLinks,
    committedQuickLinks,
    setTempQuickLinks,
    setCommittedQuickLinks,
    addQuickLink,
    updateQuickLink,
    removeQuickLink,
    reorderQuickLinks,
    setAllQuickLinks
  }
}
