# @inficen/react-events &middot; [![npm version](https://badge.fury.io/js/@inficen%2Freact-events.svg)](https://badge.fury.io/js/@inficen%2Freact-events)

## Motivation

To provide a maintained, React/Typescript friendly and simple implementation [pub/sub pattern](https://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern) package that is easy to use.

## Installation

```
npm install @inficen/react-events
```

## How to use

### Vanilla JS

Instantiate `PubSub` class and use it like so:

```ts
import { PubSub } from "@inficen/react-events"

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

const { publish, subscribe } = new PubSub<Events>()

// Subscribe to an event by calling subscribe function,
// returning an unsubscribe function that you can call again to unsubscribe/cleanup
const unsubscribe1 = subscribe("event-1", (payload) => {
  console.log("Event 1 fired with", payload)
})

// Publish event-1, any callback subscription should now be called
publish("event-1", "hello world!")

// Clean up
unsubscribe1()
```

### React

This packages provides `createPubSub` factory function that can be used nicely with React. It returns:

- `useSubscribe` hook: Works similar to `subscribe` function but hooked into component lifecycle and clean up subscription for you automatically on component unmount.
- `publish` function: Works exactly like `publish` function of PubSub class

Example:

```tsx
import React, { useState } from "react"
import { createPubSub } from "@inficen/react-events"

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

const { publish, useSubscribe } = createPubSub<Events>()

const Subscriber = () => {
  const [payload, setPayload] = useState("")
  useSubscribe("event-1", (payload) => {
    // Do something
    setPayload(payload)
  })

  return payload ? `Received ${payload}` : null
}

const Publisher = () => {
  return (
    <button onClick={() => publish("event-1", "hello world!")}>
      Trigger event
    </button>
  )
}
```

Note that each `createPubSub` call will create its own scope of events and subscriptions. It's up to you on how to share a scope across your component tree. You can consider using React Context or your statement management library.
