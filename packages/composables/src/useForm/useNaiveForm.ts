import type { UseFormOptions } from './types'

export interface UseNaiveFormOptions<Params = {}, Response = {}> extends UseFormOptions<Params, Response> {}

export function useNaiveForm<Params = {}, Response = {}>(_options: UseNaiveFormOptions<Params, Response>) {
  return {
    // ...options,
  }
}
