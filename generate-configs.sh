#!/usr/bin/env bash
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
ROOT="$(cd "$ROOT" && pwd)"

if [[ -z "${ROOT}" || "${ROOT}" == "/" ]]; then
  echo "FATAL: invalid ROOT='${ROOT}'. Abort."
  exit 1
fi

umask 027

write_file() {
  local rel="$1"
  local target="${ROOT}/${rel}"
  local tmp

  mkdir -p "$(dirname "$target")"
  tmp="$(mktemp "${target}.tmp.XXXXXX")"
  cat > "$tmp"
  mv -f "$tmp" "$target"
}

echo "ROOT=${ROOT}"

########################################
# .env.example（必须：仅示例，不放真实密钥）
########################################
write_file ".env.example" <<'EOT'
############################################################
# Database
############################################################
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"

############################################################
# Admin/Auth
############################################################
ADMIN_JWT_SECRET="change-this-to-a-long-random-secret"

############################################################
# Payments (Optional)
############################################################
STRIPE_SECRET_KEY="sk_test_***"

############################################################
# Email (Optional)
############################################################
RESEND_API_KEY="re_***"
RESEND_FROM_EMAIL="booking@your-domain.com"
EOT

echo "Done."
