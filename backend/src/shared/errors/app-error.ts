export class AppError extends Error {
  constructor(
    message: string,
    public status: 400 | 401 | 403 | 404 | 409 | 422 = 400,
    public isFormError = false,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ValidationError extends AppError {
  constructor(message = "Datos inválidos") {
    super(message, 400, true);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "No autenticado") {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "No tienes permisos para esta acción") {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Recurso no encontrado") {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Conflicto con el estado actual del recurso") {
    super(message, 409);
  }
}