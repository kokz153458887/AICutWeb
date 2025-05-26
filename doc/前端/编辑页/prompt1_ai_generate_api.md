需要实现视频生成的接口，对接前端的接口请求，转接到 服务端的AI接口请求，让AI接口来完成真正的视频生成动作，以下是具体的要求.

# 接口 /ai/generate

## 请求类型
post

## 请求体
{
    "config": {
        "title": "测试文案内容更新55...",
        "content": {
            "text": "测试文案内容更新5555",
            "splitType": "normal1111",
            "volume": 2
        },
        "backgroundMusic": {
            "name": "轻音乐-1",
            "url": "/data/music1.mp3",
            "start_time": "00:00:00",
            "end_time": "00:01:30",
            "musicId": "music_001",
            "volume": 0.5,
            "isloop": true
        },
        "backgroundImage": {
            "url": "/data/bg_green.jpg",
            "backgroundId": "bg_001",
            "scaleType": "填充",
            "name": "乡间小路-白"
        },
        "style": {
            "ratio": "9:16",
            "resolution": "720p",
            "styleName": "横屏治愈系漫剪",
            "stylePreviewUrl": "/data/床上_视频电话_亲吻.mp4",
            "videoShowRatio": {
                "ratio": "9:16",
                "cut_style": "center"
            },
            "font": {
                "voice_font_style": {
                    "font_size": 24,
                    "min_font_size": 18,
                    "max_line": 3,
                    "max_line_chars": 20,
                    "auto_scale": true,
                    "color": "#FFFFFF",
                    "stroke_color": "#000000",
                    "font_weight": "normal",
                    "stroke_width": 1,
                    "y_position": 50,
                    "margin_left": 10,
                    "margin_right": 10,
                    "alignParent": "bottom",
                    "overflow_char": "...",
                    "_id": "67e0df2dd71ef7cbf8f1206b"
                },
                "title_font_style": {
                    "font_size": 28,
                    "min_font_size": 20,
                    "max_line": 2,
                    "max_line_chars": 15,
                    "auto_scale": true,
                    "color": "#FFFFFF",
                    "stroke_color": "#000000",
                    "font_weight": "bold",
                    "stroke_width": 1,
                    "y_position": 20,
                    "margin_left": 10,
                    "margin_right": 10,
                    "alignParent": "top",
                    "overflow_char": "...",
                    "_id": "67e0df2dd71ef7cbf8f1206c"
                }
            }
        },
        "material": {
            "name": "可爱动漫",
            "materialID": "material_001",
            "previewUrl": "/data/龙猫_2224-2232.mp4"
        },
        "backupVideoNum": 1
    },
    "params": {
        "styleId": "67e0df2dd71ef7cbf8f1206a"
    }
}

## 接口实现
根据请求体的内容，来修正配置：
1. 将相对路径转换为绝对路径，字段包括：backgroundMusic.url，backgroundImage.url,material.url。检查这几个字段的 url ，如果是相对路径, 需要根据 .env 的 LOCAL_RESOURCE_DIR 来获取到资源文件的路径，并转成绝对路径, 例如 "/video_config/puuugn/" 根据 LOCAL_RESOURCE_DIR 转为 "/Users/lili/Documents/DEV/AILearning2
/AILearning/VideoClipping/video_config/puuugn/", 替换原有的路径
2. 将转换后的数据，作为 post 的参数，发送接口到另一个服务上
API地址：http://localhost:8888/api/v1/video/generateSingle
请求类型：post
请求参数：请求体中转换微调后的json数据

目标服务器的接口地址（http://localhost:8888）可以在 .env 中配置

该接口的返回内容如下：
{
  "task_id": "20250325_102259_8199c21783b7",
  "status": "processing",
  "error_message": null
}
task_id 表示该视频生成任务的ID，用于追踪该任务的持续进展

## 接口返回
在视频生成服务 /v1/video/generateSingle 返回的 status 为 processing 的情况下，返回 success，完整返回示例：

{
  "code": 0,
  "message": "success",
  "data": {
    "generateId": "video_gen_001"
  }
}

generateId 为任务id，直接填视频生成服务返回的 task_id 即可
