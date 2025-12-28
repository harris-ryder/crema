# Crema

A full-stack social media application with a Node.js backend, React Native mobile app, React web app, and PostgreSQL database.

## Configuration Management

Each directory has its own `.env` file for environment-specific configuration:

### Server Configuration (`/server/.env` → `/server/config.ts`)
- Reads configuration from its own `.env` file using `dotenv`
- Uses `process.env` with fallback values
- Includes server-specific settings like file storage paths
- Environment variables:
  - `POSTGRES_CONNECTION`: PostgreSQL connection string
  - `JWT_SECRET`: Secret key for JWT authentication
  - `GOOGLE_WEB_CLIENT_ID`: OAuth client ID
  - `PORT`: Server port (default: 3004)
  - `DATA_PATH`: Directory for uploaded files

### Web Configuration (`/web/.env` → `/web/src/config.ts`)
- Uses its own `.env` file with Vite's `import.meta.env`
- Minimal configuration focused on API connection
- Environment variables (prefixed with `VITE_`):
  - `VITE_BACKEND_URL`: Backend API URL

### Native Configuration (`/native/.env` → `/native/config.ts`)
- Has its own `.env` file for native app configuration
- Uses `globalThis` to safely access process.env
- Platform-specific code is commented out where not applicable
- Environment variables specific to the mobile app

**Note:** The `/server/drizzle.config.ts` file reads directly from `process.env` instead of importing from `config.ts` due to ES module/CommonJS compatibility issues with drizzle-kit.

## Architecture

This monorepo contains four main applications:

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

### 3. Web App (`/web`)

- **Stack**: React with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4 with CSS-first configuration
- **Features**: Landing page with coffee gallery showcase

### 4. Database

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

Each application directory requires its own `.env` file:

#### Server (`/server/.env`)

```env
# Database
POSTGRES_CONNECTION=postgres://postgres:shh@localhost:5433/crema

# Authentication
JWT_SECRET=your-jwt-secret-here

# Google OAuth
GOOGLE_WEB_CLIENT_ID=your-google-client-id

# Server Configuration
PORT=3004
DATA_PATH=./data
```

#### Web App (`/web/.env`)

```env
VITE_BACKEND_URL=http://localhost:3004
```

#### Native App (`/native/.env`)

```env
# Backend Configuration
BACKEND_URL=http://<YOUR_MACHINE_IP>:3004  # Use your machine's IP for universal access

# Google OAuth
GOOGLE_WEB_CLIENT_ID=your-google-client-id
```

**Note:** For the native app, the `BACKEND_URL` should use your machine's IP address (e.g., `http://10.19.3.247:3004`) instead of `localhost` to ensure it works across all platforms (Android emulator, iOS simulator, and physical devices).

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

### 4. Web App Setup

```bash
cd web
npm install

# Create .env file (see Environment Configuration section above)

# Start development server
npm run dev
```

The web app will start on `http://localhost:5173`

### 5. Native App Setup

```bash
cd native
npm install

# Create .env file (see Environment Configuration section above)

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

3. **Start Web App**:

   ```bash
   cd web && npm run dev
   ```

4. **Start Native App**:
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

**Web:**

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build

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
├── web/             # React web application
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── App.tsx      # Main app component
│   │   └── config.ts    # Web configuration
│   └── public/      # Static assets
├── native/          # React Native mobile app
│   ├── app/         # Expo Router screens
│   ├── components/  # Reusable components
│   ├── contexts/    # React contexts (auth, etc.)
│   └── config.ts    # App configuration
└── docker-compose.yml # PostgreSQL database setup
```

## Troubleshooting

### Android SDK Path Error

If you get `SDK location not found` error after running `npx expo prebuild --clean`:

1. Create `/native/android/local.properties` file:
   ```
   sdk.dir=/Users/[YOUR_USERNAME]/Library/Android/sdk  # macOS
   sdk.dir=C:\\Users\\[YOUR_USERNAME]\\AppData\\Local\\Android\\sdk  # Windows
   ```

2. Or set the environment variable:
   ```bash
   export ANDROID_HOME=$HOME/Library/Android/sdk
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```

This error occurs because `prebuild --clean` regenerates the native folders without the SDK path configuration.

### Android Network Issues

If the Android app can't connect to the server:

1. Find your machine's IP address
2. Update `BACKEND_URL` in `/native/.env`
3. Ensure your firewall allows connections on port 3004

#### Using ngrok for Development (Recommended)

To bypass network configuration issues entirely:

1. Install ngrok: `brew install ngrok` (macOS) or download from [ngrok.com](https://ngrok.com)
2. Start your backend server: `cd server && npm run dev`
3. Create ngrok tunnel: `ngrok http 3000`
4. Update `/native/config.ts` with the ngrok URL
5. Add ngrok bypass header to `/native/api/client.ts`:
   ```typescript
   export const client = hc<AppType>(config.urls.backend, {
     headers: {
       "ngrok-skip-browser-warning": "true",
     },
   });
   ```

This eliminates IP address issues and works from any network.

### Database Connection Issues

- Ensure Docker is running
- Check that port 5433 is not in use
- Verify connection string in `/server/.env`

### Google Sign-In Issues

- Ensure SHA1 fingerprint is registered in Google Console
- Verify client IDs in both `/server/.env` and `/native/.env` match Google Console
- For Android, ensure you've run `npx expo prebuild`

## License

This project is private and proprietary.
