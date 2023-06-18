import { type Service, type Options as VueRequestOptions, useRequest } from 'vue-request';
import type { FormInst, FormItemProps, FormProps, GridProps } from 'naive-ui';
import { NForm, NGrid } from 'naive-ui';
import { createHOC } from '@bluryar/composables';
import { type Ref, type Slot, createVNode, defineComponent, ref, shallowRef } from 'vue-demi';
import { set } from 'lodash-es';
import { object } from 'vue-types';

interface Items extends FormItemProps {
  /**
   * @desc - 表单项的默认值, 校验时至少需要将属性设置成undefined
   * @default undefined
   */
  defaultValue?: unknown;

  render: (props: FormItemProps) => Slot;
}

export interface UseNFormOptions<Params = object, Response = any> {
  /** @default ()=>Promise.resolve() */
  service?: Service<Response, [params: Params]>;

  /** @default { manual: true } */
  requestOptions?: VueRequestOptions<Response, [params: Params]>;

  /** @default [] */
  formItems?: Items[];

  /** @default {} */
  formProps?: Partial<FormProps>;

  /** @default {} */
  gridProps?: Partial<GridProps>;

  /** @default false */
  shallow?: boolean;
}

const UseNForm = defineComponent({
  name: 'UseNForm',
  inheritAttrs: !!0,
  props: {
    formProps: object<FormProps>().def({}),
    gridProps: object<GridProps>().def({}),
  },
  setup(_, ctx) {
    const refInst = shallowRef<null | FormInst>(null);

    ctx.expose({
      refInst,
    });

    return {
      setInst(val: any) {
        refInst.value = val;
      },
    };
  },
  render() {
    return createVNode(
      NForm,
      {
        ...this.formProps,
        ref: this.setInst,
      },
      () => createVNode(NGrid, this.gridProps, this.$slots),
    );
  },
});

export function useNForm<Params = Record<string, any>, Response = any>(options: UseNFormOptions<Params, Response>) {
  type RequestOptions = (typeof options)['requestOptions'];
  type ServiceFn = Service<Response, [params: Params]>;

  const {
    service = () => Promise.resolve(),
    requestOptions = { manual: !!1 },
    formItems = [],
    formProps = {},
    gridProps = {},
    shallow = false,
  } = options;

  const formData = (shallow ? shallowRef : ref)<Params>({} as any);

  const mergedRequestOptions: RequestOptions = {
    ...{ manual: !!1 },
    ...requestOptions,
  };

  initFormData(formItems, formData);

  const useRequestReturns = useRequest(service as ServiceFn, mergedRequestOptions);

  const createHOCReturns = createHOC({
    component: UseNForm,
    props: () => ({
      formProps,
      gridProps,
    }),
  });

  return {};
}

function initFormData<Params = object>(formItems: Items[], formData: Ref<Params>) {
  formItems.forEach((item) => {
    const { path, defaultValue } = item;
    if (path) set(formData.value as any, path, defaultValue);
  });
}
