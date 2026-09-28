import { useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { ClerkProvider, SignIn, SignUp } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { shadcn } from '@clerk/themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BedDouble,
  Building2,
  Check,
  ChevronDown,
  CircleArrowOutUpRight,
  Compass,
  ExternalLink,
  Facebook,
  Instagram,
  LoaderCircle,
  Mail,
  MapPin,
  Menu,
  Minus,
  Phone,
  Play,
  Plus,
  Search,
  Send,
  Sparkles,
  X,
} from 'lucide-react';
import {
  getGetPropertyQueryKey,
  getListPropertiesQueryKey,
  useCreateEnquiry,
  useGetProperty,
  useListProperties,
  type EnquiryInput,
  type Property,
  type PropertyDetail,
} from '@workspace/api-client-react';
import { Link, Route, Router as WouterRouter, Switch, useLocation, useParams } from 'wouter';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AdminRoute } from '@/admin';

const queryClient = new QueryClient();
const clerkPubKey = publishableKeyFromHost(window.location.hostname, import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
const logoPath = '/ikka-logo-cropped.png';
const fallbackImages = [
  'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=1400',
  'https://images.pexels.com/photos/7031408/pexels-photo-7031408.jpeg?auto=compress&cs=tinysrgb&w=1400',
  'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1400',
  'https://images.pexels.com/photos/5825532/pexels-photo-5825532.jpeg?auto=compress&cs=tinysrgb&w=1400',
];

const editorialNotes = [
  { index: '01', title: 'The art of arriving', text: 'A private address is more than an asset. It is the first line of a life well considered.', route: '/blog/the-art-of-arriving' },
  { index: '02', title: 'Two cities, one instinct', text: 'Where old-world rhythm and ambitious horizons meet, we find the right point of view.', route: '/blog/two-cities-one-instinct' },
  { index: '03', title: 'An eye for the enduring', text: 'Materials, proportion, silence. The details that make a home remain compelling.', route: '/blog/the-enduring-home' },
];

function imageFor(property: Pick<Property, 'image' | 'id'>, offset = 0) {
  return property.image || fallbackImages[(property.id + offset) % fallbackImages.length];
}

function ImageWithFallback({ src, alt, className = '' }: { src?: string; alt: string; className?: string }) {
  const [source, setSource] = useState(src || fallbackImages[0]);
  return (
    <img
      src={source}
      alt={alt}
      className={className}
      onError={() => setSource(fallbackImages[0])}
    />
  );
}

function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <img
      src={logoPath}
      alt="IKKA Estate"
      data-testid="img-ikka-logo"
      className={`h-auto w-[118px] object-contain ${dark ? 'brightness-0 invert' : ''}`}
    />
  );
}

