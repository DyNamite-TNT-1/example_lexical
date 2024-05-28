// third-party
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";

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
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { AutoLinkNode, LinkNode } from "@lexical/link";
// base
import ExampleTheme from "./ExampleTheme";
import "@base/assets/css/app.css";
import AutoLinkPlugin from "@base/plugins/AutoLinkPlugin";
import CodeHighlightPlugin from "@base/plugins/CodeHighlightPlugin";
import ListMaxIndentLevelPlugin from "@base/plugins/ListMaxIndentLevelPlugin";
import MentionsPlugin from "@base/plugins/MentionsPlugin";
import { blockTypeToBlockName, getSelectedNode, tryToPositionRange } from "./helper";
import { MentionNode } from "@base/nodes/MentionNode";
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
    MentionNode,
  ],

  onError(error: Error) {
    throw error;
  },
  theme: ExampleTheme,
};

function AutoFocusPlugin() {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    editor.focus();
  }, [editor]);
  return null;
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

  const $updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
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

  const getCarret = useCallback(() => {
    let top = 0,
      left = 0;
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
        top = rangeDomRect.top;
        left = rangeDomRect.left;
      }
      if (top === 0 && left === 0) {
        const tmpSelection = window.getSelection();
        if (tmpSelection != null) {
          const tmpRange = tmpSelection.getRangeAt(0);

          const tmpSpan = document.createElement("span");
          tmpSpan.setAttribute("data-lexical-text", "true");

          tmpRange.insertNode(tmpSpan);
          const isTmpRangePositioned = tryToPositionRange(
            tmpSelection.anchorOffset,
            tmpRange,
            editorWindow
          );
          if (isTmpRangePositioned !== null) {
            const tmpRangeDomRect = tmpRange.getBoundingClientRect();
            if (
              tmpRangeDomRect.top !== position.top ||
              tmpRangeDomRect.left !== position.left
            ) {
              top = tmpRangeDomRect.top;
              left = tmpRangeDomRect.left;
            }
          }
          tmpSpan.remove();
        }
      }
      if (
        (top !== position.top || left !== position.left) &&
        (top !== 0 || left !== 0)
      )
        setPosition({ top: top, left: left });
    }
  }, [activeEditor, position]);

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      (_payload, newEditor) => {
        $updateToolbar();
        setActiveEditor(newEditor);
        getCarret();
        return false;
      },
      COMMAND_PRIORITY_CRITICAL
    );
  }, [editor, $updateToolbar, getCarret]);

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
      )
    );
  }, [$updateToolbar, activeEditor, editor]);

  useEffect(() => {
    window.NHAN?.onChangeStatusButton?.(JSON.stringify(styleMap));
  }, [styleMap]);

  useEffect(() => {
    console.log(position);
    window.NHAN?.getCarret?.(JSON.stringify(position));
  }, [position]);

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
  const editorRef = useRef(null);

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === editorRef.current) {
          const newHeight = entry.contentRect.height;
          window.NHAN?.updateHeight?.(JSON.stringify({ height: newHeight }));
        }
      }
    });

    if (editorRef.current) {
      resizeObserver.observe(editorRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <>
      <LexicalComposer initialConfig={editorConfig}>
        <AutoFocusPlugin />
        <MyFunctionPlugin />
        <MentionsPlugin />
        <AutoLinkPlugin />
        <RichTextPlugin
          contentEditable={
            <div className="editor-input" ref={editorRef}>
              <ContentEditable />
            </div>
          }
          placeholder={
            <div className="editor-placeholder">Enter some rich text...</div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
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
