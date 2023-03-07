import { useEffect } from "react"
import {
  PubSub,
  Event,
  EventPayload,
  EventNames,
  IsAny,
  PublishFunction,
} from "./pub-sub"

export type UseSubscribeFunction<T extends Event> = IsAny<T> extends true
  ? (event: string, callback: (data?: any) => void) => void
  : <
      EventName extends EventNames<T>,
      Payload extends EventPayload<T, EventName>,
    >(
      event: EventName & string,
      callback: (payload: Payload) => void,
    ) => void

export type CreatePubSubReturnType<Events extends Event> = {
  useSubscribe: UseSubscribeFunction<Events>
  publish: PublishFunction<Events>
}

export function createPubSub<
  Events extends Event,
>(): CreatePubSubReturnType<Events> {
  const { subscribe, publish } = new PubSub<Events>()

  const useSubscribe: UseSubscribeFunction<Events> = (
    event: any,
    callback: (payload?: any) => void,
  ): void => {
    useEffect(() => {
      const unsubscribe = subscribe(event, callback)
      return unsubscribe
    }, [])
  }

  return {
    useSubscribe,
    publish,
  }
}