function SiteHeader() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const links = [
    { href: '/properties', label: 'The collection' },
    { href: '/dubai', label: 'Dubai' },
    { href: '/delhi', label: 'Delhi' },
    { href: '/about', label: 'Our point of view' },
    { href: '/blog', label: 'Journal' },
  ];
  return (
    <header className="absolute inset-x-0 top-0 z-30 border-b border-white/20 text-white">
      <div className="mx-auto flex h-[78px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
        <Link href="/" data-testid="link-home-logo" aria-label="IKKA Estate home">
          <Logo dark />
        </Link>
        <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              data-testid={`link-nav-${link.label.toLowerCase().replaceAll(' ', '-')}`}
              className={`nav-link text-[11px] font-semibold uppercase tracking-[.16em] text-white/85 transition-colors hover:text-white ${location === link.href ? 'active text-white' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/contact"
          data-testid="link-header-enquire"
          className="hidden border border-white/60 px-5 py-3 text-[10px] font-bold uppercase tracking-[.2em] transition-colors hover:bg-white hover:text-[#283c33] sm:block"
        >
          Private enquiry
        </Link>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          data-testid="button-toggle-menu"
          className="p-2 md:hidden"
          aria-label="Toggle navigation menu"
        >
          {open ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>
      {open && (
        <div className="border-t border-white/20 bg-[#283c33] px-5 py-5 md:hidden">
          <nav className="flex flex-col gap-5">
            {links.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)} data-testid={`link-mobile-${link.label.toLowerCase().replaceAll(' ', '-')}`} className="text-sm uppercase tracking-[.16em] text-white/85">
                {link.label}
              </Link>
            ))}
            <Link href="/contact" onClick={() => setOpen(false)} className="text-sm uppercase tracking-[.16em] text-[#d9b96e]">Private enquiry</Link>
          </nav>
        </div>
      )}
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="bg-[#283c33] px-5 pb-8 pt-16 text-[#f1eee6] sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[1440px]">
        <div className="grid gap-12 border-b border-white/15 pb-14 md:grid-cols-[1.3fr_.8fr_.8fr_.9fr]">
          <div>
            <Logo dark />
            <p className="mt-8 max-w-[280px] font-display text-2xl leading-[1.18] text-[#e6c982]">A quieter way to find extraordinary homes.</p>
          </div>
          <div>
            <p className="mb-5 text-[10px] font-bold uppercase tracking-[.2em] text-[#d9b96e]">Explore</p>
            <div className="flex flex-col gap-3 text-sm text-white/70">
              <Link href="/properties" data-testid="link-footer-collection" className="transition-colors hover:text-white">The collection</Link>
              <Link href="/dubai" data-testid="link-footer-dubai" className="transition-colors hover:text-white">Dubai</Link>
              <Link href="/delhi" data-testid="link-footer-delhi" className="transition-colors hover:text-white">Delhi</Link>
              <Link href="/blog" data-testid="link-footer-journal" className="transition-colors hover:text-white">Journal</Link>
            </div>
          </div>
          <div>
            <p className="mb-5 text-[10px] font-bold uppercase tracking-[.2em] text-[#d9b96e]">Speak with us</p>
            <div className="flex flex-col gap-3 text-sm text-white/70">
              <Link href="/contact" data-testid="link-footer-contact" className="transition-colors hover:text-white">Begin a conversation</Link>
              <a href="mailto:hello@ikkaestate.com" data-testid="link-footer-email" className="transition-colors hover:text-white">hello@ikkaestate.com</a>
              <a href="tel:+971000000000" data-testid="link-footer-phone" className="transition-colors hover:text-white">+971 00 000 0000</a>
            </div>
          </div>
          <div>
            <p className="mb-5 text-[10px] font-bold uppercase tracking-[.2em] text-[#d9b96e]">Follow the edit</p>
            <div className="flex gap-3">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" data-testid="link-instagram" className="border border-white/20 p-3 transition-colors hover:border-[#d9b96e] hover:text-[#d9b96e]"><Instagram size={16} /></a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" data-testid="link-facebook" className="border border-white/20 p-3 transition-colors hover:border-[#d9b96e] hover:text-[#d9b96e]"><Facebook size={16} /></a>
            </div>
          </div>
        </div>
        <div className="flex flex-col justify-between gap-4 pt-6 text-[10px] uppercase tracking-[.16em] text-white/40 sm:flex-row">
          <span>© 2025 IKKA Estate. All rights reserved.</span>
          <div className="flex gap-5">
            <Link href="/privacy" data-testid="link-footer-privacy">Privacy</Link>
            <Link href="/terms" data-testid="link-footer-terms">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function PageFrame({ children, darkHero = false }: { children: ReactNode; darkHero?: boolean }) {
  return (
    <div className="site-noise min-h-[100dvh] bg-[#f1eee6] text-[#283c33]">
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}

function SectionIntro({ eyebrow, title, copy, light = false }: { eyebrow: string; title: ReactNode; copy?: string; light?: boolean }) {
  return (
    <div className={`max-w-[720px] ${light ? 'text-[#f1eee6]' : ''}`}>
      <p className="mb-5 text-[10px] font-bold uppercase tracking-[.23em] text-[#b28b42]">{eyebrow}</p>
      <h2 className="font-display text-4xl leading-[1.04] sm:text-5xl lg:text-[66px]">{title}</h2>
      {copy && <p className={`mt-6 max-w-[500px] text-base leading-7 ${light ? 'text-white/65' : 'text-[#52625a]'}`}>{copy}</p>}
    </div>
  );
}

function PropertyCard({ property, index = 0 }: { property: Property; index?: number }) {
  return (
    <Link href={`/properties/${property.slug}`} data-testid={`card-property-${property.id}`} className="group block">
      <div className="image-zoom relative aspect-[4/5] overflow-hidden bg-[#d8d8cf]">
        <ImageWithFallback src={imageFor(property, index)} alt={property.imageAlt || property.title} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1d3029]/60 via-transparent to-transparent opacity-80" />
        <div className="absolute left-5 top-5 flex gap-2">
          {property.featured && <span className="bg-[#d9b96e] px-3 py-2 text-[9px] font-bold uppercase tracking-[.15em] text-[#283c33]">Featured</span>}
          <span className="border border-white/50 bg-[#283c33]/20 px-3 py-2 text-[9px] font-bold uppercase tracking-[.15em] text-white backdrop-blur-sm">{property.listingType || 'Private sale'}</span>
        </div>
        <div className="absolute bottom-5 left-5 right-5 text-white">
          <p className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[.18em] text-white/75"><MapPin size={12} />{property.location || property.city}</p>
          <h3 className="font-display text-3xl leading-none">{property.title}</h3>
          <div className="mt-4 flex items-center justify-between border-t border-white/25 pt-3 text-[11px] uppercase tracking-[.1em]">
            <span>{property.priceLabel}</span>
            <span className="flex items-center gap-2 text-white/75">{property.bedrooms} bed <span className="h-1 w-1 rounded-full bg-[#d9b96e]" /> {property.area?.toLocaleString()} {property.areaUnit}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function PropertySkeleton({ index }: { index: number }) {
  return <div className={`animate-pulse ${index === 1 ? 'mt-12' : ''}`}><div className="aspect-[4/5] bg-[#dfddd5]" /><div className="mt-4 h-4 w-2/3 bg-[#dfddd5]" /><div className="mt-2 h-3 w-1/3 bg-[#dfddd5]" /></div>;
}

function EnquiryForm({ propertySlug, title = 'Start a private conversation.', compact = false }: { propertySlug?: string; title?: string; compact?: boolean }) {
  const createEnquiry = useCreateEnquiry();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', country: '', message: '', preferredContact: 'Email' });
  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data: EnquiryInput = { ...form, propertySlug: propertySlug || null, enquiryType: propertySlug ? 'Property enquiry' : 'General enquiry' };
    createEnquiry.mutate({ data }, { onSuccess: () => setSubmitted(true) });
  };
  if (submitted) {
    return (
      <div className={`flex min-h-[310px] flex-col items-start justify-center ${compact ? 'p-7' : 'p-10'} bg-[#d9b96e] text-[#283c33]`}>
        <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-full border border-[#283c33]/40"><Check size={18} /></div>
        <p className="text-[10px] font-bold uppercase tracking-[.2em]">Message received</p>
        <h3 className="mt-3 font-display text-3xl leading-tight">We will be in touch shortly.</h3>
        <button type="button" data-testid="button-send-another-enquiry" onClick={() => setSubmitted(false)} className="mt-8 border-b border-[#283c33] pb-1 text-[10px] font-bold uppercase tracking-[.18em]">Send another note</button>
      </div>
    );
  }
  return (
    <form onSubmit={submit} className={`${compact ? 'p-7' : 'p-8 sm:p-10'} bg-[#283c33] text-[#f1eee6]`}>
      <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#d9b96e]">By appointment</p>
      <h3 className="mt-4 max-w-[340px] font-display text-3xl leading-tight sm:text-4xl">{title}</h3>
      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <label className="text-[10px] uppercase tracking-[.16em] text-white/55">Name<input required minLength={2} value={form.name} onChange={(e) => update('name', e.target.value)} data-testid="input-enquiry-name" className="form-input" placeholder="Your name" /></label>
        <label className="text-[10px] uppercase tracking-[.16em] text-white/55">Email<input required type="email" value={form.email} onChange={(e) => update('email', e.target.value)} data-testid="input-enquiry-email" className="form-input" placeholder="you@example.com" /></label>
        <label className="text-[10px] uppercase tracking-[.16em] text-white/55">Phone<input value={form.phone} onChange={(e) => update('phone', e.target.value)} data-testid="input-enquiry-phone" className="form-input" placeholder="+971" /></label>
        <label className="text-[10px] uppercase tracking-[.16em] text-white/55">Country<input value={form.country} onChange={(e) => update('country', e.target.value)} data-testid="input-enquiry-country" className="form-input" placeholder="Country of residence" /></label>
      </div>
      <label className="mt-5 block text-[10px] uppercase tracking-[.16em] text-white/55">Your note<textarea required minLength={5} value={form.message} onChange={(e) => update('message', e.target.value)} data-testid="textarea-enquiry-message" className="form-input min-h-[100px] resize-y" placeholder="Tell us what you are looking for..." /></label>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
        <label className="flex items-center gap-2 text-[10px] uppercase tracking-[.12em] text-white/55">Preferred contact<select value={form.preferredContact} onChange={(e) => update('preferredContact', e.target.value)} data-testid="select-preferred-contact" className="bg-transparent text-[#d9b96e] outline-none"><option className="text-[#283c33]">Email</option><option className="text-[#283c33]">Phone</option><option className="text-[#283c33]">WhatsApp</option></select></label>
        <button type="submit" disabled={createEnquiry.isPending} data-testid="button-submit-enquiry" className="group flex items-center gap-3 bg-[#d9b96e] px-6 py-3 text-[10px] font-bold uppercase tracking-[.17em] text-[#283c33] transition-colors hover:bg-[#f1eee6] disabled:opacity-60">{createEnquiry.isPending ? <LoaderCircle className="animate-spin" size={14} /> : <Send size={14} />} Send enquiry</button>
      </div>
      {createEnquiry.isError && <p data-testid="status-enquiry-error" className="mt-4 text-xs text-[#e6a295]">Something went wrong. Please try again or email us directly.</p>}
    </form>
  );
}

function Home() {
  const featuredQuery = useListProperties({ featured: true }, { query: { queryKey: getListPropertiesQueryKey({ featured: true }) } });
  const properties = featuredQuery.data || [];
  return (
    <PageFrame>
      <section className="relative min-h-[720px] overflow-hidden bg-[#283c33] text-white lg:min-h-[800px]">
        <div className="absolute inset-0">
          <ImageWithFallback src={fallbackImages[1]} alt="An architectural home at dusk" className="h-full w-full object-cover opacity-55 mix-blend-luminosity" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1d3029]/95 via-[#283c33]/55 to-[#283c33]/20" />
          <div className="absolute inset-0 hero-grid opacity-30" />
        </div>
        <div className="relative mx-auto flex min-h-[720px] max-w-[1440px] flex-col justify-end px-5 pb-16 pt-32 sm:px-8 lg:min-h-[800px] lg:px-12 lg:pb-24">
          <div className="max-w-[850px] reveal">
            <p className="mb-7 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[.25em] text-[#d9b96e]"><span className="h-px w-8 bg-[#d9b96e]" />Independent property advisory · Dubai / Delhi</p>
            <h1 className="max-w-[840px] font-display text-6xl leading-[.88] tracking-[-.04em] sm:text-8xl lg:text-[132px]">The address<br /><i>after</i> arrival.</h1>
            <p className="mt-8 max-w-[450px] text-base leading-7 text-white/72 sm:text-lg">A considered collection of exceptional homes, selected for their sense of place, proportion and possibility.</p>
            <div className="mt-10 flex flex-wrap items-center gap-5">
              <Link href="/properties" data-testid="link-hero-collection" className="group flex items-center gap-4 bg-[#d9b96e] px-6 py-4 text-[10px] font-bold uppercase tracking-[.18em] text-[#283c33] transition-colors hover:bg-[#f1eee6]">Explore the collection <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" /></Link>
              <Link href="/about" data-testid="link-hero-approach" className="flex items-center gap-3 border-b border-white/50 pb-2 text-[10px] font-bold uppercase tracking-[.18em] text-white hover:border-[#d9b96e]">Our approach <ArrowRight size={14} /></Link>
            </div>
          </div>
          <div className="mt-16 flex items-end justify-between border-t border-white/25 pt-4 text-[10px] uppercase tracking-[.18em] text-white/55">
            <span>Scroll to discover</span><span className="flex items-center gap-2"><ArrowDown size={14} /> 01 — 05</span>
          </div>
        </div>
      </section>
      <section className="px-5 py-24 sm:px-8 lg:px-12 lg:py-36">
        <div className="mx-auto grid max-w-[1440px] gap-16 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
          <SectionIntro eyebrow="A point of view" title={<>Not more homes.<br /><i>Better</i> homes.</>} />
          <div className="max-w-[530px] lg:justify-self-end">
            <p className="text-xl leading-8 text-[#52625a] sm:text-2xl">IKKA Estate is for people who know the difference a good address makes. We bring the discernment of a private advisor to a more open, more human way of finding home.</p>
            <Link href="/about" data-testid="link-home-point-of-view" className="mt-8 inline-flex items-center gap-3 border-b border-[#283c33] pb-2 text-[10px] font-bold uppercase tracking-[.18em]">Why IKKA <ArrowUpRight size={15} /></Link>
          </div>
        </div>
      </section>
      <section className="bg-[#e3dfd3] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="mx-auto max-w-[1440px]">
          <div className="mb-12 flex items-end justify-between gap-6">
            <SectionIntro eyebrow="The edit · Q2 2025" title="Places with pull." />
            <Link href="/properties" data-testid="link-home-view-all" className="hidden items-center gap-3 border-b border-[#283c33] pb-2 text-[10px] font-bold uppercase tracking-[.17em] sm:flex">View all residences <ArrowRight size={15} /></Link>
          </div>
          {featuredQuery.isLoading ? <div className="grid gap-6 md:grid-cols-3"><PropertySkeleton index={0} /><PropertySkeleton index={1} /><PropertySkeleton index={2} /></div> : properties.length > 0 ? <div className="grid gap-6 md:grid-cols-3">{properties.slice(0, 3).map((property, index) => <div key={property.id} className={index === 1 ? 'md:mt-16' : ''}><PropertyCard property={property} index={index} /></div>)}</div> : <EmptyProperties /> }
          <Link href="/properties" data-testid="link-home-view-all-mobile" className="mt-8 inline-flex items-center gap-3 border-b border-[#283c33] pb-2 text-[10px] font-bold uppercase tracking-[.17em] sm:hidden">View all residences <ArrowRight size={15} /></Link>
        </div>
      </section>
      <section className="overflow-hidden bg-[#283c33] px-5 py-24 text-[#f1eee6] sm:px-8 lg:px-12 lg:py-36">
        <div className="mx-auto grid max-w-[1440px] gap-14 lg:grid-cols-[.8fr_1.2fr]">
          <SectionIntro eyebrow="Two coordinates" title={<>Between a<br /><i>future</i> and a feeling.</>} copy="Dubai moves at the speed of possibility. Delhi carries the weight of memory. Our work begins where those two energies become an address." light />
          <div className="grid gap-5 sm:grid-cols-2 lg:pt-20">
            <Link href="/dubai" data-testid="card-city-dubai" className="group relative min-h-[340px] overflow-hidden border border-white/20 p-7">
              <ImageWithFallback src={fallbackImages[2]} alt="Dubai architecture" className="absolute inset-0 h-full w-full object-cover opacity-40 mix-blend-luminosity transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-[#283c33]/55" /><div className="relative flex h-full flex-col justify-between"><span className="text-[10px] uppercase tracking-[.2em] text-[#d9b96e]">01 / Dubai</span><span><span className="mb-3 block font-display text-4xl">The new<br /><i>horizon.</i></span><span className="flex items-center gap-2 text-[10px] uppercase tracking-[.18em]">View Dubai <ArrowUpRight size={14} /></span></span></div>
            </Link>
            <Link href="/delhi" data-testid="card-city-delhi" className="group relative min-h-[340px] overflow-hidden border border-white/20 p-7 sm:mt-14">
              <ImageWithFallback src={fallbackImages[3]} alt="Delhi architecture" className="absolute inset-0 h-full w-full object-cover opacity-40 mix-blend-luminosity transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-[#283c33]/55" /><div className="relative flex h-full flex-col justify-between"><span className="text-[10px] uppercase tracking-[.2em] text-[#d9b96e]">02 / Delhi</span><span><span className="mb-3 block font-display text-4xl">A certain<br /><i>gravity.</i></span><span className="flex items-center gap-2 text-[10px] uppercase tracking-[.18em]">View Delhi <ArrowUpRight size={14} /></span></span></div>
            </Link>
          </div>
        </div>
      </section>
      <section className="px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
        <div className="mx-auto grid max-w-[1440px] gap-12 lg:grid-cols-[.7fr_1.3fr]">
          <SectionIntro eyebrow="From the journal" title="A little context." copy="Notes on cities, homes and the art of choosing well." />
          <div className="divide-y divide-[#cfcabd] border-y border-[#cfcabd]">{editorialNotes.map((note) => <Link href={note.route} key={note.index} data-testid={`link-editorial-note-${note.index}`} className="group grid grid-cols-[45px_1fr_auto] items-center gap-4 py-7 transition-colors hover:text-[#a47e39] sm:grid-cols-[70px_1fr_auto]"><span className="font-ui text-[10px] tracking-[.15em] text-[#b28b42]">{note.index}</span><span><strong className="font-display text-2xl font-medium">{note.title}</strong><span className="mt-1 block max-w-[440px] text-sm leading-6 text-[#65736c]">{note.text}</span></span><ArrowUpRight size={18} className="transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" /></Link>)}</div>
        </div>
      </section>
      <section className="bg-[#d9b96e] px-5 py-20 sm:px-8 lg:px-12"><div className="mx-auto flex max-w-[1440px] flex-col justify-between gap-10 md:flex-row md:items-end"><div><p className="text-[10px] font-bold uppercase tracking-[.22em]">Your next address</p><h2 className="mt-4 max-w-[720px] font-display text-5xl leading-[.95] sm:text-7xl">Let the search<br /><i>become personal.</i></h2></div><Link href="/contact" data-testid="link-home-contact" className="group flex items-center gap-3 border-b border-[#283c33] pb-2 text-[10px] font-bold uppercase tracking-[.18em]">Begin a private enquiry <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" /></Link></div></section>
    </PageFrame>
  );
}

function EmptyProperties() {
  return <div className="border border-dashed border-[#bcb9ad] p-12 text-center"><Compass className="mx-auto text-[#b28b42]" size={28} /><p className="mt-5 font-display text-2xl">The edit is being refined.</p><p className="mt-2 text-sm text-[#65736c]">Speak with us for private, off-market opportunities.</p></div>;
}

function PropertiesPage() {
  const [filters, setFilters] = useState({ city: '', propertyType: '', listingType: '', q: '' });
  const params = useMemo(() => ({ city: filters.city || undefined, propertyType: filters.propertyType || undefined, listingType: filters.listingType || undefined, q: filters.q || undefined }), [filters]);
  const query = useListProperties(params, { query: { queryKey: getListPropertiesQueryKey(params) } });
  const data = query.data || [];
  return (
    <PageFrame>
      <PageHero eyebrow="The collection" title={<>Homes with<br /><i>intent.</i></>} copy="A concise edit of residences across Dubai and Delhi. Every listing is presented with context, not clutter." />
      <section className="px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
        <div className="mx-auto max-w-[1440px]">
          <div className="mb-12 flex flex-col gap-6 border-b border-[#cfcabd] pb-8 lg:flex-row lg:items-end lg:justify-between">
            <div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#b28b42]">Find your coordinates</p><div className="mt-5 flex flex-wrap gap-2">
              <FilterSelect label="City" value={filters.city} onChange={(value) => setFilters({ ...filters, city: value })} options={['', 'Dubai', 'Delhi']} />
              <FilterSelect label="Type" value={filters.propertyType} onChange={(value) => setFilters({ ...filters, propertyType: value })} options={['', 'Apartment', 'Villa', 'Penthouse', 'House']} />
              <FilterSelect label="Availability" value={filters.listingType} onChange={(value) => setFilters({ ...filters, listingType: value })} options={['', 'For Sale', 'For Rent']} />
            </div></div>
            <label className="flex min-w-[260px] items-center gap-3 border-b border-[#9fa69e] pb-3 text-[#65736c]"><Search size={16} /><span className="sr-only">Search properties</span><input value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })} data-testid="input-search-properties" className="w-full bg-transparent text-sm outline-none placeholder:text-[#87918a]" placeholder="Search by neighbourhood or name" /></label>
          </div>
          {query.isLoading ? <div className="grid gap-x-6 gap-y-12 md:grid-cols-3"><PropertySkeleton index={0} /><PropertySkeleton index={1} /><PropertySkeleton index={2} /></div> : query.isError ? <div className="border border-[#c8bdb2] p-12 text-center"><p className="font-display text-2xl">The collection is momentarily out of reach.</p><button type="button" onClick={() => query.refetch()} data-testid="button-retry-properties" className="mt-5 border-b border-[#283c33] pb-1 text-[10px] font-bold uppercase tracking-[.18em]">Try again</button></div> : data.length ? <div className="grid gap-x-6 gap-y-14 md:grid-cols-3">{data.map((property, index) => <div key={property.id} className={index % 3 === 1 ? 'md:mt-16' : ''}><PropertyCard property={property} index={index} /></div>)}</div> : <EmptyProperties />}
        </div>
      </section>
    </PageFrame>
  );
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return <label className="relative flex items-center gap-2 border border-[#cfcabd] px-4 py-3 text-[10px] font-bold uppercase tracking-[.15em]"><span className="text-[#65736c]">{label}</span><select value={value} onChange={(e) => onChange(e.target.value)} data-testid={`select-filter-${label.toLowerCase()}`} className="appearance-none bg-transparent pr-4 outline-none"><option value="">All</option>{options.filter(Boolean).map((option) => <option key={option} value={option}>{option}</option>)}</select><ChevronDown size={12} className="pointer-events-none absolute right-3" /></label>;
}

