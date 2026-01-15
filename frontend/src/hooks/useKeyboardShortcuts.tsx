import { useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

interface KeyboardShortcut {
  key: string
  ctrl?: boolean
  alt?: boolean
  shift?: boolean
  description: string
  action: () => void
}

// Hook for keyboard shortcuts
export const useKeyboardShortcuts = (additionalShortcuts?: KeyboardShortcut[]) => {
  const navigate = useNavigate()

  // Default navigation shortcuts
  const defaultShortcuts: KeyboardShortcut[] = [
    { key: 'h', alt: true, description: 'Go to Home', action: () => navigate('/') },
    { key: 'r', alt: true, description: 'Register Patient', action: () => navigate('/register') },
    { key: 'a', alt: true, description: 'Audio Analysis', action: () => navigate('/audio-analysis') },
    { key: 'x', alt: true, description: 'X-ray Analysis', action: () => navigate('/xray-analysis') },
    { key: 'c', alt: true, description: 'Open Chat', action: () => navigate('/chat') },
    { key: 'p', alt: true, description: 'View Reports', action: () => navigate('/reports') },
  ]

  const allShortcuts = [...defaultShortcuts, ...(additionalShortcuts || [])]

  const showShortcutsHelp = useCallback(() => {
    const shortcutsList = [
      ...allShortcuts.map(s => {
        const keys = []
        if (s.ctrl) keys.push('Ctrl')
        if (s.alt) keys.push('Alt')
        if (s.shift) keys.push('Shift')
        keys.push(s.key.toUpperCase())
        return `${keys.join('+')} - ${s.description}`
      }),
      'Ctrl+/ - Show shortcuts'
    ].join('\n')

    toast.info(
      <div>
        <strong>⌨️ Keyboard Shortcuts</strong>
        <pre style={{ fontSize: '0.85em', marginTop: 8, whiteSpace: 'pre-wrap' }}>
          {shortcutsList}
        </pre>
      </div>,
      {
        autoClose: 8000,
        style: { width: 'auto', maxWidth: 400 }
      }
    )
  }, [allShortcuts])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        (event.target as HTMLElement).isContentEditable
      ) {
        return
      }

      // Check for Ctrl+/ to show shortcuts help
      if ((event.ctrlKey || event.metaKey) && event.key === '/') {
        event.preventDefault()
        showShortcutsHelp()
        return
      }

      for (const shortcut of allShortcuts) {
        const ctrlMatch = shortcut.ctrl ? (event.ctrlKey || event.metaKey) : !event.ctrlKey
        const altMatch = shortcut.alt ? event.altKey : !event.altKey
        const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase()

        if (ctrlMatch && altMatch && shiftMatch && keyMatch) {
          event.preventDefault()
          shortcut.action()
          break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [allShortcuts, showShortcutsHelp])

  return { showShortcutsHelp }
}

export default useKeyboardShortcuts

