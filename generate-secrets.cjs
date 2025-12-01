// Quick script to generate new secure secrets for your .env file
// Run with: node generate-secrets.js

const crypto = require('crypto');

console.log('\n🔐 SECURE SECRETS GENERATOR\n');
console.log('Copy these values to your .env file:\n');
console.log('─'.repeat(80));

console.log('\n1️⃣ JWT_SECRET (64 bytes):');
console.log(crypto.randomBytes(64).toString('hex'));

console.log('\n2️⃣ ADMIN_SECRET (32 bytes):');
console.log(crypto.randomBytes(32).toString('hex'));

console.log('\n─'.repeat(80));
console.log('\n✅ Next Steps:');
console.log('1. Copy the JWT_SECRET above to your .env file');
console.log('2. Copy the ADMIN_SECRET above to your .env file');
console.log('3. Get your NEW MongoDB URI from MongoDB Atlas');
console.log('4. Generate a NEW Gmail App Password from Google');
console.log('5. Update all values in your .env file');
console.log('6. Test your application');
console.log('\n📖 See SECURITY_ALERT.md for complete instructions\n');
