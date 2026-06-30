# HelScan — Emergency Medical ID for Riders

HelScan is a web application that lets riders create a digital emergency medical profile and generate a QR code sticker for their helmet. In the event of an accident, first responders can scan the QR code to instantly access the rider's critical medical information — blood group, allergies, medications, emergency contacts, insurance, and more — in their preferred language.

> ⚠️ This project is currently under active development and not yet production-ready.

---

## How It Works

1. Rider fills out a medical profile form (personal info, blood group, allergies, emergency contacts, insurance, vehicle details, etc.)
2. Profile photo is compressed client-side and uploaded to Cloudinary
3. Data is saved to MongoDB via the Express API
4. The backend asynchronously translates all text fields into Hindi and Kannada and stores them alongside the original English data
5. A unique QR code is generated and displayed on the result page
6. Rider downloads a print-ready PDF sticker (business-card sized, designed for helmets)
7. Anyone who scans the QR code lands on the public profile page and can switch between English, Hindi, and Kannada

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 19 | UI framework |
| Vite | Build tool and dev server |
| React Router DOM v7 | Client-side routing |
| React Hook Form | Form state management and validation |
| Fetch API | HTTP client for API calls |
| qrcode.react | QR code rendering in the browser |
| browser-image-compression | Client-side image compression before Cloudinary upload |
| Cloudinary | Cloud image storage and delivery |

### Backend
| Technology | Purpose |
|---|---|
| Node.js | Runtime environment |
| Express 5 | Web framework and REST API |
| Mongoose | MongoDB ODM |
| MongoDB | Database for storing rider profiles and translations |
| google-translate-api-x | Free Google Translate integration for Hindi and Kannada |
| pdf-lib | Programmatic PDF generation for the helmet sticker |
| qrcode | Server-side QR code generation (PNG buffer for PDF embedding) |
| cors | Cross-origin request handling |

---

## Project Structure

```
HelScan/
├── Client/
│   └── client/                        # React + Vite frontend
│       └── src/
│           ├── App.jsx                # Router definitions
│           ├── api/
│           │   └── rider.js           # All API fetch calls
│           ├── constants/
│           │   └── profileLabels.js   # UI label maps for EN / HI / KN
│           ├── components/            # Shared reusable UI pieces
│           │   ├── Section.jsx
│           │   ├── Row.jsx
│           │   └── LanguageSelect.jsx
│           └── pages/                 # One file per route
│               ├── HomePage.jsx
│               ├── InputForm.jsx
│               ├── ProfilePage.jsx
│               └── ResultPage.jsx
│
└── Server/
    ├── app.js                         # Express setup and DB connection
    ├── routes/
    │   └── rider.js                   # Route definitions
    ├── controllers/
    │   └── riderController.js         # Business logic (save, fetch, PDF)
    ├── utils/
    │   └── translate.js               # Translation helper (google-translate-api-x)
    └── models/
        └── user.js                    # Mongoose schema
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Health check |
| `GET` | `/rider/:id` | Fetch a rider's full profile (including translations) |
| `POST` | `/riderform` | Create a new rider profile |
| `GET` | `/download-qr/:id` | Generate and download the PDF helmet sticker |

---

## Frontend Routes

| Path | Page | Description |
|---|---|---|
| `/` | `HomePage` | Landing page with CTA |
| `/inputform` | `InputForm` | Rider profile creation form |
| `/result/:id` | `ResultPage` | Post-submission confirmation with QR code and download |
| `/rider/:id` | `ProfilePage` | Public profile shown when QR is scanned — supports EN / HI / KN |
| `/u/:id` | `ResultPage` | Legacy QR scan target (same as `/rider/:id`) |

---

## Rider Profile Data

Each profile stores:

| Category | Fields |
|---|---|
| Personal | First name, last name, date of birth, photo, height, weight, identification mark |
| Medical | Blood group, allergies, medical conditions, current medications, organ donor status, blood donor card, previous surgeries / implants |
| Emergency Contacts | Up to 2 contacts — name, phone, relation |
| Insurance | Provider name, policy number |
| Vehicle & Location | Registration number, vehicle model, home city |
| Translations | Auto-generated Hindi (`hi`) and Kannada (`kn`) versions of all text fields |

---

## Multilingual Support

After a profile is saved, the server translates all text fields into **Hindi** and **Kannada** in the background using `google-translate-api-x`. The translations are stored in the database under a `translations` map keyed by language code (`hi`, `kn`).

On the profile page (`/rider/:id`), a language dropdown lets the viewer switch between:
- 🇬🇧 English
- 🇮🇳 हिन्दी (Hindi)
- 🇮🇳 ಕನ್ನಡ (Kannada)

Non-translatable fields (phone numbers, blood group, dates, registration numbers, policy numbers) are always shown in their original format regardless of language.

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB running locally on port `27017`
- A [Cloudinary](https://cloudinary.com) account with an **unsigned** upload preset

### Backend

```bash
cd Server
npm install
node app.js
```

Server runs on `http://localhost:3000`

### Frontend

Create `Client/client/.env`:

```env
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_PRESET_NAME=your_unsigned_preset_name
```

Then:

```bash
cd Client/client
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

---

## Roadmap

- [ ] Authentication and admin panel
- [ ] Styling and UI polish
- [ ] Replace hardcoded `localhost` URLs with environment variables
- [ ] Deployment — Vercel (frontend) + MongoDB Atlas (database)
- [ ] Add more regional language support

---

## License

See [LICENSE](./LICENSE)
