'use client'

import { useState } from 'react'
import { EditProfileModal } from './EditProfileModal'

export function ProfileButton({ currentName }: { currentName: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="hidden sm:flex items-center gap-2 hover:bg-gray-800 p-1.5 rounded-xl transition-colors cursor-pointer"
        title="Edit Profile"
      >
        <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-sm font-medium text-emerald-400 border border-gray-700">
          {currentName.charAt(0).toUpperCase()}
        </div>
        <span className="text-sm font-medium text-gray-300">{currentName}</span>
      </button>

      <EditProfileModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        currentName={currentName} 
      />
    </>
  )
}
