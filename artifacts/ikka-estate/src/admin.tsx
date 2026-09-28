import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth, useUser } from "@clerk/react";
import {
  BarChart3,
  BookOpen,
  Building2,
  Check,
  ChevronRight,
  FileText,
  Home,
  LoaderCircle,
  LogOut,
  Mail,
  Plus,
  Save,
  Settings,
  ShieldAlert,
  Trash2,
  X,
} from "lucide-react";

type AdminProperty = {
  id: number;
  slug: string;
  title: string;
  location: string;
  city: string;
  country: string;
  propertyType: string;
  listingType: string;
  status: string;
  priceLabel: string;
  price: string | null;
  currency: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  plotArea: number | null;
  areaUnit: string;
  image: string;
  imageAlt: string;
  featured: boolean;
  isPublished: boolean;
  shortDescription: string;
  description: string;
  images: string[];
  amenities: string[];
  propertyFeatures: string[];
  developer: string;
  completionStatus: string;
  completionDate: string | null;
  nearby: string[];
  floorPlans: string[];
  videoUrl: string | null;
  virtualTourUrl: string | null;
  brochureUrl: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
  canonicalUrl: string | null;
  ogImage: string | null;
};

type AdminStats = {
  totalProperties: number;
  publishedProperties: number;
  draftProperties: number;
  featuredProperties: number;
  totalEnquiries: number;
  totalBlogPosts: number;
  publishedBlogPosts: number;
};

type Enquiry = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  country: string | null;
  message: string;
  propertySlug: string | null;
  enquiryType: string;
  preferredContact: string | null;
  status: string;
  createdAt: string;
};

type BlogPost = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  status: string;
  featured: number;
  category: string;
  tags: string[];
  featuredImage: string | null;
  featuredImageAlt: string | null;
  author: string;
  readingTime: number;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
  canonicalUrl: string | null;
  ogImage: string | null;
};

type Settings = {
  companyName: string;
  email: string;
  phone: string | null;
  whatsapp: string | null;
  officeAddress: string | null;
  dubaiOffice: string | null;
  delhiOffice: string | null;
  instagram: string | null;
  linkedin: string | null;
  facebook: string | null;
  x: string | null;
  homepageHeadline: string;
  homepageDescription: string;
  footerText: string;
  defaultSeoTitle: string;
  defaultMetaDescription: string;
  defaultOgImage: string | null;
  googleVerification: string | null;
  googleAnalyticsId: string | null;
  googleTagManagerId: string | null;
};

const blankProperty: Partial<AdminProperty> = {
  title: "",
  slug: "",
  location: "",
  city: "Dubai",
  country: "UAE",
  propertyType: "Apartment",
  listingType: "For Sale",
  status: "Draft",
  priceLabel: "Price to be confirmed",
  currency: "AED",
  bedrooms: 0,
  bathrooms: 0,
  area: 0,
  areaUnit: "sq ft",
  image: "",
  imageAlt: "",
  shortDescription: "",
  description: "",
  images: [],
  amenities: [],
  propertyFeatures: [],
  developer: "",
  completionStatus: "",
  nearby: [],
  floorPlans: [],
  featured: false,
  isPublished: false,
};

