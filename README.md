# NIRF Data Visualization

A comprehensive web application for visualizing and analyzing NIRF (National Institutional Ranking Framework) data from 2016 to 2024.

## Features

- Interactive data visualization of NIRF rankings
- Detailed analysis of institutions across categories (University, Engineering, Pharmacy, Management)
- Parameter-wise performance analysis
- Historical trend analysis
- Geographical distribution of top institutions
- Institution-specific profiles
- Key insights and findings

## Technologies Used

- React.js
- Material-UI
- Recharts
- D3.js
- React Router
- Vite

## Setup Instructions

1. Clone the repository:
```bash
git clone <repository-url>
cd nirf-visualization
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Project Structure

```
src/
├── components/         # Reusable components
├── pages/             # Page components
├── utils/             # Utility functions
├── App.jsx            # Main application component
└── main.jsx           # Application entry point
```

## Data Structure

The application uses CSV files containing NIRF data with the following structure:
- Year (2016-2024)
- Institute_ID
- Name
- City
- State
- Score
- Rank
- TLR (Teaching, Learning & Resources)
- RPC (Research and Professional Practice)
- GO (Graduation Outcomes)
- OI (Outreach and Inclusivity)
- Perception

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 