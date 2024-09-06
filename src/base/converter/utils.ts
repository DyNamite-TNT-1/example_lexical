import {
  TextNode,
  RangeSelection,
  TextFormatType,
  $isLineBreakNode,
  $isTextNode,
  LexicalNode,
  $isParagraphNode,
} from "lexical";

import { $isListNode, $isListItemNode } from "@lexical/list";
import { $isCodeNode } from "@lexical/code";
import { $isQuoteNode } from "@lexical/rich-text";
import { $isLinkNode, $isAutoLinkNode } from "@lexical/link";

import {
  IS_BOLD,
  IS_ITALIC,
  IS_STRIKETHROUGH,
  IS_UNDERLINE,
  IS_CODE,
  IS_SUBSCRIPT,
  IS_SUPERSCRIPT,
  IS_HIGHLIGHT,
} from "../clone-lexical/lexical/LexicalConstants";
import { $isMentionNode } from "../nodes/MentionNode";
import {
  LexicalNodeType,
  ListItemType,
  ListContainerType,
  BlockElementType,
} from "./types";
import { $isEmojiNode } from "@base/nodes/EmojiNode";

export const FORMAT_PREDICATES_V2 = [
  (node: TextNode | RangeSelection) =>
    node.hasFormat("bold") && { name: "bold", value: true },
  (node: TextNode | RangeSelection) =>
    node.hasFormat("code") && { name: "code", value: true },
  (node: TextNode | RangeSelection) =>
    node.hasFormat("italic") && { name: "italic", value: true },
  (node: TextNode | RangeSelection) =>
    node.hasFormat("strikethrough") && { name: "strikethrough", value: true },
  (node: TextNode | RangeSelection) =>
    node.hasFormat("subscript") && { name: "subscript", value: true },
  (node: TextNode | RangeSelection) =>
    node.hasFormat("superscript") && { name: "superscript", value: true },
  (node: TextNode | RangeSelection) =>
    node.hasFormat("underline") && { name: "underline", value: true },
];

type LKeyValue = {
  [key: string]: any;
};

export const calculateSum = (formats: TextFormatType[]): number => {
  let sum = 0;

  for (const format of formats) {
    switch (format) {
      case "bold":
        sum += IS_BOLD;
        break;
      case "italic":
        sum += IS_ITALIC;
        break;
      case "strikethrough":
        sum += IS_STRIKETHROUGH;
        break;
      case "underline":
        sum += IS_UNDERLINE;
        break;
      case "code":
        sum += IS_CODE;
        break;
      case "subscript":
        sum += IS_SUBSCRIPT;
        break;
      case "superscript":
        sum += IS_SUPERSCRIPT;
        break;
      case "highlight":
        sum += IS_HIGHLIGHT;
        break;
      default:
        break;
    }
  }

  return sum;
};

function parseStyleString(styleString: string): LKeyValue {
  // Split the string by '; ' to get individual key-value pairs
  const declarations = styleString.split(/;\s*/);

  // Create an array to hold the formatted key-value pairs
  const formattedPairs: LKeyValue = {};

  // Iterate over each declaration
  for (const declaration of declarations) {
    // Split each declaration by ': ' to get key and value
    const [key, value] = declaration.split(/:\s*/);

    if (key && value) {
      // Format the key-value pair as `"key": value` and add it to the array
      formattedPairs[key.trim()] = value.trim();
    }
  }

  return formattedPairs;
}

