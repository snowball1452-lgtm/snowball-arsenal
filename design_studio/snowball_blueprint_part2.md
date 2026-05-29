
    ---
    
    ## 03. THE SNOWBALL TECH STACK — CURATED (NO VIBE CODING)
    
    ### Frontend Stack
    
    | Layer | Technology | Why |
    |-------|-----------|-----|
    | Framework | Next.js 14 (App Router) | SSR + SSG hybrid, perfect for SEO-rich design studio sites |
    | Styling | Tailwind CSS + CSS Variables | Rapid theming, archetype switching via CSS vars |
    | Animation | Framer Motion | The gold standard for luxury-grade scroll + transition effects |
    | 3D/WebGL | Three.js or Spline | For hero sections that need depth and motion (automotive feel) |
    | CMS | Sanity.io | Structured content, real-time previews, client-editable |
    | Image Handling | next/image + Cloudinary | Auto-optimization, luxury-grade image delivery |
    | Font Loading | next/font | Zero layout shift, self-hosted for performance |
    | Icons | Phosphor Icons or Lucide | Clean, consistent, scalable |
    
    ---
    
    ### Backend Stack
    
    | Layer | Technology | Why |
    |-------|-----------|-----|
    | API Layer | Next.js API Routes + tRPC | Type-safe, fast, co-located with frontend |
    | Database | Supabase (PostgreSQL) | Open source, scalable, real-time, auth built in |
    | Auth | Supabase Auth + NextAuth | Social login + email, enterprise SSO ready |
    | Storage | Supabase Storage + Cloudinary | Assets, client uploads, project images |
    | Email | Resend + React Email | Beautiful transactional emails, developer-first |
    | Payments | Stripe | Industry standard, handles subscriptions + one-time |
    | Hosting | Vercel | Zero-config deploys, edge network, perfect for Next.js |
    | CDN | Vercel Edge Network + Cloudflare | Global performance for image-heavy luxury sites |
    
    ---
    
    ### AI / Intelligence Layer
    
    | Function | Technology | Why |
    |----------|-----------|-----|
    | Style Advisor | OpenAI GPT-4o + custom fine-tune | Flags design decisions that break luxury grammar |
    | Trend Scraper | Firecrawl + custom pipeline | Monitors Awwwards, Red Dot, iF, Dezeen weekly |
    | Brand Input Processing | GPT-4o Vision | Reads client logos + extracts colors/style signals |
    | Copy Generation | GPT-4o | Luxury-grade copy that sounds like a $500/hr copywriter |
    | Image Generation | Midjourney API or Flux | Project mockups, hero images, portfolio placeholders |
    | Competitor Analysis | Firecrawl + embeddings | Monitors competitor site changes, surface opportunities |
    
    ---
    
    ### The Design Intelligence Database
    
    This is Snowball's core moat — a curated database of:
    
    ```
    design_dna/
      ├── archetypes/          # 8 base archetypes (Marcello, Pininfarina, etc.)
      ├── components/          # 200+ pre-styled components per archetype
      ├── typography_pairs/    # 40 curated font combinations
      ├── color_palettes/      # 120 validated luxury palettes
      ├── motion_patterns/     # 30 animation recipes
      ├── layout_grids/        # 15 proven layout systems
      ├── copy_templates/      # 500+ luxury copy fragments
      └── trend_signals/       # Weekly scraped & curated trend data
    ```
    
    **Everything is version-controlled and tagged:**
    - Industry (Automotive / Aviation / Nautical / Architecture / Jewelry / Industrial)
    - Era (Heritage / Contemporary / Future-Forward)
    - Price Signal (Premium / Ultra-Luxury / Bespoke)
    - Mood (Dark Precision / Light Elegance / Technical / Organic)
    
    ---
    
    ## 04. THE COMPONENT LIBRARY — 200+ BLOCKS
    
    ### Every site needs these 12 core sections. Here's the full spec:
    
    ---
    
    ### SECTION 1: HERO
    **Variants:** 4 per archetype = 32 total hero variants
    
    | Variant | Description | Best For |
    |---------|-------------|----------|
    | Full-Bleed Dark | Dark BG, large display text, single CTA | Marcello / Zagato style |
    | Cinematic Video | Looping reel behind minimal text | Automotive, Aviation |
    | Split Screen | 50/50 image + text | PriestmanGoode style |
    | Editorial Type | Typography-only, no image | Brand studios, Seymourpowell style |
    
    **Required Elements:**
    - Navigation bar (logo left, links center/right, CTA button)
    - Primary headline (display font, 80-120px desktop)
    - Subheadline (body font, 20-24px)
    - Single CTA button ("View Work" / "Start a Project")
    - Scroll indicator (subtle arrow or line)
    
    ---
    
    ### SECTION 2: ABOUT / PHILOSOPHY STATEMENT
    **Purpose:** Establish worldview in 3-4 sentences. No fluff.
    
    **Template Copy Structure:**
    ```
    [FIRM NAME] [core belief statement].
    We [what we do differently] for [client type].
    [Heritage or approach differentiator].
    [Call to action or invitation].
    ```
    
    **Example (Pininfarina-inspired):**
    "We design the things that define an era.
    Our work spans continents, industries, and decades —
    united by a single obsession: the pursuit of timeless form.
    If you build things that matter, we should talk."
    
    ---
    
    ### SECTION 3: SECTOR / SERVICE GRID
    **Layout:** 3-column or 2-column card grid
    **Each Card Contains:**
    - Sector icon (line art, 40x40px)
    - Sector name (caps, tracked)
    - 2-line description
    - Arrow link
    
    **Standard Sectors (customize per client):**
    Automotive / Architecture / Nautical / Product / Aviation / Jewelry / Industrial / Digital
    
    ---
    
    ### SECTION 4: FEATURED PROJECTS
    **Layout:** Asymmetric grid (large hero project + 2-3 secondary)
    **Each Project Card:**
    - Full-bleed image
    - Project name (on hover or always visible)
    - Client name (optional — some clients prefer anonymity)
    - Year
    - Category tags
    - View Project arrow
    
    **Hover State:** Image zooms 5%, overlay fades in with project info
    
    ---
    
    ### SECTION 5: STATS / AUTHORITY BLOCK
    **Inspired by Seymourpowell's "40 Years / 986 Clients / 7896 Projects"**
    **Layout:** 3-4 stat blocks, horizontal row
    
    | Stat Type | Example | Visual |
    |-----------|---------|--------|
    | Years of experience | 12 Years | Large number + label |
    | Projects completed | 340+ Projects | Large number + label |
    | Countries | 18 Countries | Large number + label |
    | Awards | 24 Awards | Large number + label |
    
    ---
    
    ### SECTION 6: CLIENT LOGO BAR
    **Layout:** Scrolling horizontal marquee (infinite loop)
    **Styling:** Logos desaturated to grey, hover = full color
    **Note:** Even 3-4 logos dramatically increase perceived credibility
    
    ---
    
    ### SECTION 7: TESTIMONIAL / SOCIAL PROOF
    **Inspired by PriestmanGoode's CEO quote blocks**
    **Layout:** Large pull quote, attribution, optional photo
    
    **Template:**
    ```
    "[Specific outcome or feeling, not generic praise].
    [What made the firm different from alternatives]."
    — [FULL NAME], [TITLE], [COMPANY]
    ```
    
    ---
    
    ### SECTION 8: PROCESS / APPROACH
    **Layout:** Numbered steps (4-6 steps), horizontal or vertical
    **Steps Template:**
    1. Discovery — Understanding your world
    2. Strategy — Defining the design direction
    3. Development — Building with precision
    4. Refinement — Until it's exactly right
    5. Delivery — Launch-ready, future-proof
    
    ---
    
    ### SECTION 9: AWARDS & RECOGNITION
    **Layout:** Grid of award logos / badges
    **Supported Awards:** Red Dot, iF Design, Awwwards, D&AD, Core77, Fast Company Innovation
    
    ---
    
    ### SECTION 10: TEAM
    **Layout:** Grid of portraits with name + role
    **Styling:** B&W portraits, color on hover
    **Optional:** Brief philosophy quote per team member
    
    ---
    
    ### SECTION 11: NEWS / JOURNAL
    **Layout:** Editorial 3-column grid
    **Each Entry:** Category tag + headline + date + read time
    **Purpose:** SEO + thought leadership signal
    
    ---
    
    ### SECTION 12: CONTACT
    **Layout:** Split — left side brand statement, right side form
    **Form Fields:** Name / Company / Email / Project Type / Budget Range / Message
    **After Submit:** Immediate confirmation + expected response time
    **Trust Signals:** Response time promise ("We respond within 24 hours")
    
    ---
    
    ## 05. THE SITE BUILDER FLOW — HOW IT WORKS
    
    ### Client-Facing Journey (5 Steps)
    
    ```
    STEP 1: NICHE SELECTOR
    "What kind of design firm are you?"
    → Automotive / Aviation / Architecture / Nautical / 
       Jewelry / Industrial / Product / Brand Studio
    
    STEP 2: ARCHETYPE SELECTOR  
    "Choose your aesthetic direction"
    → Show 8 style cards (one per reference brand)
    → Client picks 1 primary + 1 secondary influence
    
    STEP 3: BRAND INPUT
    "Tell us about your firm"
    → Upload logo
    → Company name + tagline
    → Founded year
    → Team size
    → Top 3 clients (optional)
    → Upload 5-10 project images
    
    STEP 4: COPY INPUT
    "What do you want to say?"
    → About statement (or AI generates from inputs)
    → Services list
    → Contact preferences
    
    STEP 5: PREVIEW + PUBLISH
    → Live preview renders in ~30 seconds
    → Client can toggle between archetype variants
    → Request changes via annotation tool
    → Approve → Publish to custom domain
    ```
    
    ---
    
    ## 06. THE AI STYLE ADVISOR — HOW IT WORKS
    
    The Style Advisor is Snowball's secret weapon. It's an AI layer that:
    
    **Catches Luxury Grammar Violations:**
    - Wrong font pairing (e.g., Lobster + Helvetica on a luxury site = flagged)
    - Low contrast (luxury sites have specific contrast ratios)
    - Too many colors (luxury = restraint; 3 colors max)
    - Wrong imagery (stock photo watermarks, generic office photos)
    - Copy that doesn't match the archetype tone
    - Missing trust signals (no awards, no client names, no year founded)
    
    **How It Flags Issues:**
    - Real-time inline suggestions (like Grammarly, but for design)
    - "Luxury Score" — 0-100 rating per section
    - Specific fix suggestions ("This font doesn't match your archetype — try PP Neue Montreal")
    
    **What It Approves:**
    - Gives green checkmarks when sections hit luxury standards
    - "Ready to Publish" gate — site must hit 80+ Luxury Score before going live
    
    ---
    
    ## 07. THE LEARNING SYSTEM — THE MOAT
    
    ### How Snowball Gets Smarter Every Week
    
    **Data Sources:**
    1. Awwwards — Top 10 sites of the week (scraped Mon 6am)
    2. Red Dot Award — New winners (scraped on announcement)
    3. iF Design Award — Annual winner database
    4. Dezeen — Architecture + product design trends
    5. Wallpaper* — Luxury product + brand launches
    6. Core77 — Industrial design community
    7. Are.na — Designer taste-making platform
    
    **Weekly Curation Pipeline:**
    ```
    Scrape → Extract visual signals → Compare to existing DNA database
    → Flag new patterns → Human review (you or AI curator)
    → Approve → Add to template library → Auto-update existing sites
    ```
    
    **Client Feedback Loop:**
    - Track which template sections clients modify most
    - Track which color archetypes get chosen most by niche
    - Track time-on-page for different hero variants
    - Monthly report: "Design Intelligence Update" sent to SaaS subscribers
    
    ---
    