async function adminRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api${path}`, {
    credentials: "include",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(payload.error || "Request failed");
  }
  return response.status === 204 ? (undefined as T) : response.json();
}

function AdminNav({ onSignOut }: { onSignOut: () => void }) {
  const [location] = useLocation();
  const links = [
    { href: "/admin", label: "Overview", icon: BarChart3 },
    { href: "/admin/properties", label: "Properties", icon: Building2 },
    { href: "/admin/enquiries", label: "Enquiries", icon: Mail },
    { href: "/admin/blog", label: "Journal", icon: BookOpen },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ];
  return (
    <aside className="flex min-h-screen w-full max-w-[260px] flex-col bg-[#283c33] px-6 py-8 text-[#f1eee6]">
      <Link href="/" className="mb-14 flex items-center gap-3" aria-label="Back to website">
        <img src="/ikka-logo-cropped.png" alt="IKKA Estate" className="w-28 brightness-0 invert" />
      </Link>
      <p className="mb-4 text-[10px] font-bold uppercase tracking-[.2em] text-[#d9b96e]">Workspace</p>
      <nav className="flex flex-col gap-1">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-3 text-xs uppercase tracking-[.12em] transition-colors ${
              location === href ? "bg-white/10 text-white" : "text-white/55 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Icon size={15} strokeWidth={1.5} />
            {label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto border-t border-white/15 pt-5">
        <Link href="/" className="mb-4 flex items-center gap-2 px-3 py-2 text-xs text-white/55 hover:text-white">
          <Home size={15} strokeWidth={1.5} /> View website
        </Link>
        <button onClick={onSignOut} type="button" className="flex items-center gap-2 px-3 py-2 text-xs text-white/55 hover:text-white">
          <LogOut size={15} strokeWidth={1.5} /> Sign out
        </button>
      </div>
    </aside>
  );
}

function AdminHeader({ title, eyebrow, action }: { title: string; eyebrow: string; action?: ReactNode }) {
  const { user } = useUser();
  return (
    <header className="flex items-end justify-between border-b border-[#d3cec1] px-8 pb-7 pt-9">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#b28b42]">{eyebrow}</p>
        <h1 className="mt-3 font-display text-5xl leading-none text-[#283c33]">{title}</h1>
      </div>
      <div className="flex items-center gap-4">
        {action}
        <div className="hidden text-right sm:block">
          <p className="text-xs font-medium text-[#283c33]">{user?.firstName || "Admin"}</p>
          <p className="text-[10px] text-[#829088]">{user?.primaryEmailAddress?.emailAddress}</p>
        </div>
      </div>
    </header>
  );
}

function Metric({ label, value, accent = false }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className={`border-t px-4 pb-5 pt-4 ${accent ? "border-[#b28b42]" : "border-[#cfcabd]"}`}>
      <p className="text-[10px] uppercase tracking-[.16em] text-[#829088]">{label}</p>
      <p className={`mt-4 font-display text-5xl ${accent ? "text-[#b28b42]" : "text-[#283c33]"}`}>{value}</p>
    </div>
  );
}

function OverviewPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    adminRequest<AdminStats>("/admin/stats").then(setStats).catch((err: Error) => setError(err.message));
  }, []);
  return (
    <>
      <AdminHeader eyebrow="IKKA Estate · Overview" title="Good morning." />
      {error ? <ErrorNotice message={error} /> : null}
      <section className="grid gap-x-8 gap-y-8 px-8 py-10 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Total properties" value={stats?.totalProperties || 0} />
        <Metric label="Published properties" value={stats?.publishedProperties || 0} accent />
        <Metric label="Draft properties" value={stats?.draftProperties || 0} />
        <Metric label="Featured properties" value={stats?.featuredProperties || 0} />
        <Metric label="Total enquiries" value={stats?.totalEnquiries || 0} accent />
        <Metric label="Total journal posts" value={stats?.totalBlogPosts || 0} />
        <Metric label="Published journal posts" value={stats?.publishedBlogPosts || 0} />
      </section>
      <section className="grid gap-8 px-8 pb-12 lg:grid-cols-[1.1fr_.9fr]">
        <div className="border border-[#d3cec1] bg-[#f8f5ee] p-7">
          <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#b28b42]">Quick actions</p>
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            {[
              { href: "/admin/properties?new=1", label: "Add a property", icon: Building2 },
              { href: "/admin/blog?new=1", label: "Write a journal post", icon: FileText },
              { href: "/admin/enquiries", label: "Review enquiries", icon: Mail },
              { href: "/admin/settings", label: "Edit website settings", icon: Settings },
            ].map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} className="flex items-center justify-between border border-[#d3cec1] px-4 py-4 text-xs uppercase tracking-[.12em] text-[#283c33] transition-colors hover:bg-[#283c33] hover:text-white">
                <span className="flex items-center gap-3"><Icon size={15} /> {label}</span><ChevronRight size={15} />
              </Link>
            ))}
          </div>
        </div>
        <div className="bg-[#283c33] p-7 text-[#f1eee6]">
          <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#d9b96e]">A note</p>
          <p className="mt-8 max-w-[330px] font-display text-3xl leading-tight">The site is yours to shape.</p>
          <p className="mt-5 max-w-[330px] text-sm leading-7 text-white/60">Use this workspace to keep the collection current, respond to enquiries and publish considered insights without editing the source.</p>
        </div>
      </section>
    </>
  );
}

function ErrorNotice({ message }: { message: string }) {
  return <div className="mx-8 mt-8 flex items-start gap-3 border border-[#b28b42]/50 bg-[#fbf3dd] px-4 py-3 text-sm text-[#6c5627]"><ShieldAlert size={17} className="mt-0.5 shrink-0" />{message}</div>;
}

function PropertyForm({ initial, onSaved, onCancel }: { initial: Partial<AdminProperty>; onSaved: () => void; onCancel: () => void }) {
  const [form, setForm] = useState<Partial<AdminProperty>>({ ...blankProperty, ...initial });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const set = (key: keyof AdminProperty, value: unknown) => setForm((current) => ({ ...current, [key]: value }));
  const listValue = (key: "images" | "amenities" | "propertyFeatures" | "nearby" | "floorPlans") => (form[key] || []).join("\n");
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    const payload = {
      ...form,
      images: String(listValue("images")).split("\n").map((item) => item.trim()).filter(Boolean),
      amenities: String(listValue("amenities")).split("\n").map((item) => item.trim()).filter(Boolean),
      propertyFeatures: String(listValue("propertyFeatures")).split("\n").map((item) => item.trim()).filter(Boolean),
      nearby: String(listValue("nearby")).split("\n").map((item) => item.trim()).filter(Boolean),
      floorPlans: String(listValue("floorPlans")).split("\n").map((item) => item.trim()).filter(Boolean),
    };
    try {
      await adminRequest(initial.id ? `/admin/properties/${initial.id}` : "/admin/properties", {
        method: initial.id ? "PATCH" : "POST",
        body: JSON.stringify(payload),
      });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save property");
    } finally {
      setBusy(false);
    }
  };
  const input = (key: keyof AdminProperty, label: string, type = "text") => (
    <label className="block">
      <span className="mb-2 block text-[10px] font-bold uppercase tracking-[.14em] text-[#829088]">{label}</span>
      <input value={String(form[key] ?? "")} type={type} onChange={(e) => set(key, type === "number" ? Number(e.target.value) : e.target.value)} className="w-full border-b border-[#cfcabd] bg-transparent px-0 py-2 text-sm text-[#283c33] outline-none focus:border-[#b28b42]" />
    </label>
  );
  const textarea = (key: "description" | "shortDescription" | "images" | "amenities" | "propertyFeatures" | "nearby" | "floorPlans", label: string) => (
    <label className="block">
      <span className="mb-2 block text-[10px] font-bold uppercase tracking-[.14em] text-[#829088]">{label}</span>
      <textarea value={key === "images" || key === "amenities" || key === "propertyFeatures" || key === "nearby" || key === "floorPlans" ? listValue(key) : String(form[key] ?? "")} onChange={(e) => set(key, key === "images" || key === "amenities" || key === "propertyFeatures" || key === "nearby" || key === "floorPlans" ? e.target.value.split("\n") : e.target.value)} rows={key === "description" ? 6 : 3} className="w-full resize-y border border-[#cfcabd] bg-transparent p-3 text-sm leading-6 text-[#283c33] outline-none focus:border-[#b28b42]" />
    </label>
  );
  return (
    <form onSubmit={submit} className="border-t border-[#cfcabd] px-8 py-8">
      <div className="mb-8 flex items-center justify-between">
        <p className="font-display text-3xl text-[#283c33]">{initial.id ? "Edit residence" : "Add residence"}</p>
        <button type="button" onClick={onCancel} className="text-[#829088] hover:text-[#283c33]" aria-label="Close form"><X size={20} /></button>
      </div>
      {error ? <ErrorNotice message={error} /> : null}
      <div className="grid gap-6 md:grid-cols-2">
        {input("title", "Property title")}
        {input("slug", "Slug")}
        {input("location", "Area / location")}
        {input("city", "City")}
        {input("country", "Country")}
        {input("propertyType", "Property type")}
        {input("listingType", "Buy / rent")}
        {input("priceLabel", "Public price label")}
        {input("price", "Price")}
        {input("currency", "Currency")}
        {input("bedrooms", "Bedrooms", "number")}
        {input("bathrooms", "Bathrooms", "number")}
        {input("area", "Built-up area", "number")}
        {input("plotArea", "Plot area", "number")}
        {input("areaUnit", "Area unit")}
        {input("developer", "Developer")}
        {input("completionStatus", "Completion status")}
        {input("completionDate", "Completion date", "date")}
        {input("image", "Featured image URL")}
        {input("imageAlt", "Image alt text")}
        {input("videoUrl", "Video URL")}
        {input("virtualTourUrl", "Virtual tour URL")}
        {input("brochureUrl", "Brochure URL")}
        {input("seoTitle", "SEO title")}
        {input("seoDescription", "SEO description")}
        {input("seoKeywords", "SEO keywords")}
        {input("canonicalUrl", "Canonical URL")}
        {input("ogImage", "OG image URL")}
      </div>
      <div className="mt-7 grid gap-6">
        {textarea("shortDescription", "Short description")}
        {textarea("description", "Description")}
        {textarea("amenities", "Amenities · one per line")}
        {textarea("propertyFeatures", "Property features · one per line")}
        {textarea("images", "Property images · one URL per line")}
        {textarea("floorPlans", "Floor plans · one URL per line")}
        {textarea("nearby", "Nearby landmarks · one per line")}
      </div>
      <div className="mt-7 flex flex-wrap gap-6 border-t border-[#cfcabd] pt-6">
        <label className="flex items-center gap-2 text-xs text-[#52625a]"><input type="checkbox" checked={Boolean(form.isPublished)} onChange={(e) => set("isPublished", e.target.checked)} /> Publish on save</label>
        <label className="flex items-center gap-2 text-xs text-[#52625a]"><input type="checkbox" checked={Boolean(form.featured)} onChange={(e) => set("featured", e.target.checked)} /> Feature on homepage</label>
      </div>
      <div className="mt-8 flex gap-3">
        <button disabled={busy} className="inline-flex items-center gap-2 bg-[#283c33] px-5 py-3 text-[10px] font-bold uppercase tracking-[.15em] text-white disabled:opacity-50">{busy ? <LoaderCircle size={14} className="animate-spin" /> : <Save size={14} />} Save residence</button>
        <button type="button" onClick={onCancel} className="border border-[#cfcabd] px-5 py-3 text-[10px] font-bold uppercase tracking-[.15em] text-[#283c33]">Cancel</button>
      </div>
    </form>
  );
}

function PropertiesAdminPage() {
  const [properties, setProperties] = useState<AdminProperty[]>([]);
  const [selected, setSelected] = useState<Partial<AdminProperty> | null>(null);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const load = () => adminRequest<AdminProperty[]>(`/admin/properties${query ? `?q=${encodeURIComponent(query)}` : ""}`).then(setProperties).catch((err: Error) => setError(err.message));
  useEffect(load, [query]);
  const remove = async (property: AdminProperty) => {
    if (!window.confirm(`Delete ${property.title}? This cannot be undone.`)) return;
    await adminRequest(`/admin/properties/${property.id}`, { method: "DELETE" });
    load();
  };
  const duplicate = async (property: AdminProperty) => {
    await adminRequest(`/admin/properties/${property.id}/duplicate`, { method: "POST", body: JSON.stringify({}) });
    load();
  };
  return (
    <>
      <AdminHeader eyebrow="IKKA Estate · Collection" title="Properties" action={<button onClick={() => setSelected(blankProperty)} className="inline-flex items-center gap-2 bg-[#283c33] px-4 py-3 text-[10px] font-bold uppercase tracking-[.14em] text-white"><Plus size={14} /> Add property</button>} />
      {error ? <ErrorNotice message={error} /> : null}
      {selected ? <PropertyForm initial={selected} onSaved={() => { setSelected(null); load(); }} onCancel={() => setSelected(null)} /> : (
        <section className="px-8 py-8">
          <div className="mb-6 flex max-w-[420px] items-center border-b border-[#cfcabd]"><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search title or city" className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-[#9aa19a]" /></div>
          <div className="overflow-x-auto border-y border-[#cfcabd]">
            <table className="w-full min-w-[780px] text-left">
              <thead><tr className="text-[10px] uppercase tracking-[.16em] text-[#829088]"><th className="px-3 py-4">Residence</th><th className="px-3 py-4">Location</th><th className="px-3 py-4">Status</th><th className="px-3 py-4">Visibility</th><th className="px-3 py-4 text-right">Actions</th></tr></thead>
              <tbody>{properties.map((property) => <tr key={property.id} className="border-t border-[#e1ddd3] text-sm text-[#52625a]"><td className="px-3 py-5"><p className="font-display text-xl text-[#283c33]">{property.title}</p><p className="mt-1 text-xs">{property.propertyType} · {property.bedrooms} beds</p></td><td className="px-3 py-5">{property.city}, {property.country}</td><td className="px-3 py-5"><span className={property.status === "Demo content" ? "text-[#b28b42]" : "text-[#52625a]"}>{property.status}</span></td><td className="px-3 py-5">{property.isPublished ? <span className="inline-flex items-center gap-1 text-[#557562]"><Check size={14} /> Published</span> : "Draft"}</td><td className="px-3 py-5"><div className="flex justify-end gap-3 text-[10px] uppercase tracking-[.1em]"><button onClick={() => setSelected(property)} className="text-[#283c33] underline underline-offset-4">Edit</button><button onClick={() => duplicate(property)} className="text-[#829088]">Duplicate</button><button onClick={() => remove(property)} className="text-[#9b6559]"><Trash2 size={15} /></button></div></td></tr>)}</tbody>
            </table>
          </div>
        </section>
      )}
    </>
  );
}

function EnquiriesAdminPage() {
  const [items, setItems] = useState<Enquiry[]>([]);
  const [error, setError] = useState("");
  const load = () => adminRequest<Enquiry[]>("/admin/enquiries").then(setItems).catch((err: Error) => setError(err.message));
  useEffect(load, []);
  const statuses = ["new", "contacted", "qualified", "archived"];
  return (
    <>
      <AdminHeader eyebrow="IKKA Estate · Inbox" title="Enquiries" />
      {error ? <ErrorNotice message={error} /> : null}
      <section className="px-8 py-8"><div className="overflow-x-auto border-y border-[#cfcabd]"><table className="w-full min-w-[900px] text-left"><thead><tr className="text-[10px] uppercase tracking-[.16em] text-[#829088]"><th className="px-3 py-4">Contact</th><th className="px-3 py-4">Message</th><th className="px-3 py-4">Property</th><th className="px-3 py-4">Status</th><th className="px-3 py-4">Received</th></tr></thead><tbody>{items.map((item) => <tr key={item.id} className="border-t border-[#e1ddd3] align-top text-sm text-[#52625a]"><td className="px-3 py-5"><p className="font-medium text-[#283c33]">{item.name}</p><a href={`mailto:${item.email}`} className="text-xs underline">{item.email}</a><p className="mt-1 text-xs text-[#829088]">{item.phone || "No phone"} · {item.country || "No country"}</p></td><td className="max-w-[360px] px-3 py-5 leading-6">{item.message}</td><td className="px-3 py-5 text-xs">{item.propertySlug || "General enquiry"}</td><td className="px-3 py-5"><select value={item.status} onChange={async (e) => { await adminRequest(`/admin/enquiries/${item.id}`, { method: "PATCH", body: JSON.stringify({ status: e.target.value }) }); load(); }} className="border-b border-[#cfcabd] bg-transparent py-2 text-xs outline-none">{statuses.map((status) => <option value={status} key={status}>{status}</option>)}</select></td><td className="px-3 py-5 text-xs text-[#829088]">{new Date(item.createdAt).toLocaleDateString()}</td></tr>)}</tbody></table>{items.length === 0 ? <p className="px-3 py-10 text-sm text-[#829088]">No enquiries yet.</p> : null}</div></section>
    </>
  );
}

function BlogAdminPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [editing, setEditing] = useState<Partial<BlogPost> | null>(null);
  const [error, setError] = useState("");
  const load = () => adminRequest<BlogPost[]>("/admin/blog").then(setPosts).catch((err: Error) => setError(err.message));
  useEffect(load, []);
  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing) return;
    try {
      const data = new FormData(event.currentTarget);
      const payload = Object.fromEntries(data.entries());
      payload.featured = data.get("featured") ? "true" : "false";
      await adminRequest(editing.id ? `/admin/blog/${editing.id}` : "/admin/blog", { method: editing.id ? "PATCH" : "POST", body: JSON.stringify(payload) });
      setEditing(null); load();
    } catch (err) { setError(err instanceof Error ? err.message : "Could not save post"); }
  };
  return (
    <>
      <AdminHeader eyebrow="IKKA Estate · Journal" title="Journal" action={<button onClick={() => setEditing({ status: "draft", category: "Insights", author: "IKKA Estate", readingTime: 5 })} className="inline-flex items-center gap-2 bg-[#283c33] px-4 py-3 text-[10px] font-bold uppercase tracking-[.14em] text-white"><Plus size={14} /> Add post</button>} />
      {error ? <ErrorNotice message={error} /> : null}
      {editing ? <form onSubmit={save} className="grid gap-5 border-t border-[#cfcabd] px-8 py-8 md:grid-cols-2"><p className="font-display text-3xl text-[#283c33] md:col-span-2">{editing.id ? "Edit journal post" : "Write a journal post"}</p>{["title", "slug", "category", "author", "featuredImage", "featuredImageAlt", "seoTitle", "seoDescription", "seoKeywords", "canonicalUrl", "ogImage"].map((field) => <label key={field} className="block"><span className="mb-2 block text-[10px] font-bold uppercase tracking-[.14em] text-[#829088]">{field}</span><input name={field} defaultValue={String(editing[field as keyof BlogPost] ?? "")} className="w-full border-b border-[#cfcabd] bg-transparent py-2 text-sm outline-none focus:border-[#b28b42]" /></label>)}<label className="block"><span className="mb-2 block text-[10px] font-bold uppercase tracking-[.14em] text-[#829088]">Excerpt</span><textarea name="excerpt" defaultValue={editing.excerpt || ""} rows={3} className="w-full border border-[#cfcabd] bg-transparent p-3 text-sm outline-none focus:border-[#b28b42]" /></label><label className="block"><span className="mb-2 block text-[10px] font-bold uppercase tracking-[.14em] text-[#829088]">Reading time</span><input name="readingTime" type="number" defaultValue={editing.readingTime || 5} className="w-full border-b border-[#cfcabd] bg-transparent py-2 text-sm outline-none" /></label><label className="md:col-span-2"><span className="mb-2 block text-[10px] font-bold uppercase tracking-[.14em] text-[#829088]">Content</span><textarea name="content" defaultValue={editing.content || ""} rows={12} className="w-full border border-[#cfcabd] bg-transparent p-3 text-sm leading-7 outline-none focus:border-[#b28b42]" /></label><label className="flex items-center gap-2 text-sm text-[#52625a]"><input name="status" value="published" type="radio" defaultChecked={editing.status === "published"} /> Publish</label><label className="flex items-center gap-2 text-sm text-[#52625a]"><input name="status" value="draft" type="radio" defaultChecked={editing.status !== "published"} /> Save as draft</label><div className="flex gap-3 md:col-span-2"><button className="inline-flex items-center gap-2 bg-[#283c33] px-5 py-3 text-[10px] font-bold uppercase tracking-[.15em] text-white"><Save size={14} /> Save post</button><button type="button" onClick={() => setEditing(null)} className="border border-[#cfcabd] px-5 py-3 text-[10px] font-bold uppercase tracking-[.15em] text-[#283c33]">Cancel</button></div></form> : <section className="px-8 py-8"><div className="border-y border-[#cfcabd]">{posts.map((post) => <div key={post.id} className="flex items-center justify-between gap-5 border-b border-[#e1ddd3] py-5 last:border-0"><div><p className="font-display text-2xl text-[#283c33]">{post.title}</p><p className="mt-1 text-xs text-[#829088]">{post.category} · {post.status}</p></div><div className="flex gap-4 text-[10px] uppercase tracking-[.1em]"><button onClick={() => setEditing(post)} className="underline underline-offset-4">Edit</button><button onClick={async () => { if (window.confirm("Delete this post?")) { await adminRequest(`/admin/blog/${post.id}`, { method: "DELETE" }); load(); } }} className="text-[#9b6559]">Delete</button></div></div>)}</div>{posts.length === 0 ? <p className="py-10 text-sm text-[#829088]">No journal posts yet.</p> : null}</section>}
    </>
  );
}

function SettingsAdminPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { adminRequest<Settings>("/admin/settings").then(setSettings).catch((err: Error) => setError(err.message)); }, []);
  if (!settings) return <><AdminHeader eyebrow="IKKA Estate · Configuration" title="Settings" />{error ? <ErrorNotice message={error} /> : <div className="px-8 py-10 text-sm text-[#829088]">Loading settings…</div>}</>;
  const update = (key: keyof Settings, value: string) => setSettings((current) => current ? { ...current, [key]: value } : current);
  const save = async (event: FormEvent) => { event.preventDefault(); setSaved(false); try { await adminRequest("/admin/settings", { method: "PUT", body: JSON.stringify(settings) }); setSaved(true); } catch (err) { setError(err instanceof Error ? err.message : "Could not save settings"); } };
  const fields: Array<[keyof Settings, string]> = [["companyName", "Company name"], ["email", "Email"], ["phone", "Phone"], ["whatsapp", "WhatsApp"], ["officeAddress", "Office address"], ["dubaiOffice", "Dubai office"], ["delhiOffice", "Delhi office"], ["instagram", "Instagram"], ["linkedin", "LinkedIn"], ["facebook", "Facebook"], ["x", "X"], ["homepageHeadline", "Homepage headline"], ["homepageDescription", "Homepage description"], ["footerText", "Footer text"], ["defaultSeoTitle", "Default SEO title"], ["defaultMetaDescription", "Default meta description"], ["defaultOgImage", "Default OG image"], ["googleVerification", "Google Search Console verification"], ["googleAnalyticsId", "Google Analytics ID"], ["googleTagManagerId", "Google Tag Manager ID"]];
  return <><AdminHeader eyebrow="IKKA Estate · Configuration" title="Settings" />{error ? <ErrorNotice message={error} /> : null}<form onSubmit={save} className="grid gap-6 px-8 py-8 md:grid-cols-2">{fields.map(([key, label]) => <label key={key} className="block"><span className="mb-2 block text-[10px] font-bold uppercase tracking-[.14em] text-[#829088]">{label}</span><input value={String(settings[key] || "")} onChange={(e) => update(key, e.target.value)} className="w-full border-b border-[#cfcabd] bg-transparent py-2 text-sm text-[#283c33] outline-none focus:border-[#b28b42]" /></label>)}<div className="flex items-center gap-4 md:col-span-2"><button className="inline-flex items-center gap-2 bg-[#283c33] px-5 py-3 text-[10px] font-bold uppercase tracking-[.15em] text-white"><Save size={14} /> Save settings</button>{saved ? <span className="flex items-center gap-2 text-sm text-[#557562]"><Check size={15} /> Saved</span> : null}</div></form></>;
}

function AdminPage() {
  const { signOut } = useAuth();
  const [location] = useLocation();
  const content = location.startsWith("/admin/properties") ? <PropertiesAdminPage /> : location.startsWith("/admin/enquiries") ? <EnquiriesAdminPage /> : location.startsWith("/admin/blog") ? <BlogAdminPage /> : location.startsWith("/admin/settings") ? <SettingsAdminPage /> : <OverviewPage />;
  return <div className="flex min-h-screen bg-[#f1eee6]"><AdminNav onSignOut={() => signOut({ redirectUrl: "/" })} /><main className="min-w-0 flex-1">{content}</main></div>;
}

export function AdminRoute() {
  const { isLoaded, isSignedIn } = useAuth();
  const [, setLocation] = useLocation();
  if (!isLoaded) return <div className="flex min-h-screen items-center justify-center bg-[#f1eee6] text-[#283c33]"><LoaderCircle className="animate-spin" /></div>;
  if (!isSignedIn) return <div className="flex min-h-screen items-center justify-center bg-[#f1eee6] px-5 text-center"><div><ShieldAlert className="mx-auto text-[#b28b42]" size={28} /><h1 className="mt-6 font-display text-5xl text-[#283c33]">Private workspace.</h1><p className="mx-auto mt-4 max-w-[360px] text-sm leading-7 text-[#65736c]">Sign in with your IKKA Estate account to access the management workspace.</p><button onClick={() => setLocation("/sign-in")} className="mt-8 bg-[#283c33] px-6 py-3 text-[10px] font-bold uppercase tracking-[.16em] text-white">Sign in</button></div></div>;
  return <AdminPage />;
}