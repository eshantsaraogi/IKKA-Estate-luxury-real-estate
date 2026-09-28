import { createInsertSchema } from "drizzle-zod";
import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const propertiesTable = pgTable("properties", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  location: text("location").notNull(),
  city: text("city").notNull(),
  country: text("country").notNull(),
  propertyType: text("property_type").notNull(),
  listingType: text("listing_type").notNull(),
  status: text("status").notNull(),
  priceLabel: text("price_label").notNull(),
  bedrooms: integer("bedrooms").notNull(),
  bathrooms: integer("bathrooms").notNull(),
  area: integer("area").notNull(),
  areaUnit: text("area_unit").notNull().default("sq ft"),
  image: text("image").notNull(),
  imageAlt: text("image_alt").notNull(),
  featured: integer("featured").notNull().default(0),
  shortDescription: text("short_description").notNull(),
  description: text("description").notNull(),
  images: text("images").array().notNull(),
  amenities: text("amenities").array().notNull(),
  developer: text("developer").notNull(),
  completionStatus: text("completion_status").notNull(),
  nearby: text("nearby").array().notNull(),
  videoUrl: text("video_url"),
  brochureUrl: text("brochure_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertPropertySchema = createInsertSchema(propertiesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Property = typeof propertiesTable.$inferSelect;