import type {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  LexicalNode,
  NodeKey,
  SerializedTextNode,
  Spread,
} from "lexical";

import { $applyNodeReplacement, TextNode } from "lexical";

export type SerializedEmojiNode = Spread<
  {
    dataId?: string; // unified-id
  },
  SerializedTextNode
>;

function $convertMentionElement(
  domNode: HTMLElement
): DOMConversionOutput | null {
  const textContent = domNode.textContent;
  const dataId = domNode.getAttribute("data-id");
  if (textContent !== null) {
    const node = $createEmojiNode(textContent, dataId ?? undefined);
    return {
      node,
    };
  }

  return null;
}

export class EmojiNode extends TextNode {
  __dataId?: string;

  constructor(text: string, key?: NodeKey, dataId?: string) {
    super(text, key);
    this.__dataId = dataId;
  }

  static getType(): string {
    return "emoji";
  }

  static clone(node: EmojiNode): EmojiNode {
    return new EmojiNode(node.__text, node.__key, node.__dataId);
  }

  createDOM(config: EditorConfig): HTMLElement {
    const dom = super.createDOM(config);
    dom.className = "emoji";
    if (this.__dataId) {
      dom.setAttribute("data-id", this.__dataId);
    }
    return dom;
  }

  static importJSON(serializedNode: SerializedEmojiNode): EmojiNode {
    const node = $createEmojiNode(serializedNode.text, serializedNode.dataId);
    node.setTextContent(serializedNode.text);
    node.setFormat(serializedNode.format);
    node.setDetail(serializedNode.detail);
    node.setMode(serializedNode.mode);
    node.setStyle(serializedNode.style);
    return node;
  }

  exportJSON(): SerializedEmojiNode {
    return {
      ...super.exportJSON(),
      type: "emoji",
      dataId: this.__dataId,
    };
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement("span");
    element.setAttribute("data-lexical-emoji", "true");
    element.textContent = this.__text;
    if (this.__dataId) {
      element.setAttribute("data-id", this.__dataId);
    }
    return { element };
  }

  static importDOM(): DOMConversionMap | null {
    return {
      span: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute("data-lexical-emoji")) {
          return null;
        }
        return {
          conversion: $convertMentionElement,
          priority: 1,
        };
      },
    };
  }

  canInsertTextBefore(): boolean {
    // TODO: ANHDUC - Do not edit this overrides
    return false;
  }

  canInsertTextAfter(): boolean {
    // TODO: ANHDUC - Do not edit this overrides
    return false;
  }

  getDataId(): string | undefined {
    return this.__dataId;
  }
}

export function $isEmojiNode(
  node: LexicalNode | null | undefined
): node is EmojiNode {
  return node instanceof EmojiNode;
}

export function $createEmojiNode(
  emojiText: string,
  dataId?: string
): EmojiNode {
  const node = new EmojiNode(emojiText, undefined, dataId);
  return $applyNodeReplacement(node);
}
