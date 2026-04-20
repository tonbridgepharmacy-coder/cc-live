# 🔧 `.env` File — Har Variable Ka Deep Explanation with Examples

---

## 🗄️ SECTION 1: DATABASE

---

### 1. `MONGODB_URI`
```
MONGODB_URI=mongodb+srv://cc_db_user:2CrN8zV5TVUvlnZA@ccc.vzbb5an.mongodb.net/ccc_db?retryWrites=true&w=majority&appName=ccc
```

**Kya hai?** Ye tera MongoDB Atlas database ka full connection address hai — jaise tera ghar ka address hota hai, waise hi ye database ka address hai.

**Parts breakdown:**
| Part | Meaning |
|------|---------|
| `mongodb+srv://` | Protocol — bata raha hai ki MongoDB Atlas (cloud) se connect karna hai |
| `cc_db_user` | Database username |
| `2CrN8zV5TVUvlnZA` | Database password |
| `@ccc.vzbb5an.mongodb.net` | Atlas cluster ka hostname (server address) |
| `/ccc_db` | Kis database mein data store karna hai |
| `?retryWrites=true` | Agar write fail ho jaye toh automatically retry kare |
| `&w=majority` | Data tab "saved" maane jab majority servers ne confirm kiya |
| `&appName=ccc` | Atlas dashboard mein ye naam dikhega for tracking |

**Example scenarios:**
```bash
# Local MongoDB (development)
MONGODB_URI=mongodb://localhost:27017/ccc_db

# Atlas Free Tier
MONGODB_URI=mongodb+srv://user:pass@cluster0.abc123.mongodb.net/mydb

# Atlas with replica set (production)
MONGODB_URI=mongodb+srv://user:pass@prod-cluster.xyz.mongodb.net/ccc_db?retryWrites=true&w=majority
```

**⚠️ Security:** Ye sabse sensitive variable hai — kabhi GitHub pe push mat karna!

---

### 2. `DB_CONNECTION_TIMEOUT=5000`

**Kya hai?** Jab app MongoDB se connect hone ki koshish karta hai, toh kitni der (milliseconds mein) wait karega.

**Real-life analogy:** Tu phone pe call lagata hai — 5 second tak ring karegi, agar pick nahi hua toh "call failed" bol dega.

```
5000ms = 5 seconds
```

**Example scenarios:**
```bash
# Fast network / paid Atlas (kam timeout chahiye)
DB_CONNECTION_TIMEOUT=3000    # 3 seconds

# Slow network / free tier Atlas (zyada time do)
DB_CONNECTION_TIMEOUT=10000   # 10 seconds

# Very unreliable network
DB_CONNECTION_TIMEOUT=15000   # 15 seconds
```

