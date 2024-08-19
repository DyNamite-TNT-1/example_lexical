import { EmojiLexicalType } from "@base/types/emoji";
import { HeadingTagType } from "@lexical/rich-text";

export interface HTMLEditorJavascriptInterface {
  onChangeStatusButton?: (json: any) => void;
  getCarret?: (json: any) => void;
  updateHeight?: (json: any) => void;
  initCompleted?: () => void;
  onPaddingChanged?: (json: any) => void;
  onChangeCanSubmit?: (json: any) => void;
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
    formatHeading: (headingTag: HeadingTagType) => void;
    formatNumberedList: () => void;
    formatBulletList: () => void;
    formatQuote: () => void;
    formatCodeBlock: () => void;
    addEmoji: (emoji: EmojiLexicalType) => void;
    NHAN: HTMLEditorJavascriptInterface;
    webkit: any; // ios
    HTMLEditorChannel: any; // ios
    setHTMLContent: (
      baseUrl: string,
      content: string,
      placeHolder: string
    ) => void;
    setPaddingTopBottom: (top: number, bottom: number) => void;
    getSelectionCoords: (win?: Window) => any;
    getHTMLContent: () => string;
    onSubmit: () => { blocks: any[]; plainText: string; error?: string };
  }
}
