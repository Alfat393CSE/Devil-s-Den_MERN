(async ()=>{
  const delay = ms => new Promise(r=>setTimeout(r,ms));
  const base = 'http://localhost:5000';
  // wait for server
  let ready = false;
  for (let i=0;i<30;i++){
    try {
      const r = await fetch(base+'/api/products');
      if (r.ok) { ready = true; break }
    } catch(e){ }
    await delay(500);
  }
  if(!ready){ console.error('Server did not become ready'); process.exit(1)}

  // signin
  const signinRes = await fetch(base+'/api/auth/signin',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'admin@example.com',password:'secret123'})});
  const signinJson = await signinRes.json();
  console.log('signin:', signinJson);
  const token = signinJson.token;
  if(!token){ console.error('Signin failed'); process.exit(1) }

  // create product
  const newProd = { name: 'E2E Test Product', price: 9.99, image: 'https://picsum.photos/200' };
  const createRes = await fetch(base+'/api/products',{method:'POST',headers:{'Content-Type':'application/json', Authorization:`Bearer ${token}`}, body: JSON.stringify(newProd)});
  const createJson = await createRes.json();
  console.log('create:', createJson);
  if(!createRes.ok){ process.exit(1) }
  const productId = createJson.data._id;

  // purchase
  const purchaseRes = await fetch(base+'/api/purchases',{method:'POST',headers:{'Content-Type':'application/json', Authorization:`Bearer ${token}`}, body: JSON.stringify({ productId })});
  let purchaseBody;
  try {
    const ct = purchaseRes.headers.get('content-type') || '';
    if (ct.includes('application/json')) purchaseBody = await purchaseRes.json();
    else purchaseBody = await purchaseRes.text();
  } catch(e) { purchaseBody = '<<unreadable body>>' }
  console.log('purchase status:', purchaseRes.status);
  console.log('purchase body:', purchaseBody);

  process.exit(0);
})();
