/** PM2 process manager — run from repo root: pm2 start relayer/ecosystem.config.cjs */
module.exports = {
  apps: [
    {
      name: "mutagen-relayer",
      cwd: "./relayer",
      script: "npm",
      args: "run start",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        HOST: "127.0.0.1",
        PORT: "3091",
      },
    },
  ],
};