function PageHero({ eyebrow, title, copy }: { eyebrow: string; title: ReactNode; copy: string }) {
  return <section className="bg-[#283c33] px-5 pb-20 pt-36 text-[#f1eee6] sm:px-8 lg:px-12 lg:pb-28 lg:pt-48"><div className="mx-auto max-w-[1440px]"><p className="mb-6 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[.23em] text-[#d9b96e]"><span className="h-px w-8 bg-[#d9b96e]" />{eyebrow}</p><h1 className="max-w-[880px] font-display text-6xl leading-[.9] sm:text-8xl lg:text-[112px]">{title}</h1><p className="mt-8 max-w-[490px] text-base leading-7 text-white/65">{copy}</p></div></section>;
}

function PropertyDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug || '';
  const query = useGetProperty(slug, { query: { queryKey: getGetPropertyQueryKey(slug), enabled: !!slug } });
  const property = query.data;
  if (query.isLoading) return <PageFrame><div className="mx-auto max-w-[1440px] px-5 pb-24 pt-40 sm:px-8 lg:px-12"><div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]"><div className="h-[560px] animate-pulse bg-[#dfddd5]" /><div className="h-[400px] animate-pulse bg-[#dfddd5]" /></div></div></PageFrame>;
  if (query.isError || !property) return <PageFrame><div className="mx-auto max-w-[700px] px-5 pb-28 pt-48 text-center"><p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#b28b42]">Property not found</p><h1 className="mt-5 font-display text-6xl">A different<br /><i>direction.</i></h1><Link href="/properties" data-testid="link-detail-back-collection" className="mt-8 inline-flex items-center gap-2 border-b border-[#283c33] pb-2 text-[10px] font-bold uppercase tracking-[.17em]"><ArrowLeft size={14} /> Back to collection</Link></div></PageFrame>;
  return <PageFrame><PropertyDetailContent property={property} /></PageFrame>;
}

