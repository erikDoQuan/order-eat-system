import React, { useContext, useEffect, useRef, useState } from 'react';
import { CheckCircle, FileText, Phone } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

import AdminSidebar from '../components/AdminSidebar';
import { AuthContext } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getAllDishes } from '../services/dish.api';
import { getOrderDetailByAppTransId } from '../services/order.api';
import { getAllUsers } from '../services/user.api';

import '../css/zalo-pay-payment-page.css';

const QuickOrderSuccessPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { clearCart } = useCart();
  const [dishes, setDishes] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const hasClearedCart = useRef(false);

  const state = location.state as any;
  const order = state?.order;
  const appTransId = state?.appTransId;
  const orderId = state?.orderId;
  const totalAmount = state?.totalAmount;

  // Lấy đúng order_number từ database
  const orderNumber =
    orderData?.order_number || orderData?.orderNumber || order?.order_number || order?.orderNumber || (order?.id ? order.id.slice(0, 8) : 'N/A');

  // Debug log
  console.log('🔍 QuickOrderSuccessPage - Order object:', order);
  console.log('🔍 QuickOrderSuccessPage - Order data from API:', orderData);
  console.log('🔍 QuickOrderSuccessPage - Order number:', orderNumber);
  console.log('🔍 QuickOrderSuccessPage - order.order_number:', order?.order_number);
  console.log('🔍 QuickOrderSuccessPage - order.orderNumber:', order?.orderNumber);

  useEffect(() => {
    getAllDishes().then(setDishes);
    getAllUsers(1, 1000).then(response => setUsers(response.users));
  }, []);

  // Gọi API lấy order data mới từ appTransId
  useEffect(() => {
    if (appTransId) {
      setLoading(true);
      console.log('🔍 QuickOrderSuccessPage calling API with appTransId:', appTransId);
      getOrderDetailByAppTransId(appTransId)
        .then(data => {
          console.log('🔍 API response:', data);
          const orderDataFromAPI = data.data || data;
          console.log('🔍 Order data from API:', orderDataFromAPI);
          if (orderDataFromAPI && orderDataFromAPI.id) {
            setOrderData(orderDataFromAPI);
            console.log('✅ Order data set successfully');
          } else {
            console.log('❌ Invalid data from API:', orderDataFromAPI);
          }
        })
        .catch(error => {
          console.error('❌ API error:', error);
        })
        .finally(() => setLoading(false));
    }
  }, [appTransId]);

  // Reset giỏ hàng khi vào trang success (chỉ chạy một lần)
  useEffect(() => {
    if (!hasClearedCart.current) {
      console.log('🔄 QuickOrderSuccessPage: Clearing cart...');
      try {
        clearCart();
        console.log('✅ QuickOrderSuccessPage: Cart cleared successfully');
      } catch (error) {
        console.error('❌ QuickOrderSuccessPage: Error clearing cart:', error);
      }

      localStorage.removeItem('last_zalopay_order_url');
      localStorage.removeItem('last_zalopay_qr');
      localStorage.removeItem('last_zalopay_amount');
      localStorage.removeItem('last_zalopay_orderId');
      console.log('✅ QuickOrderSuccessPage: LocalStorage cleared');

      hasClearedCart.current = true;
      console.log('✅ QuickOrderSuccessPage: Cart clear flag set');
    }
  }, []);

  const getDishNameById = (dishId: string) => {
    const dish = dishes.find(d => d.id === dishId);
    return dish ? dish.name : 'Không rõ tên món';
  };

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return 'Không rõ';
    return [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email || 'Không rõ';
  };

  const printBill = () => {
    if (!orderData || dishes.length === 0) {
      console.log('Waiting for dishes to load...');
      return;
    }

    console.log('🔍 Order data:', orderData);
    console.log('🔍 Dishes loaded:', dishes.length);

    // Lấy method từ order nếu có, nếu không thì mặc định là zalopay
    let paymentMethod = orderData.method || 'zalopay';

    const items = (orderData.orderItems?.items || []).map((item: any) => {
      console.log('🔍 Processing item:', item);

      // Lấy basePrice từ item trực tiếp (như QuickOrderPage)
      let price = Number(item.basePrice) || 0;
      const quantity = Number(item.quantity) || 0;

      console.log('🔍 Price from basePrice:', price);

      // Nếu không có basePrice, thử lấy từ dish database
      if (price === 0) {
        const dish = dishes.find(d => d.id === item.dishId);
        console.log('🔍 Dish found:', dish);
        price = Number(dish?.basePrice) || 0;
        console.log('🔍 Price from dish:', price);
      }

      console.log('✅ Final calculated price:', price, 'for item:', item.name);

      return {
        name: getDishNameById(item.dishId) || item.dishSnapshot?.name || item.dish?.name || item.name || 'Không rõ tên món',
        quantity: quantity,
        price: price,
        total: price * quantity,
      };
    });

    // Nếu là đơn giao hàng, thêm phí ship
    if (orderData.type === 'delivery') {
      items.push({ name: 'Phí ship', quantity: '', price: 25000, total: 25000 });
    }

    const total = orderData.totalAmount || 0;

    // Lấy thông tin customer từ deliveryAddress
    const deliveryAddress = orderData.deliveryAddress || {};
    const customerName = deliveryAddress.name || getUserName(orderData.userId);
    const customerPhone = deliveryAddress.phone || orderData.customerPhone || users.find(u => u.id === orderData.userId)?.phoneNumber || '';
    const customerAddress = deliveryAddress.address || '';

    const date = orderData.createdAt ? new Date(orderData.createdAt).toLocaleDateString('vi-VN') : '';
    const adminId = orderData.updatedBy || '';

    console.log('📋 Final items for bill:', items);
    console.log('💰 Total:', total);
    console.log('👤 Customer info:', { customerName, customerPhone, customerAddress });

    const url = `/bill/preview?id=${orderData.id}&customer=${encodeURIComponent(customerName)}&items=${encodeURIComponent(JSON.stringify(items))}&total=${total}&customerAddress=${encodeURIComponent(customerAddress)}&customerPhone=${encodeURIComponent(customerPhone)}&date=${encodeURIComponent(date)}&order_number=${orderData.order_number || orderData.orderNumber || ''}&adminId=${encodeURIComponent(adminId)}&paymentMethod=${paymentMethod}`;
    navigate(url);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <div className="flex-1 p-6">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-lg bg-white p-8 shadow-lg">
            {/* Header */}
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Thank you !!!</h1>
              <p className="text-lg text-gray-600">Đặt hàng thành công</p>
            </div>

            {/* Order Information */}
            <div className="mb-8 rounded-lg border border-gray-200 p-6">
              <div className="mb-4 flex items-center">
                <FileText className="mr-2 h-5 w-5 text-gray-500" />
                <h2 className="text-lg font-semibold text-gray-900">Thông tin đơn hàng</h2>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Mã đơn hàng:</span>
                  <span className="font-semibold text-gray-900">#{orderNumber}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Tổng tiền:</span>
                  <span className="font-semibold text-gray-900">{Number(totalAmount || orderData?.totalAmount).toLocaleString('vi-VN')}₫</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Phương thức thanh toán:</span>
                  <span className="font-semibold text-gray-900">ZaloPay</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Trạng thái:</span>
                  <span className="font-semibold text-green-600">Chờ xác nhận</span>
                </div>
              </div>
            </div>

            {/* Message */}
            <div className="mb-8 text-center">
              <p className="mb-4 text-gray-600">
                Cảm ơn bạn đã đặt hàng tại <span className="font-semibold">BẾP CỦA MẸ</span>
              </p>
              <p className="mb-4 text-gray-600">
                Mã đơn hàng của bạn là: <span className="font-semibold">#{orderNumber}</span>
              </p>
            </div>

            {/* Contact Info */}
            <div className="rounded-lg bg-gray-50 p-6">
              <div className="flex items-center justify-center">
                <Phone className="mr-2 h-5 w-5 text-gray-500" />
                <span className="text-gray-600">
                  Mọi thắc mắc và yêu cầu hỗ trợ vui lòng liên hệ tổng đài CSKH:
                  <span className="font-semibold text-[#C92A15]"> 0337782571</span>
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex justify-center space-x-4">
              <button onClick={() => navigate('/admin')} className="rounded-lg bg-gray-200 px-6 py-3 text-gray-700 transition hover:bg-gray-300">
                Quay lại
              </button>
              <button
                onClick={printBill}
                disabled={dishes.length === 0}
                className={`rounded-lg px-6 py-3 text-white transition ${
                  dishes.length === 0 ? 'cursor-not-allowed bg-gray-400' : 'bg-[#C92A15] hover:bg-[#a81f0e]'
                }`}
              >
                {dishes.length === 0 ? 'Đang tải...' : 'In hóa đơn'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickOrderSuccessPage;
