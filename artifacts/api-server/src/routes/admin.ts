import { Router, type IRouter } from "express";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import {
  blogPostsTable,
  db,
  enquiriesTable,
  propertiesTable,
  siteSettingsTable,
} from "@workspace/db";
import { requireAdmin } from "../middlewares/requireAdmin";

const router: IRouter = Router();
router.use("/admin", requireAdmin);

function propertyPayload(row: typeof propertiesTable.$inferSelect) {
  return {
    ...row,
    featured: row.featured === 1,
    isPublished: row.isPublished === 1,
  };
}

router.get("/admin/stats", async (_req, res): Promise<void> => {
  const [properties, enquiries, blogs] = await Promise.all([
    db.select().from(propertiesTable),
    db.select().from(enquiriesTable),
    db.select().from(blogPostsTable),
  ]);
  res.json({
    totalProperties: properties.length,
    publishedProperties: properties.filter((item) => item.isPublished === 1).length,
    draftProperties: properties.filter((item) => item.isPublished !== 1).length,
    featuredProperties: properties.filter((item) => item.featured === 1).length,
    totalEnquiries: enquiries.length,
    totalBlogPosts: blogs.length,
    publishedBlogPosts: blogs.filter((item) => item.status === "published").length,
  });
});

router.get("/admin/properties", async (req, res): Promise<void> => {
  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
  const status = typeof req.query.status === "string" ? req.query.status : "";
  const rows = await db
    .select()
    .from(propertiesTable)
    .where(and(
      q ? or(ilike(propertiesTable.title, `%${q}%`), ilike(propertiesTable.city, `%${q}%`)) : undefined,
      status === "published" ? eq(propertiesTable.isPublished, 1) : undefined,
      status === "draft" ? eq(propertiesTable.isPublished, 0) : undefined,
    ))
    .orderBy(desc(propertiesTable.updatedAt));
  res.json(rows.map(propertyPayload));
});

router.post("/admin/properties", async (req, res): Promise<void> => {
  const body = req.body as Record<string, unknown>;
  const [created] = await db.insert(propertiesTable).values({
    slug: String(body.slug || "").trim(),
    title: String(body.title || "").trim(),
    location: String(body.location || "").trim(),
    city: String(body.city || "Dubai").trim(),
    country: String(body.country || "UAE").trim(),
    propertyType: String(body.propertyType || "Apartment").trim(),
    listingType: String(body.listingType || "For Sale").trim(),
    status: String(body.status || "Draft").trim(),
    priceLabel: String(body.priceLabel || "Price to be confirmed").trim(),
    price: body.price ? String(body.price) : null,
    currency: String(body.currency || "AED").trim(),
    bedrooms: Number(body.bedrooms || 0),
    bathrooms: Number(body.bathrooms || 0),
    area: Number(body.area || 0),
    plotArea: body.plotArea ? Number(body.plotArea) : null,
    areaUnit: String(body.areaUnit || "sq ft").trim(),
    image: String(body.image || "").trim(),
    imageAlt: String(body.imageAlt || body.title || "").trim(),
    featured: body.featured ? 1 : 0,
    isPublished: body.isPublished ? 1 : 0,
    shortDescription: String(body.shortDescription || "").trim(),
    description: String(body.description || "").trim(),
    images: Array.isArray(body.images) ? body.images.map(String) : [],
    amenities: Array.isArray(body.amenities) ? body.amenities.map(String) : [],
    propertyFeatures: Array.isArray(body.propertyFeatures) ? body.propertyFeatures.map(String) : [],
    developer: String(body.developer || "").trim(),
    completionStatus: String(body.completionStatus || "").trim(),
    completionDate: body.completionDate ? String(body.completionDate) : null,
    nearby: Array.isArray(body.nearby) ? body.nearby.map(String) : [],
    floorPlans: Array.isArray(body.floorPlans) ? body.floorPlans.map(String) : [],
    videoUrl: body.videoUrl ? String(body.videoUrl) : null,
    virtualTourUrl: body.virtualTourUrl ? String(body.virtualTourUrl) : null,
    brochureUrl: body.brochureUrl ? String(body.brochureUrl) : null,
    latitude: body.latitude ? Number(body.latitude) : null,
    longitude: body.longitude ? Number(body.longitude) : null,
    seoTitle: body.seoTitle ? String(body.seoTitle) : null,
    seoDescription: body.seoDescription ? String(body.seoDescription) : null,
    seoKeywords: body.seoKeywords ? String(body.seoKeywords) : null,
    canonicalUrl: body.canonicalUrl ? String(body.canonicalUrl) : null,
    ogImage: body.ogImage ? String(body.ogImage) : null,
  }).returning();
  res.status(201).json(propertyPayload(created));
});

