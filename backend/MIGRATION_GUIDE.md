# Migration Commands & Verification

## Pre-Migration Requirements

- Node.js >= 18.0.0
- npm or pnpm package manager
- Original TypeScript project backed up

## Recommended Commands to Run

```bash
# 1. Install dependencies with stable versions only
npm install

# 2. Verify the project structure
npm run lint

# 3. Run tests (if available)
npm test

# 4. Start development server
npm run dev

# 5. Verify API is responding
curl http://localhost:3001/health
```

## Troubleshooting

### "Module not found" errors
- ✅ Ensure all `.js` extensions are in imports
- ✅ Verify relative paths start with `./` or `../`
- ✅ Check working directory is project root

### Port already in use
```bash
# Find process using port 3001
lsof -i :3001

# Kill process
kill -9 <PID>

# Or use different port
PORT=3002 npm run dev
```

### Missing environment variables
Create `.env` file based on `src/config/environment.js`:

```
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb://localhost:27017/pianoverse
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-dev-secret-key
FRONTEND_URL=http://localhost:3000
```

### Database connection issues
- Ensure MongoDB is running: `mongod`
- Ensure Redis is running: `redis-server`
- Verify connection strings in environment

## CI/CD Pipeline Updates

### GitHub Actions Workflow

Update `.github/workflows/backend-ci.yml`:

**Before:**
```yaml
- name: Build
  run: npm run build
```

**After:**
```yaml
- name: Lint
  run: npm run lint
```

Remove TypeScript steps since they're no longer needed.

## Performance Improvements

- ✅ Faster startup time (no TypeScript compilation)
- ✅ Smaller runtime footprint (no TypeScript runtime)
- ✅ Reduced build pipeline complexity
- ✅ Simpler dependency tree

## Files Changed

### Converted Files (58 total)
All `.ts` files converted to `.js`:

```
Configuration:
- src/config/database.js
- src/config/environment.js
- src/config/redis.js

Core:
- src/index.js
- src/app.js

Common:
- src/common/errors/custom-errors.js
- src/common/middleware/*.js
- src/common/repositories/*.js
- src/common/utils/*.js

Modules (11 modules):
- src/modules/admin/**/*.js
- src/modules/ai/**/*.js
- src/modules/auth/**/*.js
- src/modules/composition/**/*.js
- src/modules/courses/**/*.js
- src/modules/gamification/**/*.js
- src/modules/piano/**/*.js
- src/modules/practice/**/*.js
- src/modules/rbac/**/*.js
- src/modules/streaming/**/*.js
- src/modules/users/**/*.js

Tests:
- src/__tests__/*.js
```

### Configuration Changes
- ✅ `package.json` - Updated with stable versions and new build scripts
- ❌ `tsconfig.json` - Removed
- ✅ `.eslintrc.js` - NEW - JavaScript linting config
- ✅ `.prettierrc.json` - NEW - Code formatting config

### Created Files
- `MIGRATION_SUMMARY.md` - This document
- `MIGRATION_CHECKLIST.md` - Post-migration verification

## Rollback Instructions

If needed to rollback to TypeScript:

```bash
# Restore from backup
git checkout HEAD -- src/
git checkout HEAD -- package.json
git checkout HEAD -- tsconfig.json

# Reinstall TypeScript dependencies
npm install
```

## Long-term Maintenance

### Code Quality
- Use ESLint regularly: `npm run lint:fix`
- Format code: `npm run format`
- Write tests: `npm test`

### Dependency Updates
- Check for updates: `npm outdated`
- Update carefully: `npm update`
- Pin critical versions in package.json

### Documentation
- Maintain JSDoc comments
- Keep README updated
- Document API endpoints

## Notes

- All business logic is preserved
- All APIs are backwards compatible
- Performance should improve due to eliminated TypeScript compilation
- IDE intellisense works via JSDoc comments
