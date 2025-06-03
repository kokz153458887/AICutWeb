# 视频资料库 API 接口文档

## 概述

视频资料库API提供了对视频素材资料库的管理功能，包括创建、批量创建、查询等操作。

## 基本信息

- **基础URL**: `/api/material`
- **返回格式**: JSON
- **请求内容类型**: application/json

## 通用响应格式

所有API响应都遵循以下格式：

```json
{
  "code": 0,       // 0表示成功，1表示失败
  "message": "",   // 成功或错误信息
  "data": {}       // 响应数据，失败时为null
}
```

## API端点

###  获取所有资料库

- **URL**: `/api/material/list`
- **方法**: GET
- **描述**: 获取所有资料库记录，支持分页

#### 请求参数

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| page | Number | 否 | 页码，默认1 |
| limit | Number | 否 | 每页记录数，默认20，设置为-1时返回所有记录 |

#### 请求示例

```
GET /api/material/list?page=1&limit=20
```

#### 成功响应

```json
{
  "code": 0,
  "message": "获取资料库列表成功",
  "data": {
    "total": 30,
    "page": 1,
    "limit": 20,
    "hasMore": true,
    "data": [
      {
        "_id": "60d5ec68f682f34d9cbb1234",
        "name": "人物素材库",
        "url": "https://example.com/resources/materials/people/description.json",
        "fileName": "description.json",
        "type": "all",
        "previewUrl": "https://example.com/resources/materials/people/preview.mp4",
        "coverUrl": "https://example.com/resources/materials/people/cover.jpg",
        "nums": 120,
        "diskSize": 3145728000,
        "diskSizeMB": 3000,
        "updateTime": "2023-06-25T12:34:56.789Z",
        "createdAt": "2023-06-25T12:34:56.789Z",
        "updatedAt": "2023-06-25T12:34:56.789Z"
      },
      // ... 更多资料库记录
    ]
  }
}
```

#### 错误响应

```json
{
  "code": 1,
  "message": "获取所有资料库失败: 数据库连接错误",
  "data": null
}
```

## 数据模型

### MaterialLib

视频资料库模型定义：

| 字段名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| name | String | 是 | 资料库名称 |
| url | String | 是 | 描述文件位置（JSON文件） |
| fileName | String | 否 | 文件名 |
| type | String | 否 | 资料库类型，可选值：'only'或'all'，默认'all' |
| previewUrl | String | 否 | 预览视频地址 |
| coverUrl | String | 否 | 封面图地址 |
| nums | Number | 否 | 文件总数，默认0 |
| diskSize | Number | 否 | 磁盘占用空间（字节），默认0 |
| diskSizeMB | Number | 否 | 磁盘占用空间（MB），默认0 |
| updateTime | Date | 否 | 更新时间，自动生成 |
| createdAt | Date | 否 | 创建时间，自动生成 |
| updatedAt | Date | 否 | 最后更新时间，自动生成 |

## 注意事项

1. 资源URL在保存时会被转换为磁盘路径，在返回时会转换回URL格式
2. 批量创建时，即使部分记录失败，也会继续处理其他记录
3. 获取所有资料库时，设置 `limit=-1` 可以不分页获取所有记录
