import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";

import { useCallback } from "react";
import { $getRoot, EditorState, LexicalEditor } from "lexical";

interface MyOnChangePluginProps {
  onChange: (plainText: string) => void;
}

const MyOnChangePlugin = (props: MyOnChangePluginProps) => {
  const { onChange } = props;
  const handleChange = useCallback(
    (editorState: EditorState, editor: LexicalEditor) => {
      editorState.read(() => {
        onChange($getRoot().getTextContent());
      });
    },
    [onChange]
  );

  return <OnChangePlugin onChange={handleChange} />;
};

export default MyOnChangePlugin;
