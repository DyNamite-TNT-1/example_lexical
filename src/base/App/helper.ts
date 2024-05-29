import { $getNearestNodeFromDOMNode, $isDecoratorNode, RangeSelection } from "lexical";
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

export function $isTargetWithinDecorator(target: HTMLElement): boolean {
    const node = $getNearestNodeFromDOMNode(target);
    return $isDecoratorNode(node);
}