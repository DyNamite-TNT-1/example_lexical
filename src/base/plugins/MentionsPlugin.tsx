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
          const anchor = selection.anchor;
          if (anchor.type === "text") {
            const anchorNode = anchor.getNode();
            if (
              anchorNode.isSimpleText() ||
              anchorNode.getType() === "mention"
            ) {
              const selectionOffset = anchor.offset;
              const textContent = anchorNode
                .getTextContent()
                .slice(0, selectionOffset);
              console.log(textContent);
              const atIndex = textContent.lastIndexOf("@");
              if (atIndex > 0 && textContent[atIndex - 1] === " ") {
                const textContentWithoutMention = textContent.slice(0, atIndex);
                anchorNode.setTextContent(textContentWithoutMention);
                selection.insertNodes([
                  $createMentionNode(mention.mentionName, mention.dataId),
                ]);
              }
            }
          }
        }
        return true;
      },
      1
    );
  }, [editor]);

  return null;
}
