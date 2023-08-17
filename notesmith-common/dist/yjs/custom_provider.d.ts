/**
 * @module provider/websocket
 */
import * as Y from "yjs";
import * as encoding from "lib0/encoding";
import * as decoding from "lib0/decoding";
import { Observable } from "lib0/observable";
import { CustomAwareness } from "./custom_awareness";
import { CustomMessage } from "../ws_types";
export declare const messageSync = 0;
export declare const messageQueryAwareness = 3;
export declare const messageAwareness = 1;
export declare const messageAuth = 2;
/**
 * Websocket Provider for Yjs. Creates a websocket connection to sync the shared document.
 * The document name is attached to the provided url. I.e. the following example
 * creates a websocket connection to http://localhost:1234/my-document-name
 *
 * @example
 *   import * as Y from 'yjs'
 *   import { CustomProvider } from 'y-websocket'
 *   const doc = new Y.Doc()
 *   const provider = new CustomProvider('http://localhost:1234', 'my-document-name', doc)
 *
 * @extends {Observable<string>}
 */
export declare class CustomProvider extends Observable<string> {
    maxBackoffTime: number;
    bcChannel: string;
    url: string;
    roomname: string;
    doc: Y.Doc;
    _WS: {
        new (url: string | URL, protocols?: string | string[] | undefined): WebSocket;
        prototype: WebSocket;
        readonly CONNECTING: 0;
        readonly OPEN: 1;
        readonly CLOSING: 2;
        readonly CLOSED: 3;
    };
    awareness: CustomAwareness;
    wsconnected: boolean;
    wsconnecting: boolean;
    bcconnected: boolean;
    disableBc: boolean;
    wsUnsuccessfulReconnects: number;
    messageHandlers: ((arg0: encoding.Encoder, arg1: decoding.Decoder, arg2: CustomProvider, arg3: boolean, arg4: number) => void)[];
    _synced: boolean;
    ws: WebSocket | null;
    wsLastMessageReceived: number;
    shouldConnect: boolean;
    private _resyncInterval;
    private _bcSubscriber;
    private _updateHandler;
    private _awarenessUpdateHandler;
    private _unloadHandler;
    private _checkInterval;
    customMessageHandler: ((message: CustomMessage) => void) | undefined;
    /**
     * @param {typeof WebSocket} [opts.WebSocketPolyfill] Optionall provide a WebSocket polyfill
     * @param {number} [opts.resyncInterval] Request server state every `resyncInterval` milliseconds
     * @param {number} [opts.maxBackoffTime] Maximum amount of time to wait before trying to reconnect (we try to reconnect using exponential backoff)
     * @param {boolean} [opts.disableBc] Disable cross-tab BroadcastChannel communication
     */
    constructor(serverUrl: string, roomname: string, doc: Y.Doc, { connect, awareness, params, WebSocketPolyfill, resyncInterval, maxBackoffTime, disableBc, customMessageHandler, }?: {
        connect?: boolean;
        awareness?: CustomAwareness;
        params?: {
            [s: string]: string;
        };
        WebSocketPolyfill?: typeof WebSocket;
        resyncInterval?: number;
        maxBackoffTime?: number;
        disableBc?: boolean;
        customMessageHandler?: (message: CustomMessage) => void;
    });
    /**
     * @type {boolean}
     */
    get synced(): boolean;
    set synced(state: boolean);
    destroy(): void;
    connectBc(): void;
    disconnectBc(): void;
    disconnect(): void;
    connect(): void;
}
