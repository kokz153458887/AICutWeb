真实的实现 VideoSlicePage 页面数据加载，调用 list 接口，并实现分页加载
1. 进入页面，默认展示 “待录入” 的 tab，查询 视频解析列表结果接口  /video/parse/list?status=pending&page_size={page_size}&page_num={page_num}
2. 点击切换筛选TAB的时候，请求筛选接口。如果点选了 “全部” 则在查询的时候 status 不用传；否则根据 status字段映射来查询
3. 在列表数据里，对于解析失败的任务，在 item 卡片上增加一个重试按钮，点击后发起解析请求
4. 支持分页加载，一页20条数据，点击底部的 “加载更多” 的item时发起下一页的请求
5. 缓存每个TAB的数据到内存，避免每次切换TAB后的接口加载
6. 支持输入框的 “解析” 按钮，点击后发起解析请求

# 输入框解析
在用户点击 “解析” 按钮后，解析输入框里的文本，提取出里面的 URL 来，发起视频解析的接口，接口发起后弹出一个等待的对话框，在解析成功的情况下切换到 “待录入” tab下（如果当前不在 “待录入” tab的话），并刷新接口加载新数据；失败的情况下Toast提示错误原因。

```文本示例
5.35 复制打开抖音，看看【皮蛋瘦肉周的作品】啊对对对，我就是这种感觉# 中文说唱 # 女rap... https://v.douyin.com/XeUdyHcb830/ mDU:/ 11/09 Y@Z.zg 
```

## 解析接口 /video/parse
请求类型：post
参数：parse_url, 需要解析的URL

接口返回，示例如下
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "parse_url" : "https://v.douyin.com/XeUdyHcb830/",
    ""
  }
}
```



# 视频解析列表结果  /video/parse/list?status={status}&page_size={page_size}&page_num={page_num}
参数：
status： 查询对应的状态任务
page_size： 分页，一页的大小
page_num： 分页，页码

status字段： parsing, parse_failed, pending, recorded, abandoned
对应界面展示：
parsing -> 解析中
parse_failed -> 解析失败
pending -> 待录入
recorded -> 已录入
abandoned -> 已废弃
展示在列表卡片的状态标签上。

Item卡片上的文本展示逻辑：当 data.result[].status 为 pending 时候，展示 当 data.result[].text； 否则展示 data.result[].parse_url
Item卡片上增加：当 data.result[].status 为 pending 时候，展示 resolution 分辨率的信息到卡片（缩小展示），悬浮在图片右下角

最后一页的判断：data.totalPages 表示一共有的页数， data.pageNum 表示当前的页码，当 data.pageNum 大于或等于  data.totalPages 的时候代表已经到了页尾

返回结果：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "result": [
            {
                "id": "d1613d9b49be532f77c3dfe2e93fbb8aae93cd16298284edeafb09664a514684-1748578225652",
                "parse_url": "https://www.douyin.com/video/7481539816778239292",
                "status": "parse_failed",
                "file_urls": [],
                "video_url": "",
                "preview_image": "",
                "text": "",
                "createTime": "2025-05-30T04:10:27.266Z",
                "updateAt": "2025-05-30T04:10:32.407Z"
            },
             {
                "id": "d1613d9b49be532f77c3dfe2e93fbb8aae93cd16298284edeafb09664a514684-1748578436269",
                "parse_url": "https://www.douyin.com/video/7481539816778239292",
                "status": "pending",
                "video_info": {
                    "resolution": "1080x1920",
                    "file_size_bytes": 4345516,
                    "file_duration": 33.1,
                    "language": "zh",
                    "platform": "douyin"
                },
                "video_url": "http://192.168.3.17:5127/static/output/parse_video/d1613d9b49be532f77c3dfe2e93fbb8aae93cd16298284edeafb09664a514684-1748578436269/video.mp4",
                "preview_image": "http://192.168.3.17:5127/static/output/parse_video/d1613d9b49be532f77c3dfe2e93fbb8aae93cd16298284edeafb09664a514684-1748578436269/preview.jpg",
                "text": "初见他门不息江西啊 他紧摘一朵桃花 盖院橙色得入虾 鸟的芳菲如星长 抛堤壁雨下凌我腾 遥遥相思傾芳香 闲置一沙城市花 眼泪无声 渲染花中的芳芽"
            }
        ],
        "total": 4,
        "pageNum": "2",
        "pageSize": "5",
        "totalPages": 1
    }
}
```