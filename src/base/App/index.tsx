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
import { useCallback, useEffect, useState } from "react";
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
import { blockTypeToBlockName, getSelectedNode } from "./helper";
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
    onChangeStatusButton: ({}) => void;
  }
}

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
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [blockType, setBlockType] = useState("paragraph");
  const [selectedElementKey, setSelectedElementKey] = useState<string | null>(
    null
  );

  const [codeLanguage, setCodeLanguage] = useState("");
  const [isRTL, setIsRTL] = useState(false);
  const [elementFormat, setElementFormat] = useState<ElementFormatType>("left");
  const [isLink, setIsLink] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isSubscript, setIsSubscript] = useState(false);
  const [isSuperscript, setIsSuperscript] = useState(false);
  const [isCode, setIsCode] = useState(false);

  const $updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
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
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));
      setIsStrikethrough(selection.hasFormat("strikethrough"));
      setIsSubscript(selection.hasFormat("subscript"));
      setIsSuperscript(selection.hasFormat("superscript"));
      setIsCode(selection.hasFormat("code"));
      setIsRTL($isParentElementRTL(selection));

      // Update links
      const node = getSelectedNode(selection);
      const parent = node.getParent();
      if ($isLinkNode(parent) || $isLinkNode(node)) {
        setIsLink(true);
      } else {
        setIsLink(false);
      }

      if (elementDOM !== null) {
        setSelectedElementKey(elementKey);
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType<ListNode>(
            anchorNode,
            ListNode
          );
          const type = parentList
            ? parentList.getListType()
            : element.getListType();
          setBlockType(type);
        } else {
          const type = $isHeadingNode(element)
            ? element.getTag()
            : element.getType();
          if (type in blockTypeToBlockName) {
            setBlockType(type as keyof typeof blockTypeToBlockName);
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
      setElementFormat(
        $isElementNode(matchingParent)
          ? matchingParent.getFormatType()
          : $isElementNode(node)
            ? node.getFormatType()
            : parent?.getFormatType() || "left"
      );
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
          setCanUndo(payload);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL
      ),
      activeEditor.registerCommand<boolean>(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL
      )
    );
  }, [$updateToolbar, activeEditor, editor]);

  useEffect(() => {
    window.onChangeStatusButton(
      JSON.stringify({
        isRTL,
        isLink,
        isBold,
        isItalic,
        isUnderline,
        isStrikethrough,
        isCode,
        canUndo,
        canRedo,
        blockType,
        elementFormat,
      })
    );
  }, [
    isRTL,
    isLink,
    isBold,
    isItalic,
    isUnderline,
    isStrikethrough,
    isCode,
    canUndo,
    canRedo,
    blockType,
    elementFormat,
  ]);

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
    if (blockType !== headingSize) {
      editor.update(() => {
        const selection = $getSelection();
        $setBlocksType(selection, () => $createHeadingNode(headingSize));
      });
    }
  };

  window.formatBulletList = () => {
    console.log(blockType);
    if (blockType !== "bullet") {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    } else {
      window.formatParagraph();
    }
  };

  window.formatNumberedList = () => {
    if (blockType !== "number") {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    } else {
      window.formatParagraph();
    }
  };

  window.formatQuote = () => {
    if (blockType !== "quote") {
      editor.update(() => {
        const selection = $getSelection();

        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createQuoteNode());
        }
      });
    }
  };

  window.formatCodeBlock = () => {
    if (blockType !== "code") {
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

  window.onChangeStatusButton = function (map: any) {
    console.log(JSON.parse(map));
  };

  return null;
}

export default function App() {
  return (
    <LexicalComposer initialConfig={editorConfig}>
      <MyFunctionPlugin />
      <AutoLinkPlugin />
      <RichTextPlugin
        contentEditable={<ContentEditable className="editor-input" />}
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
      {/* <TreeViewPlugin /> This plugin to use when debugging*/}
      <AutoFocusPlugin />
    </LexicalComposer>
  );
}
