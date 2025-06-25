import Product from './products_schema';
import connectDB from './engine';
import { v4 as uuid4 } from 'uuid';

(async () => {
  await connectDB();

  const chin_chin = new Product({
    name: 'Chin chin',
    description:
      'Delightful, bite-sized snack. Perfect for sharing (or not!). Tastes even better with chilled Kunu or Zobo',
    sizes: [
      { size: 'small', price: 200, weight: 500 },
      { size: 'medium', price: 500, weight: 1000 },
      { size: 'large', price: 1500, weight: 2000 },
    ],
  });
  const cake = new Product({
    name: 'Cake',
    description: `Every slice is a promise of tender, sweet delight, a little piece of joy. Perfect for celebrating big moments or an ordinary Tuesday.`,
    sizes: [
      { size: 'small', price: 5000, weight: 800 },
      { size: 'medium', price: 10000, weight: 1500 },
      { size: 'large', price: 15000, weight: 2500 },
    ],
  });
  const akara_chips = new Product({
    name: 'Akara Chips',
    description:
      'Akara but with a crispy twist. Satisfying and utterly addictive. Perfect for munching on the go or sharing with friends',
    sizes: [
      { size: 'small', price: 200, weight: 500 },
      { size: 'medium', price: 500, weight: 1000 },
      { size: 'large', price: 1500, weight: 2000 },
    ],
  });
  const peanut = new Product({
    name: 'Peanut',
    description:
      'Wholesome, golden, crunchy perfection that leave you longing for more.',
    sizes: [
      { size: 'small', price: 200, weight: 500 },
      { size: 'medium', price: 500, weight: 1000 },
      { size: 'large', price: 1500, weight: 2000 },
    ],
  });

  await Promise.all([
    chin_chin.save(),
    cake.save(),
    akara_chips.save(),
    peanut.save(),
  ]);

  const products = await Product.find();

  for (const product of products) {
    const product1 = { ...product, _id: product._id.toString() };
    console.log(product1);
  }
})();
