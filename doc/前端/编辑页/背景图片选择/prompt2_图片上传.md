在 @ImageSelectModal.tsx 的 浮层顶部bar 的关闭按钮右边固定一个编辑图标的按钮，点击后支持图片文件的上传，让用户选择本地的图片文件，选择文件后开始进行图片上传的接口，再次期间屏幕中间一直有一个转圈的loading框，提示用户 “文件上传中，请稍后...”

## 接口概述
## 基础信息
- 基础路径：`/api/image`
- 响应格式：
```json
{
  "code": 0,       // 状态码：0-成功，非0-失败
  "message": "",   // 响应消息
  "data": null     // 响应数据
}
```

## 数据模型

### Image 模型
```json
{
  "url": "/assets/db/backgroundimage/example.jpg",  // 图片URL
  "resolutionWidth": 1920,   // 分辨率-宽度
  "resolutionHeight": 1080,  // 分辨率-高度
  "ratio": "16:9",          // 宽高比
  "size": 1024000          // 文件大小（字节）
}
```

## 接口详情

### 1. 上传图片

#### 请求信息
- 接口路径：`POST /api/image/upload`
- Content-Type: `multipart/form-data`

#### 请求参数
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| file | File | 是 | 图片文件，支持常见图片格式（jpg、png等） |

#### 限制条件
- 文件大小上限：10MB
- 支持的图片格式：jpg、jpeg、png、gif、webp

#### 响应示例
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "image": {
      "url": "http://localhost:5127/static/assets/db/backgroundimage/example.jpg",
      "resolutionWidth": 1920,
      "resolutionHeight": 1080,
      "ratio": "16:9",
      "size": 1024000
    }
  }
}
```