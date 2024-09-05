import React, { useCallback, useEffect, useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isRangeSelection,
  SELECTION_CHANGE_COMMAND,
  CAN_UNDO_COMMAND,
  CAN_REDO_COMMAND,
} from "lexical";
import { TOGGLE_LINK_COMMAND } from "@lexical/link";
import {} from "@lexical/selection";
import { mergeRegister } from "@lexical/utils";
import { getSelectedNode, isLinkButNotUnLinked } from "@base/App/helper";
import { LinkInfoType } from "@base/types/link";
import { INSERT_LINK_COMMAND } from "./InsertLinkPlugin";

const LowPriority = 1;

const ToolbarPlugin = () => {
  const [editor] = useLexicalComposerContext();
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isLink, setIsLink] = useState(false);

  const updateToolbar = useCallback(() => {
    // Focus the editor when the effect fires!
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      // Update text format
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));
      setIsStrikethrough(selection.hasFormat("strikethrough"));
      // Update links
      const node = getSelectedNode(selection);
      const parent = node.getParent();
      setIsLink(isLinkButNotUnLinked(parent) || isLinkButNotUnLinked(node));
    }
  }, [editor]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        (_payload, newEditor) => {
          updateToolbar();
          return false;
        },
        LowPriority
      ),
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);
          return false;
        },
        LowPriority
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return false;
        },
        LowPriority
      )
    );
  }, [editor, updateToolbar]);

  const insertLink = useCallback(() => {
    if (!isLink) {
      // let content = "";
      // editor.read(() => {
      //   const selection = $getSelection();
      //   if ($isRangeSelection(selection)) {
      //     content = selection.getTextContent();
      //   }
      // });
      editor.focus();
      let linkInfo: LinkInfoType = {
        url: "www.google.com",
        text: "Google",
      };

      editor.dispatchCommand(INSERT_LINK_COMMAND, linkInfo);
    } else {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
  }, [editor, isLink]);

  return (
    <div className="toolbar">
      <button
        disabled={!canUndo}
        onClick={() => {
          window.undo();
        }}
        className="toolbar-item spaced"
        aria-label="Undo"
      >
        <i className="format undo" />
      </button>
      <button
        disabled={!canRedo}
        onClick={() => {
          window.redo();
        }}
        className="toolbar-item"
        aria-label="Redo"
      >
        <i className="format redo" />
      </button>
      <button
        onClick={() => {
          window.formatBold();
        }}
        className={"toolbar-item spaced " + (isBold ? "active" : "")}
        aria-label="Format Bold"
      >
        <i className="format bold" />
      </button>
      <button
        onClick={() => {
          window.formatItalic();
        }}
        className={"toolbar-item spaced " + (isItalic ? "active" : "")}
        aria-label="Format Italics"
      >
        <i className="format italic" />
      </button>
      <button
        onClick={() => {
          window.formatUnderline();
        }}
        className={"toolbar-item spaced " + (isUnderline ? "active" : "")}
        aria-label="Format Underline"
      >
        <i className="format underline" />
      </button>
      <button
        onClick={() => {
          window.formatStrikeThrough();
        }}
        className={"toolbar-item spaced " + (isStrikethrough ? "active" : "")}
        aria-label="Format Strikethrough"
      >
        <i className="format strikethrough" />
      </button>
      <button
        onClick={insertLink}
        className={"toolbar-item spaced " + (isLink ? "active" : "")}
        aria-label="Insert link"
        title="Insert link"
        type="button"
      >
        <i className="format">Link</i>
      </button>
    </div>
  );
};

export default ToolbarPlugin;
