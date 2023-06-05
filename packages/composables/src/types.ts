import type {
  AllowedComponentProps, Events,
  ExtractPropTypes,
  VNodeProps,
} from 'vue'

type DefineProps<Props = Record<string, any>> = AllowedComponentProps & VNodeProps & Events & ExtractPropTypes<Props>
export type DefineLooseProps<Props = Record<string, any>> = Partial<DefineProps<Props>>
export type TryGetProps<Props extends Record<string, any>> = Pick<Props, '$props'> extends unknown | never | undefined | null ? Props : Props['$props']
