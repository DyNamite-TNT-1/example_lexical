import { LinkInfoType } from "@base/types/link";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  LexicalCommand,
  createCommand,
  $getRoot,
  $getSelection,
  $isRangeSelection,
  $insertNodes,
} from "lexical";
import { $createLinkNode, $isAutoLinkNode } from "@lexical/link";
import React from "react";
import { sanitizeUrl } from "@base/App/helper";
import { $createExtendedTextNode } from "@base/nodes/ExtendedTextNode";

export const INSERT_LINK_COMMAND: LexicalCommand<LinkInfoType> = createCommand(
  "INSERT_LINK_COMMAND"
);

export function InsertLinkPlugin() {
  const [editor] = useLexicalComposerContext();

  React.useEffect(() => {
    return editor.registerCommand(
      INSERT_LINK_COMMAND,
      (link) => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) {
          return false;
        }

        /// Find & remove autolink before insert link
        const nodes = selection.extract();
        nodes.forEach((node) => {
          const parent = node.getParent();
          if ($isAutoLinkNode(parent)) {
            const children = parent.getChildren();
            for (let i = 0; i < children.length; i++) {
              parent.insertBefore(children[i]);
            }
            parent.remove();
          }
        });
        /// Insert link
        const linkNode = $createLinkNode(sanitizeUrl(link.url)).append(
          $createExtendedTextNode(link.text ?? link.url)
        );
        $insertNodes([linkNode]);
        return true;
      },
      1
    );
  }, [editor]);

  return null;
}
