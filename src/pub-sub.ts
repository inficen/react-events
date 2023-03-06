import { v4 as uuidv4 } from "uuid"

type Event = { event: string; data?: unknown } | string

export class PubSub<Events extends Event> {
  eventMap = new Map<string, Map<string, Subscriber>>()

  subscribe = (event: EventNames<Events>, callback: Subscriber) => {
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

  publish: PublishFunction<Events> = (event: string, data?: unknown) => {
    const listeners = this.eventMap.get(event)
    if (listeners) {
      listeners.forEach((callback) => callback(data))
    }
  }
}

type Subscriber = (data: unknown) => void

type PublishFunction<T extends Event> = {
  <EventName extends StringEventNames<T>>(event: EventName): void

  <
    EventName extends PayloadEventNames<T>,
    Payload extends EventData<T, EventName>,
  >(
    event: EventName,
    data: Payload,
  ): void
}

type EventNames<T extends Event> = T extends string
  ? T
  : T extends { event: unknown }
  ? T["event"]
  : never

type StringEventNames<T extends Event> = T extends string
  ? T
  : T extends { event: unknown; data: unknown }
  ? never
  : T extends { event: unknown }
  ? T["event"]
  : never

type PayloadEventNames<T extends Event> = Exclude<
  EventNames<T>,
  StringEventNames<T>
>

type GetEventHelper<T extends Event, U extends EventNames<T>> = T extends {
  event: U
  data: any
}
  ? T
  : never

type GetEvent<T extends Event, U extends EventNames<T>> = [
  GetEventHelper<T, U>,
] extends [never]
  ? U
  : GetEventHelper<T, U>

type EventData<T extends Event, U extends EventNames<T>> = GetEvent<
  T,
  U
> extends { event: U; data: infer R }
  ? R
  : never

type MyEvents =
  | {
      event: "foo"
      data: string
    }
  | {
      event: "bar"
      data: number
    }
  | {
      event: "page-load"
      data: {
        timestamp: number
        url: string
      }
    }
  | {
      event: "error"
      data: {
        event: string
        message: string
      }
    }
  | "string-event"
  | { event: "event-with-no-data" }

const pubsub = new PubSub<MyEvents>()

pubsub.publish("foo", "hello")
// @ts-expect-error
pubsub.publish("foo", 5)
// @ts-expect-error
pubsub.publish("foo", true)
// @ts-expect-error
pubsub.publish("bar", "hello")
pubsub.publish("bar", 5)
// @ts-expect-error
pubsub.publish("bar", true)
pubsub.publish("page-load", { timestamp: 123, url: "asldkfj" })
pubsub.publish("string-event")
pubsub.publish("event-with-no-data")
// @ts-expect-error
pubsub.publish("event-with-no-data", {})
