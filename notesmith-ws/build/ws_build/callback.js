"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.callbackHandler = exports.isCallbackSet = void 0;
const http_1 = __importDefault(require("http"));
const CALLBACK_URL = process.env.CALLBACK_URL
    ? new URL(process.env.CALLBACK_URL)
    : null;
const CALLBACK_TIMEOUT = process.env.CALLBACK_TIMEOUT
    ? Number.parseInt(process.env.CALLBACK_TIMEOUT)
    : 5000;
const CALLBACK_OBJECTS = process.env.CALLBACK_OBJECTS
    ? JSON.parse(process.env.CALLBACK_OBJECTS)
    : {};
exports.isCallbackSet = !!CALLBACK_URL;
const callbackHandler = (update, origin, doc //TOOD: WSSharedDoc type
) => {
    const room = doc.name;
    const dataToSend = {
        room,
        data: {},
    };
    const sharedObjectList = Object.keys(CALLBACK_OBJECTS);
    sharedObjectList.forEach((sharedObjectName) => {
        const sharedObjectType = CALLBACK_OBJECTS[sharedObjectName];
        dataToSend.data[sharedObjectName] = {
            type: sharedObjectType,
            content: getContent(sharedObjectName, sharedObjectType, doc).toJSON(),
        };
    });
    if (!CALLBACK_URL) {
        throw new Error("No callback URL specified!");
    }
    callbackRequest(CALLBACK_URL, CALLBACK_TIMEOUT, dataToSend);
};
exports.callbackHandler = callbackHandler;
const callbackRequest = (url, timeout, data) => {
    const stringifiedData = JSON.stringify(data);
    const options = {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname,
        timeout,
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Content-Length": stringifiedData.length,
        },
    };
    const req = http_1.default.request(options);
    req.on("timeout", () => {
        console.warn("Callback request timed out.");
        req.abort();
    });
    req.on("error", (e) => {
        console.error("Callback request error.", e);
        req.abort();
    });
    req.write(stringifiedData);
    req.end();
};
const getContent = (objName, objType, doc
// eslint-disable-next-line @typescript-eslint/no-explicit-any
) => {
    switch (objType) {
        case "Array":
            return doc.getArray(objName);
        case "Map":
            return doc.getMap(objName);
        case "Text":
            return doc.getText(objName);
        case "XmlFragment":
            return doc.getXmlFragment(objName);
        case "XmlElement":
            throw new Error("XmlElement does not exist");
        // return doc.getXmlElement(objName);
        default:
            throw new Error(`Invalid objType ${objType}`);
    }
};
