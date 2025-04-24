Set up the page structure according to the following prompt:
   
<page-structure-prompt>
Next.js route structure based on navigation menu items (excluding main route). Make sure to wrap all routes with the component:

Routes:
- /products
- /solutions
- /resources
- /enterprise
- /docs
- /pricing

Page Implementations:
/products:
Core Purpose: Showcase product catalog and features
Key Components
- ProductGrid: Displays product cards with images, titles, descriptions
- ProductFilters: Category, price range, feature filters
- ProductSearch: Search bar with autocomplete
- ComparisonTool: Compare different product features
Layout Structure
- Sidebar filter panel (collapsible on mobile)
- Main content area with grid

/solutions:
Core Purpose: Present industry-specific solutions and use cases
Key Components
- SolutionCards: Industry

/tools
Layout Structure:
- Hero section with solution categories
- Two-column layout for detailed solutions
- Testimonial sections between content blocks

/resources:
Core Purpose: Educational and support materials hub
Key Components
- ResourceLibrary: Downloadable assets
- BlogGrid: Latest articles and updates
- WebinarSchedule: Upcoming live events
- KnowledgeBase: FAQ and help articles
Layout Structure
- Tab-based navigation for resource types
- Card-based content display
- Sidebar with popular

/enterprise:
Core Purpose: Enterprise-specific offerings and capabilities
Key Components
- FeatureComparison: Enterprise vs standard features
- ContactForm: Enterprise sales inquiry
- SecurityFeatures: Compliance and security details
- CustomSolutions: Enterprise customization options
Layout Structure
- Single-page scroll with anchored sections
- Split-screen layouts for feature comparisons
- Sticky CTA button

/docs:
Core Purpose: Technical documentation and API references
Key Components
- DocSearch: Full-text documentation search
- CodeExamples: Interactive code snippets
- APIReference: Endpoint documentation
- VersionSelector: Documentation version control
Layout Structure
- Left sidebar navigation
- Main content area with right sidebar TOC
- Mobile-responsive drawer navigation

/pricing:
Core Purpose: Product pricing and plan comparison
Key Components
- PricingTables: Plan comparison tables
- PricingCalculator: Usage-based pricing estimator
- FeatureList: Detailed feature breakdown
- PlanSelector: Interactive plan chooser
Layout Structure
- Centered pricing tables
- Toggle between monthly

Layouts:
MainLayout:
- Applicable routes: All except /docs
- Core components
  - GlobalNavigation
  - Footer
  - AnnouncementBanner
  - MobileMenu
- Responsive behavior
  - Collapsible navigation on mobile
  - Adaptive spacing and typography
  - Flexible content containers

DocsLayout
- Applicable routes: /docs
- Core components
  - DocsSidebar
  - SearchBar
  - TableOfContents
  - EditPageLink
- Responsive behavior
  - Collapsible sidebars on mobile
  - Persistent search access
  - Adjustable content width
</page-structure-prompt>