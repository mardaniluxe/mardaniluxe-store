(() => {
  const products = window.STORE_PRODUCTS || [];
  const config = window.STORE_CONFIG || {};
  let cart = [];
  let activeCategory = "All";
  const grid = document.getElementById("productGrid");
  const drawer = document.getElementById("cartDrawer");
  const overlay = document.getElementById("overlay");
  const money = n => new Intl.NumberFormat("en-NG",{style:"currency",currency:"NGN",maximumFractionDigits:0}).format(n);
  const toast = message => {
    const el=document.getElementById("toast"); el.textContent=message; el.classList.add("show");
    setTimeout(()=>el.classList.remove("show"),2200);
  };
  function renderProducts() {
    const query=(document.getElementById("searchInput")?.value||"").toLowerCase();
    const shown=products.filter(p=>(activeCategory==="All"||p.category===activeCategory)&&
      (p.name+" "+p.category+" "+p.description).toLowerCase().includes(query));
    grid.innerHTML=shown.map(p=>`<article class="product-card">
      <div class="product-image ${p.category.toLowerCase()}"><span class="image-label">${p.label||p.category}</span></div>
      <div class="product-info"><div><h3>${p.name}</h3><p>${p.description}</p></div><span class="product-price">${money(p.price)}</span></div>
      <button class="add-button" data-add="${p.id}">Add to bag +</button>
    </article>`).join("") || `<p>No products found. Try another search.</p>`;
    grid.querySelectorAll("[data-add]").forEach(b=>b.addEventListener("click",()=>addToCart(b.dataset.add)));
  }
  function addToCart(id){const p=products.find(x=>x.id===id);if(!p)return;const row=cart.find(x=>x.id===id);row?row.qty++:cart.push({...p,qty:1});renderCart();toast("Added to your bag");}
  function renderCart(){
    const count=cart.reduce((s,x)=>s+x.qty,0), total=cart.reduce((s,x)=>s+x.qty*x.price,0);
    document.getElementById("bagCount").textContent=count;document.getElementById("cartTotal").textContent=money(total);
    document.getElementById("cartItems").innerHTML=cart.length?cart.map(p=>`<div class="cart-row"><div><strong>${p.name}</strong><small>${money(p.price)} each</small></div><div class="quantity"><button data-dec="${p.id}" aria-label="Decrease quantity">−</button><span>${p.qty}</span><button data-inc="${p.id}" aria-label="Increase quantity">+</button></div></div>`).join(""):`<p class="empty-cart">Your bag is currently empty.</p>`;
    document.querySelectorAll("[data-inc]").forEach(b=>b.onclick=()=>changeQty(b.dataset.inc,1));
    document.querySelectorAll("[data-dec]").forEach(b=>b.onclick=()=>changeQty(b.dataset.dec,-1));
  }
  function changeQty(id,delta){const p=cart.find(x=>x.id===id);if(!p)return;p.qty+=delta;if(p.qty<=0)cart=cart.filter(x=>x.id!==id);renderCart();}
  function openCart(){drawer.classList.add("open");drawer.setAttribute("aria-hidden","false");overlay.hidden=false;}
  function closeCart(){drawer.classList.remove("open");drawer.setAttribute("aria-hidden","true");overlay.hidden=true;}
  document.getElementById("openCart").onclick=openCart;
  document.getElementById("closeCart").onclick=closeCart;
  overlay.onclick=closeCart;
  document.getElementById("categoryTabs").querySelectorAll("button").forEach(b=>b.onclick=()=>{
    activeCategory=b.dataset.category;document.querySelectorAll("#categoryTabs button").forEach(x=>x.classList.toggle("active",x===b));renderProducts();
  });
  document.getElementById("searchToggle").onclick=()=>{const p=document.getElementById("searchPanel");p.hidden=!p.hidden;if(!p.hidden)document.getElementById("searchInput").focus();};
  document.getElementById("searchInput").addEventListener("input",renderProducts);
  function checkout(){
    if(!cart.length){toast("Your bag is empty");return;}
    const total=cart.reduce((s,x)=>s+x.qty*x.price,0);
    const lines=cart.map(x=>`• ${x.name} x ${x.qty} — ${money(x.qty*x.price)}`).join("%0A");
    const message=`Hello MarDani Luxe, I would like to enquire about this order:%0A%0A${lines}%0A%0ASubtotal: ${money(total)}%0A%0APlease confirm availability, delivery fee and payment instructions.`;
    const number=(config.whatsappNumber||"").replace(/\D/g,"");
    if(!number){toast("Please configure the WhatsApp number in config.js");return;}
    window.open(`https://wa.me/${number}?text=${message}`,"_blank","noopener");
  }
  document.getElementById("checkoutButton").onclick=checkout;
  document.getElementById("footerWhatsApp").href=`https://wa.me/${(config.whatsappNumber||"").replace(/\D/g,"")}`;
  document.getElementById("year").textContent=new Date().getFullYear();
  renderProducts();renderCart();
})();