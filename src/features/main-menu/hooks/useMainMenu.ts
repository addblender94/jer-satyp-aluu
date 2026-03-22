import { useState } from 'react'
import { Location } from '../types'

export function useMainMenu() {
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null)
  const [hoveredId, setHoveredId] = useState<number | null>(null)

  const handleLocationClick = (id: number) => {
    setSelectedLocation(id)
  }

  const handleCloseModal = () => {
    setSelectedLocation(null)
  }

  return {
    selectedLocation,
    hoveredId,
    setHoveredId,
    handleLocationClick,
    handleCloseModal,
  }
}
