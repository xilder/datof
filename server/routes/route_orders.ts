import express, { Request, Response, NextFunction } from 'express';
import Order, { OrderSchema } from '../models/orders_schema';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import Admin from '../models/auth_schema';
import emailQueue from '../mail_service';

dotenv.config();

export const JWT_EXPIRATION = process.env.JWT_EXPIRATION;
export const JWT_KEY = process.env.JWT_KEY as string;

export const verify_token = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const bearerHeader = req.headers['authorization'] as string;
    const unverified_token = bearerHeader.split(' ')[1];
    const token = jwt.verify(unverified_token, JWT_KEY) as {
      username: string;
      password: string;
    };
    const admin = await Admin.findOne({ username: token.username });
    if (admin && admin.password === token.password) next();
    else {
      res.status(403).send('unauthorised');
    }
  } catch {
    res.status(403).send('unauthorised');
  }
};

const o_router = express.Router();

o_router.post('/', async (req, res) => {
  const body = req.body as OrderSchema;
  try {
    const order = await Order.insertOne(body);
    await emailQueue.add('email', body);
    res.send('okay');
  } catch (e) {
    res.status(400).send(e);
  }
});

o_router.use('/', (req, res, next) => {
  verify_token(req, res, next);
});

o_router.get('/', async (_, res) => {
  try {
    const all_orders = await Order.find({});
    res.send(all_orders);
  } catch (e) {
    res.status(400).send(e);
  }
});

o_router.delete('/', async (req, res) => {
  // TODO: rewrite route for specific product
  try {
    const _id = req.body.id;
    await Order.deleteOne({ _id });
    res.send('okay');
  } catch (e) {
    res.status(400).send(e);
  }
});

o_router.patch('/:_id', async (req, res) => {
  try {
    const { _id } = req.params;
    const order = req.body;
    await Order.updateOne({ _id }, { ...order });
    // });
    res.send('okay');
  } catch (e) {
    res.status(400).send(e);
  }
});

export default o_router;
