进入音色的参数panel后，将 supportVoiceParam 带给 panel，panel 根据这里的参数决定可以调控哪些参数，在面板里可以设置这个角色的音色信息，并完成试听，具体要求如下：
1. 音色参数面板可以控制 supportVoiceParam，包含  pitch 和 emotion_intensity ，pitch代表可以设置语调（范围-10~0~10，正常为0），emotion_intensity代表可以设置情绪和情绪强度（范围-10~0~10，正常为0），情绪则是根据 emotion[] 中的情绪来控制的，展示在界面上的是 emotion.name 以按钮的形式平面铺开展示在最上面（参数调节的展示从上到下的顺序为：情绪强度标签、情绪强度、语调、语速）
2. 接口返回里增加字段 “voiceServer”， 当选择的音色不为 "localCosyVoice" 的情况下，在 panle 顶部右上角增加一个 “小喇叭” 的按钮，点击后触发语音生成，并且播放这个声音。
语音生成的接口



{
    "voiceCode": "aliyun_longchen_龙臣",
    "voicer": "龙臣",
    "voiceServer" : "aliyun",
    "avatar": "assets/image/1.jpg",
    "speech": {
        "text": "让我为您讲述这部精彩的影片",
        "url": "assets/audio/youdao/youdao_shulongyeye_龙族的智慧需要传承。.mp3"
    },
    "isFav": false,
    "supportVoiceParam": [
        "pitch",
        "emotion_intensity"
    ],
    "emotion": [
        {
            "id": "neutral",
            "name": "中性",
            "speech": {
                "text": "根据目前的数据显示，我们的市场份额保持稳定。",
                "url": "assets/audio/aliyun/aliyun_zhibei_emo_neutral_根据目前的数据显示，我们的市场份额保持稳.mp3"
            }
        }
    ]
}