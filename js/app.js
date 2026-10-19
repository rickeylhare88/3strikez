/* 3STRIKEZ storefront logic v1 — front-end demo, no real checkout */
const PRODUCTS = [
  {id:'crown-graffiti-tee',   name:'Crown Graffiti Tee',   price:45.00,  cat:'shirts',      img:'assets/prod-crown-graffiti-tee-v1.jpg',   sizes:['S','M','L','XL','2XL'], tag:null},
  {id:'three-strikes-box-tee',name:'Three Strikes Box Tee',price:40.00,  cat:'shirts',      img:'assets/prod-three-strikes-tee-v1.jpg',    sizes:['S','M','L','XL','2XL'], tag:null},
  {id:'red-alert-heavy-hoodie',name:'Red Alert Heavy Hoodie',price:95.00,cat:'hoodies',     img:'assets/prod-red-alert-hoodie-v1.jpg',    sizes:['S','M','L','XL','2XL'], tag:null},
  {id:'blockline-zip-hoodie', name:'Blockline Zip Hoodie', price:110.00, cat:'hoodies',     img:'assets/prod-blockline-zip-v1.jpg',       sizes:['S','M','L','XL','2XL'], tag:null},
  {id:'night-shift-cargo',    name:'Night Shift Cargo',   price:85.00,  cat:'pants',       img:'assets/prod-night-shift-cargo-v1.jpg',  sizes:['28','30','32','34','36'], tag:null},
  {id:'lifestyle-track-pant', name:'Lifestyle Track Pant',price:70.00,  cat:'pants',       img:'assets/prod-lifestyle-track-pant-v1.jpg',sizes:['S','M','L','XL','2XL'], tag:'NEW'},
  {id:'crown-snapback',       name:'Crown Snapback',       price:38.00,  cat:'hats',        img:'assets/prod-crown-snapback-v1.jpg',      sizes:['One Size'], tag:null},
  {id:'3z-fitted-cap',        name:'3Z Fitted Cap',        price:42.00,  cat:'hats',        img:'assets/prod-3z-fitted-v1.jpg',           sizes:['7','7 1/4','7 1/2','7 3/4'], tag:null},
  {id:'strike-hi-sneaker',    name:'Strike Hi Sneaker',    price:160.00, cat:'shoes',       img:'assets/prod-strike-hi-v1.jpg',           sizes:['8','9','10','11','12','13'], tag:null},
  {id:'curbside-low',         name:'Curbside Low',         price:130.00, cat:'shoes',       img:'assets/prod-curbside-low-v1.jpg',       sizes:['8','9','10','11','12','13'], tag:null},
  {id:'cuban-link-chain',     name:'Cuban Link Chain',     price:65.00,  cat:'accessories', img:'assets/prod-cuban-link-v1.jpg',         sizes:['20IN','24IN'], tag:null},
  {id:'corner-store-crossbody',name:'Corner Store Crossbody',price:55.00,cat:'accessories',img:'assets/prod-crossbody-v1.jpg',            sizes:['One Size'], tag:'NEW'},
];
const CATS = {shirts:'Shirts',hoodies:'Hoodies',pants:'Pants',hats:'Hats',shoes:'Shoes',accessories:'Accessories'};
const money = n => '$' + n.toFixed(2);
const CART_KEY = '3strikez-cart-v1';

/* ---------- cart state ---------- */
function getCart(){ try{ return JSON.parse(localStorage.getItem(CART_KEY)) || []; }catch(e){ return []; } }
function saveCart(c){ localStorage.setItem(CART_KEY, JSON.stringify(c)); renderCartCount(); }
function cartCount(){ return getCart().reduce((a,l)=>a+l.qty,0); }
function renderCartCount(){ document.querySelectorAll('.cart-count').forEach(el=>el.textContent = cartCount()); }

/* ---------- product card ---------- */
function cardHTML(p){
  const badge = p.tag ? `<span class="badge">${p.tag}</span>` : '';
  const pills = p.sizes.map(s=>`<button class="size-pill" data-size="${s}">${s}</button>`).join('');
  return `<article class="product-card" data-id="${p.id}">
    <div class="product-img"><img src="${p.img}" alt="${p.name}" loading="lazy">${badge}</div>
    <div class="product-body">
      <div class="product-name">${p.name}</div>
      <div class="product-price">${money(p.price)}</div>
      <div class="size-hint">Select size</div>
      <div class="sizes">${pills}</div>
      <button class="add-btn" disabled>Add to bag</button>
    </div>
  </article>`;
}
function wireCard(card){
  const id = card.dataset.id;
  const p = PRODUCTS.find(x=>x.id===id);
  const btn = card.querySelector('.add-btn');
  let size = null;
  card.querySelectorAll('.size-pill').forEach(pill=>{
    pill.addEventListener('click', ()=>{
      card.querySelectorAll('.size-pill').forEach(x=>x.classList.remove('selected'));
      pill.classList.add('selected');
      size = pill.dataset.size;
      btn.disabled = false;
      btn.classList.add('ready');
      btn.textContent = 'Add to bag';
    });
  });
  btn.addEventListener('click', ()=>{
    if(!size) return;
    const cart = getCart();
    const line = cart.find(l=>l.id===id && l.size===size);
    if(line) line.qty++;
    else cart.push({id, size, qty:1});
    saveCart(cart);
    renderDrawer();
    toast(`${p.name} (${size}) added to bag`);
  });
}

