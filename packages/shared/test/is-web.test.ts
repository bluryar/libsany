import { describe, expect, it } from 'vitest'
import * as Is from '../src/is-web'

describe('constant: isWebClient', () => {
  it('should be true', () => {
    expect(Is.isWebClient).toBeTruthy()
  })
})

describe('function: isHTMLElement', () => {
  it('should be return boolean', () => {
    const custom = new (class HTMLTestElement {})()

    expect(Is.isHTMLElement(document.documentElement)).toBeTruthy()
    expect(Is.isHTMLElement(document.createElement('div'))).toBeTruthy()
    expect(Is.isHTMLElement(document.createElement('style'))).toBeTruthy()
    expect(Is.isHTMLElement(custom)).toBeFalsy()
    expect(Is.isHTMLElement({})).toBeFalsy()
  })
})

describe('function: isHTMLHtmlElement', () => {
  it('should be return boolean', () => {
    expect(Is.isHTMLHtmlElement(document.documentElement)).toBeTruthy()
    expect(Is.isHTMLHtmlElement(document.createElement('html'))).toBeTruthy()
    expect(Is.isHTMLHtmlElement(document.createElement('body'))).toBeFalsy()
    expect(Is.isHTMLHtmlElement({})).toBeFalsy()
  })
})

describe('function: isHTMLBodyElement', () => {
  it('should be return boolean', () => {
    expect(Is.isHTMLBodyElement(document.documentElement)).toBeFalsy()
    expect(Is.isHTMLBodyElement(document.createElement('html'))).toBeFalsy()
    expect(Is.isHTMLBodyElement(document.createElement('body'))).toBeTruthy()
    expect(Is.isHTMLBodyElement({})).toBeFalsy()
  })
})

describe('function: isHTMLHeadElement', () => {
  it('should be return boolean', () => {
    expect(Is.isHTMLHeadElement(document.documentElement)).toBeFalsy()
    expect(Is.isHTMLHeadElement(document.createElement('html'))).toBeFalsy()
    expect(Is.isHTMLHeadElement(document.createElement('head'))).toBeTruthy()
    expect(Is.isHTMLHeadElement({})).toBeFalsy()
  })
})

describe('function: isHTMLStyleElement', () => {
  it('should be return boolean', () => {
    expect(Is.isHTMLStyleElement(document.documentElement)).toBeFalsy()
    expect(Is.isHTMLStyleElement(document.createElement('html'))).toBeFalsy()
    expect(Is.isHTMLStyleElement(document.createElement('style'))).toBeTruthy()
    expect(Is.isHTMLStyleElement({})).toBeFalsy()
  })
})

describe('function: isHTMLScriptElement', () => {
  it('should be return boolean', () => {
    expect(Is.isHTMLScriptElement(document.documentElement)).toBeFalsy()
    expect(Is.isHTMLScriptElement(document.createElement('html'))).toBeFalsy()
    expect(Is.isHTMLScriptElement(document.createElement('script'))).toBeTruthy()
    expect(Is.isHTMLScriptElement({})).toBeFalsy()
  })
})

describe('function: isHTMLDivElement', () => {
  it('should be return boolean', () => {
    expect(Is.isHTMLDivElement(document.documentElement)).toBeFalsy()
    expect(Is.isHTMLDivElement(document.createElement('html'))).toBeFalsy()
    expect(Is.isHTMLDivElement(document.createElement('div'))).toBeTruthy()
    expect(Is.isHTMLDivElement({})).toBeFalsy()
  })
})

describe('function: isHTMLSpanElement', () => {
  it('should be return boolean', () => {
    expect(Is.isHTMLSpanElement(document.documentElement)).toBeFalsy()
    expect(Is.isHTMLSpanElement(document.createElement('html'))).toBeFalsy()
    expect(Is.isHTMLSpanElement(document.createElement('span'))).toBeTruthy()
    expect(Is.isHTMLSpanElement({})).toBeFalsy()
  })
})

describe('function: isWindow', () => {
  it('should be return boolean', () => {
    expect(Is.isWindow(document.documentElement)).toBeFalsy()
    expect(Is.isWindow(document.createElement('html'))).toBeFalsy()
    expect(Is.isWindow(document.createElement('div'))).toBeFalsy()
    expect(Is.isWindow({})).toBeFalsy()

    expect(Is.isWindow(window)).toBeTruthy()
  })
})

describe('function: isDocument', () => {
  it('should be return boolean', () => {
    expect(Is.isDocument(document.documentElement)).toBeFalsy()
    expect(Is.isDocument(document.createElement('html'))).toBeFalsy()
    expect(Is.isDocument(document)).toBeTruthy()
    expect(Is.isDocument({})).toBeFalsy()
  })
})
