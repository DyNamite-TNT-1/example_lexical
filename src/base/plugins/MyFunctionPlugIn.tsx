import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getNearestNodeOfType,
  $findMatchingParent,
  mergeRegister,
} from "@lexical/utils";
import {
  FORMAT_TEXT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  INDENT_CONTENT_COMMAND,
  OUTDENT_CONTENT_COMMAND,
  $getSelection,
  $isRangeSelection,
  $isRootOrShadowRoot,
  $createParagraphNode,
  SELECTION_CHANGE_COMMAND,
  CAN_UNDO_COMMAND,
  CAN_REDO_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  ElementFormatType,
  $isElementNode,
  $getRoot,
} from "lexical";
import {
  $isParentElementRTL,
  $setBlocksType,
  $patchStyleText,
  $getSelectionStyleValueForProperty,
} from "@lexical/selection";
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
  HeadingTagType,
} from "@lexical/rich-text";
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_CHECK_LIST_COMMAND,
  $isListNode,
  ListNode,
} from "@lexical/list";
import { $createCodeNode } from "@lexical/code";
import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { $generateNodesFromDOM, $generateHtmlFromNodes } from "@lexical/html";
import { Base64 } from "js-base64";
import { ADD_MENTION_COMMAND } from "@base/plugins/MentionsPlugin";
import {
  blockTypeToBlockName,
  getSelectedNode,
  groupNodes,
  isLinkButNotUnLinked,
  sendMessageToChannel,
  tryToPositionRange,
} from "../App/helper";
import { convertLexicalToBlocks } from "@base/converter/converter";
import { MentionLexicalType } from "@base/types/mention";
import { INSERT_TEXT_COMMAND } from "@base/plugins/InsertTextPlugin";
import { StyleMapType } from "../App/type";
import { INSERT_BLOCKS_COMMAND } from "@base/plugins/InsertBlockPlugin";
import { EmojiLexicalType } from "@base/types/emoji";
import { ADD_EMOJI_COMMAND } from "./EmojiPlugin";
import { INSERT_LINK_COMMAND } from "./InsertLinkPlugin";
import { LinkInfoType } from "@base/types/link";

export function AutoFocusPlugin() {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    editor.focus();
  }, [editor]);
  return null;
}

