# Tanit Cuisine Backend

Django REST backend for the Tanit Cuisine storefront.

## Local Setup

```powershell
backend\.venv\Scripts\python.exe -m pip install -r backend\requirements.txt
Copy-Item backend\.env.example backend\.env
backend\.venv\Scripts\python.exe backend\manage.py migrate
backend\.venv\Scripts\python.exe backend\manage.py seed_catalog
backend\.venv\Scripts\python.exe backend\manage.py runserver 8000
```

## Useful Endpoints

- `GET /api/health/`
- `POST /api/auth/signup/start/`
- `POST /api/auth/signup/verify/`
- `POST /api/auth/signin/`
- `POST /api/auth/token/refresh/`
- `GET|PATCH /api/auth/me/`
- `POST /api/auth/signout/`
- `GET /api/categories/`
- `GET /api/products/`
- `GET /api/products/{slug}/`
- `POST /api/orders/`
- `GET /api/orders/{orderNumber}/`
- `POST /api/contact/`
- `GET|POST|DELETE /api/wishlist/`

## Signup OTP Flow

Local development uses Django's console email backend by default, so signup codes print in the
terminal running Django.

1. `POST /api/auth/signup/start/`

```json
{
  "email": "guest@example.com",
  "fullName": "Test Guest",
  "phone": "+2348012345678",
  "password": "strong-password"
}
```

2. Read the 6-digit code from the Django terminal output.
3. `POST /api/auth/signup/verify/`

```json
{
  "email": "guest@example.com",
  "code": "123456"
}
```

The verify endpoint creates the user and returns JWT `access` and `refresh` tokens.

## Render + Supabase Deployment

This backend is prepared for Render as a Python web service using Supabase PostgreSQL.

Render settings:

- Root Directory: `backend`
- Runtime: `Python 3`
- Build Command: `bash build.sh`
- Start Command: `gunicorn config.wsgi:application`
- Health Check Path: `/api/health/`

Required production environment variables:

```env
DJANGO_SECRET_KEY=generate-a-long-secret
DJANGO_DEBUG=false
DJANGO_ALLOWED_HOSTS=your-service.onrender.com,your-api-domain.com
DJANGO_CORS_ALLOWED_ORIGINS=https://your-vercel-app.vercel.app,https://your-domain.com
DJANGO_CSRF_TRUSTED_ORIGINS=https://your-vercel-app.vercel.app,https://your-domain.com
DATABASE_URL=postgresql://...
DATABASE_SSL_REQUIRE=true
DATABASE_CONN_MAX_AGE=600
DJANGO_SUPERUSER_EMAIL=admin@example.com
DJANGO_SUPERUSER_PASSWORD=secure-admin-password
DJANGO_SUPERUSER_FULL_NAME=Tanit Admin
DJANGO_EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
DJANGO_DEFAULT_FROM_EMAIL=Tanit Cuisine <orders@your-domain.com>
DJANGO_EMAIL_HOST=smtp-relay.brevo.com
DJANGO_EMAIL_PORT=587
DJANGO_EMAIL_HOST_USER=your-brevo-smtp-login
DJANGO_EMAIL_HOST_PASSWORD=your-brevo-smtp-key
DJANGO_EMAIL_USE_TLS=true
DJANGO_EMAIL_USE_SSL=false
DJANGO_EMAIL_TIMEOUT=20
```

The Render build script runs migrations, seeds the catalog, and creates/updates the superuser automatically.
No Render shell is required on the free tier.

If you need to rotate the admin password, temporarily set:

```env
DJANGO_SUPERUSER_UPDATE_PASSWORD=true
```

Deploy once, then set it back to `false`.

## Brevo OTP Email

Signup OTPs are sent through Django email. Local development uses console email by default, so
codes print in the terminal. Production should use Brevo SMTP:

1. In Brevo, authenticate your sending domain or create a verified sender.
2. Go to SMTP & API settings and create/copy an SMTP key.
3. In Render, set:

```env
DJANGO_EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
DJANGO_DEFAULT_FROM_EMAIL=Tanit Cuisine <orders@your-domain.com>
DJANGO_EMAIL_HOST=smtp-relay.brevo.com
DJANGO_EMAIL_PORT=587
DJANGO_EMAIL_HOST_USER=your-brevo-smtp-login
DJANGO_EMAIL_HOST_PASSWORD=your-brevo-smtp-key
DJANGO_EMAIL_USE_TLS=true
DJANGO_EMAIL_USE_SSL=false
```

Use a Brevo SMTP key, not a Brevo API key.

## Frontend API URL

If signin/signup shows `Failed to fetch`, the browser cannot reach the Django API. Check:

- Vercel has `NEXT_PUBLIC_API_URL=https://your-render-service.onrender.com/api`
- Render has `DJANGO_CORS_ALLOWED_ORIGINS=https://your-vercel-site.vercel.app`
- Render has `DJANGO_CSRF_TRUSTED_ORIGINS=https://your-vercel-site.vercel.app`
- The Render backend is deployed and `/api/health/` opens in the browser

To test SMTP without creating a new user, sign in as a staff/superuser and call:

```http
POST /api/auth/email-test/
Authorization: Bearer <staff-access-token>
Content-Type: application/json

{}
```

The endpoint sends a test email to the staff user's email and returns the Django email backend,
SMTP host, port, TLS/SSL mode, and from address.
