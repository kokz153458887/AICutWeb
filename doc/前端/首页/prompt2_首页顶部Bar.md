现在需要开发首页的内容，首页的代码在 @Home.tsx 中，请根据效果图的样式来生成首页代码，以下是首页样式的核心要求：
1. TopBar：推荐、常用 两个Tab，支持多个TAB点击后的切换，默认选中推荐。可以通过URL参数的变化来加载首页、我的页面。参数key为 'homebar'，值为 'recommend' 或 'useful'。
2. 顶部Bar可以根据参数来构建更多的Tab，接收 ID（topbar：recommend、useful）、text（显示在UI上的名称）、KEY（用于做接口请求的参数，服务端会根据这个key来返回对应的数据内容）
3. 顶部TAB点击切换后，首页的页面容器内的内容会发生变化，但页面不会发生刷新，保障良好的性能体验。
4. TopBar里的页面：无论是那个tabbar都是用相同的UI容器渲染，只是传递的数据不一样，我们构建一个可以本地mock服务端的接口，来模拟数据的返回，接口地址为 '/api/home/getHomeData'
5. 接口参数（示例）：{ topbar: 'recommend' }
6. 接口返回（示例）：
{
    "status" : "success",
    "msg" : "success",
    "data" : {
        "homobar" : [
            {
                "id" : "recommend",
                "text" : "推荐"
            },
            {
                "id" : "useful",
                "text" : "常用"
            }
        ],
        "content" : [
            {
                "styleId" : "918234",
                "styleName" : "<风格描述><示例:横屏-漫剪-龙猫-治愈系>",
                "text" : "<文案内容><示例：这可能比较长的一段话>",
                "cover": "<图片地址><实例:http://URL_ADDRESS>",
                "stars": "<星星数><示例：2178>"
            }
    }
}
