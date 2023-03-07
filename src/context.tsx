import React, { useEffect, createContext, useContext, useRef } from "react"
import {
  PubSub,
  Event,
  EventPayload,
  EventNames,
  IsAny,
  PublishFunction,
} from "./pub-sub"

export type PubSubContextValue<T extends Event = any> = {
  publish: PubSub<T>["publish"]
  subscribe: PubSub<T>["subscribe"]
}

const PubSubContext = createContext(null as unknown as PubSubContextValue)

export type PubSubProviderProps = {
  children: React.ReactElement
}

export const PubSubProvider = ({ children }: PubSubProviderProps) => {
  const pubsubRef = useRef(new PubSub())
  const { publish, subscribe } = pubsubRef.current

  return (
    <PubSubContext.Provider value={{ publish, subscribe }}>
      {children}
    </PubSubContext.Provider>
  )
}

type UseSubscribeFunction<T extends Event> = IsAny<T> extends true
  ? (event: string, callback: (data?: any) => void) => void
  : <
      EventName extends EventNames<T>,
      Payload extends EventPayload<T, EventName>,
    >(
      event: EventName & string,
      callback: (payload: Payload) => void,
    ) => void

export const useSubscribe = (
  event: string,
  callback: (payload?: any) => void,
): void => {
  const { subscribe } = usePubSub()
  useEffect(() => subscribe(event, callback), [])
}

export const usePublish = <T extends Event>(): PublishFunction<T> =>
  usePubSub().publish

export const usePubSub = <T extends Event>() =>
  useContext(PubSubContext) as PubSubContextValue<T>

export function createPubSubContext<Events extends Event>() {
  return {
    PubSubProvider,
    usePubSub: <T extends Event>() => usePubSub<T>(),
    useSubscribe: useSubscribe as UseSubscribeFunction<Events>,
    usePublish: usePublish as PublishFunction<Events>,
  }
}
