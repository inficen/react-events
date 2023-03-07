import React, { createContext, useContext, useRef } from "react"
import { usePubSub } from "./"
import { screen, render } from "@testing-library/react"
import user from "@testing-library/user-event"

describe("Testing usage with react-hooks", () => {
  type Events =
    | {
        name: "event-1"
        payload: string
      }
    | {
        name: "event-2"
        payload: {
          metaData: string
        }
      }

  type ContextType = ReturnType<typeof usePubSub<Events>>

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Context = createContext(null as any as ContextType)

  function ContextProvider({ children }: { children: React.ReactNode }) {
    const payload = useRef(usePubSub<Events>())
    return (
      <Context.Provider value={payload.current}>{children}</Context.Provider>
    )
  }

  it("should be able to subscribe, publish events and clean up subscription", async () => {
    const Publisher = () => {
      const { usePublish } = useContext(Context)
      const publish = usePublish()

      return (
        <button
          onClick={() =>
            publish("event-2", {
              metaData: "test",
            })
          }
        >
          Publish
        </button>
      )
    }

    const mockSubscriber = jest.fn()

    const Subscriber = () => {
      const { useSubscribe } = useContext(Context)
      useSubscribe("event-2", ({ metaData }) => {
        mockSubscriber({ metaData })
      })
      return null
    }

    const { rerender } = render(
      <ContextProvider>
        <Subscriber />
        <Publisher />
      </ContextProvider>,
    )

    await user.click(screen.getByRole("button", { name: "Publish" }))

    expect(mockSubscriber).toHaveBeenCalledTimes(1)
    expect(mockSubscriber).toHaveBeenCalledWith({ metaData: "test" })

    rerender(
      <ContextProvider>
        <Publisher />
      </ContextProvider>,
    )

    await user.click(screen.getByRole("button", { name: "Publish" }))

    // Subscription should be cleaned up and not trigger additional call
    expect(mockSubscriber).toHaveBeenCalledTimes(1)
  })
})
