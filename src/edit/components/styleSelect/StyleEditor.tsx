/**
 * 视频风格编辑器组件
 * 负责创建新风格或编辑现有风格的参数
 */
import React, { useState, useEffect } from 'react';
import '../../styles/StyleEditor.css';
import { VideoStyleItem } from '../../api/types';
import { EditSelectAPI } from '../../api/EditSelectAPI';
import Toast, { toast } from '../../../components/Toast';

// 空的默认风格模板
const DEFAULT_STYLE: VideoStyleItem = {
  _id: '',
  styleName: '新视频风格',
  ratio: '9:16',
  resolution: '1080P',
  previewUrl: '',
  videoShowRatio: {
    ratio: '1:1',
    cut_style: 'height'
  },
  font: {
    voice_font_style: {
      font_size: 90,
      min_font_size: 60,
      max_line: 2,
      max_line_chars: 12,
      auto_scale: true,
      color: 'white',
      stroke_color: 'black',
      font_weight: 'bold',
      stroke_width: 5.0,
      y_position: 1550,
      margin_left: 0,
      margin_right: 0,
      alignParent: 'top'
    },
    title_font_style: {
      font_size: 110,
      min_font_size: 70,
      max_line_chars: 10,
      max_line: 1,
      auto_scale: true,
      color: 'black',
      font_weight: 'bold',
      stroke_color: 'white',
      stroke_width: 5.0,
      y_position: 250,
      margin_left: 0,
      margin_right: 0,
      alignParent: 'top',
      overflow_char: ''
    }
  }
};

interface StyleEditorProps {
  mode: 'create' | 'update';
  style: VideoStyleItem | null;
  onClose: () => void;
  onSave: () => void;
}

/**
 * 可折叠面板组件
 */
interface CollapsiblePanelProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

/**
 * 可折叠面板组件
 */
