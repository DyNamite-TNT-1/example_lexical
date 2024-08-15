export enum ListContainerType {
  Ordered = "ordered",
  Bullet = "bullet",
  Check = "check",
}

export enum ListItemType {
  ListItem = "listitem",
  ListItemChecked = "listitem-checked",
  ListItemUnchecked = "listitem-unchecked",
}

export enum LexicalNodeType {
  Paragraph = "paragraph",
}

export enum BlockElementType {
  RICH_TEXT_SECTION = "RICH_TEXT_SECTION", //rich_text_section
  RICH_TEXT_LIST = "RICH_TEXT_LIST", //rich_text_list
  RICH_TEXT_PREFORMATTED = "RICH_TEXT_PREFORMATTED", //rich_text_preformatted
  RICH_TEXT_QUOTE = "RICH_TEXT_QUOTE", //rich_text_quote
  LINK = "LINK",
  USER = "USER",
  CHANNEL = "CHANNEL",
  TEXT = "TEXT",
}