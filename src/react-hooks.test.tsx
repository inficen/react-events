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
          name: "optional-payload"
          payload?: {
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

    publish("optional-payload", {
      metaData: "test",
    })

    publish("optional-payload")

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

    const { publish, useSubscribe } = createPubSub<Events>()
    // const { publish, useSubscribe } = createPubSub<any>()

    function assertNever(val: never) {
      return
    }

    const Subscriber = () => {
      useSubscribe("string-event", (_) => {
        assertNever(_)
      })
      useSubscribe("object-string-event", (_) => {
        assertNever(_)
      })
      useSubscribe("payload-event", ({ metaData }) => {
        return
      })
      // can ignore payload arg
      useSubscribe("payload-event", () => {
        return
      })

      // @ts-expect-error cannot destructure optional object argumetn
      useSubscribe("optional-payload", ({ metaData }) => {
        return
      })

      // can destrure after proving existence
      useSubscribe("optional-payload", (data) => {
        if (data) {
          const { metaData } = data
        }
      })
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
  })

  it("works without event types", () => {
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

    const { publish, useSubscribe } = createPubSub<any>()

    function assertNever(val: never) {
      return
    }

    const Subscriber = () => {
      useSubscribe("string-event", (_) => {
        assertNever(_)
      })
      useSubscribe("object-string-event", (_) => {
        assertNever(_)
      })
      useSubscribe("payload-event", ({ metaData }) => {
        return
      })
      // can ignore payload arg
      useSubscribe("payload-event", () => {
        return
      })

      useSubscribe("optional-payload", ({ metaData }) => {
        return
      })

      // can destrure after proving existence
      useSubscribe("optional-payload", (data) => {
        if (data) {
          const { metaData } = data
        }
      })
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
  })
})