router.patch("/admin/properties/:id", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).json({ error: "Invalid property id" });
    return;
  }
  const body = req.body as Record<string, unknown>;
  const [updated] = await db.update(propertiesTable).set({
    ...body,
    featured: body.featured === undefined ? undefined : body.featured ? 1 : 0,
    isPublished: body.isPublished === undefined ? undefined : body.isPublished ? 1 : 0,
    updatedAt: new Date(),
  } as Partial<typeof propertiesTable.$inferInsert>).where(eq(propertiesTable.id, id)).returning();
  if (!updated) {
    res.status(404).json({ error: "Property not found" });
    return;
  }
  res.json(propertyPayload(updated));
});

router.post("/admin/properties/:id/duplicate", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  const [source] = await db.select().from(propertiesTable).where(eq(propertiesTable.id, id)).limit(1);
  if (!source) {
    res.status(404).json({ error: "Property not found" });
    return;
  }
  const [created] = await db.insert(propertiesTable).values({
    ...source,
    id: undefined,
    slug: `${source.slug}-copy-${Date.now()}`,
    title: `${source.title} — Copy`,
    isPublished: 0,
    featured: 0,
    createdAt: undefined,
    updatedAt: undefined,
  }).returning();
  res.status(201).json(propertyPayload(created));
});

router.delete("/admin/properties/:id", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  const [deleted] = await db.delete(propertiesTable).where(eq(propertiesTable.id, id)).returning({ id: propertiesTable.id });
  if (!deleted) {
    res.status(404).json({ error: "Property not found" });
    return;
  }
  res.status(204).send();
});

router.get("/admin/enquiries", async (_req, res): Promise<void> => {
  const rows = await db.select().from(enquiriesTable).orderBy(desc(enquiriesTable.createdAt));
  res.json(rows);
});

router.patch("/admin/enquiries/:id", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  const status = String(req.body.status || "new");
  const [updated] = await db.update(enquiriesTable).set({ status }).where(eq(enquiriesTable.id, id)).returning();
  if (!updated) {
    res.status(404).json({ error: "Enquiry not found" });
    return;
  }
  res.json(updated);
});

router.get("/admin/blog", async (_req, res): Promise<void> => {
  res.json(await db.select().from(blogPostsTable).orderBy(desc(blogPostsTable.updatedAt)));
});

router.post("/admin/blog", async (req, res): Promise<void> => {
  const body = req.body as Record<string, unknown>;
  const [created] = await db.insert(blogPostsTable).values({
    slug: String(body.slug || "").trim(),
    title: String(body.title || "").trim(),
    excerpt: String(body.excerpt || "").trim(),
    content: String(body.content || "").trim(),
    status: String(body.status || "draft"),
    featured: body.featured ? 1 : 0,
    category: String(body.category || "Insights"),
    tags: Array.isArray(body.tags) ? body.tags.map(String) : [],
    featuredImage: body.featuredImage ? String(body.featuredImage) : null,
    featuredImageAlt: body.featuredImageAlt ? String(body.featuredImageAlt) : null,
    author: String(body.author || "IKKA Estate"),
    readingTime: Number(body.readingTime || 5),
    seoTitle: body.seoTitle ? String(body.seoTitle) : null,
    seoDescription: body.seoDescription ? String(body.seoDescription) : null,
    seoKeywords: body.seoKeywords ? String(body.seoKeywords) : null,
    canonicalUrl: body.canonicalUrl ? String(body.canonicalUrl) : null,
    ogImage: body.ogImage ? String(body.ogImage) : null,
  }).returning();
  res.status(201).json(created);
});

router.patch("/admin/blog/:id", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  const body = req.body as Record<string, unknown>;
  const [updated] = await db.update(blogPostsTable).set({
    ...body,
    featured: body.featured === undefined ? undefined : body.featured ? 1 : 0,
    updatedAt: new Date(),
  } as Partial<typeof blogPostsTable.$inferInsert>).where(eq(blogPostsTable.id, id)).returning();
  if (!updated) {
    res.status(404).json({ error: "Blog post not found" });
    return;
  }
  res.json(updated);
});

router.delete("/admin/blog/:id", async (req, res): Promise<void> => {
  const [deleted] = await db.delete(blogPostsTable).where(eq(blogPostsTable.id, Number(req.params.id))).returning({ id: blogPostsTable.id });
  if (!deleted) {
    res.status(404).json({ error: "Blog post not found" });
    return;
  }
  res.status(204).send();
});

router.get("/admin/settings", async (_req, res): Promise<void> => {
  let [settings] = await db.select().from(siteSettingsTable).limit(1);
  if (!settings) {
    [settings] = await db.insert(siteSettingsTable).values({}).returning();
  }
  res.json(settings);
});

router.put("/admin/settings", async (req, res): Promise<void> => {
  let [settings] = await db.select().from(siteSettingsTable).limit(1);
  if (!settings) {
    [settings] = await db.insert(siteSettingsTable).values(req.body).returning();
  } else {
    [settings] = await db.update(siteSettingsTable).set({
      ...req.body,
      updatedAt: new Date(),
    }).where(eq(siteSettingsTable.id, settings.id)).returning();
  }
  res.json(settings);
});

export default router;