优化 首页tab 内的 loading  和 error 。
1. 美化loading样式，中文 “加载中”，样式居中，转圈，替换原有的内容区块
2. 美化 error 样式，中文 “加载失败”，样式居中，点击重试；重试后当前的界面显示 loading 样式；替换原有的内容区块
3. 重试后，接口成功的情况下，刷新界面，隐藏 loading 和  error,显示内容区块；失败的情况下，依然显示 error 样式。