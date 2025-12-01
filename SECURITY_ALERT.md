# 🚨 IMMEDIATE ACTION REQUIRED - Security Alert

Your MongoDB credentials and sensitive information were exposed in this repository's git history.

## ⚡ DO THESE 4 STEPS RIGHT NOW:

### 1️⃣ ROTATE MONGODB CREDENTIALS (Most Critical!)

**Go to MongoDB Atlas NOW:**
1. Visit: https://cloud.mongodb.com/
2. Login → Select your cluster
3. Go to **Database Access** (left sidebar)
4. Click **"Add New Database User"**
   - Username: Choose a NEW username (different from `alfattasnimhasan_db_user`)
   - Password: Click **"Autogenerate Secure Password"** and copy it
   - Privileges: `readWriteAnyDatabase`
5. Click **"Add User"**
6. **Update your local `.env` file** with the new `MONGO_URI`
7. **DELETE the old user** `alfattasnimhasan_db_user` from Database Access

### 2️⃣ REVOKE OLD CREDENTIALS

**Delete the exposed MongoDB user:**
- In MongoDB Atlas → Database Access
- Find user: `alfattasnimhasan_db_user`
- Click trash icon → Confirm deletion

**Revoke Gmail App Password:**
1. Visit: https://myaccount.google.com/apppasswords
2. Delete the password ending in `...xyxb`
3. Generate a new one
4. Update `EMAIL_PASSWORD` in your `.env`

### 3️⃣ CHECK SECURITY LOGS

**MongoDB Atlas:**
- Go to: Security → Activity Feed
- Look for suspicious access attempts
- Note any unauthorized IPs

**Gmail:**
- Visit: https://myaccount.google.com/security
- Check "Recent security activity"
- Look for unknown sign-ins

**GitHub:**
- Visit your repo: https://github.com/Alfat393CSE/Devil-s-Den_MERN
- Go to: Settings → Security
- Review alerts

### 4️⃣ CLOSE THE GITHUB ALERT

After rotating credentials:
1. Go to your repository → **Security** tab
2. Find the MongoDB URI alert
3. Click on it
4. Click **"Dismiss alert"** → Select **"Revoked"**
5. Add comment: "All credentials rotated and old ones deleted"

---

## 📋 Detailed Steps

See **[SECURITY_STEPS.md](./SECURITY_STEPS.md)** for complete instructions including:
- How to generate new JWT and Admin secrets
- Setting up your `.env` file properly
- Best practices for security
- Full checklist

## ⚙️ Quick Setup After Rotating Credentials

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update `.env` with your NEW credentials:
   ```env
   MONGO_URI=mongodb+srv://NEW_USERNAME:NEW_PASSWORD@cluster0...
   JWT_SECRET=<generate new with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">
   ADMIN_SECRET=<generate new with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">
   EMAIL_PASSWORD=<your new Gmail app password>
   ```

3. Test the application:
   ```bash
   cd backend
   npm run dev
   ```

## 🛡️ Prevention

The `.env` file is now in `.gitignore` and won't be committed again. Always:
- ✅ Keep `.env` in `.gitignore`
- ✅ Use `.env.example` for templates
- ✅ Never commit sensitive credentials
- ✅ Rotate secrets every 90 days
- ✅ Enable 2FA on all accounts

---

**⏰ Time Sensitive:** Complete steps 1-4 within the next hour to prevent potential unauthorized access.

**Questions?** Check [SECURITY_STEPS.md](./SECURITY_STEPS.md) for detailed help.
