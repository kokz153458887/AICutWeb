/**
 * 视频操作页的Mock数据
 */
import { VideoOperateData } from './types';

export const mockVideoData: VideoOperateData = {
  generateId: "video_001",
  title: "测试-翻页 - 卡片-卡通漫画风格萌娃",
  text: "卡通漫画风格萌娃，黑色头发梳成发髻插着藕粉色花朵，佩戴绿色圆形耳环，身穿带有藕粉绿色精美图案轻薄的汉服饰，领口有黑白色花纹装饰，俏皮可爱，灵动微闭一眼，淘气讨人喜欢，背景为简洁模糊光影。",
  createTime: "2024/03/17 17:23:55.13",
  status: "done",
  ratio: "3:4",
  materialName: "可爱动漫",
  videolist: [
    {
      coverImg: "/data/测试标题_1.jpg",
      videoUrl: "/data/测试标题_1.mp4"
    },
    {
      coverImg: "/data/测试标题.jpg",
      videoUrl: "/data/测试标题.mp4"
    },
    {
      coverImg: "/data/从今以后_1.jpg",
      videoUrl: "/data/从今以后_1.mp4"
    },
    {
      coverImg: "/data/20250317174458.jpg",
      videoUrl: "/data/龙猫_2224-2232.mp4"
    },
    {
      coverImg: "/data/20250317174522.jpg",
      videoUrl: "/data/测试标题.mp4"
    }
  ]
}; 