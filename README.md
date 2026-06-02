# HelScan — Emergency Medical ID for Riders

HelScan is a web application that lets riders create a digital emergency medical profile and generate a QR code sticker for their helmet. In the event of an accident, first responders can scan the QR code to instantly access the rider's critical medical information — blood group, allergies, medications, emergency contacts, and more.

> ⚠️ This project is currently under active development and not yet production-ready.

---

## How It Works

1. Rider fills out a medical profile form (personal info, blood group, allergies, emergency contacts, insurance, etc.)
2. Profile photo is compressed and uploaded to Cloudinary
3. Data is saved to MongoDB via the Express API
4. A unique QR code is generated and displayed
5. Rider can download a print-ready PDF sticker (sized for a helmet) containing the QR code
6. Anyone who scans the QR code is taken to a public profile page with the rider's medical details

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 19 | UI framework |
| Vite | Build tool and dev server |
| React Router DOM v7 | Client-side routing |
| React Hook Form | Form state management and validation |
| Fetch API | Native HTTP client for API calls |
| qrcode.react | QR code rendering in the browser |
| browser-image-compression | Client-side image compression before upload |
| Cloudinary (`@cloudinary/react`, `@cloudinary/url-gen`) | Cloud image storage and delivery |

### Backend
| Technology | Purpose |
|---|---|
| Node.js | Runtime environment |
| Express 5 | Web framework and REST API |
| Mongoose | MongoDB ODM |
| MongoDB | Database for storing rider profiles |
| pdf-lib | Programmatic PDF generation for the helmet sticker |
| qrcode | Server-side QR code generation (PNG buffer for embedding in PDF) |
| cors | Cross-origin request handling |
| method-override | HTTP method override support |

---

## Project Structure

```
HelScan/
├── Client/
│   └── client/               # React + Vite frontend
│       ├── components/
│       │   ├── inputForm.jsx     # Rider profile creation form
│       │   ├── ProfilePage.jsx   # Internal profile view
│       │   └── ResultPage.jsx    # Post-submission page with QR code + download
│       └── src/
│           └── App.jsx           # Route definitions
│
└── Server/
    ├── app.js                # Express server and API routes
    ├── models/
    │   └── user.js           # Mongoose schema for rider profiles
    └── routes/               # (in progress)
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Health check |
| `GET` | `/rider/:id` | Fetch a rider's profile by ID |
| `POST` | `/riderform` | Create a new rider profile |
| `GET` | `/download-qr/:id` | Generate and download a PDF sticker for the given rider ID |

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB running locally on port `27017`
- A [Cloudinary](https://cloudinary.com) account (for image uploads)

### Backend

```bash
cd Server
npm install
node app.js
```

Server runs on `http://localhost:3000`

### Frontend

Create a `.env` file inside `Client/client/`:

```env
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_PRESET_NAME=your_upload_preset
```

Then:

```bash
cd Client/client
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

---

## Routes (Frontend)

| Path | Component | Description |
|---|---|---|
| `/inputform` | `InputForm` | Create a new rider profile |
| `/rider/:id` | `ProfilePage` | View full rider profile (internal) |
| `/u/:id` | `ResultPage` | Public-facing page shown when QR is scanned |

---

## Rider Profile Data

Each profile stores:
- Personal: first name, last name, date of birth, photo, height, weight, identification mark
- Medical: blood group, allergies, medical conditions, current medications
- Emergency contacts (name, relation, phone)
- Insurance: provider, policy number, validity, helpline
- Metadata: active status, created date

---

## Roadmap / In Progress

- [ ] Complete routes directory implementation
- [ ] Controllers layer for cleaner separation
- [ ] Authentication / admin panel
- [ ] Styling and UI polish
- [ ] Deployment (Vercel for frontend, hosted MongoDB)
- [ ] Replace hardcoded `localhost` URLs with environment variables

---

## License

See [LICENSE](./LICENSE)
