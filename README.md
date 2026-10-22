# Mwikali Kioko – Chef & Catering Website

A modern, responsive, high-performance website and catering management platform built for **Chef Mwikali Kioko** in Kenya. The platform serves as her digital portfolio, online ordering menu, catering enquiry booking system, customer communication hub via WhatsApp, and protected chef admin portal.

---

## 🍽️ Key Features

1. **Brand Identity & Culinary Aesthetic**:
   - Deep forest green (`#18392B`), warm cream (`#FFF8EE`), elegant gold (`#C9A45C`), and charcoal (`#242424`).
   - High-fidelity food and banquet photography.
   - Refined typography pairing *Playfair Display* and *Plus Jakarta Sans*.

2. **Digital Menu & Online Ordering**:
   - Filter by categories: *Rice & Pilau*, *Traditional Kenyan*, *Main Dishes*, *Snacks & Appetisers*, *Desserts*, *Drinks*.
   - Instant search by dish name and ingredients.
   - Real interactive cart with quantity steppers, subtotal, and delivery charge calculation.
   - Order enquiry submission with unique reference (`MK-ORD-YYYYMMDD-XXXX`).
   - One-click **Confirm via WhatsApp** pre-filled with order items and pricing.

3. **Catering Booking System**:
   - Detailed enquiry form: Event type, event date, guest count, location, service style, and budget range.
   - Client-side & backend date validation strictly preventing past dates.
   - Instant quote follow-up via WhatsApp and booking reference (`MK-CAT-YYYYMMDD-XXXX`).

4. **Food Gallery & Portfolio**:
   - Category filtering (*All*, *Cuisine*, *Events*, *Chef at Work*).
   - Lightbox modal with captions and keyboard controls (`Esc`, `ArrowLeft`, `ArrowRight`).

5. **Protected Chef Admin Portal (`/admin`)**:
   - Overview metrics: Confirmed Revenue (KSh), Pending Orders, Active Catering Enquiries, Menu Count.
   - Real-time order workflow management: `Pending` &rarr; `Accepted` &rarr; `Preparing` &rarr; `Ready for collection` &rarr; `Out for delivery` &rarr; `Completed` / `Cancelled`.
   - Catering enquiry workflow: `New` &rarr; `Contacted` &rarr; `Quote Sent` &rarr; `Confirmed` &rarr; `Completed` / `Declined`.
   - Menu CRUD: Add dish, toggle stock availability (*Available* / *Sold Out*), edit price, and delete dishes.
   - Download Complete Project ZIP button.

6. **Direct WhatsApp Integration**:
   - Floating WhatsApp button on every public page.
   - Configurable international format (`+254 757246896` / `https://wa.me/2547576896`).

---

## 📂 Project Structure

```text
├── admin/                     # Protected Administrator Portal
│   ├── index.html             # Admin Sign-In
│   ├── dashboard.html         # Revenue & Operations Dashboard
│   ├── orders.html            # Customer Order Pipeline
│   ├── bookings.html          # Catering Enquiry Pipeline
│   ├── menu.html              # Menu CRUD & Availability
│   └── gallery.html           # Portfolio Photo Management
├── assets/                    # High-Resolution Visual Assets
│   └── images/                # Plating, Pilau, Nyama Choma, Banquet
├── css/
│   ├── styles.css             # Main Design System, Typography & Components
│   ├── responsive.css         # Mobile & Tablet Breakpoints
│   └── admin.css              # Dashboard Layout & Data Tables
├── js/
│   ├── config.js              # Business Configuration & WhatsApp Builder
│   ├── validation.js          # Kenyan Phone, Email & Date Validators
│   ├── supabase-client.js     # Supabase & Backend API Bridge
│   ├── cart.js                # Shopping Cart & Checkout Drawer
│   ├── menu.js                # Digital Menu Search & Rendering
│   ├── bookings.js            # Catering Form Submission
│   ├── gallery.js             # Lightbox & Category Filtering
│   ├── auth.js                # Admin Session & Route Guard
│   ├── admin.js               # Admin Metrics & Status Transitions
│   └── main.js                # Mobile Navbar, Active Nav & Toast Alerts
├── supabase/
│   ├── schema.sql             # PostgreSQL Tables, Foreign Keys & Indexes
│   ├── policies.sql           # Row Level Security (RLS) Policies
│   └── seed.sql               # Authentic Kenyan Culinary Data
├── netlify/
│   └── functions/api.js       # Netlify Serverless Function Wrapper
├── data/
│   └── database.json          # Persistent Local Storage (Auto-generated)
├── server.ts                  # Express Backend with REST API & Vite dev server
├── index.html                 # Homepage & Hero Showcase
├── about.html                 # Chef Story, Standards & Philosophy
├── menu.html                  # Searchable & Filterable Digital Menu
├── gallery.html               # Food Gallery & Lightbox
├── services.html              # Catering Packages & Service Details
├── bookings.html              # Catering Reservation Form
├── contact.html               # Contacts, Location & FAQs
├── robots.txt                 # Search Engine Directives
├── sitemap.xml                # SEO Sitemap
├── netlify.toml               # Netlify Deployment Configuration
├── vercel.json                # Vercel Deployment Configuration
├── .env.example               # Environment Variables Template
└── package.json               # Node.js Dependencies & Scripts
```

