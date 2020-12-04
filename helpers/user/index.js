const CODE_LENGTH = 900000 - 1; // 6 DIGIT NUMBER BETWEEN 0 TO 900000
const ADD_TO_CODE = 100000;

export const generateAuthCode = () => {
    return `${Math.floor(ADD_TO_CODE + Math.random() * CODE_LENGTH)}`;
};