export function MyFunctionPlugin() {
  const [editor] = useLexicalComposerContext();
  const [activeEditor, setActiveEditor] = useState(editor);
  const [selectedElementKey, setSelectedElementKey] = useState<string | null>(
    null
  );

  const [textColor, setTextColor] = useState<string>("");
  const [bgColor, setBgColor] = useState<string>("");
  const [fontSize, setFontSize] = useState<string>("");
  const [fontFamily, setFontFamily] = useState<string>("");

  const canSubmitRef = useRef<boolean>(false);

  const styleMapRef = useRef<StyleMapType>({
    isRTL: false,
    isLink: false,
    isBold: false,
    isItalic: false,
    isUnderline: false,
    isStrikethrough: false,
    isCode: false,
    canUndo: false,
    canRedo: false,
    blockType: "paragraph",
    elementFormat: "left",
  });

  const position = useRef<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });

  const cursorData = useRef<{ text: string; position: number; type: string }>({
    text: "",
    position: -1,
    type: "",
  });

  const $updateCanSubmit = useCallback(() => {
    activeEditor.getEditorState().read(() => {
      const root = $getRoot();
      const isNotEmpty = root.getTextContent().trim().length > 0;
      if (isNotEmpty !== canSubmitRef.current) {
        // console.log(isNotEmpty);
        canSubmitRef.current = isNotEmpty;
        //To Android
        window.NHAN?.onChangeCanSubmit?.({ canSubmit: isNotEmpty });
        // To IOS || Flutter
        sendMessageToChannel({
          action: "onChangeCanSubmit",
          data: { canSubmit: isNotEmpty },
        });
      }
    });
  }, [activeEditor]);

  const $updateToolbar = useCallback(() => {
    const selection = $getSelection();

    if ($isRangeSelection(selection)) {
      let isRTL = false;
      let isLink = false;
      let isBold = false;
      let isItalic = false;
      let isUnderline = false;
      let isStrikethrough = false;
      let isCode = false;
      let blockType = "paragraph";
      let elementFormat: ElementFormatType = "left";

      //
      const anchorNode = selection.anchor.getNode();
      let element =
        anchorNode.getKey() === "root"
          ? anchorNode
          : $findMatchingParent(anchorNode, (e) => {
              const parent = e.getParent();
              return parent !== null && $isRootOrShadowRoot(parent);
            });

      if (element === null) {
        element = anchorNode.getTopLevelElementOrThrow();
      }

      const elementKey = element.getKey();
      const elementDOM = activeEditor.getElementByKey(elementKey);
      // Update text format
      isRTL = $isParentElementRTL(selection);
      isBold = selection.hasFormat("bold");
      isItalic = selection.hasFormat("italic");
      isUnderline = selection.hasFormat("underline");
      isStrikethrough = selection.hasFormat("strikethrough");
      isCode = selection.hasFormat("code");
      // Update links
      const node = getSelectedNode(selection);
      const parent = node.getParent();
      isLink = isLinkButNotUnLinked(parent) || isLinkButNotUnLinked(node);
      //
      if (elementDOM !== null) {
        setSelectedElementKey(elementKey);
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType<ListNode>(
            anchorNode,
            ListNode
          );
          const type = parentList
            ? parentList.getListType()
            : element.getListType();
          blockType = type;
        } else {
          const type = $isHeadingNode(element)
            ? element.getTag()
            : element.getType();
          if (type in blockTypeToBlockName) {
            blockType = type;
          }
        }
      }

      setTextColor($getSelectionStyleValueForProperty(selection, "color"));
      setBgColor(
        $getSelectionStyleValueForProperty(selection, "background-color")
      );
      setFontFamily(
        $getSelectionStyleValueForProperty(selection, "font-family")
      );
      setFontSize($getSelectionStyleValueForProperty(selection, "font-size"));

      let matchingParent;
      if ($isLinkNode(parent)) {
        // If node is a link, we need to fetch the parent paragraph node to set format
        matchingParent = $findMatchingParent(
          node,
          (parentNode) => $isElementNode(parentNode) && !parentNode.isInline()
        );
      }
      elementFormat = $isElementNode(matchingParent)
        ? matchingParent.getFormatType()
        : $isElementNode(node)
          ? node.getFormatType()
          : parent?.getFormatType() || "left";

      if (
        isRTL !== styleMapRef.current.isRTL ||
        isLink !== styleMapRef.current.isLink ||
        isBold !== styleMapRef.current.isBold ||
        isItalic !== styleMapRef.current.isItalic ||
        isUnderline !== styleMapRef.current.isUnderline ||
        isStrikethrough !== styleMapRef.current.isStrikethrough ||
        isCode !== styleMapRef.current.isCode ||
        blockType !== styleMapRef.current.blockType ||
        elementFormat !== styleMapRef.current.elementFormat
      ) {
        styleMapRef.current.isRTL = isRTL;
        styleMapRef.current.isLink = isLink;
        styleMapRef.current.isBold = isBold;
        styleMapRef.current.isItalic = isItalic;
        styleMapRef.current.isUnderline = isUnderline;
        styleMapRef.current.isStrikethrough = isStrikethrough;
        styleMapRef.current.isCode = isCode;
        styleMapRef.current.blockType = blockType;
        styleMapRef.current.elementFormat = elementFormat;
        // console.log(styleMapRef.current);
        //To Android
        window.NHAN?.onChangeStatusButton?.(
          JSON.stringify(styleMapRef.current)
        );
        // To IOS || Flutter
        sendMessageToChannel({
          action: "onChangeStatusButton",
          data: styleMapRef.current,
        });
      }
    }
  }, [activeEditor]);

  const getCarret = useCallback(() => {
    let top = 0,
      left = 0;
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const editorWindow = editor._window || window;
      const range = editorWindow.document.createRange();
      const isRangePositioned = tryToPositionRange(
        selection.anchor.offset,
        range,
        editorWindow
      );
      if (isRangePositioned !== null) {
        const rangeDomRect = range.getBoundingClientRect();
        top = rangeDomRect.top;
        left = rangeDomRect.left;
      }
      if (top === 0 && left === 0) {
        const tmpSelection = window.getSelection();
        if (tmpSelection != null && tmpSelection.isCollapsed) {
          const tmpRange = tmpSelection.getRangeAt(0);

          const tmpSpan = document.createElement("span");
          tmpSpan.setAttribute("data-lexical-text", "true");

          tmpRange.insertNode(tmpSpan);
          const isTmpRangePositioned = tryToPositionRange(
            tmpSelection.anchorOffset,
            tmpRange,
            editorWindow
          );
          if (isTmpRangePositioned !== null) {
            const tmpRangeDomRect = tmpRange.getBoundingClientRect();
            if (
              tmpRangeDomRect.top !== position.current.top ||
              tmpRangeDomRect.left !== position.current.left
            ) {
              top = tmpRangeDomRect.top;
              left = tmpRangeDomRect.left;
            }
          }
          tmpSpan.remove();
        }
      }
      if (
        (top !== position.current.top || left !== position.current.left) &&
        (top !== 0 || left !== 0)
      ) {
        position.current = { top: top, left: left };
        // console.log(position.current);
        //To Android
        window.NHAN?.getCarret?.({ top: top, left: left });
        // To IOS || Flutter
        sendMessageToChannel({
          action: "onChangeCarret",
          data: { top: top, left: left },
        });
      }
    }
  }, [activeEditor]);

  const getCurrentCursorPositionNodeType = useCallback(() => {
    let currentNodeText = "";
    let currentNodeType = "";
    let cursorPosition = -1;

    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const anchor = selection.anchor;

      currentNodeText = anchor.getNode().getTextContent();
      currentNodeType = anchor.getNode().__type;
      cursorPosition = anchor.offset;

      if (
        currentNodeText !== cursorData.current.text ||
        cursorPosition !== cursorData.current.position ||
        currentNodeType !== cursorData.current.type
      ) {
        cursorData.current.text = currentNodeText;
        cursorData.current.position = cursorPosition;
        cursorData.current.type = currentNodeType;

        //To IOS || Flutter
        sendMessageToChannel({
          action: "onGetCursorData",
          data: {
            currentNodeText: currentNodeText,
            cursorPosition: cursorPosition,
            currentNodeType: currentNodeType,
          },
        });
      }
    }
  }, [activeEditor]);

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      (_payload, newEditor) => {
        $updateToolbar();
        setActiveEditor(newEditor);
        // getCarret();
        getCurrentCursorPositionNodeType();
        return false;
      },
      COMMAND_PRIORITY_CRITICAL
    );
  }, [editor, $updateToolbar, getCarret, getCurrentCursorPositionNodeType]);

  useEffect(() => {
    return mergeRegister(
      activeEditor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          $updateToolbar();
          $updateCanSubmit();
        });
      }),
      activeEditor.registerCommand<boolean>(
        CAN_UNDO_COMMAND,
        (payload) => {
          if (payload !== styleMapRef.current.canUndo) {
            styleMapRef.current.canUndo = payload;
            // console.log(styleMapRef.current);
            //To Android
            window.NHAN?.onChangeStatusButton?.(
              JSON.stringify(styleMapRef.current)
            );
            // To IOS || Flutter
            sendMessageToChannel({
              action: "onChangeStatusButton",
              data: styleMapRef.current,
            });
          }

          return false;
        },
        COMMAND_PRIORITY_CRITICAL
      ),
      activeEditor.registerCommand<boolean>(
        CAN_REDO_COMMAND,
        (payload) => {
          if (payload !== styleMapRef.current.canRedo) {
            styleMapRef.current.canRedo = payload;
            //  console.log(styleMapRef.current);
            //To Android
            window.NHAN?.onChangeStatusButton?.(
              JSON.stringify(styleMapRef.current)
            );
            // To IOS || Flutter
            sendMessageToChannel({
              action: "onChangeStatusButton",
              data: styleMapRef.current,
            });
          }
          return false;
        },
        COMMAND_PRIORITY_CRITICAL
      )
    );
  }, [$updateToolbar, activeEditor, editor]);

  window.undo = function () {
    editor.dispatchCommand(UNDO_COMMAND, undefined);
  };

  window.redo = function () {
    editor.dispatchCommand(REDO_COMMAND, undefined);
  };

  window.formatBold = function () {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
  };

  window.formatItalic = function () {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
  };

  window.formatUnderline = function () {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
  };

  window.formatStrikeThrough = function () {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough");
  };

  window.formatCodeInline = function () {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code");
  };

  window.indent = function () {
    editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined);
  };

  window.outdent = function () {
    editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined);
  };

  window.alignLeft = function () {
    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left");
  };

  window.alignCenter = function () {
    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center");
  };

  window.alignRight = function () {
    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right");
  };

  window.alignJustify = function () {
    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify");
  };

  window.formatParagraph = function () {
    editor.update(() => {
      const selection = $getSelection();

      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createParagraphNode());
      }
    });
  };

  window.formatHeading = (headingSize: HeadingTagType) => {
    if (styleMapRef.current.blockType !== headingSize) {
      editor.update(() => {
        const selection = $getSelection();
        $setBlocksType(selection, () => $createHeadingNode(headingSize));
      });
    }
  };

  window.formatBulletList = () => {
    if (styleMapRef.current.blockType !== "bullet") {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    } else {
      window.formatParagraph();
    }
  };

  window.formatNumberedList = () => {
    if (styleMapRef.current.blockType !== "number") {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    } else {
      window.formatParagraph();
    }
  };

  window.formatCheckList = () => {
    editor.focus();
    if (styleMapRef.current.blockType !== "check") {
      editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined);
    } else {
      window.formatParagraph();
    }
  };

  window.formatQuote = () => {
    if (styleMapRef.current.blockType !== "quote") {
      editor.update(() => {
        const selection = $getSelection();

        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createQuoteNode());
        }
      });
    }
  };

  window.formatCodeBlock = () => {
    if (styleMapRef.current.blockType !== "code") {
      editor.update(() => {
        let selection = $getSelection();

        if (selection !== null) {
          if (selection.isCollapsed()) {
            $setBlocksType(selection, () => $createCodeNode());
          } else {
            const textContent = selection.getTextContent();
            const codeNode = $createCodeNode();
            selection.insertNodes([codeNode]);
            selection = $getSelection();
            if ($isRangeSelection(selection)) {
              selection.insertRawText(textContent);
            }
          }
        }
      });
    }
  };

  window.insertLink = (link: Record<string, string>) => {
    console.log("insertLink", link["url"], link["text"]);
    let linkInfo: LinkInfoType = {
      url: link["url"],
      text: link["text"],
    };

    if (!styleMapRef.current.isLink) {
      editor.dispatchCommand(INSERT_LINK_COMMAND, linkInfo);
    }
  };

  window.removeLink = () => {
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
  };

  window.formatTextStyle = (styles: Record<string, string>) => {
    editor.focus();
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $patchStyleText(selection, styles);
      }
    });
  };

  window.addEmoji = (emoji: EmojiLexicalType) => {
    editor.dispatchCommand(ADD_EMOJI_COMMAND, emoji);
  };

  window.addMention = (mention: MentionLexicalType) => {
    editor.dispatchCommand(ADD_MENTION_COMMAND, mention);
  };

  window.insertText = (text: string) => {
    editor.dispatchCommand(INSERT_TEXT_COMMAND, text);
  };

  window.insertBlocks = (blocks: any[]) => {
    editor.dispatchCommand(INSERT_BLOCKS_COMMAND, blocks);
  };

  window.onClear = () => {
    editor.update(() => {
      const root = $getRoot();
      root.clear();
    });
  };

  window.onFocus = () => {
    editor.focus();
  };

  window.onUnfocus = () => {
    editor.blur();
  };

  window.setHTMLContent = (
    baseUrl: string,
    content: string,
    placeHolder: string
  ) => {
    // console.log("@param html [content]:", Base64.decode(content));
    editor.update(() => {
      const parser = new DOMParser();
      const dom = parser.parseFromString(Base64.decode(content), "text/html");
      const nodes = $generateNodesFromDOM(editor, dom);
      const root = $getRoot();
      root.clear();
      /**
       * TODO-ANHDUC
       * I found that Link Node is an Element Node, but Link Node need to wrapped by ParagraphNode.
       * If not => bug when editting.
       */
      const groupedNodes = groupNodes(nodes);
      groupedNodes.forEach((group) => {
        if ($isElementNode(group[0]) && !$isLinkNode(group[0])) {
          // console.log("alone", group[0]);
          root.append(group[0]);
        } else {
          const paragraphNode = $createParagraphNode();
          group.forEach((node) => {
            // console.log(node);
            paragraphNode.append(node);
          });
          root.append(paragraphNode);
        }
      });
    });
    setTimeout(() => {
      // To Android
      window.NHAN?.initCompleted?.();
      // To IOS
      sendMessageToChannel({
        action: "initCompleted",
        data: {},
      });
    }, 50);
  };

  window.getHTMLContent = () => {
    let fHtmlStr = "";
    try {
      editor.getEditorState().read(() => {
        fHtmlStr = $generateHtmlFromNodes(editor, null);
        // console.log(fHtmlStr);
      });
    } catch (error) {
      // console.log(error);
      return "failed_parse_html";
    }

    return fHtmlStr;
  };

  window.onSubmit = () => {
    let result: { blocks: any[]; plainText: string } = {
      blocks: [],
      plainText: "",
    };
    try {
      editor.update(() => {
        const root = $getRoot();
        result.blocks = convertLexicalToBlocks(editor);
        result.plainText = root.getTextContent();
        root.clear();
      });
    } catch (error) {
      console.log("error onSubmit", error);
      return { blocks: [], plainText: "", error: "failed_submit" };
    }
    return result;
  };

  return null;
}
