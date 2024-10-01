export interface LoginRequest {
    username: string;
    password: string;
}

export interface User extends LoginRequest {
    id?: number
}
