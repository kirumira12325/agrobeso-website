import { useState, useEffect, useRef } from "react";
import { agrobesoSupabase as supabase, AGROBESO_STORAGE_URL } from "../integrations/supabase/agrobeso-client";

const ADMIN_PASSWORD = "Agrobeso2024";

// ─── Types ───────────────────────────────────────────────────────────────────
type UploadedImage = { name: string; url: string; category: string };
type ContentItem = { id: string; value: string };
type DesignToken = { id: string; label: string; type: string; default: string; options?: string[]; hint?: string; min?: number; max?: number; step?: number };
type DesignGroup = { group: string; tokens: DesignToken[] };
type SectionTemplate = { key: string; title: string; icon: string; description: string };
type CustomSection = { id: string; type: string; title: string; visible: boolean; items: any[] };
type Dish = { key: string; name: string; story: string; note: string };

// ─── Dish data ───────────────────────────────────────────────────────────────
const DEFAULT_DISHES: Dish[] = [
  { key: "jollof_rice", name: "Jollof Rice", story: "Long-grain rice slow-simmered in tomato and scotch bonnet.", note: "A dish of celebration" },
  { key: "waakye", name: "Waakye", story: "Rice and beans with sorghum leaves. Served with shito and fried plantain.", note: "A Saturday morning ritual" },
  { key: "kenkey_fish", name: "Kenkey & Fish", story: "Fermented corn dough, grilled tilapia, fresh pepper and shito.", note: "Coastal, warm, complete" },
  { key: "banku_okra", name: "Banku & Okra Stew", story: "Smooth, sour banku alongside an okra stew with smoked fish.", note: "Eaten with the right hand" },
  { key: "peanut_soup", name: "Peanut Soup", story: "Groundnut paste, tomato, ginger and slow-cooked goat.", note: "Nkate nkwan" },
  { key: "fufu", name: "Fufu / Pounded Yam", story: "Cassava and plantain pounded to a soft, elastic round.", note: "Pounded fresh" },
  { key: "fried_fish", name: "Fried Fish / Tilapia", story: "Whole tilapia scored, marinated and fried until the skin sings.", note: "Crisp, smoky, bright" },
  { key: "tuo_zaafi", name: "Tuo Zaafi", story: "A northern staple of soft millet meal with leafy green sauce.", note: "From the north" },
];

// ─── Content fields ──────────────────────────────────────────────────────────
const CONTENT_FIELDS = [
  { section: "Hero Section", icon: "🏠", fields: [
    { id: "hero_tagline", label: "Tagline (top badge)", multiline: false, hint: 'e.g. "Est. South London · Ghanaian Kitchen"' },
    { id: "hero_headline_line1", label: "Headline — Line 1", multiline: false, hint: 'e.g. "The taste"' },
    { id: "hero_headline_line2", label: "Headline — Line 2", multiline: false, hint: 'e.g. "of home,"' },
    { id: "hero_headline_italic", label: "Headline — Italic word", multiline: false, hint: 'e.g. "plated."' },
    { id: "hero_subheadline", label: "Sub-headline paragraph", multiline: true, hint: "Short description under the main headline" },
    { id: "hero_featured_dish", label: "Featured dish card text", multiline: false, hint: "Text on hero image card" },
  ]},
  { section: "Manifesto Section", icon: "✍️", fields: [
    { id: "manifesto_text", label: "Manifesto paragraph", multiline: true, hint: "The main statement about Agrobeso" },
  ]},
  { section: "Menu Section", icon: "🍽️", fields: [
    { id: "menu_headline", label: "Menu headline", multiline: false, hint: 'e.g. "A short list, cooked properly."' },
    { id: "menu_subtext", label: "Menu sub-text", multiline: true, hint: "Short description below the headline" },
    { id: "menu_footer_note", label: "Menu footer note", multiline: true, hint: "Small print about prices / availability" },
  ]},
  { section: "Heritage Section", icon: "🌍", fields: [
    { id: "heritage_headline", label: "Heritage headline", multiline: false, hint: "" },
    { id: "heritage_paragraph1", label: "Heritage paragraph 1", multiline: true, hint: "First paragraph (italic)" },
    { id: "heritage_paragraph2", label: "Heritage paragraph 2", multiline: true, hint: "Second paragraph" },
  ]},
  { section: "Locations Section", icon: "📍", fields: [
    { id: "locations_headline", label: "Locations headline", multiline: false, hint: "" },
    { id: "locations_subtext", label: "Locations sub-text", multiline: true, hint: "" },
  ]},
  { section: "Peckham Branch", icon: "🏪", fields: [
    { id: "peckham_address", label: "Address", multiline: false, hint: "" },
    { id: "peckham_phone_label", label: "Phone number (display)", multiline: false, hint: "" },
    { id: "peckham_phone_href", label: "Phone link", multiline: false, hint: 'e.g. "tel:+442012345678"' },
    { id: "peckham_hours", label: "Opening hours", multiline: true, hint: "" },
  ]},
  { section: "Thornton Heath Branch", icon: "🏪", fields: [
    { id: "thorntonheath_address", label: "Address", multiline: false, hint: "" },
    { id: "thorntonheath_phone_label", label: "Phone number (display)", multiline: false, hint: "" },
    { id: "thorntonheath_phone_href", label: "Phone link", multiline: false, hint: 'e.g. "tel:+442086846699"' },
    { id: "thorntonheath_hours", label: "Opening hours", multiline: true, hint: "" },
  ]},
  { section: "Gallery Section", icon: "🖼️", fields: [
    { id: "gallery_headline", label: "Gallery headline", multiline: false, hint: "" },
    { id: "gallery_subtext", label: "Gallery sub-text", multiline: true, hint: "" },
  ]},
  { section: "Reserve / Ordering", icon: "🪑", fields: [
    { id: "ordering_headline", label: "Ordering headline", multiline: false, hint: "" },
    { id: "ordering_subtext", label: "Ordering sub-text", multiline: true, hint: "" },
  ]},
  { section: "Contact Section", icon: "📬", fields: [
    { id: "contact_headline", label: "Contact headline", multiline: false, hint: "" },
    { id: "contact_subtext", label: "Contact sub-text", multiline: true, hint: "" },
  ]},
  { section: "Footer", icon: "🔻", fields: [
    { id: "footer_tagline", label: "Footer tagline", multiline: false, hint: "" },
    { id: "instagram_url", label: "Instagram URL", multiline: false, hint: "" },
  ]},
];


// ─── Section name → website anchor ID map (for live preview jump-to-section) ──
const SECTION_ANCHORS: Record<string, string> = {
  "Hero Section": "top",
  "Manifesto Section": "top",
  "Menu Section": "menu",
  "Heritage Section": "about",
  "Locations Section": "locations",
  "Peckham Branch": "locations",
  "Thornton Heath Branch": "locations",
  "Gallery Section": "gallery",
  "Reserve / Ordering": "ordering",
  "Contact Section": "contact",
  "Footer": "contact",
};
// ─── Design tokens ────────────────────────────────────────────────────────────
const DESIGN_GROUPS: DesignGroup[] = [
  { group: "Brand Colours", tokens: [
    { id: "color_bone", label: "Background (Bone)", type: "color", default: "#F4EFE6" },
    { id: "color_cocoa", label: "Cocoa (Dark / Text)", type: "color", default: "#1F1410" },
    { id: "color_clay", label: "Clay (Accent / Buttons)", type: "color", default: "#B8593A" },
    { id: "color_ochre", label: "Ochre (Gold accent)", type: "color", default: "#D4A574" },
    { id: "color_shell", label: "Shell (Alt background)", type: "color", default: "#EBE3D4" },
  ]},
  { group: "Typography", tokens: [
    { id: "font_display", label: "Display / Heading Font", type: "select", default: "Fraunces", options: ["Fraunces","Playfair Display","Cormorant Garamond","Libre Baskerville","Lora","Georgia"], hint: "Used for headings, dish names and large text" },
    { id: "font_body", label: "Body Font", type: "select", default: "Inter", options: ["Inter","DM Sans","Lato","Source Sans Pro","Open Sans","Nunito"], hint: "Used for paragraphs and small text" },
  ]},
  { group: "Layout & Spacing", tokens: [
    { id: "border_radius", label: "Card border radius (px)", type: "range", default: "8", min: 0, max: 32, step: 2, hint: "Affects cards, images, buttons" },
    { id: "spacing_density", label: "Section spacing", type: "select", default: "normal", options: ["compact","normal","spacious"], hint: "Controls vertical padding between sections" },
    { id: "layout_width", label: "Content width", type: "select", default: "contained", options: ["contained","wide","full-bleed"], hint: "Max width of content blocks" },
  ]},
  { group: "Visual Style", tokens: [
    { id: "card_style", label: "Card appearance", type: "select", default: "flat", options: ["flat","bordered","shadowed","glass"], hint: "Dish cards, location blocks" },
    { id: "hero_layout", label: "Hero text position", type: "select", default: "left", options: ["left","centre","right"], hint: "Where headline text sits in the hero" },
  ]},
];

// ─── Section templates ────────────────────────────────────────────────────────
const SECTION_TEMPLATES: SectionTemplate[] = [
  { key: "menu_full", title: "Full Menu", icon: "🍽️", description: "Categorised menu with prices" },
  { key: "gallery", title: "Gallery", icon: "📸", description: "Photo grid or lightbox" },
  { key: "locations", title: "Locations", icon: "📍", description: "Address cards with maps" },
  { key: "about", title: "About Us", icon: "🌍", description: "Story, team, values" },
  { key: "events", title: "Events", icon: "🎉", description: "Upcoming events calendar" },
  { key: "offers", title: "Offers", icon: "🏷️", description: "Promos and deals" },
  { key: "testimonials", title: "Testimonials", icon: "💬", description: "Customer reviews" },
  { key: "contact", title: "Contact", icon: "📬", description: "Full contact page" },
  { key: "faq", title: "FAQ", icon: "❓", description: "Frequently asked questions" },
  { key: "team", title: "Our Team", icon: "👨‍🍳", description: "Staff and chefs" },
  { key: "newsletter", title: "Newsletter", icon: "📧", description: "Email signup form" },
  { key: "partners", title: "Partners", icon: "🤝", description: "Logos and links" },
];

