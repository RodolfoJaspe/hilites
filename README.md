# Hilites - Football Match Highlights

A modern Next.js application for discovering and watching football match highlights from major European leagues.

## 🏆 Features

- **📺 YouTube Integration**: Search and watch match highlights inline
- **⚽ 6 Major Leagues**: Premier League, La Liga, Champions League, Bundesliga, Serie A, Ligue 1
- **📅 Date Navigation**: Browse matches by date with timezone-correct display
- **📊 Video Information**: View count, upload date, and channel details
- **🎨 Modern UI**: Responsive dark theme with smooth animations
- **🔍 Smart Search**: AI-powered video discovery with real-time results

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- API keys (see Environment Variables)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/RodolfoJaspe/hilites.git
cd hilites
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
# Add your API keys to .env.local
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📋 Environment Variables

Copy `.env.example` to `.env.local` and configure:

```env
# Football Data API
FOOTBALL_DATA_API_KEY=your_football_data_key_here

# YouTube Data API  
YOUTUBE_API_KEY=your_youtube_api_key_here

# Optional APIs
OPENAI_API_KEY=your_openai_key_here
HUGGING_FACE_API_KEY=your_hugging_face_key_here
```

### Required API Keys

1. **Football Data API**: [Get API Key](https://www.football-data.org/)
2. **YouTube Data API**: [Get API Key](https://console.developers.google.com/)

## 🏟️ Supported Leagues

- 🏴󠁧󠁢󠁥󠁮󠁧󠁿 **Premier League** (England)
- 🇪🇸 **La Liga** (Spain) 
- 🏆 **Champions League** (Europe)
- 🇩🇪 **Bundesliga** (Germany)
- 🇮🇹 **Serie A** (Italy)
- 🇫🇷 **Ligue 1** (France)

## 🎯 How It Works

1. **Browse Matches**: Select dates from the horizontal navigation
2. **Discover Highlights**: Click "🤖 Discover Highlights" on any match
3. **Watch Videos**: Click video thumbnails to play inline
4. **View Details**: See view count, upload date, and channel info

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **APIs**: Football Data API, YouTube Data API
- **State Management**: React Hooks
- **Deployment**: Vercel/Netlify ready

## 📱 Responsive Design

- Desktop: Grid layout with multiple videos
- Tablet: Optimized 2-column layout  
- Mobile: Single column with touch-friendly controls

## 🚀 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Connect repository to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Netlify

1. Build command: `npm run build`
2. Publish directory: `.next`
3. Add environment variables in Netlify dashboard

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚡ Performance

- ⚡ **Optimized Images**: Lazy loading and compression
- 🔄 **Caching**: Server-side and client-side caching
- 📊 **API Rate Limiting**: Built-in protection
- 🎯 **SEO Ready**: Meta tags and structured data

## 🐛 Troubleshooting

### Common Issues

1. **No matches showing**: Check Football Data API key
2. **No videos found**: Verify YouTube API key is enabled
3. **Date issues**: Ensure timezone is set correctly
4. **Build errors**: Check all environment variables are set

### Debug Mode

Enable debug logging by setting:
```env
DEBUG=true
```

## 📞 Support

- 📧 Email: [your-email@example.com]
- 🐛 Issues: [GitHub Issues](https://github.com/RodolfoJaspe/hilites/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/RodolfoJaspe/hilites/discussions)

---

⭐ **Star this repository if you find it helpful!**
