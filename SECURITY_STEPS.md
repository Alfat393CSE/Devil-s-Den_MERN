# 🔒 URGENT SECURITY STEPS - MongoDB Credentials Exposed

Your MongoDB credentials and other sensitive information were exposed in the Git repository. Follow these steps immediately:

## ✅ Step 1: Rotate MongoDB Credentials (CRITICAL - Do This First!)

### A. Create New MongoDB User
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Login to your account
3. Select your project/cluster
4. Go to **Database Access** (Security section)
5. Click **Add New Database User**
6. Create a new user with:
   - Username: Choose a new username (NOT `alfattasnimhasan_db_user`)
   - Password: Generate a strong password (use the "Autogenerate Secure Password" button)
   - Database User Privileges: `readWriteAnyDatabase` or specific database access
7. **Save** and copy the new credentials

### B. Update Your Local .env File
1. Replace `MONGO_URI` in `.env` with the new connection string
2. Replace the username and password in the URI with your new credentials

### C. Delete Old MongoDB User
1. Go back to **Database Access** in MongoDB Atlas
2. Find the old user: `alfattasnimhasan_db_user`
3. Click the **trash icon** to delete it
4. Confirm deletion

## ✅ Step 2: Rotate JWT Secret

Generate a new JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Replace `JWT_SECRET` in your `.env` file with the new value.

## ✅ Step 3: Rotate Admin Secret

Generate a new admin secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Replace `ADMIN_SECRET` in your `.env` file with the new value.

## ✅ Step 4: Rotate Email App Password

1. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
2. Delete the old app password: `mbolpiqovpvbxyxb`
3. Generate a new app password for "Mail"
4. Copy the new password
5. Replace `EMAIL_PASSWORD` in your `.env` file

## ✅ Step 5: Remove .env from Git History

The `.env` file has been removed from tracking, but it still exists in git history. Run:

```bash
# Remove .env from git cache
git rm --cached .env
git rm --cached frontend/.env

# Commit the changes
git commit -m "Remove sensitive .env files from tracking"

# Push to remote
git push origin main
```

## ✅ Step 6: Check Security Logs

### MongoDB Atlas
1. Go to your MongoDB Atlas dashboard
2. Navigate to **Security** → **Activity Feed**
3. Check for any unauthorized access attempts
4. Review **Network Access** settings - ensure only your IPs are whitelisted

### GitHub
1. Go to your repository: https://github.com/Alfat393CSE/Devil-s-Den_MERN
2. Check **Settings** → **Security** → **Code scanning alerts**
3. Close the alert once you've rotated all credentials

### Gmail Account
1. Check your Gmail **Security** page: https://myaccount.google.com/security
2. Review recent sign-in activity
3. Check for any unauthorized access

## ✅ Step 7: Close GitHub Security Alert

After completing all above steps:
1. Go to your repository's **Security** tab
2. Find the MongoDB URI exposure alert
3. Mark it as **Revoked** or **Fixed**
4. Add a comment: "Credentials rotated, old credentials deleted, .env removed from git history"

## 🛡️ Best Practices Going Forward

1. **Never commit .env files** - They're already in `.gitignore`
2. **Use environment variables** in production (Vercel, Heroku, etc.)
3. **Rotate secrets regularly** (every 90 days recommended)
4. **Use strong passwords** - Generate with password managers
5. **Enable 2FA** on all accounts (GitHub, MongoDB Atlas, Gmail)
6. **Whitelist IPs** in MongoDB Atlas Network Access
7. **Review git commits** before pushing to catch accidental leaks

## 📝 Checklist

- [ ] Created new MongoDB user with different credentials
- [ ] Updated MONGO_URI in .env
- [ ] Deleted old MongoDB user (`alfattasnimhasan_db_user`)
- [ ] Generated and replaced JWT_SECRET
- [ ] Generated and replaced ADMIN_SECRET
- [ ] Revoked old Gmail app password
- [ ] Generated new Gmail app password
- [ ] Updated EMAIL_PASSWORD in .env
- [ ] Removed .env from git tracking
- [ ] Pushed changes to GitHub
- [ ] Checked MongoDB security logs
- [ ] Checked Gmail security activity
- [ ] Closed GitHub security alert as "Revoked"
- [ ] Tested application with new credentials
- [ ] Enabled 2FA on all accounts

## ⚠️ If You Suspect Unauthorized Access

1. **Immediately** change your MongoDB Atlas account password
2. **Immediately** change your GitHub password
3. **Immediately** change your Gmail password
4. Enable 2FA on all accounts
5. Review all database collections for unauthorized modifications
6. Consider creating a new MongoDB cluster if data integrity is compromised

---

**Need Help?**
- MongoDB Support: https://support.mongodb.com/
- GitHub Support: https://support.github.com/
- Google Support: https://support.google.com/
