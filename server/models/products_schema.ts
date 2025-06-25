import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const sizeSchema = new Schema({
  size: {
    type: String,
    required: true,
  },
  weight: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
});

const productSchema = new Schema({
//   _id: Schema.Types.ObjectId,
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  active: {
    type: Boolean,
    default: true
  },
  sizes: {
    type: [sizeSchema],
    ref: 'Size',
  },
});

const Product = model('Product', productSchema);
// const Size = model('Size', sizeSchema);

export default Product;
