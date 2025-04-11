# 视频任务详情查询接口文档

## 接口概述

该接口用于根据视频生成任务ID(generateId)查询视频任务的详细信息，包括任务状态、配置信息、视频列表等。

## 接口信息

- **接口名称**：查询视频任务详情
- **请求方式**：GET
- **接口路径**：`/api/videotask/queryVideoTask`

## 请求参数

### 查询参数（Query Params）

| 参数名     | 类型     | 必填 | 说明                           |
| ---------- | -------- | ---- | ------------------------------ |
| generateId | string   | 是   | 视频生成任务的唯一标识符       |

### 请求示例

```
GET /api/videotask/queryVideoTask?generateId=abcde12345
```

## 响应参数

### 响应格式

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "generateId": "string",
    "title": "string",
    "text": "string",
    "createTime": "string",
    "updateTime": "string",
    "status": "string",
    "statusDetail": {
      "status": "string",
      "progress": 0,
      "current_step": "string"
    },
    "config": {
      // 视频配置信息，包含素材、样式、背景音乐等
    },
    "videolist": [
      {
        "coverImg": "string",
        "videoUrl": "string",
        "size": "string",
        "duration": "string"
      }
    ]
  }
}
```

### 字段说明

| 字段名                   | 类型     | 说明                                       |
| ------------------------ | -------- | ------------------------------------------ |
| code                     | number   | 状态码：0-成功，非0-失败                   |
| message                  | string   | 状态消息                                   |
| data                     | object   | 响应数据                                   |
| data.generateId          | string   | 视频生成任务ID                             |
| data.title               | string   | 视频标题                                   |
| data.text                | string   | 视频文本内容                               |
| data.createTime          | string   | 创建时间（格式化后的字符串）               |
| data.updateTime          | string   | 更新时间（格式化后的字符串）               |
| data.status              | string   | 任务状态文本描述，如"处理中"、"已完成"等   |
| data.statusDetail        | object   | 详细的状态信息                             |
| data.statusDetail.status | string   | 原始状态值：processing, queue, error, success |
| data.statusDetail.progress | number   | 处理进度，0-100                          |
| data.statusDetail.current_step | string   | 当前处理步骤                         |
| data.config              | object   | 视频生成配置，包含样式、素材等信息         |
| data.videolist           | array    | 生成的视频列表                             |
| data.videolist[].coverImg| string   | 视频封面图片URL                            |
| data.videolist[].videoUrl| string   | 视频文件URL                                |
| data.videolist[].size    | string   | 视频文件大小                               |
| data.videolist[].duration| string   | 视频时长                                   |

## 响应示例

### 成功响应

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "generateId": "abcde12345",
    "title": "演示视频",
    "text": "这是一个演示视频的文本内容",
    "createTime": "2023-7-15 14:30:45",
    "updateTime": "2023-7-15 14:35:22",
    "status": "已完成",
    "statusDetail": {
      "status": "success",
      "progress": 100,
      "current_step": "视频合成完成"
    },
    "config": {
      "style": {
        "ratio": "16:9",
        "resolution": "1920x1080",
        "styleName": "现代简约",
        "videoShowRatio": {
          "ratio": "全屏"
        }
      },
      "material": {
        "name": "演示素材",
        "materialID": "mat12345",
        "previewUrl": "http://example.com/static/materials/preview.jpg"
      }
    },
    "videolist": [
      {
        "coverImg": "http://example.com/static/videos/abcde12345/cover.jpg",
        "videoUrl": "http://example.com/static/videos/abcde12345/video.mp4",
        "size": "15.2MB",
        "duration": "00:01:30"
      }
    ]
  }
}
```

### 失败响应

```json
{
  "code": 1,
  "message": "generateId参数是必需的",
  "data": null
}
```

```json
{
  "code": 1,
  "message": "找不到ID为 abcde12345 的视频任务",
  "data": null
}
```

## 错误码说明

| 错误码 | 说明                  | HTTP状态码 |
| ------ | --------------------- | ---------- |
| 0      | 成功                  | 200        |
| 1      | 失败                  | 400/500    |

## 注意事项

1. generateId 必须是有效的任务ID，否则会返回错误
2. 资源URL（视频、封面等）已经转换为可直接访问的公共URL
3. 任务状态(status)字段已经转换为友好的中文描述
4. 时间字段(createTime, updateTime)已格式化为本地时间字符串
