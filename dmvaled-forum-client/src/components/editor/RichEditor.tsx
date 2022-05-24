import { useState, useEffect, useCallback, useMemo, FC } from "react";
import { Slate, Editable, withReact, useSlate, ReactEditor } from "slate-react";
import { Editor, BaseEditor, createEditor, Transforms, Node } from "slate";
import { withHistory, HistoryEditor } from "slate-history";
import isHotkey from "is-hotkey";
import { Button, Toolbar } from "./RichTextControls";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBold,
  faItalic,
  faUnderline,
  faCode,
  faHeading,
  faQuoteRight,
  faListOl,
  faListUl,
} from "@fortawesome/free-solid-svg-icons";
import "./RichEditor.css";

declare module "slate" {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor & HistoryEditor & { type: string };
  }
}

export const getTextFromNodes = (nodes: Node[]) => {
  return nodes.map((n: Node) => Node.string(n)).join("/n");
};

const HOTKEYS: { [keyName: string]: string } = {
  "mod+b": "bold",
  "mod+i": "italic",
  "mod+u": "underline",
  "mod+`": "code",
};

/*
let initialValue = [
  {
    type: "paragraph",
    children: [
      { text: "This is editable " },
      { text: "rich", bold: true },
      { text: " text, " },
      { text: "much", italic: true },
      { text: " better than a " },
      { text: "<textarea>", code: true },
      { text: "!" },
    ],
  },
  {
    type: "paragraph",
    children: [
      {
        text: "Since it's rich text, you can do things like turn a selection of text ",
      },
      { text: "bold", bold: true },
      {
        text: ", or add a semantically rendered block quote in the middle of the page, like this:",
      },
    ],
  },
  {
    type: "block-quote",
    children: [{ text: "A wise quote." }],
  },
  {
    type: "paragraph",
    align: "center",
    children: [{ text: "Try it out for yourself!" }],
  },
];
*/

export const initialValue = [
  {
    type: "paragraph",
    children: [{ text: "" }],
  },
];

const LIST_TYPES = ["numbered-list", "bulleted-list"];

class RichEditorProps {
  existingBody?: string;
  readOnly?: boolean = false;
  sendOutBody?: (body: Node[]) => void;
}

const RichEditor: FC<RichEditorProps> = ({
  existingBody,
  readOnly,
  sendOutBody,
}) => {
  const [editorValue, setEditorValue] = useState<Node[]>(initialValue);
  const renderElement = useCallback((props) => <Element {...props} />, []);
  const renderLeaf = useCallback((props) => <Leaf {...props} />, []);
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);

  useEffect(() => {
    if (existingBody) {
      setEditorValue(JSON.parse(existingBody));
    }
  }, [existingBody]);

  const onChangeEditorValue = (val: Node[]) => {
    setEditorValue(val);
    sendOutBody && sendOutBody(val);
  };

  return (
    <div>
      <Slate
        editor={editor}
        value={editorValue}
        onChange={onChangeEditorValue}
        key={`slate-editor-${JSON.stringify(editorValue).length}`}
      >
        {readOnly ? null : (
          <Toolbar>
            <MarkButton format="bold" icon="bold" />
            <MarkButton format="italic" icon="italic" />
            <MarkButton format="underline" icon="underlined" />
            <MarkButton format="code" icon="code" />
            <BlockButton format="heading-one" icon="header1" />
            <BlockButton format="block-quote" icon="in_quotes" />
            <BlockButton format="numbered-list" icon="list_numbered" />
            <BlockButton format="bulleted-list" icon="list_bulleted" />
          </Toolbar>
        )}
        <div style={{ height: "auto" }}>
          <Editable
            className="editor"
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            placeholder={"Enter some rich text here ..."}
            spellCheck
            autoFocus
            onKeyDown={(event) => {
              for (const hotkey in HOTKEYS) {
                if (isHotkey(hotkey, event as any)) {
                  event.preventDefault();
                  const mark = HOTKEYS[hotkey];
                  toggleMark(editor, mark);
                }
              }
            }}
            readOnly={readOnly}
          />
        </div>
      </Slate>
    </div>
  );
};

