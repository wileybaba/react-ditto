import { Ditto, init, InitOptions } from '@dittolive/ditto'
import React, { ReactNode, useEffect, useState } from 'react'

import {
  DittoContext,
  DittoHash,
  RegisterDitto,
  UnregisterDitto,
} from './DittoContext'
import { ProviderState, RenderFunction } from './DittoProvider'

export interface DittoLazyProviderProps
  extends React.PropsWithChildren<unknown> {
  initOptions?: InitOptions
  /**
   * This function is called whenever a child component uses a Ditto instance through the useDitto hook
   * and the instance needs to be created.
   *
   * @param props Path on which the app is being created. Should be used as a discriminator to determine how the Ditto instance
   * should be created.
   * @returns A Ditto instance initialized on the given path
   */
  setup: (appPath: string) => Promise<Ditto | null>
  render?: RenderFunction
  children?: RenderFunction
}

/**
 * Implements a lazy Ditto provider which is initially mounted without any Ditto instances. Child components are then
 * responsible for invoking the provider's load function to create a Ditto instance on demand when it is needed.
 * @param props
 * @returns A function that needs to return a React.Element
 */
export const DittoLazyProvider: React.FunctionComponent<DittoLazyProviderProps> =
  ({ initOptions, setup, render, children }) => {
    const [dittoHash, setDittoHash] = useState<DittoHash>({})
    const [providerState, setProviderState] = useState<ProviderState>({
      loading: true,
      error: undefined,
    })

    useEffect(() => {
      ;(async function () {
        try {
          await init(initOptions)

          setProviderState({
            error: undefined,
            loading: false,
          })
        } catch (err) {
          setProviderState({
            error: err,
            loading: false,
          })
        }
      })()
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const renderFunction: RenderFunction | undefined = render || children

    let child: ReactNode = <></>
    if (renderFunction) {
      child = renderFunction(providerState)
    }

    const handleLoadInstance = async (appPath: string) => {
      if (appPath in dittoHash) {
        return dittoHash[appPath]
      } else {
        /** The app path is initialized to null while loading to avoid parallel initializations
         * of the same instance.
         */
        setDittoHash((currentHash) => ({
          ...currentHash,
          [appPath]: null,
        }))

        const dittoInstance = await setup(appPath)

        /** The setup function may choose to skip instance creation and return null, in
         * which case we don't cache the returned value.
         */
        if (dittoInstance) {
          setDittoHash((currentHash) => ({
            ...currentHash,
            [appPath]: dittoInstance,
          }))
        }

        return dittoInstance
      }
    }

    const registerDitto: RegisterDitto = (ditto) => {
      if (ditto.path in dittoHash) {
        throw new Error(
          'The instance path is already being used by a Ditto instance.',
        )
      }

      setDittoHash((currentHash) => ({
        ...currentHash,
        [ditto.path]: ditto,
      }))
    }

    const unregisterDitto: UnregisterDitto = (path) => {
      const hash = { ...dittoHash }
      delete hash[path]
      setDittoHash(hash)
    }

    return (
      <DittoContext.Provider
        value={{
          dittoHash: dittoHash,
          registerDitto,
          unregisterDitto,
          load: handleLoadInstance,
          isLazy: true,
        }}
      >
        {child}
      </DittoContext.Provider>
    )
  }
