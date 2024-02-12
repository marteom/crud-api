export const isApiPartsValid = (part1: string, part2: string): boolean => {
    if (part1.toLowerCase() !== 'api') return false;
    if (part2.toLowerCase() !== 'users') return false;
    return true;
}

export const checkObjectField = (inputObj: object, fieldName: string): boolean => {
    if (Object.keys(inputObj).indexOf(fieldName) == -1) {
        return false;
    }

    return true;
}