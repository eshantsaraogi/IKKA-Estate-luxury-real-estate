import { createInsertSchema } from "drizzle-zod";
import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const blogPostsTable = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  status: text("status").notNull().default("draft"),
  featured: integer("featured").notNull().default(0),
  category: text("category").notNull().default("Insights"),
  tags: text("tags").array().notNull().default([]),
  featuredImage: text("featured_image"),
  featuredImageAlt: text("featured_image_alt"),
  author: text("author").notNull().default("IKKA Estate"),
  readingTime: integer("reading_time").notNull().default(5),
  scheduledFor: timestamp("scheduled_for", { withTimezone: true }),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  seoKeywords: text("seo_keywords"),
  canonicalUrl: text("canonical_url"),
  ogImage: text("og_image"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertBlogPostSchema = createInsertSchema(blogPostsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type BlogPost = typeof blogPostsTable.$inferSelect;