import { Ditto, IdentityOfflinePlayground } from '@dittolive/ditto'
import { expect } from 'chai'
import React, { useContext } from 'react'
import { render, unmountComponentAtNode } from 'react-dom'
import { act } from 'react-dom/test-utils'

import { DittoContext } from './DittoContext'
import { DittoProvider } from './DittoProvider'

describe('Ditto Provider Tests', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    unmountComponentAtNode(container)
    container.remove()
    container = null
  })

  it('should load ditto wasm from the CDN', function () {
    const identity: IdentityOfflinePlayground = {
      appName: 'live.ditto.test',
      siteID: 234,
      type: 'offlinePlayground',
    }
    act(() => {
      render(
        <DittoProvider
          setup={() => {
            const ditto = new Ditto(identity, '/test')
            return ditto
          }}
        >
          {({ loading, error }) => {
            if (loading) {
              expect(error).to.be.undefined
            }
            if (error) {
              expect(loading).to.be.false
            }
            return <></>
          }}
        </DittoProvider>,
        container,
      )
    })
  })

  it('should load ditto wasm from a locally served ditto.wasm file', function () {
    const identity: IdentityOfflinePlayground = {
      appName: 'live.ditto.test',
      siteID: 234,
      type: 'offlinePlayground',
    }
    const initOptions = {
      webAssemblyModule: '/base/node_modules/@dittolive/ditto/web/ditto.wasm',
    }

    act(() => {
      render(
        <DittoProvider
          initOptions={initOptions}
          setup={() => {
            const ditto = new Ditto(identity, '/test')
            return ditto
          }}
        >
          {({ loading, error }) => {
            if (loading) {
              expect(error).to.be.undefined
            }
            if (error) {
              expect(loading).to.be.false
            }
            return <></>
          }}
        </DittoProvider>,
        container,
      )
    })
  })

  it('should fail to load ditto from web assembly file that does not exist', function () {
    const identity: IdentityOfflinePlayground = {
      appName: 'live.ditto.test',
      siteID: 234,
      type: 'offlinePlayground',
    }
    const initOptions = {
      webAssemblyModule:
        '/base/node_modules/@dittolive/ditto/web/ditto-that-does-not-exist.wasm',
    }

    act(() => {
      render(
        <DittoProvider
          initOptions={initOptions}
          setup={() => {
            const ditto = new Ditto(identity, '/test')
            return ditto
          }}
        >
          {({ loading, error }) => {
            if (loading == false) {
              expect(error).to.not.be.undefined
            }
            return <></>
          }}
        </DittoProvider>,
        container,
      )
    })
  })

  it('should mount the provider with the initialized Ditto instance.', () => {
    const identity: IdentityOfflinePlayground = {
      appName: 'live.ditto.test',
      siteID: 234,
      type: 'offlinePlayground',
    }

    const TesterChildComponent = ({ loading }: { loading: boolean }) => {
      const { dittoHash } = useContext(DittoContext)

      expect(Object.values(dittoHash).length).to.eq(loading ? 0 : 1)

      return <></>
    }
    act(() => {
      render(
        <DittoProvider
          setup={() => {
            return new Ditto(identity, '/test')
          }}
        >
          {({ loading }) => <TesterChildComponent loading={loading} />}
        </DittoProvider>,
        container,
      )
    })
  })
})