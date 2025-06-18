# HRMS - Human Resource Management System

A comprehensive HRMS built with Next.js, Clerk Authentication, Prisma ORM, and Neon PostgreSQL.

## Features

- 🔐 **Authentication**: Secure user authentication with Clerk
- 👥 **Employee Management**: Complete employee lifecycle management
- ⏰ **Attendance Tracking**: Daily attendance and time tracking
- 🏖️ **Leave Management**: Leave requests and approvals
- 💰 **Payroll System**: Salary management and pay slip generation
- 📊 **Performance Reviews**: Employee performance evaluation
- 📈 **Reports & Analytics**: Comprehensive reporting system
- ⚙️ **Settings**: Company and system configuration

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Authentication**: Clerk
- **Database**: Neon PostgreSQL with Prisma ORM
- **Deployment**: Vercel (recommended)

## Getting Started

### Prerequisites

1. Node.js 18+ installed
2. A Neon PostgreSQL database
3. A Clerk account for authentication

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd free-nextjs-admin-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Rename `.env.local.example` to `.env.local` and fill in your values:
   
   ```env
   # Database
   DATABASE_URL="your-neon-postgresql-connection-string"

   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
   CLERK_SECRET_KEY=your-clerk-secret-key
   CLERK_WEBHOOK_SECRET=your-clerk-webhook-secret

   # Clerk URLs
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

   # App Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Visit [http://localhost:3000](http://localhost:3000)

### Database Setup

1. **Create a Neon Database**
   - Go to [Neon Console](https://console.neon.tech)
   - Create a new project
   - Copy the connection string to your `.env.local`

2. **Run Database Migrations**
   ```bash
   npx prisma db push
   ```

### Clerk Setup

1. **Create a Clerk Application**
   - Go to [Clerk Dashboard](https://dashboard.clerk.com)
   - Create a new application
   - Copy the API keys to your `.env.local`

2. **Configure Webhooks**
   - In Clerk Dashboard, go to Webhooks
   - Add endpoint: `https://your-domain.com/api/webhooks/clerk`
   - Subscribe to: `user.created`, `user.updated`, `user.deleted`
   - Copy the webhook secret to your `.env.local`

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── (admin)/           # Admin layout routes
│   ├── dashboard/         # Dashboard pages
│   ├── sign-in/          # Authentication pages
│   ├── sign-up/
│   └── api/              # API routes
├── components/           # React components
│   ├── hrms/            # HRMS-specific components
│   ├── header/          # Header components
│   └── ui/              # Reusable UI components
├── config/              # Configuration files
├── context/             # React context providers
├── lib/                 # Utility libraries
└── layout/              # Layout components
```

## Development Workflow

1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Database Changes**
   - Modify `prisma/schema.prisma`
   - Run `npx prisma db push`
   - Run `npx prisma generate`

3. **Add New Features**
   - Create components in `src/components/hrms/`
   - Add routes in `src/app/`
   - Update navigation in `src/config/hrms-navigation.tsx`

## Deployment

1. **Deploy to Vercel**
   ```bash
   npm install -g vercel
   vercel
   ```

2. **Set Environment Variables**
   - Add all environment variables in Vercel dashboard
   - Update Clerk webhook URL to your production domain

3. **Run Database Migrations**
   ```bash
   npx prisma db push
   ```

## Key Features Implementation

### Employee Management
- Employee profiles with personal information
- Department and position management
- Employee directory and search

### Attendance System
- Clock in/out functionality
- Daily attendance reports
- Time tracking and overtime calculation

### Leave Management
- Leave request submission
- Manager approval workflow
- Leave balance tracking

### Payroll System
- Salary information management
- Payroll processing
- Pay slip generation

### Performance Management
- Performance review cycles
- Goal setting and tracking
- 360-degree feedback

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Contact the development team

## License

This project is licensed under the MIT License - see the LICENSE file for details.
