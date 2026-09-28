import { Router, type IRouter } from "express";
import { and, eq, gte, ilike, or } from "drizzle-orm";
import { db, propertiesTable, type InsertProperty, type Property } from "@workspace/db";
import {
  GetPropertyParams,
  GetPropertyResponse,
  ListPropertiesQueryParams,
  ListPropertiesResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();
let seedAttempted = false;

const demoProperties: InsertProperty[] = [
  {
    slug: "demo-virella-at-the-valley",
    title: "Demo Residence — Virella at The Valley",
    location: "The Valley",
    city: "Dubai",
    country: "UAE",
    propertyType: "Villa",
    listingType: "For Sale",
    status: "Demo content",
    priceLabel: "Price to be confirmed",
    bedrooms: 4,
    bathrooms: 5,
    area: 3120,
    areaUnit: "sq ft",
    image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1600&q=85",
    imageAlt: "Contemporary villa with a pool and warm evening light",
    featured: 1,
    shortDescription: "A carefully composed placeholder for future verified inventory.",
    description: "This is demo content for the IKKA Estate experience. Replace all property facts, pricing, imagery, and availability with verified listing information before launch.",
    images: [
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=2000&q=85",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=2000&q=85",
      "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=2000&q=85",
    ],
    amenities: ["Demo amenity — replace", "Private garden", "Pool"],
    developer: "Developer to be confirmed",
    completionStatus: "Status to be confirmed",
    nearby: ["Landmark to be confirmed"],
    videoUrl: null,
    brochureUrl: null,
  },
  {
    slug: "demo-marea-palm-jumeirah",
    title: "Demo Residence — Marea, Palm Jumeirah",
    location: "Palm Jumeirah",
    city: "Dubai",
    country: "UAE",
    propertyType: "Apartment",
    listingType: "For Sale",
    status: "Demo content",
    priceLabel: "Price to be confirmed",
    bedrooms: 3,
    bathrooms: 4,
    area: 2240,
    areaUnit: "sq ft",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=85",
    imageAlt: "Refined living room overlooking a calm sea",
    featured: 1,
    shortDescription: "An editorial placeholder for a verified waterfront residence.",
    description: "This is demo content for the IKKA Estate experience. Replace all property facts, pricing, imagery, and availability with verified listing information before launch.",
    images: [
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2000&q=85",
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=2000&q=85",
    ],
    amenities: ["Demo amenity — replace", "Sea view", "Residents' lounge"],
    developer: "Developer to be confirmed",
    completionStatus: "Status to be confirmed",
    nearby: ["Landmark to be confirmed"],
    videoUrl: null,
    brochureUrl: null,
  },
  {
    slug: "demo-amaranta-golf-course-road",
    title: "Demo Residence — Amaranta",
    location: "Golf Course Road",
    city: "Delhi",
    country: "India",
    propertyType: "Apartment",
    listingType: "For Sale",
    status: "Demo content",
    priceLabel: "Price to be confirmed",
    bedrooms: 3,
    bathrooms: 4,
    area: 2680,
    areaUnit: "sq ft",
    image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1600&q=85",
    imageAlt: "Minimal residence with sculptural staircase and soft daylight",
    featured: 0,
    shortDescription: "A considered placeholder for future Delhi inventory.",
    description: "This is demo content for the IKKA Estate experience. Replace all property facts, pricing, imagery, and availability with verified listing information before launch.",
    images: [
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=2000&q=85",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=2000&q=85",
    ],
    amenities: ["Demo amenity — replace", "Concierge", "Private parking"],
    developer: "Developer to be confirmed",
    completionStatus: "Status to be confirmed",
    nearby: ["Landmark to be confirmed"],
    videoUrl: null,
    brochureUrl: null,
  },
];

async function ensureDemoProperties(): Promise<void> {
  if (seedAttempted) return;
  seedAttempted = true;
  const existing = await db.select({ id: propertiesTable.id }).from(propertiesTable).limit(1);
  if (existing.length === 0) {
    await db.insert(propertiesTable).values(demoProperties);
  }
}

function toListProperty(property: Property) {
  return {
    id: property.id,
    slug: property.slug,
    title: property.title,
    location: property.location,
    city: property.city,
    country: property.country,
    propertyType: property.propertyType,
    listingType: property.listingType,
    status: property.status,
    priceLabel: property.priceLabel,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    area: property.area,
    areaUnit: property.areaUnit,
    image: property.image,
    imageAlt: property.imageAlt,
    featured: property.featured === 1,
    shortDescription: property.shortDescription,
  };
}

router.get("/properties", async (req, res): Promise<void> => {
  await ensureDemoProperties();
  const parsed = ListPropertiesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { city, country, propertyType, listingType, minBedrooms, featured, q } = parsed.data;
  const filters = [
    city ? eq(propertiesTable.city, city) : undefined,
    country ? eq(propertiesTable.country, country) : undefined,
    propertyType ? eq(propertiesTable.propertyType, propertyType) : undefined,
    listingType ? eq(propertiesTable.listingType, listingType) : undefined,
    minBedrooms !== undefined ? gte(propertiesTable.bedrooms, minBedrooms) : undefined,
    featured !== undefined ? eq(propertiesTable.featured, featured ? 1 : 0) : undefined,
    q ? or(
      ilike(propertiesTable.title, `%${q}%`),
      ilike(propertiesTable.location, `%${q}%`),
      ilike(propertiesTable.city, `%${q}%`),
    ) : undefined,
  ].filter(Boolean);

  const properties = await db
    .select()
    .from(propertiesTable)
    .where(filters.length ? and(...filters) : undefined)
    .orderBy(propertiesTable.featured, propertiesTable.createdAt);

  res.json(ListPropertiesResponse.parse(properties.map(toListProperty)));
});

router.get("/properties/:slug", async (req, res): Promise<void> => {
  await ensureDemoProperties();
  const params = GetPropertyParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [property] = await db
    .select()
    .from(propertiesTable)
    .where(eq(propertiesTable.slug, params.data.slug))
    .limit(1);

  if (!property) {
    res.status(404).json({ error: "Property not found" });
    return;
  }

  res.json(GetPropertyResponse.parse({
    ...toListProperty(property),
    description: property.description,
    images: property.images,
    amenities: property.amenities,
    developer: property.developer,
    completionStatus: property.completionStatus,
    nearby: property.nearby,
    videoUrl: property.videoUrl,
    brochureUrl: property.brochureUrl,
  }));
});

export default router;