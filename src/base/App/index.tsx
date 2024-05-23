import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";

import ExampleTheme from "./ExampleTheme";
import "@base/assets/css/app.css";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  FORMAT_TEXT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  INDENT_CONTENT_COMMAND,
  OUTDENT_CONTENT_COMMAND,
  EditorState,
  $getRoot,
  $getSelection,
  $isRangeSelection,
} from "lexical";
import { useEffect } from "react";
import TreeViewPlugin from "@base/plugins/TreeViewPlugin";
import ToolbarPlugin from "@base/plugins/ToolbarPlugin";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { ListItemNode, ListNode } from "@lexical/list";
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { analyzeSumOfConstants } from "./helper";

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


function onChange(editorState: EditorState) {
  editorState.read(() => {
    const selection = $getSelection();
    console.log(selection);
    if ($isRangeSelection(selection)) {
      if (selection.format !== 0) analyzeSumOfConstants(selection.format);
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

  return null;
}

export default function App() {
  return (
    <div className="App">
      <LexicalComposer initialConfig={editorConfig}>
        <div className="editor-container">
          <MyFunctionPlugin />
          <ToolbarPlugin />
          <div className="editor-inner">
            <RichTextPlugin
              contentEditable={<ContentEditable className="editor-input" />}
              placeholder={
                <div className="editor-placeholder">
                  Enter some rich text...
                </div>
              }
              ErrorBoundary={LexicalErrorBoundary}
            />
            <OnChangePlugin onChange={onChange} />
            {/* History Plugin is necessary if want to have undo, redo*/}
            <HistoryPlugin />
            <TreeViewPlugin />
            <AutoFocusPlugin />
          </div>
        </div>
      </LexicalComposer>
    </div>
  );
}
