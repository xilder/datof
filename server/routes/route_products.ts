import express from 'express';
import Product from '../models/products_schema';

const p_router = express.Router();

p_router.get('/', async (_, res) => {
  const all_products = await Product.find({});
  res.send(all_products);
});

p_router.post('/', async (req, res) => {
  try {
    const { body } = req;
    await Product.insertOne({ ...body });
    res.send('okay');
  } catch (e) {
    res.status(400).send(e);
  }
});

p_router.patch('/:_id', async (req, res) => {
  try {
    const { _id } = req.params;
    const order = req.body;
    await Product.updateOne({ _id }, { ...order });
    res.send('okay');
  } catch (e) {
    res.status(400).send(e);
  }
});

p_router.delete('/:_id', async (req, res) => {
  try {
    const { _id } = req.params;
    await Product.deleteOne({ _id });
    res.send('okay')
  } catch(e) {
    res.status(400).send(e);
  }
});

export default p_router;
