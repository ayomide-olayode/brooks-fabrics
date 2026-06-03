# Brooks Fabrics – Ankara Ecommerce

A modern, minimal ecommerce platform for selling Ankara fabrics by the yard.  
Built with **Next.js 14**, **MongoDB**, **Cloudinary**, and **Paystack**.

---

## Features

- 🛍 Browse products by category with filters
- 🛒 Add to cart (localStorage, persisted to DB for logged-in users)
- 💳 Checkout with Paystack (full payment flow)
- 💬 WhatsApp order option
- 📦 Admin dashboard – product, order, service & delivery location management
- 👤 Customer Accounts – Order history, saved addresses, and profile dashboard
- 📸 Cloudinary image uploads with multi-image gallery
- 📊 Stock tracking and validation (client + server)
- 🚀 Redis Caching for fast product & category loads
- ✉️ Transactional Emails via Google SMTP / Nodemailer
- 🎨 Responsive green/gold themed UI (Tailwind CSS)
- 🔐 JWT-based dual auth for Admins & Customers (NextAuth.js)
- 🪝 Paystack webhook for reliable payment confirmation

---

## Tech Stack

| Area        | Technology                    |
|-------------|-------------------------------|
| Framework   | Next.js 14 (App Router)       |
| Styling     | Tailwind CSS                  |
| Database    | MongoDB Atlas + Mongoose      |
| Caching     | Upstash Redis                 |
| Auth        | NextAuth.js (Credentials)     |
| Images      | Cloudinary                    |
| Payments    | Paystack                      |
| Emails      | Nodemailer (Google SMTP)      |
| Forms       | React Hook Form               |
| Toasts      | react-hot-toast               |

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account
- Upstash Redis account (free tier works)
- Cloudinary account (free tier works)
- Paystack account (test keys for dev)
- Gmail account with 2FA and App Password (for emails)

### Installation

```bash
git clone <repo>
cd brooks-fabrics
npm install
cp .env.local.example .env.local
# Fill in your keys in .env.local
npm run dev
```

### Environment Variables

Copy `.env.local.example` to `.env.local` and fill in:

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `NEXTAUTH_SECRET` | Random 32+ char string |
| `NEXTAUTH_URL` | Your app URL (http://localhost:3000 for dev) |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST Token |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Same cloud name (public) |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Unsigned upload preset name |
| `PAYSTACK_SECRET_KEY` | Paystack secret key (sk_test_… for dev) |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | Paystack public key |
| `NEXT_PUBLIC_DELIVERY_FEE` | Default delivery fee in NGN (fallback) |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | WhatsApp number without + (e.g. 2348123456789) |
| `SMTP_EMAIL` | Gmail address for transactional emails |
| `SMTP_PASSWORD` | Gmail App Password (16 characters) |

### Cloudinary Setup

1. Log in to Cloudinary
2. Go to **Settings → Upload → Upload presets**
3. Create an **unsigned** preset named `brooks_fabrics_unsigned`
4. Set folder to `brooks-fabrics`

### Create First Admin

```bash
MONGODB_URI=your_uri ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=yourpassword npm run seed-admin
```

Then log in at `/admin/login`.

### Paystack Webhook (Production)

Set your Paystack webhook URL to:
```
https://yourdomain.com/api/webhook
```

This handles payment confirmation even if the user closes their browser.

---

## Project Structure

```
src/
├── app/
│   ├── (public)/          # Public-facing pages
│   │   ├── page.jsx       # Home
│   │   ├── shop/          # Product listing
│   │   ├── product/[slug] # Product detail
│   │   ├── account/       # Customer dashboard & order history
│   │   ├── checkout/      # Checkout form
│   │   └── order-success/ # Post-payment confirmation
│   ├── admin/             # Admin pages (auth protected)
│   │   ├── login/
│   │   ├── dashboard/
│   │   ├── products/
│   │   ├── services/
│   │   ├── delivery-locations/
│   │   └── orders/
│   └── api/               # API routes
│       ├── auth/
│       ├── products/
│       ├── orders/
│       ├── checkout/
│       ├── verify-payment/
│       └── webhook/
├── components/
│   ├── ui/                # Modal, EmptyState
│   ├── layout/            # Header, Footer
│   ├── product/           # ProductCard, ProductGrid
│   └── admin/             # AdminSidebar, ProductForm
├── context/               # CartContext
├── lib/
│   ├── db/                # Mongoose connection + models
│   ├── auth/              # NextAuth config
│   ├── paystack/          # Payment helpers
│   ├── cloudinary/        # Upload helpers
│   └── utils/             # formatCurrency, slugify, etc.
└── middleware.js           # Route protection
```

---

## API Routes

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/products` | Public | List products (cached) |
| POST | `/api/products` | Admin | Create product |
| GET | `/api/products/[id]` | Admin | Get product |
| PATCH | `/api/products/[id]` | Admin | Update product |
| DELETE | `/api/products/[id]` | Admin | Delete product |
| GET | `/api/delivery-locations` | Public | List delivery zones |
| GET | `/api/services` | Public | List services |
| POST | `/api/customers/register` | Public | Customer registration |
| GET | `/api/customers/orders` | Customer | List customer's orders |
| POST | `/api/customers/addresses` | Customer | Add saved address |
| POST | `/api/checkout` | Public | Init Paystack payment |
| GET | `/api/verify-payment` | Public | Verify + create order |
| GET | `/api/orders` | Admin | List orders |
| PATCH | `/api/orders/[id]` | Admin | Update order status |
| POST | `/api/webhook` | Paystack | Payment webhook |

---

## Deployment (Vercel)

1. Push to GitHub
2. Import to Vercel
3. Set all environment variables in Vercel dashboard
4. Deploy

> **Important:** Set `NEXTAUTH_URL` to your production URL in Vercel env vars.

---

## License

MIT – Internal project.
