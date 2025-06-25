import mongoose from 'mongoose';

export interface OrderSchema {
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
  status: string;
  paymentStatus: string;
  createdAt: string;
  deliveryTime?: string;
}

const { Schema, model } = mongoose;

const itemsSchema = new Schema({
  productName: String,
  size: String,
  quantity: Number,
  price: Number, 
});

const orderSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
  },
  address: {
    type: String,
    required: true,
    trim: true,
  },
  items: [itemsSchema],
  total: Number,
  status: {
    type: String,
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  deliveryTime: String,
  specialInstructions: String,
});

const Order = model('Order', orderSchema)

export default Order
