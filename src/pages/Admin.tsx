import { useState, useEffect } from "react";
import { agrobesoSupabase as supabase, AGROBESO_STORAGE_URL } from "../integrations/supabase/agrobeso-client";

const ADMIN_PASSWORD = "agrobeso2024";

type UploadedImage = {
  name: string;
  url: string;
  category: string;
};

export default function Admin() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState("menu");
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      loadImages();
    } else {
      setMessage("Incorrect password");
    }
  };

  const loadImages = async () => {
    setLoading(true);
    const { data, error } = await supabase.storage.from("images").list("", { limit: 200 });
    if (error) {
      setMessage("Error loading: " + error.message);
    } else if (data) {
      const imgs: UploadedImage[] = data
        .filter((f) => f.name !== ".emptyFolderPlaceholder")
        .map((f) => {
          const parts = f.name.split("_");
          const cat = parts.length > 1 ? parts[0] : "general";
          return { name: f.name, url: AGROBESO_STORAGE_URL + "/" + f.name, category: cat };
        });
      setUploadedImages(imgs);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (authenticated) loadImages();
  }, [authenticated]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { setMessage("Please select a file"); return; }
    setUploading(true);
    setMessage("");
    const timestamp = Date.now();
    const ext = file.name.split(".").pop();
    const fileName = category + "_" + timestamp + "." + ext;
    const { error } = await supabase.storage.from("images").upload(fileName, file, { cacheControl: "3600", upsert: false });
    if (error) {
      setMessage("Upload failed: " + error.message);
    } else {
      setMessage("Image uploaded successfully!");
      setFile(null);
      const input = document.getElementById("fileInput") as HTMLInputElement;
      if (input) input.value = "";
      loadImages();
    }
    setUploading(false);
  };

  const handleDelete = async (imageName: string) => {
    if (!confirm("Delete this image?")) return;
    const { error } = await supabase.storage.from("images").remove([imageName]);
    if (error) {
      setMessage("Delete failed: " + error.message);
    } else {
      setMessage("Image deleted.");
      loadImages();
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setMessage("URL copied to clipboard!");
  };

  const categories = ["menu", "gallery", "hero", "about", "event", "general"];

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
          <h1 className="text-3xl font-bold text-center text-green-700 mb-2">Agrobeso Admin</h1>
          <p className="text-center text-gray-500 mb-8">Image Management Dashboard</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none"
                placeholder="Enter admin password"
                required
              />
            </div>
            {message && <p className="text-red-600 text-sm">{message}</p>}
            <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg">
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  const msgClass = message.includes("failed") || message.includes("Error")
    ? "bg-red-100 text-red-700"
    : "bg-green-100 text-green-700";

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-green-700 text-white px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Agrobeso Admin Dashboard</h1>
        <button onClick={() => setAuthenticated(false)} className="text-sm bg-white text-green-700 px-4 py-1 rounded-full font-semibold">
          Logout
        </button>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-8">
        {message && (
          <div className={"p-4 rounded-lg text-sm font-medium " + msgClass}>
            {message}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Upload New Image</h2>
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image File</label>
                <input
                  id="fileInput"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={uploading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold px-6 py-2 rounded-lg"
            >
              {uploading ? "Uploading..." : "Upload Image"}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Uploaded Images ({uploadedImages.length})</h2>
            <button onClick={loadImages} className="text-sm text-green-600 hover:underline">Refresh</button>
          </div>
          {loading ? (
            <p className="text-gray-500">Loading images...</p>
          ) : uploadedImages.length === 0 ? (
            <p className="text-gray-500">No images uploaded yet.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {uploadedImages.map((img) => (
                <div key={img.name} className="border border-gray-200 rounded-xl overflow-hidden group relative">
                  <img src={img.url} alt={img.name} className="w-full h-40 object-cover" />
                  <div className="p-2">
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{img.category}</span>
                    <p className="text-xs text-gray-500 mt-1 truncate">{img.name}</p>
                  </div>
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button onClick={() => copyUrl(img.url)} className="bg-white text-gray-800 text-xs px-3 py-1 rounded-full font-semibold">Copy URL</button>
                    <button onClick={() => handleDelete(img.name)} className="bg-red-500 text-white text-xs px-3 py-1 rounded-full font-semibold">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
