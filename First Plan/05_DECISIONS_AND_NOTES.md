# RCMS - Development Decisions & Important Notes

> Critical decisions, gotchas, and important context for any AI working on this project.

---

## 🔄 Key Decision: MySQL → MongoDB

The original design documents (4 `.md` files in `C:\RCMS\`) specify MySQL with Sequelize ORM. 
**WE CHANGED TO MongoDB with Mongoose.** This means:

| Original (DO NOT USE) | Actual (USE THIS) |
|----------------------|-------------------|
| MySQL / PostgreSQL | MongoDB Atlas |
| Sequelize ORM | Mongoose ODM |
| SQL tables with AUTO_INCREMENT | MongoDB collections with ObjectId |
| JOINs | `.populate()` or `$lookup` aggregation |
| `mysql2` package | `mongoose` package |

The original `.md` files are still useful for **business logic reference** (workflows, notification triggers, user roles), but ignore their SQL schemas and Sequelize code.

---

## 🚫 Port 5000 is NOT Available

- **Postgres** is running on port 5000 on this machine and cannot be killed
- **RCMS backend runs on port 5001**
- The `.env` file already has `PORT=5001`
- Server explicitly binds to `0.0.0.0` (not default localhost/::1)

---

## 🔐 Password in MongoDB URI

The MongoDB password is `Yash@` — the `@` character must be URL-encoded:
```
WRONG:  mongodb+srv://ybvyas786_db_user:Yash@@cluster0...
RIGHT:  mongodb+srv://ybvyas786_db_user:Yash%40@cluster0...
```

---

## 📧 Gmail App Password Format

The app password has spaces: `hvyh khgg wdty ryrm`  
This is correct — Gmail app passwords are 16 characters displayed in 4 groups.  
Nodemailer handles the spaces correctly.

---

## 🏗️ User Model - Password Field

The password field has `select: false`, meaning it's excluded from ALL queries by default.  
To include it (e.g., for login), you must explicitly add `.select('+password')`:
```javascript
const user = await User.findOne({ email }).select('+password');
```

---

## 🔢 Complaint Number Format

Format: `RCM-YYYY-XXXX` (e.g., `RCM-2026-0001`)
- Year is current year
- Sequence auto-increments by querying the latest complaint number
- Uses string sort on complaintNumber field
- Supports up to 9999 complaints per year

---

## 📍 Gujarat Geofencing

All complaints MUST have locations within Gujarat:
```
North: 24.7° (max latitude)
South: 20.1° (min latitude)  
East:  74.5° (max longitude)
West:  68.1° (min longitude)
```

The middleware skips validation if coordinates are not provided (manual address entry is allowed).

---

## 📁 Image Upload Flow

1. Client sends multipart form with image files
2. `uploadMiddleware.js` uses Multer with Cloudinary storage
3. Images auto-upload to Cloudinary folder `rcms/`
4. Auto-transformation: max 1200x1200, auto quality
5. Returns Cloudinary URLs which are stored in complaint `images` array
6. Max 5MB per file, only image mimetypes accepted

---

## 🌐 CORS Configuration

Currently allows requests from `http://localhost:3000` (frontend URL from `.env`).
When deploying, update `FRONTEND_URL` in `.env`.

---

## 📊 Seeded Data Summary

| What | Count | Details |
|------|-------|---------|
| Districts | 33 | All Gujarat districts with 3-letter codes |
| Wards | 30 | Ahmedabad (10), Surat (5), Vadodara (5), Rajkot (5), Gandhinagar (5) |
| Categories | 6 | Pothole, Street Light, Drainage, Garbage, Water Supply, Park |
| Users | 1 | Super Admin: `superadmin@rcms.com` / `admin123` |

> **Note**: Other districts have NO wards seeded yet. Add wards as needed for testing/development.

---

## 🔮 Frontend Plan (Agreed with User)

- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Router**: React Router v6
- **Maps**: React Leaflet
- **Charts**: Chart.js
- **Icons**: Lucide React
- **Toasts**: React Hot Toast

**Approach**: User will provide Figma designs → build one panel at a time:
1. Auth pages (login/register)
2. Citizen panel
3. Admin panel  
4. Constructor panel
5. Super Admin panel

Then complete remaining backend APIs as each panel needs them.

---

## 📋 npm Scripts

```bash
npm run dev    # Start with nodemon (auto-restart on changes)
npm start      # Production start
npm run seed   # Seed database (33 districts, wards, categories, super admin)
```

---

## ⚠️ Known Issues / Warnings

1. **Multer 1.x deprecation**: `npm install` shows a warning about Multer 1.x vulnerabilities. Consider upgrading to Multer 2.x in the future.
2. **No rate limiting yet**: Should add `express-rate-limit` before production.
3. **No HTTPS**: Running on HTTP locally. Add SSL for production.
4. **SLA cron job**: Designed but NOT implemented yet. Will need `node-cron` integration.
5. **Socket.io**: Planned for real-time notifications but NOT implemented yet.
