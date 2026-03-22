import React from 'react'
import { motion } from 'framer-motion'
import { useEditor } from '../../visual-editor'

interface MissionModalProps {
  locationName: string
  onClose: () => void
}

export const MissionModal: React.FC<MissionModalProps> = ({ locationName, onClose }) => {
  const { isMobileView } = useEditor()
  
  return (
    <div
      style={{
        position: isMobileView ? 'absolute' : 'fixed',
        top: 0,
        left: 0,
        width: isMobileView ? '100%' : '100vw',
        height: isMobileView ? '100%' : '100vh',
        background: 'rgba(0,0,0,0.95)',
        backdropFilter: 'blur(30px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: isMobileView ? '1rem' : '2rem',
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        style={{
          background: 'rgba(15,23,42,0.9)',
          border: '1px solid rgba(212,175,55,0.3)',
          padding: isMobileView ? '2rem' : '4rem',
          borderRadius: isMobileView ? '2rem' : '4rem',
          maxWidth: isMobileView ? '90%' : '32rem',
          width: '100%',
          textAlign: 'center',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          style={{
            fontSize: '3rem',
            fontWeight: 900,
            color: 'white',
            marginBottom: '1.5rem',
            textTransform: 'uppercase',
            fontStyle: 'italic',
            letterSpacing: '-0.05em',
            lineHeight: 1,
          }}
        >
          {locationName}
        </h2>
        <div
          style={{
            width: '4rem',
            height: '4px',
            background: 'rgba(212,175,55,0.5)',
            margin: '0 auto 2rem',
            borderRadius: '9999px',
          }}
        />
        <button
          style={{
            width: '100%',
            padding: '1.5rem',
            background: 'rgb(212,175,55)',
            color: 'white',
            fontWeight: 900,
            borderRadius: '1.5rem',
            border: 'none',
            cursor: 'pointer',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            fontSize: '0.875rem',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'white'
            e.currentTarget.style.color = 'black'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'rgb(212,175,55)'
            e.currentTarget.style.color = 'white'
          }}
          onClick={onClose}
        >
          Continue Mission
        </button>
      </motion.div>
    </div>
  )
}
