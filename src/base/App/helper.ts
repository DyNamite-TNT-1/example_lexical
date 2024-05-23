
// Text node formatting // https://github.com/facebook/lexical/blob/main/packages/lexical/src/LexicalConstants.ts
export const IS_BOLD = 1; //1
export const IS_ITALIC = 1 << 1; //2
export const IS_STRIKETHROUGH = 1 << 2; //4
export const IS_UNDERLINE = 1 << 3; //8
export const IS_CODE = 1 << 4; //16
export const IS_SUBSCRIPT = 1 << 5; //32
export const IS_SUPERSCRIPT = 1 << 6; //64
export const IS_HIGHLIGHT = 1 << 7; //128

export function analyzeSumOfConstants(number: number) {
    const constants = [
        { name: "IS_BOLD", value: 1 },
        { name: "IS_ITALIC", value: 2 },
        { name: "IS_STRIKETHROUGH", value: 4 },
        { name: "IS_UNDERLINE", value: 8 },
        { name: "IS_CODE", value: 16 },
        { name: "IS_SUBSCRIPT", value: 32 },
        { name: "IS_SUPERSCRIPT", value: 64 },
        { name: "IS_HIGHLIGHT", value: 128 },
    ];

    const binary = number.toString(2);

    const selectedConstants = constants.filter(
        (constant) => (number & constant.value) === constant.value
    );

    const sumFormula = selectedConstants
        .map((constant) => constant.name)
        .join(" + ");

    console.log(
        `${number} = ${binary} = ${sumFormula}. Following that sum formula.`
    );

    return selectedConstants;
}