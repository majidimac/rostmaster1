<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Coffee Master Suite

The Coffee Master Suite is a comprehensive web application designed for coffee professionals, roasters, and baristas. It provides a suite of tools to manage and perfect the coffee roasting and brewing process, from profiling roasts to calculating profitability.

## Features

### Roast Master
- **Roast Profiling**: Create, save, and manage detailed roast profiles. Track events like first crack and control changes in real-time.
- **Live Roasting**: A real-time interface for recording new roast profiles, with timers for total roast time and development time.
- **Roast Replay**: Replay saved roast profiles with timed alerts for each event, helping to ensure consistency.
- **Profile Editing**: A visual timeline editor to fine-tune and adjust roast profiles.
- **Mix Calculator**: Calculate the cost of coffee blends based on the weight or percentage of each component.
- **Price List Generator**: Create professional, shareable price lists for your products.

### Coffee Master
- **Backflush Timer**: A guided, multi-phase timer for backflushing espresso machines.
- **Income Calculator**: A detailed tool to analyze the profitability of a coffee shop, calculating net profit and break-even points.
- **Brewing Recipes**: A library of brewing recipes for various methods (V60, Aeropress, etc.), with a built-in timer to guide the brewing process.

## Tech Stack

- **Framework**: React
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

## Project Structure

The project is organized into a main `App.tsx` component that acts as a router, and a series of components for each feature.

- `App.tsx`: The main application component and router.
- `RoastProfileList.tsx`: Displays the list of saved roast profiles.
- `RoastControlPanel.tsx`: The main interface for recording, replaying, and editing roast profiles.
- `RoastTimeline.tsx`: A visual timeline component for displaying and editing roast events.
- `MixCalculator.tsx`: The component for the coffee mix calculator.
- `PriceListGenerator.tsx`: The component for the price list generator.
- `Settings.tsx`: The settings page, with import/export functionality.
- `Backflush.tsx`: The guided backflush timer.
- `IncomeCalculator.tsx`: The coffee shop profitability calculator.
- `Recipes.tsx`: The brewing recipe manager and timer.
- `types.ts`: Contains all the TypeScript type definitions for the application.

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/coffee-master-suite.git
   cd coffee-master-suite
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```
   or
   ```bash
   yarn install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```
   or
   ```bash
   yarn dev
   ```

The application will now be running on `http://localhost:5173`.

## Usage

Once the application is running, you can navigate between the different tools using the main portal. All data is stored in your browser's local storage, so your roast profiles, recipes, and other settings will be saved between sessions. You can also use the import/export feature in the settings to back up and restore your data.
