import { MetadataRoute } from "next";
import { siteConfig } from "@/lib/seo";
import connectDB from "@/lib/db/mongoose";
import Product from "@/lib/db/models/Product";
import Service from "@/lib/db/models/Service";
import { getCategoryMap } from "@/lib/categories";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connectDB();

  // Fetch all products and services for dynamic routes
  const products = await Product.find({ stock: { $gt: 0 } })
    .select("slug updatedAt")
    .lean();

  const services = await Service.find()
    .select("slug updatedAt")
    .lean();

  const productUrls: MetadataRoute.Sitemap = products.map((p: { slug: string; updatedAt?: Date }) => ({
    url: `${siteConfig.url}/product/${p.slug}`,
    lastModified: p.updatedAt ?? new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const serviceUrls: MetadataRoute.Sitemap = services.map((s: { slug: string; updatedAt?: Date }) => ({
    url: `${siteConfig.url}/services#${s.slug}`,
    lastModified: s.updatedAt ?? new Date(),
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  const map = await getCategoryMap();
  const categoryUrls: MetadataRoute.Sitemap = [...map.keys()].map(slug => ({
    url: `${siteConfig.url}/shop/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteConfig.url,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${siteConfig.url}/shop`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteConfig.url}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${siteConfig.url}/services`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  return [...staticPages, ...categoryUrls, ...productUrls, ...serviceUrls];
}