import { useState, useEffect, useRef } from "react";
import { agrobesoSupabase as supabase, AGROBESO_STORAGE_URL } from "../integrations/supabase/agrobeso-client";

const ADMIN_PASSWORD = "agrobeso2024";

// ─── Types ───────────────────────────────────────────────────────
type Img = { name: string; url: string; category: string };
type CI = { id: string; value: string };
type DishItem = { key: string; name: string; story: string; note: string; image: string };
type MenuItem = { id: string; name: string; description: string; price: string; image: string; category: string };
type MenuCat = { id: string; title: string; items: MenuItem[] };
type Location = { id: string; name: string; address: string; phone: string; phoneHref: string; hours: string; image: string };
type GalleryImg = { id: string; url: string; caption: string; category: string };
type CustomSection = { id: string; type: string; title: string; subtitle: string; body: string; image: string; enabled: boolean };

// ─── Dish data ───────────────────────────────────────────────────
const DISHES: DishItem[] = [
  { key: "jollof_rice", name: "Jollof Rice", story: "Long-grain rice slow-simmered in tomato, scotch bonnet and bay.", note: "A dish of celebration", image: "" },
  { key: "waakye", name: "Waakye", story: "Rice and beans with sorghum leaves. Served with shito and fried plantain.", note: "A Saturday morning ritual", image: "" },
  { key: "kenkey_fish", name: "Kenkey & Fish", story: "Fermented corn dough with grilled tilapia, fresh pepper and shito.", note: "Coastal, warm, complete", image: "" },
  { key: "banku_okra", name: "Banku & Okra Stew", story: "Smooth sour banku alongside an okra stew braised with smoked fish.", note: "Eaten with the right hand", image: "" },
  { key: "peanut_soup", name: "Peanut Soup", story: "Groundnut paste, tomato, ginger and slow-cooked goat.", note: "Nkate nkwan", image: "" },
  { key: "fufu", name: "Fufu / Pounded Yam", story: "Cassava and plantain pounded to a soft elastic round.", note: "Pounded fresh", image: "" },
  { key: "fried_fish", name: "Fried Fish / Tilapia", story: "Whole tilapia scored, marinated and fried until the skin sings.", note: "Crisp, smoky, bright", image: "" },
  { key: "tuo_zaafi", name: "Tuo Zaafi", story: "Northern Ghanaian staple of soft millet or maize meal with leafy green sauce.", note: "From the north", image: "" },
];

const CONTENT_FIELDS = [
  { section: "Hero Section", icon: "🏠", imageCategory: "hero", fields: [
    { id: "hero_tagline", label: "Tagline", multiline: false },
    { id: "hero_headline_line1", label: "Headline Line 1", multiline: false },
    { id: "hero_headline_line2", label: "Headline Line 2", multiline: false },
    { id: "hero_headline_italic", label: "Headline Italic Word", multiline: false },
    { id: "hero_subheadline", label: "Sub-headline", multiline: true },
    { id: "hero_featured_dish", label: "Featured Dish Card Text", multiline: false },
  ]},
  { section: "Manifesto", icon: "✍️", imageCategory: "general", fields: [
    { id: "manifesto_text", label: "Manifesto paragraph", multiline: true },
  ]},
  { section: "Menu", icon: "🍽️", imageCategory: "menu", fields: [
    { id: "menu_headline", label: "Menu headline", multiline: false },
    { id: "menu_subtext", label: "Menu sub-text", multiline: true },
    { id: "menu_footer_note", label: "Menu footer note", multiline: true },
  ]},
  { section: "Heritage", icon: "🌍", imageCategory: "about", fields: [
    { id: "heritage_headline", label: "Headline", multiline: false },
    { id: "heritage_paragraph1", label: "Paragraph 1 (italic)", multiline: true },
    { id: "heritage_paragraph2", label: "Paragraph 2", multiline: true },
  ]},
  { section: "Locations", icon: "📍", imageCategory: "general", fields: [
    { id: "locations_headline", label: "Headline", multiline: false },
    { id: "locations_subtext", label: "Sub-text", multiline: true },
  ]},
  { section: "Peckham Branch", icon: "🏪", imageCategory: "peckham", fields: [
    { id: "peckham_address", label: "Address", multiline: false },
    { id: "peckham_phone_label", label: "Phone display text", multiline: false },
    { id: "peckham_phone_href", label: "Phone link (tel:…)", multiline: false },
    { id: "peckham_hours", label: "Opening hours", multiline: true },
  ]},
  { section: "Thornton Heath Branch", icon: "🏪", imageCategory: "thornton", fields: [
    { id: "thorntonheath_address", label: "Address", multiline: false },
    { id: "thorntonheath_phone_label", label: "Phone display text", multiline: false },
    { id: "thorntonheath_phone_href", label: "Phone link (tel:…)", multiline: false },
    { id: "thorntonheath_hours", label: "Opening hours", multiline: true },
  ]},
  { section: "Gallery", icon: "🖼️", imageCategory: "gallery", fields: [
    { id: "gallery_headline", label: "Headline", multiline: false },
    { id: "gallery_subtext", label: "Sub-text", multiline: true },
  ]},
  { section: "Reserve / Ordering", icon: "🪑", imageCategory: "general", fields: [
    { id: "ordering_headline", label: "Headline", multiline: false },
    { id: "ordering_subtext", label: "Sub-text", multiline: true },
  ]},
  { section: "Contact", icon: "📬", imageCategory: "general", fields: [
    { id: "contact_headline", label: "Headline", multiline: false },
    { id: "contact_subtext", label: "Sub-text", multiline: true },
  ]},
  { section: "Footer", icon: "🔻", imageCategory: "general", fields: [
    { id: "footer_tagline", label: "Footer tagline", multiline: false },
    { id: "instagram_url", label: "Instagram URL", multiline: false },
  ]},
];