**Code mein kahan use hota hai:** [db.ts](file:///c:/Users/omkar/Desktop/CLIENTS_PROJECT/cc-live/src/lib/db.ts#L29)
```typescript
serverSelectionTimeoutMS: parseInt(process.env.DB_CONNECTION_TIMEOUT || "5000")
```

---

### 3. `DB_SOCKET_TIMEOUT=45000`

**Kya hai?** Connection ban gaya, ab query chal rahi hai — toh wo query kitni der tak chal sakti hai before timeout.

**Real-life analogy:** Phone connect ho gaya, ab baat chal rahi hai. Agar 45 second tak koi response na aaye toh call cut ho jayegi.

```
45000ms = 45 seconds
```

**Example scenarios:**
```bash
# Simple CRUD app (fast queries)
DB_SOCKET_TIMEOUT=30000    # 30 seconds kaafi hai

# Heavy aggregation/reports (slow queries)
DB_SOCKET_TIMEOUT=120000   # 2 minutes — report generation ke liye

# Image/file processing with DB
DB_SOCKET_TIMEOUT=60000    # 1 minute
```

**`DB_CONNECTION_TIMEOUT` vs `DB_SOCKET_TIMEOUT` — Kya fark hai?**
```
CONNECTION_TIMEOUT = "Server mil raha hai ya nahi?" (connect hone ka time)
SOCKET_TIMEOUT     = "Query ka jawab aa raha hai ya nahi?" (data transfer ka time)
```

---

### 4. `DB_POOL_SIZE=10`

**Kya hai?** App ek saath kitni MongoDB connections khol sakta hai. Ye connections reuse hoti hain — har request ke liye nayi connection nahi banani padti.

**Real-life analogy:** Soch restaurant mein 10 waiters hain. Agar 10 customers aa gaye toh sab ko serve kar lenge. 11th customer ko wait karna padega jab tak koi waiter free na ho.

```bash
# Small app, low traffic (1-50 users)
DB_POOL_SIZE=5

# Medium app (50-500 users)
DB_POOL_SIZE=10     # ← current setting

# High traffic production (500+ concurrent users)
DB_POOL_SIZE=25

# Very heavy load
DB_POOL_SIZE=50
```

> [!WARNING]
> MongoDB Atlas **Free Tier (M0)** mein max 500 connections ka limit hota hai. Agar multiple app instances chal rahe hain toh pool size accordingly kam rakho.

---

## 🔐 SECTION 2: AUTHENTICATION

---

### 5. `AUTH_SECRET`
```
AUTH_SECRET=pX7f9mB2qR5vT8dL3wK6nG4cY1hJ0zEw
```

**Kya hai?** NextAuth ka master encryption key. Session data, cookies, CSRF tokens — sab kuch isse encrypt hota hai.

**Real-life analogy:** Ye tera safe ka master key hai — isse cookies sign hoti hain. Agar koi ye key jaan le toh fake sessions bana sakta hai.

**Kaise generate karte hain:**
```bash
# Terminal mein run karo
openssl rand -base64 32
# Output: kL9mN3pQ7rT2vX5yB8dF1gH4jW6sA0cE

# Ya Node.js mein
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

> [!CAUTION]
> - Production mein **strong random string** use karo (32+ characters)
> - Ye change karoge toh **sabke sessions expire** ho jayenge (sab logout ho jayenge!)
> - Kabhi hardcode mat karo source code mein

---

### 6. `JWT_SECRET`
```
JWT_SECRET=kL9mN3pQ7rT2vX5yB8dF1gH4jW6sA0cE
```

**Kya hai?** JWT (JSON Web Token) ko sign karne ke liye alag key. Ye verify karta hai ki token genuine hai ya tampered.

**`AUTH_SECRET` vs `JWT_SECRET` — Kya fark hai?**
```
AUTH_SECRET = NextAuth ki internal workings ke liye (cookies, CSRF, encryption)
JWT_SECRET  = Specifically JWT tokens sign karne ke liye

Dono alag rakhne chahiye for better security (defense in depth).
```

**JWT Token kaise kaam karta hai:**
```
1. User login karta hai
2. Server JWT banata hai: { id: "123", role: "admin", email: "admin@..." }
3. JWT_SECRET se sign karta hai → eyJhbGciOiJIUzI1NiJ9.eyJpZCI6...
4. Har request mein ye token verify hota hai JWT_SECRET se
5. Agar kisi ne token modify kiya → signature match nahi karega → REJECTED!
```

---

### 7. `AUTH_URL` (commented out)
```bash
# AUTH_URL=http://www.clarkeandcoleman.com
```

**Kya hai?** Production mein tera website ka URL. NextAuth isko use karta hai callbacks, redirects, aur CSRF protection ke liye.

**Kab uncomment karna hai:**
```bash
# Development mein → COMMENTED (NextAuth auto-detect karta hai localhost)
# AUTH_URL=http://www.clarkeandcoleman.com

# Production deploy karte waqt → UNCOMMENT
AUTH_URL=https://www.clarkeandcoleman.com
```

**Code mein dekh:** [auth.ts](file:///c:/Users/omkar/Desktop/CLIENTS_PROJECT/cc-live/src/auth.ts#L10-L12)
```typescript
// Development mein AUTH_URL auto delete ho jata hai taaki conflict na ho
if (process.env.NODE_ENV !== "production") {
    delete process.env.AUTH_URL;
}
```

---

### 8. `AUTH_TRUST_HOST=true`

**Kya hai?** Kya NextAuth ko host header pe trust karna chahiye?

**Kab chahiye:**
- Jab reverse proxy ke peeche deploy karte ho (Vercel, Nginx, Cloudflare)
- Proxy/load balancer request forward karta hai — original host header preserve karna zaroori hai

```bash
# Vercel, Railway, Render pe deploy → true
AUTH_TRUST_HOST=true

# Direct server pe bina proxy → false bhi chal jayega
AUTH_TRUST_HOST=false
```

---

### 9. `SESSION_MAX_AGE=2592000`

**Kya hai?** User ka login kitne **seconds** tak valid rahega. Iske baad auto-logout ho jayega.

**Real-life analogy:** Movie ticket pe likha hota hai "valid for 30 days". 30 din baad ticket expire — dobara khareedna padega (login karna padega).

```
2592000 seconds = 30 days
```

**Common values:**
```bash
SESSION_MAX_AGE=3600       # 1 hour   — banking app level security
SESSION_MAX_AGE=86400      # 1 day    — tight security
SESSION_MAX_AGE=604800     # 7 days   — moderate security
SESSION_MAX_AGE=1209600    # 14 days  — balanced
SESSION_MAX_AGE=2592000    # 30 days  — ← current (relaxed, admin panel ke liye theek hai)
SESSION_MAX_AGE=7776000    # 90 days  — very relaxed ("remember me" type)
```

**Code mein:** [auth.config.ts](file:///c:/Users/omkar/Desktop/CLIENTS_PROJECT/cc-live/src/auth.config.ts#L9)
```typescript
session: {
    strategy: "jwt",
    maxAge: parseInt(process.env.SESSION_MAX_AGE || "2592000"),
}
```

---

### 10. `SESSION_UPDATE_AGE=86400`

**Kya hai?** Session token kitne **seconds** baad refresh (renew) hoga.

**Real-life analogy:** Tera gym membership card har 24 ghante mein stamp lagwana padta hai. Agar 24 ghante mein gym gaya toh stamp lag gaya, nahi gaya toh purana stamp se kaam chalega jab tak expire na ho.

```
86400 seconds = 24 hours
```

**Flow:**
```
User login → Session created (valid 30 days)
         ↓
Hour 0-24: Session untouched
         ↓
Hour 24+: User visits site → Session RENEWED for another 30 days
         ↓
This keeps extending as long as user is active
```

```bash
SESSION_UPDATE_AGE=3600     # Har 1 ghante mein refresh (zyada DB/server load)
SESSION_UPDATE_AGE=86400    # Har 24 ghante mein ← balanced (current)
SESSION_UPDATE_AGE=604800   # Har 7 din mein (kam load but less fresh)
```

---

## 👤 SECTION 3: ADMIN CREDENTIALS

---

### 11. `ADMIN_EMAIL=admin@clarkecoleman.com`

**Kya hai?** Hardcoded admin login email. Ye database ke bina bhi kaam karta hai — direct env se match hota hai.

**Code mein:** [auth.ts](file:///c:/Users/omkar/Desktop/CLIENTS_PROJECT/cc-live/src/auth.ts#L34-L49)
```typescript
const envEmail = process.env.ADMIN_EMAIL;
if (email.toLowerCase() === envEmail.toLowerCase() && password === envPassword) {
    return { id: "env-admin", name: "Admin", email: envEmail, role: "admin" };
}
```

**Login flow:**
```
User enters email + password
    ↓
Step 1: Check against ADMIN_EMAIL + ADMIN_PASSWORD (env)  ← FAST, no DB needed
    ↓ (if no match)
Step 2: Check against database users                      ← DB query
    ↓ (if no match)
Return "Invalid credentials"
```

---

### 12. `ADMIN_PASSWORD=admin123`

**Kya hai?** Hardcoded admin password — env se compare hota hai, **plain text** mein stored hai (hashed nahi).

> [!CAUTION]
> Production mein **strong password** use karo! `admin123` sirf development ke liye hai.
> ```bash
> # Production examples:
> ADMIN_PASSWORD=Str0ng!P@ss#2024$Clarke
> ADMIN_PASSWORD=xK9$mP2!qR5#vT8@dL3
> ```

---

### 13. `ADMIN_NAME=Super Admin`

**Kya hai?** Admin dashboard mein display hone wala naam. Functional impact nahi hai — sirf UI ke liye.

```bash
ADMIN_NAME=Super Admin
ADMIN_NAME=Clarke Admin
ADMIN_NAME=John Smith
```

---

## ☁️ SECTION 4: CLOUDINARY

---

### 14. `CLOUDINARY_URL`
```
CLOUDINARY_URL=cloudinary://538285485613866:vBhx932xEwll-W4m96OfeK4aIZc@dvimxyscy
```

**Kya hai?** Cloudinary image hosting service ka connection string. Images upload, transform, aur serve karne ke liye.

**Parts breakdown:**
```
cloudinary://[API_KEY]:[API_SECRET]@[CLOUD_NAME]

API_KEY    = 538285485613866        → Tera account identify karta hai
API_SECRET = vBhx932xEwll-W4m96OfeK4aIZc → Secret key for API calls
CLOUD_NAME = dvimxyscy               → Tera cloud space ka naam
```

**Ye kya karta hai project mein:**
- Admin panel se blog images upload hoti hain → Cloudinary pe store hoti hain
- Services ki images → Cloudinary
- Responsive images auto-generate hoti hain (thumbnails, WebP, etc.)

---

### 15. `MAX_UPLOAD_SIZE=10485760`

**Kya hai?** Maximum file upload size **bytes** mein.

```
10485760 bytes = 10 MB
```

```bash
MAX_UPLOAD_SIZE=5242880     # 5 MB  — strict (mobile-friendly images)
MAX_UPLOAD_SIZE=10485760    # 10 MB — ← current (balanced)
MAX_UPLOAD_SIZE=20971520    # 20 MB — large images allowed
MAX_UPLOAD_SIZE=52428800    # 50 MB — PDF/large files
```

---

## 💳 SECTION 5: STRIPE (PAYMENTS)

---

### 16. `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
```

**Kya hai?** Stripe ka **public** key — browser mein use hota hai payment form render karne ke liye.

**`NEXT_PUBLIC_` prefix ka matlab:**
```
NEXT_PUBLIC_ = Ye variable BROWSER mein bhi available hoga (client-side)
Without prefix = Sirf SERVER pe available hoga (private)
```

**Ye safe hai browser mein expose karna** — isse koi payment nahi le sakta, sirf payment form display hota hai.

```bash
# Test mode (development) — fake payments
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_TYooMQauvdEDq54NiTphI7jx

# Live mode (production) — real payments
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_AbCdEfGhIjKlMnOpQrStUvWx
```

---

### 17. `STRIPE_SECRET_KEY`
```
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
```

**Kya hai?** Stripe ka **secret** key — server pe use hota hai actual payment charge karne ke liye.

> [!CAUTION]
> Ye **kabhi browser mein expose mat karna**! Isse koi bhi tera Stripe account se payments charge kar sakta hai.
> Isliye isme `NEXT_PUBLIC_` prefix NAHI hai.

```bash
# Test mode
STRIPE_SECRET_KEY=sk_test_YOUR_TEST_SECRET_KEY

# Live mode (REAL MONEY!)
STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_SECRET_KEY
```

---

### 18. `STRIPE_WEBHOOK_SECRET`
```
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
```

**Kya hai?** Jab Stripe koi event bhejta hai (payment success, refund, etc.) tere server pe, toh ye secret verify karta hai ki wo **sach mein Stripe se aaya hai** ya koi fake request hai.

**Flow:**
```
Customer pays → Stripe processes → Stripe sends webhook to your API
                                          ↓
                                Your server verifies: 
                                "Is this really from Stripe?"
                                          ↓
                            Uses STRIPE_WEBHOOK_SECRET to verify signature
                                          ↓
                               ✅ Verified → Process payment
                               ❌ Invalid → Reject (possible attack!)
```

---

### 19. `STRIPE_CURRENCY=gbp`

**Kya hai?** Payments kis currency mein honge.

```bash
STRIPE_CURRENCY=gbp    # British Pound (£) ← current
STRIPE_CURRENCY=usd    # US Dollar ($)
STRIPE_CURRENCY=eur    # Euro (€)
STRIPE_CURRENCY=inr    # Indian Rupee (₹)
STRIPE_CURRENCY=aud    # Australian Dollar (A$)
```

---

## 📧 SECTION 6: EMAIL

---

### 20. `EMAIL_USER=your-email@gmail.com`

**Kya hai?** Kis email address se emails jayenge (sender email).

```bash
EMAIL_USER=noreply@clarkecoleman.com    # Professional
EMAIL_USER=admin@clarkecoleman.com       # Admin
EMAIL_USER=yourname@gmail.com            # Gmail personal
```

---

### 21. `EMAIL_PASS=your-app-password`

**Kya hai?** Email account ka password ya **App Password**.

**Gmail ke liye App Password kaise banayein:**
```
1. Google Account → Security → 2-Step Verification ON karo
2. Security → App Passwords → Select app: "Mail" → Generate
3. 16-character password milega (e.g., "abcd efgh ijkl mnop")
4. Wo yahan paste karo (spaces hata ke)
```

```bash
EMAIL_PASS=abcdefghijklmnop    # Gmail App Password (16 chars, no spaces)
```

> [!IMPORTANT]
> Gmail ka **normal password NAHI chalega**! Google ne 2022 se "Less secure apps" band kar diya hai. Tumhe **App Password** banana padega.

---

### 22. `EMAIL_HOST` (commented — optional)
```bash
# EMAIL_HOST=smtp.gmail.com
```

**Kya hai?** SMTP server ka address. Gmail use kar rahe ho toh iska need nahi — code automatically Gmail service use karta hai.

```bash
# Gmail (default — commented rakh sakte ho)
EMAIL_HOST=smtp.gmail.com

# Outlook/Hotmail
EMAIL_HOST=smtp.office365.com

# Yahoo
EMAIL_HOST=smtp.mail.yahoo.com

# Zoho
EMAIL_HOST=smtp.zoho.com

# Custom domain (GoDaddy, Hostinger, etc.)
EMAIL_HOST=smtp.hostinger.com
```

---

### 23. `EMAIL_PORT` (commented — optional)
```bash
# EMAIL_PORT=587
```

**Kya hai?** SMTP server ka port number.

```bash
EMAIL_PORT=587    # TLS (most common, recommended) — "STARTTLS"
EMAIL_PORT=465    # SSL (legacy but still used)
EMAIL_PORT=25     # Unencrypted (NEVER use in production!)
```

**Port 587 vs 465:**
```
587 = Connection start hota hai unencrypted → phir STARTTLS se encrypt ho jata hai
465 = Connection start hi encrypted hota hai (SSL/TLS)

587 zyada common hai aur recommended hai.
```

---

### 24. `EMAIL_SECURE` (commented — optional)
```bash
# EMAIL_SECURE=false
```

**Kya hai?** Connection shuru se SSL/TLS encrypted hogi ya nahi.

```bash
EMAIL_SECURE=false    # Port 587 ke liye (STARTTLS use hoga)
EMAIL_SECURE=true     # Port 465 ke liye (direct SSL)
```

---

### 25. `EMAIL_FROM_NAME=Clarke & Coleman Pharmacy`

**Kya hai?** Email mein sender ka naam kya dikhega.

**Email inbox mein aisi dikhti hai:**
```
From: "Clarke & Coleman Pharmacy" <admin@clarkecoleman.com>
              ↑ EMAIL_FROM_NAME           ↑ EMAIL_USER
```

```bash
EMAIL_FROM_NAME=Clarke & Coleman Pharmacy     # ← current
EMAIL_FROM_NAME=CC Pharmacy Support
EMAIL_FROM_NAME=No Reply
```

---

### 26. `EMAIL_TIMEOUT=10000`

**Kya hai?** SMTP server se connect hone ka timeout (milliseconds mein).

```
10000ms = 10 seconds
```

```bash
EMAIL_TIMEOUT=5000     # 5s  — fast SMTP (Gmail)
EMAIL_TIMEOUT=10000    # 10s — ← current (safe default)
EMAIL_TIMEOUT=30000    # 30s — slow/unreliable SMTP
```

---

## 🌐 SECTION 7: APP CONFIGURATION

---

### 27. `NEXT_PUBLIC_SITE_URL=http://localhost:3000`

**Kya hai?** Tera website ka full URL. Emails mein links, SEO meta tags, social sharing mein use hota hai.

**`NEXT_PUBLIC_` isliye hai** kyunki frontend components ko bhi ye URL chahiye (e.g., social share buttons).

```bash
# Development
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Production
NEXT_PUBLIC_SITE_URL=https://www.clarkeandcoleman.com

# Staging
NEXT_PUBLIC_SITE_URL=https://staging.clarkeandcoleman.com
```

**Example usage:**
```typescript
// Email mein link
const resetLink = `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password?token=abc123`;
// → "https://www.clarkeandcoleman.com/reset-password?token=abc123"
```

---

### 28. `NEXT_PUBLIC_SITE_NAME=Clarke & Coleman Pharmacy`

**Kya hai?** Website ka naam — SEO meta tags, page titles, emails mein use hota hai.

```html
<!-- Browser tab mein -->
<title>Services | Clarke & Coleman Pharmacy</title>

<!-- Social sharing -->
<meta property="og:site_name" content="Clarke & Coleman Pharmacy" />
```

---

### 29. `NODE_ENV=development`

**Kya hai?** App kis mode mein chal raha hai. **Next.js ye automatically set karta hai** — usually manually set karne ki zaroorat nahi.

```bash
NODE_ENV=development    # npm run dev → debug tools ON, fast refresh, no minification
NODE_ENV=production     # npm run build → optimized, minified, error details hidden
NODE_ENV=test           # testing frameworks ke liye
```

**Code mein effect:**
```typescript
// Development mein AUTH_URL delete hota hai
if (process.env.NODE_ENV !== "production") {
    delete process.env.AUTH_URL;   // localhost pe conflict na ho
}

// Production mein detailed errors hide hoti hain
// Development mein React DevTools available hote hain
```

---

### 30. `PORT=3000`

**Kya hai?** Server kis port pe chalega.

```bash
PORT=3000    # Default ← current
PORT=3001    # Agar 3000 pe koi aur app chal raha ho
PORT=8080    # Custom port
PORT=443     # HTTPS default (production server pe)
```

---

## 📊 SECTION 8: LOGGING & DEBUG

---

### 31. `LOG_LEVEL=info`

**Kya hai?** Console mein kitna detail dikhana hai. Chhoti se badi severity:

```
debug → info → warn → error

"debug" = SAB kuch dikhao (sabse verbose)
"info"  = Normal info + warnings + errors ← current
"warn"  = Sirf warnings + errors
"error" = Sirf errors (minimal)
```

```bash
# Development mein — sab dekho
LOG_LEVEL=debug

# Production mein — sirf important
LOG_LEVEL=warn

# Debugging specific issue
LOG_LEVEL=debug
```

---

### 32. `AUTH_DEBUG=false`

**Kya hai?** NextAuth ke internal detailed logs ON/OFF.

```bash
AUTH_DEBUG=false    # ← current (clean console)
AUTH_DEBUG=true     # NextAuth ke har step ka log dikhega:
```

**`true` karne pe ye type ke logs aayenge:**
```
[next-auth][debug] NEXTAUTH_URL: http://localhost:3000
[next-auth][debug] detected host: localhost:3000
[next-auth][debug] JWT token created: { id: "env-admin", role: "admin" }
[next-auth][debug] Session callback: { user: { email: "admin@..." } }
[next-auth][debug] Authorized callback result: true
```

> [!TIP]
> Login issues debug karte waqt `AUTH_DEBUG=true` karo, fix hone ke baad `false` karo wapas.

---

## 🔒 SECTION 9: RATE LIMITING & SECURITY

---

### 33. `MAX_LOGIN_ATTEMPTS=5`

**Kya hai?** Ek user kitni baar galat password daal sakta hai before temporarily locked out.

**Brute force attack protection:**
```
Attempt 1: wrong password → "Invalid credentials"
Attempt 2: wrong password → "Invalid credentials"
Attempt 3: wrong password → "Invalid credentials"
Attempt 4: wrong password → "Invalid credentials"
Attempt 5: wrong password → "Invalid credentials"
Attempt 6: → "Account locked. Try again in 15 minutes." 🔒
```

```bash
MAX_LOGIN_ATTEMPTS=3     # Strict (banking level)
MAX_LOGIN_ATTEMPTS=5     # ← current (balanced)
MAX_LOGIN_ATTEMPTS=10    # Relaxed
```

---

### 34. `LOGIN_LOCKOUT_MINUTES=15`

**Kya hai?** Lockout ke baad kitne minute wait karna padega before trying again.

```bash
LOGIN_LOCKOUT_MINUTES=5      # 5 min  — lenient
LOGIN_LOCKOUT_MINUTES=15     # 15 min — ← current
LOGIN_LOCKOUT_MINUTES=30     # 30 min — strict
LOGIN_LOCKOUT_MINUTES=60     # 1 hour — very strict
```

---

### 35. `API_RATE_LIMIT=100`

**Kya hai?** Ek time window mein ek IP se kitni API requests allow hain.

**DDoS/abuse protection:**
```
IP: 192.168.1.1 → Request #1 ✅
IP: 192.168.1.1 → Request #2 ✅
...
IP: 192.168.1.1 → Request #100 ✅
IP: 192.168.1.1 → Request #101 ❌ "429 Too Many Requests"
        ↓
Wait for window to reset (60 seconds)
```

```bash
API_RATE_LIMIT=50      # Strict (admin APIs)
API_RATE_LIMIT=100     # ← current (normal)
API_RATE_LIMIT=500     # High traffic public APIs
API_RATE_LIMIT=1000    # Very permissive
```

---

### 36. `API_RATE_LIMIT_WINDOW=60`

**Kya hai?** Rate limit ka time window **seconds** mein.

```bash
API_RATE_LIMIT=100
API_RATE_LIMIT_WINDOW=60    # 100 requests per 60 seconds (1 min)

# Matlab:
# Har 1 minute mein max 100 requests allowed per IP
# 1 minute baad counter reset
```

```bash
API_RATE_LIMIT_WINDOW=30     # 30 sec window (strict)
API_RATE_LIMIT_WINDOW=60     # 1 min  ← current
API_RATE_LIMIT_WINDOW=300    # 5 min window (relaxed)
API_RATE_LIMIT_WINDOW=3600   # 1 hour window
```

---

## ⏱️ SECTION 10: TIMEOUTS & PERFORMANCE

---

### 37. `API_TIMEOUT=30000`

**Kya hai?** API calls ka general timeout. Agar 30 seconds mein response nahi aaya toh request fail.

```
30000ms = 30 seconds
```

```bash
API_TIMEOUT=10000    # 10s — fast APIs
API_TIMEOUT=30000    # 30s — ← current (standard)
API_TIMEOUT=60000    # 60s — slow APIs / file uploads
API_TIMEOUT=120000   # 2 min — heavy processing
```

---

### 38. `REVALIDATION_INTERVAL=60`

**Kya hai?** ISR (Incremental Static Regeneration) pages kitne **seconds** baad fresh data fetch karenge.

**ISR kya hai?**
```
User 1 visits /services → Page GENERATED from DB → cached
                                                      ↓
User 2 visits /services (within 60s) → CACHED page served (instant! ⚡)
                                                      ↓
User 3 visits /services (after 60s) → Page RE-GENERATED from DB → new cache
```

```bash
REVALIDATION_INTERVAL=10      # 10 sec — near real-time (more server load)
REVALIDATION_INTERVAL=60      # 1 min  — ← current (balanced)
REVALIDATION_INTERVAL=300     # 5 min  — less load, slightly stale data
REVALIDATION_INTERVAL=3600    # 1 hour — for rarely changing content
REVALIDATION_INTERVAL=86400   # 1 day  — static content (about page etc.)
```

---

## 🔄 Complete Flow — Sab kaise connect hota hai

```
User opens website
    ↓
NEXT_PUBLIC_SITE_URL + PORT → localhost:3000
    ↓
User goes to /admin/login
    ↓
Enters ADMIN_EMAIL + ADMIN_PASSWORD
    ↓
AUTH_SECRET + JWT_SECRET → Session created
    ↓
SESSION_MAX_AGE → 30 days tak valid
    ↓
Admin uploads image → CLOUDINARY_URL → stored in cloud
    ↓
Admin changes service → MONGODB_URI → saved in DB
    ↓
DB_CONNECTION_TIMEOUT → 5s mein connect
    ↓
DB_POOL_SIZE → 10 connections available
    ↓
Public user visits /services → REVALIDATION_INTERVAL → cached page or fresh from DB
    ↓
Customer books vaccine → STRIPE_SECRET_KEY → payment processed
    ↓
STRIPE_WEBHOOK_SECRET → payment confirmed
    ↓
EMAIL_USER + EMAIL_PASS → confirmation email sent
    ↓
EMAIL_FROM_NAME → "Clarke & Coleman Pharmacy" as sender
```

> [!NOTE]
> **Rate limiting aur login lockout** ke variables define hain `.env` mein but actual enforcement middleware abhi implement nahi hai. Agar chahiye toh bolo!
