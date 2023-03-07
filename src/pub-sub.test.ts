/* eslint-disable @typescript-eslint/ban-ts-comment */
import { PubSub } from "./pub-sub"

describe("PubSub", () => {
  it("should emit events that can be subscribe too", () => {
    type Event =
      | {
          name: "event-1"
          payload: string
        }
      | {
          name: "event-2"
          payload: string
        }

    const pubsub = new PubSub<Event>()

    const mockSubscriber1 = jest.fn()

    const eventMap = pubsub.eventMap

    // Event map starts empty
    expect(eventMap.size).toBe(0)

    // Subscribing adds a listener to the event map
    const unsub1 = pubsub.subscribe("event-1", mockSubscriber1)

    expect(eventMap.size).toBe(1)
    expect(eventMap.get("event-1")?.size).toBe(1)

    // Publishing an event calls the listeners
    pubsub.publish("event-1", "SOME_DATA")

    expect(mockSubscriber1).toHaveBeenCalledTimes(1)
    expect(mockSubscriber1).toHaveBeenCalledWith("SOME_DATA")

    // Can subscribe a second listeners to the same event
    const mockSubscriber2 = jest.fn()
    const unsub2 = pubsub.subscribe("event-1", mockSubscriber2)

    pubsub.publish("event-1", "OTHER_DATA")

    expect(mockSubscriber2).toHaveBeenCalledTimes(1)
    expect(mockSubscriber2).toHaveBeenCalledWith("OTHER_DATA")
    expect(mockSubscriber1).toHaveBeenCalledTimes(2)
    expect(mockSubscriber1).toHaveBeenCalledWith("OTHER_DATA")

    // Publishing a different event doesn't call the listeners
    pubsub.publish("event-2", "OTHER_DATA")

    expect(mockSubscriber1).toHaveBeenCalledTimes(2)
    expect(mockSubscriber2).toHaveBeenCalledTimes(1)

    unsub1()

    expect(eventMap.size).toBe(1)
    expect(eventMap.get("event-1")?.size).toBe(1)

    pubsub.publish("event-1", "MORE_DATA")

    expect(mockSubscriber1).toHaveBeenCalledTimes(2)
    expect(mockSubscriber2).toHaveBeenCalledTimes(2)

    unsub2()
    expect(eventMap.size).toBe(0)

    pubsub.publish("event-1", "MORE_DATA")

    expect(mockSubscriber1).toHaveBeenCalledTimes(2)
    expect(mockSubscriber2).toHaveBeenCalledTimes(2)
  })

  it("should typecheck correctly", () => {
    type MyEvents =
      | {
          name: "event-2"
          payload: string
        }
      | {
          name: "bar"
          payload: number
        }
      | {
          name: "page-load"
          payload: {
            timestamp: number
            url: string
          }
        }
      | {
          name: "error"
          payload: {
            name: string
            message: string
          }
        }
      | "string-event"
      | { name: "event-with-no-data" }

    const pubsub = new PubSub<MyEvents>()

    function assertNever(_: never) {
      return undefined
    }

    pubsub.subscribe("bar", (_: number) => undefined)
    // @ts-expect-error
    pubsub.subscribe("bar", (_: string) => undefined)
    pubsub.subscribe("page-load", ({ timestamp, url }) => undefined)
    // @ts-expect-error
    pubsub.subscribe("page-load", (_: string) => undefined)
    pubsub.subscribe("string-event", (_) => {
      assertNever(_)
    })

    pubsub.subscribe("page-load", (_) => {
      // @ts-expect-error
      assertNever(_)
    })

    pubsub.publish("event-2", "hello")
    // @ts-expect-error
    pubsub.publish("event-2", 5)
    // @ts-expect-error
    pubsub.publish("event-2", true)
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
  })
})
