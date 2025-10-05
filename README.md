# Tuberise Analytics

> Advanced YouTube analytics platform with AI-powered insights and Notion integration

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-3982CE?logo=Prisma&logoColor=white)](https://www.prisma.io/)

## 🚀 Features

- **📊 Advanced Analytics**: Comprehensive YouTube channel analytics with historical data
- **🤖 AI-Powered Insights**: Smart recommendations and trend analysis
- **📝 Notion Integration**: Seamless sync with Notion workspaces
- **🔒 Privacy-First**: GDPR/CCPA compliant with end-to-end encryption
- **⚡ Real-time**: Live data updates and notifications
- **🎨 Modern UI**: Beautiful, responsive interface built with Next.js 14

## 🏗️ Architecture

This is a **monorepo** built with modern technologies:

### Frontend
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Radix UI** for accessible components

### Backend
- **Node.js** with **Express.js**
- **Prisma ORM** with **PostgreSQL**
- **JWT** authentication
- **RESTful API** design

### Infrastructure
- **Docker** for containerization
- **Turbo** for monorepo management
- **GitHub Actions** for CI/CD

## 📁 Project Structure

```
tuberise/
├── apps/
│   ├── frontend/          # Next.js 14 App Router
│   └── backend/           # Node.js + Express API
├── packages/
│   ├── database/          # Prisma schema & services
│   ├── shared/            # Common utilities
│   └── ui/                # Reusable UI components
├── docs/                  # Documentation
├── scripts/               # Automation scripts
└── docker-compose.yml     # Database containers
```

## 🛠️ Development Setup

### Prerequisites

- **Node.js** 18+ 
- **npm** 8+
- **Docker** & **Docker Compose**
- **Git**

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/tuberise-analytics.git
   cd tuberise-analytics
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start database services**
   ```bash
   docker-compose up -d postgres redis
   ```

4. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

5. **Generate Prisma client**
   ```bash
   npm run db:generate
   npm run db:push
   ```

6. **Start development servers**
   ```bash
   npm run dev
   ```

### Development URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Database**: localhost:5432
- **Redis**: localhost:6379

## 📚 Available Scripts

### Development
- `npm run dev` - Start all development servers
- `npm run build` - Build all packages
- `npm run lint` - Lint all code
- `npm run format` - Format code with Prettier

### Database
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio

### Testing
- `npm run test` - Run all tests
- `npm run test:watch` - Run tests in watch mode
- `npm run type-check` - TypeScript type checking

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/tuberise_dev"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# YouTube API
YOUTUBE_API_KEY="your-youtube-api-key"

# Notion API
NOTION_CLIENT_ID="your-notion-client-id"
NOTION_CLIENT_SECRET="your-notion-client-secret"

# AI/ML
OPENAI_API_KEY="your-openai-api-key"

# Redis
REDIS_URL="redis://localhost:6379"
```

### Database Setup

The project uses **PostgreSQL** with **Prisma ORM**. The database schema is defined in `packages/database/prisma/schema.prisma`.

## 🚀 Deployment

### Production Build

```bash
npm run build
```

### Docker Deployment

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 📖 Documentation

- [Project Requirements](./docs/PROJECT-REQUIREMENTS.md)
- [Implementation Plan](./docs/IMPLEMENTATION-PLAN.md)
- [API Documentation](./docs/API-DOCUMENTATION.md)
- [Development Setup](./docs/DEVELOPMENT-SETUP.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Prisma](https://www.prisma.io/) - Database ORM
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Radix UI](https://www.radix-ui.com/) - UI components

## 📞 Support

- **Documentation**: [docs/](./docs/)
- **Issues**: [GitHub Issues](https://github.com/your-org/tuberise-analytics/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/tuberise-analytics/discussions)

---

**Built with ❤️ by the Tuberise Analytics Team**
