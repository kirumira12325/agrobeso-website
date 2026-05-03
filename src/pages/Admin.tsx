import { useState, useEffect } from "react";
import { agrobesoSupabase as supabase, AGROBESO_STORAGE_URL } from "../integrations/supabase/agrobeso-client";

const ADMIN_PASSWORD = "agrobeso2024";

// ─── Types ────────────────────────────────────────────────────────────────────
type UploadedImage = { name: string; url: string; category: string };
type ContentItem = { id: string; value: string };
type DesignToken = { id: string; label: string; type: string; default: string; options?: string[]; hint?: string; min?: number; max?: number; step?: number };
type DesignGroup = { group: string; tokens: DesignToken[] };
type SectionTemplate = { key: string; title: string; icon: string; description: string };
type CustomSection = { id: string; type: string; title: string; visible: boolean; items: any[] };
type Dish = { key: string; name: string; story: string; note: string };

// ─── Dish data ────────────────────────────────────────────────────────────────
const DISHES: Dish[] = [
  { key: "jollof_rice", name: "Jollof Rice", story: "Long-grain rice slow-simmered in tomato and scotch bonnet.", note: "A dish of celebration" },
  { key: "waakye", name: "Waakye", story: "Rice and beans with sorghum leaves. Served with shito and fried plantain.", note: "A Saturday morning ritual" },
  { key: "kenkey_fish", name: "Kenkey & Fish", story: "Fermented corn dough, grilled tilapia, fresh pepper and shito.", note: "Coastal, warm, complete" },
  { key: "banku_okra", name: "Banku & Okra Stew", story: "Smooth, sour banku alongside an okra stew with smoked fish.", note: "Eaten with the right hand" },
  { key: "peanut_soup", name: "Peanut Soup", story: "Groundnut paste, tomato, ginger and slow-cooked goat.", note: "Nkate nkwan" },
  { key: "fufu", name: "Fufu / Pounded Yam", story: "Cassava and plantain pounded to a soft, elastic round.", note: "Pounded fresh" },
  { key: "fried_fish", name: "Fried Fish / Tilapia", story: "Whole tilapia scored, marinated and fried until the skin sings.", note: "Crisp, smoky, bright" },
  { key: "tuo_zaafi", name: "Tuo Zaafi", story: "A northern staple of soft millet meal with leafy green sauce.", note: "From the north" },
];

// ─── Content fields ────────────────────────────────────────────────────────────
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

// ─── Design tokens ─────────────────────────────────────────────────────────────
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

// ─── Section templates ──────────────────────────────────────────────────────────
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

// ─── Shared styles ──────────────────────────────────────────────────────────────
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

// ─── ImageUploader component ────────────────────────────────────────────────────
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
    setMsg("Uploaded!");
    setTimeout(() => setMsg(""), 2500);
    onUploaded(url);
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

// ─── SaveBtn component ──────────────────────────────────────────────────────────
function SaveBtn({ onClick, saving, saved }: { onClick: () => void; saving: boolean; saved: boolean }) {
  return (
    <button onClick={onClick} disabled={saving} style={{ ...S.btnSecondary, fontSize: "0.72rem", padding: "0.3rem 0.85rem", background: saved ? "#27ae60" : "#2d1f14" } as React.CSSProperties}>
      {saving ? "Saving…" : saved ? "✓ Saved" : "Save"}
    </button>
  );
}

