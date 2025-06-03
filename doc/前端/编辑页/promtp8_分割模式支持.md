在 视频编辑页，增强文本输入框的能力，包括：
1. 在 TextInputSection 输入框的最左下角（（与音量按钮在同一行和同一层级上），增加一个清空文本的按钮，用一把叉的图标替代，点击后自动清除文本区的内容和标题的内容
2. 在 TextInputSection 中增加文本切割模式的选择，在输入框的左下角, 清空按钮右侧增加 “分句” 按钮，样式与音量按钮保持一致，点击后弹出下拉框选择，分句模式支持两种 "标点断句" 、  “智能断句”，对应修改 VideoEditConfig.content 里 splitModel 字段
3. 视频的用户偏好字段 preferences 的位置进行调整，放在 styleConfig 下，与 title 平级
在点击生成按钮发起视频生成接口的时候需要将这些修改的参数一起带上发到服务器。

完整的数据示例如下：
{
    "title": "标题",
    "content": {
        "text": "文本内容",
        "splitModel": {
            "splitType": "strict",
            "splitParams" : {
                "min_length":20,
                "max_length": 30
            }
        }
    },
    "preferences": {
        "auto_select_text_type": "lifehacks_text"
    }
}


