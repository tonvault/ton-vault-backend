import * as fs from 'node:fs';

const fileExists = (filePath: string): Promise<boolean> => {
    return new Promise((resolve) => {
        fs.access(filePath, fs.constants.F_OK, (error) => {
            if (error) {
                resolve(false);
            } else {
                resolve(true);
            }
        });
    });
};

export { fileExists };
