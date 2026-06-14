# API Changelog
## v1 → v2
**Date:** 13/6/2569
**Can Deploy:** ❌ No — Breaking changes detected

### Summary
- Total changes: 5
- Breaking changes: 4
- Non-breaking changes: 1

### ⚠️ Breaking Changes
- **[REMOVED]** `name` — Field "name" was removed — existing clients will break
  - Before: `string`
- **[REMOVED]** `email` — Field "email" was removed — existing clients will break
  - Before: `string`
- **[ADDED]** `fullName` — Field "fullName" was added as required — existing clients will break
  - After: `string`
- **[ADDED]** `emailAddress` — Field "emailAddress" was added as required — existing clients will break
  - After: `string`

### ✅ Non-Breaking Changes
- **[ADDED]** `role` — Field "role" was added as optional — non-breaking
