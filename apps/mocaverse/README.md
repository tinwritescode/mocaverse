# Frontend (Mocaverse)

## Setup Instructions

1. Clone the repository
2. Install dependencies: `pnpm install`
3. Start the app: `pnpm nx run mocaverse:serve`

The app will be available at `http://localhost:4200`

## Decision Reasoning

Stack using in this project:
- Vite: vite is faster than Next.js, good support for React
- react/react-router-dom
- TailwindCSS
- ShadcnUI: modern and easy-to-use/and customisable UI components
- react-query: great support for data fetching/invalidating
- zod: modern and easy-to-use data validation library
- react-hook-form (with zod resolver for form validation)

## Testing guidelines

- The valid code is: 123456
- The valid email is: test@test.com
- Wallet address is always valid. For invalid testing, please correct the mock API from [Mock API](./libs/feature-home/hooks/src/lib/queries/api.ts).

## API

I use mock API in this project, the API is defined in `libs/feature-home/hooks/src/lib/queries/api.ts`. 

## Future Improvements

- Split api to a separate library
- Implement UI, zustand for authentication
- Signature's message should get from backend
- Add debounce (validation) for email field
