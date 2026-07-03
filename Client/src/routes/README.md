# Routes

This app uses file-based routing with TanStack Router. Every `.jsx` file in this directory defines a route.

Do not create Next.js or Remix-style route folders such as `src/pages/`, `app/layout.tsx`, or `src/routes/_app/index.jsx`. The root shell lives in `src/routes/__root.jsx`.

## Current Routes

| File | URL |
| --- | --- |
| `index.jsx` | `/` |
| `inputform.jsx` | `/inputform` |
| `login.jsx` | `/login` |
| `signup.jsx` | `/signup` |
| `result.$id.jsx` | `/result/:id` |
| `rider.$id.jsx` | `/rider/:id` |
| `edit.$id.jsx` | `/edit/:id` |
| `__root.jsx` | app shell for all routes |

`routeTree.gen.ts` is auto-generated. Do not edit it by hand.
