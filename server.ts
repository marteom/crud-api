import http from 'http';
import dotenv from 'dotenv';
dotenv.config();
 
const port = Number(process.env.PORT) || 8080;
//const memoryApiData = [];

const SupportedMethods = [ 
    'GET', 
    'POST',
    'PUT', 
    'DELETE'
];

const isApiPartsValid = (part1: string, part2: string): boolean => {
    if(part1.toLowerCase() !== 'api') return false;
    if(part2.toLowerCase() !== 'users') return false;
    return true;
}

interface RequestResult {
    code: number,
    message?: string,
    body?: object
}

const executeRequest = (method: string = ''): RequestResult => {
    let result: RequestResult = {code: 500};

    if(!SupportedMethods.includes(method.toUpperCase())) {
        result.message = 'Unsupported method';
        return result;
    }

    try {
        result.code = 200;
    }

    catch {
        result.code = 500;
        result.message = 'Ошибка при обработке запроса на сервере';
    }

    return result;
}

http.createServer(function(request, response){
    response.setHeader('Content-Type', 'text/html; charset=utf-8;');
    
    const setStatus = (code: number, message: string = 'Incorrect api url'): void => {
        response.statusCode = code;
        response.statusMessage = message;
        response.end();
    }

    const inputUrl: string = request.url || '/';

    const urlParts = inputUrl?.split('/');
    const urlPartsLen = urlParts.length;

    if(inputUrl.substring(inputUrl.length, inputUrl.length-1) === '/' || urlPartsLen < 3 || urlPartsLen > 4 || !isApiPartsValid(urlParts[1], urlParts[2])) {
        setStatus(404);
        return;
    }
    
    const executeResult: RequestResult = executeRequest(request.method);
    setStatus(executeResult.code, executeResult.message);

}).listen(port);