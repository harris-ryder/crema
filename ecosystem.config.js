// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "crema-server",
      script: "node",
      args: "--experimental-transform-types src/index.ts",
      cwd: "/Users/harrisryder/crema/server",
      env: {
        NODE_ENV: "production",
        PORT: "3004",
        FRONTEND_URL: "http://crema.love:5173",
        POSTGRES_CONNECTION: "postgres://postgres:shh@localhost:5433/crema",
        JWT_SECRET: "your-jwt-secret-here",
        GOOGLE_WEB_CLIENT_ID: "157821791942-m36u8iqssodtm9440adgr8noq3vmut9m.apps.googleusercontent.com",
        DATA_PATH: "/Users/harrisryder/crema/server/data"
      },
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      out_file: "/Users/harrisryder/crema/logs/server-out.log",
      error_file: "/Users/harrisryder/crema/logs/server-error.log"
    },
    {
      name: "crema-web",
      script: "npm",
      args: ["run", "dev"],
      cwd: "/Users/harrisryder/crema/web",
      env: {
        NODE_ENV: "development",
        VITE_TUNNEL_HOST: "crema.love"
      },
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      out_file: "/Users/harrisryder/crema/logs/web-out.log",
      error_file: "/Users/harrisryder/crema/logs/web-error.log"
    }
  ],
  deploy: {
    production: {
      user: "harrisryder",
      host: "localhost",
      ref: "origin/main",
      repo: "https://github.com/your-username/crema.git",
      path: "/Users/harrisryder/crema",
      "post-deploy": "npm install && pm2 reload ecosystem.config.js --env production"
    }
  }
};