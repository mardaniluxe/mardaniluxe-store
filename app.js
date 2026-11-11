ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read active products"
ON public.products;

CREATE POLICY "Public can read active products"
ON public.products
FOR SELECT TO anon, authenticated
USING (active = true);

DROP POLICY IF EXISTS "Public can read active categories"
ON public.categories;

CREATE POLICY "Public can read active categories"
ON public.categories
FOR SELECT TO anon, authenticated
USING (active = true);