---

## 🚀 Quick Start & Local Development

### 1. Requirements
- Node.js (v18 or newer)
- npm or yarn

### 2. Installation
Clone or extract the project directory and install dependencies:
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open your browser at **`http://localhost:3000`**.

Default Admin Credentials:
- **Email:** `victortech035@gmail.com`
- **Password:** `ChefMwikali2026!`

---

## 🗄️ Supabase Setup & Cloud Database Integration

This application includes a ready-to-run Supabase configuration.

### Step 1: Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a free account.
2. Click **New Project**, name it `mwikali-kioko-chef`, and select your nearest region.

### Step 2: Run SQL Schema and RLS Policies
1. In the Supabase Dashboard, navigate to the **SQL Editor** tab.
2. Open `supabase/schema.sql` from this repository, paste its contents into the SQL Editor, and click **Run**.
3. Open `supabase/policies.sql`, paste into the SQL Editor, and click **Run** to enforce Row Level Security.
4. *(Optional)* Open `supabase/seed.sql`, paste, and click **Run** to populate initial dishes and services.

### Step 3: Configure Environment Variables
1. In Supabase, go to **Project Settings &rarr; API**.
2. Copy your **Project URL** and **anon public key**.
3. Create a `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```
4. Set:
   ```env
   SUPABASE_URL="https://your-project.supabase.co"
   SUPABASE_ANON_KEY="your-anon-key"
   SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
   ```

---

## 🌐 Deployment Instructions

### Deploying to Netlify
1. Connect your GitHub repository to [Netlify](https://www.netlify.com).
2. Set Build Command: `npm run build`
3. Set Publish Directory: `dist`
4. Add environment variables in Netlify Dashboard: **Site Settings &rarr; Environment Variables**.

### Deploying to Vercel
1. Import repository on [Vercel](https://vercel.com).
2. Framework Preset: **Other** or **Vite**.
3. Build Command: `npm run build`
4. Output Directory: `dist`

### Connecting a Custom Domain
1. In Netlify or Vercel, go to **Domain Management**.
2. Add `mwikalikioko.co.ke` (or your domain).
3. Configure the DNS CNAME/A records with your registrar (e.g., Safaricom Domains, Kenya Website Hosts, or Cloudflare).

---

## ✅ Quality Assurance Checklist

- [x] All 7 public navigation routes (`/`, `/about.html`, `/menu.html`, `/gallery.html`, `/services.html`, `/bookings.html`, `/contact.html`) tested and active.
- [x] Menu category filter & search bar operational.
- [x] Cart drawer adds/removes items, adjusts quantities, and accurately calculates KSh total.
- [x] Checkout modal validates Kenyan phone number (+254) and prevents invalid submission.
- [x] Order enquiry generates unique reference and pre-formatted WhatsApp message.
- [x] Catering booking form enforces future date selection and stores enquiries.
- [x] Lightbox expands gallery photos with caption and arrow/escape keys.
- [x] Admin dashboard protected with authentication.
- [x] Admin can update order statuses, booking statuses, add dishes, and toggle availability.
- [x] Project ZIP export available at `/api/download-zip`.
- [x] Zero external broken images; all imagery served locally.

---

## 📞 Support & Inquiries
- **Chef & Business Owner:** Chef Mwikali Kioko
- **Phone / WhatsApp:** `+254 757246896`
- **Email:** `mwikalikiok10@gmail.com`
- **Location:** Nairobi, Kenya
#   m w i k a l i - k i o k o - c h e f  
 #   m w i k a l i - k i o k o - c h e f  
 #   m w i k a l i - k i o k o - c h e f  
 #   m w i k a l i - k i o k o - c h e f  
 