// ─── Field component ────────────────────────────────────────────────────────────
function Field({ label, hint, multiline, value, onChange, onSave, saving, saved }: {
  label: string; hint: string; multiline: boolean; value: string;
  onChange: (v: string) => void; onSave: () => void; saving: boolean; saved: boolean;
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

// ─── Main Admin component ───────────────────────────────────────────────────────
export default function Admin() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
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
    instagram: "#", facebook: "#", tiktok: "#", twitter: "#",
    whatsapp: "", email: "", phone_peckham: "", phone_thornton: "",
  });
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [previewDevice, setPreviewDevice] = useState("desktop");
  const [previewKey, setPreviewKey] = useState(0);
  const [sectionOrder, setSectionOrder] = useState(["hero","manifesto","menu","heritage","locations","gallery","ordering","contact"]);
  const [dragIdx, setDragIdx] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);

  const loadContent = async () => {
    setLoadingContent(true);
    const { data } = await supabase.from("site_content").select("id,value");
    if (data) {
      const map: Record<string,string> = {};
      const des: Record<string,string> = {};
      const set: Record<string,string> = {};
      const dishImg: Record<string,string> = {};
      data.forEach((r: ContentItem) => {
        if (r.id.startsWith("design__")) des[r.id.replace("design__","")] = r.value;
        else if (r.id.startsWith("settings__")) set[r.id.replace("settings__","")] = r.value;
        else if (r.id.startsWith("dish_img__")) dishImg[r.id.replace("dish_img__","")] = r.value;
        else map[r.id] = r.value;
      });
      setContent(map);
      const defaultDes: Record<string,string> = {};
      DESIGN_GROUPS.forEach(g => g.tokens.forEach(t => { defaultDes[t.id] = t.default; }));
      setDesign({ ...defaultDes, ...des });
      setDishImages(dishImg);
      if (Object.keys(set).length > 0) setSettings(prev => ({ ...prev, ...set }));
    }
    setLoadingContent(false);
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
    if (pw === ADMIN_PASSWORD) setAuthed(true);
    else alert("Incorrect password");
  };

  const saveField = async (fieldId: string) => {
    setSaving(fieldId);
    const { error } = await supabase.from("site_content").upsert(
      { id: fieldId, value: content[fieldId] || "", updated_at: new Date().toISOString() }, { onConflict: "id" }
    );
    setSaving(null);
    if (!error) { setSavedField(fieldId); setTimeout(() => setSavedField(null), 2500); }
    else alert("Save failed: " + error.message);
  };

  const saveAll = async () => {
    setGlobalSave("saving");
    const upserts = CONTENT_FIELDS.flatMap(s => s.fields)
      .filter(f => content[f.id] !== undefined)
      .map(f => ({ id: f.id, value: content[f.id] || "", updated_at: new Date().toISOString() }));
    if (!upserts.length) { setGlobalSave("idle"); return; }
    const { error } = await supabase.from("site_content").upsert(upserts, { onConflict: "id" });
    setGlobalSave(error ? "error" : "saved");
    setTimeout(() => setGlobalSave("idle"), 3000);
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
    if (!error) await loadImages();
    else alert("Delete failed: " + error.message);
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

  const filteredImages = filterCat === "all" ? images : images.filter(i => i.category === filterCat);
  const imageCats = ["all", ...Array.from(new Set(images.map(i => i.category)))];

  const SECTION_LABELS = {
    hero:      { icon:"🏠", label:"Hero",           anchor:"#top" },
    manifesto: { icon:"✍️", label:"Manifesto",       anchor:"#top" },
    menu:      { icon:"🍽️", label:"Menu",            anchor:"#menu" },
    heritage:  { icon:"🌍", label:"Heritage",        anchor:"#about" },
    locations: { icon:"📍", label:"Locations",       anchor:"#locations" },
    gallery:   { icon:"🖼️", label:"Gallery",         anchor:"#gallery" },
    ordering:  { icon:"🪑", label:"Reserve / Order", anchor:"#ordering" },
    contact:   { icon:"📬", label:"Contact",         anchor:"#contact" },
  };

  const handleDragStart = (idx) => setDragIdx(idx);
  const handleDragOver = (e, idx) => { e.preventDefault(); setDragOverIdx(idx); };
  const handleDrop = (idx) => {
    if (dragIdx === null || dragIdx === idx) { setDragIdx(null); setDragOverIdx(null); return; }
    const updated = [...sectionOrder];
    const [moved] = updated.splice(dragIdx, 1);
    updated.splice(idx, 0, moved);
    setSectionOrder(updated); setDragIdx(null); setDragOverIdx(null);
    supabase.from("site_content").upsert({ id:"layout__section_order", value:JSON.stringify(updated), updated_at:new Date().toISOString() },{ onConflict:"id" });
  };
  const handleDragEnd = () => { setDragIdx(null); setDragOverIdx(null); };
  const previewWidth = previewDevice === "desktop" ? "100%" : previewDevice === "tablet" ? "768px" : "375px";

  // ─── Login ───────────────────────────────────────────────────────────────────
  if (!authed) return (
    <div style={{ minHeight: "100vh", background: "#f5f0eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "white", padding: "2.5rem", borderRadius: "14px", boxShadow: "0 4px 32px rgba(0,0,0,0.1)", width: "360px", maxWidth: "90vw" }}>
        <p style={{ fontFamily: "monospace", fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#b04a2a", marginBottom: "0.5rem" }}>Agrobeso</p>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 400, margin: "0 0 0.25rem", color: "#2d1f14" }}>Admin Dashboard</h1>
        <p style={{ color: "#aaa", marginBottom: "1.75rem", fontSize: "0.9rem" }}>Enter your password to continue.</p>
        <form onSubmit={handleLogin}>
          <input type="password" placeholder="Admin password" value={pw} onChange={e => setPw(e.target.value)}
            style={{ ...S.input, marginBottom: "1rem" } as React.CSSProperties} autoFocus />
          <button type="submit" style={{ ...S.btnPrimary, width: "100%" } as React.CSSProperties}>Sign in</button>
        </form>
      </div>
    </div>
  );

  // ─── Tabs ────────────────────────────────────────────────────────────────────
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

  return (
    <div style={{ minHeight: "100vh", background: "#f5f0eb", display: "flex", flexDirection: "column" }}>
      {/* Top bar */}
      <div style={{ background: "#2d1f14", color: "white", padding: "0.75rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 200 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span style={{ fontFamily: "Georgia,serif", fontSize: "1.1rem" }}>Agrobeso</span>
          <span style={{ fontSize: "0.7rem", opacity: 0.4, textTransform: "uppercase", letterSpacing: "0.1em" }}>Admin</span>
        </div>
        <a href="/" target="_blank" rel="noreferrer" style={{ color: "#f0c070", textDecoration: "none", fontSize: "0.82rem" }}>View website ↗</a>
      </div>

      <div style={{ display: "flex", flex: 1 }}>
        {/* Sidebar */}
        <nav style={{ width: "195px", flexShrink: 0, background: "#2d1f14", minHeight: "calc(100vh - 45px)", position: "sticky", top: "45px", height: "calc(100vh - 45px)", overflowY: "auto" }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              width: "100%", display: "flex", alignItems: "center", gap: "0.6rem",
              padding: "0.8rem 1rem", border: "none",
              background: tab === t.id ? "rgba(176,74,42,0.25)" : "transparent",
              color: tab === t.id ? "#f0c070" : "rgba(255,255,255,0.6)",
              cursor: "pointer", fontSize: "0.82rem", textAlign: "left",
              borderLeft: tab === t.id ? "3px solid #b04a2a" : "3px solid transparent",
            }}>
              <span style={{ fontSize: "1rem" }}>{t.icon}</span>
              <span style={{ fontWeight: tab === t.id ? 700 : 400 }}>{t.label}</span>
            </button>
          ))}
          <div style={{ padding: "1.5rem 1rem 1rem", marginTop: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.67rem", lineHeight: 1.5 }}>Changes save to Supabase instantly. Site refreshes within ~30s.</p>
          </div>
        </nav>

        {/* Main area */}
        <main style={{ flex: 1, padding: "1.75rem", maxWidth: "920px", overflowX: "hidden" }}>

          {/* ═══ CONTENT TAB ═════════════════════════════════════════════════ */}
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
              {loadingContent
                ? <div style={{ textAlign: "center", padding: "4rem", color: "#999" }}>Loading content…</div>
                : CONTENT_FIELDS.map(sec => {
                    const isOpen = !!openSec[sec.section];
                    return (
                      <div key={sec.section} style={S.card}>
                        <button onClick={() => setOpenSec(p => ({ ...p, [sec.section]: !p[sec.section] }))} style={S.accordionBtn as React.CSSProperties}>
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
              {loadingImgs
                ? <div style={{ textAlign: "center", padding: "3rem", color: "#999" }}>Loading…</div>
                : filteredImages.length === 0
                  ? <div style={{ textAlign: "center", padding: "3rem", color: "#bbb", background: "white", borderRadius: "10px" }}>No images {filterCat !== "all" ? 'in "' + filterCat + '"' : "uploaded yet"}.</div>
                  : <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(170px,1fr))", gap: "0.75rem" }}>
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
              <h2 style={S.h2}>Manage Dishes</h2>
              <p style={{ ...S.hint, marginBottom: "1.5rem" }}>Edit dish stories, notes, prices and photos. All changes save to the live website.</p>
              {loadingContent
                ? <div style={{ textAlign: "center", padding: "4rem", color: "#999" }}>Loading…</div>
                : DISHES.map((dish, i) => (
                    <div key={dish.key} style={{ ...S.card, marginBottom: "1rem" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "1.1rem", flexWrap: "wrap" }}>
                        <div style={{ flexShrink: 0 }}>
                          {dishImages[dish.key]
                            ? <img src={dishImages[dish.key]} alt={dish.name} style={{ width: "112px", height: "84px", objectFit: "cover", borderRadius: "7px", display: "block" }} />
                            : <div style={{ width: "112px", height: "84px", background: "#f0ebe5", borderRadius: "7px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem" }}>🍽️</div>
                          }
                          <label style={{ display: "block", marginTop: "0.4rem", fontSize: "0.68rem", color: "#aaa", textAlign: "center", cursor: "pointer" }}>
                            {dishUploading[dish.key] ? "Uploading…" : "Change photo"}
                            <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0]; if (f) handleDishImgUpload(dish, f); }} />
                          </label>
                          {dishMsg[dish.key] && <p style={{ fontSize: "0.65rem", color: dishMsg[dish.key].includes("fail") ? "#c00" : "#1a7a3a", textAlign: "center", margin: "0.2rem 0 0" }}>{dishMsg[dish.key]}</p>}
                        </div>
                        <div style={{ flex: 1, minWidth: "200px" }}>
                          <p style={{ fontFamily: "Georgia,serif", fontSize: "1.05rem", color: "#2d1f14", margin: "0 0 0.6rem" }}>{String(i+1).padStart(2,"0")}. {dish.name}</p>
                          <div style={{ marginBottom: "0.6rem" }}>
                            <label style={S.fieldLabel as React.CSSProperties}>Story</label>
                            <textarea value={content["dish_" + dish.key + "_story"] || ""} rows={2}
                              onChange={e => setContent(p => ({ ...p, ["dish_" + dish.key + "_story"]: e.target.value }))}
                              style={{ ...S.input, resize: "vertical", width: "100%" } as React.CSSProperties} placeholder="Short description…" />
                          </div>
                          <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
                            <div style={{ flex: 1, minWidth: "130px" }}>
                              <label style={S.fieldLabel as React.CSSProperties}>Note</label>
                              <input type="text" value={content["dish_" + dish.key + "_note"] || ""}
                                onChange={e => setContent(p => ({ ...p, ["dish_" + dish.key + "_note"]: e.target.value }))}
                                style={{ ...S.input, width: "100%" } as React.CSSProperties} />
                            </div>
                            <div style={{ flex: 1, minWidth: "100px" }}>
                              <label style={S.fieldLabel as React.CSSProperties}>Price</label>
                              <input type="text" value={content["dish_" + dish.key + "_price"] || ""}
                                onChange={e => setContent(p => ({ ...p, ["dish_" + dish.key + "_price"]: e.target.value }))}
                                style={{ ...S.input, width: "100%" } as React.CSSProperties} placeholder="£0.00" />
                            </div>
                          </div>
                          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.6rem" }}>
                            <button onClick={async () => {
                              setSaving("dish_" + dish.key);
                              const upserts = ["story","note","price"].map(k => ({ id: "dish_" + dish.key + "_" + k, value: content["dish_" + dish.key + "_" + k] || "", updated_at: new Date().toISOString() }));
                              await supabase.from("site_content").upsert(upserts, { onConflict: "id" });
                              setSaving(null); setSavedField("dish_" + dish.key); setTimeout(() => setSavedField(null), 2500);
                            }} disabled={saving !== null} style={{ ...S.btnPrimary, fontSize: "0.75rem", padding: "0.35rem 0.9rem" } as React.CSSProperties}>
                              {saving === "dish_" + dish.key ? "Saving…" : savedField === "dish_" + dish.key ? "✓ Saved" : "Save"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
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
                            <input type="color" value={design[t.id] || t.default}
                              onChange={e => setDesign(p => ({ ...p, [t.id]: e.target.value }))}
                              style={{ width: "40px", height: "34px", border: "none", padding: "2px", cursor: "pointer", borderRadius: "4px" }} />
                            <input type="text" value={design[t.id] || t.default}
                              onChange={e => setDesign(p => ({ ...p, [t.id]: e.target.value }))}
                              style={{ ...S.input, flex: 1, fontFamily: "monospace", fontSize: "0.82rem" } as React.CSSProperties} />
                          </div>
                        )}
                        {t.type === "select" && t.options && (
                          <select value={design[t.id] || t.default} onChange={e => setDesign(p => ({ ...p, [t.id]: e.target.value }))} style={S.input as React.CSSProperties}>
                            {t.options.map((o: string) => <option key={o} value={o}>{o}</option>)}
                          </select>
                        )}
                        {t.type === "range" && (
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <input type="range" min={t.min || 0} max={t.max || 32} step={t.step || 1}
                              value={parseInt(design[t.id] || t.default) || 0}
                              onChange={e => setDesign(p => ({ ...p, [t.id]: e.target.value }))}
                              style={{ flex: 1 }} />
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
              <h2 style={S.h2}>Section Builder</h2>
              <p style={{ ...S.hint, marginBottom: "1.5rem" }}>Add new content sections to your website. Toggle visibility or remove anytime.</p>
              <h3 style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "#999", marginBottom: "0.6rem", fontWeight: 700 }}>Add a New Section</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: "0.6rem", marginBottom: "2rem" }}>
                {SECTION_TEMPLATES.map(tpl => (
                  <button key={tpl.key} onClick={() => addSection(tpl)} style={{
                    background: "white", border: "1.5px solid #e0d8d0", borderRadius: "9px",
                    padding: "0.85rem 0.6rem", cursor: "pointer", textAlign: "center",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                  }}>
                    <div style={{ fontSize: "1.5rem", marginBottom: "0.3rem" }}>{tpl.icon}</div>
                    <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#2d1f14" }}>{tpl.title}</div>
                    <div style={{ fontSize: "0.65rem", color: "#aaa", marginTop: "0.2rem" }}>{tpl.description}</div>
                  </button>
                ))}
              </div>
              <h3 style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "#999", marginBottom: "0.6rem", fontWeight: 700 }}>
                Active Sections ({activeSections.length})
                {sectionSaving && <span style={{ marginLeft: "0.5rem", color: "#b04a2a", fontWeight: 400 }}>Saving…</span>}
              </h3>
              {activeSections.length === 0
                ? <div style={{ background: "white", borderRadius: "10px", padding: "2.5rem", textAlign: "center", color: "#bbb" }}>No custom sections added yet.</div>
                : activeSections.map(sec => (
                    <div key={sec.id} style={{ ...S.card, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.6rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                        <span style={{ fontSize: "1.1rem" }}>{SECTION_TEMPLATES.find(t => t.key === sec.type)?.icon || "📦"}</span>
                        <div>
                          <p style={{ margin: 0, fontWeight: 700, color: "#2d1f14", fontSize: "0.88rem" }}>{sec.title}</p>
                          <p style={{ margin: 0, fontSize: "0.68rem", color: "#aaa" }}>{sec.type}</p>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                          <span style={{ fontSize: "0.72rem", color: "#888" }}>Visible</span>
                          <div onClick={() => toggleSectionVisible(sec.id)} style={{ width: "36px", height: "18px", borderRadius: "9px", cursor: "pointer", background: sec.visible ? "#27ae60" : "#e0d8d0", position: "relative" }}>
                            <div style={{ position: "absolute", top: "2px", left: sec.visible ? "18px" : "2px", width: "14px", height: "14px", borderRadius: "50%", background: "white", boxShadow: "0 1px 3px rgba(0,0,0,0.2)", transition: "left 0.15s" }} />
                          </div>
                        </div>
                        <button onClick={() => deleteSection(sec.id)} style={{ padding: "0.25rem 0.6rem", background: "#fee8e8", color: "#dc2626", border: "1px solid #fca5a5", borderRadius: "5px", cursor: "pointer", fontSize: "0.7rem", fontWeight: 600 }}>Remove</button>
                      </div>
                    </div>
                  ))
              }
              <div style={{ marginTop: "1.25rem", padding: "0.85rem", background: "#fffbf0", borderRadius: "7px", border: "1px solid #fde68a" }}>
                <p style={{ margin: 0, fontSize: "0.78rem", color: "#92400e" }}>💡 <strong>Note:</strong> Added sections are stored in the database and will display on the website once they are fully configured.</p>
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
                  {grp.fields.map(f => (
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
                { icon: "📐", title: "Recommended Image Sizes", items: [
                  "Hero / Banner: 1600 × 1000px minimum, landscape (16:10)",
                  "Gallery tiles: 800 × 600px (4:3 ratio works best)",
                  "Dish photos: 600 × 450px or square 600 × 600px",
                  "About / Heritage: 1200 × 800px, warm tones recommended",
                  "File format: JPG for photos, PNG for logos. Keep under 2MB.",
                ]},
                { icon: "🎨", title: "Brand Colours", items: [
                  "Primary / Clay: #b04a2a — buttons, accents, highlights",
                  "Dark / Cocoa: #2d1f14 — headings, nav, footer background",
                  "Warm / Ochre: #c88a3a — gold accent used sparingly",
                  "Background / Bone: #f5f0eb — main page background",
                  "Soft shell: #ede8e0 — section alternating background",
                ]},
                { icon: "✏️", title: "Content Tips", items: [
                  "Keep dish stories under 25 words — punchy and evocative",
                  "Hero headline should be 3–6 words maximum",
                  "Manifesto text works best at 20–40 words",
                  "Location hours format: Mon–Fri 11am–9pm, Sat–Sun 10am–10pm",
                  "Instagram URL: use full link e.g. https://instagram.com/agrobeso",
                ]},
                { icon: "⚡", title: "How Changes Work", items: [
                  "Content saves to Supabase database instantly on click",
                  "The website reads from Supabase on every page load",
                  "Design token changes apply via CSS variables injected at load",
                  "Images stored in Supabase Storage bucket called images",
                  "Vercel auto-deploys any code changes within ~60 seconds",
                ]},
                { icon: "🚀", title: "Suggested Next Features", items: [
                  "Online ordering / Deliveroo / Uber Eats integration links",
                  "Events calendar with date pickers",
                  "Customer reviews / testimonials with star ratings",
                  "Email newsletter signup with Mailchimp or Resend",
                  "Gallery lightbox viewer for food photography",
                  "PDF menu generator from dish data",
                  "Google Analytics or PostHog for visitor tracking",
                  "Multi-language support (English / Twi)",
                ]},
                { icon: "🔧", title: "Technical Reference", items: [
                  "Stack: React + TypeScript + Vite + Tailwind CSS + Supabase",
                  "Deployed on Vercel (auto-deploys on GitHub push to main)",
                  "Supabase project: lsgxrluiwsxuhsjcvdue.supabase.co",
                  "Storage bucket: images (public read access)",
                  "DB table: site_content (id TEXT, value TEXT, updated_at TIMESTAMPTZ)",
                  "Admin path: /admin — password protected, client-side",
                ]},
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

          {/* ═══ PREVIEW TAB ════════════════════════════════════════════════ */}
          {tab === "preview" && (
            <div style={{ display:"flex", flexDirection:"column", height:"calc(100vh - 45px)", marginTop:"-1.75rem", marginLeft:"-1.75rem", marginRight:"-1.75rem" }}>
              {/* Toolbar */}
              <div style={{ display:"flex", alignItems:"center", gap:"0.6rem", padding:"0.65rem 1.1rem", background:"white", borderBottom:"1px solid #e0d8d0", flexShrink:0, flexWrap:"wrap" }}>
                <span style={{ fontWeight:700, color:"#2d1f14", fontSize:"0.82rem" }}>Live Preview</span>
                <div style={{ display:"flex", gap:"0.15rem", background:"#f0ebe5", borderRadius:"6px", padding:"2px" }}>
                  {[["desktop","Desktop"],["tablet","Tablet"],["mobile","Mobile"]].map(([d,lbl]) => (
                    <button key={d} onClick={() => setPreviewDevice(d)} style={{
                      padding:"0.28rem 0.65rem", border:"none", borderRadius:"4px", cursor:"pointer",
                      fontSize:"0.72rem", fontWeight:previewDevice===d?700:400,
                      background:previewDevice===d?"white":"transparent",
                      color:previewDevice===d?"#b04a2a":"#777",
                      boxShadow:previewDevice===d?"0 1px 3px rgba(0,0,0,0.1)":"none"
                    }}>{lbl}</button>
                  ))}
                </div>
                <button onClick={() => setPreviewKey(k => k+1)} style={S.btnSecondary as React.CSSProperties}>↻ Refresh</button>
                <a href="/" target="_blank" rel="noreferrer" style={{ padding:"0.45rem 0.85rem", background:"#27ae60", color:"white", textDecoration:"none", borderRadius:"6px", fontSize:"0.82rem", fontWeight:700 }}>↗ Open live site</a>
                <span style={{ marginLeft:"auto", fontSize:"0.68rem", color:"#bbb" }}>Save changes in other tabs, then click Refresh to see them here</span>
              </div>

              <div style={{ display:"flex", flex:1, overflow:"hidden", background:"#ddd8d0" }}>
                {/* Layout Shuffler panel */}
                <div style={{ width:"220px", flexShrink:0, background:"white", borderRight:"1px solid #e0d8d0", overflowY:"auto", display:"flex", flexDirection:"column" }}>
                  <div style={{ padding:"0.75rem 0.9rem 0.45rem", borderBottom:"1px solid #f0ebe5" }}>
                    <p style={{ margin:0, fontWeight:700, fontSize:"0.78rem", color:"#2d1f14" }}>Layout Shuffler</p>
                    <p style={{ margin:"0.2rem 0 0", fontSize:"0.65rem", color:"#bbb" }}>Drag to reorder sections</p>
                  </div>
                  <div style={{ padding:"0.45rem 0.5rem" }}>
                    {sectionOrder.map((secId, idx) => {
                      const info = SECTION_LABELS[secId] || { icon:"", label:secId, anchor:"#top" };
                      const isDragging = dragIdx === idx;
                      const isOver = dragOverIdx === idx;
                      return (
                        <div key={secId} draggable
                          onDragStart={() => handleDragStart(idx)}
                          onDragOver={(e) => handleDragOver(e, idx)}
                          onDrop={() => handleDrop(idx)}
                          onDragEnd={handleDragEnd}
                          style={{
                            display:"flex", alignItems:"center", gap:"0.45rem",
                            padding:"0.5rem 0.55rem", marginBottom:"0.25rem",
                            background:isOver?"#fff3ee":isDragging?"#f5ede5":"#faf9f7",
                            border:"1.5px solid", borderColor:isOver?"#b04a2a":isDragging?"#e0c0a8":"#ece7e0",
                            borderRadius:"6px", cursor:"grab", userSelect:"none" as const, opacity:isDragging?0.45:1
                          }}>
                          <span style={{ fontSize:"0.7rem", color:"#ccc", fontFamily:"monospace" }}>&#9783;</span>
                          <span style={{ fontSize:"0.85rem" }}>{info.icon}</span>
                          <span style={{ fontSize:"0.75rem", fontWeight:600, color:"#2d1f14", flex:1 }}>{info.label}</span>
                          <span style={{ fontSize:"0.6rem", color:"#ccc" }}>#{idx+1}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Navigate to section */}
                  <div style={{ borderTop:"1px solid #f0ebe5", padding:"0.65rem 0.9rem" }}>
                    <p style={{ margin:"0 0 0.4rem", fontWeight:700, fontSize:"0.72rem", color:"#2d1f14" }}>Jump to section</p>
                    {sectionOrder.map(secId => {
                      const info = SECTION_LABELS[secId] || { icon:"", label:secId, anchor:"#top" };
                      return (
                        <a key={secId} href={"/" + info.anchor} target="site-preview-frame"
                          style={{ display:"block", padding:"0.25rem 0.3rem", fontSize:"0.7rem", color:"#666", textDecoration:"none", borderRadius:"4px" }}>
                          {info.icon} {info.label}
                        </a>
                      );
                    })}
                  </div>

                  {/* Quick style swatches */}
                  <div style={{ borderTop:"1px solid #f0ebe5", padding:"0.65rem 0.9rem" }}>
                    <p style={{ margin:"0 0 0.5rem", fontWeight:700, fontSize:"0.72rem", color:"#2d1f14" }}>Style swatches</p>
                    <p style={{ margin:"0 0 0.3rem", fontSize:"0.64rem", color:"#aaa", textTransform:"uppercase" as const, letterSpacing:"0.05em" }}>Accent colour</p>
                    <div style={{ display:"flex", gap:"0.3rem", flexWrap:"wrap" as const, marginBottom:"0.55rem" }}>
                      {[["#b04a2a","Clay"],["#1a5276","Navy"],["#1e8449","Forest"],["#6c3483","Plum"],["#784212","Amber"],["#2c3e50","Slate"]].map(([col, nm]) => (
                        <div key={col} title={nm} onClick={() => setDesign((p) => ({ ...p, color_clay: col }))}
                          style={{ width:"20px", height:"20px", borderRadius:"50%", background:col, cursor:"pointer",
                            border:(design.color_clay||"#b04a2a")===col?"2.5px solid #2d1f14":"2px solid transparent",
                            boxShadow:"0 1px 3px rgba(0,0,0,0.18)" }} />
                      ))}
                    </div>
                    <p style={{ margin:"0 0 0.3rem", fontSize:"0.64rem", color:"#aaa", textTransform:"uppercase" as const, letterSpacing:"0.05em" }}>Background</p>
                    <div style={{ display:"flex", gap:"0.3rem", flexWrap:"wrap" as const, marginBottom:"0.55rem" }}>
                      {[["#F4EFE6","Bone"],["#FFFFFF","White"],["#1a1a1a","Dark"],["#F0F4F0","Sage"],["#FFF8F0","Warm"]].map(([col, nm]) => (
                        <div key={col} title={nm} onClick={() => setDesign((p) => ({ ...p, color_bone: col }))}
                          style={{ width:"20px", height:"20px", borderRadius:"50%", background:col, cursor:"pointer",
                            border:(design.color_bone||"#F4EFE6")===col?"2.5px solid #2d1f14":"2px solid #ccc",
                            boxShadow:"0 1px 3px rgba(0,0,0,0.12)" }} />
                      ))}
                    </div>
                    <p style={{ margin:"0 0 0.3rem", fontSize:"0.64rem", color:"#aaa", textTransform:"uppercase" as const, letterSpacing:"0.05em" }}>Layout width</p>
                    <div style={{ display:"flex", gap:"0.25rem", marginBottom:"0.55rem" }}>
                      {[["contained","Box"],["wide","Wide"],["full-bleed","Full"]].map(([opt, lbl]) => (
                        <button key={opt} onClick={() => setDesign((p) => ({ ...p, layout_width: opt }))}
                          style={{ flex:1, padding:"0.28rem 0.1rem", border:"1.5px solid",
                            borderColor:(design.layout_width||"contained")===opt?"#b04a2a":"#e0d8d0",
                            background:(design.layout_width||"contained")===opt?"#fff3ee":"white",
                            color:(design.layout_width||"contained")===opt?"#b04a2a":"#888",
                            borderRadius:"4px", cursor:"pointer", fontSize:"0.62rem", fontWeight:600 }}>{lbl}</button>
                      ))}
                    </div>
                    <p style={{ margin:"0 0 0.3rem", fontSize:"0.64rem", color:"#aaa", textTransform:"uppercase" as const, letterSpacing:"0.05em" }}>Card style</p>
                    <div style={{ display:"flex", gap:"0.25rem", marginBottom:"0.65rem", flexWrap:"wrap" as const }}>
                      {["flat","bordered","shadowed","glass"].map(opt => (
                        <button key={opt} onClick={() => setDesign((p) => ({ ...p, card_style: opt }))}
                          style={{ padding:"0.25rem 0.4rem", border:"1.5px solid",
                            borderColor:(design.card_style||"flat")===opt?"#b04a2a":"#e0d8d0",
                            background:(design.card_style||"flat")===opt?"#fff3ee":"white",
                            color:(design.card_style||"flat")===opt?"#b04a2a":"#888",
                            borderRadius:"4px", cursor:"pointer", fontSize:"0.6rem", fontWeight:600 }}>{opt}</button>
                      ))}
                    </div>
                    <button onClick={saveDesign} style={{ ...S.btnPrimary, width:"100%", fontSize:"0.72rem", padding:"0.42rem" } as React.CSSProperties}>
                      {designSaved ? "✓ Applied!" : "Apply styles to site"}
                    </button>
                    <button onClick={() => { const def = ["hero","manifesto","menu","heritage","locations","gallery","ordering","contact"]; setSectionOrder(def); supabase.from("site_content").upsert({ id:"layout__section_order", value:JSON.stringify(def), updated_at:new Date().toISOString() },{ onConflict:"id" }); }} style={{ width:"100%", marginTop:"0.4rem", padding:"0.32rem", background:"#f5f0eb", border:"1px solid #e0d8d0", borderRadius:"5px", cursor:"pointer", fontSize:"0.68rem", color:"#999" }}>↺ Reset section order</button>
                  </div>
                </div>

                {/* Preview iframe */}
                <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", padding:"0.75rem", overflowY:"auto", gap:"0" }}>
                  <div style={{
                    width:previewWidth, maxWidth:"100%",
                    boxShadow:"0 8px 40px rgba(0,0,0,0.25)",
                    borderRadius:previewDevice==="desktop"?"2px":"14px",
                    overflow:"hidden",
                    transition:"width 0.3s ease",
                    background:"white",
                  }}>
                    {previewDevice !== "desktop" && (
                      <div style={{ background:"#2d1f14", padding:"0.4rem 0", display:"flex", justifyContent:"center" }}>
                        <div style={{ width:"60px", height:"5px", background:"rgba(255,255,255,0.2)", borderRadius:"3px" }} />
                      </div>
                    )}
                    <iframe
                      id="site-preview-frame"
                      key={previewKey}
                      src="/"
                      name="site-preview-frame"
                      style={{ width:"100%", height:"calc(100vh - 135px)", minHeight:"500px", border:"none", display:"block" }}
                      title="Website preview"
                    />
                    {previewDevice !== "desktop" && (
                      <div style={{ background:"#2d1f14", padding:"0.6rem 0", display:"flex", justifyContent:"center", gap:"0.5rem" }}>
                        <div style={{ width:"30px", height:"30px", borderRadius:"50%", border:"2px solid rgba(255,255,255,0.2)" }} />
                      </div>
                    )}
                  </div>
                  <p style={{ marginTop:"0.6rem", fontSize:"0.65rem", color:"#aaa", textAlign:"center" as const }}>
                    {previewDevice.charAt(0).toUpperCase()+previewDevice.slice(1)} preview · Content reflects last saved state · Use ↻ Refresh after saving changes
                  </p>
                </div>
              </div>
            </div>
          )}


        </main>
      </div>
    </div>
  );
}