const MarkButton = ({ format, icon }: { format: string; icon: string }) => {
  const editor = useSlate();
  let thisIcon = faBold;
  if (icon === "italic") {
    thisIcon = faItalic;
  } else if (icon === "underlined") {
    thisIcon = faUnderline;
  } else if (icon === "code") {
    thisIcon = faCode;
  }
  return (
    <Button
      active={isMarkActive(editor, format)}
      onMouseDown={(event: any) => {
        event.preventDefault();
        toggleMark(editor, format);
      }}
    >
      <FontAwesomeIcon icon={thisIcon} />
    </Button>
  );
};

const isMarkActive = (editor: Editor, format: string) => {
  const marks: any = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

const toggleMark = (editor: Editor, format: string) => {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

const BlockButton = ({ format, icon }: { format: string; icon: string }) => {
  const editor = useSlate();
  let thisIcon = faHeading;
  if (icon === "heading1") {
    thisIcon = faItalic;
  } else if (icon === "heading2") {
    thisIcon = faUnderline;
  } else if (icon === "in_quotes") {
    thisIcon = faQuoteRight;
  } else if (icon === "list_numbered") {
    thisIcon = faListOl;
  } else if (icon === "list_bulleted") {
    thisIcon = faListUl;
  }
  return (
    <Button
      active={isBlockActive(editor, format)}
      onMouseDown={(event: any) => {
        event.preventDefault();
        toggleBlock(editor, format);
      }}
    >
      <FontAwesomeIcon icon={thisIcon} />
    </Button>
  );
};

const isBlockActive = (editor: Editor, format: string) => {
  const cursorPosition = editor.selection?.focus;
  const elementPath = cursorPosition?.path;
  let match = false;

  if (elementPath && elementPath.length > 0 && editor.children) {
    let element: any = editor.children[elementPath[0]];
    for (let i = 1; i < elementPath.length; i += 1) {
      if (element?.type === format) {
        match = true;
        break;
      }
      element = element.children[elementPath[i]];
    }
  }

  return !!match;
};

/*
const isBlockActive = (editor: Editor, format: string) => {
  const [match] = Editor.nodes(editor, {
    match: (n) => (n.type) as string === format,
  });
  return !!match;
};
*/
const toggleBlock = (editor: Editor, format: string) => {
  const isActive = isBlockActive(editor, format);
  const isList = LIST_TYPES.includes(format);
  let element: any;

  const cursorPosition = editor.selection?.focus;
  const elementPath = cursorPosition?.path;
  if (elementPath && elementPath.length > 0 && editor.children) {
    element = editor.children[elementPath[0]];
  }

  Transforms.unwrapNodes(editor, {
    match: () => LIST_TYPES.includes(element.type as string),
    split: true,
  });

  Transforms.setNodes(editor, {
    type: isActive ? "paragraph" : isList ? "list-item" : format,
  });

  if (!isActive && isList) {
    const block = { type: format, children: [] };
    Transforms.wrapNodes(editor, block);
  }
};

const Element = ({
  attributes,
  children,
  element,
}: {
  attributes: any;
  children: any;
  element: any;
}) => {
  switch (element.type) {
    case "block-quote":
      return <blockquote {...attributes}>{children}</blockquote>;
    case "bulleted-list":
      return <ul {...attributes}>{children}</ul>;
    case "heading-one":
      return <h1 {...attributes}>{children}</h1>;
    case "heading-two":
      return <h2 {...attributes}>{children}</h2>;
    case "list-item":
      return <li {...attributes}>{children}</li>;
    case "numbered-list":
      return <ol {...attributes}>{children}</ol>;
    default:
      return <p {...attributes}>{children}</p>;
  }
};

const Leaf = ({
  attributes,
  children,
  leaf,
}: {
  attributes: any;
  children: any;
  leaf: any;
}) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }
  if (leaf.code) {
    children = <code>{children}</code>;
  }
  if (leaf.italic) {
    children = <em>{children}</em>;
  }
  if (leaf.underline) {
    children = <u>{children}</u>;
  }

  return <span {...attributes}>{children}</span>;
};

export default RichEditor;