const CollapsiblePanel: React.FC<CollapsiblePanelProps> = ({ 
  title, 
  children,
  defaultExpanded = false
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  
  return (
    <div className="collapsible-panel">
      <div 
        className={`collapsible-header ${expanded ? 'expanded' : ''}`}
        onClick={() => setExpanded(!expanded)}
      >
        <h3 className="form-section-title">{title}</h3>
        <div className="collapsible-icon">
          {expanded ? '▼' : '▶'}
        </div>
      </div>
      {expanded && (
        <div className="collapsible-content">
          {children}
        </div>
      )}
    </div>
  );
};

/**
 * 视频风格编辑器组件
 */
const StyleEditor: React.FC<StyleEditorProps> = ({
  mode,
  style,
  onClose,
  onSave
}) => {
  // 编辑的风格数据
  const [formData, setFormData] = useState<VideoStyleItem>(DEFAULT_STYLE);
  // 加载状态
  const [loading, setLoading] = useState<boolean>(false);

  // 初始化表单数据
  useEffect(() => {
    if (mode === 'update' && style) {
      setFormData({...style});
    } else {
      setFormData({...DEFAULT_STYLE});
    }
  }, [mode, style]);

  /**
   * 处理基本字段变更
   */
  const handleBasicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * 处理视频显示比例字段变更
   */
  const handleVideoShowRatioChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      videoShowRatio: {
        ...prev.videoShowRatio,
        [name]: value
      }
    }));
  };

  /**
   * 处理字体样式字段变更
   * @param type 字体类型："title"或"voice"
   * @param e 事件对象
   */
  const handleFontStyleChange = (type: 'title' | 'voice', e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    // 处理特殊字段：布尔值和数字
    const processedValue = value;
    
    const fontStyleKey = type === 'title' ? 'title_font_style' : 'voice_font_style';
    
    setFormData(prev => ({
      ...prev,
      font: {
        ...prev.font,
        [fontStyleKey]: {
          ...prev.font[fontStyleKey],
          [name]: processedValue
        }
      }
    }));
  };
  
  /**
   * 处理标题字体变更，调用公共方法
   */
  const handleTitleFontChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    handleFontStyleChange('title', e);
  };
  
  /**
   * 处理语音字体变更，调用公共方法
   */
  const handleVoiceFontChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    handleFontStyleChange('voice', e);
  };

  /**
   * 准备提交的样式数据
   */
  const prepareStyleData = () => {
    return {
      styleName: formData.styleName,
      ratio: formData.ratio,
      resolution: formData.resolution,
      videoShowRatio: formData.videoShowRatio,
      font: formData.font
    };
  };

  /**
   * 保存风格数据
   */
  const handleSave = async () => {
    try {
      setLoading(true);
      
      // 准备要提交的数据
      const styleData = prepareStyleData();
      
      // 根据模式选择不同的API
      if (mode === 'create') {
        // 创建新风格
        const response = await EditSelectAPI.createStyle(styleData);
        
        if (response.code === 0) {
          toast.success('创建视频风格成功');
          onSave();
        } else {
          toast.error(`创建失败：${response.message || '未知错误'}`);
        }
      } else {
        // 更新现有风格
        if (!formData._id) {
          toast.error('缺少风格ID，无法更新');
          return;
        }
        
        const response = await EditSelectAPI.updateStyle(formData._id, styleData);
        
        if (response.code === 0) {
          toast.success('更新视频风格成功');
          onSave();
        } else {
          toast.error(`更新失败：${response.message || '未知错误'}`);
        }
      }
    } catch (err) {
      console.error(mode === 'create' ? '创建风格失败:' : '更新风格失败:', err);
      toast.error(mode === 'create' ? '创建视频风格失败，请重试' : '更新视频风格失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 创建新风格（在编辑现有风格的基础上）
   */
  const handleCreateNew = async () => {
    try {
      setLoading(true);
      
      // 准备要提交的数据（移除ID，确保创建新风格）
      const styleData = prepareStyleData();
      
      // 调用创建API
      const response = await EditSelectAPI.createStyle(styleData);
      
      if (response.code === 0) {
        toast.success('创建新视频风格成功');
        onSave();
      } else {
        toast.error(`创建失败：${response.message || '未知错误'}`);
      }
    } catch (err) {
      console.error('创建新风格失败:', err);
      toast.error('创建新视频风格失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 渲染标题字体样式编辑部分
   */
  const renderTitleFontForm = () => (
    <>
      <div className="form-group">
        <label>字体大小</label>
        <input 
          type="number" 
          name="font_size" 
          value={formData.font.title_font_style.font_size} 
          onChange={handleTitleFontChange}
        />
      </div>
      
      <div className="form-group">
        <label>最小字体大小</label>
        <input 
          type="number" 
          name="min_font_size" 
          value={formData.font.title_font_style.min_font_size} 
          onChange={handleTitleFontChange}
        />
      </div>
      
      <div className="form-group">
        <label>最大行数</label>
        <input 
          type="number" 
          name="max_line" 
          value={formData.font.title_font_style.max_line} 
          onChange={handleTitleFontChange}
        />
      </div>
      
      <div className="form-group">
        <label>每行最大字符数</label>
        <input 
          type="number" 
          name="max_line_chars" 
          value={formData.font.title_font_style.max_line_chars} 
          onChange={handleTitleFontChange}
        />
      </div>
      
      <div className="form-group">
        <label>自动缩放</label>
        <select 
          name="auto_scale" 
          value={formData.font.title_font_style.auto_scale.toString()} 
          onChange={handleTitleFontChange}
        >
          <option value="true">是</option>
          <option value="false">否</option>
        </select>
      </div>
      
      <div className="form-group">
        <label>字体颜色</label>
        <input 
          type="text" 
          name="color" 
          value={formData.font.title_font_style.color} 
          onChange={handleTitleFontChange}
        />
      </div>
      
      <div className="form-group">
        <label>描边颜色</label>
        <input 
          type="text" 
          name="stroke_color" 
          value={formData.font.title_font_style.stroke_color} 
          onChange={handleTitleFontChange}
        />
      </div>
      
      <div className="form-group">
        <label>字体粗细</label>
        <input 
          type="text" 
          name="font_weight" 
          value={formData.font.title_font_style.font_weight} 
          onChange={handleTitleFontChange}
        />
      </div>
      
      <div className="form-group">
        <label>描边宽度</label>
        <input 
          type="number" 
          name="stroke_width" 
          value={formData.font.title_font_style.stroke_width} 
          onChange={handleTitleFontChange}
        />
      </div>
      
      <div className="form-group">
        <label>Y轴位置</label>
        <input 
          type="number" 
          name="y_position" 
          value={formData.font.title_font_style.y_position} 
          onChange={handleTitleFontChange}
        />
      </div>
      
      <div className="form-group">
        <label>左边距</label>
        <input 
          type="number" 
          name="margin_left" 
          value={formData.font.title_font_style.margin_left} 
          onChange={handleTitleFontChange}
        />
      </div>
      
      <div className="form-group">
        <label>右边距</label>
        <input 
          type="number" 
          name="margin_right" 
          value={formData.font.title_font_style.margin_right} 
          onChange={handleTitleFontChange}
        />
      </div>
      
      <div className="form-group">
        <label>对齐父元素</label>
        <input 
          type="text" 
          name="alignParent" 
          value={formData.font.title_font_style.alignParent} 
          onChange={handleTitleFontChange}
        />
      </div>
      
      <div className="form-group">
        <label>溢出字符</label>
        <input 
          type="text" 
          name="overflow_char" 
          value={formData.font.title_font_style.overflow_char} 
          onChange={handleTitleFontChange}
        />
      </div>
    </>
  );

  /**
   * 渲染语音文案字体样式编辑部分
   */
  const renderVoiceFontForm = () => (
    <>
      <div className="form-group">
        <label>字体大小</label>
        <input 
          type="number" 
          name="font_size" 
          value={formData.font.voice_font_style.font_size} 
          onChange={handleVoiceFontChange}
        />
      </div>
      
      <div className="form-group">
        <label>最小字体大小</label>
        <input 
          type="number" 
          name="min_font_size" 
          value={formData.font.voice_font_style.min_font_size} 
          onChange={handleVoiceFontChange}
        />
      </div>
      
      <div className="form-group">
        <label>最大行数</label>
        <input 
          type="number" 
          name="max_line" 
          value={formData.font.voice_font_style.max_line} 
          onChange={handleVoiceFontChange}
        />
      </div>
      
      <div className="form-group">
        <label>每行最大字符数</label>
        <input 
          type="number" 
          name="max_line_chars" 
          value={formData.font.voice_font_style.max_line_chars} 
          onChange={handleVoiceFontChange}
        />
      </div>
      
      <div className="form-group">
        <label>自动缩放</label>
        <select 
          name="auto_scale" 
          value={formData.font.voice_font_style.auto_scale.toString()} 
          onChange={handleVoiceFontChange}
        >
          <option value="true">是</option>
          <option value="false">否</option>
        </select>
      </div>
      
      <div className="form-group">
        <label>字体颜色</label>
        <input 
          type="text" 
          name="color" 
          value={formData.font.voice_font_style.color} 
          onChange={handleVoiceFontChange}
        />
      </div>
      
      <div className="form-group">
        <label>描边颜色</label>
        <input 
          type="text" 
          name="stroke_color" 
          value={formData.font.voice_font_style.stroke_color} 
          onChange={handleVoiceFontChange}
        />
      </div>
      
      <div className="form-group">
        <label>字体粗细</label>
        <input 
          type="text" 
          name="font_weight" 
          value={formData.font.voice_font_style.font_weight} 
          onChange={handleVoiceFontChange}
        />
      </div>
      
      <div className="form-group">
        <label>描边宽度</label>
        <input 
          type="number" 
          name="stroke_width" 
          value={formData.font.voice_font_style.stroke_width} 
          onChange={handleVoiceFontChange}
        />
      </div>
      
      <div className="form-group">
        <label>Y轴位置</label>
        <input 
          type="number" 
          name="y_position" 
          value={formData.font.voice_font_style.y_position} 
          onChange={handleVoiceFontChange}
        />
      </div>
      
      <div className="form-group">
        <label>左边距</label>
        <input 
          type="number" 
          name="margin_left" 
          value={formData.font.voice_font_style.margin_left} 
          onChange={handleVoiceFontChange}
        />
      </div>
      
      <div className="form-group">
        <label>右边距</label>
        <input 
          type="number" 
          name="margin_right" 
          value={formData.font.voice_font_style.margin_right} 
          onChange={handleVoiceFontChange}
        />
      </div>
      
      <div className="form-group">
        <label>对齐父元素</label>
        <input 
          type="text" 
          name="alignParent" 
          value={formData.font.voice_font_style.alignParent} 
          onChange={handleVoiceFontChange}
        />
      </div>
    </>
  );

  return (
    <div className="style-editor-overlay">
      <div className="style-editor-container">
        {/* 顶部标题栏 */}
        <div className="style-editor-header">
          <div className="style-editor-title">
            {mode === 'create' ? '创建视频风格' : '编辑视频风格'}
          </div>
          <div className="style-editor-close" onClick={onClose}>✕</div>
        </div>

        {/* 内容区域-表单 */}
        <div className="style-editor-content">
          <form className="style-editor-form">
            <CollapsiblePanel title="基本信息" defaultExpanded={true}>
              <div className="form-group">
                <label>风格名称</label>
                <input 
                  type="text" 
                  name="styleName" 
                  value={formData.styleName} 
                  onChange={handleBasicChange}
                />
              </div>
              
              <div className="form-group">
                <label>宽高比</label>
                <input 
                  type="text" 
                  name="ratio" 
                  value={formData.ratio} 
                  onChange={handleBasicChange}
                />
              </div>
              
              <div className="form-group">
                <label>分辨率</label>
                <input 
                  type="text" 
                  name="resolution" 
                  value={formData.resolution} 
                  onChange={handleBasicChange}
                />
              </div>
            </CollapsiblePanel>

            <CollapsiblePanel title="视频显示比例" defaultExpanded={true}>
              <div className="form-group">
                <label>比例</label>
                <input 
                  type="text" 
                  name="ratio" 
                  value={formData.videoShowRatio.ratio} 
                  onChange={handleVideoShowRatioChange}
                />
              </div>
              
              <div className="form-group">
                <label>剪切样式</label>
                <select 
                  name="cut_style" 
                  value={formData.videoShowRatio.cut_style} 
                  onChange={handleVideoShowRatioChange}
                >
                  <option value="height">高度</option>
                  <option value="width">宽度</option>
                </select>
              </div>
            </CollapsiblePanel>

            <CollapsiblePanel title="标题字体样式">
              {renderTitleFontForm()}
            </CollapsiblePanel>

            <CollapsiblePanel title="语音文案字体样式">
              {renderVoiceFontForm()}
            </CollapsiblePanel>
          </form>
        </div>

        {/* 底部按钮 */}
        <div className="style-editor-footer">
          <button 
            className="style-editor-cancel" 
            onClick={onClose}
            disabled={loading}
          >
            取消
          </button>
          
          {/* 更新模式下显示新增按钮 */}
          {mode === 'update' && (
            <button 
              className="style-editor-create" 
              onClick={handleCreateNew}
              disabled={loading}
            >
              {loading ? '保存中...' : '新增'}
            </button>
          )}
          
          <button 
            className="style-editor-save" 
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? '保存中...' : (mode === 'create' ? '创建' : '更新')}
          </button>
        </div>
      </div>
      <Toast />
    </div>
  );
};

export default StyleEditor; 