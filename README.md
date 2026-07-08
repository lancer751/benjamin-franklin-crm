# moodle-enroll-manager

## Installation

```bash
bun install
```

## Run

```bash
bun run index.js
```

## Recent changes

The latest updates to the project include:

- **Prisma production support**: added `packages/db/prisma.config.prod.ts` and updated migration scripts for production-ready database configuration.
- **Backend auth and role handling**: improved user profile retrieval based on role and refactored seller routes for a cleaner endpoint structure.
- **Model and dependency upgrades**: enhanced `Professor` and `Edition` models, updated dependencies, and aligned schema changes across the backend and shared packages.
- **Lead management enhancements**: refactored lead views and repository logic, added lead filters and pagination, and improved lead detail and prospects workflows.
- **Fake data generation**: added fake data creation for supervisors and sellers to support CRM workflow testing and onboarding.
- **Repository cleanup and validation**: refactored campaign and lead repositories for clearer naming and validation logic, including updated campaign name and lead phone validation.
- **CRM workflow improvements**: improved campaign, seller, and lead management across backend routes and services.
- **General fixes**: updated cookie expiration handling in JWT utilities and added sales status support in product routes.

## Project info

This project was created using `bun init` in bun v1.2.8. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
