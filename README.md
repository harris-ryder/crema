# Crema

A full-stack social media application with a Node.js backend, React Native mobile app, and PostgreSQL database.

## Configuration Management

**Important:** This project uses a shared configuration approach. The `config.ts` file is **identical** across all three applications (server, native, and web) with only minor differences in commented-out lines for platform-specific code.

### Shared Configuration
- Configuration values are read from the `.env` file at the root of the project
- If environment variables are not set, the config falls back to default values
- The `config.ts` files in `/server`, `/native`, and `/web` (if present) must remain synchronized
- Platform-specific code (like Node.js imports) should be commented out where not applicable

**Note:** When updating configuration, ensure changes are replicated across all `config.ts` files to maintain consistency.

**Exception:** The `/server/drizzle.config.ts` file reads directly from `process.env` instead of importing from `config.ts`. This is due to ES module/CommonJS compatibility issues with drizzle-kit. The drizzle configuration still uses the same environment variables but accesses them directly.

## Architecture

This monorepo contains three main applications:

### 1. Server (`/server`)

- **Stack**: Node.js with Hono framework
- **Database**: PostgreSQL with Drizzle ORM
- **Auth**: JWT-based authentication with Google OAuth support
- **Features**: RESTful API for posts, user management, reactions, and image uploads

### 2. Native App (`/native`)

- **Stack**: React Native with Expo
- **Navigation**: Expo Router (file-based routing)
- **Auth**: Google Sign-In integration
- **Features**: Feed view, activity tracking, user profiles

### 3. Database

- **Stack**: PostgreSQL 16
- **Deployment**: Docker container (via `docker-compose.yml` at root)
- **ORM**: Drizzle ORM for migrations and type-safe queries (managed in `/server`)

## Prerequisites

- **Node.js v22.0.0 or higher** (we use v22.17.1)
  - For consistent versions, use: `nvm use` (reads `.nvmrc`)
  - Or install manually from [nodejs.org](https://nodejs.org/)
- Docker and Docker Compose
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)
- Android SDK

### Node.js Version Management

This project uses Node.js v22+ for modern features like `--experimental-transform-types`. To ensure consistency:

```bash
# If using nvm (recommended)
nvm use

# Or install the specific version
nvm install 22.17.1
nvm use 22.17.1
```

## Setup Instructions

### 1. Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Backend Configuration
BACKEND_URL=http://<YOUR_MACHINE_IP>:3004  # Use your machine's IP for universal access

# Frontend URLs
FRONTEND_URL=http://localhost:5173

# Database
POSTGRES_CONNECTION_STRING=postgres://postgres:shh@localhost:5433/crema

# Authentication
JWT_SECRET=your-jwt-secret-here

# Google OAuth
GOOGLE_WEB_CLIENT_ID=your-google-client-id
```

**Note:** The `BACKEND_URL` should use your machine's IP address (e.g., `http://10.19.3.247:3004`) instead of `localhost` to ensure it works across all platforms (Android emulator, iOS simulator, and physical devices).

### 2. Database Setup

Start the PostgreSQL database using Docker:

```bash
docker-compose up -d
```

This will start PostgreSQL on port 5433 with:

- Database: `crema`
- Username: `postgres`
- Password: `shh`

### 3. Server Setup

```bash
cd server
npm install

# Run database migrations
npm run db:push

# Start development server
npm run dev
```

The server will start on `http://localhost:3004`

### 4. Native App Setup

```bash
cd native
npm install

# Generate native projects
npx expo prebuild
```

#### Android Development

1. Ensure Android Studio is installed
2. Set up an Android emulator or connect a physical device
3. Run the app:

```bash
npx expo run:android
```

#### Google Sign-In Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google Sign-In API
4. Create OAuth 2.0 credentials for:
   - Web application (for the web client ID)
   - Android (requires SHA1 fingerprint)
   - iOS (requires bundle identifier)
5. Add the client IDs to your `.env` file

To get your Android SHA1 fingerprint:

```bash
cd native/android
./gradlew signingReport
```

## Running the Applications

### Development Mode

1. **Start Database**:

   ```bash
   docker-compose up -d
   ```

2. **Start Server**:

   ```bash
   cd server && npm run dev
   ```

3. **Start Native App**:
   ```bash
   cd native && npx expo run:android
   # or
   cd native && npx expo run:ios
   ```

### Common Commands

**Server:**

- `npm run dev` - Start development server with hot reload
- `npm run db:generate` - Generate database migrations
- `npm run db:migrate` - Run database migrations
- `npm run db:push` - Push schema changes to database

**Native:**

- `npx expo start` - Start Expo development server
- `npx expo run:android` - Build and run Android app
- `npx expo prebuild` - Generate native projects

## Project Structure

```
crema/
├── server/           # Backend API server
│   ├── src/
│   │   ├── db/      # Database schema and migrations
│   │   ├── routes/  # API routes
│   │   └── index.ts # Server entry point
│   └── config.ts    # Server configuration
├── native/          # React Native mobile app
│   ├── app/         # Expo Router screens
│   ├── components/  # Reusable components
│   ├── contexts/    # React contexts (auth, etc.)
│   └── config.ts    # App configuration
├── docker-compose.yml # PostgreSQL database setup
└── .env            # Shared environment variables
```

## Troubleshooting

### Android Network Issues

If the Android app can't connect to the server:

1. Find your machine's IP address
2. Update `BACKEND_ANDROID_URL` in `.env`
3. Ensure your firewall allows connections on port 3004

### Database Connection Issues

- Ensure Docker is running
- Check that port 5433 is not in use
- Verify connection string in `.env`

### Google Sign-In Issues

- Ensure SHA1 fingerprint is registered in Google Console
- Verify client IDs in `.env` match Google Console
- For Android, ensure you've run `npx expo prebuild`

## License

This project is private and proprietary.
