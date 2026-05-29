# FLYWHEEL.md — Snowball Arsenal

> 🌀 How we ship real revenue in 21 days from Sunday (June 1 → June 22, 2026).
> Inspired by [ClawMetry's FLYWHEEL.md](reference/clawmetry/FLYWHEEL.md) convention — the third file in the agent canon: `AGENTS.md` (what to do), `SOUL.md` (who to be), `FLYWHEEL.md` (**how to ship**).

The north star: **don't stop at "code compiles." Stop at "verified working in production, collecting money, with evidence."** A static HTML file on disk isn't revenue. A deployed site with Stripe connected and a prospect seeing it live — that's revenue.

> ## ⛔ The "done" bar (non-negotiable)
> **Never call something "done" until it's DEPLOYED at a public URL, Stripe is connected (or a manual payment link is live), and you have SCREENSHOT EVIDENCE of a working checkout.** "The HTML looks good locally" is not done. A site without a URL helps nobody. A URL without a payment path isn't revenue.

---

## 0. Where we actually are right now

We have:
- **42 static HTML sites** that load in any browser — landing pages, SaaS tools, client portals, agency verticals
- **4 agency verticals** fully scaffolded (NexusLogix, VaultEdge, MedCore, LexBridge) — landing pages + compliance docs + PPTX decks
- **UGC ad scripts** (100+) with 2026 benchmarks
- **Void Ascendant** content (manuscripts, bibles, 134 files)
- **Apex Studio** v1-v5 command center prototypes
- **A friend who wants his own wolf-pack setup** (our first user)

We do NOT yet have:
- A single public URL
- A single paying customer
- Stripe connected to anything
- A domain pointing at anything
- Any deployed product

---

## 1. The 21-Day Sprint (June 1 → June 22)

### WEEK 1: DEPLOY EVERYTHING (June 1-7)
**Goal: Every HTML site has a public URL by Sunday June 7.**

| Day | What | Who |
|-----|------|-----|
| Mon Jun 2 | Buy domain: snowball.design OR snwbl.io ($12-50) | Chad |
| Mon Jun 2 | Create Netlify/Vercel account, connect GitHub | Hermes |
| Tue Jun 3 | Deploy all 42 HTML sites to Netlify (drag-drop or git push) | Hermes |
| Wed Jun 4 | Deploy agency verticals (4 landing pages) each on subdomain | Hermes |
| Thu Jun 5 | Deploy Snowball hero + SaaS tool + portfolio index | Hermes |
| Fri Jun 6 | Wire Stripe payment links on hero site (even manual payment link counts) | Hermes + Hrim |
| Sun Jun 7 | **CHECKPOINT: Every site live, at least one has a "Buy" button** | Chad verifies |

### WEEK 2: WIRE REVENUE (June 8-14)
**Goal: Money can change hands. First prospect outreach sent.**

| Day | What | Who |
|-----|------|-----|
| Mon Jun 9 | PocketBase backend for Snowball SaaS tool (auth, projects, sessions) | Hermes + Hrim |
| Tue Jun 10 | Wire PocketBase to SaaS tool HTML (replace mock data) | Hermes |
| Wed Jun 11 | Cold outreach to 10 local businesses (Windsor/Binghamton area) using agency verticals | Chad (with CoPAW research) |
| Thu Jun 12 | Create Stripe products: Solo $149/mo, Studio $499/mo, Agency $999/mo | Hermes |
| Fri Jun 13 | Wire Stripe Checkout to pricing page | Hermes |
| Sat Jun 14 | Setup UGC script packages as digital downloads ($29-97 each) | Hermes |
| Sun Jun 15 | **CHECKPOINT: Stripe live, at least 5 outreach emails sent, digital products listed** | Chad verifies |

### WEEK 3: CLOSE AND COLLECT (June 15-21)
**Goal: First dollar in. Even $1 counts.**

| Day | What | Who |
|-----|------|-----|
| Mon Jun 16 | Follow up on all outreach, schedule calls | Chad |
| Tue Jun 17 | Reconcile Void Ascendant duplicates — pick canonical versions | Hermes |
| Wed Jun 18 | Package Void Ascendant for KDP upload (Book 1 manuscript → formatted) | Hermes + CoPAW |
| Thu Jun 19 | Package UGC scripts as paid PDF downloads (Etsy + Stan Store) | Hermes |
| Fri Jun 20 | Create Snowball Design "Template Pack" — 5 best HTML sites as MRR product | Hermes |
| Sat Jun 21 | Wolf Pack friend onboarding — help him clone and deploy his setup | Hermes |
| Sun Jun 22 | **DONE: Revenue path live across 3 channels (SaaS, templates, IP). First dollar collected.** | Chad |

---

## 2. The "done" checklist (print this, cross items off)

- [ ] Domain bought and DNS pointed
- [ ] All 42 HTML sites deployed to public URLs
- [ ] Stripe account created, products configured
- [ ] At least one site has a working "Buy" button (clickable → Stripe Checkout)
- [ ] PocketBase backend running, wired to at least one SaaS view
- [ ] 5+ cold outreach emails/calls sent to local businesses
- [ ] At least 1 digital product listed for sale (UGC scripts, template pack, or ebook)
- [ ] Void Ascendant Book 1 ready for KDP upload
- [ ] Friend has cloned wolf-pack repos and can run them
- [ ] First dollar collected (any channel)

---

## 3. Architecture decisions (locked for the sprint)

| Decision | Choice | Why |
|----------|--------|-----|
| Static hosting | Netlify (drag-drop) | Fastest deploy. Free tier. No build step needed. |
| Domain | snowball.design (first choice) | Brand equity. $12/yr. |
| Backend | PocketBase v0.38.1 | Single binary, SQLite, auth built-in. No Supabase lock-in. |
| Payments | Stripe Checkout (simple mode) | No custom integration — redirect links. Get paid same day. |
| Digital downloads | Stan Store or Payhip | Zero setup, handles delivery. MRR-friendly. |
| IP publishing | KDP (Kindle Direct Publishing) | Free, worldwide, 70% royalties. |

---

## 4. What NOT to do (antipatterns that kill the sprint)

- ❌ **Don't rebuild the HTML sites.** They load. Deploy them as-is. Polish later.
- ❌ **Don't add a framework.** No Next.js rewrite. No React hydration. Static HTML is the product.
- ❌ **Don't over-engineer the backend.** PocketBase in front of the SaaS views. That's it.
- ❌ **Don't wait for perfection to deploy.** Ugly but live > beautiful but on disk.
- ❌ **Don't chase more scaffolding.** 281 files. We have enough. Wire what exists.

---

## 5. The Sheffy Model (what we're learning from)

Alek Sheffy's playbook:
1. **Make templates** (he does POD designs on Kittl; we do static HTML sites)
2. **Give some away free** as lead magnets (he does free template drops on Twitter; we deploy 5 free sites to snowball.design)
3. **Sell MRR/resell rights** (his course teaches this; our Template Pack does this)
4. **The product sells itself** — show a prospect a working site in 5 minutes, close same day

Our adaptation: instead of t-shirt templates on Kittl, it's **website templates on GitHub**. Same model, higher ticket ($500-5000 vs $5-50), zero marginal cost.

---

## 6. Evidence trail (screenshot or it didn't happen)

Every checkpoint gets posted to the Telegram thread:
- Screenshot of Netlify deploy
- Screenshot of Stripe Checkout page
- Screenshot of live URL in browser
- Screenshot of cold outreach email sent
- Screenshot of first Stripe payment notification

---

*"Don't stop at 'code compiles.' Stop at 'verified working in production, collecting money, with evidence.'"*