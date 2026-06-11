import React, { createContext, useContext, useState, useEffect } from 'react'
import { getMe } from '../api'

interface AuthContextType {
  isAuthenticated: boolean
  username: string | null
  login: (token: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  username: null,
  login: () => {},
  logout: () => {},
})

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      getMe()
        .then((res) => {
          setIsAuthenticated(true)
          setUsername(res.data.username)
        })
        .catch(() => {
          localStorage.removeItem('token')
        })
    }
  }, [])

  const login = (token: string) => {
    localStorage.setItem('token', token)
    setIsAuthenticated(true)
    getMe().then((res) => setUsername(res.data.username))
  }

  const logout = () => {
    localStorage.removeItem('token')
    setIsAuthenticated(false)
    setUsername(null)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, username, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
