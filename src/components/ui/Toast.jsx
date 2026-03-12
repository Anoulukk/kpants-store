import { Check } from 'lucide-react'

export default function Toast({ message, visible }) {
  return (
    <div
      className={`fixed left-1/2 z-[9999] flex items-center gap-2 rounded-full bg-brand-900 px-6 py-3 text-sm text-white shadow-2xl whitespace-nowrap transition-all duration-300 ${
        visible ? 'bottom-6 opacity-100' : '-bottom-16 opacity-0'
      }`}
      style={{ transform: 'translateX(-50%)' }}
    >
      <Check size={16} />
      {message}
    </div>
  )
}
