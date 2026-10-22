import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import multer from 'multer';
import archiver from 'archiver';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Image upload directory setup
const UPLOAD_DIR = path.resolve(__dirname, 'assets/images/uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    const cleanBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${cleanBase}_${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit for high-res photos and video clips
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are permitted.'));
    }
  }
});

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets from assets/
app.use('/assets', express.static(path.resolve(__dirname, 'assets')));
app.use('/css', express.static(path.resolve(__dirname, 'css')));
app.use('/js', express.static(path.resolve(__dirname, 'js')));

// Local persistent storage file setup
const DATA_DIR = path.resolve(__dirname, 'data');
const DATA_FILE = path.resolve(DATA_DIR, 'database.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DEFAULT_MENU_ITEMS = JSON.parse(fs.readFileSync(path.resolve(DATA_DIR, 'menu-items.json'), 'utf-8'));

// Initial Seed Data
const DEFAULT_DATA = {
  menu_items: DEFAULT_MENU_ITEMS,
  gallery_images: [
    {
      id: "gal-video-1",
      title: "Masterclass: Plating Contemporary Afro-Fusion",
      category: "Cooking Videos",
      media_type: "video",
      video_url: "/assets/videos/chef_masterclass_plating.mp4",
      image_url: "/assets/images/hero_chef_plating.jpg",
      caption: "Chef Mwikali demonstrating delicate botanical garnishing and slow-reduction saucing techniques."
    },
    {
      id: "gal-seafood-1",
      title: "Swahili Garlic Butter Grilled Seafood Platter",
      category: "Cuisine",
      media_type: "image",
      image_url: "/assets/images/coastal_grilled_seafood.jpg",
      caption: "Kenyan coastal jumbo prawns and lobster tail basted in chili garlic butter and coconut lime glaze."
    },
    {
      id: "gal-dessert-1",
      title: "Artisanal Passion Fruit & Cardamom Tart",
      category: "Cuisine",
      media_type: "image",
      image_url: "/assets/images/gourmet_plated_dessert.jpg",
      caption: "Crispy sweet pastry filled with passion fruit curd, mango coulis, organic edible blossoms, and gold leaf."
    }
  ],
  services: [
    {
      id: "srv-1",
      title: "Weddings & Reception Catering",
      short_description: "Exquisite culinary styling, bespoke multi-course menus, and attentive silver-service staff for your dream celebration.",
      image_url: "/assets/images/luxury_catering_setup.jpg",
      guest_capacity: "50 – 1,000+ Guests",
      features: [
        "Custom wedding menu tasting session",
        "Full buffet or formal plated service",
        "Professional waitstaff & beverage coordination",
        "High-grade chafing sets & luxury presentation"
      ]
    },
    {
      id: "srv-2",
      title: "Corporate Conferences & Gala Dinners",
      short_description: "Punctual, seamless culinary execution for executive summits, brand launches, annual dinners, and cocktail networking events.",
      image_url: "/assets/images/hero_chef_plating.jpg",
      guest_capacity: "20 – 500+ Guests",
      features: [
        "Executive breakfast, lunch & coffee break spreads",
        "Finger-food cocktail canapés",
        "Prompt invoice & corporate payment support",
        "Strict dietary labeling (Halal, Vegan, Gluten-Free)"
      ]
    },
    {
      id: "srv-3",
      title: "Private In-Home Chef Experience",
      short_description: "Chef Mwikali cooks exclusively in your kitchen or residence for intimate anniversaries, VIP dinners, and milestones.",
      image_url: "/assets/images/chef_mwikali_portrait.jpg",
      guest_capacity: "2 – 25 Guests",
      features: [
        "Personalised 3 to 5-course tailored menu",
        "Fresh premium ingredient sourcing by Chef Mwikali",
        "Wine or beverage pairing recommendations",
        "Complete post-service kitchen clean-up"
      ]
    },
    {
      id: "srv-4",
      title: "Birthdays & Family Celebrations",
      short_description: "Lively, delicious feasts including live nyama choma grilling stations, pilau bars, and celebratory grazing tables.",
      image_url: "/assets/images/nyama_choma_platter.jpg",
      guest_capacity: "15 – 200 Guests",
      features: [
        "On-site charcoal grill station option",
        "Kid-friendly and adult gourmet menus",
        "Custom desserts & beverage station",
        "Flexible setup suited for private residences or gardens"
      ]
    }
  ],
  orders: [
    {
      id: "MK-ORD-20261018-7412",
      created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
      customer_name: "Wanjiku Mwangi",
      customer_phone: "+254 722 123 456",
      customer_email: "wanjiku.m@example.com",
      delivery_type: "delivery",
      delivery_address: "Kilimani, Argwings Kodhek Rd, Apt 4B, Nairobi",
      preferred_date: "2026-10-20",
      preferred_time: "13:00",
      items: [
        { id: "menu-1", name: "Swahili Beef Pilau Ya Sherehe", price: 950, quantity: 3, subtotal: 2850 },
        { id: "menu-4", name: "Artisanal Beef & Veg Samosa Trio", price: 450, quantity: 2, subtotal: 900 }
      ],
      subtotal: 3750,
      delivery_fee: 300,
      total_amount: 4050,
      notes: "Please deliver hot with extra kachumbari and lime.",
      status: "Accepted",
      payment_status: "Pending Arrangement"
    },
    {
      id: "MK-ORD-20261019-2184",
      created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
      customer_name: "Brian Otieno",
      customer_phone: "+254 733 987 654",
      customer_email: "brian.o@example.com",
      delivery_type: "collection",
      delivery_address: "Self Collection at Kitchen (Nairobi)",
      preferred_date: "2026-10-21",
      preferred_time: "17:30",
      items: [
        { id: "menu-2", name: "Flame-Kissed Nyama Choma Platter", price: 1850, quantity: 2, subtotal: 3700 },
        { id: "menu-8", name: "Fresh Hibiscus-Ginger Dawa Cooler", price: 350, quantity: 4, subtotal: 1400 }
      ],
      subtotal: 5100,
      delivery_fee: 0,
      total_amount: 5100,
      notes: "Will pick up on my way home from work.",
      status: "Pending",
      payment_status: "Pending Arrangement"
    }
  ],
  catering_bookings: [
    {
      id: "MK-CAT-20261017-9102",
      created_at: new Date(Date.now() - 3600000 * 36).toISOString(),
      customer_name: "Angela Muthoni",
      customer_phone: "+254 711 554 433",
      customer_email: "angela.muthoni@corporatekenya.co.ke",
      event_type: "Corporate Gala Dinner",
      event_date: "2026-11-14",
      location: "Westlands, Nairobi",
      guest_count: 85,
      preferred_service: "Corporate Conferences & Gala Dinners",
      budget_range: "KSh 150,000 - 250,000",
      additional_requirements: "We require a 3-course plated dinner with both fish and beef main options, plus vegetarian alternatives.",
      status: "Quote Sent"
    },
    {
      id: "MK-CAT-20261019-4821",
      created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
      customer_name: "David & Sharon Kimani",
      customer_phone: "+254 720 889 900",
      customer_email: "sharon.k@gmail.com",
      event_type: "Wedding Reception",
      event_date: "2026-12-05",
      location: "Karen Botanic Gardens, Nairobi",
      guest_count: 220,
      preferred_service: "Weddings & Reception Catering",
      budget_range: "KSh 350,000 - 500,000",
      additional_requirements: "Outdoor garden reception. Looking for full buffet setup with live grilling and dessert table.",
      status: "New"
    }
  ],
  site_settings: {
    business_name: "Mwikali Kioko",
    brand_tagline: "Every Dish Tells a Story",
    brand_subtitle: "Beautifully prepared meals, exceptional flavours, and memorable catering experiences.",
    whatsapp_number: "+254757246896", // Configurable WhatsApp international format
    phone: "+254 757 246 896",
    email: "mwikalik210@gmail.com",
    service_location: "Nairobi, Kenya (Nationwide catering upon arrangement)",
    business_hours: "Monday – Saturday: 08:00 AM – 08:00 PM | Sunday: Catering by Advance Booking",
    instagram: "https://instagram.com/mwikalikioko_chef",
    facebook: "https://facebook.com/mwikalikioko.chef",
    tiktok: "https://tiktok.com/@chef_mwikali",
    currency: "KSh"
  }
};

function readDb() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_DATA, null, 2), 'utf-8');
      return DEFAULT_DATA;
    }
    const content = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error('Error reading database file, using fallback', err);
    return DEFAULT_DATA;
  }
}

