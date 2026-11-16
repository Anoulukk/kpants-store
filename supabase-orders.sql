-- Run this once in the Supabase SQL Editor before turning on QR payment.
--
-- Orders are written ONLY by the server (api/payments/*) using the
-- service-role key. Row Level Security is on with no policies, so the
-- public anon key cannot read or change them.

CREATE TABLE IF NOT EXISTS shop_orders (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_no        text NOT NULL UNIQUE,
  created_at      timestamptz NOT NULL DEFAULT now(),
  status          text NOT NULL DEFAULT 'pending',   -- pending | paid | expired
  customer        jsonb NOT NULL,
  items           jsonb NOT NULL,
  subtotal        integer NOT NULL,
  delivery_fee    integer NOT NULL DEFAULT 0,
  total           integer NOT NULL,
  transaction_id  text UNIQUE,                        -- PhaJay transactionId
  payment_method  text,
  payment_ref     text,
  paid_at         timestamptz
);

CREATE INDEX IF NOT EXISTS shop_orders_created_at_idx ON shop_orders (created_at DESC);

ALTER TABLE shop_orders ENABLE ROW LEVEL SECURITY;
