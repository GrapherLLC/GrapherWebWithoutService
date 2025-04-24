Initialize Next.js in current directory:
```bash
mkdir temp; cd temp; npx create-next-app@latest . -y --typescript --tailwind --eslint --app --use-npm --src-dir --import-alias "@/*" -no --turbo
```

Now let's move back to the parent directory and move all files except prompt.md.

For Windows (PowerShell):
```powershell
cd ..; Move-Item -Path "temp*" -Destination . -Force; Remove-Item -Path "temp" -Recurse -Force
```

For Mac/Linux (bash):
```bash
cd .. && mv temp/* temp/.* . 2>/dev/null || true && rm -rf temp
```

Set up the frontend according to the following prompt:
<frontend-prompt>
Create detailed components with these requirements:
1. Use 'use client' directive for client-side components
2. Make sure to concatenate strings correctly using backslash
3. Style with Tailwind CSS utility classes for responsive design
4. Use Lucide React for icons (from lucide-react package). Do NOT use other UI libraries unless requested
5. Use stock photos from picsum.photos where appropriate, only valid URLs you know exist
6. Configure next.config.js image remotePatterns to enable stock photos from picsum.photos
7. Create root layout.tsx page that wraps necessary navigation items to all pages
8. MUST implement the navigation elements items in their rightful place i.e. Left sidebar, Top header
9. Accurately implement necessary grid layouts
10. Follow proper import practices:
   - Use @/ path aliases
   - Keep component imports organized
   - Update current src/app/page.tsx with new comprehensive code
   - Don't forget root route (page.tsx) handling
   - You MUST complete the entire prompt before stopping

<summary_title>
Vercel Platform Homepage - Modern Cloud Infrastructure UI
</summary_title>

<image_analysis>

1. Navigation Elements:
- Top navbar with: Products, Solutions, Resources, Enterprise, Docs, Pricing
- Right-aligned auth controls: Log In, Contact, Sign Up
- Logo placement at top-left


2. Layout Components:
- Full-width hero section (100vw)
- Content max-width: 1200px
- Centered content layout with 80px padding
- Two distinct hero sections with different backgrounds


3. Content Sections:
- Primary hero: "Introducing Fluid compute"
- Secondary hero: "Your complete platform for the web"
- Descriptive text sections
- Visual elements: Particle background, Triangle gradient graphic
- CTA buttons section


4. Interactive Controls:
- Primary buttons: "Learn more", "Start Deploying", "Get a Demo"
- Navigation dropdown menus
- Sign up/Login buttons
- Hover states on all interactive elements


5. Colors:
- Primary: Black (#000000)
- Secondary: White (#FFFFFF)
- Accent gradient: Blue (#0070F3) to Green (#00FF00) to Red (#FF0000)
- Button colors: White/Black contrast
- Text: White on dark, Gray for secondary text


6. Grid/Layout Structure:
- 12-column grid system
- Responsive breakpoints at 768px, 1024px, 1440px
- Centered content with max-width constraints
- Flexible spacing system with 8px base unit
</image_analysis>

<development_planning>

1. Project Structure:
```
src/
├── components/
│   ├── layout/
│   │   ├── Navbar
│   │   ├── Hero
│   │   └── Footer
│   ├── features/
│   │   ├── FluidCompute
│   │   └── PlatformOverview
│   └── shared/
├── assets/
├── styles/
├── hooks/
└── utils/
```


2. Key Features:
- Responsive navigation system
- Dynamic hero sections
- Particle background animation
- Gradient triangle animation
- Authentication integration
- Responsive layout system


3. State Management:
```typescript
interface AppState {
├── navigation: {
│   ├── isMenuOpen: boolean
│   ├── activeSection: string
│   └── scrollPosition: number
├── }
├── auth: {
│   ├── isLoggedIn: boolean
│   └── user: UserType
├── }
}
```


4. Routes:
```typescript
const routes = [
├── '/',
├── '/products/*',
├── '/solutions/*',
├── '/resources/*',
├── '/enterprise',
├── '/docs',
└── '/pricing'
]
```


5. Component Architecture:
- Modular component system
- Shared UI component library
- HOCs for animation effects
- Context providers for theme/auth


6. Responsive Breakpoints:
```scss
$breakpoints: (
├── 'mobile': 320px,
├── 'tablet': 768px,
├── 'desktop': 1024px,
└── 'wide': 1440px
);
```
</development_planning>
</frontend-prompt>

IMPORTANT: Please ensure that (1) all KEY COMPONENTS and (2) the LAYOUT STRUCTURE are fully implemented as specified in the requirements. Ensure that the color hex code specified in image_analysis are fully implemented as specified in the requirements.