function writeDb(data: typeof DEFAULT_DATA) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing database file', err);
  }
}

// -----------------------------------------------------------------------------
// API Endpoints
// -----------------------------------------------------------------------------

// Settings & Contact Info
app.get('/api/settings', (req: Request, res: Response) => {
  const db = readDb();
  res.json({ success: true, settings: db.site_settings });
});

// Menu Items: Public GET
app.get('/api/menu', (req: Request, res: Response) => {
  const db = readDb();
  const { category, search } = req.query;
  let items = db.menu_items;

  if (category && category !== 'All') {
    items = items.filter((item: any) => item.category.toLowerCase() === String(category).toLowerCase());
  }

  if (search) {
    const q = String(search).toLowerCase();
    items = items.filter((item: any) => 
      item.name.toLowerCase().includes(q) || 
      item.description.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  }

  res.json({ success: true, items });
});

// Menu Item: Admin POST (Create)
app.post('/api/menu', (req: Request, res: Response) => {
  const { name, category, price, description, image_url, dietary, is_available } = req.body;
  if (!name || !price || !category) {
    return res.status(400).json({ success: false, message: 'Name, category, and price are required.' });
  }

  const db = readDb();
  const newItem = {
    id: `menu-${Date.now()}`,
    name: String(name).trim(),
    category: String(category).trim(),
    price: Math.max(0, parseInt(price) || 0),
    description: String(description || '').trim(),
    image_url: String(image_url || '/assets/images/hero_chef_plating.jpg').trim(),
    is_available: is_available !== false,
    dietary: Array.isArray(dietary) ? dietary : (typeof dietary === 'string' ? dietary.split(',').map(s => s.trim()) : []),
    featured: false
  };

  db.menu_items.unshift(newItem);
  writeDb(db);
  res.status(201).json({ success: true, item: newItem });
});

// Menu Item: Admin PUT (Update)
app.put('/api/menu/:id', (req: Request, res: Response) => {
  const db = readDb();
  const index = db.menu_items.findIndex((item: any) => item.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Menu item not found.' });
  }

  const existing = db.menu_items[index];
  const { name, category, price, description, image_url, dietary, is_available, featured } = req.body;

  db.menu_items[index] = {
    ...existing,
    name: name !== undefined ? String(name).trim() : existing.name,
    category: category !== undefined ? String(category).trim() : existing.category,
    price: price !== undefined ? Math.max(0, parseInt(price) || 0) : existing.price,
    description: description !== undefined ? String(description).trim() : existing.description,
    image_url: image_url !== undefined ? String(image_url).trim() : existing.image_url,
    dietary: dietary !== undefined ? (Array.isArray(dietary) ? dietary : dietary.split(',').map((s: string) => s.trim())) : existing.dietary,
    is_available: is_available !== undefined ? Boolean(is_available) : existing.is_available,
    featured: featured !== undefined ? Boolean(featured) : existing.featured
  };

  writeDb(db);
  res.json({ success: true, item: db.menu_items[index] });
});

// Menu Item: Admin DELETE
app.delete('/api/menu/:id', (req: Request, res: Response) => {
  const db = readDb();
  const prevLen = db.menu_items.length;
  db.menu_items = db.menu_items.filter((item: any) => item.id !== req.params.id);

  if (db.menu_items.length === prevLen) {
    return res.status(404).json({ success: false, message: 'Menu item not found.' });
  }

  writeDb(db);
  res.json({ success: true, message: 'Menu item removed.' });
});

// Image Upload Endpoint (General purpose)
app.post('/api/upload', upload.any(), (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[] | undefined;
  const file = (files && files.length > 0) ? files[0] : req.file;
  if (!file) {
    return res.status(400).json({ success: false, message: 'No media file uploaded.' });
  }
  const fileUrl = `/assets/images/uploads/${file.filename}`;
  res.json({ success: true, url: fileUrl, filename: file.filename, mimetype: file.mimetype });
});

// Gallery Items: GET All
app.get('/api/gallery', (req: Request, res: Response) => {
  const db = readDb();
  res.json({ success: true, gallery: db.gallery_images });
});

// Gallery Items: POST (Upload & Add)
app.post('/api/gallery', upload.any(), (req: Request, res: Response) => {
  const { title, category, caption, image_url, video_url, media_type } = req.body;
  if (!title || !String(title).trim()) {
    return res.status(400).json({ success: false, message: 'Title is required.' });
  }

  const files = req.files as Express.Multer.File[] | undefined;
  const file = (files && files.length > 0) ? files[0] : req.file;

  const isUploadedFile = !!file;
  const isVideoFile = isUploadedFile && file!.mimetype.startsWith('video/');
  let detectedMediaType = media_type || (isVideoFile ? 'video' : 'image');

  let fileUrl = '';
  if (file) {
    fileUrl = `/assets/images/uploads/${file.filename}`;
  }

  let finalImageUrl = image_url ? String(image_url).trim() : '';
  let finalVideoUrl = video_url ? String(video_url).trim() : '';

  if (isVideoFile) {
    finalVideoUrl = fileUrl;
    if (!finalImageUrl) {
      finalImageUrl = '/assets/images/hero_chef_plating.jpg'; // default video poster
    }
    detectedMediaType = 'video';
  } else if (isUploadedFile) {
    finalImageUrl = fileUrl;
    detectedMediaType = 'image';
  }

  if (!finalImageUrl && !finalVideoUrl) {
    return res.status(400).json({ success: false, message: 'Please upload a photo/video file or provide a media URL.' });
  }

  const db = readDb();
  const newItem = {
    id: `gal-${Date.now()}`,
    title: String(title).trim(),
    category: String(category || (detectedMediaType === 'video' ? 'Cooking Videos' : 'Cuisine')).trim(),
    media_type: detectedMediaType,
    image_url: finalImageUrl || '/assets/images/hero_chef_plating.jpg',
    video_url: finalVideoUrl || (detectedMediaType === 'video' ? finalImageUrl : ''),
    caption: String(caption || '').trim(),
    created_at: new Date().toISOString()
  };

  db.gallery_images.unshift(newItem);
  writeDb(db);
  res.status(201).json({ success: true, item: newItem });
});

// Gallery Items: DELETE
app.delete('/api/gallery/:id', (req: Request, res: Response) => {
  const db = readDb();
  const index = db.gallery_images.findIndex((g: any) => g.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Gallery item not found.' });
  }

  const item = db.gallery_images[index];
  db.gallery_images.splice(index, 1);
  writeDb(db);

  // If local uploaded file, delete from disk
  if (item.image_url && item.image_url.startsWith('/assets/images/uploads/')) {
    const filename = path.basename(item.image_url);
    const filePath = path.join(UPLOAD_DIR, filename);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (e) {
        console.warn('Failed to delete uploaded file from disk', e);
      }
    }
  }

  res.json({ success: true, message: 'Gallery item removed successfully.' });
});

