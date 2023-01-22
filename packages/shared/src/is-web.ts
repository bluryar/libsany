import { toRawType, toTypeString } from './misc'

export const isWebClient = typeof window !== 'undefined'

export const isHTMLElement = (val: unknown): val is HTMLElement => isWebClient && /HTML\w*Element/.test(toRawType(val))

export const isHTMLHtmlElement = (val: unknown): val is HTMLHtmlElement => isWebClient && toTypeString(val) === '[object HTMLHtmlElement]'

export const isHTMLBodyElement = (val: unknown): val is HTMLBodyElement => isWebClient && toTypeString(val) === '[object HTMLBodyElement]'

export const isHTMLHeadElement = (val: unknown): val is HTMLHeadElement => isWebClient && toTypeString(val) === '[object HTMLHeadElement]'

export const isHTMLStyleElement = (val: unknown): val is HTMLStyleElement => isWebClient && toTypeString(val) === '[object HTMLStyleElement]'

export const isHTMLScriptElement = (val: unknown): val is HTMLScriptElement => isWebClient && toTypeString(val) === '[object HTMLScriptElement]'

export const isHTMLDivElement = (val: unknown): val is HTMLDivElement => isWebClient && toTypeString(val) === '[object HTMLDivElement]'

export const isHTMLSpanElement = (val: unknown): val is HTMLSpanElement => isWebClient && toTypeString(val) === '[object HTMLSpanElement]'

export const isWindow = (val: unknown): val is Window => isWebClient && val === window

export const isDocument = (val: unknown): val is Document => isWebClient && val === window.document
