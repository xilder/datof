import { useEffect, useState } from 'react';
import { Phone, MapPin, Clock, MessageCircle } from 'lucide-react';
import axiosClient from '../axiosClient/axiosClient';

export const brand = {
  name: 'Datof Foods',
  abbr: 'DF',
  phoneNumber1: '+234 806 702 9186',
  phoneNumber2: '+234 811 399 6249',
  whatsappNumber: '2348085008006',
  address: 'Behind 200 Housing Estate',
  openingHours: [
    { day: 'Mon - Fri', time: '8AM - 6PM' },
    { day: 'Satur - Sun', time: '10PM - 8PM' },
  ],
};
export interface Product {
  _id: string;
  name: string;
  description: string;
  price: string;
  image: string;
  sizes: {
    size: string;
    weight: number;
    price: number;
  }[];
  active: boolean;
}

export const formatter = new Intl.NumberFormat('en-EN', { useGrouping: true });

export const whatsappNumber = brand.whatsappNumber;
export const whatsappMessage =
  "Hello! I'm interested in your Nigerian snacks. Can you help me place an order?";

export default function HomePage() {
  const [products, set_products] = useState<Product[]>([]);

  useEffect(() => {
    let p: Product[];
    (async () => {
      const response = await axiosClient.get('/api/v1/products');
      p = await response.data;
      if (p && p.length >= 1) {
        for (const product of p) {
          const max_item = product.sizes.reduce((prev, current) => {
            return prev.price > current.price ? prev : current;
          });
          const min_item = product.sizes.reduce((prev, current) => {
            return prev.price < current.price ? prev : current;
          });
          product.price = `₦${min_item.price} - ₦${max_item.price}`;
        }
        set_products(p);
      }
    })();
  }, []);

  return (
    <div className='min-h-screen bg-gradient-to-b from-orange-50 to-white'>
      {/* Header */}
      <header className='bg-white shadow-sm border-b-2 border-orange-200 sticky top-0 z-50'>
        <div className='container mx-auto px-4 py-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-2'>
              <div className='w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center'>
                <span className='text-white font-bold text-lg'>
                  {brand.abbr}
                </span>
              </div>
              <div>
                <h1 className='text-xl font-bold text-gray-800'>
                  {brand.name} {/*pick a sylish font*/}
                </h1>
                <p className='text-sm text-gray-600 font-semibold'>
                  Tasty Treats
                </p>
              </div>
            </div>
            <nav className='hidden md:flex space-x-4'>
              <a
                href='/'
                className='text-gray-700 hover:text-orange-600 font-medium transition-colors'
              >
                Home
              </a>
              <a
                href='#about'
                className='text-gray-700 hover:text-orange-600 font-medium transition-colors'
              >
                About
              </a>
              <a
                href='#contact'
                className='text-gray-700 hover:text-orange-600 font-medium transition-colors'
              >
                Contact
              </a>
              <a
                href='/order'
                className='text-gray-700 hover:text-orange-600 font-medium transition-colors'
              >
                Order Now
              </a>
            </nav>
            <div className='flex space-x-2'>
              <a href='/order'>
                <button className='bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors'>
                  Order Now
                </button>
              </a>
              <a
                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                  whatsappMessage
                )}`}
                target='_blank'
                rel='noopener noreferrer'
                className='bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg transition-colors'
                title='Chat on WhatsApp'
              >
                <MessageCircle className='w-5 h-5' />
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className='py-16 px-4 min-h-screen flex items-center justify-center'>
        <div className='container mx-auto text-center'>
          <h2 className='text-4xl md:text-6xl font-bold text-orange-600 mb-6'>
            Feeling a little peckish
            <span className='text-gray-800'>?</span>
          </h2>
          <p className='text-xl text-gray-800 mb-8 max-w-2xl mx-auto'>
            Treat yourself to our amazing variety of tasty snacks. From the
            creamiest chin-chin to the tasties cake, we have you covered.
          </p>
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <a href='/order'>
              <button className='bg-orange-600 hover:bg-orange-700 text-white text-lg px-8 py-3 rounded-lg font-medium transition-colors'>
                Order Your Favorites
                <br />
                <span className='text-xs font-semibold'>
                  30-MINS DELIVERY (Lokoja)
                </span>
              </button>
            </a>
            <a href='#products'>
              <button className='border-2 border-orange-700 text-orange-600 hover:bg-orange-200 text-lg px-8 py-3 rounded-lg font-medium transition-colors h-full'>
                View Menu
              </button>
            </a>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id='products' className='py-16 px-4 bg-white'>
        <div className='container mx-auto'>
          <h3 className='text-3xl font-bold text-center text-gray-800 mb-12'>
            Our Signature Snacks
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
            {products.map((product) => (
              <div
                key={product.name}
                className='bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow border border-orange-100 overflow-hidden'
              >
                <div className='p-4 h-full flex-col'>
                  <img
                    src={`/images/${product.name}.jpg`}
                    alt={product.name}  
                    width={200}
                    height={200}
                    className='w-full h-48 object-cover rounded-lg mb-4'
                  />
                  <div className='flex flex-1 flex-col'>
                    <h4 className='text-xl font-semibold text-gray-800 mb-2'>
                      {product.name}
                    </h4>
                    <p className='text-gray-600 mb-3'>{product.description}</p>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='text-orange-600 font-bold'>
                      {product.price}
                    </span>
                    {/* <div className='flex text-yellow-400'>
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className='w-4 h-4 fill-current' />
                      ))}
                    </div> */}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id='about' className='py-16 px-4 bg-orange-50'>
        <div className='container mx-auto'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
            <div>
              <h3 className='text-3xl font-bold text-gray-800 mb-6'>
                Made with Love, Served with Pride
              </h3>
              <p className='text-gray-600 mb-4'>
                At Naija Snacks, we believe in preserving the authentic taste of
                Nigerian cuisine. Our snacks are made using traditional recipes
                and the finest local ingredients.
              </p>
              <p className='text-gray-600 mb-6'>
                From our kitchen to your table, every bite tells a story of
                Nigerian heritage and culinary excellence. We take pride in
                delivering fresh, delicious snacks that bring families and
                friends together.
              </p>
              <div className='grid grid-cols-2 gap-4'>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-orange-600'>5+</div>
                  <div className='text-gray-600'>Years Experience</div>
                </div>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-orange-600'>
                    1000+
                  </div>
                  <div className='text-gray-600'>Happy Customers</div>
                </div>
              </div>
            </div>
            <div className='flex justify-center-safe'>
              <img
                src='/images/kitchen.jpg'
                alt='Our kitchen'
                width={500}
                height={400}
                className='rounded-lg shadow-lg'
              />
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id='contact' className='py-16 px-4 bg-white'>
        <div className='container mx-auto'>
          <h3 className='text-3xl font-bold text-center text-gray-800 mb-12'>
            Get in Touch
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            <div className='text-center p-6 bg-white rounded-lg shadow-lg border border-orange-100'>
              <Phone className='w-12 h-12 text-orange-600 mx-auto mb-4' />
              <h4 className='text-xl font-semibold mb-2'>Call Us</h4>
              <p className='text-gray-600'>{brand.phoneNumber1}</p>
              <p className='text-gray-600'>{brand.phoneNumber2}</p>
            </div>
            <div className='text-center p-6 bg-white rounded-lg shadow-lg border border-orange-100'>
              <MapPin className='w-12 h-12 text-orange-600 mx-auto mb-4' />
              <h4 className='text-xl font-semibold mb-2'>Visit Us</h4>
              <p className='text-gray-600'>{brand.address},</p>
              <p className='text-gray-600'>Lokoja, Nigeria</p>
            </div>
            <div className='text-center p-6 bg-white rounded-lg shadow-lg border border-orange-100'>
              <Clock className='w-12 h-12 text-orange-600 mx-auto mb-4' />
              <h4 className='text-xl font-semibold mb-2'>Hours</h4>
              {brand.openingHours.map((oh) => (
                <p className='text-gray-600'>
                  {oh.day}: {oh.time}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* WhatsApp Float Button */}
      <a
        href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
          whatsappMessage
        )}`}
        target='_blank'
        rel='noopener noreferrer'
        className='fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all z-50'
        title='Chat on WhatsApp'
      >
        <MessageCircle className='w-6 h-6' />
      </a>

      {/* Footer */}
      <footer className='bg-gray-800 text-white py-8 px-4'>
        <div className='container mx-auto text-center'>
          <div className='flex items-center justify-center space-x-2 mb-4'>
            <div className='w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center'>
              <span className='text-white font-bold'>{brand.abbr}</span>
            </div>
            <span className='text-xl font-bold'>{brand.name}</span>
          </div>
          <p className='text-gray-400 mb-4'>Tasty treats at your fingertips</p>
          <p className='text-gray-500'>
            © 2025 <span className='uppercase'>{brand.name}</span>. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
