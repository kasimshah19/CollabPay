# Conventions

1. **Language:** ALL code comments, identifiers, error messages, log messages, test names, README, and every other .md file, commit messages, and API response messages MUST be written in clear, professional English. No Hindi/Hinglish anywhere in the repository.
2. **Money:** Money is always represented as integer paise (1 Rupee = 100 paise). Do not use floats or decimals.
3. **Dates:** All dates are stored in UTC. API uses ISO 8601 strings.
4. **Business Logic:** Business rules live in the service layer (`src/services/`). Controllers should remain thin.
5. **Testing/Documentation:** Every business rule gets a test or a comment explaining the decision.
6. **Errors:** Use `AppError` with clear string codes (e.g., `SUBMISSION_CLOSED`, `INVALID_STATE`, `REVISION_LIMIT`, `INSUFFICIENT_BALANCE`, `DUPLICATE_URL`, `NOT_OWNER`).
7. **Pagination:** Lists support simple pagination: `?page=1&limit=20` (max 50).
8. **Validation:** IDs in route parameters must be validated as ObjectIds; invalid ones return 400. All body schemas should be strictly validated using Zod.
