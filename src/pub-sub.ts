import { v4 as uuidv4 } from "uuid"

export type Event = { name: string; payload?: unknown } | string

export class PubSub<Events extends Event> {
  eventMap = new Map<string, Map<string, Subscriber>>()

  subscribe = <
    EventName extends PayloadEventNames<Events>,
    Payload extends EventPayload<Events, EventName>,
  >(
    event: EventName,
    callback: (payload: Payload) => void,
  ) => {
    if (!this.eventMap.has(event)) {
      this.eventMap.set(event, new Map())
    }

    const listenersMap = this.eventMap.get(event)

    const listenerId = uuidv4()

    listenersMap?.set(listenerId, callback)

    return () => {
      listenersMap?.delete(listenerId)
      if (listenersMap?.size === 0) {
        this.eventMap.delete(event)
      }
    }
  }

  publish: PublishFunction<Events> = (name: string, payload?: unknown) => {
    const listeners = this.eventMap.get(name)
    if (listeners) {
      listeners.forEach((callback) => callback(payload))
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Subscriber = (payload: any) => void

type PublishFunction<T extends Event> = {
  <EventName extends StringEventNames<T>>(event: EventName): void
  <
    EventName extends PayloadEventNames<T>,
    Payload extends EventPayload<T, EventName>,
  >(
    name: EventName,
    payload: Payload,
  ): void
}

export type EventNames<T extends Event> = T extends string
  ? T
  : T extends { name: unknown }
  ? T["name"]
  : never

type StringEventNames<T extends Event> = T extends string
  ? T
  : T extends { name: unknown; payload: unknown }
  ? never
  : T extends { name: unknown }
  ? T["name"]
  : never

export type PayloadEventNames<T extends Event> = Exclude<
  EventNames<T>,
  StringEventNames<T>
>

type GetEventHelper<T extends Event, U extends EventNames<T>> = T extends {
  name: U
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any
}
  ? T
  : never

type GetEvent<T extends Event, U extends EventNames<T>> = [
  GetEventHelper<T, U>,
] extends [never]
  ? U
  : GetEventHelper<T, U>

export type EventPayload<T extends Event, U extends EventNames<T>> = GetEvent<
  T,
  U
> extends { name: U; payload: infer R }
  ? R
  : never
