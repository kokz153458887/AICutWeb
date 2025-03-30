在视频编辑页 @EditPage.tsx 点击 “视频风格” 的item时候，弹出选择音乐的浮层，浮层的样式参考 素材浮层，具体要求如下：
1. 浮层样式是从底部弹出，高度为屏幕的 3/4，点击浮层以外的地方会关闭浮层
2. 在浮层的顶部的有一个固定高度的 bar ，内容区域滑动的时候这个bar会始终保持显示在这里，bar的最左边显示浮层的标题为 "选择视频风格"，最右边有一个关闭按钮，点击后关闭浮层
3. 浮层的内容区，双列流展示，Item里展示 预览图 previewUrl（9:16比例的，要展示全）、styleName 风格名称 。点选item则选中该风格，退出浮层，更新 EditPage 的选中的视频风格数据（字段 style）。
5. 进入浮层后，到 local 存储里去查找有没有数据缓存，如果有先加载缓存，然后同步发起get类型的接口 “/api/videostyle/list” 获取数据，在此期间，顶部bar的 “选择视频风格” 的标题旁边显示一个转圈的loading，表示数据正在刷新中，数据回来后与本地缓存做对比，如果数据一样就不刷新了，不一样则刷新数据；如果没有缓存，则在内容区内部显示加载中的样式，数据回来后加载UI，加载中的样式消失掉；在数据回来后每次都将数据缓存到 local 存储里。

## 接口请求

## 基础信息

- 基础URL: `/api/videostyle`
- 响应格式: JSON
- 统一响应结构:
  ```json
  {
    "code": 0,       // 状态码，0表示成功，非0表示失败
    "message": "",   // 响应消息
    "data": null     // 响应数据，根据接口不同而变化
  }
  ```

## 接口列表

### 获取所有视频风格

获取系统中所有可用的视频风格。

- **URL**: `/list`
- **方法**: `GET`
- **参数**: 无
- **成功响应**:
  ```json
  {
    "code": 0,
    "message": "获取视频风格列表成功",
    "data": [
      {
        "_id": "6123456789abcdef12345678",
        "styleName": "竖屏视频风格",
        "ratio": "9:16",
        "resolution": "1080P",
        "videoShowRatio": {
          "ratio": "1:1",
          "cut_style": "height"
        },
        "font": {
          "voice_font_style": {
            "font_size": 90,
            "min_font_size": 60,
            "max_line": 2,
            "max_line_chars": 12,
            "auto_scale": true,
            "color": "white",
            "stroke_color": "black",
            "font_weight": "bold",
            "stroke_width": 5.0,
            "y_position": 1550,
            "margin_left": 0,
            "margin_right": 0,
            "alignParent": "top"
          },
          "title_font_style": {
            "font_size": 110,
            "min_font_size": 70,
            "max_line_chars": 10,
            "max_line": 1,
            "auto_scale": true,
            "color": "black",
            "font_weight": "bold",
            "stroke_color": "white",
            "stroke_width": 5.0,
            "y_position": 250,
            "margin_left": 0,
            "margin_right": 0,
            "alignParent": "top",
            "overflow_char": ""
          }
        },
        "previewUrl": "http://localhost:5127/static/styles/portrait.jpg",
        "updateTime": "2023-06-01T08:00:00.000Z",
        "createdAt": "2023-06-01T08:00:00.000Z",
        "updatedAt": "2023-06-01T08:00:00.000Z"
      },
      // ... 更多风格
    ]
  }
  ```
- **错误响应**:
  ```json
  {
    "code": 1,
    "message": "获取视频风格列表失败: 具体错误信息",
    "data": null
  }
  ```

  {
    "code": 0,
    "message": "获取视频风格列表成功",
    "data": [
        {
            "_id": "67e886aa174b9479c2355e80",
            "styleName": "1-1-cut_style_portrait",
            "ratio": "9:16",
            "resolution": "1080P",
            "videoShowRatio": {
                "ratio": "1:1",
                "cut_style": "height"
            },
            "font": {
                "voice_font_style": {
                    "font_size": 90,
                    "min_font_size": 60,
                    "max_line": 2,
                    "max_line_chars": 12,
                    "auto_scale": true,
                    "color": "white",
                    "stroke_color": "black",
                    "font_weight": "bold",
                    "stroke_width": 5,
                    "y_position": 1550,
                    "margin_left": 0,
                    "margin_right": 0,
                    "alignParent": "top",
                    "overflow_char": ""
                },
                "title_font_style": {
                    "font_size": 110,
                    "min_font_size": 70,
                    "max_line": 1,
                    "max_line_chars": 10,
                    "auto_scale": true,
                    "color": "black",
                    "stroke_color": "white",
                    "font_weight": "bold",
                    "stroke_width": 5,
                    "y_position": 250,
                    "margin_left": 0,
                    "margin_right": 0,
                    "alignParent": "top",
                    "overflow_char": ""
                }
            },
            "previewUrl": "",
            "updateTime": "2025-03-29T23:47:54.079Z",
            "createdAt": "2025-03-29T23:47:54.080Z",
            "updatedAt": "2025-03-29T23:47:54.080Z"
        }
    ]
  }
  