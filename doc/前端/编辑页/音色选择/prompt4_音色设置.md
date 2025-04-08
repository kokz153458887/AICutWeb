进入音色的参数panel后，将 supportVoiceParam 带给 panel，panel 根据这里的参数决定可以调控哪些参数，在面板里可以设置这个角色的音色信息，并完成试听，具体要求如下：
1. 音色参数面板可以控制 supportVoiceParam，包含  pitch 和 emotion_intensity ，pitch代表可以设置语调（范围-10~0~10，正常为0），emotion_intensity代表可以设置情绪和情绪强度（范围-10~0~10，正常为0），情绪的数据则是根据 emotion[] 中的情绪来控制的；emotion.name 以情绪标签的形式平面铺开展示在面板最上面（参数调节的展示从上到下的顺序为：情绪标签、情绪强度调节、语调调节、语速调节）
2. 点击音色参数面板里的 情绪标签, 播放情绪标签里对应的声音，属性对应为 emotion.speech.url
3. 在每次调整了情绪参数后，会更新情绪参数回填给 音色浮层（VoiceSelectModal），音色浮层会保留当前选中的音色以及音色对应的参数标签。每个角色都有自己的音色参数
4. 在音色浮层里，点击确认按钮后，回到 EdigPage 编辑页，把音色的数据完整的回填回去
 "content": {
      "text": "婚姻中最毒的男人，就是对外面的女人宽宏大量，对自己的妻子尖酸刻薄，把最好的脾气，都留给了外人，把最差的脾气，都留给了自己的老婆，别的女人心疼他几句，他感觉好理解他，而自己的妻子累死累活，为了这个家操碎了心，他却认为是理所应当！",
      "splitType": "normalize",
      "volume": 4.8,
      "speakerID": "cosyvoice-qinxiaobao", // 回填 voiceName
      "voiceService": "localCosyVoice", // 回填 voiceServer
      "voiceInfo" : {回填queryVoice返回的完整数据},
      "voiceParams" : {回填在参数控制面板里设置的参数}
    }


{
    "voiceCode": "aliyun_longchen_龙臣",
    "voicer": "龙臣",
    "voiceServer" : "aliyun",
    "avatar": "assets/image/1.jpg",
    "voiceName": "longjiajia",
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