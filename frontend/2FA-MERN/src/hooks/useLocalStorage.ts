/* eslint-disable no-console */
import { useState, useEffect } from 'react'

export const useLocalStorage = <T>(keyName: string, defaultValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const value = window.localStorage.getItem(keyName)

      if (value === null) {
        window.localStorage.setItem(keyName, JSON.stringify(defaultValue))
        return defaultValue
      }

      try {
        const parsed = JSON.parse(value)
        return parsed
      } catch {
        return value as unknown as T
      }
    } catch (err) {
      console.log('Error reading from localStorage:', err)
      return defaultValue
    }
  })

  // Sync state across tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === keyName && e.newValue !== null) {
        try {
          try {
            const parsed = JSON.parse(e.newValue)
            setStoredValue(parsed)
          } catch {
            setStoredValue(e.newValue as unknown as T)
          }
        } catch (err) {
          console.log('Error syncing localStorage:', err)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [keyName])

  const setValue = (newValue: T | ((val: T) => T)) => {
    try {
      const valueToStore =
        newValue instanceof Function ? newValue(storedValue) : newValue

      setStoredValue(valueToStore)
      window.localStorage.setItem(keyName, JSON.stringify(valueToStore))
    } catch (err) {
      console.log('Error writing to localStorage:', err)
    }
  }

  return [storedValue, setValue] as const
}
