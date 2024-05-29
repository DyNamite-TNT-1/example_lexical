import {
    HeadingTagType,
} from "@lexical/rich-text";

export
    interface HTMLEditorJavascriptInterface {
    onChangeStatusButton?: (json: any) => void;
    getCarret?: (json: any) => void;
    updateHeight?: (json: any) => void;
}

declare global {
    interface Window {
        undo: () => void;
        redo: () => void;
        formatBold: () => void;
        formatItalic: () => void;
        formatUnderline: () => void;
        formatStrikeThrough: () => void;
        formatCodeInline: () => void;
        indent: () => void;
        outdent: () => void;
        alignLeft: () => void;
        alignCenter: () => void;
        alignRight: () => void;
        alignJustify: () => void;
        formatParagraph: () => void;
        formatHeading: (headingSize: HeadingTagType) => void;
        formatNumberedList: () => void;
        formatBulletList: () => void;
        formatQuote: () => void;
        formatCodeBlock: () => void;
        NHAN: HTMLEditorJavascriptInterface;
        //
        setHTMLContent: (baseUrl: string, content: string, placeHolder: string) => void;
        initCompleted?: () => void;
        setPaddingTopBottom: (top: number, bottom: number) => void;
        getSelectionCoords: (win?: Window) => any;
        onPaddingChanged?: (json: any) => void;
    }
}