# inkingi-backend

Node.js + Express + MySQL backend for INKINGI admin panel.

## Setup (Windows)

### 1) Install dependencies
```bat
cd server
npm install
```

### 2) Create `.env`
```bat
copy .env.example .env
```
Fill:
- MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE
- JWT_SECRET

### 3) Create database schema
Run `sql/schema.sql` then `sql/seed.sql` in your MySQL instance.

### 4) Run backend
```bat
npm run dev
```
Backend default: http://localhost:4000

## Owner credentials
- Email: `twizerimanaolivier2008@gmail.com`
- Password: `olivier123`

## API Endpoints

### Auth
- `POST /api/auth/otp/request` - Request OTP login (email + password)
- `POST /api/auth/otp/verify` - Verify OTP, returns JWT token + role
- `GET /api/admin/me` - Get current admin profile
- `PATCH /api/admin/profile` - Update email/password

### Articles
- `GET /api/articles` - List articles (search, filter, paginate)
- `GET /api/articles/:id` - Get single article
- `POST /api/articles` - Create article
- `PUT /api/articles/:id` - Update article
- `DELETE /api/articles/:id` - Delete article
- `PATCH /api/articles/:id/featured` - Toggle featured

### Admins (owner only)
- `GET /api/admins` - List all admins
- `POST /api/admins` - Create admin
- `PATCH /api/admins/:id` - Update admin (status, role)
- `DELETE /api/admins/:id` - Delete admin

### Newsletter
- `POST /api/newsletter/subscribe` - Public subscribe
- `GET /api/newsletter/subscribers` - List subscribers (owner)
- `PATCH /api/newsletter/subscribers/:id` - Toggle active (owner)
- `DELETE /api/newsletter/subscribers/:id` - Delete subscriber (owner)

### Admin Tools
- `GET /api/stats` - Dashboard statistics
- `GET /api/activity-logs` - Activity logs (owner)
- `GET /api/admin/export/articles` - Export articles as CSV (owner)
- `POST /api/admin/actions/consume` - Consume daily uses

## Roles
- **owner**: Full access, can manage admins, view logs, export data
- **admin**: Content management only
