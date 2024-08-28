import { $isElementNode, LexicalNode, RangeSelection } from "lexical";
import { $isLinkNode } from "@lexical/link";

import {
    $isAtNodeEnd,
} from "@lexical/selection";

export const blockTypeToBlockName = {
    bullet: 'Bulleted List',
    check: 'Check List',
    code: 'Code Block',
    h1: 'Heading 1',
    h2: 'Heading 2',
    h3: 'Heading 3',
    h4: 'Heading 4',
    h5: 'Heading 5',
    h6: 'Heading 6',
    number: 'Numbered List',
    paragraph: 'Normal',
    quote: 'Quote',
};

export function getSelectedNode(selection: RangeSelection) {
    const anchor = selection.anchor;
    const focus = selection.focus;
    const anchorNode = selection.anchor.getNode();
    const focusNode = selection.focus.getNode();
    if (anchorNode === focusNode) {
        return anchorNode;
    }
    const isBackward = selection.isBackward();
    if (isBackward) {
        return $isAtNodeEnd(focus) ? anchorNode : focusNode;
    } else {
        return $isAtNodeEnd(anchor) ? focusNode : anchorNode;
    }
}

export function tryToPositionRange(
    leadOffset: number,
    range: Range,
    editorWindow: Window
): boolean {
    const domSelection = editorWindow.getSelection();
    if (domSelection === null || !domSelection.isCollapsed) {
        return false;
    }
    const anchorNode = domSelection.anchorNode;
    const startOffset = leadOffset;
    const endOffset = domSelection.anchorOffset;

    if (anchorNode == null || endOffset == null) {
        return false;
    }

    try {
        range.setStart(anchorNode, startOffset);
        range.setEnd(anchorNode, endOffset);
    } catch (error) {
        return false;
    }

    return true;
}

export function sendMessageToChannel(data: any) {
    if (window.HTMLEditorChannel != undefined) {
        window.HTMLEditorChannel.postMessage(JSON.stringify(data));
    } else {
        if (
            window.webkit &&
            window.webkit.messageHandlers &&
            window.webkit.messageHandlers.HTMLEditorChannel
        ) {
            window.webkit.messageHandlers.HTMLEditorChannel.postMessage({
                message: data,
            });
        }
    }
}

/**
 * To group nodes
 * @param nodes 
 * @returns 
 */
export function groupNodes(nodes: LexicalNode[]): LexicalNode[][] {
    const groups: LexicalNode[][] = [];
    let currentGroup: LexicalNode[] = [];
    for (let i = 0; i < nodes.length; i++) {
        const curNode = nodes[i];
        const isNeedWrap = !($isElementNode(curNode) && !$isLinkNode(curNode));
        if (currentGroup.length === 0 || (isNeedWrap && !($isElementNode(currentGroup[0]) && !$isLinkNode(currentGroup[0])))) {
            currentGroup.push(curNode);
        } else {
            groups.push(currentGroup);
            currentGroup = [curNode];
        }
    }

    if (currentGroup.length > 0) {
        groups.push(currentGroup);
    }

    return groups;
}

const SUPPORTED_URL_PROTOCOLS = new Set([
  'http:',
  'https:',
  'mailto:',
  'sms:',
  'tel:',
]);

export function sanitizeUrl(url: string): string {
  try {
    const parsedUrl = new URL(url);
    // eslint-disable-next-line no-script-url
    if (!SUPPORTED_URL_PROTOCOLS.has(parsedUrl.protocol)) {
      return 'about:blank';
    }
  } catch {
    return url;
  }
  return url;
}

// Source: https://stackoverflow.com/a/8234912/2013580
const urlRegExp = new RegExp(
  /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=+$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=+$,\w]+@)[A-Za-z0-9.-]+)((?:\/[+~%/.\w-_]*)?\??(?:[-+=&;%@.\w_]*)#?(?:[\w]*))?)/
);
export function validateUrl(url: string): boolean {
  // TODO Fix UI for link insertion; it should never default to an invalid URL such as https://.
  // Maybe show a dialog where they user can type the URL before inserting it.
  return url === 'https://' || urlRegExp.test(url);
}