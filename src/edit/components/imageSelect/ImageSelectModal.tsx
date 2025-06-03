import React, { useState, useEffect, useCallback, useRef } from 'react';
import '../../styles/ImageSelectModal.css';
import { toast } from '../../../components/Toast';
import LoadingView from '../../../components/LoadingView';
import { CloseIcon, EditIcon } from '../icons/SvgIcons';
import { EditSelectAPI } from '../../api/EditSelectAPI';
import { ImageLibItem } from '../../api/types';

interface ImageSelectModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (image: ImageLibItem) => void;
}

/**
 * 图片选择浮层组件
 * 负责展示和选择背景图片
 */
const ImageSelectModal: React.FC<ImageSelectModalProps> = ({
  visible,
  onClose,
  onSelect
}) => {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageList, setImageList] = useState<ImageLibItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const CACHE_KEY = 'background_image_cache';
  const CACHE_EXPIRY = 5 * 60 * 1000; // 5分钟缓存过期

  /**
   * 从本地缓存获取数据
   */
  const getLocalData = useCallback(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_EXPIRY) {
        return data;
      }
    }
    return null;
  }, []);

  /**
   * 更新本地缓存
   */
  const updateLocalCache = useCallback((data: ImageLibItem[]) => {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  }, []);

  /**
   * 加载图片列表
   */
  const loadImageList = useCallback(async () => {
    try {
      // 先检查缓存
      const cachedData = getLocalData();
      if (cachedData) {
        setImageList(cachedData);
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      // 发起API请求
      const response = await EditSelectAPI.getImageList();

      if (response.code === 0 && response.data) {
        setImageList(response.data.images);
        updateLocalCache(response.data.images);
      } else {
        throw new Error(response.message || '加载失败');
      }
    } catch (error) {
      console.error('加载图片列表失败:', error);
      toast.error('加载图片列表失败');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getLocalData, updateLocalCache]);

  /**
   * 处理文件选择
   */
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const response = await EditSelectAPI.uploadImage(file);
      
      if (response.code === 0 && response.data?.image) {
        // 更新图片列表
        setImageList(prevList => [response.data.image, ...prevList]);
        updateLocalCache([response.data.image, ...imageList]);
        toast.success('上传成功');
      } else {
        throw new Error(response.message || '上传失败');
      }
    } catch (error: any) {
      console.error('上传图片失败:', error);
      toast.error(error.message || '上传失败');
    } finally {
      setUploading(false);
      // 清空文件输入框，以便可以重复选择同一个文件
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  /**
   * 触发文件选择
   */
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  /**
   * 格式化文件大小
   */
  const formatFileSize = (bytes: number): string => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)}M`;
  };

  /**
   * 处理图片选择
   */
  const handleImageSelect = (image: ImageLibItem) => {
    onSelect(image);
  };

  useEffect(() => {
    if (visible) {
      loadImageList();
    }
  }, [visible, loadImageList]);

  if (!visible) return null;

  return (
    <div className="image-select-modal">
      <div className="image-select-overlay" onClick={onClose} />
      <div className="image-select-container">
        {/* 顶部栏 */}
        <div className="image-select-header">
          <span className="image-select-title">
            选择背景图片
            {refreshing && <span className="loading-dot" />}
          </span>
          <div className="image-select-actions">
            <div className="image-select-upload" onClick={handleUploadClick}>
              <EditIcon />
            </div>
            <div className="image-select-close" onClick={onClose}>
              <CloseIcon />
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </div>

        {/* 内容区域 */}
        <div className="image-select-content">
          {(loading || uploading) ? (
            <div className="image-select-loading">
              <LoadingView />
              {uploading && <div className="loading-text">文件上传中，请稍后...</div>}
            </div>
          ) : (
            <div className="image-grid">
              {imageList.map((image, index) => (
                <div 
                  key={index} 
                  className="image-item"
                  onClick={() => handleImageSelect(image)}
                >
                  <div className="image-preview">
                    <img src={image.url} alt="背景图片" />
                  </div>
                  <div className="image-info">
                    <span>{image.ratio}</span>
                    <span>{formatFileSize(image.size)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageSelectModal; 