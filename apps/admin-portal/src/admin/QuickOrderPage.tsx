import React, { useContext, useEffect, useState } from 'react';
import { ArrowLeft, ShoppingCart, User as UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import AdminSidebar from '../components/AdminSidebar';
import { AuthContext } from '../context/AuthContext';
import { getAllCategories } from '../services/category.api';
import { getAllDishes } from '../services/dish.api';
import { createOrder } from '../services/order.api';

import '../css/QuickOrderPage.css';

interface CartItem {
  id: string;
  name: string;
  basePrice: number;
  quantity: number;
}

export default function QuickOrderPage() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [categories, setCategories] = useState<any[]>([]);
  const [dishes, setDishes] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem('quick_order_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'zalopay'>('cash');

  // State cho popup in hóa đơn
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<any>(null);

  // Lưu cart vào localStorage mỗi khi cart thay đổi
  useEffect(() => {
    localStorage.setItem('quick_order_cart', JSON.stringify(cart));
  }, [cart]);

  // Xóa cart khỏi localStorage khi component unmount hoặc khi tạo đơn hàng thành công
  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('quick_order_cart');
  };

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login', { replace: true });
      return;
    }

    const loadData = async () => {
      try {
        const [categoriesRes, dishesRes] = await Promise.all([getAllCategories(), getAllDishes()]);

        setCategories(categoriesRes.filter((category: any) => category.isActive));
        setDishes(dishesRes.filter((dish: any) => dish.status === 'available'));
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setPageLoading(false);
      }
    };

    loadData();
  }, [user, navigate]);

  const addToCart = (dish: any) => {
    const existingItem = cart.find(item => item.id === dish.id);
    if (existingItem) {
      setCart(cart.map(item => (item.id === dish.id ? { ...item, quantity: item.quantity + 1 } : item)));
    } else {
      setCart([...cart, { ...dish, quantity: 1 }]);
    }
  };

  const removeFromCart = (dishId: string) => {
    setCart(cart.filter(item => item.id !== dishId));
  };

  const updateQuantity = (dishId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(dishId);
    } else {
      setCart(cart.map(item => (item.id === dishId ? { ...item, quantity } : item)));
    }
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + Number(item.basePrice) * item.quantity, 0);
  };

  const handleCreateOrder = async () => {
    if (cart.length === 0) {
      alert('Vui lòng thêm món ăn vào giỏ hàng');
      return;
    }

    if (!user?.id) {
      alert('Vui lòng đăng nhập để tạo đơn hàng');
      return;
    }

    setLoading(true);
    try {
      if (paymentMethod === 'zalopay') {
        // Chuyển đến QuickOrderZaloPayPage cho ZaloPay
        navigate('/quick-order-zalopay', {
          state: {
            items: cart,
            customer: { name: user?.firstName + ' ' + user?.lastName, phone: user?.phoneNumber || '' },
            store: { name: 'Mua trực tiếp tại cửa hàng', address: 'Mua trực tiếp tại cửa hàng' },
            orderType: 'pickup',
            shippingFee: 0,
            deliveryAddress: 'Mua trực tiếp tại cửa hàng',
            subtotal: getTotalAmount(),
            totalAmount: getTotalAmount(),
            userId: user?.id,
            pickupTime: new Date().toISOString(),
          },
        });
        return;
      }

      // Tạo đơn hàng trực tiếp cho tiền mặt
      const orderData = {
        userId: user?.id, // Sử dụng admin ID thay vì null
        type: 'pickup', // Mặc định pickup
        paymentMethod: paymentMethod,
        orderItems: {
          items: cart.map(item => ({
            dishId: item.id,
            quantity: item.quantity,
            price: Number(item.basePrice) * item.quantity,
            name: item.name,
            basePrice: item.basePrice,
          })),
        },
        totalAmount: getTotalAmount(),
        status: 'completed', // Đã hoàn thành cho cả tiền mặt và ZaloPay (QuickOrderPage)
        createdBy: user?.id, // Thêm createdBy
        deliveryAddress: {
          address: 'Mua trực tiếp tại cửa hàng',
          storeName: 'Mua trực tiếp tại cửa hàng',
        },
      };

      const createdOrder = await createOrder(orderData);
      console.log('🔍 Created order response:', createdOrder);
      console.log('🔍 Order status:', createdOrder.status);
      console.log('🔍 Order paymentMethod:', createdOrder.paymentMethod);

      // Tạo transaction cho đơn hàng cash
      if (paymentMethod === 'cash') {
        try {
          const transactionData = {
            userId: user?.id,
            orderId: createdOrder.id || createdOrder.data?.id,
            amount: getTotalAmount(),
            method: 'cash',
            status: 'success', // Cash transactions thành công ngay
            description: `Tạo giao dịch cho đơn hàng #${createdOrder.order_number || createdOrder.orderNumber || createdOrder.id}`,
          };

          await fetch('/api/v1/user-transaction', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(transactionData),
          });

          console.log('🔍 Created cash transaction for order:', createdOrder.id);
        } catch (error) {
          console.error('Error creating cash transaction:', error);
        }
      }

      setCreatedOrder(createdOrder); // Lưu đơn hàng để in
      setShowPrintModal(true); // Hiển thị popup in hóa đơn
      alert('Tạo đơn hàng thành công!');
      clearCart();
      setPaymentMethod('cash');
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Tạo đơn hàng thất bại');
    } finally {
      setLoading(false);
    }
  };

  const filteredDishes = selectedCategory ? dishes.filter(dish => dish.categoryId === selectedCategory) : dishes;

  const searchAndCategoryFilteredDishes = filteredDishes.filter(
    dish => dish.name.toLowerCase().includes(search.toLowerCase()) || dish.description?.toLowerCase().includes(search.toLowerCase()),
  );

  if (pageLoading) return <div>Loading...</div>;

  return (
    <div className="admin-layout bg-gray-50">
      <div className="admin-sidebar-fixed">
        <AdminSidebar />
      </div>
      <div className="admin-main-content">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#C92A15]">Quick Order</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <UserIcon size={20} />
              <span className="font-medium">
                {user?.firstName} {user?.lastName}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Panel - Categories and Dishes */}
          <div className="lg:col-span-2">
            {/* Category Filter */}
            <div className="mb-6">
              <h2 className="mb-3 text-lg font-semibold">Danh mục</h2>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                    selectedCategory === '' ? 'bg-[#C92A15] text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Tất cả
                </button>
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                      selectedCategory === category.id ? 'bg-[#C92A15] text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm món ăn..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-[#C92A15]"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Dishes Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {searchAndCategoryFilteredDishes.map(dish => (
                <div
                  key={dish.id}
                  className="cursor-pointer rounded-lg bg-white p-4 shadow-sm transition hover:shadow-md"
                  onClick={() => addToCart(dish)}
                >
                  <div className="mb-2">
                    <h3 className="font-medium text-gray-900">{dish.name}</h3>
                    <p className="text-sm text-gray-500">{dish.description}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-[#C92A15]">{Number(dish.basePrice).toLocaleString('vi-VN')}₫</span>
                    <button className="rounded bg-[#C92A15] px-3 py-1 text-sm text-white hover:bg-[#a81f0e]">Thêm</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel - Cart */}
          <div className="lg:col-span-1">
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingCart size={20} />
                  <h2 className="text-lg font-semibold">Giỏ hàng</h2>
                </div>
                {cart.length > 0 && (
                  <button onClick={clearCart} className="rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600" title="Xóa tất cả món ăn">
                    Xóa giỏ hàng
                  </button>
                )}
              </div>

              {/* Cart Items */}
              <div className="mb-4 max-h-64 overflow-y-auto">
                {cart.length === 0 ? (
                  <p className="text-center text-gray-500">Giỏ hàng trống</p>
                ) : (
                  <div className="space-y-2">
                    {cart.map(item => (
                      <div key={item.id} className="flex items-center justify-between rounded border p-2">
                        <div className="flex-1">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-500">
                            {Number(item.basePrice).toLocaleString('vi-VN')}₫ x {item.quantity}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="rounded bg-gray-200 px-2 py-1 text-sm hover:bg-gray-300"
                          >
                            -
                          </button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="rounded bg-gray-200 px-2 py-1 text-sm hover:bg-gray-300"
                          >
                            +
                          </button>
                          <button onClick={() => removeFromCart(item.id)} className="ml-2 text-red-500 hover:text-red-700">
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Total */}
              {cart.length > 0 && (
                <div className="mb-4 border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Tổng cộng:</span>
                    <span>{getTotalAmount().toLocaleString('vi-VN')}₫</span>
                  </div>
                </div>
              )}

              {/* Payment Method Selection */}
              {cart.length > 0 && (
                <div className="mb-4">
                  <label className="mb-2 block text-sm font-medium">Phương thức thanh toán:</label>
                  <div className="space-y-2">
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cash"
                        checked={paymentMethod === 'cash'}
                        onChange={e => setPaymentMethod(e.target.value as 'cash' | 'zalopay')}
                        className="text-[#C92A15] focus:ring-[#C92A15]"
                      />
                      <span>Tiền mặt</span>
                    </label>
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="zalopay"
                        checked={paymentMethod === 'zalopay'}
                        onChange={e => setPaymentMethod(e.target.value as 'cash' | 'zalopay')}
                        className="text-[#C92A15] focus:ring-[#C92A15]"
                      />
                      <span>ZaloPay</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Create Order Button */}
              <button
                onClick={handleCreateOrder}
                disabled={loading || cart.length === 0}
                className="w-full rounded-lg bg-[#C92A15] py-3 font-medium text-white transition hover:bg-[#a81f0e] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'Đang tạo đơn hàng...' : 'Tạo đơn hàng'}
              </button>
            </div>
          </div>
        </div>

        {/* Print Modal */}
        {showPrintModal && createdOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
              <h3 className="mb-4 text-xl font-bold text-[#C92A15]">Đơn hàng đã tạo thành công!</h3>
              <div className="mb-4 space-y-2">
                <p>
                  <strong>Mã đơn hàng:</strong> #{createdOrder.order_number || createdOrder.id}
                </p>
                <p>
                  <strong>Tổng tiền:</strong> {Number(createdOrder.totalAmount).toLocaleString('vi-VN')}₫
                </p>
                <p>
                  <strong>Phương thức thanh toán:</strong> {createdOrder.paymentMethod === 'cash' ? 'Tiền mặt' : 'ZaloPay'}
                </p>
                <p>
                  <strong>Trạng thái:</strong> Đã hoàn thành
                </p>
                <p>
                  <strong>Địa chỉ:</strong> {createdOrder.deliveryAddress?.address || 'Tại cửa hàng'}
                </p>
              </div>

              <div className="mb-4">
                <p className="mb-2 font-medium">Danh sách món ăn:</p>
                <div className="max-h-32 overflow-y-auto">
                  {createdOrder.orderItems?.items?.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between border-b border-gray-100 py-1">
                      <span>{item.name}</span>
                      <span>
                        {item.quantity} x {Number(item.basePrice).toLocaleString('vi-VN')}₫
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    // In hóa đơn
                    const items =
                      createdOrder.orderItems?.items?.map((item: any) => ({
                        name: item.name,
                        quantity: item.quantity,
                        price: Number(item.basePrice),
                        total: Number(item.basePrice) * item.quantity,
                      })) || [];

                    const url = `/bill/preview?id=${createdOrder.id}&customer=Khách ngoài&items=${encodeURIComponent(JSON.stringify(items))}&total=${createdOrder.totalAmount}&customerAddress=Tại cửa hàng&customerPhone=&date=${new Date().toLocaleDateString('vi-VN')}&order_number=${createdOrder.order_number || createdOrder.id}&adminId=${user?.id || ''}&paymentMethod=${paymentMethod}`;
                    navigate(url);
                    setShowPrintModal(false);
                  }}
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  In hóa đơn
                </button>
                <button onClick={() => setShowPrintModal(false)} className="flex-1 rounded-lg bg-gray-500 px-4 py-2 text-white hover:bg-gray-600">
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
