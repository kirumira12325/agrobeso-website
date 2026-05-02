import { useState, useEffect } from "react";
import { agrobesoSupabase as supabase, AGROBESO_STORAGE_URL } from "../integrations/supabase/agrobeso-client";

const ADMIN_PASSWORD = "agrobeso2024";

type UploadedImage = {
    name: string;
    url: string;
    category: string;
};

type ContentItem = {
    id: string;
    value: string;
};

const CONTENT_FIELDS = [
  { section: "Hero Section", fields: [
    { id: "hero_tagline", label: "Tagline (top badge)", multiline: false },
    { id: "hero_headline_line1", label: "Headline Line 1", multiline: false },
    { id: "hero_headline_line2", label: "Headline Line 2", multiline: false },
    { id: "hero_headline_italic", label: "Headline Italic Word", multiline: false },
    { id: "hero_subheadline", label: "Sub-headline paragraph", multiline: true },
    { id: "hero_featured_dish", label: "Featured Dish Card text", multiline: false },
      ]},
  { section: "Manifesto Section", fields: [
    { id: "manifesto_text", label: "Manifesto paragraph", multiline: true },
      ]},
  { section: "Menu Section", fields: [
    { id: "menu_headline", label: "Menu headline", multiline: false },
    { id: "menu_subtext", label: "Menu sub-text", multiline: true },
    { id: "menu_footer_note", label: "Menu footer note", multiline: true },
      ]},
  { section: "Heritage Section", fields: [
    { id: "heritage_headline", label: "Heritage headline", multiline: false },
    { id: "heritage_paragraph1", label: "Heritage paragraph 1", multiline: true },
    { id: "heritage_paragraph2", label: "Heritage paragraph 2", multiline: true },
      ]},
  { section: "Locations Section", fields: [
    { id: "locations_headline", label: "Locations headline", multiline: false },
    { id: "locations_subtext", label: "Locations sub-text", multiline: true },
      ]},
  { section: "Peckham Branch", fields: [
    { id: "peckham_address", label: "Address", multiline: false },
    { id: "peckham_phone_label", label: "Phone number (display)", multiline: false },
    { id: "peckham_phone_href", label: "Phone link (e.g. tel:+44...)", multiline: false },
    { id: "peckham_hours", label: "Opening hours", multiline: true },
      ]},
  { section: "Thornton Heath Branch", fields: [
    { id: "thorntonheath_address", label: "Address", multiline: false },
    { id: "thorntonheath_phone_label", label: "Phone number (display)", multiline: false },
    { id: "thorntonheath_phone_href", label: "Phone link (e.g. tel:+44...)", multiline: false },
    { id: "thorntonheath_hours", label: "Opening hours", multiline: true },
      ]},
  { section: "Gallery Section", fields: [
    { id: "gallery_headline", label: "Gallery headline", multiline: false },
    { id: "gallery_subtext", label: "Gallery sub-text", multiline: true },
      ]},
  { section: "Reserve / Ordering Section", fields: [
    { id: "ordering_headline", label: "Ordering headline", multiline: false },
    { id: "ordering_subtext", label: "Ordering sub-text", multiline: true },
      ]},
  { section: "Contact Section", fields: [
    { id: "contact_headline", label: "Contact headline", multiline: false },
    { id: "contact_subtext", label: "Contact sub-text", multiline: true },
      ]},
  { section: "Footer", fields: [
    { id: "footer_tagline", label: "Footer tagline", multiline: false },
    { id: "instagram_url", label: "Instagram URL", multiline: false },
      ]},
  ];

