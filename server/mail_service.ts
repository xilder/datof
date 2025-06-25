import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { Queue, Worker } from 'bullmq';
import Order, { OrderSchema } from './models/orders_schema';
import moment from 'moment';
import IORedis from 'ioredis';
import Mail from 'nodemailer/lib/mailer';

dotenv.config();

interface MailBody {
  to: string;
  subject: string;
  text: string;
}

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'olabowaleayobami@gmail.com',
    pass: process.env.MAIL_PASSWORD,
  },
});

const sendMail = async (order: OrderSchema) => {
  const html = `<h2>New Order from ${order.name}</h2>
<h3>Order: ${order._id}</h3>
<ul>
${order.items
  .map(
    (item) =>
      `<li>${item.productName} (${item.size}) * ${item.quantity} - ${
        item.price * item.quantity
      }</li>`
  )
  .join('\n')}
</ul>
<p>Total: ${order.items.reduce(
    (prev, currItem) => prev + currItem.price * currItem.quantity,
    0
  )}</p>
<hr />
<p>Phone Number: ${order.phone}</p>
<p>Email: ${order.email}</p>
${order.deliveryTime ? `<p>Delivery Time: ${order.deliveryTime}</p>` : `${''}`}
<p>Order placed on ${moment(order.createdAt).format('dddd, MMM Do, YYYY')}</p>`;
  const mailBody: Mail.Options = {
    from: 'DF FOODS <olabowaleayobami@gmail.com>',
    to: 'olabowaleayobami@gmail.com',
    html,
    subject: `New Order ${order._id} from DF Foods`,
    text: `New Order from ${order.name}.\nTotal: ${order.items.reduce(
      (prev, currItem) => prev + currItem.price * currItem.quantity,
      0
    )}.\nPhone: ${order.phone}. Email: ${order.email},\nDelivery Address: ${
      order.address
    }`,
  };
  try {
    const info = await transporter.sendMail(mailBody);
  } catch (e) {
    console.log(e);
  }
};

const connection = new IORedis({
  maxRetriesPerRequest: null,
});

const emailQueue = new Queue('email');

const worker = new Worker(
  'email',
  async (job) => {
    try {
      sendMail({ ...job.data } as OrderSchema);
    } catch (e) {
      console.log(e);
    }
  },
  { connection }
);

// worker.on('completed', (job) => {
//   console.log(`Job ${job.id} completed\n${job.data}`);
// });

export default emailQueue;
