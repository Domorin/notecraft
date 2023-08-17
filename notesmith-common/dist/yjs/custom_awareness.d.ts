/// <reference types="node" />
import { Observable } from "lib0/observable";
import * as Y from "yjs";
export declare const outdatedTimeout = 30000;
/**
 * @typedef {Object} MetaClientState
 * @property {number} MetaClientState.clock
 * @property {number} MetaClientState.lastUpdated unix timestamp
 */
/**
 * The Awareness class implements a simple shared state protocol that can be used for non-persistent data like awareness information
 * (cursor, username, status, ..). Each client can update its own local state and listen to state changes of
 * remote clients. Every client may set a state of a remote peer to `null` to mark the client as offline.
 *
 * Each client is identified by a unique client id (something we borrow from `doc.clientID`). A client can override
 * its own state by propagating a message with an increasing timestamp (`clock`). If such a message is received, it is
 * applied if the known state of that client is older than the new state (`clock < newClock`). If a client thinks that
 * a remote client is offline, it may propagate a message with
 * `{ clock: currentClientClock, state: null, client: remoteClient }`. If such a
 * message is received, and the known clock of that client equals the received clock, it will override the state with `null`.
 *
 * Before a client disconnects, it should propagate a `null` state with an updated clock.
 *
 * Awareness states must be updated every 30 seconds. Otherwise the Awareness instance will delete the client state.
 *
 */
export declare class CustomAwareness extends Observable<string> {
    doc: Y.Doc;
    clientID: number;
    states: Map<number, Record<string, unknown>>;
    meta: Map<any, any>;
    _checkInterval: NodeJS.Timer;
    /**
     * @param {Y.Doc} doc
     */
    constructor(doc: Y.Doc);
    destroy(): void;
    /**
     * @return {Object<string,any>|null}
     */
    getLocalState(): Record<string, unknown> | null;
    /**
     * @param {Object<string,any>|null} state
     */
    setLocalState(state: Record<string, unknown> | null): void;
    setLocalStateField(field: string, value: unknown): void;
    /**
     * @return {Map<number,Object<string,any>>}
     */
    getStates(): Map<number, Record<string, unknown>>;
}
/**
 * Mark (remote) clients as inactive and remove them from the list of active peers.
 * This change will be propagated to remote clients.
 */
export declare const removeAwarenessStates: (awareness: CustomAwareness, clients: Array<number>, origin: any) => void;
export declare const encodeAwarenessUpdate: (awareness: CustomAwareness, clients: Array<number>, states?: Map<number, Record<string, unknown>>) => Uint8Array;
/**
 * Modify the content of an awareness update before re-encoding it to an awareness update.
 *
 * This might be useful when you have a central server that wants to ensure that clients
 * cant hijack somebody elses identity.
 *
 */
export declare const modifyAwarenessUpdate: (update: Uint8Array, modify: (arg0: any) => any) => Uint8Array;
/**
 * @param {any} origin This will be added to the emitted change event
 */
export declare const applyAwarenessUpdate: (awareness: CustomAwareness, update: Uint8Array, origin: any) => void;
