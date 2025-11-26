# ⚠️ FEATURES YOU SKIPPED - ADD THESE LATER

You chose to skip these features for now. Use this checklist when you're ready to add them.

---

## 1. 💳 RAZORPAY PAYMENT PROCESSING

### What It Does:
- Enables real-time UPI & card payments
- Automatic payment verification
- Instant payment confirmation emails

### Current State:
- ✅ Backend routes already created (`server/razorpay.ts`)
- ✅ Payment verification logic ready
- ❌ Not integrated (skipped)
- Players must use manual UPI screenshot upload instead

### How to Add (Step by Step):

#### Step 1: Get Razorpay Keys
1. Go to https://razorpay.com
2. Create account (Indian phone required)
3. Go to **Settings → API Keys**
4. Copy both keys

#### Step 2: Add to `.env`
```
RAZORPAY_KEY_ID=your_key_from_dashboard
RAZORPAY_KEY_SECRET=your_secret_from_dashboard
```

#### Step 3: Test Payment
1. Run app: `npm run dev`
2. Go to Scrims
3. Click "Register & Pay"
4. Use Razorpay test card: `4111 1111 1111 1111`

#### Step 4: Go Live
- Replace test keys with live keys in `.env`
- Change `NODE_ENV=development` to `production`

---

## 2. 📧 EMAIL NOTIFICATIONS

### What It Does:
- Sends payment confirmation emails
- Alerts players when room details are posted
- Wallet update notifications
- Admin activity emails

### Current State:
- ✅ Email service ready (`server/email.ts`)
- ✅ Email functions implemented
- ❌ Not enabled (skipped)
- Players won't receive automated emails

### How to Add (Step by Step):

#### Step 1: Get Gmail App Password
1. Go to https://myaccount.google.com
2. Search for "App passwords"
3. Create app password for "Mail" on "Windows PC"
4. Copy the 16-character password

#### Step 2: Add to `.env`
```
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=paste_your_16_char_password_here
```

#### Step 3: Send Test Email
The app will automatically send emails when:
- ✉️ User registers for scrim
- ✉️ Admin approves payment
- ✉️ Room details are posted
- ✉️ Wallet money is added/withdrawn

#### Step 4: Verify It Works
Check Gmail spam folder if emails don't appear in inbox.

---

## 📋 CHECKLIST: When You're Ready

- [ ] Have Razorpay account with API keys
- [ ] Have Gmail app password
- [ ] Updated `.env` with both services
- [ ] Restarted the app: `npm run dev`
- [ ] Tested payment flow
- [ ] Verified email received
- [ ] Changed admin credentials
- [ ] Tested as regular player

---

## 🔄 HOW TO ADD THEM (Summary)

1. **Already installed packages:**
   - `razorpay` ✅
   - `nodemailer` ✅
   - `@types/nodemailer` ✅

2. **Already written code:**
   - `server/razorpay.ts` ✅
   - `server/email.ts` ✅
   - API routes in `server/routes.ts` ✅

3. **Just need to do:**
   - Get API keys from Razorpay & Gmail
   - Add to `.env` file
   - Test it works
   - That's it! 🎉

---

## 💰 RAZORPAY PRICING

- **Transaction Fee:** 2% for UPI (not 1% as claimed in India)
- **Settlement:** Instant to bank account
- **Minimum Amount:** ₹100
- **Maximum Amount:** No limit

**Your Costs:** User pays ₹100 → You get ₹98

---

## 📧 GMAIL SETUP (Detailed)

### If Using Personal Gmail:
1. Go to https://myaccount.google.com
2. Click "Security" (left menu)
3. Search "App passwords"
4. Select "Mail" and "Windows PC"
5. Copy 16-character password
6. Add to `.env`

### If Using Business Email:
- Use SendGrid instead (free tier available)
- Or use your email service provider's SMTP settings

---

## ⏰ TIMELINE RECOMMENDATION

**Week 1:** Get app working (✅ You're here)
**Week 2:** Add Razorpay (easy - 30 mins)
**Week 3:** Add Email (easy - 15 mins)
**Week 4:** Deploy live

---

## 🆘 TROUBLESHOOTING

### Razorpay not working?
- Check API keys are correct (no extra spaces)
- Ensure `NODE_ENV=development` for test mode
- Check browser console for errors

### Emails not sending?
- Check Gmail "Less secure apps" is ON
- Verify app password (not regular password)
- Check spam folder
- Check `.env` EMAIL_PASSWORD has no extra spaces

---

## 🔗 USEFUL LINKS

- Razorpay Documentation: https://razorpay.com/docs/
- Nodemailer Guide: https://nodemailer.com/
- Gmail App Passwords: https://myaccount.google.com/apppasswords

---

**When you're ready, just add the keys to `.env` and everything will work! 🚀**
