# MUTAGEN — Production Deployment

| Layer | Platform | URL |
|-------|----------|-----|
| **Frontend** | Vercel | `https://<project>.vercel.app` |
| **Backend** | VPS (PM2 + Nginx + SSL) | **`https://mutagen.pramadani.site`** → `127.0.0.1:3091` |

> VPS sudah punya **Node.js, PM2, Nginx, Certbot** — langsung ke langkah deploy di bawah.  
> Relayer listen di **port `3091`** (internal). Nginx proxy `443` → `3091`.

> **Port VPS ini:** `vouch-solana-be` memakai **3090** — MUTAGEN relayer pakai **3091** (hindari bentrok).

---

## Arsitektur

```text
Browser
  ├─► Vercel (Next.js) ──────────► Provider testnet RPC (CosmJS)
  └─► mutagen.pramadani.site:443
           │ Nginx
           └─► 127.0.0.1:3091 (PM2: mutagen-relayer)
                    ├─► Cosmos Hub REST
                    ├─► Provider RPC (IBC)
                    └─► update_regime_score tx
```

---

## A — Backend VPS (quick deploy)

### 1. DNS

| Type | Name | Value |
|------|------|-------|
| A | `mutagen` | IP VPS Anda |

### 2. Clone & install

```bash
cd /var/www   # atau direktori deploy Anda
git clone https://github.com/pramadanif/mutagen.git
cd mutagen/relayer
npm install
cp .env.example .env
nano .env
```

### 3. `relayer/.env` production

```env
PORT=3091
HOST=127.0.0.1
RPC_URL=https://rpc.provider-sentry-02.ics-testnet.polypore.xyz
REST_URL=https://rest.cosmos.directory/cosmoshub
INTERVAL_MS=300000
CONTRACT_ADDRESS=cosmos1cegnz6mmj94vwtvyhm3ev44cqrsh3ft44rf28d08hdd9eft6t2kqsldh3g
MNEMONIC="relayer wallet mnemonic"
AUDITOR_K=10
GINI_THRESHOLD=0.6
GINI_TARGET=0.4
CORS_ORIGIN=https://<project-anda>.vercel.app
```

> Debug CORS: `CORS_ORIGIN=*` sementara, lalu ketatkan setelah FE live.

### 4. PM2

Dari **root repo** (`mutagen/`):

```bash
pm2 start relayer/ecosystem.config.cjs
pm2 save
```

Cek:

```bash
curl http://127.0.0.1:3091/health | jq
pm2 logs mutagen-relayer --lines 30
```

### 5. Nginx

```bash
sudo cp deploy/nginx-mutagen-relayer.conf /etc/nginx/sites-available/mutagen-relayer
sudo ln -sf /etc/nginx/sites-available/mutagen-relayer /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

File nginx sudah mengarah ke **`proxy_pass http://127.0.0.1:3091`**.

### 6. SSL (jika belum)

```bash
sudo certbot --nginx -d mutagen.pramadani.site
```

Verifikasi:

```bash
curl https://mutagen.pramadani.site/health | jq
```

### 7. Update deploy

```bash
cd /var/www/mutagen
git pull
cd relayer && npm install
pm2 restart mutagen-relayer
```

---

## B — Frontend Vercel

### 1. Import repo

