import { convertBlocksToLexical } from "@base/converter/converter";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { LexicalCommand, createCommand, $getRoot } from "lexical";
import React from "react";

export const INSERT_BLOCKS_COMMAND: LexicalCommand<any[]> = createCommand(
  "INSERT_BLOCKS_COMMAND"
);

export function InsertBlocksPlugin() {
  const [editor] = useLexicalComposerContext();

  React.useEffect(() => {
    return editor.registerCommand(
      INSERT_BLOCKS_COMMAND,
      (blocks) => {
        editor.update(() => {
          const root = $getRoot();
          root.clear();
          if(blocks) {
            const nodes = convertBlocksToLexical(blocks);
            nodes.forEach((node) => {
                root.append(node);
            })
          }
        })
        return true;
      },
      1
    );
  }, [editor]);

  return null;
}
