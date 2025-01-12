# React Wrapper Library for Ditto

[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
![example workflow](https://github.com/getditto/react-ditto/actions/workflows/ci.yml/badge.svg)

This is a React wrapper library for [Ditto](https://www.ditto.live).

Currently, this project works in a web browser environment. This project will soon have support for [NodeJS](https://nodejs.org/en/), and [Electron](https://www.electronjs.org/) and React Native environments. If you're interested in React Native please send us an email at [contact@ditto.live](contact@ditto.live)

## Installation

1. Install this library with npm or yarn:

```
npm install @dittolive/ditto @dittolive/react-ditto
```

or with yarn

```
yarn add @dittolive/ditto @dittolive/react-ditto
```

2. At the top level of your react app, wrap it with any of the context providers provided: `DittoProvider` or `DittoLazyProvider`, like so:

```tsx
<DittoProvider setup={createDittoInstance}>
  {({ loading, error }) => {
    if (loading) return <span>Loading Ditto...</span>;
    if (error)
      return (
        <span>There was an error loading Ditto. Error: {error.toString()}</span>
      );
    return <App />;
  }}
</DittoProvider>
```

At this point you're ready to build your Ditto app using all of the helper hooks provided by the library. If you want to learn more, read the following sections to learn how to choose between `DittoProvider` and `DittoLazyProvider`, how to create Ditto identities, and how to use the hooks provided by this library.

## Choosing a Provider

The Ditto React library includes two different context providers which you can use in order to initialize the Ditto context for your app: `DittoProvider` and `DittoLazyProvider`.

`DittoProvider` should be used when the set of Ditto instances that will be used by your app are known beforehand. This is by far the simplest use case where an app uses a single or a few Ditto instances well known beforehand, that can be initialized statically when the app is bootstrapped. In all other cases, the `DittoLazyProvider` can be used to lazily create Ditto instances, such that instances will only be created if a child of the Ditto provider requires them and the instance doesn't exist inside of the provider.

The API for both providers is very similar and only differs for the `setup` prop, which returns `Ditto | Ditto[]` for `DittoProvider` and `Promise<Ditto | null>` for `DittoLazyProvider`.

It is important to highlight that choosing one provider or the other has no effect on the remaining hooks provided by the library. All hooks can be used in the same way, regardless of the type of provider that you choose to configure inside your app.

### DittoProvider Example

```tsx
const createDittoInstance = () => {
  return new Ditto(createIdentity(), "some-path")
}

<DittoProvider setup={createDittoInstance}>
  {({ loading, error }) => {
    if (loading) return <span>Loading Ditto...</span>;
    if (error)
      return (
        <span>There was an error loading Ditto. Error: {error.toString()}</span>
      );
    return <App />;
  }}
</DittoProvider>
```

### DittoLazyProvider Example

```tsx
const createDittoInstance = async (path) => {
  let identity
  if (path === 'path-1') {
    identity = await getIdentityForPath1()
  } else if (path === 'path-1') {
    identity = await getIdentityForPath1()
  }
  
  if (identity) {
    return new Ditto(createIdentity(), path)
  } else {
    return Promise.resolve(null)
  }
}

<DittoLazyProvider setup={createDittoInstance}>
  {({ loading, error }) => {
    if (loading) return <span>Loading Ditto...</span>;
    if (error)
      return (
        <span>There was an error loading Ditto. Error: {error.toString()}</span>
      );
    return <App />;
  }}
</DittoLazyProvider>
```

## Creating Identities

Ditto instances are created by providing an `Identity` object to the Ditto constructor. Identities can be of several different types,
and can be created manually as JS objects, or using the identity hooks (`useOfflinePlaygroundIdentity`, `useOnlineIdentity`), which also makes it easier to configure authentication for your
apps:

```ts
const { create } = useOfflinePlaygroundIdentity()

const createDittoInstance = (forPath: string) => {
  // Example of how to create an offline playground instance
  const dittoPlaygroundIdentity = new Ditto(
    create({
      // If you're using the Ditto cloud this ID should be the app ID shown on your app settings page, on the portal.
      appName: 'my-app',
      siteID: 123,
    }),
    forPath,
  )
  return dittoPlaygroundIdentity
}
```

```ts
const { create, getAuthenticationRequired, getTokenExpiresInSeconds, authenticate } = useOnlineIdentity()

const createDittoInstance = (forPath: string) => {
  // Example of how to create an online instance with authentication enabled
  const dittoOnline = new Ditto(
    create({
      // If you're using the Ditto cloud this ID should be the app ID shown on your app settings page, on the portal.
      appID: uuidv4(),
      enableDittoCloudSync: true,
    }, forPath),
    forPath,
  )
  return dittoOnline
}
```

You can find more information on working with online apps [here](#working-with-online-apps)

## Quick Start with `create-react-app`

This is a quick guide on using Ditto with `create-react-app` builds.

1. Install this library with npm or yarn

```
npm install @dittolive/ditto @dittolive/react-ditto
```

or with yarn

```
yarn add @dittolive/ditto @dittolive/react-ditto
```

2. In `./src/index.js` or if you're using typescript `./src/index.tsx` setup Ditto with the `DittoProvider` like so:

```tsx
import { DittoProvider, useOfflinePlaygroundIdentity } from '@dittolive/react-ditto'

/**
 * This configuration is optional for web browser-based react applications.
 * This tells the `DittoProvider` where it should load the .wasm file. If no path is provided (ie. initOptions is undefined),
 * the wasm will be loaded from our CDN.
 **/
const initOptions = {
  webAssemblyModule: "/ditto.wasm",
}

/** Example of a React root component setting up a single ditto instance that uses a development connection */
const RootComponent = () => {
  const { create } = useOfflinePlaygroundIdentity()
  
  return (
    <DittoProvider 
      setup={() => new Ditto(create({ appName: 'my app', siteID: 1234 }, '/foo'))} 
      /*initOptions={initOptions} */
    >
      {({ loading, error }) => {
        if (loading) return <p>Loading</p>;
        if (error) return <p>{error.message}</p>;
        return <App />;
      }}
    </DittoProvider>
  )
}



ReactDOM.render(
  <React.StrictMode>
    <RootComponent />
  </React.StrictMode>,
  document.getElementById("root")
);
```

3. In your `App` component, you can now use hooks like `usePendingCursorOperation` or `usePendingIDSpecificOperation` to get your documents like so:

```tsx
import { usePendingCursorOperation, useMutations } from "@dittolive/react-ditto";

export default function App() {
  const { documents, ditto } = usePendingCursorOperation({
    collection: 'tasks',
  });

  const { updateByID, insert } = useMutations({ collection: 'tasks' })

  return (
    <ul>
      {documents.map(doc => (
        <li key={doc._id}>
          {doc.body}
        </li>
      ))}
    </ul>
  )
}
```

Alternatively, you can also choose to go with the lazy variants of these hooks (`useLazyPendingCursorOperation` and `useLazyPendingIDSpecificOperation`), ir order to launch queries on the data store as a response to a user event:

```tsx
import { usePendingCursorOperation, useMutations } from "@dittolive/react-ditto";

export default function App() {
  const { documents, ditto, exec } = useLazyPendingCursorOperation();
  
  if(!documents?.length) {
    return <button onClick={() => exec({ collection: 'tasks' })}>Click to load!</button>
  }
  
  return (
    <ul>
      {documents.map(doc => (
        <li key={doc._id}>
          {doc.body}
        </li>
      ))}
    </ul>
  )
}
```

## Working with Online apps

Using the [Portal](http://portal.ditto.live) you can create apps that sync to the cloud. These apps must be created with an `onlineWithAuthentication` identity type, for which the `useOnlineIdentity` hook can be used. The `useOnlineIdentity` hook helps you create online Ditto instances that sync with the cloud, following these steps:

```tsx
/** Example of a React root component setting up a single ditto instance that uses a development connection */
const RootComponent = () => {
  const { create, getAuthenticationRequired, getTokenExpiresInSeconds, authenticate } = useOnlineIdentity()
  
  return (
    <>
        <DittoProvider 
          setup={() => new Ditto(create({ appID: 'your-app-id', path: '/my-online-path' }, '/my-online-path'))} 
          /*initOptions={initOptions} */
        >
          {({ loading, error, ditto }) => {
            if (loading) return <p>Loading</p>;
            if (error) return <p>{error.message}</p>;
            return <App />;
          }}
        </DittoProvider>
        {getAuthenticationRequired('/my-online-path') && (
          <div>
            <div>You need to authenticate!</div>
            <button onClick={() => authenticate('/my-online-path', 'provider', 'some token')}>Authenticate</button>
          </div>
        )}
    </>
  )
}

```

For Online apps, the `useOnlineIdentity` hook returns the following set of properties that can be used to manage authentication for your app:

* `create`: Creates an `onlineWithAuthentication` object preconfigured such that the hook can manage the authentication flow using the exposed `authenticate` function.
* `getAuthenticationRequired`: Is a function that takes in the app path for which to check the authentication required state, and will return true if your Ditto instance is requiring the current user to authenticate with the app. You can configure authentication webhooks on the [Portal](http://portal.ditto.live), from your app settings area, in order to provide your own set of validation services for your app.
* `getTokenExpiresInSeconds`: Is a function that takes in the app path for which to check the token expiry second, and returns the number of seconds in which your current token expires if this has been reported by the Ditto SDK.
* `authenticate`: Function that can be used to make an authentication request for an app given the app path. Requires you to provide the token and the provider name (taken from the list of the configured token validation providers) that you want to validate the token against.

## Building this library and running tests

- **Building:** run `npm run build` or `yarn build`.
- **Run Tests:** run `npm test` or `yarn test`
- **Generating Documentation Website Files** run `npm run docs:generate`

## Running example apps.

Each example project is in its own directory underneath the [./examples](./examples) directory.
