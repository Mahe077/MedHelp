# ==========================================
# MONOREPO STRUCTURE (Recommended for small-medium projects)
# ==========================================
# pharmacy-system/
# ├── docker-compose.yml
# ├── .env
# ├── .gitignore
# ├── README.md
# ├── frontend/
# │   ├── Dockerfile
# │   ├── package.json
# │   ├── next.config.js
# │   └── ... (Next.js files)
# ├── backend/
# │   ├── Dockerfile
# │   ├── package.json
# │   └── ... (Node.js/Express files)
# └── volumes/
#     ├── postgres/     (git-ignored)
#     └── redis/        (git-ignored)
