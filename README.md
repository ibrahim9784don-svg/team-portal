# Agency Team Portal — Live Deployment Guide (Roman Urdu)

Yeh guide aap ko step by step batayegi: Supabase (database) set karna, GitHub par code push
karna, aur Vercel par live deploy karna.

---

## Step 1 — Supabase Project Banayein

1. https://supabase.com par jayein, sign up / login karein.
2. **New Project** click karein.
3. Project name (e.g. `agency-portal`), database password, aur region select karke **Create
   new project** karein. 1-2 minute lagega.
4. Project ready hone ke baad, left sidebar mein **SQL Editor** open karein.
5. Iss project ke folder mein `supabase_setup.sql` file hai — uska pura content copy karein,
   SQL Editor mein paste karein, aur **Run** click karein. Yeh aap ka data table bana dega.
6. Ab left sidebar mein **Project Settings > API** par jayein. Do cheezein copy karein:
   - **Project URL** (e.g. `https://xxxx.supabase.co`)
   - **anon public key** (lambi si string)

Yeh dono aage chahiye honge.

---

## Step 2 — Local `.env` File Banayein (optional, testing ke liye)

Project folder mein `.env.example` ko copy karke `.env` naam ki file banayein, aur apni
Supabase values daal dein:

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

`.env` file kabhi GitHub par push nahi hoti (`.gitignore` mein already add hai) — yeh sirf
local testing ke liye hai.

Local test karne ke liye:
```
npm install
npm run dev
```

---

## Step 3 — GitHub Par Push Karein

1. https://github.com par jakar login karein, **New repository** banayein (e.g.
   `agency-team-portal`), private ya public — jo chahein.
2. Apne computer/terminal mein project folder ke andar jayein aur yeh commands chalayein:

```bash
git init
git add .
git commit -m "Agency team portal - initial commit"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/agency-team-portal.git
git push -u origin main
```

(`YOUR-USERNAME` apni GitHub username se replace karein.)

---

## Step 4 — Vercel Par Deploy Karein

1. https://vercel.com par jayein, **GitHub se sign up/login** karein.
2. Dashboard mein **Add New > Project** click karein.
3. Apni GitHub repo (`agency-team-portal`) select karke **Import** karein.
4. Framework Preset apne aap **Vite** detect ho jayega — kuch change nahi karna.
5. **Environment Variables** section expand karein aur yeh do variables add karein:
   - Name: `VITE_SUPABASE_URL` — Value: apna Supabase Project URL
   - Name: `VITE_SUPABASE_ANON_KEY` — Value: apna Supabase anon public key
6. **Deploy** click karein. 1-2 minute mein aap ka portal live ho jayega, ek link milega
   jaise `agency-team-portal.vercel.app`.

Bas — portal ab live hai aur poori team usi link se access kar sakti hai. Data Supabase mein
save hota hai, isliye sab ko same live data dikhega (har banda apne alag localStorage mein
nahi, sab ek hi database use karenge).

---

## Login (Demo Accounts)

- **Admin:** admin@agency.com / admin123
- **Team:** sarah@agency.com / team123 (aur baaki team members, same password `team123`)

Settings page se apna naam/email/password change kar sakte hain — sab kuch Supabase mein
save hoga.

---

## Important Security Note

Yeh login system app ke andar hi bana hua hai (Supabase Auth use nahi ho raha), aur
passwords database mein plain text mein save hote hain. Internal/team-only tool ke liye
theek hai, lekin agar client-sensitive data ho ya public-facing ho, to aage chal kar
Supabase Auth (proper authentication) add karwana behtar hoga — bata dein to woo bhi
kar dun.

## Files in This Project

- `src/App.jsx` — poora portal (dashboard, clients, team, tasks, analytics, settings)
- `src/supabaseClient.js` — Supabase connection
- `supabase_setup.sql` — database table + security policy
- `.env.example` — environment variable template
