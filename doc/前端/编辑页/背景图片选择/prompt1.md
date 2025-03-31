在视频编辑页 @EditPage.tsx 点击 “背景图片” 的item时候，弹出选择图片的浮层，浮层的样式参考 素材浮层，具体要求如下：
1. 浮层样式是从底部弹出，高度为屏幕的 3/4，点击浮层以外的地方会关闭浮层
2. 在浮层的顶部的有一个固定高度的 bar ，内容区域滑动的时候这个bar会始终保持显示在这里，bar的最左边显示浮层的标题为 "选择背景图片"，最右边有一个关闭按钮，点击后关闭浮层
3. 浮层的内容区，双列流展示，Item里展示 预览图 url（固定9:16比例的，要展示全），图片下面展示它的tag，包含ratio和size（要将字节数转成mb展示，例如 3.5M)。点选item则选中该图片，退出浮层，更新 EditPage 的选中的背景图片的字段 backgroundImage，具体说明如下：
EditPage 中的 backgroundImage 说明
BackgroundImageModel {
  url: string;  //更新对应的url
  backgroundId: string; //无需修改
  scaleType: string;  //无需修改
  name?: string; // 更新name，使用图片的文件名称
}

4. 进入浮层后，到 local 存储里去查找有没有数据缓存，如果有先加载缓存，然后同步发起get类型的接口 “/api/image/list” 获取数据，在此期间，顶部bar的 “选择背景图片” 的标题旁边显示一个转圈的loading，表示数据正在刷新中，数据回来后直接刷新数据；如果没有缓存，则在内容区内部显示加载中的样式，数据回来后加载UI，加载中的样式消失掉；在数据回来后每次都将数据缓存到 local 存储里。

## 接口请求

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

### 查询图片列表

#### 请求信息
- 接口路径：`GET /api/image/list`
- Content-Type: `application/json`

#### 查询参数
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| ratio | String | 否 | 按比例筛选，如："16:9"、"4:3" |
| resolutionWidth | Number | 否 | 按最小宽度筛选 |
| resolutionHeight | Number | 否 | 按最小高度筛选 |

#### 查询示例
```
# 查询所有图片
GET /api/image/list

# 查询16:9比例的图片
GET /api/image/list?ratio=16:9

# 查询宽度大于等于1920的图片
GET /api/image/list?resolutionWidth=1920

# 查询高度大于等于1080的图片
GET /api/image/list?resolutionHeight=1080

# 组合查询
GET /api/image/list?ratio=16:9&resolutionWidth=1920
```

#### 响应示例
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "images": [
      {
        "url": "http://localhost:5127/static/assets/db/backgroundimage/example1.jpg",
        "resolutionWidth": 1920,
        "resolutionHeight": 1080,
        "ratio": "16:9",
        "size": 1024000
      },
      {
        "url": "http://localhost:5127/static/assets/db/backgroundimage/example2.jpg",
        "resolutionWidth": 3840,
        "resolutionHeight": 2160,
        "ratio": "16:9",
        "size": 2048000
      }
    ]
  }
}
```

## 错误码说明

| 错误码 | 说明 |
|--------|------|
| 0 | 成功 |
| 1 | 失败（具体原因见 message） |