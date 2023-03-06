import React from "react"
import { PubSubProvider, usePublish, useSubscribe } from "./main"
import { screen, render } from "@testing-library/react"
import user from "@testing-library/user-event"

describe("PubSubContext", () => {
  it("should be able to subscribe and publish events", async () => {
    const Publisher = () => {
      const publish = usePublish()

      return (
        <button onClick={() => publish("blarg", "SOME_DATA")}>Publish</button>
      )
    }

    const mockSubscriber = jest.fn()

    const Subscriber = () => {
      useSubscribe("blarg", mockSubscriber)
      return null
    }

    const { rerender } = render(
      <PubSubProvider>
        <>
          <Subscriber />
          <Publisher />
        </>
      </PubSubProvider>,
    )

    await user.click(screen.getByRole("button", { name: "Publish" }))

    expect(mockSubscriber).toHaveBeenCalledTimes(1)
    expect(mockSubscriber).toHaveBeenCalledWith("SOME_DATA")

    rerender(
      <PubSubProvider>
        <>
          <Publisher />
        </>
      </PubSubProvider>,
    )

    await user.click(screen.getByRole("button", { name: "Publish" }))

    expect(mockSubscriber).toHaveBeenCalledTimes(1)
    expect(mockSubscriber).toHaveBeenCalledWith("SOME_DATA")
  })
})