// ─── Section editable fields ─────────────────────────────────────────────────
const SECTION_FIELDS: Record<string, { label: string; type: string; hint?: string; placeholder?: string }[]> = {
  menu_full: [
    { label: "Section heading", type: "text", placeholder: "Our Full Menu" },
    { label: "Intro paragraph", type: "textarea", placeholder: "A short intro about the menu…" },
    { label: "Menu note (footer)", type: "textarea", placeholder: "Prices include VAT…" },
    { label: "Section image", type: "image" },
  ],
  gallery: [
    { label: "Gallery heading", type: "text", placeholder: "A Taste of Agrobeso" },
    { label: "Gallery description", type: "textarea", placeholder: "Photos of the food, atmosphere…" },
    { label: "Gallery layout", type: "select", hint: "grid|masonry|carousel" },
    { label: "Section image (cover)", type: "image" },
  ],
  locations: [
    { label: "Section heading", type: "text", placeholder: "Find Us" },
    { label: "Sub-text", type: "textarea", placeholder: "Two spots in South London" },
    { label: "Location 1 name", type: "text", placeholder: "Peckham" },
    { label: "Location 1 address", type: "text", placeholder: "123 Rye Lane, Peckham SE15" },
    { label: "Location 1 hours", type: "textarea", placeholder: "Mon–Fri 11am–9pm" },
    { label: "Location 2 name", type: "text", placeholder: "Thornton Heath" },
    { label: "Location 2 address", type: "text", placeholder: "456 London Road, Thornton Heath CR7" },
    { label: "Location 2 hours", type: "textarea", placeholder: "Mon–Sun 11am–10pm" },
  ],
  about: [
    { label: "Section heading", type: "text", placeholder: "Our Story" },
    { label: "Story paragraph 1", type: "textarea", placeholder: "How Agrobeso began…" },
    { label: "Story paragraph 2", type: "textarea", placeholder: "Our mission and values…" },
    { label: "Team description", type: "textarea", placeholder: "The people behind the food…" },
    { label: "Section image", type: "image" },
  ],
  events: [
    { label: "Section heading", type: "text", placeholder: "Upcoming Events" },
    { label: "Sub-text", type: "textarea", placeholder: "Join us for…" },
    { label: "Event 1 name", type: "text", placeholder: "Supper Club" },
    { label: "Event 1 date", type: "text", placeholder: "Saturday 15 June 2025" },
    { label: "Event 1 description", type: "textarea", placeholder: "A special evening of…" },
    { label: "Event 1 image", type: "image" },
  ],
  offers: [
    { label: "Section heading", type: "text", placeholder: "Current Offers" },
    { label: "Offer 1 title", type: "text", placeholder: "Lunch Deal" },
    { label: "Offer 1 description", type: "textarea", placeholder: "Any main + drink for £12" },
    { label: "Offer 2 title", type: "text", placeholder: "Family Box" },
    { label: "Offer 2 description", type: "textarea", placeholder: "Feeds 4 for £40" },
    { label: "Terms & conditions", type: "textarea", placeholder: "Available Mon–Fri, valid until…" },
  ],
  testimonials: [
    { label: "Section heading", type: "text", placeholder: "What Customers Say" },
    { label: "Review 1 quote", type: "textarea", placeholder: "The best jollof I have ever had…" },
    { label: "Review 1 author", type: "text", placeholder: "— James O., Peckham" },
    { label: "Review 2 quote", type: "textarea", placeholder: "Like eating at home in Accra…" },
    { label: "Review 2 author", type: "text", placeholder: "— Sarah K., Brixton" },
    { label: "Review 3 quote", type: "textarea", placeholder: "Authentic, generous portions…" },
    { label: "Review 3 author", type: "text", placeholder: "— Mike T., Croydon" },
  ],
  contact: [
    { label: "Section heading", type: "text", placeholder: "Get in Touch" },
    { label: "Sub-text", type: "textarea", placeholder: "We would love to hear from you…" },
    { label: "Contact email", type: "text", placeholder: "hello@agrobeso.co.uk" },
    { label: "Phone number", type: "text", placeholder: "+44 20 1234 5678" },
    { label: "Address", type: "textarea", placeholder: "123 Rye Lane, Peckham SE15" },
  ],
  faq: [
    { label: "Section heading", type: "text", placeholder: "Frequently Asked Questions" },
    { label: "Q1 question", type: "text", placeholder: "Do you cater for events?" },
    { label: "Q1 answer", type: "textarea", placeholder: "Yes, we offer catering for…" },
    { label: "Q2 question", type: "text", placeholder: "Can I pre-order?" },
    { label: "Q2 answer", type: "textarea", placeholder: "Pre-orders are available via…" },
    { label: "Q3 question", type: "text", placeholder: "Do you have vegetarian options?" },
    { label: "Q3 answer", type: "textarea", placeholder: "We have several dishes that are…" },
  ],
  team: [
    { label: "Section heading", type: "text", placeholder: "Meet the Team" },
    { label: "Team description", type: "textarea", placeholder: "The passionate people behind Agrobeso…" },
    { label: "Member 1 name", type: "text", placeholder: "Chef Kwame" },
    { label: "Member 1 role", type: "text", placeholder: "Head Chef & Founder" },
    { label: "Member 1 bio", type: "textarea", placeholder: "Kwame has been cooking since…" },
    { label: "Member 1 photo", type: "image" },
    { label: "Member 2 name", type: "text", placeholder: "Ama" },
    { label: "Member 2 role", type: "text", placeholder: "Restaurant Manager" },
    { label: "Member 2 bio", type: "textarea", placeholder: "Ama brings warmth and…" },
  ],
  newsletter: [
    { label: "Section heading", type: "text", placeholder: "Stay in the Loop" },
    { label: "Pitch text", type: "textarea", placeholder: "Get updates on new dishes, events and special offers…" },
    { label: "Button label", type: "text", placeholder: "Subscribe" },
    { label: "Privacy note", type: "text", placeholder: "No spam. Unsubscribe anytime." },
    { label: "Mailchimp / form URL", type: "text", placeholder: "https://…" },
  ],
  partners: [
    { label: "Section heading", type: "text", placeholder: "Our Partners" },
    { label: "Sub-text", type: "textarea", placeholder: "Proud to work with…" },
    { label: "Partner 1 name", type: "text", placeholder: "Deliveroo" },
    { label: "Partner 1 URL", type: "text", placeholder: "https://deliveroo.co.uk/…" },
    { label: "Partner 1 logo", type: "image" },
    { label: "Partner 2 name", type: "text", placeholder: "Uber Eats" },
    { label: "Partner 2 URL", type: "text", placeholder: "https://ubereats.com/…" },
    { label: "Partner 2 logo", type: "image" },
  ],
};

// ─── Shared styles ────────────────────────────────────────────────────────────
const S = {
  h2: { margin: "0 0 0.3rem", fontSize: "1.5rem", fontWeight: 400, color: "#2d1f14", fontFamily: "Georgia, serif" } as React.CSSProperties,
  hint: { margin: 0, fontSize: "0.82rem", color: "#bbb" } as React.CSSProperties,
  card: { background: "white", borderRadius: "10px", padding: "1.25rem 1.5rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginBottom: "0.85rem" } as React.CSSProperties,
  input: { width: "100%", padding: "0.6rem 0.8rem", border: "1.5px solid #e0d8d0", borderRadius: "6px", fontSize: "0.9rem", fontFamily: "inherit", boxSizing: "border-box" as const, background: "#fdfaf7" },
  fieldLabel: { display: "block", fontSize: "0.72rem", fontWeight: 700, color: "#666", marginBottom: "0.25rem", textTransform: "uppercase" as const, letterSpacing: "0.05em" },
  btnPrimary: { padding: "0.7rem 1.4rem", background: "#b04a2a", color: "white", border: "none", borderRadius: "8px", fontWeight: 700, cursor: "pointer", fontSize: "0.88rem" },
  btnSecondary: { padding: "0.55rem 1rem", background: "#2d1f14", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "0.82rem" },
  accordionBtn: { width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem 0", border: "none", background: "none", cursor: "pointer", textAlign: "left" as const },
};

// ─── ImageUploader component ──────────────────────────────────────────────────
function ImageUploader({ path, currentUrl, onUploaded }: { path: string; currentUrl: string; onUploaded: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState("");
  const upload = async (file: File) => {
    setUploading(true);
    const fileName = path + "-" + Date.now() + "." + (file.name.split(".").pop() || "jpg");
    const { error } = await supabase.storage.from("images").upload(fileName, file, { upsert: true });
    setUploading(false);
    if (error) { setMsg("Upload failed: " + error.message); return; }
    const url = AGROBESO_STORAGE_URL + "/" + fileName;
    setMsg("Uploaded!"); setTimeout(() => setMsg(""), 2500); onUploaded(url);
  };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
      {currentUrl && <img src={currentUrl} alt="current" style={{ width: "64px", height: "48px", objectFit: "cover", borderRadius: "5px" }} />}
      <label style={{ display: "inline-block", padding: "0.4rem 0.9rem", background: "#f0ebe5", border: "1px dashed #c8bfb5", borderRadius: "6px", cursor: "pointer", fontSize: "0.78rem", color: "#666" }}>
        {uploading ? "Uploading…" : currentUrl ? "Change image" : "Upload image"}
        <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0]; if (f) upload(f); }} />
      </label>
      {msg && <span style={{ fontSize: "0.75rem", color: msg.includes("fail") ? "#c00" : "#1a7a3a" }}>{msg}</span>}
    </div>
  );
}

// ─── SaveBtn component ────────────────────────────────────────────────────────
function SaveBtn({ onClick, saving, saved }: { onClick: () => void; saving: boolean; saved: boolean }) {
  return (
    <button onClick={onClick} disabled={saving} style={{ ...S.btnSecondary, fontSize: "0.72rem", padding: "0.3rem 0.85rem", background: saved ? "#27ae60" : "#2d1f14" } as React.CSSProperties}>
      {saving ? "Saving…" : saved ? "✓ Saved" : "Save"}
    </button>
  );
}

// ─── Field component ──────────────────────────────────────────────────────────
function Field({ label, hint, multiline, value, onChange, onSave, saving, saved }: {
  label: string; hint: string; multiline: boolean; value: string; onChange: (v: string) => void; onSave: () => void; saving: boolean; saved: boolean;
}) {
  return (
    <div style={{ marginBottom: "1.1rem" }}>
      <label style={S.fieldLabel as React.CSSProperties}>{label}</label>
      {hint && <p style={{ margin: "0 0 0.3rem", fontSize: "0.72rem", color: "#ccc", fontStyle: "italic" }}>{hint}</p>}
      {multiline
        ? <textarea value={value} onChange={e => onChange(e.target.value)} rows={3} style={{ ...S.input, resize: "vertical" } as React.CSSProperties} />
        : <input type="text" value={value} onChange={e => onChange(e.target.value)} style={S.input as React.CSSProperties} />
      }
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.3rem" }}>
        <SaveBtn onClick={onSave} saving={saving} saved={saved} />
      </div>
    </div>
  );
}

