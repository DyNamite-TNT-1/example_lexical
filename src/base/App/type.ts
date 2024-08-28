import { EmojiLexicalType } from "@base/types/emoji";
import { MentionLexicalType } from "@base/types/mention";
import { HeadingTagType } from "@lexical/rich-text";
import { ElementFormatType } from "lexical";

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
    addMention: (mention: MentionLexicalType) => void;
    insertText: (text: string) => void;
    insertBlocks: (blocks: any[]) => void;
    onClear: () => void;
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

export type StyleMapType = {
  isRTL: boolean;
  isLink: boolean;
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  isStrikethrough: boolean;
  isCode: boolean;
  canUndo: boolean;
  canRedo: boolean;
  blockType: string;
  elementFormat: ElementFormatType;
};
