import { QuoteNode } from "@lexical/rich-text";
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { TextNode } from "lexical";
import { ListNode, ListItemNode } from "@lexical/list";
import { MentionNode } from "@base/nodes/MentionNode";
import { ExtendedTextNode } from "@base/nodes/ExtendedTextNode";
import { EmojiNode } from "@base/nodes/EmojiNode";

const configTheme = {
  code: "editor-code",
  link: "editor-link",
  list: {
    checklist: "PlaygroundEditorTheme__checklist",
    listitem: "PlaygroundEditorTheme__listItem",
    listitemChecked: "PlaygroundEditorTheme__listItemChecked",
    listitemUnchecked: "PlaygroundEditorTheme__listItemUnchecked",
    nested: {
      listitem: "PlaygroundEditorTheme__nestedListItem",
    },
    olDepth: [
      "PlaygroundEditorTheme__ol1",
      "PlaygroundEditorTheme__ol2",
      "PlaygroundEditorTheme__ol3",
      "PlaygroundEditorTheme__ol4",
      "PlaygroundEditorTheme__ol5",
    ],
    ul: "PlaygroundEditorTheme__ul",
  },
  ltr: "ltr",
  paragraph: "editor-paragraph",
  placeholder: "editor-placeholder",
  quote: "editor-quote",
  rtl: "rtl",
  text: {
    bold: "editor-text-bold",
    code: "editor-text-code",
    hashtag: "editor-text-hashtag",
    italic: "editor-text-italic",
    overflowed: "editor-text-overflowed",
    strikethrough: "editor-text-strikethrough",
    underline: "editor-text-underline",
    underlineStrikethrough: "editor-text-underlineStrikethrough",
  },
  mention: "mention",
};

const editorConfig = {
  namespace: "TeamChannel",
  // NOTICE: Be sure Mention Node stands HIGHER than Link Node
  nodes: [
    MentionNode,
    ExtendedTextNode,
    {
      replace: TextNode,
      with: (node: TextNode) => new ExtendedTextNode(node.__text),
    },
    ListNode,
    ListItemNode,
    QuoteNode,
    CodeNode,
    CodeHighlightNode,
    AutoLinkNode,
    LinkNode,
    EmojiNode,
  ],

  onError(error: Error) {
    throw error;
  },
  theme: configTheme,
};

export default editorConfig;
