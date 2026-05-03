import { useState, useEffect } from "react";
import { agrobesoSupabase as supabase, AGROBESO_STORAGE_URL } from "../integrations/supabase/agrobeso-client";

const ADMIN_PASSWORD = "agrobeso2024";

type UploadedImage = { name: string; url: string; category: string };
type ContentItem = { id: string; value: string };

const CONTENT_FIELDS = [
  { section: "Hero Section", icon: "🏠", fields: [
    { id: "hero_tagline", label: "Tagline (top badge)", multiline: false, hint: 'e.g. "Est. South London · Ghanaian Kitchen"' },
    { id: "hero_headline_line1", label: "Headline — Line 1", multiline: false, hint: 'e.g. "The taste"' },
    { id: "hero_headline_line2", label: "Headline — Line 2", multiline: false, hint: 'e.g. "of home,"' },
    { id: "hero_headline_italic", label: "Headline — Italic word", multiline: false, hint: 'e.g. "plated."' },
    { id: "hero_subheadline", label: "Sub-headline paragraph", multiline: true, hint: "Short description under the main headline" },
    { id: "hero_featured_dish", label: "Featured dish card text", multiline: false, hint: "Text shown on the hero image card" },
  ]},
  { section: "Manifesto Section", icon: "✍️", fields: [
    { id: "manifesto_text", label: "Manifesto paragraph", multiline: true, hint: "The main statement about Agrobeso" },
  ]},
  { section: "Menu Section", icon: "🍽️", fields: [
    { id: "menu_headline", label: "Menu headline", multiline: false, hint: 'e.g. "A short list, cooked properly."' },
    { id: "menu_subtext", label: "Menu sub-text", multiline: true, hint: "Short description below the headline" },
    { id: "menu_footer_note", label: "Menu footer note", multiline: true, hint: "Small print about prices / availability" },
  ]},
  { section: "Dish Stories", icon: "📖", fields: [
    { id: "dish_jollof_rice_story", label: "Jollof Rice — story", multiline: true, hint: "Short description shown under the dish name" },
    { id: "dish_jollof_rice_note", label: "Jollof Rice — note", multiline: false, hint: 'e.g. "A dish of celebration"' },
    { id: "dish_waakye_story", label: "Waakye — story", multiline: true, hint: "" },
    { id: "dish_waakye_note", label: "Waakye — note", multiline: false, hint: "" },
    { id: "dish_kenkey_fish_story", label: "Kenkey & Fish — story", multiline: true, hint: "" },
    { id: "dish_kenkey_fish_note", label: "Kenkey & Fish — note", multiline: false, hint: "" },
    { id: "dish_banku_okra_story", label: "Banku & Okra Stew — story", multiline: true, hint: "" },
    { id: "dish_banku_okra_note", label: "Banku & Okra Stew — note", multiline: false, hint: "" },
    { id: "dish_peanut_soup_story", label: "Peanut Soup — story", multiline: true, hint: "" },
    { id: "dish_peanut_soup_note", label: "Peanut Soup — note", multiline: false, hint: "" },
    { id: "dish_fufu_story", label: "Fufu / Pounded Yam — story", multiline: true, hint: "" },
    { id: "dish_fufu_note", label: "Fufu / Pounded Yam — note", multiline: false, hint: "" },
    { id: "dish_fried_fish_story", label: "Fried Fish / Tilapia — story", multiline: true, hint: "" },
    { id: "dish_fried_fish_note", label: "Fried Fish / Tilapia — note", multiline: false, hint: "" },
    { id: "dish_tuo_zaafi_story", label: "Tuo Zaafi — story", multiline: true, hint: "" },
    { id: "dish_tuo_zaafi_note", label: "Tuo Zaafi — note", multiline: false, hint: "" },
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
  { section: "Reserve / Ordering Section", icon: "🪑", fields: [
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
const inputStyle = {
  width: "100%", padding: "0.6rem 0.8rem", border: "1.5px solid #e0d8d0",
  borderRadius: "6px", fontSize: "0.95rem", fontFamily: "inherit",
  boxSizing: "border-box", background: "#fdfaf7",
};
const btnPrimary = {
  padding: "0.75rem 1.5rem", background: "#b04a2a", color: "white",
  border: "none", borderRadius: "8px", fontWeight: 700, cursor: "pointer", fontSize: "0.95rem",
};

export default function Admin() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState("content");
  const [openSections, setOpenSections] = useState({ "Hero Section": true });
  const [file, setFile] = useState(null);
  const [category, setCategory] = useState("gallery");
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [imageMessage, setImageMessage] = useState("");
  const [loadingImages, setLoadingImages] = useState(false);
  const [filterCat, setFilterCat] = useState("all");
  const [content, setContent] = useState({});
  const [saving, setSaving] = useState(null);
  const [savedField, setSavedField] = useState(null);
  const [loadingContent, setLoadingContent] = useState(false);
  const [globalSaveStatus, setGlobalSaveStatus] = useState("idle");

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) setAuthenticated(true);
    else alert("Incorrect password");
  };
  const toggleSection = (name) => setOpenSections((p) => ({ ...p, [name]: !p[name] }));

  const loadImages = async () => {
    setLoadingImages(true);
    const { data, error } = await supabase.storage.from("images").list("", { limit: 200, sortBy: { column: "created_at", order: "desc" } });
    if (error) setImageMessage("Error: " + error.message);
    else if (data) setUploadedImages(data.filter((f) => f.name !== ".emptyFolderPlaceholder").map((f) => ({ name: f.name, url: `${AGROBESO_STORAGE_URL}/${f.name}`, category: f.name.split("-")[0] || "general" })));
    setLoadingImages(false);
  };

  const loadContent = async () => {
    setLoadingContent(true);
    const { data, error } = await supabase.from("site_content").select("id, value");
    if (!error && data) { const map = {}; data.forEach((r) => { map[r.id] = r.value; }); setContent(map); }
    setLoadingContent(false);
  };

  useEffect(() => { if (authenticated) { loadImages(); loadContent(); } }, [authenticated]);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true); setImageMessage("");
    const fileName = `${category}-${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
    const { error } = await supabase.storage.from("images").upload(fileName, file);
    if (error) setImageMessage("Upload failed: " + error.message);
    else { setImageMessage("Upload successful!"); setFile(null); await loadImages(); }
    setUploading(false);
  };

  const handleDeleteImage = async (name) => {
    if (!confirm("Delete this image?")) return;
    const { error } = await supabase.storage.from("images").remove([name]);
    if (error) alert("Delete failed: " + error.message);
    else await loadImages();
  };

  const handleSaveField = async (fieldId) => {
    setSaving(fieldId);
    const { error } = await supabase.from("site_content").upsert({ id: fieldId, value: content[fieldId] || "", updated_at: new Date().toISOString() }, { onConflict: "id" });
    setSaving(null);
    if (error) alert("Save failed: " + error.message);
    else { setSavedField(fieldId); setTimeout(() => setSavedField(null), 2500); }
  };

  const handleSaveAll = async () => {
    setGlobalSaveStatus("saving");
    const upserts = CONTENT_FIELDS.flatMap((s) => s.fields).filter((f) => content[f.id]).map((f) => ({ id: f.id, value: content[f.id], updated_at: new Date().toISOString() }));
    if (!upserts.length) { setGlobalSaveStatus("idle"); alert("No content to save."); return; }
    const { error } = await supabase.from("site_content").upsert(upserts, { onConflict: "id" });
    if (error) { setGlobalSaveStatus("error"); alert("Save failed: " + error.message); setTimeout(() => setGlobalSaveStatus("idle"), 3000); }
    else { setGlobalSaveStatus("saved"); setTimeout(() => setGlobalSaveStatus("idle"), 3000); }
  };

  const filteredImages = filterCat === "all" ? uploadedImages : uploadedImages.filter((i) => i.category === filterCat);
  const imageCats = ["all", ...Array.from(new Set(uploadedImages.map((i) => i.category)))];
  if (!authenticated) {
    return (
      <div style={{ minHeight: "100vh", background: "#f5f0eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ background: "white", padding: "2.5rem", borderRadius: "12px", boxShadow: "0 4px 24px rgba(0,0,0,0.1)", width: "360px", maxWidth: "90vw" }}>
          <p style={{ fontFamily: "monospace", fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#b04a2a", marginBottom: "0.5rem" }}>Agrobeso</p>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 400, marginBottom: "0.25rem", color: "#2d1f14" }}>Admin Dashboard</h1>
          <p style={{ color: "#888", marginBottom: "1.5rem", fontSize: "0.9rem" }}>Enter your password to continue.</p>
          <form onSubmit={handleLogin}>
            <input type="password" placeholder="Admin password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ ...inputStyle, marginBottom: "1rem" }} autoFocus />
            <button type="submit" style={{ ...btnPrimary, width: "100%" }}>Sign in</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f5f0eb" }}>
      <div style={{ background: "#2d1f14", color: "white", padding: "0.9rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ fontFamily: "Georgia, serif", fontSize: "1.2rem" }}>Agrobeso</span>
          <span style={{ fontSize: "0.8rem", opacity: 0.5, textTransform: "uppercase", letterSpacing: "0.08em" }}>Admin</span>
        </div>
        <a href="/" target="_blank" rel="noreferrer" style={{ color: "#f0c070", textDecoration: "none", fontSize: "0.85rem" }}>View website ↗</a>
      </div>
      <div style={{ background: "white", borderBottom: "1px solid #e0d8d0", padding: "0 2rem", display: "flex" }}>
        {["content", "images"].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: "1rem 1.5rem", border: "none", background: "none", fontWeight: activeTab === tab ? 700 : 400, borderBottom: activeTab === tab ? "3px solid #b04a2a" : "3px solid transparent", color: activeTab === tab ? "#b04a2a" : "#555", cursor: "pointer", fontSize: "0.95rem" }}>
            {tab === "content" ? "✏️  Edit Website Text" : "🖼️  Manage Images"}
          </button>
        ))}
      </div>
      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "2rem 1rem 4rem" }}>
        {activeTab === "content" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.75rem", gap: "1rem", flexWrap: "wrap" }}>
              <div>
                <h2 style={{ margin: 0, fontSize: "1.4rem", color: "#2d1f14" }}>Edit Website Text</h2>
                <p style={{ margin: "0.3rem 0 0", color: "#999", fontSize: "0.85rem" }}>Click a section to expand. Save individually or use Save All.</p>
              </div>
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button onClick={loadContent} style={{ padding: "0.6rem 1rem", background: "#2d1f14", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "0.85rem" }}>↻ Reload</button>
                <button onClick={handleSaveAll} disabled={globalSaveStatus === "saving"} style={{ ...btnPrimary, opacity: globalSaveStatus === "saving" ? 0.7 : 1 }}>
                  {globalSaveStatus === "saving" ? "Saving…" : globalSaveStatus === "saved" ? "✓ All Saved!" : globalSaveStatus === "error" ? "✗ Error" : "Save All Changes"}
                </button>
              </div>
            </div>
            {loadingContent ? <div style={{ textAlign: "center", padding: "3rem", color: "#999" }}>Loading…</div> : (
              CONTENT_FIELDS.map((section) => {
                const isOpen = !!openSections[section.section];
                return (
                  <div key={section.section} style={{ background: "white", borderRadius: "10px", marginBottom: "0.75rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
                    <button onClick={() => toggleSection(section.section)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem 1.5rem", border: "none", background: "none", cursor: "pointer", textAlign: "left" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                        <span>{section.icon}</span>
                        <span style={{ fontWeight: 700, color: "#2d1f14", fontSize: "0.95rem" }}>{section.section}</span>
                        <span style={{ fontSize: "0.75rem", color: "#aaa" }}>({section.fields.length} fields)</span>
                      </span>
                      <span style={{ color: "#b04a2a" }}>{isOpen ? "▲" : "▼"}</span>
                    </button>
                    {isOpen && (
                      <div style={{ padding: "0.5rem 1.5rem 1.5rem", borderTop: "1px solid #f0ebe5" }}>
                        {section.fields.map((field) => (
                          <div key={field.id} style={{ marginBottom: "1.25rem" }}>
                            <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#555", marginBottom: "0.3rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>{field.label}</label>
                            {field.hint && <p style={{ margin: "0 0 0.4rem", fontSize: "0.78rem", color: "#bbb", fontStyle: "italic" }}>{field.hint}</p>}
                            {field.multiline ? (
                              <textarea value={content[field.id] || ""} onChange={(e) => setContent((p) => ({ ...p, [field.id]: e.target.value }))} rows={3} style={{ ...inputStyle, resize: "vertical" }} />
                            ) : (
                              <input type="text" value={content[field.id] || ""} onChange={(e) => setContent((p) => ({ ...p, [field.id]: e.target.value }))} style={inputStyle} />
                            )}
                            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.4rem" }}>
                              <button onClick={() => handleSaveField(field.id)} disabled={saving !== null} style={{ padding: "0.35rem 1rem", background: savedField === field.id ? "#27ae60" : "#2d1f14", color: "white", border: "none", borderRadius: "5px", fontSize: "0.78rem", cursor: "pointer" }}>
                                {saving === field.id ? "Saving…" : savedField === field.id ? "✓ Saved" : "Save"}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
        {activeTab === "images" && (
          <div>
            <h2 style={{ fontSize: "1.4rem", color: "#2d1f14", marginBottom: "0.25rem" }}>Manage Images</h2>
            <p style={{ color: "#999", fontSize: "0.85rem", marginBottom: "1.75rem" }}>Upload images for the gallery, hero, menu dishes and more.</p>
            <div style={{ background: "white", borderRadius: "10px", padding: "1.5rem", marginBottom: "2rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <h3 style={{ margin: "0 0 1rem", color: "#2d1f14", fontSize: "1rem" }}>Upload a New Image</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontWeight: 600, color: "#555", marginBottom: "0.4rem", fontSize: "0.8rem", textTransform: "uppercase" }}>Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} style={inputStyle}>
                    <option value="gallery">Gallery</option>
                    <option value="hero">Hero / Banner</option>
                    <option value="menu">Menu dishes</option>
                    <option value="about">About / Heritage</option>
                    <option value="event">Events</option>
                    <option value="general">General</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontWeight: 600, color: "#555", marginBottom: "0.4rem", fontSize: "0.8rem", textTransform: "uppercase" }}>Image file</label>
                  <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} style={{ fontSize: "0.9rem", paddingTop: "0.5rem" }} />
                </div>
              </div>
              {file && <div style={{ marginBottom: "1rem", padding: "0.5rem 0.75rem", background: "#f9f5f0", borderRadius: "6px", fontSize: "0.875rem" }}>Selected: <strong>{file.name}</strong> ({(file.size / 1024).toFixed(0)} KB)</div>}
              <button onClick={handleUpload} disabled={uploading || !file} style={{ ...btnPrimary, opacity: uploading || !file ? 0.5 : 1, cursor: uploading || !file ? "not-allowed" : "pointer" }}>
                {uploading ? "Uploading…" : "Upload Image"}
              </button>
              {imageMessage && <div style={{ marginTop: "0.75rem", padding: "0.6rem 0.9rem", background: imageMessage.includes("failed") ? "#fee8e8" : "#e8f8ee", borderRadius: "6px", fontSize: "0.875rem", color: imageMessage.includes("failed") ? "#c00" : "#1a7a3a" }}>{imageMessage}</div>}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
              <h3 style={{ margin: 0, color: "#2d1f14" }}>Uploaded Images ({filteredImages.length})</h3>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {imageCats.map((cat) => (
                  <button key={cat} onClick={() => setFilterCat(cat)} style={{ padding: "0.3rem 0.75rem", border: "1.5px solid", borderColor: filterCat === cat ? "#b04a2a" : "#e0d8d0", background: filterCat === cat ? "#b04a2a" : "white", color: filterCat === cat ? "white" : "#555", borderRadius: "20px", cursor: "pointer", fontSize: "0.78rem" }}>{cat}</button>
                ))}
                <button onClick={loadImages} style={{ padding: "0.3rem 0.75rem", background: "#2d1f14", color: "white", border: "none", borderRadius: "20px", cursor: "pointer", fontSize: "0.78rem" }}>↻ Refresh</button>
              </div>
            </div>
            {loadingImages ? <div style={{ textAlign: "center", padding: "3rem", color: "#999" }}>Loading…</div>
            : filteredImages.length === 0 ? <div style={{ textAlign: "center", padding: "3rem", color: "#bbb", background: "white", borderRadius: "10px" }}>No images {filterCat !== "all" ? `in "${filterCat}"` : "uploaded yet"}.</div>
            : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: "1rem" }}>
                {filteredImages.map((img) => (
                  <div key={img.name} style={{ background: "white", borderRadius: "10px", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
                    <img src={img.url} alt={img.name} style={{ width: "100%", height: "130px", objectFit: "cover", display: "block" }} />
                    <div style={{ padding: "0.65rem 0.75rem" }}>
                      <div style={{ fontSize: "0.72rem", color: "#b04a2a", fontWeight: 700, textTransform: "uppercase", marginBottom: "0.4rem" }}>{img.category}</div>
                      <div style={{ display: "flex", gap: "0.4rem" }}>
                        <button onClick={() => { navigator.clipboard.writeText(img.url).catch(() => {}); setImageMessage("URL copied!"); setTimeout(() => setImageMessage(""), 2000); }} style={{ flex: 1, padding: "0.35rem", background: "#2d1f14", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontSize: "0.72rem" }}>Copy URL</button>
                        <button onClick={() => handleDeleteImage(img.name)} style={{ flex: 1, padding: "0.35rem", background: "#dc2626", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontSize: "0.72rem" }}>Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
        }
