现在需要开发首页的接口请求，首页的代码在 @Home.tsx 中，请根据以下要求来生成首页接口请求模块：
1. 进入首页后会请求服务端的接口，获取首页的内容
2. 接口地址为 '/api/home/getHomeData'
3. 请求类型：通过Get请求获取到JSON格式的数据
4. 包和类设计：接口相关的所有代码放到独立的子目录下
5. Mock的要求：通过使用 json-server 的方式来实现Mock，Mock的数据使用单独的JSON文件
6. 在首页页面里，显示接口返回回来的 data.content[0].text  的文本在屏幕正中间
7. 接口参数（示例）：{ topbar: 'recommend' }
8. 接口返回（示例）：
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
        ]
    }
}
