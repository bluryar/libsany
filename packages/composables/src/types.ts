/**
 * @fileoverview - 导出给包外使用的类型，这里通常导出与Vue组件Props、Emits、Slots相关的类型
 */

import type {
  AllowedComponentProps,
  ComponentCustomProps,
  DefineComponent,
  EmitsOptions,
  Events,
  ExtractPropTypes,
  FunctionalComponent,
  ObjectEmitsOptions,
  Plugin,
  VNodeProps,
} from 'vue'

// never 是TS内唯一的兜底类型， 它是任何类型的子类型， 所以我们把它包裹在 [] 中， 使它不再是任何类型的子类型
export type NotNever<T = {}> = [T] extends [never] ? {} : T;

export type PublicProps = VNodeProps & AllowedComponentProps & ComponentCustomProps;

/** 将一些默认的attrs看作props */
export type DefineExternalProps<Props = Record<string, any>> = PublicProps & Partial<Events> & Props;

export type EmitsToProps<T extends EmitsOptions> = T extends string[]
  ? {
      [K in string & `on${Capitalize<T[number]>}`]?: (...args: any[]) => any;
    }
  : T extends ObjectEmitsOptions
  ? {
      [K in string & `on${Capitalize<string & keyof T>}`]?: K extends `on${infer C}`
        ? T[Uncapitalize<C>] extends null
          ? (...args: any[]) => any
          : (...args: T[Uncapitalize<C>] extends (...args: infer P) => any ? P : never) => any
        : never;
    }
  : {};

export type ComponentConstructor = abstract new (...args: any) => any;

// type DefineComponent<
//   PropsOrPropOptions = {},
//   RawBindings = {},
//   D = {},
//   C extends ComputedOptions = ComputedOptions,
//   M extends MethodOptions = MethodOptions,
//   Mixin extends ComponentOptionsMixin = ComponentOptionsMixin,
//   Extends extends ComponentOptionsMixin = ComponentOptionsMixin,
//   E extends EmitsOptions = {},
//   EE extends string = string,
//   PP = PublicProps,
//   Props = ResolveProps<PropsOrPropOptions, E>,
//   Defaults = ExtractDefaultPropTypes<PropsOrPropOptions>,
//   S extends SlotsType = {}
// >;

export type WithSlotDefineComponent<
  Props,
  Emits extends EmitsOptions = {},
  Slots extends Record<string, any> = any,
> = DefineComponent<Props, any, any, any, any, any, any, Emits, any, any, any, any, Slots> &
  (new () => {
    $slots: any;
  });

export type SFCWithInstall<T> = (T & Plugin) | T;
export type ComponentTypeRaw = ComponentConstructor | WithSlotDefineComponent<any> | FunctionalComponent<any, any, any>;
export type ComponentType = SFCWithInstall<ComponentTypeRaw>;

/**
 * 从组件处获取props的类型
 */
export type GetComponentProps<Com extends ComponentType> = Com extends DefineComponent<infer Props, any, any>
  ? ExtractPropTypes<Props>
  : Com extends FunctionalComponent<infer Props>
  ? Props
  : Com extends WithSlotDefineComponent<infer Props>
  ? ExtractPropTypes<Props>
  : never;

/**
 * 从组件处获取emits的类型
 */
export type GetComponentEmits<Com extends ComponentType> = Com extends DefineComponent<
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  infer Emits,
  any,
  PublicProps,
  any,
  any,
  any
>
  ? EmitsToProps<Emits>
  : Com extends FunctionalComponent<any, infer Emits>
  ? EmitsToProps<Emits>
  : never;

/**
 * 从组件处获取slots的类型
 */
export type GetComponentSlots<Com extends ComponentType> = Com extends DefineComponent<
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  infer Slots
>
  ? Slots
  : Com extends FunctionalComponent<any, any, infer Slots>
  ? Slots
  : never;

export type PickLowerCaseProps<T = {}> = {
  [K in keyof T]: K extends `on${infer C}` ? (C extends Capitalize<C> ? never : K) : K;
}[keyof T];

/** 补充可以转换为双向绑定的props的props声明 */
export type TransformPropsToEmits<Props = {}> = Props extends {}
  ? {
      [K in keyof Pick<Props, PickLowerCaseProps<Props>> as `onUpdate:${K & string}`]+?: (val: Props[K]) => any;
    }
  : Props;

/**
 * 核心，这个类型仅仅取了组件有明确声明的props，以及补充一些必要的props类型，如需使用最准确的props，请使用 `GetComponentProps`
 *
 * @see GetComponentProps - 进一步收窄 `props` 类型
 * */
export type GetComponentPropsAndEmits<Com extends ComponentType> = NotNever<GetComponentProps<Com>> &
  NotNever<GetComponentEmits<Com>> &
  TransformPropsToEmits<NotNever<GetComponentProps<Com>>>;

/**
 * 核心，如果不是有明确的需求，否则都应该使用这个表示组件的props。
 *
 * @see GetComponentProps - 进一步收窄 `props` 类型
 * @see GetComponentPropsAndEmits - 进一步收窄 `props` 类型
 */
export type ComponentExternalProps<Com extends ComponentType> = DefineExternalProps<GetComponentPropsAndEmits<Com>>;
