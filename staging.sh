#!/bin/bash
# Superkabe Staging Environment Manager
# Usage:
#   ./staging.sh up       - Start staging (builds if needed)
#   ./staging.sh down     - Stop staging
#   ./staging.sh reset    - Destroy database + restart fresh
#   ./staging.sh logs     - Tail all logs
#   ./staging.sh db       - Connect to staging database via psql
#   ./staging.sh seed     - Create a test user + organization

set -e

COMPOSE_FILE="docker-compose.staging.yml"

case "$1" in
  up)
    echo "Starting Superkabe staging environment..."
    docker compose -f $COMPOSE_FILE up --build -d
    echo ""
    echo "Staging is running:"
    echo "  Frontend:  http://localhost:3000"
    echo "  Backend:   http://localhost:4000"
    echo "  Database:  localhost:5433 (user: superkabe, db: superkabe_staging)"
    echo ""
    echo "View logs: ./staging.sh logs"
    ;;

  down)
    echo "Stopping staging..."
    docker compose -f $COMPOSE_FILE down
    echo "Stopped."
    ;;

  reset)
    echo "Resetting staging (destroying database)..."
    docker compose -f $COMPOSE_FILE down -v
    echo "Database destroyed. Run './staging.sh up' to start fresh."
    ;;

  logs)
    docker compose -f $COMPOSE_FILE logs -f
    ;;

  db)
    echo "Connecting to staging database..."
    docker compose -f $COMPOSE_FILE exec db psql -U superkabe -d superkabe_staging
    ;;

  seed)
    echo "Seeding staging database with test data..."
    docker compose -f $COMPOSE_FILE exec backend npx ts-node -e "
      const { PrismaClient } = require('@prisma/client');
      const bcrypt = require('bcryptjs');
      const prisma = new PrismaClient();
      async function seed() {
        const org = await prisma.organization.create({
          data: {
            name: 'Test Agency',
            slug: 'test-agency',
            system_mode: 'enforce',
            subscription_tier: 'growth',
            subscription_status: 'active',
          }
        });
        const hash = await bcrypt.hash('staging123', 12);
        await prisma.user.create({
          data: {
            email: 'test@superkabe.com',
            password_hash: hash,
            name: 'Test User',
            role: 'admin',
            organization_id: org.id,
          }
        });
        console.log('Seeded: test@superkabe.com / staging123');
        console.log('Org:', org.name, '(', org.id, ')');
      }
      seed().catch(console.error).finally(() => prisma.\$disconnect());
    "
    ;;

  *)
    echo "Superkabe Staging Environment"
    echo ""
    echo "Usage:"
    echo "  ./staging.sh up       Start staging"
    echo "  ./staging.sh down     Stop staging"
    echo "  ./staging.sh reset    Destroy DB + restart fresh"
    echo "  ./staging.sh logs     Tail logs"
    echo "  ./staging.sh db       Connect to database"
    echo "  ./staging.sh seed     Create test user"
    ;;
esac
