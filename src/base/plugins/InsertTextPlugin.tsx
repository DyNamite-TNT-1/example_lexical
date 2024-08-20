import { $createExtendedTextNode } from "@base/nodes/ExtendedTextNode";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { LexicalCommand, createCommand, $isRangeSelection } from "lexical";
import React from "react";

export const INSERT_TEXT_COMMAND: LexicalCommand<string> = createCommand(
  "INSERT_TEXT_COMMAND"
);

export function InsertTextPlugin() {
  const [editor] = useLexicalComposerContext();

  React.useEffect(() => {
    return editor.registerCommand(
      INSERT_TEXT_COMMAND,
      (text) => {
        const selection = editor.getEditorState()._selection;
        if ($isRangeSelection(selection)) {
          selection.insertNodes([$createExtendedTextNode(text)]);
        }
        return true;
      },
      1
    );
  }, [editor]);

  return null;
}
