MaterialLib 新增 delete_video 接口，支持对指定资源库内容的删除，具体要求参见以下文档。

# 接口 /api/material/delete_video

## 请求类型
post

## 请求体
{
   "id" : "materialId",
   "deleteFilePath": [
        "文件1.mp4", "文件2.mp4", "子目录/文件3.mp4", "子目录"
   ]
}

## 接口返回
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "materialId"
  }
}