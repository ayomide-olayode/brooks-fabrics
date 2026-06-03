import type { Metadata } from "next";

export const siteConfig = {
  name: "Brooks Fabrics",
  url: "https://brooksfabrics.com",
  description:
    "Brooks Fabrics is your go-to destination for premium Ankara and African print fabrics. Shop a curated collection of vibrant patterns, traditional prints, and modern designs — delivered to your door across Nigeria.",
  keywords: [
    "ankara fabric",
    "african print fabric",
    "buy ankara online",
    "nigerian fabric store",
    "ankara fabric nigeria",
    "african wax print",
    "kente fabric",
    "traditional fabric nigeria",
    "fabric store online nigeria",
  ],
  ogImage: "https://brooksfabrics.com/og-image.jpg",
  twitterHandle: "@brooksfabrics",
};

// ── Base metadata (used in root layout) ──────────────────────────────────────

export const baseMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} | Premium Ankara Fabrics`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [{ name: siteConfig.name, url: siteConfig.url }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} | Premium Ankara Fabrics`,
    description: siteConfig.description,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} — Premium Ankara Fabrics`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} | Premium Ankara Fabrics`,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: siteConfig.twitterHandle,
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

// ── Helper: build product metadata ───────────────────────────────────────────

interface ProductMetaInput {
  name: string;
  description?: string;
  slug: string;
  images?: string[];
  pricePerYard: number;
  category?: string;
}

export function buildProductMetadata(product: ProductMetaInput): Metadata {
  const title = product.name;
  const description =
    product.description ||
    `Shop ${product.name} at Brooks Fabrics. Premium quality Ankara fabric available online. Fast delivery across Nigeria.`;
  const url = `${siteConfig.url}/product/${product.slug}`;
  const image = product.images?.[0] || siteConfig.ogImage;

  return {
    title,
    description,
    keywords: [
      product.name.toLowerCase(),
      product.category?.toLowerCase() ?? "",
      "ankara fabric",
      "african print",
      "buy fabric nigeria",
    ].filter(Boolean),
    openGraph: {
      type: "website",
      url,
      title: `${title} | ${siteConfig.name}`,
      description,
      images: [{ url: image, width: 800, height: 600, alt: product.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${siteConfig.name}`,
      description,
      images: [image],
    },
    alternates: { canonical: url },
  };
}

// ── Helper: build page metadata ───────────────────────────────────────────────

export function buildPageMetadata(
  title: string,
  description: string,
  path: string
): Metadata {
  const url = `${siteConfig.url}${path}`;
  return {
    title,
    description,
    openGraph: {
      type: "website",
      url,
      title: `${title} | ${siteConfig.name}`,
      description,
      images: [{ url: siteConfig.ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${siteConfig.name}`,
      description,
    },
    alternates: { canonical: url },
  };
}