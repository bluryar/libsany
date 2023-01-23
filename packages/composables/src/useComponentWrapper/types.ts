import type { MaybeComputedRef } from '@vueuse/core'
import type { AllowedComponentProps, Component, ComponentPublicInstance, DefineComponent, Events, ExtractPropTypes, VNodeProps } from 'vue'
import type { useComponentWrapper } from './index'

// type OnUpdateProps<T> = T extends Record<infer Key extends string, any>
//   ? Record<`onUpdate:${Key}`, (val: T[Key]) => any>
//   : T
export type MergeInsertions<T> = T extends object ? {
  [K in keyof T]: MergeInsertions<T[K]>;
} : T

export type DefineLooseProps<Props = Record<string, any>> = Partial<
  AllowedComponentProps & VNodeProps & Events & MergeInsertions<Omit<ExtractPropTypes<Props>, keyof ComponentPublicInstance>>
>

export interface UseComponentWrapperOptions<Props = Record<string, any>> {
  component: DefineComponent<Props, any, any> | Component<Props> | ({
    new(): {
      $props: DefineLooseProps<Props>
      [key: string]: any
    }
  })
  state?: MaybeComputedRef<Partial<Props>>
}
export type UseComponentWrapperReturn<Props = Record<string, any>> = ReturnType<typeof useComponentWrapper<Props>>
