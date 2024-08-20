import { $createMentionNode } from "@base/nodes/MentionNode";
import { MentionLexicalType } from "@base/types/mention";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { LexicalCommand, createCommand, $isRangeSelection } from "lexical";
import React from "react";

export const ADD_MENTION_COMMAND: LexicalCommand<MentionLexicalType> =
  createCommand("ADD_MENTION_COMMAND");

export function MentionsPlugin() {
  const [editor] = useLexicalComposerContext();

  React.useEffect(() => {
    return editor.registerCommand(
      ADD_MENTION_COMMAND,
      (mention) => {
        const selection = editor.getEditorState()._selection;
        if ($isRangeSelection(selection)) {
          selection.insertNodes([
            $createMentionNode(mention.mentionName, mention.dataId),
            // $createExtendedTextNode(mention.mentionName),
          ]);
        }
        return true;
      },
      1
    );
  }, [editor]);

  return null;
}
