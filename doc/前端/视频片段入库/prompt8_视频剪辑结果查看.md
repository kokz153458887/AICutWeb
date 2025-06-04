开发一个视频解析接口 /api/video/parse/query


# 接口 /api/video/parse/query

## 请求类型
get 

## 参数
id=683f884f7e7dbcfadd39f7b2


## 接口返回
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
        "video_url": "http://192.168.3.17:5127/static/output/parse_video/d1613d9b49be532f77c3dfe2e93fbb8aae93cd16298284edeafb09664a514684-1748589920539/video.mp4",
        "preview_image": "http://192.168.3.17:5127/static/output/parse_video/d1613d9b49be532f77c3dfe2e93fbb8aae93cd16298284edeafb09664a514684-1748589920539/preview.jpg",
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
                "preview_image": "http://192.168.3.17:5127/material/生活小妙招/步骤一/初见 她门故溪江西啊她请摘一朵桃花.jpg",
                "video_path": "http://192.168.3.17:5127/material/生活小妙招/步骤一/初见她门故溪江西啊她请摘一朵桃花.mp4"
            },
            {
                "name": "但愿橙色梅绒下两个芳菲如星长",
                "folder": "步骤二",
                "beginTime": "00:00:07.220",
                "endTime": "00:00:13.680",
                "text": "但愿橙色梅绒下 两个芳菲如星长 ",
                "clipFilePath": "I:\\videos\\生活小妙招\\步骤二\\但愿橙色梅绒下两个芳菲如星长.mp4",
                "preview_image": "http://192.168.3.17:5127/material/生活小妙招/步骤二/但愿橙色梅绒下两个芳菲如星长.jpg",
                "video_path": "http://192.168.3.17:5127/material/生活小妙招/步骤二/但愿橙色梅绒下两个芳菲如星长.mp4"
            },
            {
                "name": "花啼笔雨下令我叹 遥遥相思琴芳香",
                "folder": "步骤三",
                "beginTime": "00:00:13.680",
                "endTime": "00:00:20.520",
                "text": "花啼笔雨下令我叹 遥遥相思 琴芳香 ",
                "clipFilePath": "I:\\videos\\生活小妙招\\步骤三\\花啼笔雨下令我叹遥遥相思琴芳香.mp4",
                "preview_image": "http://192.168.3.17:5127/material/生活小妙招/步骤三/花啼笔雨下令我叹遥遥相思琴芳香.jpg",
                "video_path": "http://192.168.3.17:5127/material/生活小妙招/步骤三/花啼笔雨下令我叹遥遥相思琴芳香.mp4"
            },
            {
                "name": "闲置一撒城市画眼泪无声就先让花中的光",
                "folder": "步骤三",
                "beginTime": "00:00:20.520",
                "endTime": "00:00:33.100",
                "text": "闲置一撒城市画 眼泪无声 就先让花中的光耀",
                "clipFilePath": "I:\\videos\\生活小妙招\\步骤三\\闲置一撒城市画眼泪无声就先让花中的光.mp4",
                "preview_image": "http://192.168.3.17:5127/material/生活小妙招/步骤三/闲置一撒城市画眼泪无声就先让花中的光.jpg",
                "video_path": "http://192.168.3.17:5127/material/生 活小妙招/步骤三/闲置一撒城市画眼泪无声就先让花中的光.mp4"
            }
        ],
        "materialCoverUrl": "material/生活小妙招/cover.jpg",
        "materialId": "683130a79b0e9c7e64216f45",
        "materialName": "生活小妙招",
        "materialPreviewUrl": "material/生活小妙招/cover.mp4",
        "materialUrl": "http://192.168.3.17:5127/static/material/生活小妙招/生活小妙招.json",
        "video_subtype": "",
        "video_type": "lifehacks_text"
    }
}
```

## CURL 示例
curl -X GET http://localhost:5127/api/video/parse/query?id=d1613d9b49be532f77c3dfe2e93fbb8aae93cd16298284edeafb09664a514684-1748589920539