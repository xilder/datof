// import { MongoClient } from 'mongodb';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

const MONGO_URI = 'mongodb://localhost:27017/datof';

// const db_client = new MongoClient(MONGO_URI);

const connectDB = async () => {
  await mongoose.connect(MONGO_URI);
};

// const datof = db_client.db('datof');

export default connectDB;