export function getInlineTypeElement(node: LexicalNode) {
  if ($isMentionNode(node)) {
    return {
      key: node.getKey(),
      parent: node.__parent,
      type: BlockElementType.USER,
      text: node.getTextContent(),
      metaData: {
        dataId: node.getDataId(),
        dataLabel: node.getMention(),
      },
    };
  }

  if ($isEmojiNode(node)) {
    return {
      key: node.getKey(),
      parent: node.__parent,
      type: BlockElementType.EMOJI,
      text: node.getTextContent(),
      metaData: {
        dataId: node.getDataId(),
        dataLabel: node.getTextContent(),
      },
    };
  }

  if ($isLineBreakNode(node)) {
    return {
      key: node.getKey(),
      parent: node.__parent,
      type: BlockElementType.TEXT,
      text: "\n",
    };
  }

  // NOTICE: Be sure check Text Node at the END
  if ($isTextNode(node)) {
    let formats = FORMAT_PREDICATES_V2.map((predicate) => {
      const result = predicate(node);
      return result ? result : null;
    }).filter(Boolean);

    let formatMap: LKeyValue = {};
    formats.forEach((item) => {
      formatMap[item!.name] = item?.value;
    });

    let styles = parseStyleString(node.getStyle());

    let combinedStyles = { ...styles, ...formatMap };

    return {
      key: node.getKey(),
      parent: node.__parent,
      type: BlockElementType.TEXT,
      text: node.getTextContent(),
      style: combinedStyles,
    };
  }

  return {
    key: node.getKey(),
    parent: node.__parent,
    type: "unknown" + node.getType(),
    text: node.getTextContent(),
  };
}

export function getBlockTypeElement(node: LexicalNode) {
  /**
   * In blocks format, Link is inline element. But, in Lexical, Link is Element Node aka block element.
   */
  if ($isLinkNode(node)) {
    let isUnlinked: boolean | undefined = undefined;
    if ($isAutoLinkNode(node)) {
      isUnlinked = node.getIsUnlinked();
    }

    return {
      key: node.getKey(),
      parent: node.__parent,
      type: BlockElementType.LINK,
      nodeType: node.getType(),
      text: node.getTextContent(),
      url: node.getURL(),
      elements: [] as any[],
      metaData: {
        isUnlinked: isUnlinked,
      },
    };
  }

  if ($isListNode(node)) {
    if (node.getListType() === "bullet") {
      return {
        key: node.getKey(),
        parent: node.__parent,
        type: BlockElementType.RICH_TEXT_LIST,
        nodeType: ListContainerType.Bullet,
        elements: [] as any[],
      };
    } else if (node.getListType() === "number") {
      return {
        key: node.getKey(),
        parent: node.__parent,
        type: BlockElementType.RICH_TEXT_LIST,
        nodeType: ListContainerType.Ordered,
        elements: [] as any[],
      };
    } else if (node.getListType() === "check") {
      return {
        key: node.getKey(),
        parent: node.__parent,
        type: BlockElementType.RICH_TEXT_LIST,
        nodeType: ListContainerType.Check,
        elements: [] as any[],
      };
    }
  }

  if ($isCodeNode(node)) {
    return {
      key: node.getKey(),
      parent: node.__parent,
      type: BlockElementType.RICH_TEXT_PREFORMATTED,
      elements: [] as any[],
    };
  }

  if ($isQuoteNode(node)) {
    return {
      key: node.getKey(),
      parent: node.__parent,
      type: BlockElementType.RICH_TEXT_QUOTE,
      style: {
        textAlign: node.getFormatType(),
      },
      elements: [] as any[],
    };
  }

  if ($isParagraphNode(node)) {
    return {
      key: node.getKey(),
      parent: node.__parent,
      type: BlockElementType.RICH_TEXT_SECTION,
      nodeType: LexicalNodeType.Paragraph,
      style: {
        textAlign: node.getFormatType(),
      },
      elements: [] as any[],
    };
  }

  if ($isListItemNode(node)) {
    var listItemType = ListItemType.ListItem;
    if (node.getChecked() !== undefined) {
      listItemType = node.getChecked()
        ? ListItemType.ListItemChecked
        : ListItemType.ListItemUnchecked;
    }

    return {
      key: node.getKey(),
      parent: node.__parent,
      type: BlockElementType.RICH_TEXT_SECTION,
      nodeType: listItemType,
      metaData: {
        value: node.getValue(),
      },
      elements: [] as any[],
    };
  }

  return {
    key: node.getKey(),
    parent: node.__parent,
    type: BlockElementType.RICH_TEXT_SECTION,
    nodeType: node.getType(),
    elements: [] as any[],
  };
}
