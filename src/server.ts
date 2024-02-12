import http from 'http';
import { v4 as uuidv4, validate as uuidValidate, version as uuidVersion } from 'uuid';

import { isApiPartsValid, checkObjectField } from './utils';
import { SupportedMethods, RequiredUserFields } from './enums';
import { User, RequestResult } from './interfaces';

import dotenv from 'dotenv';
dotenv.config();

const port = Number(process.env.PORT) || 8080;

let memoryApiData = new Array<User>;

const executeDelete = async (userId: string): Promise<boolean> => {
    const index: number = await Promise.resolve(memoryApiData.findIndex((el) => el.id === userId));

    if(index !== -1) {
        memoryApiData.splice(index, 1);
        return true;
    }

    return false;
}

const executePut = async (body: User): Promise<User | undefined> => {
    let result: User | undefined;
    let modifyUser: User | undefined = undefined;
    const memoryApiDataModify = await Promise.all(memoryApiData.map((el) => {
        if(el.id === body.id) {
            modifyUser = {
                id: body.id,
                username: !checkObjectField(body, RequiredUserFields.username) ? el.username : body[RequiredUserFields.username],
                age: !checkObjectField(body, RequiredUserFields.age) ? el.age : body[RequiredUserFields.age],
                hobbies: !checkObjectField(body, RequiredUserFields.hobbies) ? el.hobbies : body[RequiredUserFields.hobbies],
            }
            return modifyUser;
        }
        return el;
    }));

    memoryApiData = memoryApiDataModify;

    if (!!modifyUser) {
        result = modifyUser;
    }
    else {
        result = undefined;
    }

    return new Promise((resolve, reject) => {
        resolve(result);
    });
}

const executeGet = (urlParts: Array<string>): Promise<Array<User> | User> => {
    let result: Array<User> | User;

    if (urlParts.length === 3) {
        result = memoryApiData;
    }

    else if (urlParts.length === 4) {
        const findedUser = memoryApiData.find((el) => el.id === urlParts[3]);
        if (!!findedUser) {
            result = findedUser;
        }
    }

    return new Promise((resolve, reject) => {
        resolve(result);
    });
}

const executePost = (body: object): Promise<User> => {
    const newUser = Object.assign(body, { id: uuidv4() });
    memoryApiData.push(newUser);

    return new Promise((resolve, reject) => {
        resolve(newUser);
    });
}

const isUserValid = (userId: string): Promise<boolean> => {
    let result: boolean;
    try {
        if (!uuidValidate(userId) || uuidVersion(userId) !== 4) {
            result = false;
        }
        else {
            result = true;
        }
    }

    catch {
        result = false;
    }

    return new Promise((resolve) => {
        resolve(result);
    });
}

const executeRequest = async (method: string | undefined, urlParts: Array<string>, body: object | undefined): Promise<RequestResult> => {
    let result: RequestResult = { code: 500 };

    if (!method || !(method in SupportedMethods)) {
        result.message = 'Unsupported method';
        return new Promise((resolve, reject) => {
            resolve(result);
        });
    }

    try {
        switch (method) {
            case SupportedMethods.GET:
                if (urlParts.length === 3) { // /api/users
                    result.code = 200;
                    result.message = 'OK';
                    result.body = memoryApiData;
                }
                else if (urlParts.length === 4) { // /api/users/${userId}
                    if (await isUserValid(urlParts[3]) === false) {
                        result.code = 400;
                        result.message = 'Invalid userId. Required uuid v4 format';
                        break;
                    }

                    const getResult = await executeGet(urlParts);

                    if (!getResult) {
                        result.code = 404;
                        result.message = 'User not found!';
                    }
                    else {
                        result.code = 200;
                        result.message = 'OK';
                        result.body = getResult;
                    }
                }
                break;
            case SupportedMethods.POST:
                if (!body || Object.keys(body).length === 0 || !checkObjectField(body, RequiredUserFields.age) || !checkObjectField(body, RequiredUserFields.username) || !checkObjectField(body, RequiredUserFields.hobbies)) {
                    result.code = 400;
                    result.message = 'Not all required fields found (required fields: username(string), age(number), hobbies(Array<string>))';
                    break;
                }
                const postResult = await executePost(body);
                result.code = 201;
                result.message = 'OK';
                result.body = postResult;
                break;
            case SupportedMethods.PUT:
                if (!urlParts[3]) {
                    result.code = 400;
                    result.message = 'Required parameter userId not found!';
                    break;
                }
                if (await isUserValid(urlParts[3]) === false) {
                    result.code = 400;
                    result.message = 'Invalid userId. Required uuid v4 format';
                    break;
                }
                if (!body || Object.keys(body).length === 0) {
                    result.code = 400;
                    result.message = 'Undefined or empty body';
                    break;
                }
                const putResult = await executePut(Object.assign({id: urlParts[3]}, body));

                if (!putResult) {
                    result.code = 404;
                    result.message = 'User not found!';
                }
                else {
                    result.code = 200;
                    result.message = 'OK';
                    result.body = putResult;
                }

                break;
            case SupportedMethods.DELETE:
                if (await isUserValid(urlParts[3]) === false) {
                    result.code = 400;
                    result.message = 'Invalid userId. Required uuid v4 format';
                    break;
                }

                const resultDelete = await executeDelete(urlParts[3]);

                if (!resultDelete) {
                    result.code = 404;
                    result.message = 'User not found!';
                }
                else {
                    result.code = 204;
                    result.message = 'OK';
                }

                break;
        }
    }

    catch {
        result.code = 500;
        result.message = 'Server Error!';
    }

    return new Promise((resolve, reject) => {
        resolve(result);
    })
}

const server = http.createServer(async function (request, response) {
    response.setHeader('Content-Type', 'text/html; charset=utf-8;');

    const setStatus = (code: number, message: string = 'Incorrect api url', body?: Array<object> | object): void => {
        response.statusCode = code;
        response.statusMessage = message;

        if (!!body) {
            response.end(Buffer.from(JSON.stringify(body)));
        }
        response.end();
    }

    const inputUrl: string = request.url || '/';

    const buffers: any[] = [];
    for await (const chunk of request) {
        buffers.push(chunk);
    }
    const data = Buffer.concat(buffers).toString();
    let bodyData: object | undefined = buffers.length > 0 ? JSON.parse(data) : undefined;

    const urlParts = inputUrl?.split('/');
    const urlPartsLen = urlParts.length;

    if (inputUrl.substring(inputUrl.length, inputUrl.length - 1) === '/' || urlPartsLen < 3 || urlPartsLen > 4 || !isApiPartsValid(urlParts[1], urlParts[2])) {
        setStatus(404);
        return;
    }

    const executeResult: RequestResult = await executeRequest(request.method, urlParts, bodyData);
    setStatus(executeResult.code, executeResult.message, executeResult.body);

}).listen(port);

export default server;