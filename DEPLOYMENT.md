# Hosting RAPTOR — aaPanel & Docker

---

## Option A — aaPanel (Linux VPS)

### Prerequisites
- Ubuntu 20.04+ / CentOS 7+ VPS
- aaPanel installed (`bt.cn`)
- Domain pointed at your server IP

---

### 1. Install Required Software in aaPanel

In aaPanel → **App Store**, install:
- **Nginx** (latest stable)
- **Node.js** (v18+) — via the Node.js Manager plugin
- **MongoDB** — or install manually (see step 2)
- **PM2** — install via Node.js Manager

---

### 2. Install MongoDB (aaPanel terminal)

```bash
# Ubuntu
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
  sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor

echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] \
  https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | \
  sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

sudo apt update && sudo apt install -y mongodb-org
sudo systemctl enable --now mongod
```

Verify: `mongosh --eval "db.runCommand({ ping: 1 })"`

---

### 3. Upload Project to Server

**Option 1 — Git:**
```bash
cd /www/wwwroot
git clone https://github.com/YOUR_USER/raptor.git
cd raptor
```

**Option 2 — aaPanel File Manager:**
Upload your project zip, extract to `/www/wwwroot/raptor/`

---

### 4. Build the Frontend

```bash
cd /www/wwwroot/raptor/frontend
npm install
npm run build
# Output goes to /www/wwwroot/raptor/frontend/dist/
```

---

### 5. Configure and Start the Backend with PM2

```bash
cd /www/wwwroot/raptor/backend
npm install

# Create production .env
cat > .env << 'EOF'
MONGO_URI=mongodb://localhost:27017/raptor
PORT=5000
EOF

# Start with PM2
pm2 start server.js --name raptor-backend
pm2 save
pm2 startup   # follow the printed command to enable auto-start
```

---

### 6. Configure Nginx in aaPanel

In aaPanel → **Website** → **Add Site**:
- Domain: `yourdomain.com`
- Root: `/www/wwwroot/raptor/frontend/dist`
- PHP: Pure static

Then click **Settings → Config** and replace the config with:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    root /www/wwwroot/raptor/frontend/dist;
    index index.html;

    # Serve frontend SPA — all routes fall back to index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API calls to Express backend
    location /api/ {
        proxy_pass         http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
}
```

Save. Reload Nginx.

---

### 7. SSL Certificate (free)

aaPanel → Website → Settings → **SSL** → **Let's Encrypt** → Issue certificate.
Enable **Force HTTPS**.

---

### 8. Verify

```bash
pm2 status               # raptor-backend should be "online"
curl http://localhost:5000/api/health   # {"status":"ok"}
```

Open `https://yourdomain.com` — done.

---

### Updating the App

```bash
cd /www/wwwroot/raptor
git pull

# Rebuild frontend
cd frontend && npm install && npm run build

# Restart backend
cd ../backend && npm install
pm2 restart raptor-backend
```

---
---

## Option B — Docker

### Files to create (already included below)

```
Raptor/
├── backend/
│   └── Dockerfile
├── frontend/
│   ├── Dockerfile
│   └── nginx.conf
└── docker-compose.yml
```

---

### `backend/Dockerfile`

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

---

### `frontend/Dockerfile`

```dockerfile
# Stage 1 — build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2 — serve with Nginx
FROM nginx:1.25-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

### `frontend/nginx.conf`

```nginx
server {
    listen 80;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy /api to backend container
    location /api/ {
        proxy_pass         http://backend:5000;
        proxy_http_version 1.1;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
    }
}
```

---

### `docker-compose.yml`

```yaml
services:
  mongo:
    image: mongo:7
    restart: unless-stopped
    volumes:
      - mongo_data:/data/db
    networks:
      - raptor_net

  backend:
    build: ./backend
    restart: unless-stopped
    environment:
      MONGO_URI: mongodb://mongo:27017/raptor
      PORT: 5000
    depends_on:
      - mongo
    networks:
      - raptor_net

  frontend:
    build: ./frontend
    restart: unless-stopped
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - raptor_net

volumes:
  mongo_data:

networks:
  raptor_net:
```

> Only `frontend` exposes a public port. Backend and MongoDB are internal.

---

### Run Locally with Docker

```bash
cd /path/to/Raptor
docker compose up --build
```

Open `http://localhost`

---

### Deploy to a VPS with Docker

```bash
# On your VPS — install Docker
curl -fsSL https://get.docker.com | sh

# Copy project (or git clone)
scp -r ./Raptor user@YOUR_IP:/opt/raptor
# or
git clone https://github.com/YOU/raptor /opt/raptor

# Start
cd /opt/raptor
docker compose up -d --build

# Check logs
docker compose logs -f
```

---

### HTTPS with Docker (Traefik — recommended)

Add to `docker-compose.yml`:

```yaml
services:
  traefik:
    image: traefik:v3
    command:
      - "--providers.docker=true"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.le.acme.httpchallenge=true"
      - "--certificatesresolvers.le.acme.httpchallenge.entrypoint=web"
      - "--certificatesresolvers.le.acme.email=you@example.com"
      - "--certificatesresolvers.le.acme.storage=/letsencrypt/acme.json"
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - letsencrypt:/letsencrypt
    networks:
      - raptor_net

  frontend:
    build: ./frontend
    restart: unless-stopped
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.raptor.rule=Host(`yourdomain.com`)"
      - "traefik.http.routers.raptor.entrypoints=websecure"
      - "traefik.http.routers.raptor.tls.certresolver=le"
      - "traefik.http.middlewares.redirect-to-https.redirectscheme.scheme=https"
    # Remove the ports: section when using Traefik
    depends_on:
      - backend
    networks:
      - raptor_net

volumes:
  mongo_data:
  letsencrypt:
```

---

### Useful Docker Commands

```bash
docker compose ps                     # status of all containers
docker compose logs backend -f        # stream backend logs
docker compose exec mongo mongosh     # open MongoDB shell
docker compose down                   # stop all
docker compose down -v                # stop + delete volumes (wipes DB)
docker compose up -d --build frontend # rebuild only frontend
```
