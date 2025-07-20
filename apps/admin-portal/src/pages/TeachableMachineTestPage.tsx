import React, { useEffect, useRef, useState } from 'react';

import { getAllDishes } from '../services/dish.api';

const MODEL_URL = 'https://teachablemachine.withgoogle.com/models/nh5IAvf-C/';

interface TeachableMachineTestPageProps {
  onDishClick?: (dish: any) => void;
  onClose?: () => void;
}

const TeachableMachineTestPage: React.FC<TeachableMachineTestPageProps> = ({ onDishClick, onClose }) => {
  const [model, setModel] = useState<any>(null);
  const [maxPredictions, setMaxPredictions] = useState<number>(0);
  const [labels, setLabels] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [tmReady, setTmReady] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const [dishes, setDishes] = useState<any[]>([]);

  useEffect(() => {
    getAllDishes().then(setDishes);
  }, []);

  // Load TensorFlow.js và Teachable Machine script đúng thứ tự
  useEffect(() => {
    if ((window as any).tmImage && (window as any).tf) {
      setTmReady(true);
      return;
    }
    // Load tfjs trước
    const tfScript = document.createElement('script');
    tfScript.src = 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@latest/dist/tf.min.js';
    tfScript.async = true;
    tfScript.onload = () => {
      // Sau khi tfjs đã load, mới load teachablemachine-image
      const tmScript = document.createElement('script');
      tmScript.src = 'https://cdn.jsdelivr.net/npm/@teachablemachine/image@latest/dist/teachablemachine-image.min.js';
      tmScript.async = true;
      tmScript.onload = () => setTmReady(true);
      tmScript.onerror = () => setError('Không thể tải thư viện Teachable Machine.');
      document.body.appendChild(tmScript);
    };
    tfScript.onerror = () => setError('Không thể tải thư viện TensorFlow.js');
    document.body.appendChild(tfScript);

    return () => {
      document.body.removeChild(tfScript);
      // Nếu đã load tmScript thì xóa luôn
      const tmScript = document.querySelector('script[src*="teachablemachine-image"]');
      if (tmScript) document.body.removeChild(tmScript);
    };
  }, []);

  // Load model on first use
  const loadModel = async () => {
    setLoading(true);
    setError(null);
    try {
      // @ts-ignore
      const tmImage = (window as any).tmImage;
      const modelURL = MODEL_URL + 'model.json';
      const metadataURL = MODEL_URL + 'metadata.json';
      console.log('Đang tải model:', modelURL, metadataURL);
      const loadedModel = await tmImage.load(modelURL, metadataURL);
      setModel(loadedModel);
      setMaxPredictions(loadedModel.getTotalClasses());
    } catch (e) {
      console.error('Lỗi khi tải model Teachable Machine:', e);
      setError('Không thể tải model. Xem chi tiết lỗi trong console.');
    }
    setLoading(false);
  };

  // Handle file upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files.length > 0 ? e.target.files[0] : null;
    if (!file) {
      setError('Vui lòng chọn một ảnh hợp lệ.');
      return;
    }
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setLabels([]);
    setImageLoaded(false);
    setError(null);
    if (!model) {
      await loadModel();
    }
    // predict sẽ được gọi trong onLoad của <img>
    console.log('Đã chọn file:', file.name, file.type, file.size, url);
  };

  // Khi ảnh load xong
  const handleImageLoad = () => {
    setImageLoaded(true);
    setError(null);
    console.log('Ảnh đã load xong, sẵn sàng nhận diện.');
  };

  // Khi ảnh load lỗi
  const handleImageError = () => {
    setError('Không thể hiển thị ảnh này. Vui lòng chọn ảnh khác.');
    setImageLoaded(false);
    setImageUrl(null);
    console.error('Lỗi khi load ảnh.');
  };

  // Predict on uploaded image
  const predict = async () => {
    if (!model || !imageRef.current || !imageLoaded) return;
    try {
      console.log('Predicting on image...');
      const prediction = await model.predict(imageRef.current);
      // Chỉ lấy nhãn có xác suất cao nhất
      const best = prediction.reduce((max: any, cur: any) => (cur.probability > max.probability ? cur : max), prediction[0]);
      setLabels([`${best.className}: ${best.probability.toFixed(2)}`]);
    } catch (e) {
      setError('Không thể nhận diện ảnh.');
      console.error('Lỗi khi predict:', e);
    }
  };

  // Gọi predict khi model và ảnh đã sẵn sàng
  useEffect(() => {
    if (model && imageLoaded) {
      predict();
    }
    // eslint-disable-next-line
  }, [model, imageLoaded]);

  // Hàm loại bỏ dấu tiếng Việt
  function removeVietnameseTones(str: string) {
    return str
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .toLowerCase();
  }

  return (
    <div style={{ padding: 16, textAlign: 'center' }}>
      {!tmReady && <div>Đang tải thư viện Teachable Machine...</div>}
      <label
        htmlFor="food-image-upload"
        style={{
          display: 'inline-block',
          padding: '10px 22px',
          background: '#fff',
          color: '#C92A15',
          border: '2px solid #C92A15',
          borderRadius: 12,
          fontWeight: 600,
          cursor: 'pointer',
          marginBottom: 8,
          transition: 'background 0.2s, color 0.2s',
        }}
        onMouseOver={e => ((e.currentTarget.style.background = '#C92A15'), (e.currentTarget.style.color = '#fff'))}
        onMouseOut={e => ((e.currentTarget.style.background = '#fff'), (e.currentTarget.style.color = '#C92A15'))}
      >
        <span
          className="tm-highlight-logo"
          style={{ marginRight: 12, fontSize: 26, width: 32, height: 32, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
        >
          📷
        </span>{' '}
        Chọn ảnh món ăn
        <input id="food-image-upload" type="file" accept="image/*" onChange={handleFileChange} disabled={!tmReady} style={{ display: 'none' }} />
      </label>
      {imageUrl && (
        <div style={{ margin: '16px 0', display: 'flex', justifyContent: 'center' }}>
          <img
            ref={imageRef}
            src={imageUrl}
            alt="Upload preview"
            style={{ maxWidth: 220, maxHeight: 220, borderRadius: 12, boxShadow: '0 2px 8px #0001', border: '2px solid #eee' }}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        </div>
      )}
      {loading && <div>Đang nhận diện món ăn...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <div style={{ marginTop: 12, fontWeight: 500, fontSize: 16 }}>
        {labels.map((label, idx) => {
          const name = label && typeof label === 'string' && label.includes(':') ? label.split(':')[0] : label;
          // So sánh gần đúng: loại bỏ dấu, chữ thường, includes
          const normName = name && typeof name === 'string' ? removeVietnameseTones(name.trim()) : '';
          const dish = dishes.find(d => {
            if (!d.name || typeof d.name !== 'string') return false;
            const normDishName = removeVietnameseTones(d.name.trim());
            return normDishName.includes(normName) || normName.includes(normDishName);
          });
          return (
            <div key={idx}>
              <div style={{ fontWeight: 700, fontSize: 18 }}>{name}</div>
              {dish && (
                <div style={{ marginTop: 4 }}>
                  <a
                    href="#"
                    style={{ color: '#1976d2', textDecoration: 'underline', fontSize: 15 }}
                    onClick={e => {
                      e.preventDefault();
                      onDishClick && onDishClick(dish);
                      onClose && onClose();
                    }}
                  >
                    bạn có thể xem kỹ hơn tại đây
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TeachableMachineTestPage;
