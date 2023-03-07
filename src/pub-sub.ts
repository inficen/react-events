import { v4 as uuidv4 } from "uuid"

export type Event = { name: string; payload?: unknown } | string

export class PubSub<Events extends Event> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  eventMap = new Map<string, Map<string, (payload: any) => void>>()

  subscribe: SubscribeFunction<Events> = (
    event: string,
    callback: (payload?: any) => void,
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

export type IsAny<T> = 0 extends T & 1 ? true : false

export type SubscribeFunction<T extends Event> = IsAny<T> extends true
  ? (event: string, callback: (data?: any) => void) => () => void
  : <
      EventName extends EventNames<T>,
      Payload extends EventPayload<T, EventName>,
    >(
      event: EventName & string,
      callback: (payload: Payload) => void,
    ) => () => void

export type PublishFunction<T extends Event> = IsAny<T> extends true
  ? (name: string, payload?: any) => void
  : {
      <EventName extends StringEventNames<T>>(event: EventName): void

      <
        EventName extends OptionalPayloadEventNames<T>,
        Payload extends EventPayload<T, EventName>,
      >(
        name: EventName,
        payload?: Payload,
      ): void

      <
        EventName extends PayloadEventNames<T>,
        Payload extends EventPayload<T, EventName>,
      >(
        name: EventName,
        payload: Payload,
      ): void
    }

export type EventNames<T extends Event> =
  | PayloadEventNames<T>
  | OptionalPayloadEventNames<T>
  | StringEventNames<T>

type StringEventNames<T extends Event> = T extends string
  ? T
  : Required<T> extends { name: unknown; payload: unknown }
  ? never
  : T extends { name: unknown }
  ? T["name"]
  : never

export type PayloadEventNames<T extends Event> = T extends {
  name: infer R
  payload: unknown
}
  ? R
  : never

type OptionalPayloadEventNames<T extends Event> = T extends {
  name: infer R
  payload?: infer P
}
  ? unknown extends P
    ? never // string object
    : T extends {
        name: infer R
        payload: unknown
      }
    ? never // payload object
    : R // optional payload
  : never // string

type GetEventHelper<T extends Event, U extends EventNames<T>> = T extends {
  name: U
  payload?: unknown
}
  ? T
  : never

type GetEvent<T extends Event, U extends EventNames<T>> = [
  GetEventHelper<T, U>,
] extends [never]
  ? U
  : GetEventHelper<T, U>

export type EventPayload<
  T extends Event,
  U extends EventNames<T>,
> = U extends StringEventNames<T>
  ? never
  : GetEvent<T, U> extends { name: U; payload?: infer R }
  ? U extends OptionalPayloadEventNames<T>
    ? R | undefined
    : R
  : never
