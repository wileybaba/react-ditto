import { Ditto } from '@dittolive/ditto'
import { useContext, useEffect, useState } from 'react'

import { DittoContext, DittoHash, RegisterDitto, UnregisterDitto } from '.'

export const useDitto = (
  path?: string,
): {
  ditto: Ditto | undefined
  dittoHash: DittoHash
  registerDitto?: RegisterDitto
  unregisterDitto?: UnregisterDitto
} => {
  const { dittoHash } = useContext(DittoContext)

  const [ditto, setDitto] = useState<Ditto | undefined>()

  useEffect(() => {
    let foundDitto: Ditto
    if (path) {
      foundDitto = dittoHash[path]
    } else {
      const [first] = Object.values(dittoHash)
      foundDitto = first
    }
    if (foundDitto) {
      setDitto(foundDitto)
    } else {
      setDitto(undefined)
    }
  }, [path, dittoHash])

  return {
    ditto,
    dittoHash,
  }
}