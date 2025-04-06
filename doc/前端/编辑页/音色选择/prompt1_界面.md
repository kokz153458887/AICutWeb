在视频编辑页 @EditPage.tsx 点击 说话人按钮 的时候 (TextInputSection.handleSpeakerButtonClick），弹出选择说话人的浮层，浮层的样式参考附件里的设计稿，具体要求如下：
1. 浮层样式是从底部弹出，高度为屏幕的 3/4，点击浮层以外的地方会关闭浮层
2. 浮层的内容区，是多列流展示（5列），Item里展示 头像ICON（圆角）、说话人名称、在头像的底部覆盖一层半透明黑色的视图，视图上面包含 “多情绪”的标签（当有多情绪 emotion 的数据内容时），Item点击后，会弹出一个 Toast，提示“功能待开发...”, 并且在 item 的头像上覆盖一层黑色的覆盖层，覆盖层上会有一个设置的图标，再次点击后，会在底部弹出一个 “设置小浮层”
3. 设置小浮层，可以拖拽 选择 “语速 speed”、“语调 pitch ”、“情感强度 emotion_intensity ”（如果数据里有 emotion 的内容的话），从下到上的排序为:  speed 、 pitch  、 emotion_intensity， 可以在代码里通过数组顺序来控制， 范围 -10.0 ~ 10.0f， 1.0 为正常值,2.0为正常的2倍，每次改变数值后都将数值保存到说话人浮层的已选择数据里。
4. 确定音色选择：点击顶部Bar的右上角的 “勾号” 图标，表示确定了音色相关参数的选择，这个时候会关闭浮层，并且将已选中的说话人信息回传给 EditPage 页面
5. 顶部BAR：顶部BAR 读取 data.topbar 的数据，构建顶部tab，顶部TAB在tab数多的时候是可以左右横向滑动的，以便于选择更多的tab；在点击tab后加载一个新的tab内容，将旧的内容区给隐藏掉，为了避免内容占用过大，最多缓存旧的内容区3个，在内容区缓存满的情况下还需要缓存更多的内容区时，则使用最旧的内容区来承载需要缓存的数据；在顶部BAR的最左边有个筛选的ICON，点击后 Toast 提示 “功能待开发”

## 数据模型
VoiceInfo 为音色item的数据模型

class VoiceInfo:
    """音色信息模型"""
    voiceCode: str  # 唯一标识符，格式：云服务名_voiceName_voicer，作为主键
    voiceServer: str  # 云服务的名称，必填
    voicer: str  # 配音员名称，必填
    voiceName: str  # 语音名称ID，必填
    category: List[str] = Field(default_factory=list)  # 选填
    gender: str = "未知"  # 选填
    age: str = "成年"  # 选填
    tag: List[str] = Field(default_factory=list)  # 选填
    scene: List[str] = Field(default_factory=list)  # 选填
    language: str = "中文"  # 选填
    emotion: List[Emotion] = Field(default_factory=list)  # 选填，情感列表
    sampling: List[str] = Field(default_factory=list)  # 选填
    speech: Optional[SpeechInfo] = None  # 选填
    extra: Optional[ExtraInfo] = None  # 选填
    avatar: Optional[str] = None  # 选填，磁盘地址
    usage: Optional[UsageInfo] = None  # 选填，使用量
    sortingLevel: int = 5  # 数字，1~10
    created_at: datetime = Field(default_factory=datetime.now)  # 创建时间
    updated_at: datetime = Field(default_factory=datetime.now)  # 更新时间

该数据模型仅用于测试渲染，不需要调用接口，我们这次就专门把界面渲染到符合预期，数据通过 MOCK 类来写死，完整的数据示例如下：

{
    "status": "success",
    "msg": "success",
    "data": {
        "topbar": [
            {
                "id": "fav",
                "text": "收藏"
            },
            {
                "id": "useful",
                "text": "热门"
            },
            {
                "id": "other",
                "text": "其他"
            },
            {
                "id": "jieshuo",
                "text": "解说"
            }
        ],
        "content": [
            {
                "voiceCode": "aliyun_longchen_龙臣",
                "voiceServer": "aliyun",
                "voicer": "龙臣",
                "voiceName": "longchen",
                "category": [
                "译制片"
                ],
                "gender": "男",
                "age": "成年",
                "tag": [
                "超拟人"
                ],
                "scene": [
                "译制片"
                ],
                "language": "中英混合",
                "emotion": [],
                "sampling": [
                "8k",
                "16k",
                "24k"
                ],
                "speech": {
                    "text": "让我为您讲述这部精彩的影片",
                    "url": "assets\audio\youdao\youdao_shulongyeye_龙族的智慧需要传承。.mp3"
                }
            },
            {
                "voiceCode": "aliyun_longxiong_龙熊",
                "voiceServer": "aliyun",
                "voicer": "龙熊",
                "voiceName": "longxiong",
                "category": [
                "译制片"
                ],
                "gender": "男",
                "age": "成年",
                "tag": [
                "超拟人"
                ],
                "scene": [
                "译制片"
                ],
                "language": "中英混合",
                "emotion": [],
                "sampling": [
                "8k",
                "16k",
                "24k"
                ],
                "speech": {
                    "text": "精彩的故事即将开始，请您坐稳了",
                    "url": "assets\audio\youdao\youdao_shulongmei_龙族的公主最美丽。.mp3"
                }
            }
        ]
    }
}