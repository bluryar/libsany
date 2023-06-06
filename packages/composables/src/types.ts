import type {
  AllowedComponentProps, ComponentOptions, DefineComponent, Events,
  ExtractPropTypes,
  MaybeRefOrGetter,
  Plugin,
  VNodeProps,
  Component as VueComponent,
} from 'vue'

export type DefineProps<Props = Record<string, any>> = AllowedComponentProps & VNodeProps & Events & Props
export type DefineLooseProps<Props = Record<string, any>> = Partial<DefineProps<Props>>
export type TryGetProps<Props extends Record<string, any>> = Pick<Props, '$props'> extends unknown | never | undefined | null ? Props : Props['$props']

export type Component<Props extends Record<string, any>> = Exclude<VueComponent<Props, any, any, any, any>, ComponentOptions<Props, any, any, any, any>> | DefineComponent<Props, any, any, any, any>

export type SFCWithInstall<T> = (T & Plugin) | T

export type ComponentProps<Props = {}> = MaybeRefOrGetter<Partial<ExtractPropTypes<DefineProps<Props>>> & { [key: string]: any }>
