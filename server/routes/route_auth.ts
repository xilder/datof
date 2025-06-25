import express from 'express';
import Admin from '../models/auth_schema';
import jwt from 'jsonwebtoken';
import { JWT_EXPIRATION, JWT_KEY } from './route_orders';
// import dotenv from 'dotenv'

const auth_router = express.Router();

auth_router.post('/', async (req, res) => {
  try {
    const { username, password } = await req.body;
    const admin = await Admin.findOne({ username });
    if (admin?.password === password) {
      const token = jwt.sign({ username, password }, JWT_KEY, {
        expiresIn: '1d',
      });
      res.json({ token });
    } else {
      res.status(401).send('Invalid credentials');
    }
  } catch (e) {
    res.status(401).send('Invalid credentials');
  }
});

auth_router.delete('/', (_, res) => {
  try {
    res.setHeader('authorization', '');
    res.send('okay');
  } catch (e) {
    console.log(e);
  }
});

export default auth_router;
