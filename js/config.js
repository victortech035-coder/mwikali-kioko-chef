/**
 * Chef Mwikali Kioko - Application Configuration
 */

const CONFIG = {
  // Business identity
  businessName: "Mwikali Kioko",
  tagline: "Every Dish Tells a Story",
  subtext: "Beautifully prepared meals, exceptional flavours, and memorable catering experiences.",
  
  // WhatsApp International Format (+254...)
  // Labelled configuration placeholder, customizable by administrator
  whatsappNumber: "+254757246896",
  phone: "+254 757 246 896",
  email: "mwikalik210@gmail.com",
  location: "Nairobi, Kenya",
  currency: "KSh",

  // Supabase Configuration Placeholders (Filled in by user or loaded via env)
  supabaseUrl: window.__SUPABASE_URL__ || "https://placeholder-project.supabase.co",
  supabaseAnonKey: window.__SUPABASE_ANON_KEY__ || "placeholder-anon-key",

  // API Endpoints
  apiBase: "/api"
};

/**
 * Helper to build an official wa.me link with URL-encoded message
 */
function buildWhatsAppLink(message = "") {
  const cleanNumber = CONFIG.whatsappNumber.replace(/[^0-9]/g, '');
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}

// Export to window for vanilla JS accessibility across pages
window.CONFIG = CONFIG;
window.buildWhatsAppLink = buildWhatsAppLink;
