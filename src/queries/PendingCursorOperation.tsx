import {
  Ditto,
  Document,
  LiveQueryEvent,
  LiveQuery,
  QueryArguments,
  SortDirection,
  PendingCursorOperation,
} from "@dittolive/ditto";
import { useEffect, useState } from "react";
import { useDitto } from "../DittoContext";

export interface LiveQueryParams {
  collection: string;
  /**
   * The path of the Ditto string. If you omit this, it will fetch the first registered Ditto value.
   */
  path?: string;
  /**
   * A Ditto query string. For more information on the query string syntax refer to https://docs.ditto.live/concepts/querying
   * For example to query for a color property equal to red use: 
   * `color == 'red'`
   */
  query?: string;
  /**
   * Optional arguments that will interpolate the values into the `query` string. For example, if your query string is
   * ```
   * "color == $args.color && mileage >= $args.mileage"
   * ```. You can provide an args dictionary like: 
   * ```js
   * { color: "red", mileage: "1200" }
   * ```
   */
  args?: QueryArguments;
  sort?: {
    /**
     * An optional sort parameter for your query. For example, if you want to sort with ascending values on a specific field like `"createdOn"` use:
     * 
     * ```js
     * {
     *   propertyPath: "createdOn",
     *   direction: "ascending"
     * }
     * ```
     * 
     * For descending values use:
     * 
     * ```js
     * {
     *   propertyPath: "createdOn",
     *   direction: "ascending"
     * }
     * ```
     * For more information on the query string syntax refer to https://docs.ditto.live/concepts/querying
     */
    propertyPath: string;
    direction?: SortDirection;
  };
  /**
   * An optional number to limit the results of the query. If you omit this value, the query will return values
   */
  limit?: number;
}

/**
 * Runs a ditto live query immediately with the 
 * @param params live query parameters.
 * @returns 
 */
export function usePendingCursorOperation<T = Document>(params: LiveQueryParams): {
  ditto: Ditto;
  documents: T[];
  liveQueryEvent: LiveQueryEvent | undefined;
  liveQuery: LiveQuery | undefined;
} {
  const { ditto } = useDitto(params.path);
  const [documents, setDocuments] = useState<T[]>([]);
  const [liveQueryEvent, setLiveQueryEvent] = useState<
    LiveQueryEvent | undefined
  >();
  const [liveQuery, setLiveQuery] = useState<LiveQuery | undefined>();

  useEffect(() => {
    let liveQuery: LiveQuery | undefined;
    if (ditto) {
      const collection = ditto.store.collection(params.collection);
      let cursor: PendingCursorOperation;
      if (params.query) {
         cursor = collection.findAll()
      } else {
        cursor = collection.find(params.query, params.args);
      }
      if (params.sort) {
        cursor = cursor.sort(params.sort.propertyPath, params.sort.direction);
      }
      if (params.limit) {
        cursor = cursor.limit(params.limit);
      }
      liveQuery = cursor.observe((docs, event) => {
        setDocuments(docs);
        setLiveQueryEvent(event);
      });
      setLiveQuery(liveQuery);
    }

    return (): void => {
      liveQuery?.stop();
    };
  }, [ditto, params]);

  return {
    ditto,
    documents,
    liveQueryEvent,
    liveQuery,
  };
}