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
- `GET /api/categories/`
- `GET /api/products/`
- `GET /api/products/{slug}/`
- `POST /api/orders/`
- `GET /api/orders/{orderNumber}/`
- `POST /api/contact/`
- `GET|POST|DELETE /api/wishlist/`
