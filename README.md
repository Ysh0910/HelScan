# HelScan

HelScan is a rider safety app for storing emergency medical information, generating a QR code, and sharing a printable profile card that first responders can scan in an emergency.

The repository is split into a Vite client in `Client/` and an Express API in `Server/`.

## What It Does

1. A rider signs up or logs in.
2. The rider submits a medical profile form.
3. The backend stores the profile in MongoDB and can translate rider data for multilingual viewing.
4. A QR code and downloadable profile card are generated for the rider.
5. Anyone who scans the QR code can view the public rider profile.

## Repository Layout

```text
HelScan/
├── Client/
│   ├── src/
│   │   ├── main.jsx
│   │   ├── router.jsx
│   │   ├── routes/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── lib/
│   ├── package.json
│   └── vite.config.js
├── Server/
│   ├── app.js
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── utils/
└── README.md
```

## Frontend

The client is built with React, Vite, TanStack Router, React Query, Tailwind CSS v4, and a Radix-based component set.

Useful commands:

```bash
cd Client
npm install
npm run dev
```

Build and preview:

```bash
cd Client
npm run build
npm run preview
```

Client scripts available in `Client/package.json`:

- `dev` starts the Vite dev server.
- `build` creates a production bundle.
- `preview` serves the production build locally.
- `lint` runs ESLint.
- `format` runs Prettier.

## Backend

The server is an Express API that connects to MongoDB at `mongodb://127.0.0.1:27017/HelScan` by default.

Useful commands:

```bash
cd Server
npm install
node app.js
```

The API listens on port `3000`.

## API Routes

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/` | Basic health check |
| `POST` | `/auth/signup` | Create a new auth user |
| `POST` | `/auth/login` | Sign in and receive a JWT |
| `GET` | `/auth/me` | Fetch the current authenticated user |
| `GET` | `/rider/:id` | Fetch a rider profile |
| `POST` | `/riderform` | Create a rider profile |
| `PATCH` | `/rider/:id` | Update a rider profile |
| `GET` | `/download-qr/:id` | Download the QR/profile card PDF |

## Client Routes

| Route file | URL |
| --- | --- |
| `src/routes/index.jsx` | `/` |
| `src/routes/inputform.jsx` | `/inputform` |
| `src/routes/login.jsx` | `/login` |
| `src/routes/signup.jsx` | `/signup` |
| `src/routes/result.$id.jsx` | `/result/:id` |
| `src/routes/rider.$id.jsx` | `/rider/:id` |
| `src/routes/edit.$id.jsx` | `/edit/:id` |

## Notes

- `Client/src/routes/routeTree.gen.ts` is generated and should not be edited by hand.
- `Server/app.js` is the main Express entry point.
- The current client uses native `fetch` for API calls.

## License

See [LICENSE](./LICENSE)
