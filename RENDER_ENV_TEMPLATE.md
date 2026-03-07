# Render Environment Variables Template

## Step 1: Create a MySQL Database

You have two options:

### Option A: Use Render's Managed MySQL Database (Recommended)
1. Go to Render Dashboard → "New +" → "MySQL"
2. Choose a name (e.g., "gettourguide-db")
3. Select a plan (Free tier available)
4. Click "Create Database"
5. Once created, go to the database dashboard
6. Copy the connection details (Internal Database URL or External Database URL)

### Option B: Use Railway MySQL Database
1. Go to Railway.app
2. Create a new project
3. Add MySQL service
4. Copy the connection details from Railway

### Option C: Use Any Cloud MySQL Provider
- AWS RDS
- Google Cloud SQL
- DigitalOcean Managed Database
- PlanetScale
- etc.

---

## Step 2: Add These Environment Variables to Render

Go to your Render service → Environment tab → Add the following:

### 🔴 REQUIRED - Database Configuration
```
DB_HOST=your-mysql-host-here
DB_USER=your-mysql-username-here
DB_PASSWORD=your-mysql-password-here
DB_NAME=your-database-name-here
DB_PORT=3306
DB_SSL=true
```

**For Render MySQL:**
- DB_HOST: Usually something like `dpg-xxxxx-a.oregon-postgres.render.com` (check your database dashboard)
- DB_USER: Found in your database connection string
- DB_PASSWORD: Found in your database connection string
- DB_NAME: Your database name
- DB_PORT: Usually 3306 for MySQL
- DB_SSL: Set to `true` for cloud databases

**For Railway MySQL:**
- DB_HOST: Usually something like `containers-us-west-xxx.railway.app` or from Railway's connection string
- DB_USER: Usually `root` or from Railway's connection string
- DB_PASSWORD: From Railway's connection string
- DB_NAME: Usually `railway` or your database name
- DB_PORT: Usually 3306
- DB_SSL: Set to `true`

### 🔴 REQUIRED - Server Configuration
```
PORT=10000
NODE_ENV=production
```

### 🔴 REQUIRED - Security
```
JWT_SECRET=generate-a-strong-random-secret-key-here-minimum-32-characters
```

**Generate a secure JWT_SECRET:**
- Use: `openssl rand -base64 32` (in terminal)
- Or use an online generator: https://randomkeygen.com/
- Make it at least 32 characters long

### 🟡 RECOMMENDED - Email Configuration (for password reset, notifications)
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password-here
EMAIL_FROM=GetTourGuide <your-email@gmail.com>
```

**For Gmail:**
1. Enable 2-Factor Authentication
2. Go to Google Account → Security → App Passwords
3. Generate an app password
4. Use that as SMTP_PASS

### 🟡 RECOMMENDED - Application URLs
```
APP_URL=https://your-frontend-url.onrender.com
APP_DOMAIN=https://your-frontend-url.onrender.com
FRONTEND_URL=https://your-frontend-url.onrender.com
```

Replace with your actual frontend URL after deployment.

### 🟡 RECOMMENDED - Stripe (for payments)
```
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
```

Get this from: https://dashboard.stripe.com/apikeys

### 🟢 OPTIONAL - Additional Settings
```
DB_CONNECTION_LIMIT=10
RESET_TOKEN_EXPIRES_HOURS=1
ADMIN_EMAIL=your-admin-email@gmail.com
APP_NAME=GetTourGuide
LOG_LEVEL=info
```

---

## Complete Example (Fill in your values)

```
# Database
DB_HOST=dpg-abc123xyz.oregon-postgres.render.com
DB_USER=gettourguide_user
DB_PASSWORD=your_secure_password_123
DB_NAME=gettourguide_db
DB_PORT=3306
DB_SSL=true
DB_CONNECTION_LIMIT=10

# Server
PORT=10000
NODE_ENV=production

# Security
JWT_SECRET=your-super-secure-random-secret-key-min-32-chars-long

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
EMAIL_FROM=GetTourGuide <your-email@gmail.com>

# URLs
APP_URL=https://your-frontend.onrender.com
APP_DOMAIN=https://your-frontend.onrender.com
FRONTEND_URL=https://your-frontend.onrender.com

# Stripe
STRIPE_SECRET_KEY=sk_test_51SNED6RyyubpAgjY...

# Other
ADMIN_EMAIL=admin@example.com
APP_NAME=GetTourGuide
RESET_TOKEN_EXPIRES_HOURS=1
LOG_LEVEL=info
```

---

## Quick Setup Guide

1. **Create MySQL Database** (Render or Railway)
2. **Copy connection details** from your database dashboard
3. **Go to Render service** → Environment tab
4. **Add all variables** from the template above
5. **Save and redeploy**
6. **Check logs** to verify connection

---

## Troubleshooting

### If database connection fails:
- ✅ Check DB_HOST is correct (not localhost)
- ✅ Verify DB_SSL is set to `true` for cloud databases
- ✅ Ensure database allows connections from Render's IPs
- ✅ Check username and password are correct
- ✅ Verify database name exists

### If you see "Access denied":
- Check database user has proper permissions
- Verify password is correct
- Ensure database allows external connections

---

## Notes

- Never commit `.env` files to git
- Use strong, unique passwords
- Keep JWT_SECRET secret and secure
- Update FRONTEND_URL after deploying frontend
- Test email configuration before going live

