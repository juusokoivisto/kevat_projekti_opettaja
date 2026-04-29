import * as React from 'react'
import type { AuthUser } from '../api/types/api.types'

export const UserContext = React.createContext<{
  user: AuthUser | null
  setUser: (u: AuthUser | null) => void
}>({
  user: null,
  setUser: () => { },
})