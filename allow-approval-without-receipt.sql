-- MarDani Luxe: allow owner-verified payment approval without a receipt.
-- Run in Supabase SQL Editor. This function does not auto-confirm payments.
-- Owner must independently verify the Moniepoint transaction first.

create or replace function public.approve_store_order_payment(p_order_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.store_orders;
  v_item record;
begin
  if not public.is_store_owner() then
    raise exception 'Administrator access required.';
  end if;

  select * into v_order
  from public.store_orders
  where id = p_order_id
  for update;

  if not found then
    raise exception 'Order not found.';
  end if;

  if v_order.payment_status = 'paid' or v_order.stock_deducted then
    raise exception 'Payment has already been approved or stock has already been deducted.';
  end if;

  if v_order.status = 'cancelled' then
    raise exception 'Cancelled orders cannot be approved.';
  end if;

  -- Receipt is optional; owner confirmation is still required.
  for v_item in
    select product_id, quantity, product_name
    from public.store_order_items
    where order_id = p_order_id
  loop
    update public.products
    set stock_quantity = stock_quantity - v_item.quantity
    where id = v_item.product_id
      and active = true
      and stock_quantity >= v_item.quantity;

    if not found then
      raise exception 'Insufficient stock for %; payment cannot be approved until resolved.',
        v_item.product_name;
    end if;
  end loop;

  update public.store_orders
  set payment_status = 'paid',
      status = 'processing',
      stock_deducted = true,
      updated_at = now()
  where id = p_order_id;
end;
$$;

grant execute on function public.approve_store_order_payment(uuid) to authenticated;
