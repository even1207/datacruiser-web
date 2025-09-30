# DataCruiser AI Agent

A futuristic AI-powered data analysis platform with interactive visualizations and predictive capabilities.

## Features

- 🤖 **AI-Powered Analysis**: Intelligent CSV data processing and insights
- 📊 **Interactive Visualizations**: Dynamic charts, graphs, and maps
- 🔮 **Predictive Modeling**: Future trend analysis and forecasting
- 💫 **Futuristic UI**: Particle effects, neon glow animations, and modern design
- 📁 **CSV Upload**: Drag-and-drop file upload with automatic data type detection
- 💬 **Chat Interface**: Natural language interaction with streaming responses
- 🎯 **Multiple Data Types**: Time-series, geospatial, and tabular data support

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: CSS-in-JS with custom animations
- **Visualizations**: Recharts + React Leaflet
- **Animations**: Framer Motion
- **3D Effects**: Three.js + React Three Fiber
- **Data Processing**: Papa Parse
- **Build Tool**: Vite

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd datacruiser-web
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm run preview
```

## Usage

1. **Upload Data**: Drag and drop a CSV file or use the upload button
2. **Ask Questions**: Use natural language to ask about your data
3. **Explore Visualizations**: Interactive charts and maps automatically generated
4. **Get Predictions**: Ask for forecasts and trend analysis

## Supported Data Types

- **Time Series**: Data with timestamps for trend analysis
- **Geospatial**: Data with latitude/longitude for map visualization
- **Tabular**: General structured data for statistical analysis

## Project Structure

```
src/
├── components/          # React components
│   ├── ParticleBackground.tsx
│   ├── NeonInput.tsx
│   ├── MessageBubble.tsx
│   ├── ChatPanel.tsx
│   ├── VisualizationCanvas.tsx
│   └── TypewriterText.tsx
├── hooks/              # Custom React hooks
│   └── useChat.ts
├── types/              # TypeScript type definitions
│   └── index.ts
├── utils/              # Utility functions
│   └── csvProcessor.ts
├── App.tsx             # Main application component
├── main.tsx            # Application entry point
└── index.css           # Global styles
```

## Customization

### Styling

The application uses CSS custom properties for theming. Key variables in `src/index.css`:

- `--primary-bg`: Main background color
- `--accent-primary`: Primary accent color (cyan)
- `--accent-secondary`: Secondary accent color (purple)
- `--accent-tertiary`: Tertiary accent color (green)

### Particle Effects

Adjust particle count and behavior in `ParticleBackground.tsx`:

```tsx
<ParticleBackground particleCount={30} />
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For questions or support, please open an issue on GitHub.
