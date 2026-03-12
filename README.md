# MAISON — ຮ້ານແຟຊັ່ນອອນລາຍ

ຮ້ານແຟຊັ່ນອອນລາຍ ທີ່ສັ່ງຊື້ຜ່ານ WhatsApp, ມີ admin panel ຄົບຊຸດ.

## Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Express.js + better-sqlite3
- **Font**: Noto Sans Lao + Instrument Serif
- **Icons**: Lucide React

## ໂຄງສ້າງ Project

```
maison-store/
├── server/
│   ├── db.js              # SQLite setup & schema
│   ├── seed.js            # Seed default data
│   └── index.js           # Express API server
├── src/
│   ├── components/
│   │   ├── admin/
│   │   │   ├── AdminPanel.jsx       # Admin layout + login
│   │   │   ├── AdminProducts.jsx    # Product CRUD list
│   │   │   ├── AdminCategories.jsx  # Category CRUD
│   │   │   ├── AdminConfig.jsx      # Store settings + reset
│   │   │   └── ProductForm.jsx      # Add/edit product form
│   │   ├── checkout/
│   │   │   ├── CheckoutModal.jsx    # Checkout form + WhatsApp
│   │   │   └── OrderSuccess.jsx     # Success message
│   │   ├── store/
│   │   │   ├── CartDrawer.jsx       # Shopping cart sidebar
│   │   │   ├── Header.jsx           # Store header + search
│   │   │   ├── ProductCard.jsx      # Product grid card
│   │   │   └── ProductDetail.jsx    # Product detail modal
│   │   └── ui/
│   │       └── Toast.jsx            # Toast notifications
│   ├── data/
│   │   └── constants.js             # Default data & config
│   ├── hooks/
│   │   ├── useCart.js               # Cart state management
│   │   ├── useStoreData.js          # Store data + API calls
│   │   └── useToast.js              # Toast notifications
│   ├── lib/
│   │   ├── api.js                   # API client helper
│   │   └── utils.js                 # Format price, WhatsApp msg
│   ├── App.jsx                      # Main app component
│   ├── index.css                    # Tailwind + custom styles
│   └── main.jsx                     # Entry point
├── index.html
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── vite.config.js
```

## ການຕິດຕັ້ງ / Setup

```bash
# 1. Install dependencies
npm install

# 2. Seed the database with default data
npm run db:seed

# 3. Start both frontend & backend
npm run dev
```

ເປີດ http://localhost:3000 ເພື່ອເບິ່ງໜ້າຮ້ານ.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/config | ເອົາ config ທັງໝົດ |
| PUT | /api/config | ອັບເດດ config |
| POST | /api/config/reset | Reset ກັບ default |
| GET | /api/products | ລາຍການສິນຄ້າ |
| POST | /api/products | ເພີ່ມສິນຄ້າ |
| PUT | /api/products/:id | ແກ້ໄຂສິນຄ້າ |
| DELETE | /api/products/:id | ລຶບສິນຄ້າ |
| GET | /api/categories | ລາຍການໝວດໝູ່ |
| POST | /api/categories | ເພີ່ມໝວດໝູ່ |
| PUT | /api/categories/:id | ແກ້ໄຂໝວດໝູ່ |
| DELETE | /api/categories/:id | ລຶບໝວດໝູ່ |
| GET | /api/customers/:phone | ຄົ້ນຫາລູກຄ້າ |
| POST | /api/customers | ບັນທຶກລູກຄ້າ |
| POST | /api/orders | ສ້າງອໍເດີ |
| GET | /api/orders | ລາຍການອໍເດີ |

## ຄຳແນະນຳ

- **ລະຫັດ Admin**: `admin123` (ປ່ຽນໄດ້ໃນ ຕັ້ງຄ່າ)
- **WhatsApp**: ປ່ຽນເບີໃນ ຕັ້ງຄ່າ > ທົ່ວໄປ
- **ຂໍ້ມູນ**: ທັງໝົດບັນທຶກໃນ `server/store.db` (SQLite)
- **Reset**: ໃຊ້ `npm run db:seed` ຫຼື ກົດ Reset ໃນ admin
