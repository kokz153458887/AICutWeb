支持视频操作页 “分享模版” 的功能，在 handleShareTemplate 点击后发起网络请求，成功后toast提示用户，具体要求如下。

# 分享模版 接口
 分享模版 按钮调用服务端 createFromVideoTask 接口

## 请求地址
api/edit/createFromVideoTask
完整示例：http://localhost:5127/api/edit/createFromVideoTask

## 请求类型
get

## 请求参数
videoTaskId 视频任务ID, 从页面数据 VideoOperateData.generateId 中获取
videoIndex 视频的index位置，从页面数据的 currentIndex 中获取

## 接口返回
{
    "code": 0,
    "message": "success"
}

# 请求成功后的响应
toast提示 “成功分享出去啦~~”