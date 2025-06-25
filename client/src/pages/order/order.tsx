import type React from 'react';
import { Product } from '../Homepage';
import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Plus,
  Minus,
  ShoppingCart,
  MessageCircle,
} from 'lucide-react';
import { whatsappNumber, brand } from '../Homepage';
import axiosClient from '../../axiosClient/axiosClient';

interface CartItem {
  productId: string;
  quantity: number;
  productName: string;
  size: string;
  price: number;
}

const OrderPage = () => {
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    deliveryTime: '',
    specialInstructions: '',
  });
  const [showPayment, setShowPayment] = useState(false);

  const addToCart = (productId: string, size: string) => {
    const key = `${productId}-${size}`;
    setCart((prev) => ({
      ...prev,
      [key]: (prev[key] || 0) + 1,
    }));
  };

  const removeFromCart = (productId: string, size: string) => {
    const key = `${productId}-${size}`;
    setCart((prev) => {
      const newCart = { ...prev };
      if (newCart[key] > 1) {
        newCart[key]--;
      } else {
        delete newCart[key];
      }
      return newCart;
    });
  };

  const getCartTotal = () => {
    return Object.entries(cart).reduce((total, [key, quantity]) => {
      const [productId, size] = key.split('-');
      const product = products.find((p) => p._id === productId);
      if (product) {
        const p_size = product.sizes.find((p) => p.size === size) as {
          price: number;
        };
        const price = p_size.price;
        return total + price * quantity;
      }
      return total;
    }, 0);
  };

  const getCartItemCount = () => {
    return Object.values(cart).reduce((total, quantity) => total + quantity, 0);
  };

  const getCartItems = (): CartItem[] => {
    return Object.entries(cart).map(([key, quantity]) => {
      const [productId, size] = key.split('-');
      const product = products.find((p) => p._id === productId)!;
      const price = product.sizes.find((p) => p.size === size)?.price as number;
      return {
        productId,
        quantity,
        productName: product.name,
        size,
        price,
      };
    });
  };

  const send_order = async () => {
    const cartItems = getCartItems();
    const { name, phone, email, address, deliveryTime, specialInstructions } =
      customerInfo;
    const data = {
      name,
      phone,
      email,
      address,
      items: cartItems,
      deliveryTime,
      specialInstructions,
    };
    try {
      await axiosClient.post('/api/v1/orders ', data);
    } catch {
      alert('Order not sent');
    }
  };

  const sendWhatsAppOrder = async () => {
    try {
      send_order();
      const cartItems = getCartItems();
      let message = `🛒 *New Order from ${customerInfo.name}*\n\n`;

      message += `📞 Phone: ${customerInfo.phone}\n`;
      message += `📧 Email: ${customerInfo.email}\n`;
      message += `📍 Address: ${customerInfo.address}\n`;
      message += `⏰ Delivery Time: ${customerInfo.deliveryTime}\n\n`;

      message += `*Order Details:*\n`;
      const order = cartItems
        .map(
          (item) =>
            `• ${item.productName} (${item.size}) x ${item.quantity} - ₦${(
              item.price * item.quantity
            ).toLocaleString()}\n`
        )
        .join('');
      message += order;

      message += `\n💰 *Total: ₦${getCartTotal().toLocaleString()}*\n`;

      if (customerInfo.specialInstructions) {
        message += `\n📝 Special Instructions: ${customerInfo.specialInstructions}`;
      }

      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        message
      )}`;
      window.open(whatsappUrl, '_blank');
    } catch {
      alert('Order not sent');
    }
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.keys(cart).length === 0) {
      alert('Please add items to your cart');
      return;
    }
    setShowPayment(true);
  };
  const [products, set_products] = useState<Product[]>([]);

  useEffect(() => {
    (async () => {
      const response = await axiosClient.get('/api/v1/products');
      set_products(response.data);
    })();
  }, []);

  return (
    <>
      <div className='min-h-screen bg-gradient-to-b from-orange-50 to-white'>
        {/* Header */}
        <header className='bg-white shadow-sm border-b-2 border-orange-200'>
          <div className='container mx-auto px-4 py-4'>
            <div className='flex items-center justify-between'>
              <a
                href='/'
                className='flex items-center space-x-2 text-gray-700 hover:text-orange-600 transition-colors'
              >
                <ArrowLeft className='w-5 h-5' />
                <span>Back to Home</span>
              </a>
              <div className='flex items-center space-x-2'>
                <div className='w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center'>
                  <span className='text-white font-bold text-lg'>
                    {brand.abbr}
                  </span>
                </div>
                <div>
                  <h1 className='text-xl font-bold text-gray-800'>
                    Place Your Order
                  </h1>
                </div>
              </div>
              <div className='flex items-center space-x-2'>
                <ShoppingCart className='w-5 h-5 text-orange-600' />
                <span className='text-orange-600 font-semibold'>
                  {getCartItemCount()} items
                </span>
              </div>
            </div>
          </div>
        </header>

        <div className='container mx-auto px-4 py-8'>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
            {/* Products Section */}
            <div className='lg:col-span-2'>
              <h2 className='text-2xl font-bold text-gray-800 mb-6'>
                Select Your Snacks
              </h2>
              <div className='space-y-6'>
                {products.map((product) => (
                  <div
                    key={product.name}
                    className='bg-white rounded-lg shadow-lg border border-orange-100 overflow-hidden'
                  >
                    <div className='p-6'>
                      <div className='flex flex-col md:flex-row gap-4'>
                        <img
                          src={product.image || '/placeholder.svg'}
                          alt={product.name}
                          width={150}
                          height={150}
                          className='w-full md:w-32 h-32 object-cover rounded-lg'
                        />
                        <div className='flex-1'>
                          <h3 className='text-xl font-semibold text-gray-800 mb-2'>
                            {product.name}
                          </h3>
                          <p className='text-gray-600 mb-4'>
                            {product.description}
                          </p>
                          <div className='space-y-2'>
                            {product.sizes.map((size) => (
                              <div
                                key={size.size}
                                className='flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors'
                              >
                                <div>
                                  <span className='font-medium'>
                                    {size.size}{' '}
                                  </span>
                                  <span className='font-medium'>
                                    ({size.weight}g)
                                  </span>
                                  <span className='text-orange-600 font-bold ml-2'>
                                    ₦{size.price.toLocaleString()}
                                  </span>
                                </div>
                                <div className='flex items-center space-x-2'>
                                  <button
                                    onClick={() =>
                                      removeFromCart(product._id, size.size)
                                    }
                                    disabled={
                                      !cart[`${product._id}-${size.size}`]
                                    }
                                    className='w-8 h-8 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                                  >
                                    <Minus className='w-4 h-4' />
                                  </button>
                                  <span className='w-8 text-center font-medium'>
                                    {cart[`${product._id}-${size.size}`] || 0}
                                  </span>
                                  <button
                                    onClick={() =>
                                      addToCart(product._id, size.size)
                                    }
                                    className='w-8 h-8 bg-orange-600 hover:bg-orange-700 text-white rounded-lg flex items-center justify-center transition-colors'
                                  >
                                    <Plus className='w-4 h-4' />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <button className='border-2 border-orange-700 text-orange-600 hover:bg-orange-200 text-lg px-8 py-3 rounded-lg font-medium transition-colors '>
                  RESET
                </button>
              </div>
            </div>

            {/* Order Summary and Customer Info */}
            <div className='space-y-6'>
              {/* Cart Summary */}
              <div className='bg-white rounded-lg shadow-lg border border-orange-200 overflow-hidden'>
                <div className='bg-orange-600 text-white p-4'>
                  <h3 className='text-lg font-semibold'>Order Summary</h3>
                </div>
                <div className='p-4'>
                  {Object.keys(cart).length === 0 ? (
                    <p className='text-gray-500'>Your cart is empty</p>
                  ) : (
                    <div className='space-y-2'>
                      {Object.entries(cart).map(([key, quantity]) => {
                        const [productId, sizeIndex] = key.split('-');
                        const product = products.find(
                          (p) => p._id === productId
                        );
                        if (!product) return null;
                        const option = product.sizes.find(
                          (s) => s.size === sizeIndex
                        );
                        const size = option?.size as string;
                        const price = option?.price as number;
                        return (
                          <div
                            key={key}
                            className='flex justify-between text-sm'
                          >
                            <span>
                              {product.name} ({size}) x {quantity}
                            </span>
                            <span>₦{(price * quantity).toLocaleString()}</span>
                          </div>
                        );
                      })}
                      <div className='border-t pt-2 mt-2'>
                        <div className='flex justify-between font-bold'>
                          <span>Total:</span>
                          <span className='text-orange-600'>
                            ₦{getCartTotal().toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Customer Information Form */}
              <div className='bg-white rounded-lg shadow-lg border border-orange-200 overflow-hidden'>
                <div className='bg-orange-600 text-white p-4'>
                  <h3 className='text-lg font-semibold'>
                    Delivery Information
                  </h3>
                </div>
                <div className='p-4'>
                  <form onSubmit={handleSubmitOrder} className='space-y-4'>
                    <div>
                      <label
                        htmlFor='name'
                        className='block text-sm font-medium text-gray-700 mb-1'
                      >
                        Full Name *
                      </label>
                      <input
                        id='name'
                        type='text'
                        required
                        value={customerInfo.name}
                        onChange={(e) =>
                          setCustomerInfo((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent'
                      />
                    </div>
                    <div>
                      <label
                        htmlFor='phone'
                        className='block text-sm font-medium text-gray-700 mb-1'
                      >
                        Phone Number *
                      </label>
                      <input
                        id='phone'
                        type='tel'
                        required
                        value={customerInfo.phone}
                        onChange={(e) =>
                          setCustomerInfo((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }))
                        }
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent'
                      />
                    </div>
                    <div>
                      <label
                        htmlFor='email'
                        className='block text-sm font-medium text-gray-700 mb-1'
                      >
                        Email *
                      </label>
                      <input
                        id='email'
                        type='email'
                        required
                        value={customerInfo.email}
                        onChange={(e) =>
                          setCustomerInfo((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent'
                      />
                    </div>
                    <div>
                      <label
                        htmlFor='address'
                        className='block text-sm font-medium text-gray-700 mb-1'
                      >
                        Delivery Address *
                      </label>
                      <textarea
                        id='address'
                        required
                        rows={3}
                        value={customerInfo.address}
                        onChange={(e) =>
                          setCustomerInfo((prev) => ({
                            ...prev,
                            address: e.target.value,
                          }))
                        }
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent'
                      />
                    </div>
                    <div>
                      <label
                        htmlFor='deliveryTime'
                        className='block text-sm font-medium text-gray-700 mb-1'
                      >
                        Preferred Delivery Time
                      </label>
                      <select
                        id='deliveryTime'
                        value={customerInfo.deliveryTime}
                        onChange={(e) =>
                          setCustomerInfo((prev) => ({
                            ...prev,
                            deliveryTime: e.target.value,
                          }))
                        }
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent'
                      >
                        <option value=''>Select delivery time</option>
                        <option value='morning'>Morning (9AM - 12PM)</option>
                        <option value='afternoon'>
                          Afternoon (12PM - 4PM)
                        </option>
                        <option value='evening'>Evening (4PM - 7PM)</option>
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor='instructions'
                        className='block text-sm font-medium text-gray-700 mb-1'
                      >
                        Special Instructions
                      </label>
                      <textarea
                        id='instructions'
                        rows={3}
                        placeholder='Any special requests or instructions...'
                        value={customerInfo.specialInstructions}
                        onChange={(e) =>
                          setCustomerInfo((prev) => ({
                            ...prev,
                            specialInstructions: e.target.value,
                          }))
                        }
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent'
                      />
                    </div>

                    {!showPayment ? (
                      <button
                        type='submit'
                        disabled={Object.keys(cart).length === 0}
                        className='w-full bg-orange-600 hover:bg-orange-700 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                      >
                        Continue to Payment (₦{getCartTotal().toLocaleString()})
                      </button>
                    ) : (
                      <div className='space-y-3'>
                        {/* <button
                          type='button'
                          onClick={handlePaystackPayment}
                          className='w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors'
                        >
                          Pay with Paystack (₦{getCartTotal().toLocaleString()})
                        </button> */}
                        <button
                          type='button'
                          onClick={sendWhatsAppOrder}
                          className='w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2'
                        >
                          <MessageCircle className='w-5 h-5' />
                          <span>Order via WhatsApp</span>
                          {/* TODO: add a means to the backend to send email for the order */}
                        </button>
                        <button
                          type='button'
                          onClick={() => setShowPayment(false)}
                          className='w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors'
                        >
                          Back to Order Details
                        </button>
                      </div>
                    )}
                  </form>
                </div>
              </div>

              {/* Contact Info */}
              <div className='bg-white rounded-lg shadow-lg border border-orange-200 overflow-hidden'>
                <div className='p-4'>
                  <h4 className='font-semibold mb-2'>Need Help?</h4>
                  <p className='text-sm text-gray-600 mb-2'>Call us at:</p>
                  <p className='text-sm font-medium'>{brand.phoneNumber1}</p>
                  <p className='text-sm font-medium'>{brand.phoneNumber2}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderPage;
