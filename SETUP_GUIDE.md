# SV Scrims - Local Setup Guide

## ⚠️ FEATURES YOU SKIPPED (Add Later)
- **Razorpay Payment Processing** - Real-time UPI/card payments
- **Email Notifications** - Automated payment confirmations & updates

These are optional. The app works fully with manual UPI payment verification.

---

## 📋 PREREQUISITES

Install these first:
1. **Node.js** (v18 or higher) - Download from https://nodejs.org
2. **Git** - Download from https://git-scm.com
3. **A Code Editor** - VS Code from https://code.visualstudio.com

Verify installation:
```bash
node --version
npm --version
git --version
```

---

## 🗄️ STEP 1: Choose Your Database

### **Option A: FREE Cloud Database (Recommended)**

#### **Supabase (Best for Beginners)**
1. Go to https://supabase.com
2. Click "Sign Up"
3. Sign in with GitHub (easiest)
4. Create a new project
5. Choose region closest to you
6. Wait for setup (2-3 minutes)
7. Go to **Settings → Database → Connection String**
8. Copy the `postgresql://` URL
9. You now have: `DATABASE_URL`

---

#### **Railway (Alternative)**
1. Go to https://railway.app
2. Sign in with GitHub
3. Create new project → Add PostgreSQL
4. Go to **PostgreSQL** card → **Connect**
5. Copy the full connection string
6. You now have: `DATABASE_URL`

---

### **Option B: Local PostgreSQL**

#### **Windows/Mac/Linux:**
1. Download PostgreSQL: https://www.postgresql.org/download
2. Install it (remember the password you set)
3. Open terminal and create database:
```bash
psql -U postgres
CREATE DATABASE sv_scrims;
\q
```
4. Your `DATABASE_URL`:
```
postgresql://postgres:YOUR_PASSWORD@localhost:5432/sv_scrims
```

---

## 📦 STEP 2: Get the Code

1. **Create a folder** where you want the project:
```bash
mkdir sv-scrims-local
cd sv-scrims-local
```

2. **Clone or Download** the project from Replit:
   - Go to Replit project
   - Click "Share" button
   - Download as ZIP or
   - Clone the Git repo if available

3. **Extract all files** into your folder

---

## 🔧 STEP 3: Setup Environment Variables

1. **In your project root**, create a file named `.env`:

```bash
# For Windows (Command Prompt):
copy nul .env

# For Mac/Linux (Terminal):
touch .env
```

2. **Open `.env` in VS Code** and paste this:

```
# Database
DATABASE_URL=your_database_url_here

# JWT & Session
JWT_SECRET=your_random_secret_key_min_32_characters_long
SESSION_SECRET=another_random_secret_key_min_32_characters

# Node Environment
NODE_ENV=development
```

3. **Replace `your_database_url_here`** with:
   - If Supabase: `postgresql://postgres.xxxxx...` (from Supabase console)
   - If Railway: `postgresql://...` (from Railway console)
   - If Local PostgreSQL: `postgresql://postgres:YOUR_PASSWORD@localhost:5432/sv_scrims`

4. **Generate random secrets** (run in terminal):
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Copy the output and paste into `.env` for both `JWT_SECRET` and `SESSION_SECRET`

---

## 📥 STEP 4: Install Dependencies

Open terminal in your project folder:

```bash
npm install
```

This will take 2-3 minutes. Wait for it to finish.

---

## 🗄️ STEP 5: Setup Database Schema

Run this command to create all database tables:

```bash
npm run db:push
```

**What this does:**
- Creates all tables (users, scrims, transactions, teammates, etc.)
- Sets up relationships between tables
- Prepares database for data

---

## 🚀 STEP 6: Start the App

```bash
npm run dev
```

**You should see:**
```
12:34:56 PM [express] serving on port 5000
```

This means the app is running! ✅

---

## 🌐 STEP 7: Open the App

Open your browser and go to:
```
http://localhost:5000
```

You should see the SV Scrims homepage! 🎉

---

## 📝 ADMIN CREDENTIALS

Log in as Admin:
- **Email:** `sauravans21@gmail.com`
- **Password:** `sauravisgreat`

This auto-creates admin account on first login.

---

## 🎮 TEST THE APP

### Create a Test Scrim:
1. Login as admin
2. Go to Admin Panel → Create tab
3. Fill in scrim details:
   - Match Type: "Squads"
   - Map: "Erangel"
   - Entry Fee: "99"
   - Prize Pool: "5000"
   - Max Players: "32"
   - Date: Tomorrow's date
   - Time: "19:00"

### Test as Player:
1. Sign up as new user
2. Go to Scrims
3. Click "Register & Pay" on the scrim you created
4. Upload UPI screenshot (test image)
5. Go to Admin → Payments → Approve payment

---

## ⚠️ COMMON ISSUES & FIXES

### **Issue: "npm: command not found"**
- Node.js not installed correctly
- **Fix:** Download and reinstall from https://nodejs.org

### **Issue: "DATABASE_URL not valid"**
- Check your `.env` file has correct database URL
- **Fix:** Double-check the connection string from Supabase/Railway/PostgreSQL

### **Issue: "Port 5000 already in use"**
- Another app is using port 5000
- **Fix:** Stop that app or use different port:
```bash
PORT=5001 npm run dev
```

### **Issue: "Module not found" error**
- Dependencies not installed
- **Fix:** Delete `node_modules` folder and run `npm install` again

---

## 🔐 PRODUCTION CHECKLIST (When Ready)

Before going live, you need to add:

1. **Razorpay** (for real payments)
   - Get keys from https://razorpay.com
   - Add to `.env`:
   ```
   RAZORPAY_KEY_ID=your_key
   RAZORPAY_KEY_SECRET=your_secret
   ```

2. **Email Service** (for notifications)
   - Get Gmail App Password from https://myaccount.google.com/apppasswords
   - Add to `.env`:
   ```
   EMAIL_USER=your@gmail.com
   EMAIL_PASSWORD=your_app_password
   ```

3. **Stronger Security**
   - Change admin credentials
   - Use HTTPS in production
   - Add rate limiting
   - Use environment-specific configs

---

## 📚 FILE STRUCTURE

```
sv-scrims-local/
├── server/
│   ├── routes.ts          ← All API endpoints
│   ├── db.ts              ← Database connection
│   ├── app.ts             ← Express app setup
│   ├── email.ts           ← Email service (skip for now)
│   ├── razorpay.ts        ← Payment service (skip for now)
│   └── index-dev.ts       ← Dev server entry
├── client/
│   └── src/
│       ├── pages/         ← All website pages
│       ├── components/    ← Reusable UI components
│       └── lib/           ← Helper functions
├── shared/
│   └── schema.ts          ← Database schemas
├── .env                   ← Your secrets (created by you)
├── package.json           ← Dependencies
└── vite.config.ts         ← Build config
```

---

## ✅ YOU'RE ALL SET!

Your app is ready to customize. You can now:
- Modify game rules
- Change colors/branding
- Add more features
- Deploy to production

**Next Steps:**
1. Follow the setup steps above
2. Test the app locally
3. When ready, add Razorpay & Email features
4. Deploy to production

---

## 📞 QUICK REFERENCE

| Command | Purpose |
|---------|---------|
| `npm install` | Install dependencies |
| `npm run dev` | Start dev server (localhost:5000) |
| `npm run build` | Build for production |
| `npm run db:push` | Create database tables |

---

**Happy coding! 🚀**