[vercel.com/new](https://vercel.com/new) → `pramadanif/mutagen` → Next.js auto-detect.

### 2. Environment variables (Production)

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_RPC_URL` | `https://rpc.provider-sentry-02.ics-testnet.polypore.xyz` |
| `NEXT_PUBLIC_REST_URL` | `https://rest.provider-sentry-02.ics-testnet.polypore.xyz` |
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | `cosmos1cegnz6mmj94vwtvyhm3ev44cqrsh3ft44rf28d08hdd9eft6t2kqsldh3g` |
| `NEXT_PUBLIC_RELAYER_URL` | **`https://mutagen.pramadani.site`** |

```bash
npx vercel --prod
```

### 3. Setelah deploy

1. Update `CORS_ORIGIN` di VPS dengan URL Vercel exact → `pm2 restart mutagen-relayer`
2. Buka `/lab` → Hub Pulse harus live
3. Test pull + Keplr

---

## C — Verifikasi

```bash
# Production API
curl https://mutagen.pramadani.site/health
curl https://mutagen.pramadani.site/api/hub-pulse

# Dari VPS
RELAYER_URL=https://mutagen.pramadani.site npm run relayer:verify -- health

# CORS dari browser (console di halaman Vercel)
fetch('https://mutagen.pramadani.site/health').then(r=>r.json()).then(console.log)
```

---

## D — Monitoring

```bash
pm2 status
pm2 logs mutagen-relayer
```

Relayer wallet (gas oracle): `cosmos18tl6csmj6meh3t4u5zpvkjd78un4mwf6sz27kr`

---

## Troubleshooting

### HTTPS masih `{ status, timestamp }` tapi `:3091` lokal benar

Relayer OK — **Nginx SSL block masih `proxy_pass` ke `:3090`** (vouch). Certbot mengedit file terpisah dari template repo.

```bash
sudo grep proxy_pass /etc/nginx/sites-enabled/mutagen-relayer
# Semua baris harus: http://127.0.0.1:3091

sudo sed -i 's|127.0.0.1:3090|127.0.0.1:3091|g' /etc/nginx/sites-available/mutagen-relayer
sudo nginx -t && sudo systemctl reload nginx

curl -s https://mutagen.pramadani.site/health | jq 'keys'
# Harus sama dengan curl http://127.0.0.1:3091/health
```

### Port 3090 dipakai `vouch-solana-be`

Di VPS ini, `ss -tlnp | grep 3090` menunjukkan **vouch-solana-be** (PM2 pid ~2462617), bukan MUTAGEN.

MUTAGEN **wajib** pakai port **3091**. Jangan stop vouch kecuali sengaja.

```bash
ss -tlnp | grep -E '3090|3091'
curl -s http://127.0.0.1:3091/ | jq .
# Harus: { "service": "mutagen-relayer", ... }
```

### Nginx OK tapi masih dapat CORS `vouch-sol` / health tanpa `hubPulse`

Nginx **tidak bentrok** antar domain — `vouch.pramadani.site` → `:3002`, `mutagen.pramadani.site` → `:3091`.

Jika masih dapat respons vouch, Nginx masih mengarah ke **3090** (salah). Update:

```nginx
proxy_pass http://127.0.0.1:3091;
```

PM2 `mutagen-relayer` dengan banyak restart = biasanya `EADDRINUSE` (port salah / masih 3090).

```bash
ss -tlnp | grep 3091
curl -s http://127.0.0.1:3091/ | jq .
pm2 logs mutagen-relayer --err --lines 30
```

### CORS: header `vouch-sol.vercel.app` / origin ditolak

**Penyebab utama:** `https://mutagen.pramadani.site` **bukan** MUTAGEN relayer — Nginx mem-proxy ke app lain (vouch).

Bukti — bandingkan response:

```bash
curl -s http://127.0.0.1:3091/health | jq 'keys'
# MUTAGEN: ["auditorParams","hubPulse","lastError","lastUpdate","pullCount","status","zeroSumIndex"]

curl -s https://mutagen.pramadani.site/health | jq .
# SALAH jika cuma: { "status": "ok", "timestamp": "..." }
```

**Fix Nginx:**

```bash
sudo nginx -T | grep -A30 "mutagen.pramadani.site"
# Harus: proxy_pass http://127.0.0.1:3091;
sudo nginx -t && sudo systemctl reload nginx
```

**Fix CORS** di `relayer/.env`:

```env
CORS_ORIGIN=https://mutagen-chi.vercel.app
```

```bash
cd ~/apps/mutagen && git pull
pm2 delete mutagen-relayer
pm2 start relayer/ecosystem.config.cjs
pm2 restart mutagen-relayer --update-env
```

### Tabel masalah umum

| Masalah | Fix |
|---------|-----|
| 502 Bad Gateway | `curl http://127.0.0.1:3091/health` → `pm2 restart mutagen-relayer --update-env` |
| Hub Pulse nol | Cek `REST_URL` = Hub LCD, tunggu oracle cycle |
| CORS error | `CORS_ORIGIN=https://mutagen-chi.vercel.app` + restart PM2 |
| Mixed content | FE HTTPS → BE `https://mutagen.pramadani.site` |
| Port bentrok | `.env` `PORT=3091`, nginx → `3091` |
| `npm run build` di relayer | Tidak ada — pakai `npm run start` / PM2 saja |

---

## File config

| File | Port / detail |
|------|----------------|
| `relayer/.env` | `PORT=3091` |
| `relayer/ecosystem.config.cjs` | PM2 → port 3091 |
| `deploy/nginx-mutagen-relayer.conf` | `443` → `127.0.0.1:3091` |

---

## Ringkasan

```text
Frontend:  https://<vercel-project>.vercel.app
Backend:   https://mutagen.pramadani.site  (Nginx → :3091)
Local dev: npm run relayer:dev  →  http://localhost:3091
```