// Services
app.get('/api/services', (req: Request, res: Response) => {
  const db = readDb();
  res.json({ success: true, services: db.services });
});

// Orders: Public POST (Create with server-side validation & pricing calculation)
app.post('/api/orders', (req: Request, res: Response) => {
  const { customer_name, customer_phone, customer_email, delivery_type, delivery_address, preferred_date, preferred_time, notes, items } = req.body;

  if (!customer_name || !customer_phone || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ 
      success: false, 
      message: 'Please provide customer name, phone number, and at least one order item.' 
    });
  }

  const db = readDb();
  
  // Recalculate prices against official database items to prevent client manipulation
  let subtotal = 0;
  const verifiedItems: any[] = [];

  for (const requestedItem of items) {
    const menuItem = db.menu_items.find((m: any) => m.id === requestedItem.id);
    if (!menuItem) continue;
    if (!menuItem.is_available) {
      return res.status(400).json({
        success: false,
        message: `Sorry, "${menuItem.name}" is currently unavailable.`
      });
    }

    const qty = Math.max(1, Math.min(50, parseInt(requestedItem.quantity) || 1));
    const lineSubtotal = menuItem.price * qty;
    subtotal += lineSubtotal;

    verifiedItems.push({
      id: menuItem.id,
      name: menuItem.name,
      price: menuItem.price,
      quantity: qty,
      subtotal: lineSubtotal
    });
  }

  if (verifiedItems.length === 0) {
    return res.status(400).json({ success: false, message: 'No valid dishes were found in the order.' });
  }

  const isDelivery = delivery_type === 'delivery';
  const delivery_fee = isDelivery ? 300 : 0; // Standard Nairobi metro delivery charge
  const total_amount = subtotal + delivery_fee;

  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const orderId = `MK-ORD-${dateStr}-${randomSuffix}`;

  const newOrder = {
    id: orderId,
    created_at: new Date().toISOString(),
    customer_name: String(customer_name).trim(),
    customer_phone: String(customer_phone).trim(),
    customer_email: customer_email ? String(customer_email).trim() : '',
    delivery_type: isDelivery ? 'delivery' : 'collection',
    delivery_address: isDelivery ? String(delivery_address || 'Nairobi area').trim() : 'Kitchen Pickup',
    preferred_date: String(preferred_date || new Date().toISOString().slice(0,10)),
    preferred_time: String(preferred_time || 'Lunch Service'),
    items: verifiedItems,
    subtotal,
    delivery_fee,
    total_amount,
    notes: notes ? String(notes).trim() : '',
    status: 'Pending',
    payment_status: 'Pending Arrangement'
  };

  db.orders.unshift(newOrder);
  writeDb(db);

  // Generate WhatsApp message string
  const cleanPhone = (db.site_settings.whatsapp_number || '+254757246896').replace(/[^0-9]/g, '');
  const itemsText = verifiedItems.map(i => `• ${i.quantity}x ${i.name} (KSh ${(i.subtotal).toLocaleString()})`).join('%0A');
  const waMessage = `Hello Chef Mwikali! I would like to place an order:%0A%0A*Order Ref:* ${orderId}%0A*Customer:* ${encodeURIComponent(newOrder.customer_name)}%0A*Phone:* ${encodeURIComponent(newOrder.customer_phone)}%0A*Type:* ${isDelivery ? 'Delivery to ' + encodeURIComponent(newOrder.delivery_address) : 'Kitchen Collection'}%0A*Date:* ${newOrder.preferred_date} (${newOrder.preferred_time})%0A%0A*Items:*%0A${itemsText}%0A%0A*Subtotal:* KSh ${subtotal.toLocaleString()}%0A*Delivery:* KSh ${delivery_fee.toLocaleString()}%0A*Total:* KSh ${total_amount.toLocaleString()}%0A${newOrder.notes ? '*Special Instructions:* ' + encodeURIComponent(newOrder.notes) + '%0A' : ''}%0APlease confirm availability. Thank you!`;
  
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${waMessage}`;

  res.status(201).json({
    success: true,
    order: newOrder,
    whatsapp_url: whatsappUrl,
    message: 'Your order enquiry has been submitted. Chef Mwikali will review and confirm availability.'
  });
});

// Orders: Admin GET
app.get('/api/orders', (req: Request, res: Response) => {
  const db = readDb();
  res.json({ success: true, orders: db.orders });
});

// Orders: Admin PATCH Status
app.patch('/api/orders/:id/status', (req: Request, res: Response) => {
  const { status, payment_status } = req.body;
  const db = readDb();
  const order = db.orders.find((o: any) => o.id === req.params.id);

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found.' });
  }

  const validStatuses = ['Pending', 'Accepted', 'Preparing', 'Ready for collection', 'Out for delivery', 'Completed', 'Cancelled'];
  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: `Status must be one of: ${validStatuses.join(', ')}` });
  }

  if (status) order.status = status;
  if (payment_status) order.payment_status = payment_status;

  writeDb(db);
  res.json({ success: true, order });
});

// Catering Bookings: Public POST
app.post('/api/bookings', (req: Request, res: Response) => {
  const { customer_name, customer_phone, customer_email, event_type, event_date, location, guest_count, preferred_service, budget_range, additional_requirements } = req.body;

  if (!customer_name || !customer_phone || !event_type || !event_date || !location || !guest_count) {
    return res.status(400).json({
      success: false,
      message: 'Please fill in all required fields: name, phone, event type, date, location, and guest count.'
    });
  }

  // Prevent past dates
  const selectedDate = new Date(event_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (isNaN(selectedDate.getTime()) || selectedDate < today) {
    return res.status(400).json({
      success: false,
      message: 'Event date must be today or in the future.'
    });
  }

  const guests = parseInt(guest_count) || 1;
  if (guests < 2) {
    return res.status(400).json({ success: false, message: 'Estimated guest count must be at least 2.' });
  }

  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const bookingId = `MK-CAT-${dateStr}-${randomSuffix}`;

  const newBooking = {
    id: bookingId,
    created_at: new Date().toISOString(),
    customer_name: String(customer_name).trim(),
    customer_phone: String(customer_phone).trim(),
    customer_email: customer_email ? String(customer_email).trim() : '',
    event_type: String(event_type).trim(),
    event_date: String(event_date),
    location: String(location).trim(),
    guest_count: guests,
    preferred_service: preferred_service ? String(preferred_service).trim() : 'Custom Catering',
    budget_range: budget_range ? String(budget_range).trim() : 'To be discussed',
    additional_requirements: additional_requirements ? String(additional_requirements).trim() : '',
    status: 'New'
  };

  const db = readDb();
  db.catering_bookings.unshift(newBooking);
  writeDb(db);

  // Generate WhatsApp catering quote link
  const cleanPhone = (db.site_settings.whatsapp_number || '+254757246896').replace(/[^0-9]/g, '');
  const waMessage = `Hello Chef Mwikali! I would like to enquire about catering services:%0A%0A*Booking Ref:* ${bookingId}%0A*Host Name:* ${encodeURIComponent(newBooking.customer_name)}%0A*Phone:* ${encodeURIComponent(newBooking.customer_phone)}%0A*Event Type:* ${encodeURIComponent(newBooking.event_type)}%0A*Date:* ${newBooking.event_date}%0A*Location:* ${encodeURIComponent(newBooking.location)}%0A*Guests:* ${newBooking.guest_count}%0A*Service:* ${encodeURIComponent(newBooking.preferred_service)}%0A*Budget Range:* ${encodeURIComponent(newBooking.budget_range)}%0A${newBooking.additional_requirements ? '*Notes:* ' + encodeURIComponent(newBooking.additional_requirements) + '%0A' : ''}%0APlease let me know if this date is open and provide a customised quote.`;

  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${waMessage}`;

  res.status(201).json({
    success: true,
    booking: newBooking,
    whatsapp_url: whatsappUrl,
    message: 'Catering booking enquiry received! Chef Mwikali will review your date and reach out promptly with a bespoke proposal.'
  });
});

