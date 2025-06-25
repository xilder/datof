import express, { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './models/engine';
import product_router from './routes/route_products';
import order_router from './routes/route_orders';
import auth_router from './routes/route_auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT;
const cors_options = {
  origin: 'http://localhost:3000',
  // methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
};


connectDB();

app.use(cors(cors_options));
app.use(express.json());
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1/products', product_router);
app.use('/api/v1/orders', order_router);
app.use('/api/v1/auth', auth_router);

app.get('/', (_, res) => {
  res.send('hello world');
});

// console.log(db_client);

app.listen(PORT, () => console.log(`listening on port ${PORT}`));
