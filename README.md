# MAISON — ????????????????

???????????????? ?????????????? WhatsApp, ?? admin panel ??????.

## Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Supabase (Postgres)
- **Font**: Noto Sans Lao + Instrument Serif
- **Icons**: Lucide React

## ??????? Project

```
maison-store/
+-- src/
¦   +-- components/
¦   ¦   +-- admin/
¦   ¦   ¦   +-- AdminPanel.jsx       # Admin layout + login
¦   ¦   ¦   +-- AdminProducts.jsx    # Product CRUD list
¦   ¦   ¦   +-- AdminCategories.jsx  # Category CRUD
¦   ¦   ¦   +-- AdminConfig.jsx      # Store settings + reset
¦   ¦   ¦   +-- ProductForm.jsx      # Add/edit product form
¦   ¦   +-- checkout/
¦   ¦   ¦   +-- CheckoutModal.jsx    # Checkout form + WhatsApp
¦   ¦   ¦   +-- OrderSuccess.jsx     # Success message
¦   ¦   +-- store/
¦   ¦   ¦   +-- CartDrawer.jsx       # Shopping cart sidebar
¦   ¦   ¦   +-- Header.jsx           # Store header + search
¦   ¦   ¦   +-- ProductCard.jsx      # Product grid card
¦   ¦   ¦   +-- ProductDetail.jsx    # Product detail modal
¦   ¦   +-- ui/
¦   ¦       +-- Toast.jsx            # Toast notifications
¦   +-- data/
¦   ¦   +-- constants.js             # Default data & config
¦   +-- hooks/
¦   ¦   +-- useCart.js               # Cart state management
¦   ¦   +-- useStoreData.js          # Store data + Supabase
¦   ¦   +-- useToast.js              # Toast notifications
¦   +-- lib/
¦   ¦   +-- api.js                   # Supabase client helper
¦   ¦   +-- utils.js                 # Format price, WhatsApp msg
¦   +-- App.jsx                      # Main app component
¦   +-- index.css                    # Tailwind + custom styles
¦   +-- main.jsx                     # Entry point
+-- index.html
+-- package.json
+-- tailwind.config.js
+-- postcss.config.js
+-- vite.config.js
```

## ?????????? / Setup

### 1) Supabase

1. Create a Supabase project.
2. Run the SQL schema in the Supabase SQL editor (see below).
3. Enable RLS with anon policies (see below).

Create `.env` in project root:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2) Install & Run

```bash
npm install
npm run dev
```

Open http://localhost:3000

### 3) Supabase SQL (Tables)

```sql
-- CONFIG
create table if not exists public.config (
  key text primary key,
  value text not null
);

-- CATEGORIES
create table if not exists public.categories (
  id text primary key,
  label text not null,
  sort_order integer default 0
);

-- PRODUCTS
create table if not exists public.products (
  id bigint generated always as identity primary key,
  name text not null,
  price integer not null,
  sale_price integer,
  category text not null references public.categories(id) on delete restrict,
  sizes jsonb not null default '[]'::jsonb,
  colors jsonb not null default '[]'::jsonb,
  images jsonb not null default '[]'::jsonb,
  description text default '',
  badge text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_products_category on public.products(category);

-- CUSTOMERS (no postal_code)
create table if not exists public.customers (
  id bigint generated always as identity primary key,
  name text not null,
  phone text not null unique,
  address text default '',
  city text default '',
  province text default '',
  landmark text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_customers_phone on public.customers(phone);

-- ORDERS
create table if not exists public.orders (
  id bigint generated always as identity primary key,
  customer_id bigint references public.customers(id) on delete set null,
  items jsonb not null default '[]'::jsonb,
  subtotal integer not null,
  delivery_fee integer default 0,
  total integer not null,
  status text default 'pending',
  notes text default '',
  created_at timestamptz default now()
);
create index if not exists idx_orders_customer on public.orders(customer_id);
create index if not exists idx_orders_status on public.orders(status);
```

### 4) Supabase RLS Policies (anon)

```sql
alter table public.config enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.customers enable row level security;
alter table public.orders enable row level security;

create policy "anon config rw" on public.config
for all using (true) with check (true);

create policy "anon categories rw" on public.categories
for all using (true) with check (true);

create policy "anon products rw" on public.products
for all using (true) with check (true);

create policy "anon customers rw" on public.customers
for all using (true) with check (true);

create policy "anon orders rw" on public.orders
for all using (true) with check (true);
```

## ???????

- **Admin password**: `admin12345678` (????????? ???????)
- **WhatsApp**: ????????? ??????? > ??????
- **Data**: ?????????????? Supabase (Postgres)
