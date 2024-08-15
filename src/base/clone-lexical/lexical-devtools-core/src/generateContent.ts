import { ElementNode, LexicalNode, $isElementNode } from "lexical";

const SYMBOLS: Record<string, string> = Object.freeze({
  ancestorHasNextSibling: "|",
  ancestorIsLastChild: " ",
  hasNextSibling: "├",
  isLastChild: "└",
  selectedChar: "^",
  selectedLine: ">",
});

export function visitTree(
  currentNode: ElementNode,
  visitor: (node: LexicalNode, indentArr: Array<string>) => void,
  indent: Array<string> = []
) {
  const childNodes = currentNode.getChildren();
  const childNodesLength = childNodes.length;

  childNodes.forEach((childNode, i) => {
    visitor(
      childNode,
      indent.concat(
        i === childNodesLength - 1
          ? SYMBOLS.isLastChild
          : SYMBOLS.hasNextSibling
      )
    );

    if ($isElementNode(childNode)) {
      visitTree(
        childNode,
        visitor,
        indent.concat(
          i === childNodesLength - 1
            ? SYMBOLS.ancestorIsLastChild
            : SYMBOLS.ancestorHasNextSibling
        )
      );
    }
  });
}