export default function Admin() {
    const [authenticated, setAuthenticated] = useState(false);
    const [password, setPassword] = useState("");
    const [activeTab, setActiveTab] = useState<"images" | "content">("content");

  // Image upload state
  const [file, setFile] = useState<File | null>(null);
    const [category, setCategory] = useState("menu");
    const [uploading, setUploading] = useState(false);
    const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
    const [imageMessage, setImageMessage] = useState("");
    const [loadingImages, setLoadingImages] = useState(false);

  // Content editor state
  const [content, setContent] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState<string | null>(null);
    const [savedField, setSavedField] = useState<string | null>(null);
    const [loadingContent, setLoadingContent] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === ADMIN_PASSWORD) {
                setAuthenticated(true);
        } else {
                alert("Incorrect password");
        }
  };

  const loadImages = async () => {
        setLoadingImages(true);
        const { data, error } = await supabase.storage.from("images").list("", {
                limit: 100,
                sortBy: { column: "created_at", order: "desc" },
        });
        if (error) {
                setImageMessage("Error loading images: " + error.message);
        } else if (data) {
                const imgs = data
                  .filter((f) => f.name !== ".emptyFolderPlaceholder")
                  .map((f) => {
                              const parts = f.name.split("-");
                              const cat = parts.length > 2 ? parts[0] : "general";
                              return {
                                            name: f.name,
                                            url: `${AGROBESO_STORAGE_URL}/storage/v1/object/public/images/${f.name}`,
                                            category: cat,
                              };
                  });
                setUploadedImages(imgs);
        }
        setLoadingImages(false);
  };

  const loadContent = async () => {
        setLoadingContent(true);
        const { data, error } = await supabase.from("site_content").select("id, value");
        if (!error && data) {
                const map: Record<string, string> = {};
                (data as ContentItem[]).forEach((row) => {
                          map[row.id] = row.value;
                });
                setContent(map);
        }
        setLoadingContent(false);
  };

  useEffect(() => {
        if (authenticated) {
                loadImages();
                loadContent();
        }
  }, [authenticated]);

  const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        setImageMessage("");
        const fileName = `${category}-${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
        const { error } = await supabase.storage.from("images").upload(fileName, file);
        if (error) {
                setImageMessage("Upload failed: " + error.message);
        } else {
                setImageMessage("Upload successful!");
                setFile(null);
                await loadImages();
        }
        setUploading(false);
  };

  const handleDeleteImage = async (name: string) => {
        if (!confirm("Delete this image?")) return;
        const { error } = await supabase.storage.from("images").remove([name]);
        if (error) {
                alert("Delete failed: " + error.message);
        } else {
                await loadImages();
        }
  };

  const handleSaveField = async (fieldId: string) => {
        setSaving(fieldId);
        const { error } = await supabase.from("site_content").upsert(
          { id: fieldId, value: content[fieldId] || "", updated_at: new Date().toISOString() },
          { onConflict: "id" }
              );
        setSaving(null);
        if (error) {
                alert("Save failed: " + error.message);
        } else {
                setSavedField(fieldId);
                setTimeout(() => setSavedField(null), 2000);
        }
  };

  const handleSaveAll = async () => {
        setSaving("all");
        const allFields = CONTENT_FIELDS.flatMap((s) => s.fields);
        const upserts = allFields
          .filter((f) => content[f.id] !== undefined)
          .map((f) => ({ id: f.id, value: content[f.id], updated_at: new Date().toISOString() }));
        const { error } = await supabase.from("site_content").upsert(upserts, { onConflict: "id" });
        setSaving(null);
        if (error) {
                alert("Save failed: " + error.message);
        } else {
                setSavedField("all");
                setTimeout(() => setSavedField(null), 2000);
        }
  };

  if (!authenticated) {
        return (
                <div style={{ minHeight: "100vh", background: "#f5f0eb", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif" }}>
                          <div style={{ background: "white", padding: "2.5rem", borderRadius: "12px", boxShadow: "0 4px 24px rgba(0,0,0,0.10)", width: "360px" }}>
                                      <h1 style={{ fontSize: "1.8rem", fontWeight: 700, marginBottom: "0.25rem", color: "#2d1f14" }}>Agrobeso Admin</h1>h1>
                                      <p style={{ color: "#888", marginBottom: "1.5rem", fontSize: "0.9rem" }}>Enter your admin password to continue.</p>p>
                                      <form onSubmit={handleLogin}>
                                                    <input
                                                                    type="password"
                                                                    placeholder="Admin password"
                                                                    value={password}
                                                                    onChange={(e) => setPassword(e.target.value)}
                                                                    style={{ width: "100%", padding: "0.75rem 1rem", border: "1.5px solid #e0d8d0", borderRadius: "8px", fontSize: "1rem", marginBottom: "1rem", boxSizing: "border-box" }}
                                                                  />
                                                    <button type="submit" style={{ width: "100%", padding: "0.75rem", background: "#b04a2a", color: "white", border: "none", borderRadius: "8px", fontSize: "1rem", fontWeight: 600, cursor: "pointer" }}>
                                                                    Login
                                                    </button>button>
                                      </form>form>
                          </div>div>
                </div>div>
              );
  }

  return (
        <div style={{ minHeight: "100vh", background: "#f5f0eb", fontFamily: "sans-serif" }}>
          {/* Header */}
                <div style={{ background: "#2d1f14", color: "white", padding: "1rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <div>
                                    <span style={{ fontSize: "1.3rem", fontWeight: 700 }}>Agrobeso Admin</span>span>
                                    <span style={{ marginLeft: "1rem", fontSize: "0.85rem", opacity: 0.6 }}>Content Management System</span>span>
                          </div>div>
                        <a href="/" style={{ color: "#f0c070", textDecoration: "none", fontSize: "0.85rem" }}>← View Website</a>a>
                </div>div>
        
          {/* Tabs */}
              <div style={{ background: "white", borderBottom: "2px solid #e0d8d0", padding: "0 2rem", display: "flex", gap: "0" }}>
                      <button onClick={() => setActiveTab("content")} style={{ padding: "1rem 1.5rem", border: "none", background: "none", fontWeight: activeTab === "content" ? 700 : 400, borderBottom: activeTab === "content" ? "3px solid #b04a2a" : "3px solid transparent", color: activeTab === "content" ? "#b04a2a" : "#555", cursor: "pointer", fontSize: "0.95rem" }}>
                                ✏️ Edit Website Text
                      </button>button>
                      <button onClick={() => setActiveTab("images")} style={{ padding: "1rem 1.5rem", border: "none", background: "none", fontWeight: activeTab === "images" ? 700 : 400, borderBottom: activeTab === "images" ? "3px solid #b04a2a" : "3px solid transparent", color: activeTab === "images" ? "#b04a2a" : "#555", cursor: "pointer", fontSize: "0.95rem" }}>
                                🖼️ Upload Images
                      </button>button>
              </div>div>
        
              <div style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem 1rem" }}>
              
                {/* CONTENT EDITOR TAB */}
                {activeTab === "content" && (
                    <div>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                                              <div>
                                                              <h2 style={{ margin: 0, fontSize: "1.4rem", color: "#2d1f14" }}>Edit Website Text</h2>h2>
                                                              <p style={{ margin: "0.25rem 0 0", color: "#888", fontSize: "0.875rem" }}>Changes go live on the website after saving.</p>p>
                                              </div>div>
                                              <button onClick={handleSaveAll} disabled={saving !== null} style={{ padding: "0.75rem 1.5rem", background: saving === "all" ? "#999" : "#b04a2a", color: "white", border: "none", borderRadius: "8px", fontWeight: 700, cursor: "pointer", fontSize: "0.95rem" }}>
                                                {saving === "all" ? "Saving..." : savedField === "all" ? "✓ All Saved!" : "Save All Changes"}
                                              </button>button>
                                </div>div>
                    
                      {loadingContent ? (
                                    <div style={{ textAlign: "center", padding: "3rem", color: "#888" }}>Loading content...</div>div>
                                  ) : (
                                    CONTENT_FIELDS.map((section) => (
                                                      <div key={section.section} style={{ background: "white", borderRadius: "10px", padding: "1.5rem", marginBottom: "1.5rem", boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}>
                                                                        <h3 style={{ margin: "0 0 1.25rem", fontSize: "1rem", fontWeight: 700, color: "#b04a2a", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                                                          {section.section}
                                                                        </h3>h3>
                                                        {section.fields.map((field) => (
                                                                            <div key={field.id} style={{ marginBottom: "1.25rem" }}>
                                                                                                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#555", marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                                                                                                    {field.label}
                                                                                                    </label>label>
                                                                              {field.multiline ? (
                                                                                                      <textarea
                                                                                                                                  value={content[field.id] || ""}
                                                                                                                                  onChange={(e) => setContent((prev) => ({ ...prev, [field.id]: e.target.value }))}
                                                                                                                                  rows={3}
                                                                                                                                  style={{ width: "100%", padding: "0.6rem 0.8rem", border: "1.5px solid #e0d8d0", borderRadius: "6px", fontSize: "0.95rem", fontFamily: "inherit", resize: "vertical", boxSizing: "border-box" }}
                                                                                                                                />
                                                                                                    ) : (
                                                                                                      <input
                                                                                                                                  type="text"
                                                                                                                                  value={content[field.id] || ""}
                                                                                                                                  onChange={(e) => setContent((prev) => ({ ...prev, [field.id]: e.target.value }))}
                                                                                                                                  style={{ width: "100%", padding: "0.6rem 0.8rem", border: "1.5px solid #e0d8d0", borderRadius: "6px", fontSize: "0.95rem", boxSizing: "border-box" }}
                                                                                                                                />
                                                                                                    )}
                                                                                                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.4rem" }}>
                                                                                                                          <button onClick={() => handleSaveField(field.id)} disabled={saving !== null} style={{ padding: "0.35rem 0.9rem", background: savedField === field.id ? "#27ae60" : "#2d1f14", color: "white", border: "none", borderRadius: "5px", fontSize: "0.8rem", cursor: "pointer" }}>
                                                                                                                            {saving === field.id ? "Saving..." : savedField === field.id ? "✓ Saved" : "Save"}
                                                                                                                            </button>button>
                                                                                                    </div>div>
                                                                            </div>div>
                                                                          ))}
                                                      </div>div>
                                                    ))
                                  )}
                    </div>div>
                      )}
              
                {/* IMAGE UPLOAD TAB */}
                {activeTab === "images" && (
                    <div>
                                <h2 style={{ fontSize: "1.4rem", color: "#2d1f14", marginBottom: "1.5rem" }}>Upload Images</h2>h2>
                    
                      {/* Upload box */}
                                <div style={{ background: "white", borderRadius: "10px", padding: "1.5rem", marginBottom: "2rem", boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}>
                                              <div style={{ marginBottom: "1rem" }}>
                                                              <label style={{ display: "block", fontWeight: 600, color: "#555", marginBottom: "0.4rem", fontSize: "0.85rem", textTransform: "uppercase" }}>Category</label>label>
                                                              <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ padding: "0.6rem 0.8rem", border: "1.5px solid #e0d8d0", borderRadius: "6px", fontSize: "0.95rem", width: "220px" }}>
                                                                                <option value="menu">Menu dishes</option>option>
                                                                                <option value="gallery">Gallery</option>option>
                                                                                <option value="hero">Hero / Banner</option>option>
                                                                                <option value="about">About / Heritage</option>option>
                                                                                <option value="event">Events</option>option>
                                                                                <option value="general">General</option>option>
                                                              </select>select>
                                              </div>div>
                                              <div style={{ marginBottom: "1rem" }}>
                                                              <label style={{ display: "block", fontWeight: 600, color: "#555", marginBottom: "0.4rem", fontSize: "0.85rem", textTransform: "uppercase" }}>Choose Image</label>label>
                                                              <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} style={{ fontSize: "0.95rem" }} />
                                              </div>div>
                                  {file && (
                                      <div style={{ marginBottom: "1rem", padding: "0.5rem 0.75rem", background: "#f9f5f0", borderRadius: "6px", fontSize: "0.875rem", color: "#555" }}>
                                                        Selected: <strong>{file.name}</strong>strong> ({(file.size / 1024).toFixed(0)} KB)
                                      </div>div>
                                              )}
                                              <button onClick={handleUpload} disabled={uploading || !file} style={{ padding: "0.75rem 2rem", background: uploading || !file ? "#ccc" : "#b04a2a", color: "white", border: "none", borderRadius: "8px", fontWeight: 700, cursor: uploading || !file ? "not-allowed" : "pointer", fontSize: "0.95rem" }}>
                                                {uploading ? "Uploading..." : "Upload Image"}
                                              </button>button>
                                  {imageMessage && (
                                      <div style={{ marginTop: "0.75rem", padding: "0.5rem 0.75rem", background: imageMessage.includes("failed") ? "#fee" : "#efe", borderRadius: "6px", fontSize: "0.875rem", color: imageMessage.includes("failed") ? "#c00" : "#060" }}>
                                        {imageMessage}
                                      </div>div>
                                              )}
                                </div>div>
                    
                      {/* Image gallery */}
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                                              <h3 style={{ margin: 0, color: "#2d1f14" }}>Uploaded Images ({uploadedImages.length})</h3>h3>
                                              <button onClick={loadImages} style={{ padding: "0.4rem 0.9rem", background: "#2d1f14", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "0.85rem" }}>↻ Refresh</button>button>
                                </div>div>
                      {loadingImages ? (
                                    <div style={{ textAlign: "center", padding: "2rem", color: "#888" }}>Loading images...</div>div>
                                  ) : uploadedImages.length === 0 ? (
                                    <div style={{ textAlign: "center", padding: "2rem", color: "#aaa", background: "white", borderRadius: "10px" }}>No images uploaded yet.</div>div>
                                  ) : (
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
                                      {uploadedImages.map((img) => (
                                                        <div key={img.name} style={{ background: "white", borderRadius: "10px", overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}>
                                                                            <img src={img.url} alt={img.name} style={{ width: "100%", height: "140px", objectFit: "cover", display: "block" }} />
                                                                            <div style={{ padding: "0.75rem" }}>
                                                                                                  <div style={{ fontSize: "0.75rem", color: "#888", marginBottom: "0.5rem", wordBreak: "break-all" }}>{img.category}</div>div>
                                                                                                  <div style={{ display: "flex", gap: "0.5rem" }}>
                                                                                                                          <button onClick={() => { navigator.clipboard.writeText(img.url); alert("URL copied!"); }} style={{ flex: 1, padding: "0.35rem", background: "#2d1f14", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontSize: "0.75rem" }}>
                                                                                                                                                    Copy URL
                                                                                                                            </button>button>
                                                                                                                          <button onClick={() => handleDeleteImage(img.name)} style={{ flex: 1, padding: "0.35rem", background: "#dc2626", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontSize: "0.75rem" }}>
                                                                                                                                                    Delete
                                                                                                                            </button>button>
                                                                                                    </div>div>
                                                                            </div>div>
                                                        </div>div>
                                                      ))}
                                    </div>div>
                                )}
                    </div>div>
                      )}
              </div>div>
        </div>div>
      );
}</div>
