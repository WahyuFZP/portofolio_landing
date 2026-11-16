import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Geist, Geist_Mono, Pixelify_Sans } from "next/font/google";
import "@/app/globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MotionProvider from "@/components/motion/MotionProvider";
import { themeScript } from "@/components/layout/ThemeToggle";
import { getDictionary } from "@/lib/dictionary";
import { isLocale, locales } from "@/lib/i18n";
import { profile } from "@/content/profile";

// display "optional": no late font swap, so the text LCP is not pushed back on slow networks.
const sans = Geist({ subsets: ["latin"], variable: "--font-geist-sans", display: "optional" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "optional", preload: false });
const pixel = Pixelify_Sans({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-pixelify", display: "swap" });

export const dynamicParams = false;
export const generateStaticParams = () => locales.map((locale) => ({ locale }));

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const { meta } = await getDictionary(locale);

  return {
    metadataBase: new URL(profile.siteUrl),
    title: { default: meta.title, template: `%s | ${profile.shortName}` },
    description: meta.description,
    alternates: {
      canonical: `/${locale}`,
      languages: Object.fromEntries(locales.map((l) => [l, `/${l}`])),
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: `/${locale}`,
      siteName: profile.shortName,
      locale: meta.ogLocale,
      type: "website",
      images: [{ url: profile.photo, width: 1063, height: 1417, alt: profile.name }],
    },
    twitter: { card: "summary", title: meta.title, description: meta.description, images: [profile.photo] },
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    jobTitle: profile.jobTitle,
    url: profile.siteUrl,
    email: `mailto:${profile.email}`,
    address: { "@type": "PostalAddress", addressLocality: "Bandung", addressCountry: "ID" },
    alumniOf: "Universitas Darul Ulum Jombang",
    worksFor: { "@type": "Organization", name: "PT Exodrinks Indonesia Prestige" },
    sameAs: [profile.github, profile.linkedin],
  };

  return (
    <html lang={locale} className={`${sans.variable} ${mono.variable} ${pixel.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="font-sans antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-fg"
        >
          {dict.nav.skip}
        </a>
        <MotionProvider>
          <Navbar locale={locale} dict={dict.nav} />
          <main id="main" className="mx-auto w-full max-w-5xl px-4 sm:px-6">
            {children}
          </main>
          <Footer locale={locale} dict={dict.footer} nav={dict.nav} />
        </MotionProvider>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </body>
    </html>
  );
}
