我希望借助 edit 页面的能力，来同时支持 模版的生成 和 视频任务的生成，核心是根据 urlParams 参数来决定调用哪个API，以下是详细说明：
1. urlParams 的参数支持 apimodel 字段，参数有 generate 和 createConfig 两种参数
2. 当 apimodel = generate 时，调用 service.ts 的 @generateVideo 方法，使用 edit.generate 的 api，这种情况下 handleGenerate 里不验证文案的输入，文案可为空
3. 当 apimodel = createConfig 时，调用 service.ts 的 @createConfig 方法，使用 edit.submit 的 api，这种情况下 handleGenerate 里需要验证文案的输入，文案不可为空

新支持的 edit.generate api：
代码功能与 @generateVideo 是一样的，仅仅是 api 名称不一样