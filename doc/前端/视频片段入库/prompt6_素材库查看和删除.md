在 @MaterialSelectModal.tsx 素材浮层的@MaterialItem.tsx 卡片右下角上增加一个查看的小图标（div），在 “x个素材” 那一行，点击后跳转一个新页面可以查看素材库的每个素材信息，跳转到新页面后将对应item的素材ID信息传过去，便于素材库信息页面确定知道要查看哪个素材。
在@Mine.tsx 中，“视频切片” 入口旁边增加一个新的入口，点击后弹出@MaterialSelectModal.tsx ，选择查看哪个素材。
素材库查看页面：
根据 @MaterialSelectModal.tsx 中获得的@MaterialItem.tsx @types.ts 信息，得到 MaterialLibItem.url（例如 “http://192.168.3.17:5127/static/material/a.json ”，读取这个url的JSON内容, 解析它得到每个 Item 的 preview_image、relative_path(视频地址）、name、duration_formatted、size_formatted、分辨率（width\height) ，根据 create_time 来排序（最近创建的排在最前面）通过 Grid 卡片展示这些信息；Item上的图片展示 preview_image，点击后播放 relative_path 视频；卡片右下角有一个区域相对较大的勾选框，选择后在页面的底部展示一条固定在底部的区块，区块里有一个小提示“已选择{x}个”，右边一个按钮 “删除”，左边一个按钮 “取消”，点击删除Toast “功能待开发”， 点击取消则把所有已选择的Item状态清空。
在遇到 type 为 directory 的 Item的时候展示成文件夹的形式，排序在最上面，点击后展开查看该文件夹下的Item；在进入到子文件夹后，在页面顶部有一个当前文件路径位置的显示（例如 ：“crop3\”) 表示当前所在的文件夹路径，这个情况下有一个返回按钮可以返回到上一级文件夹上。文件夹显示文件夹的图标（div），文件夹也是可以选中的。离开该文件夹后，就清空掉当前的文件选中状态； 
preview_image和 relative_path 完整路径是  MaterialLibItem.url 的路径（例如 “http://192.168.3.17:5127/static/material/a.json ”，得到域名路径 “http://192.168.3.17:5127 ”），加上固定的 “material”,以及当前文件夹所在的位置，例如示例JSON中 “05_风景__2_(0-70)_00-00-00-02.jpg” 的相对路径转成完整的url则是 “http://192.168.3.17:5127/material/测试/05_风景__2_(0-70)_00-00-00-02.jpg”


JSON内容示例：
```json
{
    "name": "测试",
    "type": "directory",
    "path": "I:\\videos\\测试",
    "children": [
        {
            "name": "05_风景__2_(0-70)_00-00-00-02.mp4",
            "type": "file",
            "size": 1018377,
            "size_formatted": "994.51 KB",
            "duration": 2.333333,
            "duration_formatted": "00:00:02",
            "width": 1920,
            "height": 1080,
            "codec": "h264",
            "absolute_path": "I:\\videos\\测试\\05_风景__2_(0-70)_00-00-00-02.mp4",
            "relative_path": "05_风景__2_(0-70)_00-00-00-02.mp4",
            "preview_image": "05_风景__2_(0-70)_00-00-00-02.jpg",
            "create_time": "2025-06-01 08:08:17"
        },
        {
            "name": "crop3",
            "type": "directory",
            "children": [
                {
                    "name": "crop3_321.mp4",
                    "type": "file",
                    "size": 4725164,
                    "size_formatted": "4.51 MB",
                    "duration": 29.624211,
                    "duration_formatted": "00:00:29",
                    "width": 1920,
                    "height": 800,
                    "codec": "h264",
                    "absolute_path": "I:\\videos\\测试\\crop3\\crop3_321.mp4",
                    "relative_path": "crop3\\crop3_321.mp4",
                    "preview_image": "crop3\\crop3_321.jpg",
                    "create_time": "2025-06-02 10:35:32"
                }
            ]
        }
    ]
}
```