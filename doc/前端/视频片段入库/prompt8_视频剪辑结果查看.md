开发 VideoParse 的结果页面。具体要求如下：

入口：对于 videoSlice 页面中，状态为 recorded 的Item，点击后跳转到一个新的URL页面 ”视频切片录入结果页“（将该任务的id传过去），可以查看录入到库里处理好的视频。

## 页面数据接口
页面根据URL参数里的 id 获取到目标任务ID，通过 ”/api/video/parse/query“ 接口查询该task对应的数据，以下是接口说明。

### 接口 /api/video/parse/query

#### 请求类型
get 

#### 参数
id=683f884f7e7dbcfadd39f7b2


#### 接口返回
```json
{
    "code": 0,
    "message": "success",
    "data": {
        "_id": "68395d61bc2058ba633724da",
        "id": "d1613d9b49be532f77c3dfe2e93fbb8aae93cd16298284edeafb09664a514684-1748589920539",
        "parse_url": "https://www.douyin.com/video/7481539816778239292",
        "status": "recorded",
        "file_urls": [
            "https://v3-web.douyinvod.com/e9e6a3cc4d72ea98441707090ed4ded4/683987b3/video/tos/cn/tos-cn-ve-15c000-ce/owNXP9YoEBohdAE2XOJTvMIQiA9iZEzIXMPPr/?a=6383&ch=26&cr=3&dr=0&lr=all&cd=0%7C0%7C0%7C3&cv=1&br=1025&bt=1025&cs=0&ds=4&ft=khyHAB1UiiuG97rZmdOC~49Zyo3nOz78r_6LpMyhvth0d1Q2B226.3saoTMNTad.o~&mime_type=video_mp4&qs=0&rc=ZWVpODxkZDtlOWc4NjM1NkBpMzt1dHA5cjt2eTMzbGkzNEBiMC01XjZeX18xYmIuNTQzYSNob21fMmRrNTZgLS1kLWJzcw%3D%3D&btag=c0000e00018000&cquery=100z_100o_100w_100B_100x&dy_q=1748589922&feature_id=46a7bb47b4fd1280f3d3825bf2b29388&l=20250530152522D8A6C4A1E6FA732F17A9",
            "https://v26-web.douyinvod.com/e765a8c15c9d9b4707b8018e5ecb0cd0/683987b3/video/tos/cn/tos-cn-ve-15c000-ce/owNXP9YoEBohdAE2XOJTvMIQiA9iZEzIXMPPr/?a=6383&ch=26&cr=3&dr=0&lr=all&cd=0%7C0%7C0%7C3&cv=1&br=1025&bt=1025&cs=0&ds=4&ft=khyHAB1UiiuG97rZmdOC~49Zyo3nOz78r_6LpMyhvth0d1Q2B226.3saoTMNTad.o~&mime_type=video_mp4&qs=0&rc=ZWVpODxkZDtlOWc4NjM1NkBpMzt1dHA5cjt2eTMzbGkzNEBiMC01XjZeX18xYmIuNTQzYSNob21fMmRrNTZgLS1kLWJzcw%3D%3D&btag=c0000e00018000&cquery=100w_100B_100x_100z_100o&dy_q=1748589922&feature_id=46a7bb47b4fd1280f3d3825bf2b29388&l=20250530152522D8A6C4A1E6FA732F17A9",
            "https://www.douyin.com/aweme/v1/play/?video_id=v1e00fgi0000cv9s88nog65mbqprr8k0&line=0&file_id=63728013e5ed46bbb8aa9aa9850f3beb&sign=f7dc42657374a2bc153917ebfb17cc81&is_play_url=1&source=PackSourceEnum_AWEME_DETAIL"
        ],
        "video_url": "http://localhost:5127/static/material/%E7%94%9F%E6%B4%BB%E5%B0%8F%E5%A6%99%E6%8B%9B/cover.mp4",
        "preview_image": "http://localhost:5127/static/material/%E7%94%9F%E6%B4%BB%E5%B0%8F%E5%A6%99%E6%8B%9B/cover.jpg",
        "text": "初见她门故溪江西啊 她请摘一朵桃花 但愿橙色梅绒下 两个芳菲如星长 花啼笔雨下令我叹 遥遥相思琴芳香 闲置一撒城市画 眼泪无声 就先让花中的光耀",
        "output_url": "http://localhost/api/whisper/tasks/result?task_id=14",
        "segments": "http://192.168.3.17:5127/static/output/parse_video/d1613d9b49be532f77c3dfe2e93fbb8aae93cd16298284edeafb09664a514684-1748589920539/text_segments.json",
        "createTime": "2025-05-30T07:25:21.734Z",
        "updateAt": "2025-05-30T07:25:26.849Z",
        "__v": 0,
        "video_info": {
            "resolution": "1080x1920",
            "file_size_bytes": 4345516,
            "file_duration": 33.1,
            "language": "zh",
            "platform": "douyin"
        },
        "updateTime": "2025-06-04T00:14:07.779Z",
        "clips": [
            {
                "name": "初见她门故溪江西啊她请摘一朵桃花",
                "folder": "步骤一",
                "beginTime": "00:00:00.000",
                "endTime": "00:00:07.220",
                "text": "初见她门故溪江西啊 她请摘一朵桃花 ",
                "clipFilePath": "I:\\videos\\生活小妙招\\ 步骤一\\初见她门故溪江西啊她请摘一朵桃花.mp4",
                "preview_image": "http://30.166.225.249:5127/material/%E7%94%9F%E6%B4%BB%E5%B0%8F%E5%A6%99%E6%8B%9B/_%E9%83%9D%E5%8A%AD%E6%96%87_%E6%8E%A8%E8%8D%90_%E7%88%B1%E6%A0%BC%E9%AD%94%E5%8A%9B%E6%8A%B9%E5%B8%83%E6%93%A6%E7%8E%BB%E7%92%83%E7%A5%9E%E5%99%A8%E6%8A%B9%E5%B8%83%E5%8A%A0%E5%8E%9A%E6%97%A0%E7%97%95%E6%97%A0%E6%B0%B4%E5%8D%B0%E4%B8%8D%E6%8E%89%E6%AF%9B%E5%90%B8%E6%B0%B4_%E9%AD%94%E5%8A%9B%E6%8A%B9%E5%B8%83_%E6%8A%B9_7472699159510797577.jpg",
                "video_path": "http://30.166.225.249:5127/material/%E7%94%9F%E6%B4%BB%E5%B0%8F%E5%A6%99%E6%8B%9B/_%E9%83%9D%E5%8A%AD%E6%96%87_%E6%8E%A8%E8%8D%90_%E7%88%B1%E6%A0%BC%E9%AD%94%E5%8A%9B%E6%8A%B9%E5%B8%83%E6%93%A6%E7%8E%BB%E7%92%83%E7%A5%9E%E5%99%A8%E6%8A%B9%E5%B8%83%E5%8A%A0%E5%8E%9A%E6%97%A0%E7%97%95%E6%97%A0%E6%B0%B4%E5%8D%B0%E4%B8%8D%E6%8E%89%E6%AF%9B%E5%90%B8%E6%B0%B4_%E9%AD%94%E5%8A%9B%E6%8A%B9%E5%B8%83_%E6%8A%B9_7472699159510797577.MP4"
            },
            {
                "name": "但愿橙色梅绒下两个芳菲如星长",
                "folder": "步骤二",
                "beginTime": "00:00:07.220",
                "endTime": "00:00:13.680",
                "text": "但愿橙色梅绒下 两个芳菲如星长 ",
                "clipFilePath": "I:\\videos\\生活小妙招\\步骤二\\但愿橙色梅绒下两个芳菲如星长.mp4",
                "preview_image": "http://30.166.225.249:5127/material/%E7%94%9F%E6%B4%BB%E5%B0%8F%E5%A6%99%E6%8B%9B/_%E8%B6%85%E5%80%BC%E8%B4%AD_%E7%88%B1%E6%A0%BC%E9%AD%94%E5%8A%9B%E6%8A%B9%E5%B8%83%E6%93%A6%E7%8E%BB%E7%92%83%E7%A5%9E%E5%99%A8%E6%8A%B9%E5%B8%83%E5%8A%A0%E5%8E%9A%E6%97%A0%E7%97%95%E6%97%A0%E6%B0%B4%E5%8D%B0%E4%B8%8D%E6%8E%89%E6%AF%9B%E5%90%B8%E6%B0%B4_%E6%93%A6%E7%8E%BB%E7%92%83%E7%A5%9E%E5%99%A8%E6%8A%B9%E5%B8%83_%E4%B8%93_7487624982831320379.jpg",
                "video_path": "http://30.166.225.249:5127/material/%E7%94%9F%E6%B4%BB%E5%B0%8F%E5%A6%99%E6%8B%9B/_%E8%B6%85%E5%80%BC%E8%B4%AD_%E7%88%B1%E6%A0%BC%E9%AD%94%E5%8A%9B%E6%8A%B9%E5%B8%83%E6%93%A6%E7%8E%BB%E7%92%83%E7%A5%9E%E5%99%A8%E6%8A%B9%E5%B8%83%E5%8A%A0%E5%8E%9A%E6%97%A0%E7%97%95%E6%97%A0%E6%B0%B4%E5%8D%B0%E4%B8%8D%E6%8E%89%E6%AF%9B%E5%90%B8%E6%B0%B4_%E6%93%A6%E7%8E%BB%E7%92%83%E7%A5%9E%E5%99%A8%E6%8A%B9%E5%B8%83_%E4%B8%93_7487624982831320379.MP4"
            },
            {
                "name": "花啼笔雨下令我叹 遥遥相思琴芳香",
                "folder": "步骤三",
                "beginTime": "00:00:13.680",
                "endTime": "00:00:20.520",
                "text": "花啼笔雨下令我叹 遥遥相思 琴芳香 ",
                "clipFilePath": "I:\\videos\\生活小妙招\\步骤三\\花啼笔雨下令我叹遥遥相思琴芳香.mp4",
                "preview_image": "http://30.166.225.249:5127/material/%E7%94%9F%E6%B4%BB%E5%B0%8F%E5%A6%99%E6%8B%9B/_%E9%83%9D%E5%8A%AD%E6%96%87_%E6%8E%A8%E8%8D%90_%E6%B8%85%E6%B4%81%E6%8A%B9%E5%B8%83_%E6%8A%B9%E5%B8%83_%E9%AD%94%E5%8A%9B%E6%8A%B9%E5%B8%83_%E5%AE%B6%E7%94%A8%E6%8A%B9%E5%B8%83_%E8%B6%85%E5%80%BC%E8%B4%AD_%E7%88%B1%E6%A0%BC%E9%AD%94%E5%8A%9B%E6%8A%B9%E5%B8%83%E6%93%A6%E7%8E%BB%E7%92%83%E7%A5%9E_7475996972885855523.jpg",
                "video_path": "http://30.166.225.249:5127/material/%E7%94%9F%E6%B4%BB%E5%B0%8F%E5%A6%99%E6%8B%9B/_%E9%83%9D%E5%8A%AD%E6%96%87_%E6%8E%A8%E8%8D%90_%E6%B8%85%E6%B4%81%E6%8A%B9%E5%B8%83_%E6%8A%B9%E5%B8%83_%E9%AD%94%E5%8A%9B%E6%8A%B9%E5%B8%83_%E5%AE%B6%E7%94%A8%E6%8A%B9%E5%B8%83_%E8%B6%85%E5%80%BC%E8%B4%AD_%E7%88%B1%E6%A0%BC%E9%AD%94%E5%8A%9B%E6%8A%B9%E5%B8%83%E6%93%A6%E7%8E%BB%E7%92%83%E7%A5%9E_7475996972885855523.mp4"
            },
            {
                "name": "闲置一撒城市画眼泪无声就先让花中的光",
                "folder": "步骤三",
                "beginTime": "00:00:20.520",
                "endTime": "00:00:33.100",
                "text": "闲置一撒城市画 眼泪无声 就先让花中的光耀",
                "clipFilePath": "I:\\videos\\生活小妙招\\步骤三\\闲置一撒城市画眼泪无声就先让花中的光.mp4",
                "preview_image": "http://30.166.225.249:5127/material/%E7%94%9F%E6%B4%BB%E5%B0%8F%E5%A6%99%E6%8B%9B/_%E6%8A%B9%E5%B8%83_%E7%99%BE%E6%B4%81%E5%B8%83_%E6%97%A0%E7%97%95%E6%8A%B9%E5%B8%83_7496395583718264074.jpg",
                "video_path": "http://30.166.225.249:5127/material/%E7%94%9F%E6%B4%BB%E5%B0%8F%E5%A6%99%E6%8B%9B/_%E6%8A%B9%E5%B8%83_%E7%99%BE%E6%B4%81%E5%B8%83_%E6%97%A0%E7%97%95%E6%8A%B9%E5%B8%83_7496395583718264074.mp4"
            }
        ],
        "materialCoverUrl": "material/生活小妙招/cover.jpg",
        "materialId": "683e75056898a87efd6b805c",
        "materialName": "生活小妙招",
        "materialPreviewUrl": "material/生活小妙招/cover.mp4",
        "materialUrl": "http://192.168.3.17:5127/static/material/生活小妙招/生活小妙招.json",
        "video_subtype": "",
        "video_type": "lifehacks_text"
    }
}
```

