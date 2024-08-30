// third-party
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import LinkPlugin from "../plugins/LinkPlugin";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";

// base
import "@base/assets/css/app.css";
import AutoLinkPlugin from "../plugins/AutoLinkPlugin";
import CodeHighlightPlugin from "@base/plugins/CodeHighlightPlugin";
import ListMaxIndentLevelPlugin from "@base/plugins/ListMaxIndentLevelPlugin";
import { MentionsPlugin } from "@base/plugins/MentionsPlugin";
import { sendMessageToChannel } from "./helper";

import editorConfig from "./config";
import { EmojiPlugin } from "@base/plugins/EmojiPlugin";
import MyOnChangePlugin from "@base/plugins/MyOnChangePlugin";
import { InsertTextPlugin } from "@base/plugins/InsertTextPlugin";
import { InsertBlocksPlugin } from "@base/plugins/InsertBlockPlugin";
import { ClickableLinkPlugin } from "@base/plugins/ClickableLinkPlugin";
import { useEffect, useRef } from "react";
import {
  AutoFocusPlugin,
  MyFunctionPlugin,
} from "@base/plugins/MyFunctionPlugIn";
import { MyCheckListPlugin } from "@base/plugins/MyCheckListPlugin";

export default function App() {
  const editorRef = useRef(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const kbRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === editorRef.current) {
          const newHeight = entry.contentRect.height;
          window.NHAN?.updateHeight?.(JSON.stringify({ height: newHeight }));
        }
      }
    });

    if (editorRef.current) {
      resizeObserver.observe(editorRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  function getCarret() {
    var coords = window.getSelectionCoords();
    var yTop = coords.y + document.body.scrollTop;
    var yBottom = coords.bottom + document.body.scrollTop;
    return { yTop: yTop, yBottom: yBottom };
  }

  window.getSelectionCoords = function (win) {
    win = win || window;
    var doc = win.document;
    var sel = doc.getSelection(),
      range,
      rects,
      rect;
    var x = 0,
      y = 0,
      bottom = 0;
    if (sel) {
      if (sel.type != "Control") {
        // range = sel.createRange();
        const range = win.document.createRange();

        range.collapse(true);
        x = range.getBoundingClientRect().left;
        y = range.getBoundingClientRect().top;
      }
    } else if (win.getSelection) {
      sel = win.getSelection();
      if (sel && sel.rangeCount) {
        range = sel.getRangeAt(0).cloneRange();
        if (range.getClientRects) {
          range.collapse(true);
          rects = range.getClientRects();
          if (rects.length > 0) {
            rect = rects[0];
          }
          if (rect) {
            x = rect.left;
            y = rect.top;
            bottom = rect.bottom;
          }
        }
        // Fall back to inserting a temporary element
        if (x == 0 && y == 0) {
          var span = doc.createElement("span");
          if (span.getClientRects) {
            // Ensure span has dimensions and position by
            // adding a zero-width space character
            span.appendChild(doc.createTextNode("\u200b"));
            range.insertNode(span);
            rect = span.getClientRects()[0];
            x = rect.left;
            y = rect.top;
            bottom = rect.bottom;
            var spanParent = span.parentNode;
            if (spanParent) {
              spanParent.removeChild(span);
              spanParent.normalize();
            }
          }
        }
      }
    }
    return { x: x, y: y, bottom: bottom };
  };

  window.setPaddingTopBottom = (top, bottom) => {
    if (editorContainerRef.current) {
      editorContainerRef.current.style.marginTop = `${top}px`; // note: always set margin-top in here (do NOT use padding-top)
    }
    if (kbRef.current) {
      kbRef.current.style.height = `${bottom}px`;
    }
    var carretObj = getCarret();
    // To Android
    window.NHAN?.onPaddingChanged?.(
      JSON.stringify({
        carretY: carretObj.yTop,
        carretYBottom: carretObj.yBottom,
      })
    );
    //To IOS
    sendMessageToChannel({
      action: "onPaddingChanged",
      data: {
        carretY: carretObj.yTop,
        carretYBottom: carretObj.yBottom,
      },
    });
  };

  const currentPlainTextRef = useRef<string | null>(null);

  const onChange = (plainText: string) => {
    if (
      currentPlainTextRef.current == null ||
      plainText !== currentPlainTextRef.current
    ) {
      currentPlainTextRef.current = plainText;
      // To IOS && Flutter
      sendMessageToChannel({
        action: "onFetchPlainText",
        data: {
          plainText: plainText,
        },
      });
    }
  };

  return (
    <>
      <LexicalComposer initialConfig={editorConfig}>
        {/* <ToolbarPlugin /> */}
        <div
          ref={editorContainerRef}
          className="editor-container"
          style={{
            paddingTop: 5,
          }}
        >
          <AutoFocusPlugin />
          <EmojiPlugin />
          <MyFunctionPlugin />
          <MyOnChangePlugin onChange={onChange} />
          <MentionsPlugin />
          <InsertTextPlugin />
          <InsertBlocksPlugin />
          <AutoLinkPlugin />
          <RichTextPlugin
            contentEditable={
              <div className="editor-input" ref={editorRef}>
                <ContentEditable className="ContentEditable__root" />
              </div>
            }
            placeholder={
              <div
                className="editor-placeholder"
                style={{
                  paddingTop: 5,
                }}
              >
                Enter some rich text...
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          {/* History Plugin is necessary if want to have undo, redo*/}
          <HistoryPlugin />
          <LinkPlugin />
          {/* MyCheckListPlugin is necessary for checklist */}
          <MyCheckListPlugin />
          <ClickableLinkPlugin />
          {/* CheckListPlugin is necessary for checklist */}
          <CheckListPlugin />
          {/* CodeHighlightPlugin is necessary for code block */}
          <CodeHighlightPlugin />
          <ListMaxIndentLevelPlugin maxDepth={7} />
          {/* <FixIOSAsiaIssuePlugin /> */}
          {/* <ContextMenuPlugin /> */}
          {/* <TreeViewPlugin /> This plugin to use when debugging*/}
        </div>
      </LexicalComposer>
      <div ref={kbRef} style={{ height: "0px", width: "100%" }}></div>
    </>
  );
}