const DESIGN_TOKENS = [
  { group: "Brand Colours", tokens: [
    { id: "color_bone", label: "Background (Bone)", type: "color", default: "#F4EFE6" },
    { id: "color_shell", label: "Shell (Alt BG)", type: "color", default: "#EBE3D4" },
    { id: "color_cocoa", label: "Cocoa (Dark / Text)", type: "color", default: "#1F1410" },
    { id: "color_clay", label: "Clay (Accent)", type: "color", default: "#B8593A" },
    { id: "color_ochre", label: "Ochre (Gold)", type: "color", default: "#D4A574" },
    { id: "color_moss", label: "Moss (Green accent)", type: "color", default: "#3B5D43" },
  ]},
  { group: "Typography", tokens: [
    { id: "font_display", label: "Display / Heading Font", type: "select", options: ["Fraunces", "Playfair Display", "Cormorant Garamond", "Libre Baskerville", "Lora", "Georgia"], default: "Fraunces" },
    { id: "font_body", label: "Body Font", type: "select", options: ["Inter", "DM Sans", "Lato", "Source Sans Pro", "Open Sans", "Nunito"], default: "Inter" },
    { id: "font_mono", label: "Mono / Label Font", type: "select", options: ["JetBrains Mono", "Space Mono", "IBM Plex Mono", "Courier New"], default: "JetBrains Mono" },
    { id: "heading_weight", label: "Heading Weight", type: "select", options: ["300 (Light)", "400 (Regular)", "500 (Medium)", "600 (Semibold)"], default: "300 (Light)" },
    { id: "body_size", label: "Body Text Size", type: "select", options: ["14px (Small)", "15px (Default)", "16px (Large)", "17px (XL)"], default: "15px (Default)" },
  ]},
  { group: "Layout & Spacing", tokens: [
    { id: "section_padding", label: "Section Vertical Padding", type: "select", options: ["Compact (py-16)", "Default (py-24)", "Spacious (py-32)", "XL (py-40)"], default: "Spacious (py-32)" },
    { id: "container_width", label: "Max Content Width", type: "select", options: ["960px (Narrow)", "1100px (Medium)", "1280px (Wide)", "1440px (Full)"], default: "1280px (Wide)" },
    { id: "border_radius", label: "Card Border Radius", type: "select", options: ["0px (Sharp)", "4px (Subtle)", "8px (Rounded)", "16px (Soft)", "24px (Pill)"], default: "0px (Sharp)" },
  ]},
  { group: "Visual Style", tokens: [
    { id: "hero_pattern_style", label: "Hero Background Style", type: "select", options: ["Radial gradient (default)", "Solid colour", "Subtle texture", "Dark overlay", "Split layout"], default: "Radial gradient (default)" },
    { id: "nav_style", label: "Navigation Style", type: "select", options: ["Transparent blur", "Solid light", "Solid dark", "Bordered"], default: "Transparent blur" },
    { id: "button_style", label: "Button Style", type: "select", options: ["Filled square", "Filled rounded", "Outline square", "Outline rounded", "Underline only"], default: "Filled square" },
    { id: "image_shape", label: "Image Shape", type: "select", options: ["Straight edges", "Soft rounded", "Circle crop", "Organic blob"], default: "Straight edges" },
    { id: "card_shadow", label: "Card Shadow", type: "select", options: ["None", "Subtle (default)", "Soft lift", "Strong lift"], default: "None" },
    { id: "animation_style", label: "Page Animations", type: "select", options: ["On (default)", "Minimal", "Off"], default: "On (default)" },
  ]},
];

const SECTION_TEMPLATES = [
  { type: "menu", label: "Menu Section", icon: "🍽️", description: "Full menu listing with categories and items" },
  { type: "gallery", label: "Photo Gallery", icon: "📸", description: "Image grid with captions" },
  { type: "testimonials", label: "Testimonials", icon: "💬", description: "Customer reviews and quotes" },
  { type: "offers", label: "Offers / Promotions", icon: "🎁", description: "Special deals and promotional blocks" },
  { type: "events", label: "Events", icon: "📅", description: "Upcoming events and calendar" },
  { type: "about", label: "About / Story", icon: "📖", description: "Brand story and heritage text" },
  { type: "team", label: "Meet the Team", icon: "👨‍🍳", description: "Staff profiles and bios" },
  { type: "cta", label: "Call to Action", icon: "🚀", description: "Prominent booking or contact prompt" },
  { type: "faq", label: "FAQ", icon: "❓", description: "Frequently asked questions" },
  { type: "press", label: "Press / Media", icon: "📰", description: "Press mentions and logos" },
];
// ─── Shared styles ───────────────────────────────────────────────
const S = {
  input: { width:"100%", padding:"0.55rem 0.8rem", border:"1.5px solid #e0d8d0", borderRadius:"6px", fontSize:"0.92rem", fontFamily:"inherit", boxSizing:"border-box" as const, background:"#fdfaf7" },
  btnPrimary: { padding:"0.65rem 1.3rem", background:"#b04a2a", color:"white", border:"none", borderRadius:"7px", fontWeight:700, cursor:"pointer", fontSize:"0.88rem" },
  btnDark: { padding:"0.55rem 1rem", background:"#2d1f14", color:"white", border:"none", borderRadius:"6px", cursor:"pointer", fontSize:"0.82rem" },
  btnGhost: { padding:"0.45rem 0.9rem", background:"transparent", color:"#2d1f14", border:"1.5px solid #e0d8d0", borderRadius:"6px", cursor:"pointer", fontSize:"0.82rem" },
  btnDanger: { padding:"0.45rem 0.8rem", background:"#dc2626", color:"white", border:"none", borderRadius:"5px", cursor:"pointer", fontSize:"0.75rem" },
  label: { display:"block" as const, fontSize:"0.75rem", fontWeight:700 as const, color:"#555", marginBottom:"0.3rem", textTransform:"uppercase" as const, letterSpacing:"0.06em" },
  hint: { margin:"0 0 0.35rem", fontSize:"0.75rem", color:"#bbb", fontStyle:"italic" as const },
  card: { background:"white", borderRadius:"10px", marginBottom:"0.75rem", boxShadow:"0 1px 5px rgba(0,0,0,0.06)", overflow:"hidden" as const },
  sectionHead: { width:"100%", display:"flex" as const, alignItems:"center" as const, justifyContent:"space-between" as const, padding:"0.9rem 1.4rem", border:"none", background:"none", cursor:"pointer", textAlign:"left" as const },
  field: { marginBottom:"1.15rem" },
  saveBtn: (saved: boolean) => ({ padding:"0.32rem 0.9rem", background: saved ? "#27ae60" : "#2d1f14", color:"white", border:"none", borderRadius:"5px", fontSize:"0.75rem", cursor:"pointer" }),
  tag: (active: boolean) => ({ padding:"0.25rem 0.65rem", border:"1.5px solid", borderColor: active ? "#b04a2a" : "#e0d8d0", background: active ? "#b04a2a" : "white", color: active ? "white" : "#555", borderRadius:"20px", cursor:"pointer", fontSize:"0.75rem", fontWeight: active ? 700 : 400 } as React.CSSProperties),
};

