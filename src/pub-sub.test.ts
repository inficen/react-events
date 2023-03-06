import { PubSub } from "./pub-sub"

describe("PubSub", () => {
  it("should emit events that can be subscribe too", () => {
    type Event =
      | {
          event: "blarg"
          data: string
        }
      | {
          event: "foo"
          data: string
        }

    const pubsub = new PubSub<Event>()

    const mockSubscriber1 = jest.fn()

    const eventMap = pubsub.eventMap

    // Event map starts empty
    expect(eventMap.size).toBe(0)

    // Subscribing adds a listener to the event map
    const unsub1 = pubsub.subscribe("blarg", mockSubscriber1)

    expect(eventMap.size).toBe(1)
    expect(eventMap.get("blarg")?.size).toBe(1)

    // Publishing an event calls the listeners
    pubsub.publish("blarg", "SOME_DATA")

    expect(mockSubscriber1).toHaveBeenCalledTimes(1)
    expect(mockSubscriber1).toHaveBeenCalledWith("SOME_DATA")

    // Can subscribe a second listeners to the same event
    const mockSubscriber2 = jest.fn()
    const unsub2 = pubsub.subscribe("blarg", mockSubscriber2)

    pubsub.publish("blarg", "OTHER_DATA")

    expect(mockSubscriber2).toHaveBeenCalledTimes(1)
    expect(mockSubscriber2).toHaveBeenCalledWith("OTHER_DATA")
    expect(mockSubscriber1).toHaveBeenCalledTimes(2)
    expect(mockSubscriber1).toHaveBeenCalledWith("OTHER_DATA")

    // Publishing a different event doesn't call the listeners
    pubsub.publish("foo", "OTHER_DATA")

    expect(mockSubscriber1).toHaveBeenCalledTimes(2)
    expect(mockSubscriber2).toHaveBeenCalledTimes(1)

    unsub1()

    expect(eventMap.size).toBe(1)
    expect(eventMap.get("blarg")?.size).toBe(1)

    pubsub.publish("blarg", "MORE_DATA")

    expect(mockSubscriber1).toHaveBeenCalledTimes(2)
    expect(mockSubscriber2).toHaveBeenCalledTimes(2)

    unsub2()
    expect(eventMap.size).toBe(0)

    pubsub.publish("blarg", "MORE_DATA")

    expect(mockSubscriber1).toHaveBeenCalledTimes(2)
    expect(mockSubscriber2).toHaveBeenCalledTimes(2)
  })
})