// ─── Section Preview Modal ────────────────────────────────────────────────────
function SectionPreviewModal({ template, onClose, onAdd }: { template: SectionTemplate; onClose: () => void; onAdd: () => void }) {
  const previewContent: Record<string, React.ReactNode> = {
    menu_full: (
      <div style={{ padding: "2rem", background: "#fdfaf7", minHeight: "300px" }}>
        <h2 style={{ fontFamily: "Georgia,serif", fontSize: "2rem", color: "#2d1f14", marginBottom: "1rem" }}>Our Full Menu</h2>
        <p style={{ color: "#666", marginBottom: "1.5rem" }}>A short list, cooked properly and with care.</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          {["Jollof Rice — £12","Waakye — £11","Kenkey & Fish — £13","Peanut Soup — £14"].map(d => (
            <div key={d} style={{ padding: "0.75rem 1rem", background: "white", borderRadius: "8px", border: "1px solid #e0d8d0", display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#2d1f14", fontWeight: 600, fontSize: "0.9rem" }}>{d.split(" — ")[0]}</span>
              <span style={{ color: "#b04a2a", fontWeight: 700 }}>{d.split(" — ")[1]}</span>
            </div>
          ))}
        </div>
        <p style={{ marginTop: "1rem", fontSize: "0.78rem", color: "#aaa" }}>Prices include VAT. Menu subject to availability.</p>
      </div>
    ),
    gallery: (
      <div style={{ padding: "2rem", background: "#fdfaf7" }}>
        <h2 style={{ fontFamily: "Georgia,serif", fontSize: "2rem", color: "#2d1f14", marginBottom: "0.5rem" }}>A Taste of Agrobeso</h2>
        <p style={{ color: "#666", marginBottom: "1.5rem" }}>Our food, our space, our people.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "0.5rem" }}>
          {["#d4a574","#b8593a","#2d1f14","#c88a3a","#8b5e3c","#e8ddd0"].map((c,i) => (
            <div key={i} style={{ height: "80px", background: c, borderRadius: "6px" }} />
          ))}
        </div>
      </div>
    ),
    locations: (
      <div style={{ padding: "2rem", background: "#fdfaf7" }}>
        <h2 style={{ fontFamily: "Georgia,serif", fontSize: "2rem", color: "#2d1f14", marginBottom: "0.5rem" }}>Find Us</h2>
        <p style={{ color: "#666", marginBottom: "1.5rem" }}>Two spots in South London.</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          {[["Peckham","123 Rye Lane, SE15","Mon–Fri 11am–9pm"],["Thornton Heath","456 London Rd, CR7","Mon–Sun 11am–10pm"]].map(([name,addr,hrs]) => (
            <div key={name} style={{ padding: "1rem", background: "white", borderRadius: "8px", border: "1px solid #e0d8d0" }}>
              <div style={{ fontWeight: 700, color: "#2d1f14", marginBottom: "0.3rem" }}>{name}</div>
              <div style={{ fontSize: "0.82rem", color: "#666" }}>{addr}</div>
              <div style={{ fontSize: "0.75rem", color: "#b04a2a", marginTop: "0.3rem" }}>{hrs}</div>
            </div>
          ))}
        </div>
      </div>
    ),
    about: (
      <div style={{ padding: "2rem", background: "#fdfaf7" }}>
        <h2 style={{ fontFamily: "Georgia,serif", fontSize: "2rem", color: "#2d1f14", marginBottom: "1rem" }}>Our Story</h2>
        <p style={{ color: "#555", lineHeight: 1.7, marginBottom: "1rem" }}>Agrobeso was born from a simple belief: that the food of West Africa deserves a permanent home in South London.</p>
        <p style={{ color: "#555", lineHeight: 1.7 }}>From the kitchens of Accra and Lagos, we bring the flavours of home to your table, your street, your evening.</p>
      </div>
    ),
    events: (
      <div style={{ padding: "2rem", background: "#fdfaf7" }}>
        <h2 style={{ fontFamily: "Georgia,serif", fontSize: "2rem", color: "#2d1f14", marginBottom: "1rem" }}>Upcoming Events</h2>
        <div style={{ padding: "1rem", background: "white", borderRadius: "8px", border: "1px solid #e0d8d0", marginBottom: "0.75rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
            <span style={{ fontWeight: 700, color: "#2d1f14" }}>Supper Club</span>
            <span style={{ color: "#b04a2a", fontSize: "0.82rem" }}>Sat 15 June</span>
          </div>
          <p style={{ color: "#666", fontSize: "0.85rem", margin: 0 }}>A special evening of Ghanaian cuisine with live music and storytelling.</p>
        </div>
      </div>
    ),
    offers: (
      <div style={{ padding: "2rem", background: "#fdfaf7" }}>
        <h2 style={{ fontFamily: "Georgia,serif", fontSize: "2rem", color: "#2d1f14", marginBottom: "1rem" }}>Current Offers</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          {[["🍱 Lunch Deal","Any main + drink for £12"],["👨‍👩‍👧‍👦 Family Box","Feeds 4 for only £40"]].map(([t,d]) => (
            <div key={t} style={{ padding: "1rem", background: "#b04a2a", borderRadius: "8px", color: "white" }}>
              <div style={{ fontWeight: 700, marginBottom: "0.3rem" }}>{t}</div>
              <div style={{ fontSize: "0.82rem", opacity: 0.9 }}>{d}</div>
            </div>
          ))}
        </div>
      </div>
    ),
    testimonials: (
      <div style={{ padding: "2rem", background: "#fdfaf7" }}>
        <h2 style={{ fontFamily: "Georgia,serif", fontSize: "2rem", color: "#2d1f14", marginBottom: "1.5rem" }}>What Customers Say</h2>
        {[["The best jollof I have ever had. Hands down.","— James O., Peckham"],["Like eating at home in Accra. Pure comfort.","— Sarah K., Brixton"]].map(([q,a]) => (
          <div key={a} style={{ padding: "1rem 1.25rem", background: "white", borderRadius: "8px", border: "1px solid #e0d8d0", marginBottom: "0.75rem", borderLeft: "3px solid #b04a2a" }}>
            <p style={{ color: "#2d1f14", fontStyle: "italic", marginBottom: "0.4rem" }}>"{q}"</p>
            <p style={{ color: "#b04a2a", fontSize: "0.82rem", margin: 0, fontWeight: 600 }}>{a}</p>
          </div>
        ))}
      </div>
    ),
    contact: (
      <div style={{ padding: "2rem", background: "#fdfaf7" }}>
        <h2 style={{ fontFamily: "Georgia,serif", fontSize: "2rem", color: "#2d1f14", marginBottom: "0.5rem" }}>Get in Touch</h2>
        <p style={{ color: "#666", marginBottom: "1.5rem" }}>We would love to hear from you.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {[["📧","hello@agrobeso.co.uk"],["📞","+44 20 1234 5678"],["📍","123 Rye Lane, Peckham SE15"]].map(([icon,val]) => (
            <div key={val} style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
              <span>{icon}</span><span style={{ color: "#2d1f14", fontSize: "0.9rem" }}>{val}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    faq: (
      <div style={{ padding: "2rem", background: "#fdfaf7" }}>
        <h2 style={{ fontFamily: "Georgia,serif", fontSize: "2rem", color: "#2d1f14", marginBottom: "1rem" }}>Frequently Asked Questions</h2>
        {[["Do you cater for events?","Yes, we offer full catering services for parties and corporate events."],["Can I pre-order?","Pre-orders available via phone or WhatsApp 48 hours in advance."]].map(([q,a]) => (
          <div key={q} style={{ marginBottom: "0.75rem" }}>
            <div style={{ fontWeight: 700, color: "#2d1f14", marginBottom: "0.2rem" }}>{q}</div>
            <div style={{ color: "#666", fontSize: "0.85rem" }}>{a}</div>
          </div>
        ))}
      </div>
    ),
    team: (
      <div style={{ padding: "2rem", background: "#fdfaf7" }}>
        <h2 style={{ fontFamily: "Georgia,serif", fontSize: "2rem", color: "#2d1f14", marginBottom: "1rem" }}>Meet the Team</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          {[["Chef Kwame","Head Chef & Founder"],["Ama","Restaurant Manager"]].map(([n,r]) => (
            <div key={n} style={{ padding: "1rem", background: "white", borderRadius: "8px", border: "1px solid #e0d8d0", textAlign: "center" }}>
              <div style={{ width: "50px", height: "50px", borderRadius: "50%", background: "#e0d8d0", margin: "0 auto 0.5rem", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem" }}>👨‍🍳</div>
              <div style={{ fontWeight: 700, color: "#2d1f14" }}>{n}</div>
              <div style={{ fontSize: "0.75rem", color: "#b04a2a" }}>{r}</div>
            </div>
          ))}
        </div>
      </div>
    ),
    newsletter: (
      <div style={{ padding: "2rem", background: "#2d1f14", textAlign: "center" }}>
        <h2 style={{ fontFamily: "Georgia,serif", fontSize: "2rem", color: "#f0c070", marginBottom: "0.5rem" }}>Stay in the Loop</h2>
        <p style={{ color: "rgba(255,255,255,0.7)", marginBottom: "1.5rem" }}>New dishes, events and special offers — straight to your inbox.</p>
        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
          <input readOnly value="your@email.com" style={{ padding: "0.6rem 1rem", borderRadius: "6px", border: "none", fontSize: "0.88rem", width: "220px" }} />
          <button style={{ padding: "0.6rem 1.2rem", background: "#b04a2a", color: "white", border: "none", borderRadius: "6px", fontWeight: 700, cursor: "pointer" }}>Subscribe</button>
        </div>
      </div>
    ),
    partners: (
      <div style={{ padding: "2rem", background: "#fdfaf7" }}>
        <h2 style={{ fontFamily: "Georgia,serif", fontSize: "2rem", color: "#2d1f14", marginBottom: "1rem" }}>Our Partners</h2>
        <div style={{ display: "flex", gap: "1.5rem", alignItems: "center", flexWrap: "wrap" }}>
          {["Deliveroo","Uber Eats","Just Eat","TimeOut"].map(p => (
            <div key={p} style={{ padding: "0.75rem 1.5rem", background: "white", borderRadius: "8px", border: "1px solid #e0d8d0", color: "#2d1f14", fontWeight: 700, fontSize: "0.9rem" }}>{p}</div>
          ))}
        </div>
      </div>
    ),
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.55)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div style={{ background: "white", borderRadius: "14px", width: "100%", maxWidth: "680px", maxHeight: "85vh", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 8px 48px rgba(0,0,0,0.25)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem 1.5rem", borderBottom: "1px solid #f0ebe5" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "1.3rem" }}>{template.icon}</span>
            <div>
              <div style={{ fontWeight: 700, color: "#2d1f14", fontSize: "1rem" }}>{template.title}</div>
              <div style={{ fontSize: "0.72rem", color: "#aaa" }}>{template.description}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "1.3rem", cursor: "pointer", color: "#aaa", padding: "0.25rem" }}>✕</button>
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          <div style={{ padding: "0.6rem 1.5rem", background: "#f5f0eb", borderBottom: "1px solid #e8e0d8", fontSize: "0.72rem", color: "#888" }}>
            Preview — this is how the section will look on the website
          </div>
          <div style={{ overflowY: "auto" }}>
            {previewContent[template.key] || (
              <div style={{ padding: "3rem", textAlign: "center", color: "#bbb" }}>
                <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>{template.icon}</div>
                <div>{template.title} section preview</div>
              </div>
            )}
          </div>
        </div>
        <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid #f0ebe5", display: "flex", justifyContent: "flex-end", gap: "0.6rem" }}>
          <button onClick={onClose} style={{ ...S.btnSecondary, background: "#f0ebe5", color: "#2d1f14" } as React.CSSProperties}>Cancel</button>
          <button onClick={() => { onAdd(); onClose(); }} style={S.btnPrimary as React.CSSProperties}>+ Add to Website</button>
        </div>
      </div>
    </div>
  );
}

// ─── Live Preview Panel ───────────────────────────────────────────────────────
function LivePreviewPanel({ content, isOpen, onToggle, activeAnchor }: { content: Record<string,string>; isOpen: boolean; onToggle: () => void; activeAnchor?: string }) {
  const [device, setDevice] = useState<"desktop"|"tablet"|"mobile">("desktop");
  const [previewKey, setPreviewKey] = useState(0);
  const previewWidth = device === "tablet" ? "768px" : device === "mobile" ? "375px" : "100%";

  return (
    <div style={{
      width: isOpen ? "40%" : "36px",
      minWidth: isOpen ? "280px" : "36px",
      maxWidth: isOpen ? "600px" : "36px",
      flexShrink: 0,
      transition: "width 0.25s ease, min-width 0.25s ease, max-width 0.25s ease",
      display: "flex",
      flexDirection: "column",
      background: "#1a1a1a",
      borderLeft: "1px solid #2a2a2a",
      position: "sticky",
      top: "45px",
      height: "calc(100vh - 45px)",
      overflow: "hidden",
    }}>
      {/* Toggle button */}
      <button
        onClick={onToggle}
        title={isOpen ? "Collapse preview" : "Show live preview"}
        style={{
          position: "absolute",
          top: "50%",
          left: isOpen ? "8px" : "50%",
          transform: isOpen ? "translateY(-50%)" : "translate(-50%, -50%)",
          zIndex: 10,
          background: "#b04a2a",
          border: "none",
          borderRadius: "20px",
          color: "white",
          cursor: "pointer",
          padding: isOpen ? "0.3rem 0.6rem" : "0.5rem 0.6rem",
          fontSize: isOpen ? "0.65rem" : "0.75rem",
          fontWeight: 700,
          boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
          display: "flex",
          alignItems: "center",
          gap: "0.3rem",
          whiteSpace: "nowrap",
        }}
      >
        {isOpen ? "← Hide" : "👁"}
      </button>

      {isOpen && (
        <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%" }}>
          {/* Panel header */}
          <div style={{ padding: "0.5rem 0.75rem 0.5rem 3rem", background: "#111", borderBottom: "1px solid #2a2a2a", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
            <span style={{ color: "#f0c070", fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em" }}>Live Preview</span>
            <div style={{ display: "flex", gap: "0.25rem" }}>
              {(["desktop","tablet","mobile"] as const).map(d => (
                <button key={d} onClick={() => setDevice(d)} style={{
                  padding: "0.18rem 0.45rem", borderRadius: "3px", border: "none", cursor: "pointer", fontSize: "0.6rem", fontWeight: 600,
                  background: device === d ? "#b04a2a" : "#2a2a2a", color: device === d ? "#fff" : "#888"
                }}>
                  {d === "desktop" ? "🖥" : d === "tablet" ? "📱" : "📱"}
                </button>
              ))}
              <button onClick={() => setPreviewKey(k => k + 1)} style={{ padding: "0.18rem 0.45rem", borderRadius: "3px", border: "none", background: "#2a2a2a", color: "#888", cursor: "pointer", fontSize: "0.6rem" }}>↻</button>
            </div>
          </div>

          {/* Preview iframe */}
          <div style={{ flex: 1, overflow: "hidden", display: "flex", justifyContent: "center", alignItems: "flex-start", background: device === "desktop" ? "#1a1a1a" : "#111", padding: device === "desktop" ? "0" : "0.5rem 0" }}>
            {device === "desktop" ? (
              <iframe
                key={`${previewKey}-${activeAnchor || "top"}`}
                src={`https://agrobeso-website.vercel.app/#${activeAnchor || "top"}`}
                style={{ width: "100%", height: "100%", border: "none", display: "block" }}
                title="Preview"
                onLoad={(e) => { try { const w = (e.target as HTMLIFrameElement).contentWindow; const d = (e.target as HTMLIFrameElement).contentDocument; const anchor = activeAnchor || "top"; if (w && d) { const el = d.getElementById(anchor); const top = el ? el.offsetTop : 0; setTimeout(() => { try { w.scrollTo({ top, left: 0, behavior: "instant" as ScrollBehavior }); } catch { w.scrollTo(0, top); } }, 100); } } catch {} }}
              />
            ) : (
              <div style={{
                width: previewWidth,
                height: "100%",
                overflow: "hidden",
                boxShadow: "0 0 0 1px #333, 0 8px 24px rgba(0,0,0,0.6)",
                borderRadius: "4px",
                flexShrink: 0,
              }}>
                <iframe
                  key={`${previewKey}-${activeAnchor || "top"}`}
                  src={`https://agrobeso-website.vercel.app/#${activeAnchor || "top"}`}
                  style={{ width: previewWidth, height: "100%", border: "none", display: "block" }}
                  title="Preview"
                  onLoad={(e) => { try { const w = (e.target as HTMLIFrameElement).contentWindow; const d = (e.target as HTMLIFrameElement).contentDocument; const anchor = activeAnchor || "top"; if (w && d) { const el = d.getElementById(anchor); const top = el ? el.offsetTop : 0; setTimeout(() => { try { w.scrollTo({ top, left: 0, behavior: "instant" as ScrollBehavior }); } catch { w.scrollTo(0, top); } }, 100); } } catch {} }}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Admin component ─────────────────────────────────────────────────────
export default function Admin() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('adminAuthed') === 'true');
  const [pw, setPw] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [tab, setTab] = useState("content");
  const [openSec, setOpenSec] = useState<Record<string,boolean>>({"Hero Section": true});
  const [content, setContent] = useState<Record<string,string>>({});
  const [saving, setSaving] = useState<string|null>(null);
  const [savedField, setSavedField] = useState<string|null>(null);
  const [loadingContent, setLoadingContent] = useState(false);
  const [globalSave, setGlobalSave] = useState<"idle"|"saving"|"saved"|"error">("idle");
  const [imgFile, setImgFile] = useState<File|null>(null);
  const [imgCat, setImgCat] = useState("gallery");
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [imgMsg, setImgMsg] = useState("");
  const [loadingImgs, setLoadingImgs] = useState(false);
  const [filterCat, setFilterCat] = useState("all");
  const [dishImages, setDishImages] = useState<Record<string,string>>({});
  const [dishUploading, setDishUploading] = useState<Record<string,boolean>>({});
  const [dishMsg, setDishMsg] = useState<Record<string,string>>({});
  const [design, setDesign] = useState<Record<string,string>>({});
  const [designSaving, setDesignSaving] = useState(false);
  const [designSaved, setDesignSaved] = useState(false);
  const [activeSections, setActiveSections] = useState<CustomSection[]>([]);
  const [sectionSaving, setSectionSaving] = useState(false);
  const [settings, setSettings] = useState<Record<string,string>>({
    site_name: "Agrobeso", tagline: "Authentic Ghanaian & West African Food",
    meta_description: "Home-style dishes from Peckham to Thornton Heath.",
    instagram: "#", facebook: "#", tiktok: "#", twitter: "#", whatsapp: "", email: "", phone_peckham: "", phone_thornton: "",
  });
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [previewDevice, setPreviewDevice] = useState("desktop");
  const [previewKey, setPreviewKey] = useState(0);
  const [sectionOrder, setSectionOrder] = useState(["hero","manifesto","menu","heritage","locations","gallery","ordering","contact"]);
  const [dragIdx, setDragIdx] = useState<number|null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number|null>(null);
  const [showShuffler, setShowShuffler] = useState(false);

  // ── Dishes state ──
  const [dishes, setDishes] = useState<Dish[]>(DEFAULT_DISHES);
  const [dishesLoaded, setDishesLoaded] = useState(false);
  const [showAddDish, setShowAddDish] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish|null>(null);
  const [newDish, setNewDish] = useState<Dish>({ key: "", name: "", story: "", note: "" });
  const [dishSaveMsg, setDishSaveMsg] = useState("");

  // ── Sections state ──
  const [sectionPreview, setSectionPreview] = useState<SectionTemplate|null>(null);
  const [sectionContent, setSectionContent] = useState<Record<string, Record<string,string>>>({});
  const [sectionContentSaving, setSectionContentSaving] = useState<string|null>(null);
  const [sectionRenaming, setSectionRenaming] = useState<string|null>(null);
  const [sectionRenameVal, setSectionRenameVal] = useState("");
  const [customSectionKey, setCustomSectionKey] = useState("");
  const [customSectionTitle, setCustomSectionTitle] = useState("");
  const [showAddCustomSection, setShowAddCustomSection] = useState(false);

  // ── Content preview panel ──
  const [previewPanelOpen, setPreviewPanelOpen] = useState(true);
  const [activeSection, setActiveSection] = useState<string>("Hero Section");

  const loadContent = async () => {
    setLoadingContent(true);
    const { data } = await supabase.from("site_content").select("id,value");
    if (data) {
      const map: Record<string,string> = {};
      const des: Record<string,string> = {};
      const set: Record<string,string> = {};
      const dishImg: Record<string,string> = {};
      const dishData: Record<string,Record<string,string>> = {};
      const secContent: Record<string,Record<string,string>> = {};
      data.forEach((r: ContentItem) => {
        if (r.id.startsWith("design__")) des[r.id.replace("design__","")] = r.value;
        else if (r.id.startsWith("settings__")) set[r.id.replace("settings__","")] = r.value;
        else if (r.id.startsWith("dish_img__")) dishImg[r.id.replace("dish_img__","")] = r.value;
        else if (r.id.startsWith("custom_dish__")) {
          try { const parsed = JSON.parse(r.value); dishData[r.id.replace("custom_dish__","")] = parsed; } catch(e){}
        }
        else if (r.id.startsWith("sec_content__")) {
          try { secContent[r.id.replace("sec_content__","")] = JSON.parse(r.value); } catch(e){}
        }
        else map[r.id] = r.value;
      });
      setContent(map);
      const defaultDes: Record<string,string> = {};
      DESIGN_GROUPS.forEach(g => g.tokens.forEach(t => { defaultDes[t.id] = t.default; }));
      setDesign({ ...defaultDes, ...des });
      setDishImages(dishImg);
      if (Object.keys(set).length > 0) setSettings(prev => ({ ...prev, ...set }));
      // Load custom dishes
      if (Object.keys(dishData).length > 0) {
        const customDishes = Object.values(dishData) as Dish[];
        setDishes(prev => {
          const existingKeys = prev.map(d => d.key);
          const newOnes = customDishes.filter(d => !existingKeys.includes(d.key));
          return [...prev, ...newOnes];
        });
      }
      setSectionContent(secContent);
    }
    setLoadingContent(false);
    setDishesLoaded(true);
  };

  const loadImages = async () => {
    setLoadingImgs(true);
    const { data, error } = await supabase.storage.from("images").list("", { limit: 200, sortBy: { column: "created_at", order: "desc" } });
    if (!error && data) {
      setImages(data.filter((f: any) => f.name !== ".emptyFolderPlaceholder").map((f: any) => ({
        name: f.name, url: AGROBESO_STORAGE_URL + "/" + f.name, category: f.name.split("-")[0] || "general"
      })));
    }
    setLoadingImgs(false);
  };

  const loadActiveSections = async () => {
    const { data } = await supabase.from("site_content").select("id,value").eq("id","sections__active");
    if (data && data[0]) { try { setActiveSections(JSON.parse(data[0].value)); } catch(e){} }
  };

  useEffect(() => {
    if (authed) { loadContent(); loadImages(); loadActiveSections(); }
  }, [authed]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pw === ADMIN_PASSWORD) { setAuthed(true); sessionStorage.setItem('adminAuthed', 'true'); } else alert("Incorrect password");
  };

  const saveField = async (fieldId: string) => {
    setSaving(fieldId);
    const { error } = await supabase.from("site_content").upsert({ id: fieldId, value: content[fieldId] || "", updated_at: new Date().toISOString() }, { onConflict: "id" });
    setSaving(null);
    if (!error) { setSavedField(fieldId); setPreviewKey((k: number) => k + 1); setTimeout(() => setSavedField(null), 2500); }
    else alert("Save failed: " + error.message);
  };

  const saveAll = async () => {
    setGlobalSave("saving");
    const upserts = CONTENT_FIELDS.flatMap(s => s.fields).filter(f => content[f.id] !== undefined).map(f => ({ id: f.id, value: content[f.id] || "", updated_at: new Date().toISOString() }));
    if (!upserts.length) { setGlobalSave("idle"); return; }
    const { error } = await supabase.from("site_content").upsert(upserts, { onConflict: "id" });
    setGlobalSave(error ? "error" : "saved"); if (!error) setPreviewKey((k: number) => k + 1); setTimeout(() => setGlobalSave("idle"), 3000);
  };

  const handleImgUpload = async () => {
    if (!imgFile) return;
    setUploading(true); setImgMsg("");
    const fileName = imgCat + "-" + Date.now() + "-" + imgFile.name.replace(/\s+/g,"_");
    const { error } = await supabase.storage.from("images").upload(fileName, imgFile, { upsert: true });
    if (error) setImgMsg("Upload failed: " + error.message);
    else { setImgMsg("Uploaded!"); setImgFile(null); await loadImages(); }
    setUploading(false);
  };

  const handleDeleteImage = async (name: string) => {
    if (!confirm("Delete this image?")) return;
    const { error } = await supabase.storage.from("images").remove([name]);
    if (!error) await loadImages(); else alert("Delete failed: " + error.message);
  };

  const handleDishImgUpload = async (dish: Dish, file: File) => {
    const slug = dish.key;
    setDishUploading(p => ({ ...p, [slug]: true }));
    const fileName = "dish-" + slug + "-" + Date.now() + "." + (file.name.split(".").pop() || "jpg");
    const { error: upErr } = await supabase.storage.from("images").upload(fileName, file, { upsert: true });
    if (upErr) { setDishMsg(p => ({ ...p, [slug]: "Upload failed: " + upErr.message })); setDishUploading(p => ({ ...p, [slug]: false })); return; }
    const url = AGROBESO_STORAGE_URL + "/" + fileName;
    const { error: dbErr } = await supabase.from("site_content").upsert({ id: "dish_img__" + slug, value: url, updated_at: new Date().toISOString() }, { onConflict: "id" });
    if (!dbErr) setDishImages(p => ({ ...p, [slug]: url }));
    setDishMsg(p => ({ ...p, [slug]: dbErr ? "DB update failed" : "Image updated!" }));
    setDishUploading(p => ({ ...p, [slug]: false }));
    setTimeout(() => setDishMsg(p => ({ ...p, [slug]: "" })), 3000);
  };

  const saveDesign = async () => {
    setDesignSaving(true);
    const upserts = Object.entries(design).map(([k,v]) => ({ id: "design__" + k, value: v, updated_at: new Date().toISOString() }));
    await supabase.from("site_content").upsert(upserts, { onConflict: "id" });
    setDesignSaving(false); setDesignSaved(true); setTimeout(() => setDesignSaved(false), 2500);
  };

  const addSection = async (tpl: SectionTemplate) => {
    const newSec: CustomSection = { id: tpl.key + "_" + Date.now(), type: tpl.key, title: tpl.title, visible: true, items: [] };
    const updated = [...activeSections, newSec];
    setActiveSections(updated); setSectionSaving(true);
    await supabase.from("site_content").upsert({ id: "sections__active", value: JSON.stringify(updated), updated_at: new Date().toISOString() }, { onConflict: "id" });
    setSectionSaving(false);
  };

  const addCustomSection = async () => {
    if (!customSectionTitle.trim()) return;
    const key = customSectionTitle.toLowerCase().replace(/\s+/g,"_").replace(/[^a-z0-9_]/g,"") + "_" + Date.now();
    const newSec: CustomSection = { id: key, type: "custom", title: customSectionTitle.trim(), visible: true, items: [] };
    const updated = [...activeSections, newSec];
    setActiveSections(updated); setSectionSaving(true);
    await supabase.from("site_content").upsert({ id: "sections__active", value: JSON.stringify(updated), updated_at: new Date().toISOString() }, { onConflict: "id" });
    setSectionSaving(false); setCustomSectionTitle(""); setShowAddCustomSection(false);
  };

  const renameSectionSave = async (id: string) => {
    const updated = activeSections.map(s => s.id === id ? { ...s, title: sectionRenameVal } : s);
    setActiveSections(updated); setSectionRenaming(null); setSectionSaving(true);
    await supabase.from("site_content").upsert({ id: "sections__active", value: JSON.stringify(updated), updated_at: new Date().toISOString() }, { onConflict: "id" });
    setSectionSaving(false);
  };

  const saveSectionContent = async (secId: string) => {
    setSectionContentSaving(secId);
    const { error } = await supabase.from("site_content").upsert({ id: "sec_content__" + secId, value: JSON.stringify(sectionContent[secId] || {}), updated_at: new Date().toISOString() }, { onConflict: "id" });
    setSectionContentSaving(null);
    if (!error) { setSavedField("sec_" + secId); setTimeout(() => setSavedField(null), 2500); }
  };

  const toggleSectionVisible = (id: string) => {
    const updated = activeSections.map(s => s.id === id ? { ...s, visible: !s.visible } : s);
    setActiveSections(updated);
    supabase.from("site_content").upsert({ id: "sections__active", value: JSON.stringify(updated), updated_at: new Date().toISOString() }, { onConflict: "id" });
  };

  const deleteSection = async (id: string) => {
    if (!confirm("Remove this section?")) return;
    const updated = activeSections.filter(s => s.id !== id);
    setActiveSections(updated);
    await supabase.from("site_content").upsert({ id: "sections__active", value: JSON.stringify(updated), updated_at: new Date().toISOString() }, { onConflict: "id" });
  };

  const saveSettings = async () => {
    setSettingsSaving(true);
    const upserts = Object.entries(settings).map(([k,v]) => ({ id: "settings__" + k, value: v, updated_at: new Date().toISOString() }));
    await supabase.from("site_content").upsert(upserts, { onConflict: "id" });
    setSettingsSaving(false); setSettingsSaved(true); setTimeout(() => setSettingsSaved(false), 2500);
  };

  const saveDish = async (dish: Dish) => {
    setSaving("dish_" + dish.key);
    const upserts = [
      { id: "dish_" + dish.key + "_name", value: content["dish_" + dish.key + "_name"] || dish.name, updated_at: new Date().toISOString() },
      { id: "dish_" + dish.key + "_story", value: content["dish_" + dish.key + "_story"] || dish.story, updated_at: new Date().toISOString() },
      { id: "dish_" + dish.key + "_note", value: content["dish_" + dish.key + "_note"] || dish.note, updated_at: new Date().toISOString() },
      { id: "dish_" + dish.key + "_price", value: content["dish_" + dish.key + "_price"] || "", updated_at: new Date().toISOString() },
    ];
    await supabase.from("site_content").upsert(upserts, { onConflict: "id" });
    setSaving(null); setSavedField("dish_" + dish.key); setTimeout(() => setSavedField(null), 2500);
  };

  const addNewDish = async () => {
    if (!newDish.name.trim()) { setDishSaveMsg("Please enter a dish name."); return; }
    const key = newDish.name.toLowerCase().replace(/\s+/g,"_").replace(/[^a-z0-9_]/g,"") + "_" + Date.now();
    const dish: Dish = { ...newDish, key };
    // Save to DB
    const upserts = [
      { id: "custom_dish__" + key, value: JSON.stringify(dish), updated_at: new Date().toISOString() },
      { id: "dish_" + key + "_story", value: dish.story, updated_at: new Date().toISOString() },
      { id: "dish_" + key + "_note", value: dish.note, updated_at: new Date().toISOString() },
      { id: "dish_" + key + "_price", value: "", updated_at: new Date().toISOString() },
    ];
    const { error } = await supabase.from("site_content").upsert(upserts, { onConflict: "id" });
    if (!error) {
      setDishes(prev => [...prev, dish]);
      setContent(prev => ({ ...prev, ["dish_" + key + "_story"]: dish.story, ["dish_" + key + "_note"]: dish.note, ["dish_" + key + "_price"]: "" }));
      setNewDish({ key: "", name: "", story: "", note: "" });
      setShowAddDish(false);
      setDishSaveMsg("Dish added!");
      setTimeout(() => setDishSaveMsg(""), 2500);
    } else {
      setDishSaveMsg("Error: " + error.message);
    }
  };

  const deleteDish = async (dish: Dish) => {
    if (!confirm(`Remove "${dish.name}" from the menu? This cannot be undone.`)) return;
    const isDefault = DEFAULT_DISHES.some(d => d.key === dish.key);
    if (!isDefault) {
      await supabase.from("site_content").delete().eq("id", "custom_dish__" + dish.key);
    }
    const keysToDelete = ["_name","_story","_note","_price"].map(s => "dish_" + dish.key + s);
    await Promise.all(keysToDelete.map(k => supabase.from("site_content").delete().eq("id", k)));
    setDishes(prev => prev.filter(d => d.key !== dish.key));
    setContent(prev => {
      const next = { ...prev };
      keysToDelete.forEach(k => delete next[k]);
      return next;
    });
  };

  const filteredImages = filterCat === "all" ? images : images.filter(i => i.category === filterCat);
  const imageCats = ["all", ...Array.from(new Set(images.map(i => i.category)))];
  const SECTION_LABELS: Record<string,{icon:string;label:string;anchor:string}> = {
    hero: { icon:"🏠", label:"Hero", anchor:"#top" },
    manifesto: { icon:"✍️", label:"Manifesto", anchor:"#top" },
    menu: { icon:"🍽️", label:"Menu", anchor:"#menu" },
    heritage: { icon:"🌍", label:"Heritage", anchor:"#about" },
    locations: { icon:"📍", label:"Locations", anchor:"#locations" },
    gallery: { icon:"🖼️", label:"Gallery", anchor:"#gallery" },
    ordering: { icon:"🪑", label:"Reserve / Order", anchor:"#ordering" },
    contact: { icon:"📬", label:"Contact", anchor:"#contact" },
  };

  const handleDragStart = (idx: number) => setDragIdx(idx);
  const handleDragOver = (e: React.DragEvent, idx: number) => { e.preventDefault(); setDragOverIdx(idx); };
  const handleDrop = (idx: number) => {
    if (dragIdx === null || dragIdx === idx) { setDragIdx(null); setDragOverIdx(null); return; }
    const updated = [...sectionOrder]; const [moved] = updated.splice(dragIdx, 1); updated.splice(idx, 0, moved);
    setSectionOrder(updated); setDragIdx(null); setDragOverIdx(null);
    supabase.from("site_content").upsert({ id:"layout__section_order", value:JSON.stringify(updated), updated_at:new Date().toISOString() },{ onConflict:"id" });
  };
  const handleDragEnd = () => { setDragIdx(null); setDragOverIdx(null); };

  // ─── Login screen ──────────────────────────────────────────────────────────
  if (!authed) return (
    <div style={{ minHeight: "100vh", background: "#f5f0eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "white", padding: "2.5rem", borderRadius: "14px", boxShadow: "0 4px 32px rgba(0,0,0,0.1)", width: "360px", maxWidth: "90vw" }}>
        <p style={{ fontFamily: "monospace", fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#b04a2a", marginBottom: "0.5rem" }}>Agrobeso</p>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 400, margin: "0 0 0.25rem", color: "#2d1f14" }}>Admin Dashboard</h1>
        <p style={{ color: "#aaa", marginBottom: "1.75rem", fontSize: "0.9rem" }}>Enter your password to continue.</p>
        <form onSubmit={handleLogin}>
          <div style={{ position: "relative", marginBottom: "1rem" }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Admin password"
              value={pw}
              onChange={e => setPw(e.target.value)}
              style={{ ...S.input, marginBottom: 0, paddingRight: "2.5rem", width: "100%", boxSizing: "border-box" } as React.CSSProperties}
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassword(s => !s)}
              style={{ position: "absolute", right: "0.5rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#888", fontSize: "0.85rem", padding: "0.2rem" }}
            >
              {showPassword ? "🙈" : "👁"}
            </button>
          </div>
          <button type="submit" style={{ ...S.btnPrimary, width: "100%" } as React.CSSProperties}>Sign in</button>
        </form>
      </div>
    </div>
  );

  // ─── Tabs definition ───────────────────────────────────────────────────────
  const TABS = [
    { id: "content", icon: "✏️", label: "Content" },
    { id: "images", icon: "🖼️", label: "Images" },
    { id: "dishes", icon: "🍽️", label: "Dishes" },
    { id: "design", icon: "🎨", label: "Design Studio" },
    { id: "sections", icon: "➕", label: "Sections" },
    { id: "settings", icon: "⚙️", label: "Settings" },
    { id: "help", icon: "💡", label: "Help & Tips" },
    { id: "preview", icon: "👁️", label: "Preview" },
  ];

  // ─── Full-screen preview mode ──────────────────────────────────────────────
  if (tab === "preview") {
    return (
      <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", zIndex: 9999, display: "flex", flexDirection: "column", background: "#111" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.55rem 1rem", background: "#1c1c1c", borderBottom: "1px solid #2a2a2a", flexShrink: 0, flexWrap: "wrap" }}>
          <button onClick={() => setTab("content")} style={{ padding: "0.3rem 0.75rem", borderRadius: "4px", background: "#2a2a2a", border: "1px solid #444", color: "#ccc", cursor: "pointer", fontSize: "0.72rem", marginRight: "0.25rem" }}>← Admin</button>
          <span style={{ color: "#555", fontSize: "0.75rem", marginRight: "0.5rem" }}>|</span>
          <span style={{ fontWeight: 700, color: "#fff", fontSize: "0.78rem", letterSpacing: "0.05em", marginRight: "0.5rem" }}>LIVE PREVIEW</span>
          {([ { id: "desktop", label: "Desktop" }, { id: "tablet", label: "Tablet 768px" }, { id: "mobile", label: "Mobile 390px" } ] as const).map(d => (
            <button key={d.id} onClick={() => { setPreviewDevice(d.id as any); setPreviewKey((k: number) => k + 1); }} style={{ padding: "0.28rem 0.7rem", borderRadius: "4px", border: "1px solid", cursor: "pointer", fontSize: "0.73rem", fontWeight: 600, background: previewDevice === d.id ? "#c8622a" : "transparent", color: previewDevice === d.id ? "#fff" : "#aaa", borderColor: previewDevice === d.id ? "#c8622a" : "#3a3a3a" }}>{d.label}</button>
          ))}
          <div style={{ marginLeft: "auto", display: "flex", gap: "0.4rem", alignItems: "center" }}>
            <button onClick={() => setPreviewKey((k: number) => k + 1)} style={{ padding: "0.28rem 0.75rem", borderRadius: "4px", background: "#2a2a2a", border: "1px solid #3a3a3a", color: "#ccc", cursor: "pointer", fontSize: "0.72rem" }}>↻ Refresh</button>
            <a href="https://agrobeso-website.vercel.app" target="_blank" rel="noreferrer" style={{ padding: "0.28rem 0.75rem", borderRadius: "4px", background: "#1a4f35", border: "1px solid #276749", color: "#7fff9a", cursor: "pointer", fontSize: "0.72rem", textDecoration: "none", fontWeight: 600 }}>↗ Open in new tab</a>
            <button onClick={() => setShowShuffler((s: boolean) => !s)} style={{ padding: "0.28rem 0.75rem", borderRadius: "4px", background: showShuffler ? "#3a2010" : "#2a2a2a", border: "1px solid", borderColor: showShuffler ? "#c8622a" : "#3a3a3a", color: showShuffler ? "#f0a060" : "#ccc", cursor: "pointer", fontSize: "0.72rem" }}>⇅ Layout</button>
          </div>
        </div>
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          {showShuffler && (
            <div style={{ width: "185px", flexShrink: 0, background: "#141414", borderRight: "1px solid #222", overflowY: "auto", padding: "0.75rem 0.6rem" }}>
              <div style={{ color: "#888", fontSize: "0.62rem", fontWeight: 700, marginBottom: "0.35rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Section Order</div>
              <div style={{ fontSize: "0.6rem", color: "#555", marginBottom: "0.65rem" }}>Drag rows to reorder</div>
              {sectionOrder.map((sec: string, i: number) => {
                const info = SECTION_LABELS[sec];
                return (
                  <div key={sec} draggable onDragStart={() => handleDragStart(i)} onDragOver={(e: any) => handleDragOver(e, i)} onDrop={() => handleDrop(i)} onDragEnd={handleDragEnd}
                    style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.38rem 0.45rem", marginBottom: "0.25rem", borderRadius: "4px", cursor: "grab", background: dragOverIdx === i ? "#c8622a18" : "#1e1e1e", border: dragIdx === i ? "1px dashed #c8622a" : "1px solid #2a2a2a", color: "#bbb", fontSize: "0.68rem" }}>
                    <span style={{ fontSize: "0.8rem" }}>{info?.icon || "📦"}</span>
                    <span>{info?.label || sec}</span>
                    <span style={{ marginLeft: "auto", color: "#444", fontSize: "0.58rem" }}>#{i + 1}</span>
                  </div>
                );
              })}
              <button onClick={() => setSectionOrder(["hero","manifesto","menu","heritage","locations","gallery","ordering","contact"])} style={{ width: "100%", marginTop: "0.5rem", padding: "0.3rem", background: "transparent", border: "1px solid #2a2a2a", borderRadius: "4px", color: "#666", cursor: "pointer", fontSize: "0.62rem" }}>↺ Reset order</button>
            </div>
          )}
          <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: previewDevice === "desktop" ? "stretch" : "flex-start", overflow: "auto", background: previewDevice === "desktop" ? "#f0ede8" : "#1a1a1a", padding: previewDevice === "desktop" ? "0" : "1.5rem 0" }}>
            {previewDevice === "desktop" && <iframe key={previewKey} src="https://agrobeso-website.vercel.app" style={{ width: "100%", height: "100%", border: "none", display: "block" }} title="Desktop preview" />}
            {previewDevice === "tablet" && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ fontSize: "0.66rem", color: "#888", marginBottom: "0.6rem" }}>iPad Air · 768px wide</div>
                <div style={{ width: "768px", height: "calc(100vh - 115px)", overflow: "hidden", boxShadow: "0 0 0 1px #333, 0 24px 64px rgba(0,0,0,0.8)", borderRadius: "4px" }}>
                  <iframe key={previewKey} src="https://agrobeso-website.vercel.app" style={{ width: "768px", height: "100%", border: "none" }} title="Tablet preview" />
                </div>
              </div>
            )}
            {previewDevice === "mobile" && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ fontSize: "0.66rem", color: "#888", marginBottom: "0.6rem" }}>iPhone 14 · 390px wide</div>
                <div style={{ width: "390px", height: "calc(100vh - 115px)", overflow: "hidden", boxShadow: "0 0 0 1px #333, 0 24px 64px rgba(0,0,0,0.8)", borderRadius: "4px" }}>
                  <iframe key={previewKey} src="https://agrobeso-website.vercel.app" style={{ width: "390px", height: "100%", border: "none" }} title="Mobile preview" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: "100vh", maxHeight: "100vh", overflow: "hidden", background: "#f5f0eb", display: "flex", flexDirection: "column" }}>
      {/* Top bar */}
      <div style={{ background: "#2d1f14", color: "white", padding: "0.75rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 200 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span style={{ fontFamily: "Georgia,serif", fontSize: "1.1rem" }}>Agrobeso</span>
          <span style={{ fontSize: "0.7rem", opacity: 0.4, textTransform: "uppercase", letterSpacing: "0.1em" }}>Admin</span>
        </div>
        <a href="/" target="_blank" rel="noreferrer" style={{ color: "#f0c070", textDecoration: "none", fontSize: "0.82rem" }}>View website ↗</a>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Sidebar */}
        <nav style={{ width: "195px", flexShrink: 0, background: "#2d1f14", minHeight: "calc(100vh - 45px)", position: "sticky", top: "45px", height: "calc(100vh - 45px)", overflowY: "auto" }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ width: "100%", display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.8rem 1rem", border: "none", background: tab === t.id ? "rgba(176,74,42,0.25)" : "transparent", color: tab === t.id ? "#f0c070" : "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: "0.82rem", textAlign: "left", borderLeft: tab === t.id ? "3px solid #b04a2a" : "3px solid transparent" }}>
              <span style={{ fontSize: "1rem" }}>{t.icon}</span>
              <span style={{ fontWeight: tab === t.id ? 700 : 400 }}>{t.label}</span>
            </button>
          ))}
          <div style={{ padding: "1.5rem 1rem 1rem", marginTop: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.67rem", lineHeight: 1.5 }}>Changes save to Supabase instantly. Site refreshes within ~30s.</p>
          </div>
        </nav>

        {/* Main area + live preview panel (content tab only) */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          <main style={{ flex: 1, padding: "1.75rem", overflowY: "auto", overflowX: "hidden", minWidth: 0 }}>

            {/* ═══ CONTENT TAB ════════════════════════════════════════════════ */}
            {tab === "content" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", gap: "1rem", flexWrap: "wrap" }}>
                  <div>
                    <h2 style={S.h2}>Edit Website Text</h2>
                    <p style={S.hint}>Click a section to expand. Save individually or use Save All.</p>
                  </div>
                  <div style={{ display: "flex", gap: "0.6rem" }}>
                    <button onClick={loadContent} style={S.btnSecondary as React.CSSProperties}>↻ Reload</button>
                    <button onClick={saveAll} disabled={globalSave === "saving"} style={{ ...S.btnPrimary, opacity: globalSave === "saving" ? 0.7 : 1 } as React.CSSProperties}>
                      {globalSave === "saving" ? "Saving…" : globalSave === "saved" ? "✓ All Saved!" : "Save All"}
                    </button>
                  </div>
                </div>
                {loadingContent ? <div style={{ textAlign: "center", padding: "4rem", color: "#999" }}>Loading content…</div> :
                  CONTENT_FIELDS.map(sec => {
                    const isOpen = !!openSec[sec.section];
                    return (
                      <div key={sec.section} style={S.card}>
                        <button onClick={() => { setOpenSec(p => ({ ...p, [sec.section]: !p[sec.section] })); setActiveSection(sec.section); }} style={S.accordionBtn as React.CSSProperties}>
                          <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <span>{sec.icon}</span>
                            <span style={{ fontWeight: 700, color: "#2d1f14", fontSize: "0.9rem" }}>{sec.section}</span>
                            <span style={{ fontSize: "0.7rem", color: "#bbb" }}>({sec.fields.length})</span>
                          </span>
                          <span style={{ color: "#b04a2a", fontSize: "0.8rem" }}>{isOpen ? "▲" : "▼"}</span>
                        </button>
                        {isOpen && (
                          <div style={{ paddingTop: "0.5rem", borderTop: "1px solid #f0ebe5" }}>
                            {sec.fields.map(f => (
                              <Field key={f.id} label={f.label} hint={f.hint || ""} multiline={f.multiline}
                                value={content[f.id] || ""} onChange={v => setContent(p => ({ ...p, [f.id]: v }))}
                                onSave={() => saveField(f.id)} saving={saving === f.id} saved={savedField === f.id} />
                            ))}
                            <div style={{ marginTop: "1rem", paddingTop: "0.75rem", borderTop: "1px dashed #e8e0d8" }}>
                              <p style={{ ...S.fieldLabel as any, marginBottom: "0.4rem" }}>Section Image</p>
                              <ImageUploader
                                path={"section-" + sec.section.toLowerCase().replace(/\s+/g,"-")}
                                currentUrl={content["img__" + sec.section.toLowerCase().replace(/\s+/g,"_")] || ""}
                                onUploaded={url => {
                                  const key = "img__" + sec.section.toLowerCase().replace(/\s+/g,"_");
                                  setContent(p => ({ ...p, [key]: url }));
                                  supabase.from("site_content").upsert({ id: key, value: url, updated_at: new Date().toISOString() }, { onConflict: "id" });
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                }
              </div>
            )}

            {/* ═══ IMAGES TAB ══════════════════════════════════════════════════ */}
            {tab === "images" && (
              <div>
                <h2 style={S.h2}>Manage Images</h2>
                <p style={{ ...S.hint, marginBottom: "1.5rem" }}>Upload and manage all site images. Categories keep things organised.</p>
                <div style={S.card}>
                  <h3 style={{ margin: "0 0 1rem", color: "#2d1f14", fontSize: "0.95rem", fontWeight: 700 }}>Upload a New Image</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                    <div>
                      <label style={S.fieldLabel as React.CSSProperties}>Category</label>
                      <select value={imgCat} onChange={e => setImgCat(e.target.value)} style={S.input as React.CSSProperties}>
                        {["gallery","hero","menu","about","event","general","dishes"].map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={S.fieldLabel as React.CSSProperties}>Image file</label>
                      <input type="file" accept="image/*" onChange={e => setImgFile(e.target.files?.[0] || null)} style={{ fontSize: "0.85rem", paddingTop: "0.45rem" }} />
                    </div>
                  </div>
                  {imgFile && <p style={{ fontSize: "0.8rem", padding: "0.35rem 0.65rem", background: "#f5f0ea", borderRadius: "5px", marginBottom: "0.75rem" }}>📎 {imgFile.name} ({(imgFile.size / 1024).toFixed(0)} KB)</p>}
                  <button onClick={handleImgUpload} disabled={uploading || !imgFile} style={{ ...S.btnPrimary, opacity: uploading || !imgFile ? 0.5 : 1 } as React.CSSProperties}>
                    {uploading ? "Uploading…" : "⬆ Upload Image"}
                  </button>
                  {imgMsg && <p style={{ marginTop: "0.6rem", padding: "0.45rem 0.75rem", background: imgMsg.includes("fail") ? "#fee8e8" : "#e8f8ee", borderRadius: "6px", fontSize: "0.82rem", color: imgMsg.includes("fail") ? "#c00" : "#1a7a3a" }}>{imgMsg}</p>}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "1.25rem 0 0.6rem", flexWrap: "wrap", gap: "0.4rem" }}>
                  <h3 style={{ margin: 0, color: "#2d1f14", fontSize: "0.95rem" }}>Uploaded Images ({filteredImages.length})</h3>
                  <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                    {imageCats.map(c => (
                      <button key={c} onClick={() => setFilterCat(c)} style={{ padding: "0.2rem 0.65rem", border: "1.5px solid", borderColor: filterCat === c ? "#b04a2a" : "#e0d8d0", background: filterCat === c ? "#b04a2a" : "white", color: filterCat === c ? "white" : "#555", borderRadius: "20px", cursor: "pointer", fontSize: "0.7rem" }}>{c}</button>
                    ))}
                    <button onClick={loadImages} style={{ padding: "0.2rem 0.65rem", background: "#2d1f14", color: "white", border: "none", borderRadius: "20px", cursor: "pointer", fontSize: "0.7rem" }}>↻</button>
                  </div>
                </div>
                {loadingImgs ? <div style={{ textAlign: "center", padding: "3rem", color: "#999" }}>Loading…</div> :
                  filteredImages.length === 0 ? <div style={{ textAlign: "center", padding: "3rem", color: "#bbb", background: "white", borderRadius: "10px" }}>No images {filterCat !== "all" ? '"' + filterCat + '"' : "uploaded yet"}.</div> :
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(170px,1fr))", gap: "0.75rem" }}>
                    {filteredImages.map(img => (
                      <div key={img.name} style={{ background: "white", borderRadius: "10px", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
                        <img src={img.url} alt={img.name} style={{ width: "100%", height: "115px", objectFit: "cover", display: "block" }} />
                        <div style={{ padding: "0.5rem 0.6rem" }}>
                          <div style={{ fontSize: "0.65rem", color: "#b04a2a", fontWeight: 700, textTransform: "uppercase", marginBottom: "0.3rem" }}>{img.category}</div>
                          <div style={{ display: "flex", gap: "0.3rem" }}>
                            <button onClick={() => { navigator.clipboard.writeText(img.url).catch(() => {}); setImgMsg("URL copied!"); setTimeout(() => setImgMsg(""), 2000); }} style={{ flex: 1, padding: "0.28rem", background: "#2d1f14", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "0.65rem" }}>Copy URL</button>
                            <button onClick={() => handleDeleteImage(img.name)} style={{ flex: 1, padding: "0.28rem", background: "#dc2626", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "0.65rem" }}>Delete</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                }
              </div>
            )}

            {/* ═══ DISHES TAB ══════════════════════════════════════════════════ */}
            {tab === "dishes" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", gap: "1rem", flexWrap: "wrap" }}>
                  <div>
                    <h2 style={S.h2}>Manage Dishes</h2>
                    <p style={S.hint}>Edit dish stories, notes, prices and photos. Add new dishes or remove custom ones.</p>
                  </div>
                  <button onClick={() => setShowAddDish(true)} style={{ ...S.btnPrimary, display: "flex", alignItems: "center", gap: "0.4rem" } as React.CSSProperties}>
                    + Add New Dish
                  </button>
                </div>

                {dishSaveMsg && (
                  <div style={{ padding: "0.65rem 1rem", background: dishSaveMsg.includes("Error") ? "#fee8e8" : "#e8f8ee", borderRadius: "8px", marginBottom: "1rem", fontSize: "0.85rem", color: dishSaveMsg.includes("Error") ? "#c00" : "#1a7a3a", fontWeight: 600 }}>
                    {dishSaveMsg}
                  </div>
                )}

                {/* Add New Dish Form */}
                {showAddDish && (
                  <div style={{ ...S.card, border: "2px solid #b04a2a", marginBottom: "1.5rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                      <h3 style={{ margin: 0, fontSize: "1rem", fontFamily: "Georgia,serif", color: "#2d1f14" }}>Add New Dish</h3>
                      <button onClick={() => { setShowAddDish(false); setNewDish({ key:"",name:"",story:"",note:"" }); }} style={{ background: "none", border: "none", fontSize: "1.1rem", cursor: "pointer", color: "#aaa" }}>✕</button>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "0.75rem" }}>
                      <div>
                        <label style={S.fieldLabel as React.CSSProperties}>Dish Name *</label>
                        <input type="text" value={newDish.name} onChange={e => setNewDish(p => ({ ...p, name: e.target.value }))} style={S.input as React.CSSProperties} placeholder="e.g. Egusi Soup" />
                      </div>
                      <div>
                        <label style={S.fieldLabel as React.CSSProperties}>Short Note / Tagline</label>
                        <input type="text" value={newDish.note} onChange={e => setNewDish(p => ({ ...p, note: e.target.value }))} style={S.input as React.CSSProperties} placeholder="e.g. A West African classic" />
                      </div>
                    </div>
                    <div style={{ marginBottom: "1rem" }}>
                      <label style={S.fieldLabel as React.CSSProperties}>Description / Story</label>
                      <textarea value={newDish.story} onChange={e => setNewDish(p => ({ ...p, story: e.target.value }))} rows={3} style={{ ...S.input, resize: "vertical" } as React.CSSProperties} placeholder="A short evocative description of the dish…" />
                    </div>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.6rem" }}>
                      <button onClick={() => { setShowAddDish(false); setNewDish({ key:"",name:"",story:"",note:"" }); }} style={S.btnSecondary as React.CSSProperties}>Cancel</button>
                      <button onClick={addNewDish} style={S.btnPrimary as React.CSSProperties}>+ Add Dish</button>
                    </div>
                  </div>
                )}

                {loadingContent && !dishesLoaded ? <div style={{ textAlign: "center", padding: "4rem", color: "#999" }}>Loading…</div> :
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1rem" }}>
                    {dishes.map((dish, i) => {
                      const isCustom = !DEFAULT_DISHES.some(d => d.key === dish.key);
                      return (
                        <div key={dish.key} style={{ ...S.card, marginBottom: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                          {/* Dish header */}
                          <div style={{ display: "flex", alignItems: "flex-start", gap: "0.85rem" }}>
                            <div style={{ flexShrink: 0 }}>
                              {dishImages[dish.key]
                                ? <img src={dishImages[dish.key]} alt={dish.name} style={{ width: "80px", height: "60px", objectFit: "cover", borderRadius: "7px", display: "block" }} />
                                : <div style={{ width: "80px", height: "60px", background: "#f0ebe5", borderRadius: "7px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem" }}>🍽️</div>
                              }
                              <label style={{ display: "block", marginTop: "0.3rem", fontSize: "0.65rem", color: "#b04a2a", textAlign: "center", cursor: "pointer", fontWeight: 600 }}>
                                {dishUploading[dish.key] ? "Uploading…" : "📷 Photo"}
                                <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0]; if (f) handleDishImgUpload(dish, f); }} />
                              </label>
                              {dishMsg[dish.key] && <p style={{ fontSize: "0.62rem", color: dishMsg[dish.key].includes("fail") ? "#c00" : "#1a7a3a", textAlign: "center", margin: "0.15rem 0 0" }}>{dishMsg[dish.key]}</p>}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ marginBottom: "0.5rem" }}>
                                <label style={S.fieldLabel as React.CSSProperties}>Dish Name</label>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginTop: "0.25rem" }}>
                                  <span style={{ fontSize: "0.72rem", color: "#bbb", flexShrink: 0 }}>{String(i+1).padStart(2,"0")}.</span>
                                  <input
                                    type="text"
                                    value={content["dish_" + dish.key + "_name"] !== undefined ? content["dish_" + dish.key + "_name"] : dish.name}
                                    onChange={e => setContent(prev => ({ ...prev, ["dish_" + dish.key + "_name"]: e.target.value }))}
                                    style={{ ...S.input, flex: 1, fontFamily: "Georgia,serif", fontWeight: 600, fontSize: "0.92rem" } as React.CSSProperties}
                                    placeholder={dish.name}
                                  />
                                  {isCustom && <span style={{ fontSize: "0.6rem", background: "#b04a2a", color: "white", padding: "0.1rem 0.4rem", borderRadius: "10px", fontWeight: 700, flexShrink: 0 }}>Custom</span>}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Editable fields */}
                          <div>
                            <label style={S.fieldLabel as React.CSSProperties}>Story / Description</label>
                            <textarea value={content["dish_" + dish.key + "_story"] !== undefined ? content["dish_" + dish.key + "_story"] : dish.story} rows={2}
                              onChange={e => setContent(p => ({ ...p, ["dish_" + dish.key + "_story"]: e.target.value }))}
                              style={{ ...S.input, resize: "vertical", width: "100%" } as React.CSSProperties} placeholder="Short description…" />
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                            <div>
                              <label style={S.fieldLabel as React.CSSProperties}>Tagline / Note</label>
                              <input type="text" value={content["dish_" + dish.key + "_note"] !== undefined ? content["dish_" + dish.key + "_note"] : dish.note}
                                onChange={e => setContent(p => ({ ...p, ["dish_" + dish.key + "_note"]: e.target.value }))}
                                style={{ ...S.input, width: "100%" } as React.CSSProperties} />
                            </div>
                            <div>
                              <label style={S.fieldLabel as React.CSSProperties}>Price</label>
                              <input type="text" value={content["dish_" + dish.key + "_price"] || ""}
                                onChange={e => setContent(p => ({ ...p, ["dish_" + dish.key + "_price"]: e.target.value }))}
                                style={{ ...S.input, width: "100%" } as React.CSSProperties} placeholder="£0.00" />
                            </div>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "0.25rem", borderTop: "1px dashed #e8e0d8" }}>
                            <button onClick={() => deleteDish(dish)} style={{ padding: "0.25rem 0.65rem", background: "#fee8e8", color: "#dc2626", border: "1px solid #fca5a5", borderRadius: "5px", cursor: "pointer", fontSize: "0.7rem", fontWeight: 600 }}>Delete</button>
                            <button onClick={() => saveDish(dish)} disabled={saving !== null} style={{ ...S.btnPrimary, fontSize: "0.75rem", padding: "0.35rem 0.9rem", background: savedField === "dish_" + dish.key ? "#27ae60" : "#b04a2a" } as React.CSSProperties}>
                              {saving === "dish_" + dish.key ? "Saving…" : savedField === "dish_" + dish.key ? "✓ Saved" : "Save"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                }
              </div>
            )}

            {/* ═══ DESIGN STUDIO TAB ═══════════════════════════════════════════ */}
            {tab === "design" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
                  <div>
                    <h2 style={S.h2}>Design Studio</h2>
                    <p style={S.hint}>Customise the look and feel of your website. Save to apply changes live.</p>
                  </div>
                  <button onClick={saveDesign} disabled={designSaving} style={{ ...S.btnPrimary, opacity: designSaving ? 0.7 : 1 } as React.CSSProperties}>
                    {designSaving ? "Saving…" : designSaved ? "✓ Saved!" : "Save Design"}
                  </button>
                </div>
                {DESIGN_GROUPS.map(group => (
                  <div key={group.group} style={{ ...S.card, marginBottom: "1rem" }}>
                    <h3 style={{ margin: "0 0 1rem", color: "#2d1f14", fontSize: "0.88rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>{group.group}</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(210px,1fr))", gap: "1rem" }}>
                      {group.tokens.map((t: DesignToken) => (
                        <div key={t.id}>
                          <label style={S.fieldLabel as React.CSSProperties}>{t.label}</label>
                          {t.type === "color" && (
                            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                              <input type="color" value={design[t.id] || t.default} onChange={e => setDesign(p => ({ ...p, [t.id]: e.target.value }))} style={{ width: "40px", height: "34px", border: "none", padding: "2px", cursor: "pointer", borderRadius: "4px" }} />
                              <input type="text" value={design[t.id] || t.default} onChange={e => setDesign(p => ({ ...p, [t.id]: e.target.value }))} style={{ ...S.input, flex: 1, fontFamily: "monospace", fontSize: "0.82rem" } as React.CSSProperties} />
                            </div>
                          )}
                          {t.type === "select" && t.options && (
                            <select value={design[t.id] || t.default} onChange={e => setDesign(p => ({ ...p, [t.id]: e.target.value }))} style={S.input as React.CSSProperties}>
                              {t.options.map((o: string) => <option key={o} value={o}>{o}</option>)}
                            </select>
                          )}
                          {t.type === "range" && (
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                              <input type="range" min={t.min || 0} max={t.max || 32} step={t.step || 1} value={parseInt(design[t.id] || t.default) || 0} onChange={e => setDesign(p => ({ ...p, [t.id]: e.target.value }))} style={{ flex: 1 }} />
                              <span style={{ fontSize: "0.82rem", color: "#555", minWidth: "32px" }}>{design[t.id] || t.default}px</span>
                            </div>
                          )}
                          {t.hint && <p style={{ fontSize: "0.68rem", color: "#bbb", margin: "0.2rem 0 0" }}>{t.hint}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ═══ SECTIONS TAB ════════════════════════════════════════════════ */}
            {tab === "sections" && (
              <div>
                {sectionPreview && (
                  <SectionPreviewModal
                    template={sectionPreview}
                    onClose={() => setSectionPreview(null)}
                    onAdd={() => { addSection(sectionPreview); setSectionPreview(null); }}
                  />
                )}

                <h2 style={S.h2}>Section Builder</h2>
                <p style={{ ...S.hint, marginBottom: "1.5rem" }}>Add new content sections. Click a section to preview it. Toggle visibility or remove anytime.</p>

                {/* Add custom (blank) section */}
                <div style={{ marginBottom: "1.5rem" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.6rem" }}>
                    <h3 style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "#999", margin: 0, fontWeight: 700 }}>Create a Custom Section</h3>
                    <button onClick={() => setShowAddCustomSection(s => !s)} style={{ ...S.btnSecondary, fontSize: "0.72rem", padding: "0.3rem 0.75rem" } as React.CSSProperties}>
                      {showAddCustomSection ? "Cancel" : "+ Custom"}
                    </button>
                  </div>
                  {showAddCustomSection && (
                    <div style={{ ...S.card, border: "2px dashed #b04a2a" }}>
                      <label style={S.fieldLabel as React.CSSProperties}>Section Name</label>
                      <div style={{ display: "flex", gap: "0.6rem", marginTop: "0.3rem" }}>
                        <input type="text" value={customSectionTitle} onChange={e => setCustomSectionTitle(e.target.value)} style={{ ...S.input, flex: 1 } as React.CSSProperties} placeholder="e.g. Catering, Reservations, Press…" />
                        <button onClick={addCustomSection} style={S.btnPrimary as React.CSSProperties}>Add</button>
                      </div>
                      <p style={{ fontSize: "0.72rem", color: "#bbb", marginTop: "0.4rem", marginBottom: 0 }}>You can rename this section anytime after creating it.</p>
                    </div>
                  )}
                </div>

                {/* Predefined section templates */}
                <h3 style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "#999", marginBottom: "0.6rem", fontWeight: 700 }}>Add a Predefined Section</h3>
                <p style={{ fontSize: "0.78rem", color: "#aaa", marginBottom: "0.75rem" }}>Click a card to preview the section, then add it to your website.</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: "0.6rem", marginBottom: "2rem" }}>
                  {SECTION_TEMPLATES.map(tpl => (
                    <button key={tpl.key} onClick={() => setSectionPreview(tpl)}
                      style={{ background: "white", border: "1.5px solid #e0d8d0", borderRadius: "9px", padding: "0.85rem 0.6rem", cursor: "pointer", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", transition: "border-color 0.15s, box-shadow 0.15s" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "#b04a2a"; (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px rgba(176,74,42,0.15)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#e0d8d0"; (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)"; }}>
                      <div style={{ fontSize: "1.5rem", marginBottom: "0.3rem" }}>{tpl.icon}</div>
                      <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#2d1f14" }}>{tpl.title}</div>
                      <div style={{ fontSize: "0.62rem", color: "#aaa", marginTop: "0.2rem" }}>{tpl.description}</div>
                      <div style={{ marginTop: "0.5rem", fontSize: "0.6rem", color: "#b04a2a", fontWeight: 600 }}>Click to preview →</div>
                    </button>
                  ))}
                </div>

                {/* Active sections */}
                <h3 style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "#999", marginBottom: "0.6rem", fontWeight: 700 }}>
                  Active Sections ({activeSections.length})
                  {sectionSaving && <span style={{ marginLeft: "0.5rem", color: "#b04a2a", fontWeight: 400, textTransform: "none" }}>Saving…</span>}
                </h3>

                {activeSections.length === 0
                  ? <div style={{ background: "white", borderRadius: "10px", padding: "2.5rem", textAlign: "center", color: "#bbb" }}>No custom sections added yet. Use the cards above to add one.</div>
                  : activeSections.map(sec => {
                    const tpl = SECTION_TEMPLATES.find(t => t.key === sec.type);
                    const fields = SECTION_FIELDS[sec.type] || [];
                    const isOpen = !!openSec["sec_" + sec.id];
                    return (
                      <div key={sec.id} style={{ ...S.card, padding: 0, overflow: "hidden" }}>
                        {/* Section header */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.85rem 1.25rem", flexWrap: "wrap", gap: "0.6rem" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flex: 1 }}>
                            <span style={{ fontSize: "1.1rem" }}>{tpl?.icon || "📦"}</span>
                            {sectionRenaming === sec.id ? (
                              <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
                                <input type="text" value={sectionRenameVal} onChange={e => setSectionRenameVal(e.target.value)} autoFocus
                                  style={{ ...S.input, width: "180px", padding: "0.3rem 0.6rem", fontSize: "0.85rem" } as React.CSSProperties}
                                  onKeyDown={e => { if (e.key === "Enter") renameSectionSave(sec.id); if (e.key === "Escape") setSectionRenaming(null); }} />
                                <button onClick={() => renameSectionSave(sec.id)} style={{ ...S.btnPrimary, padding: "0.28rem 0.65rem", fontSize: "0.72rem" } as React.CSSProperties}>Save</button>
                                <button onClick={() => setSectionRenaming(null)} style={{ padding: "0.28rem 0.55rem", background: "#f0ebe5", border: "none", borderRadius: "5px", cursor: "pointer", fontSize: "0.72rem", color: "#666" }}>✕</button>
                              </div>
                            ) : (
                              <div>
                                <p style={{ margin: 0, fontWeight: 700, color: "#2d1f14", fontSize: "0.88rem" }}>{sec.title}</p>
                                <p style={{ margin: 0, fontSize: "0.65rem", color: "#aaa" }}>{sec.type === "custom" ? "Custom section" : sec.type}</p>
                              </div>
                            )}
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                            <button onClick={() => { setSectionRenaming(sec.id); setSectionRenameVal(sec.title); }} style={{ padding: "0.22rem 0.55rem", background: "#f5f0eb", border: "1px solid #e0d8d0", borderRadius: "5px", cursor: "pointer", fontSize: "0.68rem", color: "#666" }}>✏️ Rename</button>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                              <span style={{ fontSize: "0.68rem", color: "#888" }}>Live</span>
                              <div onClick={() => toggleSectionVisible(sec.id)} style={{ width: "36px", height: "18px", borderRadius: "9px", cursor: "pointer", background: sec.visible ? "#27ae60" : "#e0d8d0", position: "relative" }}>
                                <div style={{ position: "absolute", top: "2px", left: sec.visible ? "18px" : "2px", width: "14px", height: "14px", borderRadius: "50%", background: "white", boxShadow: "0 1px 3px rgba(0,0,0,0.2)", transition: "left 0.15s" }} />
                              </div>
                            </div>
                            {fields.length > 0 && (
                              <button onClick={() => setOpenSec(p => ({ ...p, ["sec_" + sec.id]: !p["sec_" + sec.id] }))} style={{ padding: "0.22rem 0.55rem", background: isOpen ? "#2d1f14" : "#f0ebe5", border: "1px solid #e0d8d0", borderRadius: "5px", cursor: "pointer", fontSize: "0.68rem", color: isOpen ? "white" : "#666" }}>
                                {isOpen ? "▲ Close" : "▼ Edit Content"}
                              </button>
                            )}
                            <button onClick={() => deleteSection(sec.id)} style={{ padding: "0.22rem 0.55rem", background: "#fee8e8", color: "#dc2626", border: "1px solid #fca5a5", borderRadius: "5px", cursor: "pointer", fontSize: "0.68rem", fontWeight: 600 }}>Remove</button>
                          </div>
                        </div>

                        {/* Editable content fields */}
                        {isOpen && fields.length > 0 && (
                          <div style={{ borderTop: "1px solid #f0ebe5", padding: "1.25rem 1.25rem 1rem" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "0.85rem", marginBottom: "1rem" }}>
                              {fields.map((field, fi) => {
                                const fieldKey = "f" + fi;
                                const val = sectionContent[sec.id]?.[fieldKey] || "";
                                return (
                                  <div key={fi}>
                                    <label style={S.fieldLabel as React.CSSProperties}>{field.label}</label>
                                    {field.hint && <p style={{ fontSize: "0.65rem", color: "#ccc", margin: "0 0 0.25rem", fontStyle: "italic" }}>{field.hint}</p>}
                                    {field.type === "image" ? (
                                      <ImageUploader
                                        path={"sec-" + sec.id + "-f" + fi}
                                        currentUrl={val}
                                        onUploaded={url => setSectionContent(prev => ({ ...prev, [sec.id]: { ...prev[sec.id], [fieldKey]: url } }))}
                                      />
                                    ) : field.type === "select" ? (
                                      <select value={val} onChange={e => setSectionContent(prev => ({ ...prev, [sec.id]: { ...prev[sec.id], [fieldKey]: e.target.value } }))} style={S.input as React.CSSProperties}>
                                        {(field.hint || "").split("|").map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                      </select>
                                    ) : field.type === "textarea" ? (
                                      <textarea value={val} rows={3} placeholder={field.placeholder}
                                        onChange={e => setSectionContent(prev => ({ ...prev, [sec.id]: { ...prev[sec.id], [fieldKey]: e.target.value } }))}
                                        style={{ ...S.input, resize: "vertical" } as React.CSSProperties} />
                                    ) : (
                                      <input type="text" value={val} placeholder={field.placeholder}
                                        onChange={e => setSectionContent(prev => ({ ...prev, [sec.id]: { ...prev[sec.id], [fieldKey]: e.target.value } }))}
                                        style={S.input as React.CSSProperties} />
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                            <div style={{ display: "flex", justifyContent: "flex-end" }}>
                              <button onClick={() => saveSectionContent(sec.id)} disabled={sectionContentSaving === sec.id} style={{ ...S.btnPrimary, fontSize: "0.78rem", padding: "0.4rem 1rem", background: savedField === "sec_" + sec.id ? "#27ae60" : "#b04a2a" } as React.CSSProperties}>
                                {sectionContentSaving === sec.id ? "Saving…" : savedField === "sec_" + sec.id ? "✓ Saved" : "Save Content"}
                              </button>
                            </div>
                          </div>
                        )}
                        {isOpen && fields.length === 0 && (
                          <div style={{ borderTop: "1px solid #f0ebe5", padding: "1rem 1.25rem", color: "#bbb", fontSize: "0.82rem" }}>
                            This is a custom section. Content editing for custom sections will be available once you configure the section structure.
                          </div>
                        )}
                      </div>
                    );
                  })
                }

                <div style={{ marginTop: "1.25rem", padding: "0.85rem", background: "#fffbf0", borderRadius: "7px", border: "1px solid #fde68a" }}>
                  <p style={{ margin: 0, fontSize: "0.78rem", color: "#92400e" }}>💡 <strong>Tip:</strong> Sections you add here are stored in the database and will display on the website. Use the toggle to show or hide them.</p>
                </div>
              </div>
            )}

            {/* ═══ SETTINGS TAB ════════════════════════════════════════════════ */}
            {tab === "settings" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
                  <div>
                    <h2 style={S.h2}>Site Settings</h2>
                    <p style={S.hint}>Manage site info, social links, contact details and SEO.</p>
                  </div>
                  <button onClick={saveSettings} disabled={settingsSaving} style={{ ...S.btnPrimary, opacity: settingsSaving ? 0.7 : 1 } as React.CSSProperties}>
                    {settingsSaving ? "Saving…" : settingsSaved ? "✓ Saved!" : "Save Settings"}
                  </button>
                </div>
                {[
                  { group: "Site Identity", fields: [
                    { key: "site_name", label: "Site Name", hint: "Appears in browser tab and SEO" },
                    { key: "tagline", label: "Tagline", hint: "Short descriptor" },
                    { key: "meta_description", label: "Meta Description", hint: "SEO description (150–160 chars)", multi: true },
                  ]},
                  { group: "Contact Details", fields: [
                    { key: "email", label: "Contact Email", hint: "" },
                    { key: "phone_peckham", label: "Peckham Phone", hint: "" },
                    { key: "phone_thornton", label: "Thornton Heath Phone", hint: "" },
                  ]},
                  { group: "Social Media", fields: [
                    { key: "instagram", label: "Instagram URL", hint: "Full URL e.g. https://instagram.com/agrobeso" },
                    { key: "facebook", label: "Facebook URL", hint: "" },
                    { key: "tiktok", label: "TikTok URL", hint: "" },
                    { key: "twitter", label: "Twitter / X URL", hint: "" },
                    { key: "whatsapp", label: "WhatsApp Number", hint: "Include country code e.g. +447911123456" },
                  ]},
                ].map(grp => (
                  <div key={grp.group} style={{ ...S.card, marginBottom: "1rem" }}>
                    <h3 style={{ margin: "0 0 0.85rem", color: "#2d1f14", fontSize: "0.88rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>{grp.group}</h3>
                    {grp.fields.map((f: any) => (
                      <div key={f.key} style={{ marginBottom: "0.75rem" }}>
                        <label style={S.fieldLabel as React.CSSProperties}>{f.label}</label>
                        {f.hint && <p style={{ margin: "0 0 0.25rem", fontSize: "0.7rem", color: "#ccc", fontStyle: "italic" }}>{f.hint}</p>}
                        {f.multi
                          ? <textarea value={settings[f.key] || ""} rows={2} onChange={e => setSettings(p => ({ ...p, [f.key]: e.target.value }))} style={{ ...S.input, resize: "vertical", width: "100%" } as React.CSSProperties} />
                          : <input type="text" value={settings[f.key] || ""} onChange={e => setSettings(p => ({ ...p, [f.key]: e.target.value }))} style={{ ...S.input, width: "100%" } as React.CSSProperties} />
                        }
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {/* ═══ HELP TAB ════════════════════════════════════════════════════ */}
            {tab === "help" && (
              <div>
                <h2 style={S.h2}>Help & Developer Tips</h2>
                <p style={{ ...S.hint, marginBottom: "1.5rem" }}>Your reference guide for managing and growing the Agrobeso website.</p>
                {[
                  { icon: "📐", title: "Recommended Image Sizes", items: ["Hero / Banner: 1600 × 1000px minimum, landscape (16:10)","Gallery tiles: 800 × 600px (4:3 ratio works best)","Dish photos: 600 × 450px or square 600 × 600px","About / Heritage: 1200 × 800px, warm tones recommended","File format: JPG for photos, PNG for logos. Keep under 2MB."] },
                  { icon: "🎨", title: "Brand Colours", items: ["Primary / Clay: #b04a2a — buttons, accents, highlights","Dark / Cocoa: #2d1f14 — headings, nav, footer background","Warm / Ochre: #c88a3a — gold accent used sparingly","Background / Bone: #f5f0eb — main page background","Soft shell: #ede8e0 — section alternating background"] },
                  { icon: "✏️", title: "Content Tips", items: ["Keep dish stories under 25 words — punchy and evocative","Hero headline should be 3–6 words maximum","Manifesto text works best at 20–40 words","Location hours format: Mon–Fri 11am–9pm, Sat–Sun 10am–10pm","Instagram URL: use full link e.g. https://instagram.com/agrobeso"] },
                  { icon: "⚡", title: "How Changes Work", items: ["Content saves to Supabase database instantly on click","The website reads from Supabase on every page load","Design token changes apply via CSS variables injected at load","Images stored in Supabase Storage bucket called images","Vercel auto-deploys any code changes within ~60 seconds"] },
                  { icon: "🍽️", title: "Managing Dishes", items: ["Click '+ Add New Dish' on the Dishes tab to add a new dish","New dishes are added responsively — they appear in a card grid","Each dish has: name, story/description, tagline, price, and photo","Custom dishes can be removed; default dishes can only be edited","Dish images upload directly to Supabase Storage"] },
                  { icon: "➕", title: "Managing Sections", items: ["Click any section card to preview it before adding","Use 'Edit Content' to fill in text, images, and details for each section","Toggle 'Live' to show or hide a section on the website","Rename any section using the ✏️ Rename button","Create a Custom Section to build a new section with your own name"] },
                  { icon: "🔧", title: "Technical Reference", items: ["Stack: React + TypeScript + Vite + Tailwind CSS + Supabase","Deployed on Vercel (auto-deploys on GitHub push to main)","Supabase project: lsgxrluiwsxuhsjcvdue.supabase.co","Storage bucket: images (public read access)","DB table: site_content (id TEXT, value TEXT, updated_at TIMESTAMPTZ)","Admin path: /admin — password protected, client-side"] },
                ].map(section => (
                  <div key={section.title} style={{ ...S.card, marginBottom: "0.85rem" }}>
                    <h3 style={{ margin: "0 0 0.6rem", display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.9rem", fontWeight: 700, color: "#2d1f14" }}>
                      <span>{section.icon}</span>{section.title}
                    </h3>
                    <ul style={{ margin: 0, paddingLeft: "1.2rem" }}>
                      {section.items.map((item, i) => (
                        <li key={i} style={{ fontSize: "0.82rem", color: "#555", marginBottom: "0.3rem", lineHeight: 1.5 }}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </main>

          {/* ── Live Preview Panel (Content tab) ── */}
          {tab === "content" && (
            <LivePreviewPanel
              content={content}
              isOpen={previewPanelOpen}
              onToggle={() => setPreviewPanelOpen(o => !o)}
              activeAnchor={SECTION_ANCHORS[activeSection]}
            />
          )}
        </div>
      </div>
    </div>
  );
}
