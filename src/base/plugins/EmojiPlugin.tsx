import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { LexicalCommand, createCommand, $isRangeSelection } from "lexical";
import React from "react";
import { $createEmojiNode } from "../nodes/EmojiNode";
import { EmojiLexicalType } from "@base/types/emoji";

export const ADD_EMOJI_COMMAND: LexicalCommand<EmojiLexicalType> =
  createCommand("ADD_EMOJI_COMMAND");

export function EmojiPlugin() {
  const [editor] = useLexicalComposerContext();

  React.useEffect(() => {
    return editor.registerCommand(
      ADD_EMOJI_COMMAND,
      (emoji) => {
        const selection = editor.getEditorState()._selection;
        if ($isRangeSelection(selection)) {
          selection.insertNodes([
            $createEmojiNode(emoji.content, emoji.unifiedId),
          ]);
        }
        return true;
      },
      1
    );
  }, [editor]);

  return null;
}