function PropertyDetailContent({ property }: { property: PropertyDetail }) {
  const [activeImage, setActiveImage] = useState(0);
  const images = property.images?.length ? property.images : [property.image];
  return <>
    <section className="bg-[#283c33] px-5 pb-14 pt-32 text-[#f1eee6] sm:px-8 lg:px-12 lg:pb-20 lg:pt-40"><div className="mx-auto max-w-[1440px]"><Link href="/properties" data-testid="link-detail-back" className="mb-12 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.17em] text-white/60 transition-colors hover:text-[#d9b96e]"><ArrowLeft size={14} /> Collection</Link><div className="grid gap-12 lg:grid-cols-[1.1fr_.9fr] lg:items-end"><div><p className="mb-5 flex items-center gap-2 text-[10px] uppercase tracking-[.2em] text-[#d9b96e]"><MapPin size={12} /> {property.location} · {property.city}</p><h1 className="max-w-[740px] font-display text-6xl leading-[.9] sm:text-8xl">{property.title}</h1></div><div className="lg:pb-2"><p className="max-w-[390px] text-base leading-7 text-white/65">{property.shortDescription || 'A considered residence in a singular setting.'}</p><p className="mt-6 text-xl text-[#d9b96e]">{property.priceLabel}</p></div></div></div></section>
    <section className="bg-[#283c33] px-5 pb-20 sm:px-8 lg:px-12 lg:pb-28"><div className="mx-auto grid max-w-[1440px] gap-3 sm:grid-cols-[1.4fr_.6fr]"><div className="image-zoom relative aspect-[4/3] overflow-hidden sm:aspect-[1.2/1]"><ImageWithFallback src={images[activeImage]} alt={`${property.title} view ${activeImage + 1}`} className="h-full w-full object-cover" /><div className="absolute bottom-5 left-5 flex gap-2">{images.map((_, index) => <button key={index} type="button" onClick={() => setActiveImage(index)} data-testid={`button-detail-image-${index}`} aria-label={`View image ${index + 1}`} className={`h-1 transition-all ${activeImage === index ? 'w-12 bg-[#d9b96e]' : 'w-5 bg-white/50'}`} />)}</div></div><div className="hidden gap-3 sm:grid">{images.slice(1, 3).map((image, index) => <div key={image} className="image-zoom overflow-hidden"><ImageWithFallback src={image} alt={`${property.title} detail ${index + 2}`} className="h-full w-full object-cover" /></div>)}</div></div></section>
    <section className="px-5 py-20 sm:px-8 lg:px-12 lg:py-28"><div className="mx-auto grid max-w-[1440px] gap-16 lg:grid-cols-[.8fr_1.2fr]"><div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#b28b42]">The details</p><div className="mt-7 grid grid-cols-2 gap-y-7 border-t border-[#cfcabd] pt-6 text-sm"><DetailStat icon={<BedDouble size={15} />} label="Bedrooms" value={`${property.bedrooms}`} /><DetailStat icon={<Building2 size={15} />} label="Bathrooms" value={`${property.bathrooms}`} /><DetailStat icon={<Minus size={15} />} label="Area" value={`${property.area?.toLocaleString()} ${property.areaUnit}`} /><DetailStat icon={<Sparkles size={15} />} label="Status" value={property.completionStatus || property.status} /></div><div className="mt-10 border-t border-[#cfcabd] pt-5 text-sm"><p className="text-[10px] uppercase tracking-[.16em] text-[#65736c]">Developer</p><p className="mt-2">{property.developer || 'Presented privately'}</p></div>{property.nearby?.length ? <div className="mt-10 border-t border-[#cfcabd] pt-5 text-sm"><p className="text-[10px] uppercase tracking-[.16em] text-[#65736c]">Nearby</p><div className="mt-3 space-y-2 text-[#52625a]">{property.nearby.map((place) => <p key={place} className="flex items-center gap-2"><MapPin size={13} className="text-[#b28b42]" />{place}</p>)}</div></div> : null}</div><div className="max-w-[650px]"><p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#b28b42]">A closer look</p><div className="prose prose-lg mt-7 max-w-none text-[#52625a]"><p className="whitespace-pre-line leading-8">{property.description}</p></div>{property.amenities?.length > 0 && <div className="mt-12 border-t border-[#cfcabd] pt-7"><p className="text-[10px] uppercase tracking-[.16em] text-[#65736c]">Considered amenities</p><div className="mt-5 grid gap-3 sm:grid-cols-2">{property.amenities.map((amenity) => <div key={amenity} className="flex items-center gap-3 text-sm"><Check size={14} className="text-[#b28b42]" />{amenity}</div>)}</div></div>}{(property.videoUrl || property.brochureUrl) && <div className="mt-12 flex flex-wrap gap-5 border-t border-[#cfcabd] pt-6">{property.videoUrl && <a href={property.videoUrl} target="_blank" rel="noreferrer" data-testid="link-property-video" className="inline-flex items-center gap-2 border-b border-[#283c33] pb-2 text-[10px] font-bold uppercase tracking-[.16em]"><Play size={13} /> Watch film</a>}{property.brochureUrl && <a href={property.brochureUrl} target="_blank" rel="noreferrer" data-testid="link-property-brochure" className="inline-flex items-center gap-2 border-b border-[#283c33] pb-2 text-[10px] font-bold uppercase tracking-[.16em]"><ExternalLink size={13} /> Download brochure</a>}</div>}</div></div></section>
    <section className="bg-[#e3dfd3] px-5 py-20 sm:px-8 lg:px-12 lg:py-28"><div className="mx-auto grid max-w-[1440px] gap-10 lg:grid-cols-[1fr_.8fr]"><div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#b28b42]">Make it yours</p><h2 className="mt-5 max-w-[560px] font-display text-5xl leading-none sm:text-7xl">The right home<br /><i>starts here.</i></h2></div><EnquiryForm propertySlug={property.slug} title={`Tell us about your interest in ${property.title}.`} /></div></section>
  </>;
}

