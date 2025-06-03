在 @StyleSelectModal.tsx 风格浮层的标题 “选择视频风格” 的右边固定一个编辑图标的按钮，点击后弹出一个浮层，可以在浮层里编辑视频风格的参数，这个浮层是一个表单来呈现，字段名和输入框可以编辑风格字段，在这个入口下跳转的浮层在提交后操作的是风格创建接口。
另外，在风格item的左上角有一个编辑图标也能跳转到风格字段编辑的弹框里，把item里的字段带到浮层里去，在这个入口下浮层确认参数后操作的是风格更新接口。

可以编辑以下字段，这些字段不用做任何输入限制，都是最普通的字符串,保障功能实现的简洁，注意字体里有标题字体和语音文案字体两种。
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
}

## 基础接口信息

- 基础URL: `/api/videostyle`
- 响应格式: JSON
- 统一响应结构:
  ```json
  {
    "code": 0,       // 状态码，0表示成功，非0表示失败
    "message": "",   // 响应消息
    "data": null     // 响应数据，根据接口不同而变化
  }

### 创建视频风格

创建新的视频风格。

- **URL**: `/create`
- **方法**: `POST`
- **请求体**:
  ```json
  {
    "styleName": "新视频风格",
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
    }
  }
  ```
- **成功响应**:
  ```json
  {
    "code": 0,
    "message": "创建视频风格成功",
    "data": {
      "_id": "6123456789abcdef12345678",
      "styleName": "新视频风格",
      // ... 其他字段
    }
  }
  ```
- **错误响应**:
  ```json
  {
    "code": 1,
    "message": "创建视频风格失败: 具体错误信息",
    "data": null
  }
  ```

### 更新视频风格

更新现有的视频风格。

- **URL**: `/:id`
- **方法**: `PUT`
- **参数**:
  - `id` (必需，路径参数): 视频风格ID
- **请求示例**: `PUT /api/videostyle/6123456789abcdef12345678`
- **请求体**:
  ```json
  {
    "styleName": "更新后的视频风格",
    "ratio": "9:16",
    "resolution": "1080P",
    "videoShowRatio": {
      "ratio": "1:1",
      "cut_style": "height"
    },
    "font": {
      "voice_font_style": {
        "font_size": 95,
        "min_font_size": 65,
        // ... 其他字段
      },
      "title_font_style": {
        "font_size": 115,
        "min_font_size": 75,
        // ... 其他字段
      }
    }
  }
  ```
- **成功响应**:
  ```json
  {
    "code": 0,
    "message": "更新视频风格成功",
    "data": {
      "_id": "6123456789abcdef12345678",
      "styleName": "更新后的视频风格",
      // ... 更新后的其他字段
    }
  }
  ```