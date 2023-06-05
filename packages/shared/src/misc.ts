export function NOOP() {}

/**
 * Always return false.
 */
export const NO = (): false => false

export const objectToString = Object.prototype.toString

export function toTypeString(value: unknown): string {
  return Object.prototype.toString.call(value)
}

export function toRawType(value: unknown): string {
  // extract "RawType" from strings like "[object RawType]"
  return toTypeString(value).slice(8, -1)
}

export function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve()
    }, ms)
  })
}
