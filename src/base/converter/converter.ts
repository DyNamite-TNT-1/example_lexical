import type { LexicalEditor, LexicalNode, TextFormatType } from "lexical";

import { $createListItemNode, $createListNode, ListType } from "@lexical/list";

import {
  $createLineBreakNode,
  $createParagraphNode,
  $getRoot,
  $isElementNode,
} from "lexical";
import _ from "lodash";
import { $createExtendedTextNode } from "../nodes/ExtendedTextNode";
import { $createQuoteNode } from "@lexical/rich-text";

import { $createCodeNode } from "@lexical/code";
import { $createLinkNode } from "@lexical/link";
import { visitTree } from "@base/clone-lexical/lexical-devtools-core/src/generateContent";
import {
  calculateSum,
  getBlockTypeElement,
  getInlineTypeElement,
} from "./utils";
import {
  LexicalNodeType,
  ListItemType,
  ListContainerType,
  BlockElementType,
} from "./types";

export function convertLexicalToBlocks(editor: LexicalEditor): any[] {
  const editorState = editor.getEditorState();

  let newBlockElements: any[] = [];
  let pointers: any[] = [];

  editorState.read(() => {
    visitTree($getRoot(), (node: LexicalNode, indent: Array<string>) => {
      if (isBlockElement(node)) {
        let initBlockElement = getBlockTypeElement(node);
        newBlockElements.push(initBlockElement);
      } else {
        let initInlineElement = getInlineTypeElement(node);
        newBlockElements.push(initInlineElement);
      }
    });
  });

  // use poiter array to push children to parent.
  newBlockElements.forEach((block) => {
    if (block) {
      pointers[block.key as number] = block;
      if (block.parent && block.parent !== "root") {
        pointers[block.parent as number]?.elements.push(block);
      }
    } else {
      // console.log("Undefined Block", block);
    }
  });

  return newBlockElements.filter((block) => block.parent === "root");
}

function isBlockElement(node: LexicalNode): boolean {
  return $isElementNode(node);
}

function isInlineElement(node: LexicalNode): boolean {
  return !isBlockElement(node);
}

function visitBlockTree(currentBlock: any, visitor: (block: any) => void) {
  const childElements = (currentBlock?.elements || []) as any[];
  childElements.forEach((childElement, i) => {
    visitor(childElement);
    if (
      childElement.type &&
      (childElement.type === BlockElementType.RICH_TEXT_SECTION ||
        childElement.type === BlockElementType.RICH_TEXT_QUOTE ||
        childElement.type === BlockElementType.RICH_TEXT_LIST ||
        childElement.type === BlockElementType.RICH_TEXT_PREFORMATTED ||
        childElement.type === BlockElementType.RICH_TEXT_QUOTE ||
        childElement.type === BlockElementType.LINK)
    ) {
      visitBlockTree(childElement, visitor);
    }
  });
}

export function convertBlocksToLexical(blocks: any[]): LexicalNode[] {
  const hugeBlocks = {
    key: "root",
    type: BlockElementType.RICH_TEXT_SECTION,
    elements: [...blocks],
  };
  const nodeObjs: { key: string; parent: string; node: LexicalNode }[] = [];
  let pointers: LexicalNode[] = [];

  visitBlockTree(hugeBlocks, (currentBlock: any) => {
    if (currentBlock.type === BlockElementType.LINK) {
      let linkNode = $createLinkNode(currentBlock.url);
      nodeObjs.push({
        key: currentBlock.key,
        parent: currentBlock.parent,
        node: linkNode,
      });
    } else if (currentBlock.type === BlockElementType.RICH_TEXT_PREFORMATTED) {
      let codeNode = $createCodeNode();
      nodeObjs.push({
        key: currentBlock.key,
        parent: currentBlock.parent,
        node: codeNode,
      });
    } else if (currentBlock.type === BlockElementType.RICH_TEXT_QUOTE) {
      let quoteNode = $createQuoteNode();
      nodeObjs.push({
        key: currentBlock.key,
        parent: currentBlock.parent,
        node: quoteNode,
      });
    } else if (currentBlock.type === BlockElementType.RICH_TEXT_SECTION) {
      if (currentBlock.nodeType === LexicalNodeType.Paragraph) {
        let paragraph = $createParagraphNode();
        nodeObjs.push({
          key: currentBlock.key,
          parent: currentBlock.parent,
          node: paragraph,
        });
      } else if (currentBlock.nodeType === ListItemType.ListItem) {
        let listItemNode = $createListItemNode();
        nodeObjs.push({
          key: currentBlock.key,
          parent: currentBlock.parent,
          node: listItemNode,
        });
      } else if (currentBlock.nodeType === ListItemType.ListItemChecked) {
        let listItemNode = $createListItemNode(true);
        nodeObjs.push({
          key: currentBlock.key,
          parent: currentBlock.parent,
          node: listItemNode,
        });
      } else if (currentBlock.nodeType === ListItemType.ListItemUnchecked) {
        let listItemNode = $createListItemNode(false);
        nodeObjs.push({
          key: currentBlock.key,
          parent: currentBlock.parent,
          node: listItemNode,
        });
      }
    } else if (currentBlock.type === BlockElementType.RICH_TEXT_LIST) {
      let listType: ListType | undefined = undefined;
      if (currentBlock.nodeType === ListContainerType.Ordered) {
        listType = "number";
      } else if (currentBlock.nodeType === ListContainerType.Bullet) {
        listType = "bullet";
      } else if (currentBlock.nodeType === ListContainerType.Check) {
        listType = "check";
      }
      if (listType) {
        let listNode = $createListNode(listType);
        nodeObjs.push({
          key: currentBlock.key,
          parent: currentBlock.parent,
          node: listNode,
        });
      }
    } else if (currentBlock.type === BlockElementType.TEXT) {
      if (currentBlock.text === "\n") {
        let lineBreakNode = $createLineBreakNode();
        nodeObjs.push({
          key: currentBlock.key,
          parent: currentBlock.parent,
          node: lineBreakNode,
        });
      } else {
        let textNode = $createExtendedTextNode(currentBlock.text);
        const convertedFormats = Object.entries(currentBlock.style)
          .filter(([_, value]) => value)
          .map(([key]) => key as TextFormatType);
        const sum = calculateSum(convertedFormats);
        textNode.setFormat(sum);
        nodeObjs.push({
          key: currentBlock.key,
          parent: currentBlock.parent,
          node: textNode,
        });
      }
    }
  });

  // use poiter array to push children to parent.
  nodeObjs.forEach((nodeObj) => {
    pointers[+nodeObj.key] = nodeObj.node;
    if (nodeObj.parent && nodeObj.parent !== "root") {
      let parentNode = pointers[+nodeObj.parent];
      if ($isElementNode(parentNode)) {
        parentNode.append(nodeObj.node);
      }
    }
  });

  return nodeObjs
    .filter((block) => block.parent === "root")
    .map((nodeObj) => nodeObj.node);
}
