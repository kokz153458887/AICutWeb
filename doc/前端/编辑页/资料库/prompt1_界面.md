在视频编辑页 @EditPage.tsx 点击 “素材库” 的时候，弹出选择素材的浮层，具体要求如下：
1. 浮层样式是从底部弹出，高度为屏幕的 2/3，点击浮层以外的地方会关闭浮层
2. 在浮层的顶部的有一个固定高度的 bar ，内容区域滑动的时候这个bar会始终保持显示在这里，bar的最左边显示浮层的标题为 "选择素材库"，最右边有一个关闭按钮，点击后关闭浮层
3. 在浮层的底部有一个固定高度的 bar，有两个按钮 “确定”、“取消”，点击 确定 按钮后，将选中的素材返回，并更新编辑页的 “素材库” 字段和UI展示
4. 浮层的内容区，是网格展示，双列流，Item里一张图片（coverUrl）、一个名称(name，2行现实)、tag（如果 type 为 type，则显示 “合集” 的 tag， 没有就不显示tag），素材数（nums)
5. 进入浮层后，到 local 存储里去查找有没有数据缓存，如果有先加载缓存，然后同步发起接口 “/api/material/list?page=1&limit=-1” 获取数据，在此期间，顶部bar的 “选择素材库” 的标题旁边显示一个转圈的loading，表示数据正在刷新中，数据回来后与本地缓存做对比，如果数据一样就不刷新了，不一样则刷新数据；如果没有缓存，则在内容区内部显示加载中的样式，数据回来后加载UI，加载中的样式消失掉；在数据回来后每次都将数据缓存到 local 存储里。

## 模型资源说明
素材库中 “素材Item” 的字段：
 {
    "_id": "60d5ec68f682f34d9cbb1234",
    "name": "人物素材库",
    "url": "https://example.com/resources/materials/people/description.json",
    "fileName": "description.json",
    "type": "all",
    "previewUrl": "https://example.com/resources/materials/people/preview.mp4",
    "coverUrl": "https://example.com/resources/materials/people/cover.jpg",
    "nums": 120,
    "diskSize": 3145728000,
    "diskSizeMB": 3000,
    "updateTime": "2023-06-25T12:34:56.789Z",
    "createdAt": "2023-06-25T12:34:56.789Z",
    "updatedAt": "2023-06-25T12:34:56.789Z"
}

编辑页里素材 item 的字段示例：
"material": {
    "name": "人物素材库",       // 对应 素材Item 的 name
    "materialID": "60d5ec68f682f34d9cbb1234",      // 对应 素材Item 的 _id
    "url": "http://30.166.248.106:5127/static/assets/video_config/puuugn/",   // 对应 素材Item 的 url
    "previewUrl": "http://30.166.248.106:5127/static/assets/data/龙猫_2224-2232.mp4"    // 对应 素材Item 的 previewUrl
}