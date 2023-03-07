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

  it("can supply event types", () => {
    type Events =
      | {
          name: "payload-event"
          payload: {
            metaData: string
          }
        }
      | {
          name: "optional-payload"
          payload?: {
            metaData: string
          }
        }
      | {
          name: "object-string-event"
        }
      | "string-event"

    const { publish, subscribe } = new PubSub<Events>()

    function assertNever(val: never) {
      return
    }

    publish("payload-event", { metaData: "test" })
    // @ts-expect-error payload event without payload
    publish("payload-event")
    // @ts-expect-error payload event with incorrect type
    publish("payload-event", { bla: "asdfk" })
    publish("optional-payload", { metaData: "test" })
    publish("optional-payload")
    // @ts-expect-error optional payload event with incorrect type
    publish("optional-payload", 5)
    publish("object-string-event")
    // @ts-expect-error object-string-event with payload
    publish("object-string-event", 5)
    publish("string-event")
    // @ts-expect-error string-event with payload
    publish("string-event", 5)

    subscribe("string-event", (_) => {
      assertNever(_)
    })
    subscribe("object-string-event", (_) => {
      assertNever(_)
    })
    subscribe("payload-event", ({ metaData }) => {
      return
    })
    // can ignore payload arg
    subscribe("payload-event", () => {
      return
    })

    // @ts-expect-error cannot destructure optional object argumetn
    subscribe("optional-payload", ({ metaData }) => {
      return
    })

    // can destrure after proving existence
    subscribe("optional-payload", (data) => {
      if (data) {
        const { metaData } = data
      }
    })
  })

  it("works without event types", () => {
    const { publish, subscribe } = new PubSub<any>()

    function assertNever(val: never) {
      return
    }

    publish("payload-event", { metaData: "test" })
    publish("payload-event")
    publish("payload-event", { bla: "asdfk" })
    publish("optional-payload", { metaData: "test" })
    publish("optional-payload")
    publish("optional-payload", 5)
    publish("object-string-event")
    publish("object-string-event", 5)
    publish("string-event")
    publish("string-event", 5)

    subscribe("string-event", (_) => {
      return
    })
    subscribe("object-string-event", (_) => {
      return
    })
    subscribe("payload-event", ({ metaData }) => {
      return
    })
    // can ignore payload arg
    subscribe("payload-event", () => {
      return
    })

    subscribe("optional-payload", ({ metaData }) => {
      return
    })

    // can destrure after proving existence
    subscribe("optional-payload", (data) => {
      return
    })
  })
})
