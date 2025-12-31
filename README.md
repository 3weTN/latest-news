# Tunisian News Aggregator

A modern, high-performance news aggregation platform for Tunisian media sources built with Next.js 16, featuring infinite scroll, real-time updates, and multiple view modes.

## Features

### Core Functionality
- **Multi-Source News Aggregation**: Aggregates news from multiple Tunisian sources including Mosaique FM, Shems FM, Tunisia Numerique, Kapitalis, La Presse, and RTCI
- **Dual Feed Support**: Handles both RSS feeds and REST API sources
- **Infinite Scroll**: Seamless content loading using Intersection Observer API
- **Auto-Refresh**: Automatic content refresh every 60 seconds
- **Source Filtering**: Filter articles by news source with real-time updates
- **Dual View Modes**: Toggle between grid and list view layouts
- **Featured Article**: Highlights the latest article in grid view

### Security & Performance
- **XSS Protection**: Comprehensive HTML sanitization using `sanitize-html`
- **Server-Side Caching**: Optimized performance with Next.js `unstable_cache`
- **React Optimization**: Extensive use of `useCallback` and `useMemo` for efficient re-renders
- **Type Safety**: Full TypeScript implementation with strict type checking
- **Error Boundaries**: Graceful error handling for production stability

### Accessibility
- **WCAG Compliant**: Full ARIA labels and semantic HTML
- **Screen Reader Support**: Live regions for dynamic content updates
- **Keyboard Navigation**: Complete keyboard accessibility
- **Focus Management**: Proper focus indicators and navigation

### SEO & Analytics
- **Dynamic Metadata**: SEO-optimized meta tags for each article
- **Google Analytics**: Integrated tracking with environment-based configuration
- **OpenGraph Support**: Social media sharing optimization
- **Sitemap Generation**: Dynamic sitemap for search engines

## Tech Stack

- **Framework**: Next.js 16.0.10 (App Router)
- **Runtime**: React 18.3
- **Language**: TypeScript 5.7.2
- **Styling**: Tailwind CSS 3.4.17
- **UI Components**: shadcn/ui with Radix UI primitives
- **State Management**: React Context API
- **HTTP Client**: Native Fetch API
- **XML Parsing**: fast-xml-parser 4.5.0
- **HTML Sanitization**: sanitize-html 2.14.0
- **Utilities**: react-intersection-observer, next-themes

## Project Structure

```
src/
├── actions/
│   └── fetch-posts.ts          # Server actions for fetching articles
├── app/
│   ├── article/[slug]/
│   │   └── page.tsx            # Article detail page
│   ├── layout.tsx              # Root layout with providers
│   ├── page.tsx                # Homepage with SSR
│   └── GoogleAnalytics.jsx     # GA4 integration
├── components/
│   ├── posts-client.tsx        # Main article list component
│   ├── view-mode-provider.tsx  # View mode context
│   ├── view-mode-toggle.tsx    # Grid/List toggle
│   ├── error-boundary.tsx      # Error handling component
│   ├── site-header.tsx         # Navigation header
│   └── ui/                     # shadcn/ui components
├── config/
│   ├── sources.ts              # News source configurations
│   └── site.ts                 # Site-wide configuration
├── lib/
│   ├── sanitize-html.ts        # HTML sanitization utility
│   ├── article-date.ts         # Date formatting utilities
│   └── utils.ts                # Helper functions
└── types/
    └── index.ts                # TypeScript type definitions
```

## Installation

### Prerequisites
- Node.js 18.x or higher
- npm or yarn package manager

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd latest-news
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```env
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NODE_ENV=production
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Build & Deployment

### Production Build
```bash
npm run build
npm start
```

### Type Checking
```bash
npm run type-check
```

### Linting
```bash
npm run lint
```

## Recent Improvements

### Security Enhancements
- ✅ Implemented HTML sanitization to prevent XSS attacks
- ✅ Removed all hardcoded credentials to environment variables
- ✅ Added security headers for external links (noopener noreferrer)
- ✅ Sanitized all user-generated and external content

### Code Quality
- ✅ Eliminated all `any` types with proper TypeScript interfaces
- ✅ Removed console statements from production code
- ✅ Created comprehensive type definitions for RSS parsing
- ✅ Added React Error Boundary for graceful error handling

### Performance Optimization
- ✅ Implemented React memoization (useCallback, useMemo)
- ✅ Optimized component re-renders
- ✅ Added server-side caching for API responses
- ✅ Implemented proper dependency arrays in hooks

### Accessibility
- ✅ Added comprehensive ARIA labels
- ✅ Implemented live regions for screen readers
- ✅ Enhanced keyboard navigation
- ✅ Added semantic HTML structure

### UI/UX
- ✅ Redesigned list view with clean, text-focused layout
- ✅ Removed images from list view for better readability
- ✅ Improved spacing and padding for better visual hierarchy
- ✅ Enhanced hover states and transitions

## Configuration

### Adding New News Sources

Edit `src/config/sources.ts`:

```typescript
export const NEWS_SOURCES: NewsSource[] = [
  {
    id: "source-id",
    name: "Source Name",
    type: "rss" | "api",
    endpoint: "https://source-url.com/feed",
    firstPageOnly: true | false,
    maxAgeHours: 24
  }
];
```

### Customizing Sanitization Rules

Edit `src/lib/sanitize-html.ts` to adjust allowed HTML tags and attributes.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_SITE_URL` | Production site URL | https://actualite-news-tunisie.vercel.app |
| `NEXT_PUBLIC_GA_ID` | Google Analytics ID | G-YEWYHJMZPE |
| `NODE_ENV` | Environment mode | production |

## Browser Support

- Chrome/Edge (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Mobile browsers (iOS Safari, Chrome)

## License

This project is private and proprietary.

## Contributing

This is a private project. For questions or issues, please contact the maintainer.
