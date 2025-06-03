首页接口协议需要调整，对 content 的字段做出扩充和调整。

原协议内容：
"content" : [
    {
        "styleId" : "918234",
        "styleName" : "<风格描述><示例:横屏-漫剪-龙猫-治愈系>",
        "text" : "<文案内容><示例：这可能比较长的一段话>",
        "cover": "<图片地址><实例:http://URL_ADDRESS>",
        "stars": "<星星数><示例：2178>"
    }
]

修改为：
"content": [
    {
        "_id": "67e0dd1a15a3ba61cd979b34",
        "styleId": "67e0dd1a15a3ba61cd979b30",
        "styleName": "横屏治愈系漫剪",
        "title": "测试标题更新5555",
        "text": "测试文案内容更新5555",
        "cover": "/data/new_cover1.jpg11",
        "stars": 1001,
        "ratio": "9:16",
        "coverRatio": "9:16",
        "createdAt": "2025-03-24T04:18:34.319Z",
        "updatedAt": "2025-03-24T05:49:29.945Z",
        "videoUrl": "/data/videos/test_video_update.mp4"
    }
]

完整示例：
{
    "status": "success",
    "msg": "success",
    "data": {
        "topbar": [
            {
                "id": "recommend",
                "text": "推荐"
            },
            {
                "id": "useful",
                "text": "热门"
            }
        ],
        "content": [
            {
                "_id": "67e0dd1a15a3ba61cd979b34",
                "styleId": "67e0dd1a15a3ba61cd979b30",
                "styleName": "横屏治愈系漫剪",
                "title": "测试标题更新5555",
                "text": "测试文案内容更新5555",
                "cover": "/data/new_cover1.jpg11",
                "stars": 1001,
                "ratio": "9:16",
                "coverRatio": "9:16",
                "createdAt": "2025-03-24T04:18:34.319Z",
                "updatedAt": "2025-03-24T05:49:29.945Z",
                "videoUrl": "/data/videos/test_video_update.mp4"
            }
        ]
    }
}