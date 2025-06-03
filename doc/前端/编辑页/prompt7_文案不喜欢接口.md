

# 接口 /ai/unlike_auto_generate_text

## 请求类型
post

type 有：
lifehacks_text，代表生活小妙招文案
Feeling_peace，代表温和的情感文案
Feeling_grudge,代表有怨气的情感文案

## 请求体
{
    "type": "lifehacks_text",   
    "text_id" : "文案ID"

}

## 接口返回
返回示例如下
{
  "code": 0,
  "message": "success"
}