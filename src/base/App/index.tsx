// third-party
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getNearestNodeOfType,
  $findMatchingParent,
  mergeRegister,
} from "@lexical/utils";
import {
  FORMAT_TEXT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  INDENT_CONTENT_COMMAND,
  OUTDENT_CONTENT_COMMAND,
  $getSelection,
  $isRangeSelection,
  $isRootOrShadowRoot,
  $createParagraphNode,
  SELECTION_CHANGE_COMMAND,
  CAN_UNDO_COMMAND,
  CAN_REDO_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  COMMAND_PRIORITY_NORMAL,
  ElementFormatType,
  $isElementNode,
  LexicalNode,
  KEY_ENTER_COMMAND,
  EditorState,
  LexicalEditor,
  $getRoot,
} from "lexical";
import { $isParentElementRTL, $setBlocksType } from "@lexical/selection";
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
  HeadingTagType,
} from "@lexical/rich-text";
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  $isListNode,
  ListNode,
  ListItemNode,
} from "@lexical/list";
import { $createCodeNode } from "@lexical/code";
import { $isLinkNode } from "@lexical/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { AutoLinkNode, LinkNode } from "@lexical/link";
// base
import ExampleTheme from "./ExampleTheme";
import "@base/assets/css/app.css";
import AutoLinkPlugin from "@base/plugins/AutoLinkPlugin";
import TreeViewPlugin from "@base/plugins/TreeViewPlugin";
import ToolbarPlugin from "@base/plugins/ToolbarPlugin";
import CodeHighlightPlugin from "@base/plugins/CodeHighlightPlugin";
import ListMaxIndentLevelPlugin from "@base/plugins/ListMaxIndentLevelPlugin";
import MentionsPlugin from "@base/plugins/MentionsPlugin";
import { blockTypeToBlockName, getSelectedNode } from "./helper";
import ContextMenuPlugin from "@base/plugins/ContextMenuPlugin";
import React from "react";
import { MenuResolution } from "@lexical/react/shared/LexicalMenu";
import { HTMLEditorJavascriptInterface } from "./type";
const editorConfig = {
  namespace: "React.js Demo",
  nodes: [
    HeadingNode,
    ListNode,
    ListItemNode,
    QuoteNode,
    CodeNode,
    CodeHighlightNode,
    TableNode,
    TableCellNode,
    TableRowNode,
    AutoLinkNode,
    LinkNode,
  ],
  // Handling of errors during update
  onError(error: Error) {
    throw error;
  },
  // The editor theme
  theme: ExampleTheme,
};

function onChange(editorState: EditorState, editor: LexicalEditor) {
  editor.update(() => {
    const root = $getRoot();
    const isRootTextContentEmpty =
      editor.isComposing() === false && root.getTextContent() === "";
    console.log(isRootTextContentEmpty);
    if (isRootTextContentEmpty) {
      return;
    }
    const selection = $getSelection();

    if ($isRangeSelection(selection)) {
      const domSelection = (editor._window || window).getSelection();
      if (domSelection === null || !domSelection.isCollapsed) {
        return;
      }
      const anchorNode = domSelection.anchorNode;
      if (anchorNode === null) {
        return;
      }
      if (anchorNode.nodeType !== Node.TEXT_NODE) {
        selection.insertText("\n");
      }
    }
  });
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
    insert: () => void;
  }
}

function AutoFocusPlugin() {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    editor.focus();
  }, [editor]);
  return null;
}

function tryToPositionRange(
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

  // if (anchorNode.nodeType !== Node.TEXT_NODE) {
  //   var tempRange = domSelection.getRangeAt(0);
  //   tempRange.insertNode(document.createElement("span"));
  // } else {
  try {
    range.setStart(anchorNode, startOffset);
    range.setEnd(anchorNode, endOffset);
  } catch (error) {
    return false;
  }
  // }

  return true;
}

