import React, { useContext, createContext, useEffect, useRef } from "react"
import { v4 as uuidv4 } from "uuid"
import { PubSub } from "./pub-sub"

export type ContextType = {
  publish: (event: string, data?: any) => void
  subscribe: (event: string, callback: (data: any) => void) => () => void
}

const Context = createContext(null as any as ContextType)

export const usePubSubContext = () => useContext(Context)

export const useSubscribe = (event: string, callback: (data: any) => void) => {
  const { subscribe } = usePubSubContext()

  useEffect(() => {
    const unregister = subscribe(event, callback)
    return () => unregister()
  }, [])

  return
}

export const usePublish = () => usePubSubContext().publish

type ReactEventsProvider = {
  children: React.ReactElement
}

export const PubSubProvider = ({ children }: ReactEventsProvider) => {
  const pubSubRef = useRef(new PubSub())

  return (
    <Context.Provider
      value={{
        subscribe: pubSubRef.current.subscribe,
        publish: pubSubRef.current.publish,
      }}
    >
      {children}
    </Context.Provider>
  )
}
