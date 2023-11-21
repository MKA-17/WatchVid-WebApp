import React from 'react'
import { useHelmetHook } from '../../custom/useHelmetHook'

export default function UnAuthorizedPage() {
  const helmetTitle = useHelmetHook("404")

  return (
    <h1>404</h1>
  )
}