function MyFunctionPlugin() {
  const [editor] = useLexicalComposerContext();
  const [activeEditor, setActiveEditor] = useState(editor);
  const [selectedElementKey, setSelectedElementKey] = useState<string | null>(
    null
  );

  const [styleMap, setStyleMap] = useState<{
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
  }>({
    isRTL: false,
    isLink: false,
    isBold: false,
    isItalic: false,
    isUnderline: false,
    isStrikethrough: false,
    isCode: false,
    canUndo: false,
    canRedo: false,
    blockType: "paragraph",
    elementFormat: "left",
  });
  const [position, setPosition] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });

  useEffect(() => {
    console.log(position);
  }, [position]);

  window.insert = function () {
    insert();
  };

  const insert = function () {
    // editor.update(() => {
    //   const selection = $getSelection();

    //   if ($isRangeSelection(selection)) {
    //     selection.insertText("\n");
    //   }
    // Get the current selection
    const selection = window.getSelection();

    if (selection != null && selection.rangeCount > 0) {
      // Get the range of the current selection
      const range = selection.getRangeAt(0);

      // Create a new <span> element
      const span = document.createElement("span");

      range.insertNode(span);
      setPosition({ top: span.offsetTop, left: span.offsetLeft });
      // console.log(
      //   span.offsetTop + window.scrollY,
      //   span.offsetLeft + window.scrollX
      // );
      span.remove();
    }
    // });
  };

  const $updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const editorWindow = editor._window || window;
      const range = editorWindow.document.createRange();
      const isRangePositioned = tryToPositionRange(
        selection.anchor.offset,
        range,
        editorWindow
      );
      if (isRangePositioned !== null) {
        const rangeDomRect = range.getBoundingClientRect();
        if (rangeDomRect.top !== 0 || rangeDomRect.left !== 0) {
          setPosition({ top: rangeDomRect.top, left: rangeDomRect.left });
        } else {
          // insert();
        }
      }

      //
      const anchorNode = selection.anchor.getNode();
      let element =
        anchorNode.getKey() === "root"
          ? anchorNode
          : $findMatchingParent(anchorNode, (e) => {
              const parent = e.getParent();
              return parent !== null && $isRootOrShadowRoot(parent);
            });

      if (element === null) {
        element = anchorNode.getTopLevelElementOrThrow();
      }

      const elementKey = element.getKey();
      const elementDOM = activeEditor.getElementByKey(elementKey);
      // Update text format
      setStyleMap({
        ...styleMap,
        isRTL: $isParentElementRTL(selection),
        isBold: selection.hasFormat("bold"),
        isItalic: selection.hasFormat("italic"),
        isUnderline: selection.hasFormat("underline"),
        isStrikethrough: selection.hasFormat("strikethrough"),
        isCode: selection.hasFormat("code"),
      });

      // Update links
      const node = getSelectedNode(selection);
      const parent = node.getParent();
      setStyleMap({
        ...styleMap,
        isLink: $isLinkNode(parent) || $isLinkNode(node),
      });

      if (elementDOM !== null) {
        // console.log("cursor", elementDOM.getBoundingClientRect());
        setSelectedElementKey(elementKey);
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType<ListNode>(
            anchorNode,
            ListNode
          );
          const type = parentList
            ? parentList.getListType()
            : element.getListType();
          setStyleMap({
            ...styleMap,
            blockType: type,
          });
        } else {
          const type = $isHeadingNode(element)
            ? element.getTag()
            : element.getType();
          if (type in blockTypeToBlockName) {
            setStyleMap({
              ...styleMap,
              blockType: type as keyof typeof blockTypeToBlockName,
            });
          }
          // if ($isCodeNode(element)) {
          //   const language =
          //     element.getLanguage() as keyof typeof CODE_LANGUAGE_MAP;
          //   setCodeLanguage(
          //     language ? CODE_LANGUAGE_MAP[language] || language : ""
          //   );
          //   return;
          // }
        }
      }
      let matchingParent;
      if ($isLinkNode(parent)) {
        // If node is a link, we need to fetch the parent paragraph node to set format
        matchingParent = $findMatchingParent(
          node,
          (parentNode) => $isElementNode(parentNode) && !parentNode.isInline()
        );
      }
      setStyleMap({
        ...styleMap,
        elementFormat: $isElementNode(matchingParent)
          ? matchingParent.getFormatType()
          : $isElementNode(node)
            ? node.getFormatType()
            : parent?.getFormatType() || "left",
      });
    }
  }, [activeEditor]);

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      (_payload, newEditor) => {
        $updateToolbar();
        setActiveEditor(newEditor);
        return false;
      },
      COMMAND_PRIORITY_CRITICAL
    );
  }, [editor, $updateToolbar]);

  useEffect(() => {
    return mergeRegister(
      activeEditor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          $updateToolbar();
        });
      }),
      activeEditor.registerCommand<boolean>(
        CAN_UNDO_COMMAND,
        (payload) => {
          setStyleMap({
            ...styleMap,
            canUndo: payload,
          });
          return false;
        },
        COMMAND_PRIORITY_CRITICAL
      ),
      activeEditor.registerCommand<boolean>(
        CAN_REDO_COMMAND,
        (payload) => {
          setStyleMap({
            ...styleMap,
            canRedo: payload,
          });
          return false;
        },
        COMMAND_PRIORITY_CRITICAL
      ),
      activeEditor.registerCommand(
        KEY_ENTER_COMMAND,
        (event: KeyboardEvent | null) => {
          // insert();
          return true;
        },
        COMMAND_PRIORITY_CRITICAL
      )
    );
  }, [$updateToolbar, activeEditor, editor]);

  useEffect(() => {
    window.NHAN?.onChangeStatusButton?.(JSON.stringify(styleMap));
  }, [styleMap]);

  window.undo = function () {
    editor.dispatchCommand(UNDO_COMMAND, undefined);
  };

  window.redo = function () {
    editor.dispatchCommand(REDO_COMMAND, undefined);
  };

  window.formatBold = function () {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
  };

  window.formatItalic = function () {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
  };

  window.formatUnderline = function () {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
  };

  window.formatStrikeThrough = function () {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough");
  };

  window.formatCodeInline = function () {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code");
  };

  window.indent = function () {
    editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined);
  };

  window.outdent = function () {
    editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined);
  };

  window.alignLeft = function () {
    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left");
  };

  window.alignCenter = function () {
    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center");
  };

  window.alignRight = function () {
    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right");
  };

  window.alignJustify = function () {
    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify");
  };

  window.formatParagraph = function () {
    editor.update(() => {
      const selection = $getSelection();

      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createParagraphNode());
      }
    });
  };

  window.formatHeading = (headingSize: HeadingTagType) => {
    if (styleMap.blockType !== headingSize) {
      editor.update(() => {
        const selection = $getSelection();
        $setBlocksType(selection, () => $createHeadingNode(headingSize));
      });
    }
  };

  window.formatBulletList = () => {
    if (styleMap.blockType !== "bullet") {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    } else {
      window.formatParagraph();
    }
  };

  window.formatNumberedList = () => {
    if (styleMap.blockType !== "number") {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    } else {
      window.formatParagraph();
    }
  };

  window.formatQuote = () => {
    if (styleMap.blockType !== "quote") {
      editor.update(() => {
        const selection = $getSelection();

        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createQuoteNode());
        }
      });
    }
  };

  window.formatCodeBlock = () => {
    if (styleMap.blockType !== "code") {
      editor.update(() => {
        let selection = $getSelection();

        if (selection !== null) {
          if (selection.isCollapsed()) {
            $setBlocksType(selection, () => $createCodeNode());
          } else {
            const textContent = selection.getTextContent();
            const codeNode = $createCodeNode();
            selection.insertNodes([codeNode]);
            selection = $getSelection();
            if ($isRangeSelection(selection)) {
              selection.insertRawText(textContent);
            }
          }
        }
      });
    }
  };

  return null;
}

export default function App() {
  return (
    <>
      <LexicalComposer initialConfig={editorConfig}>
        <AutoFocusPlugin />
        <MyFunctionPlugin />
        <MentionsPlugin />
        <AutoLinkPlugin />
        <RichTextPlugin
          contentEditable={<ContentEditable className="editor-input" />}
          placeholder={
            <div className="editor-placeholder">Enter some rich text...</div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        {/* <OnChangePlugin onChange={onChange} /> */}
        {/* History Plugin is necessary if want to have undo, redo*/}
        <HistoryPlugin />
        <LinkPlugin />
        {/* ListPlugin is necessary for numbered list, bullet list */}
        <ListPlugin />
        {/* CodeHighlightPlugin is necessary for code block */}
        <CodeHighlightPlugin />
        <ListMaxIndentLevelPlugin maxDepth={7} />
        {/* <ContextMenuPlugin /> */}
        {/* <TreeViewPlugin /> This plugin to use when debugging*/}
      </LexicalComposer>
    </>
  );
}
