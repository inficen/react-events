import React from "react"
import { createPubSub } from "."
import { render } from "@testing-library/react"

describe("Testing usage with react-hooks", () => {
  it("should be able to subscribe, publish events and clean up subscription", () => {
    type Events =
      | {
          name: "event-1"
          payload: {
            metaData: string
          }
        }
      | {
          name: "event-2"
        }
      | "string-event"

    const { publish, useSubscribe } = createPubSub<Events>()

    const mockSubscriber = jest.fn()

    const Subscriber = () => {
      useSubscribe("event-1", (data) => {
        mockSubscriber(data)
      })
      return null
    }

    const { rerender } = render(<Subscriber />)

    publish("event-1", {
      metaData: "test",
    })

    expect(mockSubscriber).toHaveBeenCalledTimes(1)
    expect(mockSubscriber).toHaveBeenCalledWith({ metaData: "test" })

    publish("event-2")

    expect(mockSubscriber).toHaveBeenCalledTimes(1)

    publish("string-event")

    expect(mockSubscriber).toHaveBeenCalledTimes(1)

    publish("event-1", {
      metaData: "second test",
    })

    expect(mockSubscriber).toHaveBeenCalledTimes(2)
    expect(mockSubscriber).toHaveBeenCalledWith({ metaData: "second test" })

    rerender(<></>)

    publish("event-1", {
      metaData: "test",
    })

    // Subscription should be cleaned up and not trigger additional call
    expect(mockSubscriber).toHaveBeenCalledTimes(2)
  })
})
