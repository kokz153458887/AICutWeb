在 @index.tsx handleMaterialSelect 获取到  MaterialLibItem 之后，读取 material.url 的信息，这是一个json文件 “@http://192.168.3.17:5127/static/material/生活小妙招/生活小妙招.json ”，每一个节点记录了文件和文件夹信息，读取里面每一个节点，并以字典的形式将 所有 type 为 file 的存储下来，key则是 name，value则是整个Item信息；

JSON内容示例：
```json
{
    "name": "生活小妙招",
    "type": "directory",
    "children": [
        {
            "name": "cover.mp4",
            "type": "file",
            "size": 4286348,
            "size_formatted": "4.09 MB",
            "duration": 4.04,
            "duration_formatted": "00:00:04",
            "width": 1080,
            "height": 1920,
            "codec": "h264",
            "absolute_path": "I:\\videos\\生活小妙招\\cover.mp4",
            "relative_path": "cover.mp4",
            "preview_image": "cover.jpg",
            "create_time": "2025-05-24 10:36:04"
        },
        {
            "name": "厨房",
            "type": "directory",
            "children": [
                {
                    "name": "佐料调味瓶.mp4",
                    "type": "file",
                    "size": 5567922,
                    "size_formatted": "5.31 MB",
                    "duration": 5.178005,
                    "duration_formatted": "00:00:05",
                    "width": 1080,
                    "height": 1920,
                    "codec": "h264",
                    "absolute_path": "I:\\videos\\生活小妙招\\厨房\\佐料调味瓶.mp4",
                    "relative_path": "厨房\\佐料调味瓶.mp4",
                    "preview_image": "厨房\\佐料调味瓶.jpg",
                    "create_time": "2025-05-24 09:26:56"
                }
            ]
        }
    ]
}
```

2. 在 切片Item 标题的 右边 （删除按钮的左边）增加一个 View，可以用来选择 directory，如果选中了素材的情况下按钮可用；它是一个输入区，点击后可以输入文字，并根据输入的文字自动匹配已有的文件夹（一个下拉框选择），在不输入的时候弹出的下拉框里就是所有的文件夹，也可以自己编辑和定义其他的文件夹名称；点击下拉框里的文件夹名后将文件夹名填充到输入框中

3. 在 切片Item 标题上，输入文字的时候弹出下拉框，显示这个素材下所有的视频文件名，监听输入框的内容，每输入一个字都去 startWith 匹配已有的文件名； 点击下拉框里的文件名后将文件名填充到标题输入框中