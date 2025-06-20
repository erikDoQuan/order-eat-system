# Loyalty System Monorepo

This monorepo houses a complete loyalty system platform with multiple applications and shared packages. Built with modern web technologies, it
provides a scalable architecture for easy development and maintenance.

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Start all applications
pnpm dev

# Start API backend only
pnpm dev:api

# Start Admin Portal only
pnpm dev:web
```

## 📋 Prerequisites

- **Node.js**: >=22.13.0 (configured in `.nvmrc` and `.node-version`)
- **pnpm**: >=9.6.0 (our package manager)
- **Docker**: Required for local database and services

## 🏗️ Repository Structure

```
├── apps/                               # Application packages
│   ├── admin-portal/                   # Admin dashboard (Vite + React)
│   ├── api/                            # Backend API (NestJS)
│
├── packages/                           # Shared packages
│   ├── react-web-ui-shadcn/            # Reusable shadcn/ui components
│   ├── shared-universal/               # Cross-platform utilities
│   ├── shared-web/                     # Web-specific utilities
│
├── tooling/                            # Development tooling
│   ├── eslint/                         # ESLint configuration
│   ├── prettier/                       # Prettier configuration
│   ├── tailwindcss/                    # TailwindCSS configuration
│   └── typescript/                     # TypeScript configuration
│
└── docs/                               # Project documentation
```

## 🔑 Core Features

- **Authentication & Authorization**

  - Multi-provider auth (Firebase, Google, Facebook, Apple)
  - Access token & refresh token system
  - Role-based access control

- **Content Management**

  - User management
  - Loyalty program configuration
  - Points and rewards system
  - Content publishing workflow

- **Developer Experience**
  - Full TypeScript support
  - Comprehensive testing (unit + E2E)
  - Swagger API documentation
  - Hot reloading during development

## 🛠️ Technology Stack

| Category           | Technologies                 |
| ------------------ | ---------------------------- |
| **Backend**        | NestJS, MikroORM, PostgreSQL |
| **Frontend**       | React, Vite                  |
| **UI**             | TailwindCSS, shadcn/ui       |
| **Testing**        | Jest, Playwright             |
| **Documentation**  | Swagger                      |
| **Infrastructure** | Docker, pnpm, Turborepo      |

## 💻 Common Development Tasks

### Application Management

```bash
# Start all applications in development mode
pnpm dev

# Start specific applications
pnpm dev:api     # API backend
pnpm dev:web     # Admin portal

# Use Turborepo for optimized development
pnpm turbo:dev
pnpm turbo:dev:api
pnpm turbo:dev:admin
```

### Code Quality

```bash
# Run type checking
pnpm typecheck

# Lint code
pnpm lint          # Check for issues
pnpm lint:fix      # Fix issues automatically
pnpm lint:quiet    # Check with minimal output

# Format code
pnpm format        # Check formatting
pnpm format:fix    # Fix formatting issues

# Run all fixes
pnpm fix           # lint:fix + format:fix
```

### Workspace Management

```bash
# Clean build artifacts
pnpm clean           # Clean all build artifacts
pnpm clean:workspaces  # Run clean in all workspaces

# Package maintenance
pnpm sort-package      # Check package.json sorting
pnpm sort-package:fix  # Fix package.json sorting
pnpm lint:ws           # Verify workspace integrity
```

## 📚 Documentation

Each application has its own detailed README with specific setup instructions:

- [API Backend Documentation](apps/api/README.md)
- [Admin Portal Documentation](apps/admin-portal/README.md)

Additional technical documentation is available in the `docs/` directory.

## 🤝 Contributing

When contributing to this repository, please follow our established patterns for:

- Code style and formatting (enforced by ESLint and Prettier)
- Component architecture
- Testing methodology
- Git commit message format

## 🔧 Troubleshooting

**Common Issues:**

1. **Dependency issues**: If you encounter strange errors after pulling updates, try:

   ```bash
   pnpm clean && pnpm install
   ```

2. **Port conflicts**: The services use the following ports by default:

   - API: 3000
   - Admin Portal: 5173

   If you have port conflicts, check the respective application READMEs for configuration options.

3. **Docker issues**: Make sure Docker is running for local development with:
   ```bash
   docker-compose up -d
   ```
