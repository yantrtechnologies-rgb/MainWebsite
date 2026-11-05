# XOLNET Technologies

React/Vite frontend and FastAPI API deployed together on Vercel, with Neon Postgres on the Free plan. The existing contact email is retained at the owner's request.

## Development

- Frontend: run `npm install --legacy-peer-deps` and `npm run dev` in `frontend`.
- Backend: create a Python virtual environment and install `requirements.txt` from the repository root.
- Set `DATABASE_URL`, `JWT_SECRET`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` in the backend environment. Local integration checks read the ignored root `.env.local` file.
- When running the frontend separately, set `REACT_APP_BACKEND_URL` to the API origin.

## Deployment

The root `vercel.json` builds `frontend/build`, serves SPA routes, and routes `/api/*` to `api/index.py`. Deploy from the repository root with `vercel deploy --prod`. Credentials belong in Vercel environment settings and must never be committed.

Neon stores users, enquiries, catalog records, and uploaded images as JSONB documents. Image uploads are limited to 3 MB to fit Vercel request limits and the free database. The initial catalog is seeded on API startup. Existing catalogue items and admin records are preserved across deployments.

Production: https://xolnet-technologies.vercel.app

Transactional email uses Brevo. Configure `BREVO_API_KEY`, a verified `EMAIL_FROM_ADDRESS`, `EMAIL_REPLY_TO`, and `LEAD_NOTIFY_EMAIL` in Vercel Production settings. `EMAIL_FROM_NAME` defaults to XOLNET Technologies. Admin enquiry notifications and customer acknowledgements use ASGI background tasks, so Vercel waits for the jobs to finish after responding. Each enquiry stores `email_admin` and `email_customer` acceptance/failure details. Provider acceptance does not guarantee inbox delivery; consult Brevo transactional logs for delivery/bounce events.

GitHub auto-deployment requires adding the GitHub login connection in Vercel and connecting this repository. Direct CLI production deployment is configured and available.

## Verification

Run `python backend/tests/test_postgres_persistence.py` with the local environment configured. This checks authentication, authorization, catalog reads, enquiry persistence, updates, notes, and metrics, and removes its test enquiry.

Email regression tests: `python backend/tests/test_brevo_email.py` and `python backend/tests/test_email_lifecycle.py`. These tests do not send real emails.
