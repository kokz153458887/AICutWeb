

# 接口 /ai/auto_generate_text

## 请求类型
post

type 有：
lifehacks_text，代表生活小妙招文案
Feeling_peace，代表温和的情感文案
Feeling_grudge,代表有怨气的情感文案

## 请求体
{
    "type": "lifehacks_text",   
    "generate_size": 1,         //构建的文本数量
    "hacks_type" : "root",      //构建文案类型
    "allow_used": false        //是否允许使用已使用过的文案
}

## 接口返回
返回示例如下
{
  "code": 0,
  "message": "success",
  "data": {
    "type": "frome_db",
    "text": [
        {
            "text_id" : "文案id",
            "text_content" : "文案内容"
        }
    ]
  }
}