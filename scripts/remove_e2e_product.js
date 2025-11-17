import mongoose from 'mongoose';

(async () => {
  try {
    const MONGO = "mongodb+srv://alfattasnimhasan_db_user:IiKrxNi4gCuDWKI4@cluster0.x0rf0xr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO);
    const db = mongoose.connection;

    const name = 'E2E Test Product';
    const products = await db.collection('products').find({ name }).toArray();
    if (!products.length) {
      console.log('No E2E Test Product found.');
      process.exit(0);
    }

    for (const p of products) {
      const pid = p._id;
      console.log('Removing sales for product', pid.toString());
      await db.collection('sales').deleteMany({ product: pid });
    }

    const del = await db.collection('products').deleteMany({ name });
    console.log(`Deleted ${del.deletedCount} product(s) named "${name}".`);
    process.exit(0);
  } catch (err) {
    console.error('Error removing E2E Test Product:', err);
    process.exit(1);
  }
})();