// ─── ImageUploader component ─────────────────────────────────────
function ImageUploader({ category, images, onUploaded, onDelete, compact = false }: {
  category: string; images: Img[]; onUploaded: () => void; onDelete: (name: string) => void; compact?: boolean;
}) {
  const [file, setFile] = useState<File|null>(null);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const upload = async () => {
    if (!file) return;
    setUploading(true); setMsg("");
    const fn = `${category}-${Date.now()}-${file.name.replace(/\s+/g,"_")}`;
    const { error } = await supabase.storage.from("images").upload(fn, file, { upsert: true });
    if (error) { setMsg("✗ " + error.message); }
    else { setMsg("✓ Uploaded!"); setFile(null); if (fileRef.current) fileRef.current.value = ""; onUploaded(); }
    setUploading(false);
    setTimeout(() => setMsg(""), 3000);
  };

  const catImgs = images.filter(i => i.category === category || category === "general");

  return (
    <div style={{ borderTop:"1px solid #f0ebe5", paddingTop:"1rem", marginTop:"0.5rem" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"0.6rem" }}>
        <span style={{ fontSize:"0.75rem", fontWeight:700, color:"#b04a2a", textTransform:"uppercase", letterSpacing:"0.05em" }}>
          🖼 Images ({catImgs.length})
        </span>
      </div>
      <div style={{ display:"flex", gap:"0.5rem", alignItems:"center", marginBottom:"0.75rem", flexWrap:"wrap" }}>
        <input ref={fileRef} type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0]||null)}
          style={{ fontSize:"0.82rem", flex:1, minWidth:"0" }} />
        <button onClick={upload} disabled={uploading||!file}
          style={{ ...S.btnPrimary, opacity: uploading||!file ? 0.5 : 1, cursor: uploading||!file ? "not-allowed" : "pointer", padding:"0.5rem 0.9rem", fontSize:"0.8rem", whiteSpace:"nowrap" as const }}>
          {uploading ? "…" : "Upload"}
        </button>
      </div>
      {msg && <div style={{ fontSize:"0.8rem", padding:"0.35rem 0.6rem", background: msg.startsWith("✓") ? "#e8f8ee" : "#fee8e8", borderRadius:"5px", marginBottom:"0.6rem", color: msg.startsWith("✓") ? "#1a7a3a" : "#c00" }}>{msg}</div>}
      {catImgs.length > 0 && (
        <div style={{ display:"grid", gridTemplateColumns: compact ? "repeat(auto-fill, minmax(90px,1fr))" : "repeat(auto-fill, minmax(130px,1fr))", gap:"0.5rem" }}>
          {catImgs.map(img => (
            <div key={img.name} style={{ position:"relative", borderRadius:"6px", overflow:"hidden", boxShadow:"0 1px 3px rgba(0,0,0,0.1)" }}>
              <img src={img.url} alt="" style={{ width:"100%", height: compact ? "70px" : "90px", objectFit:"cover", display:"block" }} />
              <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0)", display:"flex", alignItems:"flex-end", padding:"0.3rem", gap:"0.25rem", opacity:0, transition:"opacity 0.15s" }}
                onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.opacity="1"}
                onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.opacity="0"}>
                <button onClick={() => { navigator.clipboard.writeText(img.url).catch(()=>{}); setMsg("✓ URL copied"); setTimeout(()=>setMsg(""),2000); }}
                  style={{ flex:1, padding:"0.25rem", background:"#2d1f14", color:"white", border:"none", borderRadius:"4px", cursor:"pointer", fontSize:"0.65rem" }}>Copy</button>
                <button onClick={() => onDelete(img.name)}
                  style={{ flex:1, padding:"0.25rem", background:"#dc2626", color:"white", border:"none", borderRadius:"4px", cursor:"pointer", fontSize:"0.65rem" }}>Del</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── SaveBtn ─────────────────────────────────────────────────────
function SaveBtn({ fieldId, saving, saved, onClick }: { fieldId: string; saving: string|null; saved: string|null; onClick: () => void }) {
  return (
    <button onClick={onClick} disabled={saving !== null}
      style={S.saveBtn(saved === fieldId)}>
      {saving === fieldId ? "…" : saved === fieldId ? "✓ Saved" : "Save"}
    </button>
  );
}

// ─── Field ───────────────────────────────────────────────────────
function Field({ field, content, setContent, saving, saved, onSave }: any) {
  return (
    <div style={S.field}>
      <label style={S.label}>{field.label}</label>
      {field.multiline
        ? <textarea value={content[field.id]||""} onChange={e => setContent((p:any)=>({...p,[field.id]:e.target.value}))} rows={3} style={{...S.input, resize:"vertical"}} />
        : <input type="text" value={content[field.id]||""} onChange={e => setContent((p:any)=>({...p,[field.id]:e.target.value}))} style={S.input} />
      }
      <div style={{ display:"flex", justifyContent:"flex-end", marginTop:"0.3rem" }}>
        <SaveBtn fieldId={field.id} saving={saving} saved={saved} onClick={onSave} />
      </div>
    </div>
  );
}
// ─── MAIN ADMIN COMPONENT ────────────────────────────────────────────────────
export default function Admin() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState('');
  const [tab, setTab] = useState('content');
  const [openSec, setOpenSec] = useState<Record<string,boolean>>({'Hero Section':true});

  // Content
  const [content, setContent] = useState<Record<string,string>>({});
  const [saving, setSaving] = useState<string|null>(null);
  const [savedField, setSavedField] = useState<string|null>(null);
  const [loadingContent, setLoadingContent] = useState(false);
  const [globalSave, setGlobalSave] = useState<'idle'|'saving'|'saved'|'error'>('idle');

  // Images (global tab)
  const [imgFile, setImgFile] = useState<File|null>(null);
  const [imgCat, setImgCat] = useState('gallery');
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [imgMsg, setImgMsg] = useState('');
  const [loadingImgs, setLoadingImgs] = useState(false);
  const [filterCat, setFilterCat] = useState('all');

  // Dishes
  const [dishImages, setDishImages] = useState<Record<string,string>>({});
  const [dishUploading, setDishUploading] = useState<Record<string,boolean>>({});
  const [dishMsg, setDishMsg] = useState<Record<string,string>>({});

  // Design
  const [design, setDesign] = useState<Record<string,string>>({});
  const [designSaving, setDesignSaving] = useState(false);
  const [designSaved, setDesignSaved] = useState(false);

  // Sections
  const [activeSections, setActiveSections] = useState<CustomSection[]>([]);
  const [sectionSaving, setSectionSaving] = useState(false);

  // Settings
  const [settings, setSettings] = useState<Record<string,string>>({});
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);

  const loadContent = async () => {
    setLoadingContent(true);
    const { data } = await supabase.from('site_content').select('id,value');
    if (data) {
      const map: Record<string,string> = {};
      const des: Record<string,string> = {};
      const set: Record<string,string> = {};
      const dishImg: Record<string,string> = {};
      data.forEach((r: ContentItem) => {
        if (r.id.startsWith('design__')) des[r.id.replace('design__','')] = r.value;
        else if (r.id.startsWith('settings__')) set[r.id.replace('settings__','')] = r.value;
        else if (r.id.startsWith('dish_img__')) dishImg[r.id.replace('dish_img__','')] = r.value;
        else map[r.id] = r.value;
      });
      setContent(map);
      setDesign(prev => ({ ...DESIGN_TOKENS.reduce((a,t)=>({...a,[t.key]:t.default}),{}), ...des }));
      setSettings(prev => ({
        site_name:'Agrobeso', tagline:'Authentic Ghanaian & West African Food',
        meta_description:'Home-style dishes, bold flavours, generous portions from Peckham to Thornton Heath.',
        instagram:'#', facebook:'#', tiktok:'#', twitter:'#', whatsapp:'',
        email:'', phone_peckham:'', phone_thornton:'', ...set
      }));
      setDishImages(dishImg);
    }
    setLoadingContent(false);
  };

  const loadImages = async () => {
    setLoadingImgs(true);
    const { data, error } = await supabase.storage.from('images').list('',{limit:200,sortBy:{column:'created_at',order:'desc'}});
    if (!error && data) {
      setImages(data.filter((f:any)=>f.name!=='.emptyFolderPlaceholder').map((f:any)=>({
        name: f.name,
        url: AGROBESO_STORAGE_URL+'/'+f.name,
        category: f.name.split('-')[0] || 'general'
      })));
    }
    setLoadingImgs(false);
  };

  const loadActiveSections = async () => {
    const { data } = await supabase.from('site_content').select('id,value').eq('id','sections__active');
    if (data && data[0]) {
      try { setActiveSections(JSON.parse(data[0].value)); } catch(e){}
    }
  };

  useEffect(() => {
    if (authed) { loadContent(); loadImages(); loadActiveSections(); }
  }, [authed]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pw === ADMIN_PASSWORD) setAuthed(true);
    else alert('Incorrect password');
  };

  const saveField = async (fieldId: string) => {
    setSaving(fieldId);
    const { error } = await supabase.from('site_content').upsert(
      { id: fieldId, value: content[fieldId]||'', updated_at: new Date().toISOString() },
      { onConflict: 'id' }
    );
    setSaving(null);
    if (!error) { setSavedField(fieldId); setTimeout(()=>setSavedField(null),2500); }
    else alert('Save failed: '+error.message);
  };

  const saveAll = async () => {
    setGlobalSave('saving');
    const upserts = CONTENT_FIELDS.flatMap(s=>s.fields)
      .filter(f=>content[f.id]!==undefined)
      .map(f=>({ id:f.id, value:content[f.id]||'', updated_at:new Date().toISOString() }));
    if (!upserts.length) { setGlobalSave('idle'); return; }
    const { error } = await supabase.from('site_content').upsert(upserts,{onConflict:'id'});
    setGlobalSave(error ? 'error' : 'saved');
    setTimeout(()=>setGlobalSave('idle'),3000);
  };

  const handleImgUpload = async () => {
    if (!imgFile) return;
    setUploading(true); setImgMsg('');
    const fileName = imgCat+'-'+Date.now()+'-'+imgFile.name.replace(/\s+/g,'_');
    const { error } = await supabase.storage.from('images').upload(fileName, imgFile, {upsert:true});
    if (error) setImgMsg('Upload failed: '+error.message);
    else { setImgMsg('Uploaded successfully!'); setImgFile(null); await loadImages(); }
    setUploading(false);
  };

  const handleDeleteImage = async (name: string) => {
    if (!confirm('Delete this image?')) return;
    const { error } = await supabase.storage.from('images').remove([name]);
    if (!error) await loadImages();
    else alert('Delete failed: '+error.message);
  };

  const handleDishImgUpload = async (dish: DishDef, file: File) => {
    const slug = dish.slug;
    setDishUploading(p=>({...p,[slug]:true}));
    setDishMsg(p=>({...p,[slug]:''}));
    const fileName = 'dish-'+slug+'-'+Date.now()+'.'+file.name.split('.').pop();
    const { error: upErr } = await supabase.storage.from('images').upload(fileName, file, {upsert:true});
    if (upErr) { setDishMsg(p=>({...p,[slug]:'Upload failed: '+upErr.message})); setDishUploading(p=>({...p,[slug]:false})); return; }
    const url = AGROBESO_STORAGE_URL+'/'+fileName;
    const { error: dbErr } = await supabase.from('site_content').upsert(
      {id:'dish_img__'+slug, value:url, updated_at:new Date().toISOString()},{onConflict:'id'}
    );
    if (dbErr) setDishMsg(p=>({...p,[slug]:'Saved image but DB update failed'}));
    else { setDishImages(p=>({...p,[slug]:url})); setDishMsg(p=>({...p,[slug]:'Image updated!'})); }
    setDishUploading(p=>({...p,[slug]:false}));
    setTimeout(()=>setDishMsg(p=>({...p,[slug]:''})),3000);
  };

  const saveDesign = async () => {
    setDesignSaving(true);
    const upserts = Object.entries(design).map(([k,v])=>({id:'design__'+k, value:v, updated_at:new Date().toISOString()}));
    await supabase.from('site_content').upsert(upserts,{onConflict:'id'});
    setDesignSaving(false); setDesignSaved(true);
    setTimeout(()=>setDesignSaved(false),2500);
  };

  const addSection = async (tpl: SectionTemplate) => {
    const newSec: CustomSection = { id: tpl.key+'_'+Date.now(), type: tpl.key, title: tpl.title, visible: true, items: [] };
    const updated = [...activeSections, newSec];
    setActiveSections(updated);
    setSectionSaving(true);
    await supabase.from('site_content').upsert({id:'sections__active', value:JSON.stringify(updated), updated_at:new Date().toISOString()},{onConflict:'id'});
    setSectionSaving(false);
  };

  const toggleSection = (id: string) => {
    const updated = activeSections.map(s=>s.id===id?{...s,visible:!s.visible}:s);
    setActiveSections(updated);
    supabase.from('site_content').upsert({id:'sections__active',value:JSON.stringify(updated),updated_at:new Date().toISOString()},{onConflict:'id'});
  };

  const deleteSection = async (id: string) => {
    if (!confirm('Remove this section?')) return;
    const updated = activeSections.filter(s=>s.id!==id);
    setActiveSections(updated);
    await supabase.from('site_content').upsert({id:'sections__active',value:JSON.stringify(updated),updated_at:new Date().toISOString()},{onConflict:'id'});
  };

  const saveSettings = async () => {
    setSettingsSaving(true);
    const upserts = Object.entries(settings).map(([k,v])=>({id:'settings__'+k,value:v,updated_at:new Date().toISOString()}));
    await supabase.from('site_content').upsert(upserts,{onConflict:'id'});
    setSettingsSaving(false); setSettingsSaved(true);
    setTimeout(()=>setSettingsSaved(false),2500);
  };

  const filteredImages = filterCat==='all' ? images : images.filter(i=>i.category===filterCat);
  const imageCats = ['all', ...Array.from(new Set(images.map(i=>i.category)))];

  // ─── LOGIN ──────────────────────────────────────────────────────────────────
  if (!authed) return (
    <div style={{minHeight:'100vh',background:'#f5f0eb',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{background:'white',padding:'2.5rem',borderRadius:'14px',boxShadow:'0 4px 32px rgba(0,0,0,0.1)',width:'360px',maxWidth:'90vw'}}>
        <p style={{fontFamily:'monospace',fontSize:'0.7rem',letterSpacing:'0.1em',textTransform:'uppercase',color:'#b04a2a',marginBottom:'0.5rem'}}>Agrobeso</p>
        <h1 style={{fontSize:'1.75rem',fontWeight:400,margin:'0 0 0.25rem',color:'#2d1f14'}}>Admin Dashboard</h1>
        <p style={{color:'#aaa',marginBottom:'1.75rem',fontSize:'0.9rem'}}>Enter your password to continue.</p>
        <form onSubmit={handleLogin}>
          <input type="password" placeholder="Admin password" value={pw} onChange={e=>setPw(e.target.value)}
            style={{width:'100%',padding:'0.7rem 0.9rem',border:'1.5px solid #e0d8d0',borderRadius:'8px',fontSize:'0.95rem',boxSizing:'border-box',marginBottom:'1rem',background:'#fdfaf7'}} autoFocus />
          <button type="submit" style={S.btnPrimary as React.CSSProperties}>Sign in</button>
        </form>
      </div>
    </div>
  );

  // ─── MAIN LAYOUT ────────────────────────────────────────────────────────────
  const TABS = [
    {id:'content', icon:'✏️', label:'Content'},
    {id:'images', icon:'🖼️', label:'Images'},
    {id:'dishes', icon:'🍽️', label:'Dishes'},
    {id:'design', icon:'🎨', label:'Design Studio'},
    {id:'sections', icon:'➕', label:'Sections'},
    {id:'settings', icon:'⚙️', label:'Settings'},
    {id:'help', icon:'💡', label:'Help & Tips'},
  ];

  return (
    <div style={{minHeight:'100vh',background:'#f5f0eb',display:'flex',flexDirection:'column'}}>
      {/* TOP BAR */}
      <div style={{background:'#2d1f14',color:'white',padding:'0.8rem 1.5rem',display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:200}}>
        <div style={{display:'flex',alignItems:'center',gap:'0.75rem'}}>
          <span style={{fontFamily:'Georgia,serif',fontSize:'1.15rem',fontWeight:300}}>Agrobeso</span>
          <span style={{fontSize:'0.72rem',opacity:0.45,textTransform:'uppercase',letterSpacing:'0.1em'}}>Admin</span>
        </div>
        <a href="/" target="_blank" rel="noreferrer" style={{color:'#f0c070',textDecoration:'none',fontSize:'0.82rem'}}>View website ↗</a>
      </div>

      <div style={{display:'flex',flex:1}}>
        {/* SIDEBAR */}
        <nav style={{width:'200px',flexShrink:0,background:'#2d1f14',minHeight:'calc(100vh - 46px)',position:'sticky',top:'46px',height:'calc(100vh - 46px)',overflowY:'auto'}}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{
              width:'100%',display:'flex',alignItems:'center',gap:'0.65rem',
              padding:'0.85rem 1.1rem',border:'none',background:tab===t.id?'rgba(176,74,42,0.25)':'transparent',
              color:tab===t.id?'#f0c070':'rgba(255,255,255,0.65)',
              cursor:'pointer',fontSize:'0.82rem',textAlign:'left',
              borderLeft:tab===t.id?'3px solid #b04a2a':'3px solid transparent',
              transition:'all 0.15s'
            }}>
              <span style={{fontSize:'1rem'}}>{t.icon}</span>
              <span style={{fontWeight:tab===t.id?700:400}}>{t.label}</span>
            </button>
          ))}
          <div style={{marginTop:'auto',padding:'1.5rem 1rem',borderTop:'1px solid rgba(255,255,255,0.08)',marginTop:'2rem'}}>
            <p style={{color:'rgba(255,255,255,0.3)',fontSize:'0.68rem',lineHeight:1.5}}>
              Changes save to Supabase.<br/>Site updates in ~30s on Vercel.
            </p>
          </div>
        </nav>

        {/* MAIN CONTENT AREA */}
        <main style={{flex:1,padding:'2rem',maxWidth:'900px',overflowX:'hidden'}}>

          {/* ═══ CONTENT TAB ════════════════════════════════════════════════ */}
          {tab==='content' && (
            <div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'1.75rem',gap:'1rem',flexWrap:'wrap'}}>
                <div>
                  <h2 style={S.h2}>Edit Website Text</h2>
                  <p style={S.hint}>Click a section to expand. Save individually or use Save All.</p>
                </div>
                <div style={{display:'flex',gap:'0.75rem'}}>
                  <button onClick={loadContent} style={S.btnSecondary as React.CSSProperties}>↻ Reload</button>
                  <button onClick={saveAll} disabled={globalSave==='saving'} style={{...S.btnPrimary,opacity:globalSave==='saving'?0.7:1} as React.CSSProperties}>
                    {globalSave==='saving'?'Saving…':globalSave==='saved'?'✓ All Saved!':globalSave==='error'?'✗ Error':'Save All Changes'}
                  </button>
                </div>
              </div>
              {loadingContent
                ? <div style={{textAlign:'center',padding:'4rem',color:'#999'}}>Loading content…</div>
                : CONTENT_FIELDS.map(sec => {
                    const isOpen = !!openSec[sec.section];
                    return (
                      <div key={sec.section} style={S.card}>
                        <button onClick={()=>setOpenSec(p=>({...p,[sec.section]:!p[sec.section]}))} style={S.accordionBtn as React.CSSProperties}>
                          <span style={{display:'flex',alignItems:'center',gap:'0.6rem'}}>
                            <span style={{fontSize:'1.1rem'}}>{sec.icon}</span>
                            <span style={{fontWeight:700,color:'#2d1f14',fontSize:'0.92rem'}}>{sec.section}</span>
                            <span style={{fontSize:'0.72rem',color:'#bbb'}}>({sec.fields.length} fields)</span>
                          </span>
                          <span style={{color:'#b04a2a',fontSize:'0.8rem'}}>{isOpen?'▲':'▼'}</span>
                        </button>
                        {isOpen && (
                          <div style={{padding:'0.75rem 1.25rem 1.5rem',borderTop:'1px solid #f0ebe5'}}>
                            {sec.fields.map(f => (
                              <Field key={f.id} label={f.label} hint={f.hint||''} multiline={f.multiline}
                                value={content[f.id]||''} onChange={v=>setContent(p=>({...p,[f.id]:v}))}
                                onSave={()=>saveField(f.id)} saving={saving===f.id} saved={savedField===f.id} />
                            ))}
                            <div style={{marginTop:'1.25rem',paddingTop:'1rem',borderTop:'1px dashed #e8e0d8'}}>
                              <p style={{fontSize:'0.75rem',color:'#bbb',marginBottom:'0.5rem',textTransform:'uppercase',letterSpacing:'0.06em',fontWeight:600}}>Section Image</p>
                              <ImageUploader
                                path={'section-'+sec.section.toLowerCase().replace(/\s+/g,'-')}
                                currentUrl={content['img__'+sec.section.toLowerCase().replace(/\s+/g,'_')]||''}
                                onUploaded={url=>{
                                  const key='img__'+sec.section.toLowerCase().replace(/\s+/g,'_');
                                  setContent(p=>({...p,[key]:url}));
                                  supabase.from('site_content').upsert({id:key,value:url,updated_at:new Date().toISOString()},{onConflict:'id'});
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

          {/* ═══ IMAGES TAB ═════════════════════════════════════════════════ */}
          {tab==='images' && (
            <div>
              <h2 style={S.h2}>Manage Images</h2>
              <p style={{...S.hint,marginBottom:'1.5rem'}}>Upload and manage all site images. Categories keep things organised.</p>
              <div style={S.card}>
                <h3 style={{margin:'0 0 1rem',color:'#2d1f14',fontSize:'1rem',fontWeight:700}}>Upload a New Image</h3>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem',marginBottom:'1rem'}}>
                  <div>
                    <label style={S.fieldLabel as React.CSSProperties}>Category</label>
                    <select value={imgCat} onChange={e=>setImgCat(e.target.value)} style={S.input as React.CSSProperties}>
                      {['gallery','hero','menu','about','event','general','dishes'].map(c=><option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={S.fieldLabel as React.CSSProperties}>Image file</label>
                    <input type="file" accept="image/*" onChange={e=>setImgFile(e.target.files?.[0]||null)} style={{fontSize:'0.88rem',paddingTop:'0.45rem'}} />
                  </div>
                </div>
                {imgFile && <p style={{fontSize:'0.82rem',padding:'0.4rem 0.7rem',background:'#f5f0ea',borderRadius:'5px',marginBottom:'0.75rem'}}>📎 {imgFile.name} ({(imgFile.size/1024).toFixed(0)} KB)</p>}
                <button onClick={handleImgUpload} disabled={uploading||!imgFile} style={{...S.btnPrimary,opacity:uploading||!imgFile?0.5:1,cursor:uploading||!imgFile?'not-allowed':'pointer'} as React.CSSProperties}>
                  {uploading?'Uploading…':'⬆ Upload Image'}
                </button>
                {imgMsg && <p style={{marginTop:'0.6rem',padding:'0.5rem 0.8rem',background:imgMsg.includes('fail')?'#fee8e8':'#e8f8ee',borderRadius:'6px',fontSize:'0.85rem',color:imgMsg.includes('fail')?'#c00':'#1a7a3a'}}>{imgMsg}</p>}
              </div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',margin:'1.5rem 0 0.75rem',flexWrap:'wrap',gap:'0.5rem'}}>
                <h3 style={{margin:0,color:'#2d1f14',fontSize:'1rem'}}>Uploaded Images ({filteredImages.length})</h3>
                <div style={{display:'flex',gap:'0.4rem',flexWrap:'wrap'}}>
                  {imageCats.map(c=>(
                    <button key={c} onClick={()=>setFilterCat(c)} style={{padding:'0.25rem 0.7rem',border:'1.5px solid',borderColor:filterCat===c?'#b04a2a':'#e0d8d0',background:filterCat===c?'#b04a2a':'white',color:filterCat===c?'white':'#555',borderRadius:'20px',cursor:'pointer',fontSize:'0.72rem'}}>{c}</button>
                  ))}
                  <button onClick={loadImages} style={{padding:'0.25rem 0.7rem',background:'#2d1f14',color:'white',border:'none',borderRadius:'20px',cursor:'pointer',fontSize:'0.72rem'}}>↻</button>
                </div>
              </div>
              {loadingImgs
                ? <div style={{textAlign:'center',padding:'3rem',color:'#999'}}>Loading…</div>
                : filteredImages.length===0
                  ? <div style={{textAlign:'center',padding:'3rem',color:'#bbb',background:'white',borderRadius:'10px'}}>No images {filterCat!=='all'?'in "'+filterCat+'"':'uploaded yet'}.</div>
                  : <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))',gap:'0.85rem'}}>
                      {filteredImages.map(img=>(
                        <div key={img.name} style={{background:'white',borderRadius:'10px',overflow:'hidden',boxShadow:'0 1px 4px rgba(0,0,0,0.07)'}}>
                          <img src={img.url} alt={img.name} style={{width:'100%',height:'120px',objectFit:'cover',display:'block'}} />
                          <div style={{padding:'0.55rem 0.65rem'}}>
                            <div style={{fontSize:'0.68rem',color:'#b04a2a',fontWeight:700,textTransform:'uppercase',marginBottom:'0.35rem'}}>{img.category}</div>
                            <div style={{display:'flex',gap:'0.35rem'}}>
                              <button onClick={()=>{navigator.clipboard.writeText(img.url).catch(()=>{});setImgMsg('URL copied!');setTimeout(()=>setImgMsg(''),2000);}} style={{flex:1,padding:'0.3rem',background:'#2d1f14',color:'white',border:'none',borderRadius:'5px',cursor:'pointer',fontSize:'0.68rem'}}>Copy URL</button>
                              <button onClick={()=>handleDeleteImage(img.name)} style={{flex:1,padding:'0.3rem',background:'#dc2626',color:'white',border:'none',borderRadius:'5px',cursor:'pointer',fontSize:'0.68rem'}}>Delete</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
              }
            </div>
          )}

          {/* ═══ DISHES TAB ══════════════════════════════════════════════════ */}
          {tab==='dishes' && (
            <div>
              <h2 style={S.h2}>Manage Dishes</h2>
              <p style={{...S.hint,marginBottom:'1.5rem'}}>Edit each dish story, note, and upload a photo. Changes save to the website immediately.</p>
              {loadingContent
                ? <div style={{textAlign:'center',padding:'4rem',color:'#999'}}>Loading…</div>
                : DISHES.map((dish,i) => (
                    <div key={dish.slug} style={{...S.card,marginBottom:'1.25rem'}}>
                      <div style={{display:'flex',alignItems:'flex-start',gap:'1.25rem',flexWrap:'wrap'}}>
                        {/* Dish image */}
                        <div style={{flexShrink:0}}>
                          {dishImages[dish.slug]
                            ? <img src={dishImages[dish.slug]} alt={dish.name} style={{width:'120px',height:'90px',objectFit:'cover',borderRadius:'8px',display:'block'}} />
                            : <div style={{width:'120px',height:'90px',background:'#f0ebe5',borderRadius:'8px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'2rem'}}>🍽️</div>
                          }
                          <label style={{display:'block',marginTop:'0.5rem',fontSize:'0.7rem',color:'#999',textAlign:'center',cursor:'pointer'}}>
                            Change photo
                            <input type="file" accept="image/*" style={{display:'none'}} onChange={e=>{
                              const f=e.target.files?.[0];
                              if(f) handleDishImgUpload(dish,f);
                            }} />
                          </label>
                          {dishUploading[dish.slug] && <p style={{fontSize:'0.68rem',color:'#b04a2a',textAlign:'center',margin:'0.25rem 0 0'}}>Uploading…</p>}
                          {dishMsg[dish.slug] && <p style={{fontSize:'0.68rem',color:dishMsg[dish.slug].includes('fail')?'#c00':'#1a7a3a',textAlign:'center',margin:'0.25rem 0 0'}}>{dishMsg[dish.slug]}</p>}
                        </div>
                        {/* Dish fields */}
                        <div style={{flex:1,minWidth:'220px'}}>
                          <p style={{fontFamily:'Georgia,serif',fontSize:'1.15rem',fontWeight:400,color:'#2d1f14',margin:'0 0 0.25rem'}}>{String(i+1).padStart(2,'0')}. {dish.name}</p>
                          <div style={{marginBottom:'0.75rem'}}>
                            <label style={S.fieldLabel as React.CSSProperties}>Story</label>
                            <textarea value={content['dish_'+dish.slug+'_story']||''} rows={3}
                              onChange={e=>setContent(p=>({...p,['dish_'+dish.slug+'_story']:e.target.value}))}
                              style={{...S.input as any,resize:'vertical',width:'100%'}}
                              placeholder="Short description shown under the dish name…" />
                          </div>
                          <div style={{display:'flex',gap:'0.75rem',flexWrap:'wrap'}}>
                            <div style={{flex:1,minWidth:'150px'}}>
                              <label style={S.fieldLabel as React.CSSProperties}>Note / origin</label>
                              <input type="text" value={content['dish_'+dish.slug+'_note']||''}
                                onChange={e=>setContent(p=>({...p,['dish_'+dish.slug+'_note']:e.target.value}))}
                                style={{...S.input as any,width:'100%'}} placeholder="e.g. A dish of celebration" />
                            </div>
                            <div style={{flex:1,minWidth:'150px'}}>
                              <label style={S.fieldLabel as React.CSSProperties}>Price (optional)</label>
                              <input type="text" value={content['dish_'+dish.slug+'_price']||''}
                                onChange={e=>setContent(p=>({...p,['dish_'+dish.slug+'_price']:e.target.value}))}
                                style={{...S.input as any,width:'100%'}} placeholder="e.g. £12.50" />
                            </div>
                          </div>
                          <div style={{display:'flex',justifyContent:'flex-end',marginTop:'0.75rem',gap:'0.5rem'}}>
                            <button onClick={async()=>{
                              setSaving('dish_'+dish.slug);
                              const upserts=['story','note','price'].map(k=>({id:'dish_'+dish.slug+'_'+k,value:content['dish_'+dish.slug+'_'+k]||'',updated_at:new Date().toISOString()}));
                              await supabase.from('site_content').upsert(upserts,{onConflict:'id'});
                              setSaving(null);setSavedField('dish_'+dish.slug);setTimeout(()=>setSavedField(null),2500);
                            }} disabled={saving!==null} style={{...S.btnPrimary,fontSize:'0.78rem',padding:'0.4rem 1rem'} as React.CSSProperties}>
                              {saving==='dish_'+dish.slug?'Saving…':savedField==='dish_'+dish.slug?'✓ Saved':'Save'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
              }
            </div>
          )}

          {/* ═══ DESIGN STUDIO TAB ══════════════════════════════════════════ */}
          {tab==='design' && (
            <div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'1.75rem',flexWrap:'wrap',gap:'1rem'}}>
                <div>
                  <h2 style={S.h2}>Design Studio</h2>
                  <p style={S.hint}>Customise the look and feel of your website. Changes apply live after saving.</p>
                </div>
                <button onClick={saveDesign} disabled={designSaving} style={{...S.btnPrimary,opacity:designSaving?0.7:1} as React.CSSProperties}>
                  {designSaving?'Saving…':designSaved?'✓ Saved!':'Save Design'}
                </button>
              </div>
              {DESIGN_TOKENS.map(group => (
                <div key={group.group} style={{...S.card,marginBottom:'1.25rem'}}>
                  <h3 style={{margin:'0 0 1rem',color:'#2d1f14',fontSize:'0.95rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em'}}>{group.group}</h3>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:'1rem'}}>
                    {group.tokens.map((t:DesignToken) => (
                      <div key={t.key}>
                        <label style={{...S.fieldLabel as any,display:'block'}}>{t.label}</label>
                        {t.type==='color' && (
                          <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
                            <input type="color" value={design[t.key]||t.default}
                              onChange={e=>setDesign(p=>({...p,[t.key]:e.target.value}))}
                              style={{width:'42px',height:'36px',border:'none',padding:'2px',cursor:'pointer',borderRadius:'4px'}} />
                            <input type="text" value={design[t.key]||t.default}
                              onChange={e=>setDesign(p=>({...p,[t.key]:e.target.value}))}
                              style={{...S.input as any,flex:1,fontFamily:'monospace',fontSize:'0.85rem'}} />
                          </div>
                        )}
                        {t.type==='select' && (
                          <select value={design[t.key]||t.default} onChange={e=>setDesign(p=>({...p,[t.key]:e.target.value}))} style={S.input as React.CSSProperties}>
                            {t.options?.map((o:string)=><option key={o} value={o}>{o}</option>)}
                          </select>
                        )}
                        {t.type==='range' && (
                          <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
                            <input type="range" min={t.min} max={t.max} step={t.step||1}
                              value={parseInt(design[t.key]||t.default)||t.min}
                              onChange={e=>setDesign(p=>({...p,[t.key]:e.target.value}))}
                              style={{flex:1}} />
                            <span style={{fontSize:'0.85rem',color:'#555',minWidth:'30px'}}>{design[t.key]||t.default}px</span>
                          </div>
                        )}
                        {t.hint && <p style={{fontSize:'0.7rem',color:'#bbb',margin:'0.25rem 0 0'}}>{t.hint}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ═══ SECTIONS BUILDER TAB ══════════════════════════════════════ */}
          {tab==='sections' && (
            <div>
              <h2 style={S.h2}>Section Builder</h2>
              <p style={{...S.hint,marginBottom:'1.5rem'}}>Add new content sections to your website. Click a template to add it, then toggle visibility or remove anytime.</p>
              <h3 style={{fontSize:'0.8rem',textTransform:'uppercase',letterSpacing:'0.08em',color:'#888',marginBottom:'0.75rem',fontWeight:700}}>Add a New Section</h3>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))',gap:'0.75rem',marginBottom:'2rem'}}>
                {SECTION_TEMPLATES.map(tpl=>(
                  <button key={tpl.key} onClick={()=>addSection(tpl)} style={{
                    background:'white',border:'1.5px solid #e0d8d0',borderRadius:'10px',
                    padding:'1rem 0.75rem',cursor:'pointer',textAlign:'center',
                    transition:'all 0.15s',boxShadow:'0 1px 3px rgba(0,0,0,0.05)'
                  }}
                  onMouseEnter={e=>{(e.target as any).style.borderColor='#b04a2a';(e.target as any).style.background='#fff8f5';}}
                  onMouseLeave={e=>{(e.target as any).style.borderColor='#e0d8d0';(e.target as any).style.background='white';}}>
                    <div style={{fontSize:'1.6rem',marginBottom:'0.4rem'}}>{tpl.icon}</div>
                    <div style={{fontSize:'0.78rem',fontWeight:700,color:'#2d1f14'}}>{tpl.title}</div>
                    <div style={{fontSize:'0.68rem',color:'#aaa',marginTop:'0.25rem'}}>{tpl.description}</div>
                  </button>
                ))}
              </div>

              <h3 style={{fontSize:'0.8rem',textTransform:'uppercase',letterSpacing:'0.08em',color:'#888',marginBottom:'0.75rem',fontWeight:700}}>
                Active Custom Sections ({activeSections.length})
                {sectionSaving && <span style={{marginLeft:'0.5rem',color:'#b04a2a',fontWeight:400,fontSize:'0.72rem'}}>Saving…</span>}
              </h3>
              {activeSections.length===0
                ? <div style={{background:'white',borderRadius:'10px',padding:'2.5rem',textAlign:'center',color:'#bbb'}}>No custom sections added yet. Click a template above to add one.</div>
                : activeSections.map(sec=>(
                    <div key={sec.id} style={{...S.card,display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'0.75rem',marginBottom:'0.6rem'}}>
                      <div style={{display:'flex',alignItems:'center',gap:'0.75rem'}}>
                        <span style={{fontSize:'1.2rem'}}>{SECTION_TEMPLATES.find(t=>t.key===sec.type)?.icon||'📦'}</span>
                        <div>
                          <p style={{margin:0,fontWeight:700,color:'#2d1f14',fontSize:'0.9rem'}}>{sec.title}</p>
                          <p style={{margin:0,fontSize:'0.72rem',color:'#aaa',textTransform:'uppercase',letterSpacing:'0.05em'}}>{sec.type}</p>
                        </div>
                      </div>
                      <div style={{display:'flex',alignItems:'center',gap:'0.75rem'}}>
                        <div style={{display:'flex',alignItems:'center',gap:'0.4rem'}}>
                          <span style={{fontSize:'0.75rem',color:'#888'}}>Visible</span>
                          <div onClick={()=>toggleSection(sec.id)} style={{
                            width:'38px',height:'20px',borderRadius:'10px',cursor:'pointer',
                            background:sec.visible?'#27ae60':'#e0d8d0',position:'relative',transition:'background 0.2s'
                          }}>
                            <div style={{
                              position:'absolute',top:'2px',left:sec.visible?'20px':'2px',
                              width:'16px',height:'16px',borderRadius:'50%',background:'white',
                              transition:'left 0.2s',boxShadow:'0 1px 3px rgba(0,0,0,0.2)'
                            }} />
                          </div>
                        </div>
                        <button onClick={()=>deleteSection(sec.id)} style={{padding:'0.3rem 0.7rem',background:'#fee8e8',color:'#dc2626',border:'1px solid #fca5a5',borderRadius:'5px',cursor:'pointer',fontSize:'0.75rem',fontWeight:600}}>Remove</button>
                      </div>
                    </div>
                  ))
              }
              <div style={{marginTop:'1.5rem',padding:'1rem',background:'#fffbf0',borderRadius:'8px',border:'1px solid #fde68a'}}>
                <p style={{margin:0,fontSize:'0.8rem',color:'#92400e'}}>
                  💡 <strong>Note:</strong> Adding sections here stores them in the database. The website will display active sections automatically once the HomePage is updated. This feature is being deployed progressively.
                </p>
              </div>
            </div>
          )}

          {/* ═══ SETTINGS TAB ════════════════════════════════════════════════ */}
          {tab==='settings' && (
            <div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'1.75rem',flexWrap:'wrap',gap:'1rem'}}>
                <div>
                  <h2 style={S.h2}>Site Settings</h2>
                  <p style={S.hint}>Manage site info, social links, contact details and SEO.</p>
                </div>
                <button onClick={saveSettings} disabled={settingsSaving} style={{...S.btnPrimary,opacity:settingsSaving?0.7:1} as React.CSSProperties}>
                  {settingsSaving?'Saving…':settingsSaved?'✓ Saved!':'Save Settings'}
                </button>
              </div>
              {[
                {group:'Site Identity',fields:[
                  {key:'site_name',label:'Site Name',hint:'Appears in browser tab and SEO'},
                  {key:'tagline',label:'Tagline',hint:'Short descriptor'},
                  {key:'meta_description',label:'Meta Description',hint:'SEO description (150–160 chars)',multi:true},
                ]},
                {group:'Contact Details',fields:[
                  {key:'email',label:'Contact Email',hint:''},
                  {key:'phone_peckham',label:'Peckham Phone',hint:''},
                  {key:'phone_thornton',label:'Thornton Heath Phone',hint:''},
                ]},
                {group:'Social Media',fields:[
                  {key:'instagram',label:'Instagram URL',hint:'Full URL including https://'},
                  {key:'facebook',label:'Facebook URL',hint:''},
                  {key:'tiktok',label:'TikTok URL',hint:''},
                  {key:'twitter',label:'Twitter / X URL',hint:''},
                  {key:'whatsapp',label:'WhatsApp Number',hint:'Include country code e.g. +447911123456'},
                ]},
              ].map(grp=>(
                <div key={grp.group} style={{...S.card,marginBottom:'1.25rem'}}>
                  <h3 style={{margin:'0 0 1rem',color:'#2d1f14',fontSize:'0.95rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em'}}>{grp.group}</h3>
                  {grp.fields.map(f=>(
                    <div key={f.key} style={{marginBottom:'0.85rem'}}>
                      <label style={S.fieldLabel as React.CSSProperties}>{f.label}</label>
                      {f.hint && <p style={{margin:'0 0 0.3rem',fontSize:'0.72rem',color:'#bbb',fontStyle:'italic'}}>{f.hint}</p>}
                      {f.multi
                        ? <textarea value={settings[f.key]||''} rows={2} onChange={e=>setSettings(p=>({...p,[f.key]:e.target.value}))} style={{...S.input as any,resize:'vertical',width:'100%'}} />
                        : <input type="text" value={settings[f.key]||''} onChange={e=>setSettings(p=>({...p,[f.key]:e.target.value}))} style={{...S.input as any,width:'100%'}} />
                      }
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* ═══ HELP & TIPS TAB ════════════════════════════════════════════ */}
          {tab==='help' && (
            <div>
              <h2 style={S.h2}>Help & Developer Tips</h2>
              <p style={{...S.hint,marginBottom:'1.5rem'}}>Your reference guide for managing and growing the Agrobeso website.</p>

              {[
                {
                  icon:'📐',title:'Recommended Image Sizes',
                  items:[
                    'Hero / Banner: 1600 × 1000px minimum, landscape (16:10)',
                    'Gallery tiles: 800 × 600px (4:3 ratio works best)',
                    'Dish photos: 600 × 450px, square also works (600 × 600)',
                    'About / Heritage: 1200 × 800px, warm tones look best',
                    'File format: JPG for photos, PNG for logos. Keep under 2MB.',
                  ]
                },
                {
                  icon:'🎨',title:'Brand Colours',
                  items:[
                    'Primary / Clay: #b04a2a — buttons, accents, highlights',
                    'Dark / Cocoa: #2d1f14 — headings, nav, footer background',
                    'Warm / Ochre: #c88a3a — gold accent used sparingly',
                    'Background / Bone: #f5f0eb — main page background',
                    'Soft shell: #ede8e0 — section alternating background',
                  ]
                },
                {
                  icon:'✏️',title:'Content Tips',
                  items:[
                    'Keep dish stories under 25 words — punchy and evocative',
                    'Hero headline should be 3–6 words maximum',
                    'Manifesto text works best at 20–40 words',
                    'Location hours format: Mon–Fri 11am–9pm, Sat–Sun 10am–10pm',
                    'Instagram URL: use full link e.g. https://instagram.com/agrobeso',
                  ]
                },
                {
                  icon:'⚡',title:'How Changes Work',
                  items:[
                    'Content saves to Supabase database immediately on click',
                    'The website reads from Supabase on every page load',
                    'Design token changes apply via CSS variables injected at load',
                    'Images are stored in Supabase Storage (public bucket "images")',
                    'Vercel auto-deploys any code changes within ~60 seconds',
                  ]
                },
                {
                  icon:'🚀',title:'Suggested Next Features',
                  items:[
                    'Online ordering / Deliveroo/Uber Eats integration links',
                    'Events calendar section with date pickers',
                    'Customer reviews / testimonials section with star ratings',
                    'Email newsletter signup form with Mailchimp or Resend',
                    'Gallery with lightbox viewer for food photography',
                    'Loyalty programme landing page',
                    'PDF menu download generation from dish data',
                    'Multi-language support (English / Twi)',
                    'Google Analytics or PostHog integration for visitor tracking',
                  ]
                },
                {
                  icon:'🔧',title:'Technical Reference',
                  items:[
                    'Stack: React + TypeScript + Vite + Tailwind CSS + Supabase',
                    'Deployed on: Vercel (auto-deploys on GitHub push)',
                    'Supabase project: lsgxrluiwsxuhsjcvdue.supabase.co',
                    'Storage bucket: images (public read access)',
                    'DB table: site_content (id TEXT, value TEXT, updated_at TIMESTAMPTZ)',
                    'Admin path: /admin (password protected, client-side only)',
                  ]
                },
              ].map(section=>(
                <div key={section.title} style={{...S.card,marginBottom:'1rem'}}>
                  <h3 style={{margin:'0 0 0.75rem',display:'flex',alignItems:'center',gap:'0.5rem',fontSize:'0.95rem',fontWeight:700,color:'#2d1f14'}}>
                    <span>{section.icon}</span>{section.title}
                  </h3>
                  <ul style={{margin:0,paddingLeft:'1.25rem'}}>
                    {section.items.map((item,i)=>(
                      <li key={i} style={{fontSize:'0.85rem',color:'#555',marginBottom:'0.35rem',lineHeight:1.5}}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
