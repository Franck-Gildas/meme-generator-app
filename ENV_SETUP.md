# Environment Variables Setup

This file documents the required environment variables for the Meme Generator application.

## Required Variables

### NEXT_PUBLIC_INSTANT_APP_ID

Your InstantDB application ID.

**How to get it:**
1. Go to https://instantdb.com/dash
2. Sign up or log in
3. Create a new app or select an existing one
4. Copy your App ID from the dashboard

**Setup:**

Create a `.env.local` file in the root directory of the project:

```env
NEXT_PUBLIC_INSTANT_APP_ID=your_app_id_here
```

Replace `your_app_id_here` with your actual InstantDB App ID.

## Important Notes

- The `.env.local` file is gitignored and will not be committed to version control
- You must restart the development server after creating or modifying `.env.local`
- All variables starting with `NEXT_PUBLIC_` are exposed to the browser
- Never commit sensitive credentials to version control

## Example

```env
# Example .env.local file
NEXT_PUBLIC_INSTANT_APP_ID=abc123def456ghi789
```

After creating this file, run:

```bash
npm run dev
```

Your application should now connect to InstantDB successfully.
