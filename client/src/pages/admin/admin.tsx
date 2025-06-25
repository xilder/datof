import type React from 'react';
import moment from 'moment';
import { useState, useEffect, SyntheticEvent } from 'react';
import {
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  Download,
  Minus,
} from 'lucide-react';
import axiosClient from '../../axiosClient/axiosClient';
import { brand } from '../Homepage';

export interface Order {
  _id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  items: Array<{
    productName: string;
    size: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed';
  createdAt: string;
  deliveryTime?: string;
}

interface Product {
  _id?: string;
  name: string;
  description: string;
  sizes: Array<{
    size: string;
    price: number;
    weight: number;
  }>;
  active: boolean;
}

const defaultProduct: Product = {
  name: '',
  description: '',
  sizes: [],
  active: true,
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<
    'orders' | 'products' | 'analytics'
  >('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [selectedProduct, setSelectedProduct] = useState({} as Product);
  const [showEditPage, setShowEditPage] = useState(false);

  useEffect(() => {
    const get_orders = async () => {
      try {
        const response = await axiosClient.get('/api/v1/orders');
        setOrders(response.data);
      } catch {
        alert('Orders not loaded');
      }
    };
    const get_products = async () => {
      try {
        const response = await axiosClient.get('/api/v1/products');
        setProducts(response.data);
      } catch (e) {
        setIsAuthenticated(false);
        alert('Products not loaded');
      }
    };

    if (isAuthenticated) {
      get_orders();
      get_products();
    }
  }, [isAuthenticated]);

  const get_products = async () => {
    try {
      const response = await axiosClient.get('/api/v1/products');
      setProducts(response.data);
    } catch {
      setIsAuthenticated(false);
      alert('Products not loaded');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axiosClient.post('/api/v1/auth', { ...loginForm });
      localStorage.setItem('DATOF_TOKEN', response.data.token);
      setIsAuthenticated(true);
      setLoginForm({ username: '', password: '' })
    } catch {
      alert('Invalid credentials');
    }
  };

  const handleLogout = async () => {
    await axiosClient.delete('/api/v1/auth');
    setIsAuthenticated(false);
    localStorage.removeItem('DATOF_TOKEN');
    setOrders([]);
    setProducts([]);
  };

  const updateOrder = async (id: Order['_id']) => {
    const order = orders.find((order) => order._id === id) as Order;
    const update = window.confirm(
      `You are about to edit order with id: ${order._id}.\n` +
        `Payment Status: ${order.paymentStatus}.\n` +
        `Delivery Status: ${order.status}`
    );
    if (update) {
      try {
        await axiosClient.patch(`/api/v1/orders/${order._id}`, order);
      } catch {
        alert('Update failed');
      }
    }
  };

  const updateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    setOrders((prev) =>
      prev.map((order) =>
        order._id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  const updateOrderPaymentStatus = (
    orderId: string,
    newStatus: Order['paymentStatus']
  ) => {
    setOrders((prev) =>
      prev.map((order) =>
        order._id === orderId ? { ...order, paymentStatus: newStatus } : order
      )
    );
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order._id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'preparing':
        return 'bg-orange-100 text-orange-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (paymentStatus: Order['paymentStatus']) => {
    switch (paymentStatus) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTotalRevenue = () => {
    return orders
      .filter(
        (order) =>
          order.paymentStatus === 'paid' && order.status !== 'cancelled'
      )
      .reduce((total, order) => {
        const item_total = order.items.reduce(
          (prev, curr) => prev + curr.price * curr.quantity,
          0
        );
        return total + item_total;
      }, 0);
  };

  const getTodayOrders = () => {
    const today = new Date().toDateString();
    return orders.filter(
      (order) => new Date(order.createdAt).toDateString() === today
    ).length;
  };
  const addProductOption = () => {
    const size = { size: '', weight: 0, price: 0 };
    const { sizes } = selectedProduct;
    sizes.push(size);
    setSelectedProduct((prev) => ({
      ...prev,
      sizes: [...sizes],
    }));
  };

  const removeProductOption = (index: number) => {
    const sizes = [...selectedProduct.sizes];
    sizes.splice(index, 1);
    setSelectedProduct((prev) => ({
      ...prev,
      sizes: [...sizes],
    }));
  };

  const editProduct = (_id?: string) => {
    if (!_id) {
      setSelectedProduct(defaultProduct);
      setShowEditPage(true);
      return;
    }
    const product = products.find((product) => product._id === _id);
    if (!product) return;
    setSelectedProduct(product);
    setShowEditPage(true);
  };

  const cancelEditProduct = () => {
    setSelectedProduct(defaultProduct);
    setShowEditPage(false);
  };

  const handleSubmitProduct = async (e: SyntheticEvent) => {
    e.preventDefault();
    try {
      const update = window.confirm(
        'Are you willing to make these changes to these product'
      );
      if (!update) return;
      if (selectedProduct._id) {
        await axiosClient.patch(`/api/v1/products/${selectedProduct._id}`, {
          ...selectedProduct,
        });
      } else {
        await axiosClient.post(`/api/v1/products/`, {
          ...selectedProduct,
        });
      }
      setSelectedProduct(defaultProduct);
      setShowEditPage(false);
      get_products();
    } catch {
      alert('Failed to update product');
    }
  };

  const deleteProduct = async (_id: string, name: string) => {
    const deleteItem = window.confirm(
      `Are you willing to delete ${name} from you products`
    );
    if (!deleteItem) return;
    try {
      await axiosClient.delete(`/api/v1/products/${_id}`);
      get_products();
    } catch {
      alert(`failed to delete product ${name}`);
    }
  };

  if (!isAuthenticated) { 
    return (
      <div className='min-h-screen bg-gray-100 flex items-center justify-center'>
        <div className='bg-white p-8 rounded-lg shadow-lg w-full max-w-md'>
          <div className='text-center mb-6'>
            <div className='w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4'>
              <span className='text-white font-bold text-2xl uppercase'>
                {brand.abbr}
              </span>
            </div>
            <h1 className='text-2xl font-bold text-gray-800'>Admin Login</h1>
          </div>
          <form onSubmit={handleLogin} className='space-y-4'>
            <div>
              <label
                htmlFor='username'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                Username
              </label>
              <input
                id='username'
                type='text'
                required
                value={loginForm.username}
                onChange={(e) =>
                  setLoginForm((prev) => ({
                    ...prev,
                    username: e.target.value,
                  }))
                }
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500'
                placeholder='Enter username'
              />
            </div>
            <div>
              <label
                htmlFor='password'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                Password
              </label>
              <input
                id='password'
                type='password'
                required
                value={loginForm.password}
                onChange={(e) =>
                  setLoginForm((prev) => ({
                    ...prev,
                    password: e.target.value,
                  }))
                }
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500'
                placeholder='Enter password'
              />
            </div>
            <button
              type='submit'
              className='w-full bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg font-medium transition-colors'
            >
              Login
            </button>
          </form>
          {/* <div className='mt-4 text-center text-sm text-gray-500'>
            Demo credentials: admin / naija2024
          </div> */}
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-100'>
      {/* Header */}
      <header className='bg-white shadow-sm border-b'>
        <div className='px-6 py-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-4'>
              <a href='/' className='flex items-center space-x-2'>
                <div className='w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center'>
                  <span className='text-white font-bold text-lg uppercase'>
                    {brand.abbr}
                  </span>
                </div>
                <div>
                  <h1 className='text-xl font-bold text-gray-800'>
                    {brand.name} Admin
                  </h1>
                  <p className='text-sm text-gray-600'>Dashboard</p>
                </div>
              </a>
            </div>
            <button
              onClick={handleLogout}
              className='bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors'
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className='flex relative'>
        {/* Sidebar */}
        <aside className='w-64 hidden md:flex bg-white shadow-sm min-h-screen'>
          <nav className='p-4'>
            <div className='space-y-2'>
              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full text-left px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'orders'
                    ? 'bg-orange-100 text-orange-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Orders
              </button>
              <button
                onClick={() => setActiveTab('products')}
                className={`w-full text-left px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'products'
                    ? 'bg-orange-100 text-orange-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Products
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`w-full text-left px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'analytics'
                    ? 'bg-orange-100 text-orange-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Analytics
              </button>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className='flex-1 p-6'>
          {activeTab === 'orders' && (
            <div>
              <div className='flex items-center justify-between mb-6'>
                <h2 className='text-2xl font-bold text-gray-800'>
                  Orders Management
                </h2>
                <button className='bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2'>
                  <Download className='w-4 h-4' />
                  <span>Export</span>
                </button>
              </div>

              {/* Filters */}
              <div className='bg-white rounded-lg shadow-sm p-4 mb-6'>
                <div className='flex flex-col md:flex-row gap-4'>
                  <div className='flex-1'>
                    <div className='relative'>
                      <Search className='w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
                      <input
                        type='text'
                        placeholder='Search orders...'
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500'
                      />
                    </div>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <Filter className='w-5 h-5 text-gray-400' />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className='px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500'
                    >
                      <option value='all'>All Status</option>
                      <option value='pending'>Pending</option>
                      <option value='confirmed'>Confirmed</option>
                      <option value='preparing'>Preparing</option>
                      <option value='delivered'>Delivered</option>
                      <option value='cancelled'>Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Orders Table */}
              <div className='bg-white rounded-lg shadow-sm overflow-hidden'>
                <div className='overflow-x-auto'>
                  <table className='w-full'>
                    <thead className='bg-gray-50'>
                      <tr>
                        <th className='px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Order Information
                        </th>
                        <th className='px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Items
                        </th>
                        <th className='px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Total
                        </th>
                        <th className='px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Status
                        </th>
                        <th className='px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Payment
                        </th>
                        <th className='px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className='bg-white divide-y divide-gray-200'>
                      {filteredOrders.map((order) => {
                        const total = order.items.reduce((prev, curr) => {
                          return prev + curr.price * curr.quantity;
                        }, 0);
                        return (
                          <tr key={order._id} className='hover:bg-gray-50'>
                            <td className='px-3 py-4 whitespace-nowrap'>
                              <div>
                                <div className='text-sm font-medium text-gray-90'>
                                  {order._id}
                                </div>
                                <div className='text-sm font-medium text-gray-900'>
                                  {order.name}
                                </div>
                                <div className='text-sm text-gray-500'>
                                  {order.email}
                                </div>
                                <div className='text-sm text-gray-500'>
                                  {order.phone}
                                </div>
                                <div className='text-sm text-gray-500'>
                                  {order.address}
                                </div>
                                <div className='text-sm font-medium text-gray-90'>
                                  {moment(order.createdAt).format(
                                    'dddd, MMMM Do, YYYY'
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className='px-3 py-4'>
                              <div className='text-sm text-gray-900'>
                                {order.items.map((item, index) => (
                                  <div key={index}>
                                    {item.productName} ({item.size}) x
                                    {item.quantity}
                                  </div>
                                ))}
                              </div>
                            </td>
                            <td className='px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                              ₦{total.toLocaleString()}
                            </td>
                            <td className='px-3 py-4 whitespace-nowrap'>
                              <select
                                value={order.status}
                                onChange={(e) =>
                                  updateOrderStatus(
                                    order._id,
                                    e.target.value as Order['status']
                                  )
                                }
                                className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                                  order.status
                                )} border-0 focus:outline-none focus:ring-2 focus:ring-orange-500`}
                              >
                                <option value='pending'>Pending</option>
                                <option value='confirmed'>Confirmed</option>
                                <option value='preparing'>Preparing</option>
                                <option value='delivered'>Delivered</option>
                                <option value='cancelled'>Cancelled</option>
                              </select>
                            </td>
                            <td className='px-3 py-4 whitespace-nowrap'>
                              <select
                                value={order.paymentStatus}
                                onChange={(e) =>
                                  updateOrderPaymentStatus(
                                    order._id,
                                    e.target.value as Order['paymentStatus']
                                  )
                                }
                                className={`px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(
                                  order.paymentStatus
                                )} border-0 focus:outline-none focus:ring-2 focus:ring-orange-500`}
                              >
                                <option value='paid'>Paid</option>
                                <option value='pending'>Pending</option>
                                <option value='failed'>Failed</option>
                              </select>
                            </td>
                            <td className='px-3 py-4 whitespace-nowrap text-sm font-medium'>
                              <div className='flex space-x-2'>
                                {/* <button className='text-blue-600 hover:text-blue-900'>
                                  <Eye className='w-4 h-4' />
                                </button> */}
                                <button
                                  onClick={() => updateOrder(order._id)}
                                  className='text-green-600 hover:text-green-900'
                                >
                                  <Edit className='w-4 h-4' />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div>
              <div className='flex items-center justify-between mb-6'>
                <h2 className='text-2xl font-bold text-gray-800'>
                  Products Management
                </h2>
                <button
                  className='bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2'
                  onClick={() => editProduct()}
                >
                  <Plus className='w-4 h-4' />
                  <span>Add Product</span>
                </button>
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {products.map((product) => (
                  <div
                    key={product._id}
                    className='bg-white rounded-lg shadow-sm border overflow-hidden'
                  >
                    <div className='p-6'>
                      <div className='flex items-center justify-between mb-4'>
                        <h3 className='text-lg font-semibold text-gray-800'>
                          {product.name}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            product.active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {product.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className='text-gray-600 mb-4'>
                        {product.description}
                      </p>
                      <div className='space-y-2 mb-4'>
                        {product.sizes.map((size, index) => (
                          <div
                            key={index}
                            className='flex justify-between text-sm'
                          >
                            <span>{size.size}</span>
                            <span className='font-medium'>
                              ₦{size.price.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className='flex space-x-2'>
                        <button
                          className='flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors'
                          onClick={() => editProduct(product._id)}
                        >
                          Edit
                        </button>
                        <button
                          className='bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors'
                          onClick={() =>
                            deleteProduct(product._id as string, product.name)
                          }
                        >
                          <Trash2 className='w-4 h-4' />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div>
              <h2 className='text-2xl font-bold text-gray-800 mb-6'>
                Analytics Dashboard
              </h2>

              {/* Stats Cards */}
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
                <div className='bg-white rounded-lg shadow-sm p-6'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-sm font-medium text-gray-600'>
                        Total Revenue
                      </p>
                      <p className='text-2xl font-bold text-gray-900'>
                        ₦{getTotalRevenue().toLocaleString()}
                      </p>
                    </div>
                    <div className='w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center'>
                      <span className='text-green-600 text-xl'>₦</span>
                    </div>
                  </div>
                </div>

                <div className='bg-white rounded-lg shadow-sm p-6'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-sm font-medium text-gray-600'>
                        Total Orders
                      </p>
                      <p className='text-2xl font-bold text-gray-900'>
                        {orders.length}
                      </p>
                    </div>
                    <div className='w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center'>
                      <span className='text-blue-600 text-xl'>#</span>
                    </div>
                  </div>
                </div>

                <div className='bg-white rounded-lg shadow-sm p-6'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-sm font-medium text-gray-600'>
                        Today's Orders
                      </p>
                      <p className='text-2xl font-bold text-gray-900'>
                        {getTodayOrders()}
                      </p>
                    </div>
                    <div className='w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center'>
                      <span className='text-orange-600 text-xl'>📦</span>
                    </div>
                  </div>
                </div>

                <div className='bg-white rounded-lg shadow-sm p-6'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-sm font-medium text-gray-600'>
                        Active Products
                      </p>
                      <p className='text-2xl font-bold text-gray-900'>
                        {products.filter((p) => p.active).length}
                      </p>
                    </div>
                    <div className='w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center'>
                      <span className='text-purple-600 text-xl'>🍰</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Orders */}
              <div className='bg-white rounded-lg shadow-sm'>
                <div className='p-6 border-b'>
                  <h3 className='text-lg font-semibold text-gray-800'>
                    Recent Orders
                  </h3>
                </div>
                <div className='p-6'>
                  <div className='space-y-4'>
                    {orders.slice(0, 10).map((order) => {
                      const total = order.items.reduce((prev, curr) => {
                        return prev + curr.price * curr.quantity;
                      }, 0);
                      return (
                        <div
                          key={order._id}
                          className='flex items-center justify-between p-4 bg-gray-50 rounded-lg'
                        >
                          <div>
                            <p className='font-medium text-gray-900'>
                              {order.name}
                            </p>
                            <p className='text-sm text-gray-600'>
                              {order._id} •{' '}
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className='text-right'>
                            <p className='font-medium text-gray-900'>
                              ₦{total.toLocaleString()}
                            </p>
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                                order.status
                              )}`}
                            >
                              {order.status}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
      {showEditPage && (
        <div className='flex flex-col bg-[#FFFFFFDD] shadow-sm z-50 absolute top-0 w-full left-0 min-h-screen items-center justify-center overflow-auto'>
          <h2 className='uppercase text-2xl font-medium m-4'>Edit Product</h2>
          <form className='space-y-2 mx-10 my-5 px-8 py-3 flex flex-col flex-1 bg-white rounded-lg shadow-sm border opacity-100 '>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Product Name:
              </label>
              <input
                className='px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 w-full'
                type='text'
                required
                name='name'
                value={selectedProduct.name}
                onChange={(e) =>
                  setSelectedProduct((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Product Description:
              </label>
              <textarea
                className='px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 w-full'
                required
                name='description'
                value={selectedProduct.description}
                onChange={(e) =>
                  setSelectedProduct((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </div>
            <div className='flex flex-col h-fit'>
              <h2 className='text-sm font-medium text-gray-700 mb-1'>
                Product Options:
              </h2>
              <div className='flex flex-col overflow-y-scroll pr-5'>
                {selectedProduct.sizes.map((size, index) => {
                  return (
                    <div className='flex'>
                      <div className='grid grid-cols-1 md:grid-cols-3 flex-1'>
                        {Object.entries(size).map(([key, value]) => {
                          if (!['size', 'weight', 'price'].includes(key))
                            return null;
                          return (
                            <div>
                              <label className='block text-sm font-medium text-gray-700 mb-1'>
                                {key}:
                              </label>
                              <input
                                className='px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 w-1/2'
                                type={key === 'size' ? 'text' : 'number'}
                                required
                                name={key}
                                value={value}
                                onChange={(e) => {
                                  setSelectedProduct((prev) => ({
                                    ...prev,
                                    sizes: prev.sizes.map((size, i) =>
                                      index === i
                                        ? { ...size, [key]: e.target.value }
                                        : { ...size }
                                    ),
                                  }));
                                }}
                              />
                            </div>
                          );
                        })}
                      </div>
                      <button
                        className='border hover:bg-red-600 border-blue-600 w-fit h-full rounded-full flex p-5  self-center justify-center items-center'
                        type='button'
                        onClick={() => removeProductOption(index)}
                      >
                        <Minus className='w-10 h-10 text-blue-600' />
                      </button>
                    </div>
                  );
                })}
              </div>
              <button
                className='border-orange-600 hover:bg-orange-700 text-orange-600 hover:text-white text-md px-5 py-1 rounded-lg font-medium uppercase transition-colors border w-fit self-center mt-5'
                onClick={addProductOption}
                type='button'
              >
                Add option
              </button>
            </div>
            <div className='flex items-center'>
              <label className='text-sm font-medium text-gray-700 mb-1'>
                Available:
              </label>
              <input
                className='px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ml-4 w-4 h-5 mb-1'
                type='checkbox'
                required
                name='active'
                checked={selectedProduct.active}
                onChange={(e) => {
                  setSelectedProduct((prev) => ({
                    ...prev,
                    active: e.target.checked,
                  }));
                }}
              />
            </div>
            <div className='flex justify-center mt-5'>
              <button
                className='border-2 hover:text-white border-orange-600 hover:bg-orange-700 text-orange-600 text-md px-5 py-1 rounded-lg font-medium transition-colors w-fit self-center uppercase'
                onClick={handleSubmitProduct}
                type='submit'
              >
                Update Product
              </button>
            </div>
            <div className='flex justify-center mt-5'>
              <button
                className='border-2 border-red-600 hover:bg-red-700 text-red-600 text-md px-5 py-1 rounded-lg font-medium transition-colors w-fit self-center uppercase'
                onClick={cancelEditProduct}
                type='button'
              >
                Cancel Edit
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
