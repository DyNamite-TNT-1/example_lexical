/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import * as React from "react";

import { usePlainTextSetup } from "@base/clone_lexical/react/shared/usePlainTextSetup";
import { useCanShowPlaceholder } from "@base/clone_lexical/react/shared/useCanShowPlaceHolder";
import {
  ErrorBoundaryType,
  useDecorators,
} from "@base/clone_lexical/react/shared/useDecorators";
import useLexicalEditable from "@base/clone_lexical/react/useLexicalEditable";

export function PlainTextPlugin({
  contentEditable,
  placeholder,
  ErrorBoundary,
}: {
  contentEditable: JSX.Element;
  placeholder:
    | ((isEditable: boolean) => null | JSX.Element)
    | null
    | JSX.Element;
  ErrorBoundary: ErrorBoundaryType;
}): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const decorators = useDecorators(editor, ErrorBoundary);
  usePlainTextSetup(editor);

  return (
    <>
      {contentEditable}
      <Placeholder content={placeholder} />
      {decorators}
    </>
  );
}

function Placeholder({
  content,
}: {
  content: ((isEditable: boolean) => null | JSX.Element) | null | JSX.Element;
}): null | JSX.Element {
  const [editor] = useLexicalComposerContext();
  const showPlaceholder = useCanShowPlaceholder(editor);
  const editable = useLexicalEditable();

  if (!showPlaceholder) {
    return null;
  }

  if (typeof content === "function") {
    return content(editable);
  } else {
    return content;
  }
}
