import {
  $applyNodeReplacement,
  type DOMConversionMap,
  type DOMConversionOutput,
  type DOMExportOutput,
  type EditorConfig,
  type LexicalNode,
  type NodeKey,
  type SerializedTextNode,
  type Spread,
  TextNode,
} from "lexical";
import { addClassNamesToElement } from "@lexical/utils";

export type SerializedMentionNode = Spread<
  {
    mentionName: string;
    dataId?: string;
  },
  SerializedTextNode
>;

function $convertMentionElement(
  domNode: HTMLElement
): DOMConversionOutput | null {
  const dataLabel = domNode.getAttribute("data-value");
  const dataId = domNode.getAttribute("data-id");
  if (dataLabel !== null) {
    const node = $createMentionNode(dataLabel, dataId ?? undefined);
    return {
      node,
    };
  }

  return null;
}

export class MentionNode extends TextNode {
  __mention: string;
  /**
   * is id of user
   */
  __dataId?: string;
  static getType(): string {
    return "mention";
  }

  static clone(node: MentionNode): MentionNode {
    return new MentionNode(
      node.__mention,
      node.__text,
      node.__key,
      node.__dataId
    );
  }
  static importJSON(serializedNode: SerializedMentionNode): MentionNode {
    const node = $createMentionNode(
      serializedNode.mentionName,
      serializedNode.dataId
    );
    node.setTextContent(serializedNode.text);
    node.setFormat(serializedNode.format);
    node.setDetail(serializedNode.detail);
    node.setMode(serializedNode.mode);
    node.setStyle(serializedNode.style);
    return node;
  }

  constructor(
    mentionName: string,
    text?: string,
    key?: NodeKey,
    dataId?: string
  ) {
    super(text ?? mentionName, key);
    this.__mention = mentionName;
    this.__dataId = dataId;
  }

  exportJSON(): SerializedMentionNode {
    return {
      ...super.exportJSON(),
      mentionName: this.__mention,
      dataId: this.__dataId,
      type: "mention",
      version: 1,
    };
  }

  createDOM(config: EditorConfig): HTMLElement {
    const dom = super.createDOM(config);
    addClassNamesToElement(dom, config.theme.mention);
    if (this.__dataId) {
      dom.setAttribute("data-id", this.__dataId);
    }
    return dom;
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement("span");
    element.setAttribute("data-lexical-mention", "true");
    element.textContent = this.__text;
    if (this.__dataId) {
      element.setAttribute("data-id", this.__dataId);
    }
    return { element };
  }

  static importDOM(): DOMConversionMap | null {
    return {
      a: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute("data-lexical-mention")) {
          return null;
        }
        return {
          conversion: $convertMentionElement,
          priority: 1,
        };
      },
    };
  }

  isTextEntity(): true {
    return true;
  }

  canInsertTextBefore(): boolean {
    return false;
  }

  canInsertTextAfter(): boolean {
    return false;
  }

  getDataId(): string | undefined {
    return this.__dataId;
  }

  getMention(): string {
    return this.__mention;
  }
}

export function $createMentionNode(
  mentionName: string,
  dataId?: string
): MentionNode {
  const mentionNode = new MentionNode(
    mentionName,
    "@" + mentionName,
    undefined,
    dataId
  );
  mentionNode.setMode("token").toggleDirectionless();
  return $applyNodeReplacement(mentionNode);
}

export function $isMentionNode(
  node: LexicalNode | null | undefined
): node is MentionNode {
  return node instanceof MentionNode;
}