function DetailStat({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return <div><div className="flex items-center gap-2 text-[#b28b42]">{icon}<span className="text-[10px] uppercase tracking-[.15em] text-[#65736c]">{label}</span></div><p className="mt-2 text-lg">{value}</p></div>;
}

function CityPage({ city }: { city: 'Dubai' | 'Delhi' }) {
  const isDubai = city === 'Dubai';
  const query = useListProperties({ city }, { query: { queryKey: getListPropertiesQueryKey({ city }) } });
  const properties = query.data || [];
  return <PageFrame><PageHero eyebrow={`The ${city} edit`} title={isDubai ? <>The new<br /><i>horizon.</i></> : <>A certain<br /><i>gravity.</i></>} copy={isDubai ? 'Where ambition takes architectural form. A city of private gardens, sky-bound living and a horizon that keeps moving.' : 'A city of layers, light and lineage. For those who understand that the most compelling luxury is rarely the loudest.'} /><section className="px-5 py-20 sm:px-8 lg:px-12 lg:py-32"><div className="mx-auto max-w-[1440px]"><div className="grid gap-14 lg:grid-cols-[.8fr_1.2fr]"><SectionIntro eyebrow={`A local perspective · ${city}`} title={isDubai ? <>Room to<br /><i>become.</i></> : <>Where the<br /><i>old meets.</i></>} /><div className="max-w-[580px] text-lg leading-8 text-[#52625a]"><p>{isDubai ? 'Dubai is a study in possibility. From the calm of Jumeirah to the sculpted skyline of Downtown, the city rewards a clear eye and a long view. We look beyond the spectacle to find residences with a quieter kind of confidence.' : 'Delhi rewards attention. Behind its broad avenues and intimate neighbourhoods are homes that carry history forward with uncommon ease. Our Delhi edit is guided by the same instinct: proportion, privacy and a sense of belonging.'}</p><Link href="/contact" data-testid={`link-${city.toLowerCase()}-enquire`} className="mt-8 inline-flex items-center gap-3 border-b border-[#283c33] pb-2 text-[10px] font-bold uppercase tracking-[.18em]">Talk to a local advisor <ArrowUpRight size={15} /></Link></div></div></div></section><section className="bg-[#e3dfd3] px-5 py-20 sm:px-8 lg:px-12 lg:py-28"><div className="mx-auto max-w-[1440px]"><div className="mb-12 flex items-end justify-between"><SectionIntro eyebrow={`Selected residences · ${city}`} title="The local edit." /><Link href="/properties" data-testid={`link-${city.toLowerCase()}-all`} className="hidden items-center gap-3 border-b border-[#283c33] pb-2 text-[10px] font-bold uppercase tracking-[.17em] sm:flex">View all <ArrowRight size={15} /></Link></div>{query.isLoading ? <div className="grid gap-6 md:grid-cols-3"><PropertySkeleton index={0} /><PropertySkeleton index={1} /><PropertySkeleton index={2} /></div> : properties.length ? <div className="grid gap-6 md:grid-cols-3">{properties.slice(0, 3).map((property, index) => <div key={property.id} className={index === 1 ? 'md:mt-16' : ''}><PropertyCard property={property} index={index} /></div>)}</div> : <EmptyProperties />}</div></section><section className="bg-[#283c33] px-5 py-20 text-[#f1eee6] sm:px-8 lg:px-12 lg:py-28"><div className="mx-auto max-w-[1440px]"><div className="grid gap-10 md:grid-cols-3">{['Local knowledge, quietly held.', 'A sharper eye for the details.', 'A relationship beyond the transaction.'].map((text, index) => <div key={text} className="border-t border-white/20 pt-6"><span className="font-display text-4xl text-[#d9b96e]">0{index + 1}</span><h3 className="mt-12 max-w-[200px] font-display text-3xl leading-tight">{text}</h3></div>)}</div></div></section></PageFrame>;
}

function AboutPage() {
  return <PageFrame><PageHero eyebrow="Our point of view" title={<>The value of<br /><i>seeing more.</i></>} copy="IKKA Estate is an editorial property advisory for people who want their next home to feel like a considered decision, not a compromise." /><section className="px-5 py-24 sm:px-8 lg:px-12 lg:py-36"><div className="mx-auto grid max-w-[1440px] gap-16 lg:grid-cols-[.8fr_1.2fr]"><SectionIntro eyebrow="A different kind of practice" title={<>We edit for<br /><i>resonance.</i></>} /><div className="max-w-[630px] text-xl leading-8 text-[#52625a]"><p>We believe a home has a frequency. It can be felt in the way light moves through a room, in the intelligence of a plan, in the distance between a front door and the world. Our role is to notice those things, then help you decide with clarity.</p><p className="mt-8">Our work spans Dubai and Delhi — two cities with very different tempos, and a shared appetite for the exceptional. We offer a smaller collection, a more attentive process and advice that remains useful long after a viewing.</p></div></div></section><section className="grid bg-[#d9b96e] lg:grid-cols-2"><div className="min-h-[500px]"><ImageWithFallback src={fallbackImages[3]} alt="Quiet interior detail" className="h-full w-full object-cover mix-blend-multiply opacity-80" /></div><div className="flex flex-col justify-center px-5 py-20 sm:px-8 lg:px-16"><p className="text-[10px] font-bold uppercase tracking-[.2em]">The IKKA standard</p><h2 className="mt-6 font-display text-5xl leading-[.95] sm:text-7xl">Less noise.<br /><i>More knowing.</i></h2><div className="mt-10 space-y-5 text-sm leading-7 text-[#42534a]"><p className="flex gap-4"><span className="font-ui text-[10px] text-[#a47e39]">01</span>We show you what is worth seeing.</p><p className="flex gap-4"><span className="font-ui text-[10px] text-[#a47e39]">02</span>We ask better questions before we make recommendations.</p><p className="flex gap-4"><span className="font-ui text-[10px] text-[#a47e39]">03</span>We stay close to the detail, from first conversation to final key.</p></div></div></section><section className="px-5 py-24 sm:px-8 lg:px-12 lg:py-32"><div className="mx-auto max-w-[1440px]"><div className="grid gap-8 border-t border-[#cfcabd] pt-8 md:grid-cols-3">{['Dubai', 'Delhi', 'Everywhere between'].map((label, index) => <div key={label} className="group"><p className="text-[10px] uppercase tracking-[.18em] text-[#b28b42]">0{index + 1}</p><h3 className="mt-16 font-display text-4xl">{label}</h3><p className="mt-4 max-w-[240px] text-sm leading-6 text-[#65736c]">{index === 0 ? 'The pace of what is next.' : index === 1 ? 'The pull of what has been.' : 'A personal brief, carefully held.'}</p></div>)}</div></div></section></PageFrame>;
}

function ContactPage() {
  return <PageFrame><PageHero eyebrow="By appointment" title={<>Let’s make<br /><i>an introduction.</i></>} copy="Tell us a little about what you are looking for. The more we understand, the more considered our first edit can be." /><section className="px-5 py-20 sm:px-8 lg:px-12 lg:py-28"><div className="mx-auto grid max-w-[1440px] gap-10 lg:grid-cols-[.7fr_1.3fr]"><div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#b28b42]">Begin here</p><h2 className="mt-5 font-display text-5xl leading-none sm:text-6xl">A home search<br /><i>with context.</i></h2><div className="mt-12 space-y-6 border-t border-[#cfcabd] pt-6 text-sm text-[#65736c]"><p className="flex items-start gap-3"><MapPin size={16} className="mt-1 text-[#b28b42]" />Dubai · Delhi · by appointment</p><p className="flex items-start gap-3"><Mail size={16} className="mt-1 text-[#b28b42]" />hello@ikkaestate.com</p><p className="flex items-start gap-3"><Phone size={16} className="mt-1 text-[#b28b42]" />+971 00 000 0000</p></div></div><EnquiryForm /></div></section></PageFrame>;
}

function BlogPage() {
  return <PageFrame><PageHero eyebrow="The IKKA journal" title={<>Notes on<br /><i>belonging.</i></>} copy="Observations from the places we work, the homes we return to and the details that stay with us." /><section className="px-5 py-20 sm:px-8 lg:px-12 lg:py-28"><div className="mx-auto max-w-[1440px]"><div className="grid gap-6 md:grid-cols-2">{editorialNotes.map((note, index) => <Link href={note.route} key={note.index} data-testid={`card-blog-${note.index}`} className={`group border-t border-[#cfcabd] pt-6 ${index === 1 ? 'md:mt-24' : ''}`}><div className="image-zoom relative aspect-[16/10] overflow-hidden bg-[#d9d5c9]"><ImageWithFallback src={fallbackImages[index + 2]} alt={note.title} className="h-full w-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0" /></div><div className="mt-5 flex items-start justify-between gap-6"><div><p className="text-[10px] uppercase tracking-[.18em] text-[#b28b42]">Essay · 0{index + 1}</p><h2 className="mt-3 font-display text-4xl leading-none">{note.title}</h2><p className="mt-3 max-w-[400px] text-sm leading-6 text-[#65736c]">{note.text}</p></div><ArrowUpRight size={18} className="mt-1 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" /></div></Link>)}</div></div></section><section className="bg-[#e3dfd3] px-5 py-20 sm:px-8 lg:px-12"><div className="mx-auto max-w-[1440px]"><p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#b28b42]">Reading room</p><div className="mt-8 grid border-y border-[#c5c1b4]">{['What we mean by a good address', 'The quiet luxury of enough space', 'A field note from Delhi', 'Looking up: architecture in Dubai'].map((title, index) => <Link href={`/blog/reading-${index + 1}`} key={title} data-testid={`link-reading-${index}`} className="group flex items-center justify-between border-b border-[#c5c1b4] py-6 last:border-0"><span className="flex items-center gap-6"><span className="text-[10px] text-[#b28b42]">0{index + 1}</span><span className="font-display text-2xl">{title}</span></span><ArrowRight size={16} className="transition-transform group-hover:translate-x-2" /></Link>)}</div></div></section></PageFrame>;
}

function BlogDetailPage() {
  const params = useParams<{ slug: string }>();
  const note = editorialNotes.find((item) => item.route.endsWith(params.slug || '')) || editorialNotes[0];
  return <PageFrame><article><section className="bg-[#283c33] px-5 pb-20 pt-40 text-[#f1eee6] sm:px-8 lg:px-12 lg:pb-28"><div className="mx-auto max-w-[900px]"><Link href="/blog" data-testid="link-blog-detail-back" className="mb-14 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.17em] text-white/60"><ArrowLeft size={14} /> Journal</Link><p className="mb-6 text-[10px] font-bold uppercase tracking-[.2em] text-[#d9b96e]">Essay · 24.05.25</p><h1 className="font-display text-6xl leading-[.9] sm:text-8xl">{note.title}</h1><p className="mt-8 max-w-[520px] text-lg leading-8 text-white/65">{note.text}</p></div></section><section className="grid gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[.5fr_1.2fr_.5fr] lg:px-12 lg:py-32"><div className="text-[10px] uppercase tracking-[.18em] text-[#b28b42]">A note from IKKA</div><div className="prose prose-lg max-w-none text-[#52625a]"><p className="font-display text-3xl leading-tight text-[#283c33]">The right home does not announce itself all at once. It reveals its logic slowly.</p><p>There is a particular pleasure in arriving somewhere and understanding, almost immediately, why it works. Not because everything is polished or new, but because the proportions feel right. Because the light has been considered. Because the space leaves room for a life to take its own shape.</p><p>In our work across Dubai and Delhi, we keep returning to this idea: that an address earns its value over time. The best residences are not simply impressive on the day you see them. They continue to give something back — a new view, a small ritual, a sense of belonging that becomes more certain with each season.</p><p>That is what we look for. Not the loudest proposition, but the one with staying power.</p></div><div className="lg:pt-1"><div className="h-px bg-[#cfcabd]" /><p className="mt-4 text-[10px] uppercase tracking-[.16em] text-[#65736c]">IKKA Estate<br />Dubai · Delhi</p></div></section></article></PageFrame>;
}

function LegalPage({ type }: { type: 'privacy' | 'terms' }) {
  const privacy = type === 'privacy';
  return <PageFrame><section className="bg-[#283c33] px-5 pb-20 pt-40 text-[#f1eee6] sm:px-8 lg:px-12"><div className="mx-auto max-w-[1000px]"><p className="mb-5 text-[10px] font-bold uppercase tracking-[.2em] text-[#d9b96e]">IKKA Estate</p><h1 className="font-display text-6xl sm:text-8xl">{privacy ? 'Privacy.' : 'Terms.'}</h1><p className="mt-7 text-sm text-white/60">Last updated: June 2025</p></div></section><section className="px-5 py-20 sm:px-8 lg:px-12 lg:py-28"><div className="prose prose-lg mx-auto max-w-[760px] text-[#52625a]"><p>These pages explain how IKKA Estate approaches information and the use of this website. They are written to be clear and useful, not to replace specific legal advice.</p><h2>{privacy ? 'Information we receive' : 'Using this website'}</h2><p>When you contact us, we receive the details you choose to share, such as your name, contact information and the nature of your enquiry. We use this information to respond to you and provide the service you requested.</p><h2>{privacy ? 'How we use it' : 'Property information'}</h2><p>We use information responsibly, keep it limited to the purpose for which it was shared and do not present this site as a substitute for independent legal, financial or property advice. Listing content may be illustrative or subject to change.</p><h2>{privacy ? 'Your choices' : 'Contact'}</h2><p>If you have questions about these terms or your information, please contact <a href="mailto:hello@ikkaestate.com">hello@ikkaestate.com</a>. We will respond with care and within a reasonable period.</p></div></section></PageFrame>;
}

function NotFoundPage() {
  return <PageFrame><section className="flex min-h-[75vh] items-center justify-center px-5 py-32 text-center"><div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#b28b42]">404 · Off the map</p><h1 className="mt-6 font-display text-7xl leading-[.88] sm:text-[120px]">A quiet<br /><i>detour.</i></h1><p className="mx-auto mt-7 max-w-[360px] text-sm leading-6 text-[#65736c]">This address has moved on. Let us take you somewhere more considered.</p><Link href="/properties" data-testid="link-404-collection" className="mt-8 inline-flex items-center gap-3 border-b border-[#283c33] pb-2 text-[10px] font-bold uppercase tracking-[.18em]">Find a residence <ArrowRight size={15} /></Link></div></section></PageFrame>;
}

function Router() {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}><Switch><Route path="/sign-in/*?" component={() => <div className="flex min-h-screen items-center justify-center bg-[#f1eee6] px-4"><SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} /></div>} /><Route path="/sign-up/*?" component={() => <div className="flex min-h-screen items-center justify-center bg-[#f1eee6] px-4"><SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} /></div>} /><Route path="/admin/*?" component={AdminRoute} /><Route path="/" component={Home} /><Route path="/properties" component={PropertiesPage} /><Route path="/properties/:slug" component={PropertyDetailPage} /><Route path="/dubai" component={() => <CityPage city="Dubai" />} /><Route path="/delhi" component={() => <CityPage city="Delhi" />} /><Route path="/about" component={AboutPage} /><Route path="/contact" component={ContactPage} /><Route path="/blog" component={BlogPage} /><Route path="/blog/:slug" component={BlogDetailPage} /><Route path="/privacy" component={() => <LegalPage type="privacy" />} /><Route path="/terms" component={() => <LegalPage type="terms" />} /><Route component={NotFoundPage} /></Switch></ErrorBoundary>;
}

function App() {
  return <WouterRouter base={basePath}><ClerkProvider publishableKey={clerkPubKey} proxyUrl={clerkProxyUrl} appearance={{ theme: shadcn, variables: { colorPrimary: '#283c33', colorBackground: '#f1eee6', colorForeground: '#283c33', colorMutedForeground: '#65736c', fontFamily: 'DM Sans, sans-serif', borderRadius: '0px' }, options: { logoImageUrl: `${window.location.origin}${basePath}/logo.svg`, logoLinkUrl: basePath || '/' } }} signInUrl={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`}><QueryClientProvider client={queryClient}><TooltipProvider><Router /><Toaster /></TooltipProvider></QueryClientProvider></ClerkProvider></WouterRouter>;
}

export default App;