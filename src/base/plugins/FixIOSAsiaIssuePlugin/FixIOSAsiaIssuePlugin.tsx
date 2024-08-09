// This plugin is a workaround for utilizing default backspace behavior on iOS Korean keyboards.
// https://github.com/facebook/lexical/pull/4814#issuecomment-2037716048
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getNearestBlockElementAncestorOrThrow } from "@lexical/utils";
import {
  $getNearestNodeFromDOMNode,
  $getSelection,
  $isDecoratorNode,
  $isRangeSelection,
  $isRootNode,
  COMMAND_PRIORITY_CRITICAL,
  KEY_BACKSPACE_COMMAND,
  OUTDENT_CONTENT_COMMAND,
} from "lexical";
import { useEffect } from "react";

// TODO: remove eslint-disables after https://github.com/facebook/lexical/pull/5833 is released
export function FixIOSAsiaIssuePlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(
    () =>
      editor.registerCommand<KeyboardEvent>(
        KEY_BACKSPACE_COMMAND,
        (event) => {
          if ($isTargetWithinDecorator(event.target as HTMLElement)) {
            return false;
          }
          const selection = $getSelection();
          if (!$isRangeSelection(selection)) {
            return false;
          }

          const { anchor } = selection;
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const anchorNode = anchor.getNode();

          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          if (
            selection.isCollapsed() &&
            anchor.offset === 0 &&
            !$isRootNode(anchorNode)
          ) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            const element = $getNearestBlockElementAncestorOrThrow(anchorNode);
            if (element.getIndent() > 0) {
              event.preventDefault();
              return editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined);
            }
          }

          // let the browser handle backspace on iOS Korean keyboards,
          // which clears composing and delete the character w/o composition events
          if (IS_IOS) {
            return true;
          }

          return false;
        },
        COMMAND_PRIORITY_CRITICAL
      ),
    [editor]
  );

  return null;
}

function $isTargetWithinDecorator(target: HTMLElement): boolean {
  const node = $getNearestNodeFromDOMNode(target);
  return $isDecoratorNode(node);
}

// TODO: remove below after https://github.com/facebook/lexical/pull/5831 is released
declare global {
  interface Window {
    MSStream?: unknown;
  }
}

const CAN_USE_DOM: boolean =
  typeof window !== "undefined" &&
  typeof window.document !== "undefined" &&
  typeof window.document.createElement !== "undefined";

const IS_IOS: boolean =
  CAN_USE_DOM &&
  /iPad|iPhone|iPod/.test(navigator.userAgent) &&
  !window.MSStream;
