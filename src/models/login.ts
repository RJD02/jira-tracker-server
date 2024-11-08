export interface LoginRequest {
    username: string;
    password: string;
}

export interface User extends LoginRequest {
    id: number;
    username: string;
    password: string;
    token?: string;
    expiry?: Date;
}
