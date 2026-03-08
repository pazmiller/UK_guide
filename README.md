# UK_guide
A comprehensive guide for my friends and countrymen

## About

This is a **Next.js 16** web application (with React 19, TypeScript, and Tailwind CSS v4) that serves as a travel guide to the UK. It is deployed via Firebase.

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org) + React 19 + TypeScript
- **Styling**: Tailwind CSS v4
- **Maps**: Leaflet / react-leaflet
- **Icons**: lucide-react
- **Hosting**: Firebase

## App Pages

| Route | Description |
|-------|-------------|
| `/` | Home page |
| `/london` | London guide (attractions, restaurants, cafes) |
| `/london/attractions` | London attractions detail pages |
| `/london/restaurants` | London restaurants detail pages |
| `/london/cafes` | London cafes detail pages |
| `/othercities` | Other UK cities guide |
| `/europa` | European cities guide |
| `/about` | About page |
| `/contact` | Contact page |

## Data

City data is stored as TypeScript files under `data/`:

| File | Description |
|------|-------------|
| `data/london/attractions.ts` | London attractions |
| `data/london/restaurants.ts` | London restaurants |
| `data/london/cafes.ts` | London cafes |
| `data/europa/` | European cities data |
| `data/glasgow.ts` | Glasgow guide data |
| `data/southampton.ts` | Southampton guide data |
| `data/swansea.ts` | Swansea guide data |
| `data/york.ts` | York guide data |
| `data/uk-budget.ts` | UK budget tips |
| `data/types.ts` | Shared TypeScript types |

## Components

The `components/` directory contains 19 reusable React components including `Navbar`, `Hero`, `Footer`, `AttractionCard`, `RestaurantCard`, `CityPage`, `Map`, `DetailModal`, `ImageGallery`, `TipsSection`, `AvoidSection`, and more.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Repository Branches

| Branch | Description |
|--------|-------------|
| `master` | Main production branch — full Next.js app |
| `main` | Development branch |
| `add-claude-github-actions-1772958258133` | Claude GitHub Actions integration |
| `copilot/test-branch-count` | Copilot branch |
