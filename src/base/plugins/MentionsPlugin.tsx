import { $createMentionNode } from "@base/nodes/MentionNode";
import { MentionLexicalType } from "@base/types/mention";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  LexicalCommand,
  createCommand,
  $isRangeSelection,
  $createTextNode,
} from "lexical";
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
            if (anchorNode.isSimpleText()) {
              const selectionOffset = anchor.offset;
              const currentText = anchorNode.getTextContent();

              const regex = /(^|\s)(@[\w-]*)(?=\s|$|[^\w\s]|[.,!?;:])/g;
              let match;
              while ((match = regex.exec(currentText)) !== null) {
                const atSymbolIndex = match.index + match[1].length; // Position of '@'
                const endIndex = atSymbolIndex + match[2].length; // End position of the match

                // Check if the cursor is within the matched @ mention pattern
                if (
                  selectionOffset >= atSymbolIndex &&
                  selectionOffset <= endIndex
                ) {
                  // Ensure the cursor is not directly before the first '@'
                  if (selectionOffset === atSymbolIndex) {
                    // Prevent mention if cursor is right before '@'
                    return false;
                  }

                  // Extract the parts before and after the matched text
                  const textBefore = currentText.slice(0, atSymbolIndex);
                  const textAfter = currentText.slice(endIndex);

                  editor.update(() => {
                    // Update the current text node up to the '@' symbol, and select to end it (to prevent warning from Lexical)
                    anchorNode.setTextContent(textBefore).selectEnd();
                    // Create the mention node
                    const mentionNode = $createMentionNode(
                      mention.mentionName,
                      mention.dataId
                    );

                    // Insert the mention node after the current text node, and select to end it
                    anchorNode.insertAfter(mentionNode, true).selectEnd();

                    // If there's remaining text after '@mention', insert it as a new text node
                    if (textAfter) {
                      const textNodeAfter = $createTextNode(textAfter);
                      mentionNode.insertAfter(textNodeAfter, true);
                    }
                  });

                  return true;
                }
              }
            }

            if (anchorNode.getType() === "mention") {
              const selectionOffset = anchor.offset;
              const currentText = anchorNode.getTextContent();
              const textBeforeCursor = currentText.slice(0, selectionOffset);
              const textAfterCursor = currentText.slice(selectionOffset);

              editor.update(() => {
                anchorNode.setTextContent(textBeforeCursor).selectEnd();

                const mentionNode = $createMentionNode(
                  mention.mentionName,
                  mention.dataId
                );
                anchorNode.replace(mentionNode, false).selectEnd();

                if (textAfterCursor) {
                  const textNodeAfter = $createTextNode(textAfterCursor);
                  mentionNode.insertAfter(textNodeAfter, true);
                }
              });
              return true;
            }
          }
        }
        return false;
      },
      1
    );
  }, [editor]);

  return null;
}
