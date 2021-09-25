import React, { useState, useEffect, ReactNode, ReactElement } from "react";
import { Ditto, init, InitOptions } from "@dittolive/ditto";
import { DittoContext } from "./DittoContext";
import { DittoHash, RegisterDitto, UnregisterDitto } from ".";

export type RenderFunction = (providerState: ProviderState) => ReactNode;

export interface DittoProviderProps extends React.PropsWithChildren<unknown> {
  initOptions?: InitOptions;
  /**
   * This function is called when the DittoProvider initialized the Ditto module.
   * Use this function to bootstrap the Ditto instance to the provider.
   *
   * Return a
   */
  setup: () => Ditto | Ditto[];
  render?: RenderFunction;
  children?: RenderFunction;
}

/**
 * A description of the {@link DittoProvider}'s loading state. 
 */
export interface ProviderState {
  /**
   * If the Provider is loading the ditto.wasm file.
   */
  loading: boolean;
  /**
   * If there was an error loading the ditto.wasm file, the error will have an {@link Error}
   */
  error: Error | undefined;
}

/**
 *
 * @param props
 * @returns A function that needs to return a React.Element
 */
export const DittoProvider: React.FunctionComponent<DittoProviderProps> = (
  props
): ReactElement => {
  
  
  const [providerState, setProviderState] = useState<ProviderState>({
    loading: true,
    error: undefined
  });
  
  const [dittoHash, setDittoHash] = useState<DittoHash>({});


  useEffect(() => {
    (async function () {
      try {
        await init(props.initOptions);
        const setupReturnValue: Ditto | Ditto[] = props.setup();
        if (Array.isArray(setupReturnValue)) {
          const dittoHash: DittoHash = {}
          const dittos: Ditto[] = setupReturnValue as Ditto[];
          for (const ditto of dittos) {
            dittoHash[ditto.path] = ditto;
          }
          setProviderState({
            error: undefined,
            loading: false
          });
          setDittoHash(dittoHash)
        } else {
          const ditto = setupReturnValue as Ditto;
          const dittoHash: DittoHash = {}
          dittoHash[ditto.path] = ditto;
          setDittoHash(dittoHash)
        }
        
      } catch (err) {
        setProviderState({
          error: err,
          loading: false,
        });
        setDittoHash({})
      }
    })();
  }, [props]);

  const renderFunction: RenderFunction | undefined =
    props.render || props.children;
  let children: ReactNode = <></>;
  if (renderFunction) {
    children = renderFunction(providerState);
  }

  const registerDitto: RegisterDitto = (ditto) => {
    const hash = { ...dittoHash };
    hash[ditto.path] = ditto;
    setDittoHash(hash);
  };

  const unregisterDitto: UnregisterDitto = (path) => {
    const hash = { ...dittoHash };
    delete hash[path];
    setDittoHash(hash);
  };

  return (
    <DittoContext.Provider
      value={{ dittoHash: dittoHash, registerDitto, unregisterDitto }}
    >
      {children}
    </DittoContext.Provider>
  );
};
