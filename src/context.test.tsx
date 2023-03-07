import React from "react"
import { render, screen } from "@testing-library/react"
import user from "@testing-library/user-event"

import {
  PubSubProvider,
  usePubSub,
  usePublish,
  useSubscribe,
  createPubSubContext,
} from "./context"

describe("PubSub Context", () => {
  describe("createPubSubContext", () => {
    it("should return a typed version of useSubscribe, usePubSub and usePublish", () => {
      const customContext = createPubSubContext()

      expect(PubSubProvider).toBe(customContext.PubSubProvider)

      const TestComponent = () => {
        expect(useSubscribe).toBe(customContext.useSubscribe)
        expect(usePublish).toBe(customContext.usePublish)
        expect(usePubSub).toBe(customContext.usePubSub)
        return null
      }

      render(
        <PubSubProvider>
          <TestComponent />
        </PubSubProvider>,
      )
    })
  })
})
