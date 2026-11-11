
(() => {
  const cfg = window.STORE_CONFIG || {};
  const message = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };

  const client = window.supabase.createClient(
    cfg.supabaseUrl,
    cfg.supabasePublishableKey
  );

  let categories = [];
  let products = [];

  const loginPanel = document.getElementById("loginPanel");
  const dashboardPanel = document.getElementById("dashboardPanel");

  async function checkAccess() {
    const { data: { user } } = await client.auth.getUser();

    if (!user) {
      loginPanel.hidden = false;
      dashboardPanel.hidden = true;
      message("adminStatus", "Signed out");
      return;
    }

    const { data: admin, error } = await client
      .from("admin_users")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error || !admin) {
      await client.auth.signOut();
      loginPanel.hidden = false;
      dashboardPanel.hidden = true;
      message("loginMessage", "This account is not authorised as a store administrator.");
      return;
    }

    loginPanel.hidden = true;
    dashboardPanel.hidden = false;
    message("adminStatus", "Signed in · " + admin.role);
    await loadStore();
  }

  async function loadStore() {
    const [catResult, productResult] = await Promise.all([
      client.from("categories").select("id,name,slug,active").eq("active", true).order("name"),
      client.from("products").select("id,name,description,price,image_url,stock_quantity,low_stock_threshold,category_id,active").eq("active", true).order("name")
    ]);

    if (catResult.error || productResult.error) {
      message("productMessage", "Could not load catalogue. Check administrator database permissions.");
      return;
    }

    categories = catResult.data || [];
    products = productResult.data || [];

    document.getElementById("productCount").textContent = products.length;
    document.getElementById("categoryCount").textContent = categories.length;
    document.getElementById("lowStockCount").textContent =
      products.filter(p => p.stock_quantity <= p.low_stock_threshold).length;

    const select = document.getElementById("productCategory");
    select.innerHTML = categories.map(c =>
      `<option value="${c.id}">${escapeHTML(c.name)}</option>`
    ).join("");

    renderProducts();
    renderCategories();
    renderInventory();
  }

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;",
      '"': "&quot;", "'": "&#39;"
    })[char]);
  }

  function renderProducts() {
    const list = document.getElementById("productList");
    list.innerHTML = products.map(p => `
      <div class="product-row">
        ${p.image_url ? `<img src="${escapeHTML(p.image_url)}" alt="">` : ""}
        <div class="product-info">
          <strong>${escapeHTML(p.name)}</strong>
          <small>₦${Number(p.price).toLocaleString("en-NG")} · ${p.stock_quantity} units</small>
        </div>
        <button type="button" data-edit="${p.id}">Edit</button>
      </div>
    `).join("");

    list.querySelectorAll("[data-edit]").forEach(button => {
      button.addEventListener("click", () => editProduct(button.dataset.edit));
    });
  }

  function editProduct(id) {
    const p = products.find(item => item.id === id);
    if (!p) return;
    document.getElementById("productId").value = p.id;
    document.getElementById("productName").value = p.name;
    document.getElementById("productCategory").value = p.category_id;
    document.getElementById("productDescription").value = p.description || "";
    document.getElementById("productPrice").value = p.price;
    document.getElementById("productStock").value = p.stock_quantity;
    document.getElementById("productThreshold").value = p.low_stock_threshold;
    document.getElementById("pageTitle").textContent = "Edit product";
    document.getElementById("productForm").scrollIntoView({ behavior: "smooth" });
  }

  function renderCategories() {
    document.getElementById("categoryList").innerHTML =
      categories.map(c => `<p>${escapeHTML(c.name)}</p>`).join("");
  }

  function renderInventory() {
    document.getElementById("inventoryList").innerHTML = products.map(p => {
      const low = p.stock_quantity <= p.low_stock_threshold;
      return `<p>${escapeHTML(p.name)} — ${p.stock_quantity} units — ${low ? "LOW STOCK" : "In stock"}</p>`;
    }).join("");
  }

  document.getElementById("loginForm").addEventListener("submit", async event => {
    event.preventDefault();
    message("loginMessage", "Signing in...");
    const { error } = await client.auth.signInWithPassword({
      email: document.getElementById("email").value.trim(),
      password: document.getElementById("password").value
    });
    if (error) {
      message("loginMessage", error.message);
      return;
    }
    await checkAccess();
  });

  document.getElementById("logoutButton").addEventListener("click", async () => {
    await client.auth.signOut();
    location.reload();
  });

  document.querySelectorAll("[data-view]").forEach(button => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".view").forEach(view => view.hidden = true);
      document.getElementById(button.dataset.view).hidden = false;
      document.getElementById("pageTitle").textContent = button.textContent;
      document.querySelectorAll("[data-view]").forEach(b => b.classList.remove("active"));
      button.classList.add("active");
    });
  });

  document.getElementById("resetProduct").addEventListener("click", () => {
    document.getElementById("productForm").reset();
    document.getElementById("productId").value = "";
  });

  document.getElementById("productForm").addEventListener("submit", async event => {
    event.preventDefault();
    message("productMessage", "Product saving will be enabled after the secure stock and image policies are installed.");
  });

  checkAccess().catch(error => {
    console.error(error);
    message("adminStatus", "Connection error");
  });
})();
