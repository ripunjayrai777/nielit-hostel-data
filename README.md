# NIELIT Boys Hostel Warden Portal (MongoDB + Express + Node, all on Vercel)
1. MongoDB Atlas: create DB user, Network Access -> 0.0.0.0/0, copy connection string.
2. Push folder to GitHub -> Vercel > New Project > import (no build command).
3. Vercel env vars: WARDEN_PASSWORD, SESSION_SECRET, MONGODB_URI -> Redeploy.
4. Students tab -> import your sheet as CSV (Room No., Name, NDU Roll Number, Contact No., Contact No. (Sec.), optional Batch/Branch).
Everyone is Present by default; only leave/absent exceptions are stored.
