export class DatabaseError extends Error {
  constructor(readonly cause: unknown) {
    super("A database error occurred");
  }
}

export class NotFoundError extends Error {
  constructor(readonly cause: unknown) {
    super("Not found error");
  }
}