// Catering Bookings: Admin GET
app.get('/api/bookings', (req: Request, res: Response) => {
  const db = readDb();
  res.json({ success: true, bookings: db.catering_bookings });
});

// Catering Bookings: Admin PATCH Status
app.patch('/api/bookings/:id/status', (req: Request, res: Response) => {
  const { status } = req.body;
  const db = readDb();
  const booking = db.catering_bookings.find((b: any) => b.id === req.params.id);

  if (!booking) {
    return res.status(404).json({ success: false, message: 'Booking enquiry not found.' });
  }

  const validStatuses = ['New', 'Contacted', 'Quote Sent', 'Confirmed', 'Completed', 'Declined'];
  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: `Status must be one of: ${validStatuses.join(', ')}` });
  }

  booking.status = status;
  writeDb(db);
  res.json({ success: true, booking });
});

// Admin Authentication: Verify Credentials
app.post('/api/admin/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  
  // Admin credentials are configured via the environment.
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'victortech035@gmail.com';
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

  if (!ADMIN_PASSWORD) {
    console.error('Admin login is unavailable because ADMIN_PASSWORD is not configured.');
    return res.status(503).json({
      success: false,
      message: 'Admin login is not configured. Please contact the site administrator.'
    });
  }

  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const token = `mwikali-adm-${Date.now()}-${Math.random().toString(36).substring(2)}`;
    return res.json({
      success: true,
      token,
      user: {
        email: ADMIN_EMAIL,
        name: "Chef Mwikali Kioko",
        role: "admin"
      }
    });
  }

  return res.status(401).json({
    success: false,
    message: 'Invalid email or password. Please use authorized credentials.'
  });
});

