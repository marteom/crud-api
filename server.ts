import http from 'http';
import { v4 as uuidv4, validate as uuidValidate, version as uuidVersion } from 'uuid';
import dotenv from 'dotenv';
dotenv.config();

const port = Number(process.env.PORT) || 8080;

interface User {
    userId: string
};
const memoryApiData = new Array<User>;

memoryApiData.push({userId: uuidv4()});
memoryApiData.push({userId: uuidv4()});
memoryApiData.push({userId: uuidv4()});

enum SupportedMethods {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    DELETE = 'DELETE'
};

const isApiPartsValid = (part1: string, part2: string): boolean => {
    if (part1.toLowerCase() !== 'api') return false;
    if (part2.toLowerCase() !== 'users') return false;
    return true;
}

interface RequestResult {
    code: number,
    message?: string,
    body?: Array<User> | User
}

const executeGetUser = (userId: string): Promise<User> => {
    let result: User;


    const findedUser = memoryApiData.find((el) => el.userId === userId);
    if (!!findedUser) {
        return new Promise((resolve, reject) => {
            resolve(findedUser);
        });
    }


    return new Promise((resolve, reject) => {
        resolve(result);
    });
}

const executeGet = (urlParts: Array<string>): Promise<Array<User> | User> => {
    let result: Array<User> | User;

    if(urlParts.length === 3) {
        result = memoryApiData;
    }

    else if(urlParts.length === 4) {
        const findedUser = memoryApiData.find((el) => el.userId === urlParts[3]);
        if(!!findedUser) {
            result = findedUser;
        }
    }

    return new Promise((resolve, reject) => {
        resolve(result);
    });
}

const isUserValid = (userId: string): Promise<boolean> => {
    let result: boolean;
    try {
        if(!uuidValidate(userId) || uuidVersion(userId) !== 4) {
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

const executeRequest = async (method: string | undefined, urlParts: Array<string>): Promise<RequestResult> => {
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
                if(urlParts.length === 3) { // /api/users
                    result.code = 200;
                    result.message = 'OK';
                    result.body = memoryApiData;
                }
                else if(urlParts.length === 4) { // /api/users/${userId}
                    if(await isUserValid(urlParts[3]) === false) {
                        result.code = 400;
                        result.message = 'Invalid userId. Required uuid v4 format';
                        break;
                    }

                    const getResult = await executeGet(urlParts);

                    if(!getResult) {
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
                break;
            case SupportedMethods.PUT:
                break;
            case SupportedMethods.DELETE:
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

http.createServer(async function (request, response) {
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

    const urlParts = inputUrl?.split('/');
    const urlPartsLen = urlParts.length;

    if (inputUrl.substring(inputUrl.length, inputUrl.length - 1) === '/' || urlPartsLen < 3 || urlPartsLen > 4 || !isApiPartsValid(urlParts[1], urlParts[2])) {
        setStatus(404);
        return;
    }

    const executeResult: RequestResult = await executeRequest(request.method, urlParts);
    setStatus(executeResult.code, executeResult.message, executeResult.body);

}).listen(port);