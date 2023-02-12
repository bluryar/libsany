# @bluryar/composables - useForm

[[toc]]

## 功能

表单相关的组合式API (以下简称 *"hook"* ) 函数, 提供两个基本能力:

1. [🔗 网络请求](#网络请求)
2. [🚔 表单校验](#表单校验)

由这两个功能将会为表单提供:

- 创建请求参数对象 (formParams)
- 实时监听 `formParams` 哪个字段被修改
- 实时校验表单是否通过校验规则

## 定位

由于这个 *hook* 是独立与UI组件的, 因此这个Hook更多的是作为一个 *中间hook* 的存在, 不耦合任何UI的API, 而是纯粹的操作表单数据.

如果需要UI相关的交互, 更加推荐基于此 *hook* , 组合其他逻辑封装出需要的 *hook*.

## 用法
```html
<script setup lang="ts">
import {useForm } from '@bluryar/composables'

class Params {
  foo = 1
  bar = 'hello world'
}

const { formParams, submit, rules } = useForm({
  service: (params?: Params) => Promise.resolve({ code:0, message: '提交成功' }),
  defaultParams: { ...new Params(), ...{ foo: 2 } },
  rules: () => ({
    foo: [
      //rule1
      //rule2
    ],
    bar: /* rule */{

    }
  }),
  rulesTransformer: (rule) => {}
})

</script>

<template>
  <NForm :model="formParams" :rules="rules">
    <NFormItem path="foo" key="foo">
      <NInputNumber v-model:value="formParams.foo"></NInputNumber>
    </NFormItem>

    <NFormItem path="bar" key="bar">
      <NInput v-model:value="formParams.bar"></NInput>
    </NFormItem>

    <NFormItem>
      <NButton @click="submit">提交</NButton>
    </NFormItem>
  </NForm>
</template>
```


## 网络请求

我们的网络请求基于 [vue-request][vue-request] 实现的, 因此我们会将这个函数的执行结果原样返回, 但是需要注意两点:

1. [`service`的类型][useRequest#service]需要于表单的参数形式结合: `(params?: ParamsType) => Promise<any>`
2. useRequest的 [`options.defaultParams`][useRequest#options.defaultParams] 在传给 `useRequest` 时被我们**手动剔除**了
    - 这个参数的类型被定义为 `defaultParams: Params` , 只会被 `useForm` 使用
    - `defaultParams` 的作用被重新定义为: 在表单初始化时提供默认的参数 ( 因为表单组件一般都要求字段显示定义, 尽管值`undefined` ).

### 创建表单参数和请求参数

我们会在hook实例化的时候创建两个参数对象, 表单参数对象 ( formParams ) 和 请求参数对象 ( requestParams ).

这样, 你就无需在每次创建定义组件的时候手动维护这两个对象.

> 对于网络请求, 他的修改应该是只发生在请求前, 而无需实时变化, 但是对于表单组件, `v-model:value` 一般需要双向绑定.

我们不会主动将 `requestParams` 返回给使用者, 因为我认为他是一个内部状态, 但是你可以从 `useRequest` 的返回值中获取.

**值得注意的是**, 你需要在参数中传入他的 **默认参数 (defaultParams)**, 我们会从请求方法 `service` 中推断出类型, 协助你完成表单参数的初始化.


## 表单校验

> 实现需要明确一点: 表单校验本质是参数校验, 与UI组件是无关的.

我们在构思表单校验的时候, 想过三种参数类型:

1. [自定义校验器 - `type rule = () => true | string`](#1.自定义校验器)
2. [ajv - 跨语言表单校验库][ajv]
3. [async-validator - 组件库常用校验库][async-validator]

### 1.自定义校验器

这是自定义的校验, 每个规则都都是一个函数, 要么返回 `true` 要么返回字符串, 字符串表示校验错误, 字符串将交给UI组件渲染.

_examples_
```ts
const { rules } = useForm({
  // service:
  rules: () => ({
    foo: (val: any) => isNumber(val) || '请传入数字'
  })
})
```

### 2.ajv - 跨语言表单校验库

```js
const ajv = new Ajv({ removeAdditional: true })
const schema = {
  additionalProperties: false,
  properties: {
    foo: { type: 'number' },
    bar: {
      additionalProperties: { type: 'number' },
      properties: {
        baz: { type: 'string' }
      }
    }
  }
}

const data = {
  foo: 0,
  additional1: 1, // 将会被移除; `additionalProperties` == false
  bar: {
    baz: 'abc',
    additional2: 2 // 不会被移除; `additionalProperties` != false
  },
}

const validate = ajv.compile(schema)

console.log(validate(data)) // true
```

ajv是一个开源的校验库, 它通过解析 [`json-schema`][json-schema] 完成对参数的校验, 这种方式对于使用者而言看上去是最复杂的, 因为 json-schema 毕竟是JSON, 描述某个东西的时候会定义很多字段去表述.

但是, 实际上这种方式是最有潜力作为 `low-code` 表单校验的待选方案的, 因为 json-schema 本质上是对接口参数的定义, 大多数静态语言 (Typescript, JAVA, etc ) 都可以生成这样的描述.

我们假设后端在使用Spring-boot作为后端开发框架, 那么在他们定义 `DTO` 的时候, 可以通过一些开源的包给 `DTO` 的成员变量打上注解:

```java
import com.example.xxx.JsonSchema.TestDTO;

class TestDTO {
  @IsString( lengths = 10, message: '该字符串长度不低于10' )
  public String foo;
}
```

而前端则可以通过工具解析这样的后端生成的 `json`, 然后在发起请求前进行校验 (可以封装在请求方法中) , 而接口的URL\Methods\Params等信息也可以通过Swagger去生成

因此, 从概念上分析, 后端假如遵循这些 `json-schema` 要求的传参和定义方式, 前端理论上是无需编写 **接口请求** 和 **参数校验** 代码的.

> `swagger` 本身就是一种 `json-schema`, swagger 官方为 JavaScript 和 JAVA 都提供了 `swagger-parser`, swagger本身也支持参数校验的.


3. async-validator - 组件库常用校验库

相较于 ajv , async-validator 则是前端更加通用的选择, `naive-ui` \ `element-ui` \ `ant-design` 都选择使用这种方案进行表单的校验.

在传参方式上, 他们通常会新增 `trigger` 字段描述校验触发的时机, 因为某些需求是要求该字段在输入时, 实时校验. 某些组件库也会修改 `validate` 配置项, 主要体现在 `validate` 的返回值.


### 方案选择

除了以上方案, 还有 yup, joi, zod, etc... 各种校验的库层出不穷, 回顾我们的 [hook 定位](#定位), 我们觉得采用第一种最简单的配置, 上层hook需要自己定义所需的结构, 然后解析成 `type Rule = (value: unknown) => boolean || message`.


[vue-request]:https://next.cn.attojs.org/guide/introduction.html#%E4%B8%BA%E4%BB%80%E4%B9%88%E9%80%89%E6%8B%A9-vuerequest
[useRequest#service]: https://next.cn.attojs.org/api/#service
[useRequest#options.defaultParams]: https://next.cn.attojs.org/api/#defaultparams
[ajv]:https://ajv.js.org/
[async-validator]:https://github.com/yiminghe/async-validator
[json-schema]:https://json-schema.apifox.cn/