// Download Complete Project ZIP (Requirement 14)
app.get('/api/download-zip', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', 'attachment; filename="mwikali-kioko-chef-website.zip"');

  const archive = archiver('zip', { zlib: { level: 9 } });

  const handleArchiveError = (err: Error) => {
    console.error('Failed to create project ZIP', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to create project ZIP.' });
      return;
    }
    res.destroy(err);
  };

  archive.on('error', handleArchiveError);
  archive.on('warning', (warn) => {
    console.warn('ZIP archive warning', warn);
  });

  archive.pipe(res);

  archive.directory(__dirname, false, (entry) => {
    const relativePath = entry.name.replace(/^[\\/]+/, '');
    if (
      relativePath.startsWith('node_modules/') ||
      relativePath.startsWith('dist/') ||
      relativePath.startsWith('.git/') ||
      relativePath.startsWith('.aistudio/') ||
      relativePath === '.env' ||
      relativePath.endsWith('/.DS_Store') ||
      relativePath === '.DS_Store'
    ) {
      return false;
    }
    return entry;
  });

  archive.finalize().catch(handleArchiveError);
});

// -----------------------------------------------------------------------------
// Vite Dev Server / Static Hosting Integration
// -----------------------------------------------------------------------------
async function startServer() {
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'mpa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res, next) => {
      // Direct html file fallback
      const htmlPath = path.resolve(__dirname, 'dist', `${req.path.replace(/^\//, '')}.html`);
      if (fs.existsSync(htmlPath)) {
        return res.sendFile(htmlPath);
      }
      next();
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Chef Mwikali Kioko Web Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
