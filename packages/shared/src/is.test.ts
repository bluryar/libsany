import { describe, expect, it } from 'vitest';
import * as Is from './is';

describe('function: isString', () => {
  it('should return boolean', () => {
    expect(Is.isString('')).toBeTruthy();
    expect(Is.isString(1)).toBeFalsy();
    expect(Is.isString({})).toBeFalsy();
  });
});

describe('function: isSymbol', () => {
  it('should return boolean', () => {
    expect(Is.isSymbol(Symbol('test'))).toBeTruthy();
    expect(Is.isSymbol(Symbol)).toBeFalsy();
    expect(Is.isSymbol('test')).toBeFalsy();
  });
});

describe('function: isBoolean', () => {
  it('should return boolean', () => {
    expect(Is.isBoolean(!!1)).toBeTruthy();
    expect(Is.isBoolean(!!0)).toBeTruthy();
    expect(Is.isBoolean('!!1')).toBeFalsy();
    expect(Is.isBoolean({})).toBeFalsy();
    expect(Is.isBoolean(!!{})).toBeTruthy();
  });
});

describe('function: isNumber', () => {
  it('should return boolean', () => {
    expect(Is.isNumber(NaN)).toBeTruthy();
    expect(Is.isNumber(0)).toBeTruthy();
    expect(Is.isNumber(10000000000000)).toBeTruthy();
    expect(Is.isNumber(Infinity)).toBeTruthy();
    expect(Is.isNumber('NaN')).toBeFalsy();
    expect(Is.isNumber(!!1)).toBeFalsy();
    expect(Is.isNumber({})).toBeFalsy();
  });
});

describe('function: isBigint', () => {
  it('should return boolean', () => {
    expect(Is.isBigint(BigInt('0b11111111111111111111111111111111111111111111111111111'))).toBeTruthy();
    expect(Is.isBigint(1000)).toBeFalsy();
    expect(Is.isBigint(0b11111111111111111111111111111111111111111111111111111)).toBeFalsy();
  });
});

describe('function: isUndefined and isUndef', () => {
  it('should return boolean', () => {
    const test = {};
    expect(Is.isUndef(undefined)).toBeTruthy();
    expect(Is.isUndefined(undefined)).toBeTruthy();
    // @ts-expect-error 预期中的错误
    expect(Is.isUndefined(test.test)).toBeTruthy();
    expect(Is.isUndefined(test)).toBeFalsy();
    expect(Is.isUndefined(null)).toBeFalsy();
  });
});

describe('function: isNull', () => {
  it('should return boolean', () => {
    expect(Is.isNull(null)).toBeTruthy();
    expect(Is.isNull(undefined)).toBeFalsy();
    expect(Is.isNull(!!1)).toBeFalsy();
    expect(Is.isNull({})).toBeFalsy();
  });
});

describe('function: isNil', () => {
  it('should return boolean', () => {
    expect(Is.isNil(null)).toBeTruthy();
    expect(Is.isNil(undefined)).toBeTruthy();
    expect(Is.isNull(!!1)).toBeFalsy();
    expect(Is.isNull({})).toBeFalsy();
  });
});

describe('function: isFalse', () => {
  it('should return boolean', () => {
    expect(Is.isFalse(false)).toBeTruthy();
    expect(Is.isFalse(true)).toBeFalsy();
  });
});

describe('function: isTrue', () => {
  it('should return boolean', () => {
    expect(Is.isTrue(true)).toBeTruthy();
    expect(Is.isTrue(false)).toBeFalsy();
  });
});

describe('function: isObject', () => {
  it('should return boolean', () => {
    expect(Is.isObject({})).toBeTruthy();
    expect(Is.isObject(new Date())).toBeTruthy();
    expect(Is.isObject(() => {})).toBeFalsy();
  });
});

describe('function: isPlainObject', () => {
  it('should return boolean', () => {
    expect(Is.isPlainObject(new Date())).toBeFalsy();
    expect(Is.isPlainObject({})).toBeTruthy();
    // eslint-disable-next-line no-new-object
    expect(Is.isPlainObject(new Object())).toBeTruthy();
  });
});

describe('function: isFunction', () => {
  it('should return boolean', () => {
    expect(Is.isFunction(() => {})).toBeTruthy();
    // eslint-disable-next-line prefer-arrow-callback
    expect(Is.isFunction(function () {})).toBeTruthy();
    expect(Is.isFunction({})).toBeFalsy();
  });
});

describe('function: isArray', () => {
  it('should return boolean', () => {
    expect(Is.isArray([])).toBeTruthy();
    // 类数组不算
    expect(Is.isArray({ length: 10 })).toBeFalsy();
  });
});

describe('function: isMap', () => {
  it('should return boolean', () => {
    expect(Is.isMap(new Map())).toBeTruthy();
  });
});

describe('function: isSet', () => {
  it('should return boolean', () => {
    expect(Is.isSet(new Set())).toBeTruthy();
  });
});

describe('function: isDate', () => {
  it('should return boolean', () => {
    expect(Is.isDate(new Date())).toBeTruthy();
  });
});

describe('function: isRegExp', () => {
  it('should return boolean', () => {
    expect(Is.isRegExp(/test/)).toBeTruthy();
    // eslint-disable-next-line prefer-regex-literals
    expect(Is.isRegExp(new RegExp('test'))).toBeTruthy();
  });
});

describe('function: isPromise', () => {
  it('should return boolean', () => {
    expect(Is.isPromise(new Promise(() => {}))).toBeTruthy();
    expect(Is.isPromise(Promise.resolve(1))).toBeTruthy();

    // 并不是严格使用js引擎的 `Promise` API。
    expect(
      Is.isPromise({
        then: () => {},
        catch: () => {},
      }),
    ).toBeTruthy();
  });
});

describe('batch: Is Module contains pure Is Function', () => {
  it('should return boolean', () => {
    const keys = Object.keys(Is) as (keyof typeof Is)[];
    const values = Object.values(Is);

    const batchKeys = () => {
      return keys.map((k) => (Is[k] as any)(null));
    };
    const batchValues = () => {
      return values.map((v) => Is.isFunction(v));
    };

    expect(batchKeys().every((v) => Is.isBoolean(v))).toBeTruthy();
    expect(batchValues().every((v) => Is.isBoolean(v))).toBeTruthy();
  });
});
