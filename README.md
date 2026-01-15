# TCS Digital Map

A Next.js-based interactive digital passport application that allows users to explore venues on an interactive map, scan QR codes at physical locations, and collect rewards by visiting different places.

## ✨ Features

- **Interactive Map**: Explore venues on a beautiful, draggable Leaflet map with custom markers
- **QR Code Scanner**: Scan QR codes at venues using your device's camera or manually enter URLs
- **Digital Passport**: Collect virtual stamps and track your visits across different venues
- **Venue Rewards**: Claim rewards when you visit registered venues
- **Real-time Integration**: Powered by Supabase for real-time data and user visit tracking
- **Mobile-Friendly**: Fully responsive design optimized for both desktop and mobile devices

## 🚀 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (React 19)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Maps**: [Leaflet](https://leafletjs.com/) & React Leaflet
- **QR Scanning**: [jsQR](https://github.com/cozmo/jsQR)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Authentication**: Supabase Auth
- **UI Components**: Radix UI
- **Deployment**: Vercel

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- Node.js 18+ and npm
- A Supabase account and project

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tcsMap
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up the database**
   
   Run the SQL scripts in your Supabase SQL editor:
   - `scripts/001_create_schema.sql` - Creates the database schema
   - `scripts/002_seed_venues.sql` - Seeds initial venue data

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
tcsMap/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── map-view.tsx       # Interactive map component
│   ├── passport-view.tsx  # Digital passport UI
│   ├── qr-scanner.tsx     # QR code scanner
│   ├── venue-modal.tsx    # Venue details modal
│   └── ui/                # Reusable UI components
├── lib/                   # Utility functions
│   ├── supabase/          # Supabase client configuration
│   ├── types.ts           # TypeScript type definitions
│   └── utils.ts           # Helper functions
├── scripts/               # Database scripts
│   ├── 001_create_schema.sql
│   └── 002_seed_venues.sql
├── public/                # Static assets
└── styles/                # Additional styles
```

## 🎯 Usage

### Viewing the Map

The main page displays an interactive map with venue markers. You can:
- Drag and pan the map to explore different areas
- Click on venue markers to view details
- Zoom in/out using map controls

### Scanning QR Codes

1. Click the **Passport** button in the bottom-right corner
2. In the passport view, click the **QR Scanner** button
3. Allow camera permissions when prompted
4. Point your camera at a venue's QR code **or** use manual entry
5. Once validated, click **Claim Reward** to record your visit

### Adding New Venues

To add a new venue to the system:

1. Insert a new row in the Supabase `venues` table:
   ```sql
   INSERT INTO public.venues (name, latitude, longitude, icon_url, landing_url)
   VALUES (
     'Your Venue Name',
     37.7749,
     -122.4194,
     '/icons/your-icon.svg',
     'https://your-venue-url.com'
   );
   ```

2. Generate a QR code with the `landing_url` value
3. Display the QR code at the physical venue location

## 🔐 Database Schema

### Venues Table
- `id` (UUID): Primary key
- `name` (TEXT): Venue name
- `latitude` (NUMERIC): Geographic latitude
- `longitude` (NUMERIC): Geographic longitude
- `icon_url` (TEXT): URL to venue icon/image
- `landing_url` (TEXT): Unique URL for QR validation
- `created_at` (TIMESTAMP): Creation timestamp

### User Visits Table
- `id` (UUID): Primary key
- `user_id` (UUID): User identifier
- `venue_id` (UUID): Foreign key to venues
- `created_at` (TIMESTAMP): Visit timestamp

## 🌐 Deployment

This project is optimized for deployment on [Vercel](https://vercel.com):

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add your environment variables in Vercel's project settings
4. Deploy!

**Important**: Update your Supabase redirect URLs to include your production domain:
- Site URL: `https://your-domain.vercel.app`
- Redirect URLs: `https://your-domain.vercel.app/**`

### 💡 Hosting Considerations

> **Note**: Currently, our Supabase is on the free tier. However, for production deployments or applications requiring additional resources, you may need to upgrade to a **premium subscription** for hosting the website. 
> 
> - **Free Tier**: Suitable for development, testing, and small-scale projects
> - **Premium Plans**: Required for production hosting with higher limits, custom domains, and enhanced performance

## 🎨 Customization

### Changing Map Center/Zoom
Edit the map initialization in `components/map-view.tsx`:
```typescript
<MapContainer center={[your_lat, your_lng]} zoom={13}>
```

### Styling
The project uses a custom color scheme with earth tones. Main colors are defined in:
- Brown/Earth: `#3a2515`
- Cream: `#f5f1e8`, `#f5ead6`
- Gold: `#c4a57b`

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License.

## 🐛 Troubleshooting

### Camera Not Working
- Ensure you've granted camera permissions to your browser
- On mobile, use HTTPS (localhost is OK for development)
- Try the "Manual Entry" option as an alternative

### Venues Not Showing
- Check your Supabase connection in `.env.local`
- Verify the database schema is properly set up
- Check browser console for any errors

### QR Codes Not Scanning
- Ensure good lighting conditions
- Hold steady and keep the QR code within the scan frame
- Try the manual URL entry option
- Verify the QR code contains the exact `landing_url` from your database

## 📞 Support

For issues and questions, please open an issue in the GitHub repository.

---

Built with ❤️ using Next.js and Supabase
