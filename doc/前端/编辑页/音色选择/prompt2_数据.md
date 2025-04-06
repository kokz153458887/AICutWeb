
# 音色查询接口
域名：http://localhost:8100/
API地址：api/voice/query
完整示例：http://localhost:8100/api/voice/query

## 接口参数
Get请求

### 参数：id 
例如：fav、hot、man、woman、boy 等字符串，标识需要请求的数据的ID

### 参数： pageSize
一页多少个ITEM，默认100个

### 参数： pageIndex
请求第几页数据

## 接口返回
### pages 分页信息
hasMore： 是否有更多的翻页数据
pageNum： 当前第几页
pageSize： 一页有多少个
total： 一共有多少条数据

### topbar 顶部Bar信息
id: 顶部Bar的id
text： 文本

### content 数据内容


{
    "status": "success",
    "msg": "success",
    "data": {
        "pages": {
            "pageNum": 1,
            "pageSize": 30,
            "total": 100,
            "hasMore": true
        }
        "topbar": [
            {
                "id": "fav",
                "text": "收藏"
            },
            {
                "id": "useful",
                "text": "热门"
            },
            {
                "id": "other",
                "text": "其他"
            },
            {
                "id": "jieshuo",
                "text": "解说"
            }
        ],
        "content": [
            {
                "voiceCode": "aliyun_longchen_龙臣",
                "voicer": "龙臣",
                "avatar": "assets\image\1.jpg"
                "speech": {
                    "text": "让我为您讲述这部精彩的影片",
                    "url": "assets\audio\youdao\youdao_shulongyeye_龙族的智慧需要传承。.mp3"
                }
            }
        ]
    }
}