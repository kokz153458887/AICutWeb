点击 VideoSlicePage 页面提交的时候，发起 addMaterialVideo 接口请求

## 发起接口请求 /video/parse/addMaterialVideo

## 请求类型
post

## 请求体
```json
{
    "id": "parse_url.id",
    "parse_url": "video_url.parse_url",
    "video_url": "ParseTaskDetail.video_url",
    "text": "taskData.text",
    "needRemoveSubtitle": true, //是否移除字幕
    "materialUrl": "MaterialLibItem.url",
    "materialId": "MaterialLibItem._id",
    "type": "MaterialLibItem.contentType", 
    "subtype": "MaterialLibItem.contentSubtype",  
    "crop": {
        "cropStartX": 0,
        "cropStartY": 100,
        "cropEndX": -1, //-1表示原视频的宽度
        "cropEndY": 900  //-1表示原视频的高度
    },
    "clips": [
        {
            "name": "VideoClipItem.title", 
            "folder" : "VideoClipItem.folder",
            "beginTime": "VideoClipItem.startTime ，格式：00:00:00.000",
            "endTime": "VideoClipItem.endTime ，格式：00:00:00.000",
            "text": "VideoClipItem.text"
        }
    ]
}
```


## 接口返回
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "15add8be9b664a860a617e60516b000926eb79fbd1e7eb31070bf331f0fdce1a-1748595708731",
    "message": "处理中，请等待"
  }
}
```
