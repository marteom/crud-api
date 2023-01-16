export interface User {
    id: string,
    username?: string,
    age?: number,
    hobbies?: Array<string>
};

export interface RequestResult {
    code: number,
    message?: string,
    body?: Array<User> | User
}