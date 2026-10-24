# Yantr Technologies — PRD

## Original problem
Premium responsive website for Yantr Technologies combining Digital Marketing, IT Products (quote-only) and IT Training. First release: homepage + marketing pages + enquiry/lead forms + admin lead dashboard, JWT auth with seeded admin, email notification on new enquiries, no payments.

## Architecture
React (Vite, Tailwind, shadcn) frontend; FastAPI + MongoDB backend; Emergent-managed email for lead notifications.

## Implemented
- Initial build: pages (Home, Digital Marketing, IT Products, IT Training, Work, About, Contact, Login, Admin), enquiry modal, admin lead dashboard (status, notes, follow-up, search, CSV)
- Follow-up update:
  - Gold logo in navbar, footer and as favicon (/logo.webp, /favicon.png); title "Yantr Technologies"
  - Contact: yantrtechnologies@gmail.com, 9692791725, Pragati Vihar, Ainthapali, Sambalpur, Odisha
  - Budget is now a free-text field
  - Product prices removed → "Price on request" + Request a Quote
  - Enquiries need phone OR email (enforced on the frontend and backend); vertical restricted to allowed values
  - Floating WhatsApp button (wa.me/919692791725 with a ready-made hello message) on all public pages
  - Customer thank-you email (reference ID, request summary, company contacts), sent when the customer gives an email; retries on 429
  - Google Map embed + directions link on the Contact page
  - Testing: iteration_3 passed 100%
  - Footer column links go straight to their pages (Digital Marketing → /digital-marketing)
  - Dropdown menus now have a solid background with readable text (Contact enquiry-type fix)
- Testing: iteration_2 passed 100% on backend and frontend

## Backlog
- P1: Replace demo content (products, courses, case studies) with real content
- P1: Harden the X-Forwarded-For rate-limit key
- P2: Payments, student LMS, product orders (deferred)
