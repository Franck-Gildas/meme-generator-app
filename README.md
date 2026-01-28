# Meme Generator

A modern, real-time meme generator built with Next.js 16 and InstantDB.

## Features

- 🎨 Create memes with custom text overlays
- 📸 Upload your own images or use built-in templates
- 🎯 Drag-and-drop text positioning
- 🎨 Customizable text colors and sizes
- ⬆️ Upvote your favorite memes
- 💾 Download memes as PNG files
- 🔄 Real-time updates with InstantDB

## Getting Started

### Prerequisites

- Node.js 18+ installed
- An InstantDB account (free at https://instantdb.com)

### Installation

1. **Clone the repository and install dependencies:**

```bash
npm install
```

2. **Set up your environment variables:**

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_INSTANT_APP_ID=your_instant_app_id_here
```

To get your InstantDB App ID:
- Go to https://instantdb.com/dash
- Create a new app or use an existing one
- Copy your App ID

3. **Run the development server:**

```bash
npm run dev
```

4. **Open your browser:**

Navigate to http://localhost:3000

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server (requires build first)
- `npm run lint` - Run ESLint

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── create/            # Meme creation page
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home/Feed page
├── components/            # React components
│   ├── MemeCanvas.tsx     # Canvas editor for creating memes
│   ├── MemeCard.tsx       # Display individual memes
│   ├── MemeFeed.tsx       # List of all memes
│   ├── Navigation.tsx     # Navigation bar
│   └── UpvoteButton.tsx   # Upvote functionality
├── lib/                   # Utility libraries
│   ├── db.ts             # InstantDB configuration
│   └── utils.ts          # Helper functions
├── types/                 # TypeScript type definitions
│   └── index.ts          # Shared interfaces
├── public/assets/         # Static image templates
├── instant.schema.ts      # InstantDB schema
└── instant.perms.ts       # InstantDB permissions

```

## Tech Stack

- **Framework:** Next.js 16 (App Router with Turbopack)
- **Language:** TypeScript
- **Database:** InstantDB (real-time database)
- **Styling:** CSS (Modern CSS with CSS Variables)
- **State Management:** React Hooks

## How to Use

### Creating a Meme

1. Navigate to the "Create" page
2. Upload your own image or select a template
3. Click "Add Text Box" to add text
4. Type your text and customize:
   - Drag text boxes to position them
   - Adjust font size with the slider
   - Change text color with the color picker
5. Click "Post Meme" to share or "Download Meme" to save locally

### Viewing Memes

1. Go to the "Feed" page (home)
2. Browse memes created by the community
3. Click the upvote button (▲) to like memes
4. Memes are sorted by newest first

## Troubleshooting

### "NEXT_PUBLIC_INSTANT_APP_ID is not set" Error

- Ensure `.env.local` file exists in the root directory
- Check that the variable name is exactly `NEXT_PUBLIC_INSTANT_APP_ID`
- Restart the dev server after creating/modifying `.env.local`

### Images Not Loading

- All templates must be in the `public/assets/` folder
- Next.js serves files from `public/` at the root URL path

### Port Already in Use

If port 3000 is busy, specify a different port:

```bash
npm run dev -- -p 3001
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