/* ---------- shop page ---------- */
function initShop(){
  const params = new URLSearchParams(location.search);
  let cat = (params.get('cat')||'all').toLowerCase();
  let q = '', sort = 'featured';
  const grid = document.getElementById('shop-grid');
  const count = document.getElementById('result-count');
  const search = document.getElementById('shop-search');
  const sortSel = document.getElementById('shop-sort');
  const pills = document.querySelectorAll('.filter-pill');

  function apply(){
    let list = PRODUCTS.slice();
    if(cat==='new') list = list.filter(p=>p.tag==='NEW');
    else if(cat!=='all') list = list.filter(p=>p.cat===cat);
    if(q) list = list.filter(p=>p.name.toLowerCase().includes(q));
    if(sort==='price-asc') list.sort((a,b)=>a.price-b.price);
    else if(sort==='price-desc') list.sort((a,b)=>b.price-a.price);
    else if(sort==='name') list.sort((a,b)=>a.name.localeCompare(b.name));
    grid.innerHTML = list.length ? list.map(cardHTML).join('') : `<div class="empty">Nothing matches — try another search or filter.</div>`;
    grid.querySelectorAll('.product-card').forEach(wireCard);
    count.textContent = list.length + (list.length===1 ? ' product' : ' products');
    pills.forEach(pl=>pl.classList.toggle('active', pl.dataset.cat===cat));
  }
  pills.forEach(pl=>pl.addEventListener('click', ()=>{ cat = pl.dataset.cat; apply(); }));
  search.addEventListener('input', e=>{ q = e.target.value.trim().toLowerCase(); apply(); });
  sortSel.addEventListener('change', e=>{ sort = e.target.value; apply(); });
  apply();
}

/* ---------- home: new arrivals ---------- */
function initHome(){
  const grid = document.getElementById('new-grid');
  if(!grid) return;
  const news = PRODUCTS.filter(p=>p.tag==='NEW');
  grid.innerHTML = news.map(cardHTML).join('');
  grid.querySelectorAll('.product-card').forEach(wireCard);
}

/* ---------- cart drawer ---------- */
function buildDrawer(){
  const wrap = document.createElement('div');
  wrap.innerHTML = `
    <div class="overlay" id="overlay"></div>
    <aside class="drawer" id="drawer" aria-label="Shopping bag">
      <div class="drawer-head"><h3>Your Bag</h3><button class="drawer-close" id="drawer-close">&times;</button></div>
      <div class="drawer-items" id="drawer-items"></div>
      <div class="drawer-foot">
        <div class="subtotal"><span>Subtotal</span><span id="subtotal">$0.00</span></div>
        <button class="checkout-btn" disabled>Checkout — coming soon</button>
        <div class="soon-note">Online checkout isn't live yet. This is a demo storefront.</div>
      </div>
    </aside>
    <div class="toast" id="toast"></div>`;
  document.body.appendChild(wrap);
  document.getElementById('overlay').addEventListener('click', closeDrawer);
  document.getElementById('drawer-close').addEventListener('click', closeDrawer);
  document.querySelectorAll('[data-open-cart]').forEach(b=>b.addEventListener('click', openDrawer));
}
function openDrawer(){ renderDrawer(); document.getElementById('drawer').classList.add('open'); document.getElementById('overlay').classList.add('show'); }
function closeDrawer(){ document.getElementById('drawer').classList.remove('open'); document.getElementById('overlay').classList.remove('show'); }
function renderDrawer(){
  const box = document.getElementById('drawer-items');
  const cart = getCart();
  if(!cart.length){
    box.innerHTML = `<div class="cart-empty">Your bag is empty.<br>Go put together a fit.</div>`;
  } else {
    box.innerHTML = cart.map((l,i)=>{
      const p = PRODUCTS.find(x=>x.id===l.id);
      return `<div class="cart-line">
        <img src="${p.img}" alt="${p.name}">
        <div class="info">
          <div class="nm">${p.name}</div>
          <div class="sz">Size: ${l.size} · ${money(p.price)}</div>
          <div class="row">
            <div class="qty">
              <button data-a="dec" data-i="${i}">−</button><span>${l.qty}</span><button data-a="inc" data-i="${i}">+</button>
            </div>
            <button class="rm" data-a="rm" data-i="${i}">Remove</button>
          </div>
        </div>
      </div>`;
    }).join('');
    box.querySelectorAll('button[data-a]').forEach(b=>b.addEventListener('click', ()=>{
      const c = getCart(); const i = +b.dataset.i; const a = b.dataset.a;
      if(a==='inc') c[i].qty++;
      if(a==='dec'){ c[i].qty--; if(c[i].qty<1) c.splice(i,1); }
      if(a==='rm') c.splice(i,1);
      saveCart(c); renderDrawer();
    }));
  }
  const total = cart.reduce((s,l)=>{ const p=PRODUCTS.find(x=>x.id===l.id); return s+p.price*l.qty; },0);
  document.getElementById('subtotal').textContent = money(total);
}
let toastTimer;
function toast(msg){
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(()=>t.classList.remove('show'), 2200);
}

/* ---------- init ---------- */
document.addEventListener('DOMContentLoaded', ()=>{
  buildDrawer();
  renderCartCount();
  const page = document.body.dataset.page;
  if(page==='shop') initShop();
  if(page==='home') initHome();
  document.querySelectorAll('[data-scrollto]').forEach(b=>b.addEventListener('click', ()=>{
    document.querySelector(b.dataset.scrollto)?.scrollIntoView({behavior:'smooth'});
  }));
});
