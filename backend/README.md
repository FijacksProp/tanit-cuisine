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
