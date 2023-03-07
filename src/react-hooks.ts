import { useEffect } from "react"
import { PubSub, Event, EventPayload, EventNames } from "./pub-sub"

export function createPubSub<Events extends Event>() {
  const { subscribe, publish } = new PubSub<Events>()

  function useSubscribe<
    EventName extends EventNames<Events>,
    Payload extends EventPayload<Events, EventName>,
  >(event: EventName, callback: (payload: Payload) => void) {
    useEffect(() => {
      const unsubscribe = subscribe(event, callback)
      return () => unsubscribe()
    }, [])

    return undefined
  }

  return {
    useSubscribe,
    publish,
  }
}