#### CURL 示例
curl -X GET http://localhost:5127/api/video/parse/query?id=d1613d9b49be532f77c3dfe2e93fbb8aae93cd16298284edeafb09664a514684-1748589920539

## 页面渲染
顶部Bar区域：左边返回图标，点击后返回上一页；最右边一个删除按钮，点击后提示 ”功能待开发“
任务信息展示区：页面顶部区块显示该任务相关的信息Item，包括：
- 第一行：data.text（最多显示2行）
- 第二行：data.video_info（视频信息，分辨率、文件大小、时长）
- 第三行：video_type、video_subtype、语言、平台
- 第四行：preview_image（预览图）
- 点击该Item后播放 video_url
Item上有一个按钮 ”原链接“，点击后跳转 data.parse_url; 还有一个按钮 ”视频地址“ 点击后会弹出小的下拉框，显示 file_urls 的Item，点击后跳转对应的url上。
有一个按钮展示 materialName ，点击后跳转素材库查看页面（/material-library/:materialId）

clips 区（可上下滑动）：
在顶部任务信息Item区下面就是Clips区，用于展示 Clips 里的内容。
name、folder、beginTime、endTime、text、preview_image、video_path
展现形式是单列流：
第一行：name、标签的形式展现：folder、beginTime-endTime，最右边有一个删除按钮，点击后弹出Toast提示 ”功能待开发“
第二行：text，最多展现2行，展示不下的情况下，在文本尾部增加一个点击div，点击后展开该文本将所有文本展示全
第三行：preview_image，宽度铺满屏幕，高度固定，比例为 4：3，未播放状态下有一个暂停按钮浮在 preview_image 上面；点击后在 preview_image 的位置上展示 video 组件，播放 video_path；点击播放中的视频会暂停播放；视频右下角悬浮着一个图标，点击后全屏播放该视频，使用 @VideoPlayer 组件来全屏播放该视频

