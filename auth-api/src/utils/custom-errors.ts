export class UserAlreadyExistsException extends Error {
    constructor(message: string) {
        super(message);
    }
}

export class InvalidCredentialsException extends Error {
    constructor(message: string) {
        super(message);
    }
}
