import React, { FC, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { gql, useMutation } from "@apollo/client";
import { Node } from "slate";
import RichEditor from "../../editor/RichEditor";
import UserNameAndTime from "./UserNameAndTime";
import ThreadPointsInline from "../../ThreadPointsInline";
import { AppState } from "../../../store/configureStore";

const CreateThreadItem = gql`
  mutation CreateThreadItem($userId: ID!, $threadId: ID!, $body: String!) {
    createThreadItem(userId: $userId, threadId: $threadId, body: $body) {
      messages
    }
  }
`;

interface ThreadResponseProps {
  body?: string;
  userName?: string;
  lastModifiedOn?: Date;
  points?: number;
  readOnly: boolean;
  threadItemId: string;
  threadId?: string;
  allowUpdatePoints: boolean;
  refreshThread: () => void;
}

const ThreadResponse: FC<ThreadResponseProps> = ({
  body,
  userName,
  lastModifiedOn,
  points,
  readOnly,
  threadItemId,
  threadId,
  allowUpdatePoints,
  refreshThread,
}) => {
  const user = useSelector((state: AppState) => state.user);
  const [execCreateThreadItem] = useMutation(CreateThreadItem);
  const [postMsg, setPostMsg] = useState("");
  const [bodyToSave, setBodyToSave] = useState("");

  useEffect(() => {
    if (body) {
      setBodyToSave(body || "");
    }
  }, [body]);

  const onClickPost = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();

    if (!user) {
      setPostMsg("Please login before adding a response");
    } else if (!threadId) {
      setPostMsg("A parent thread must exist before a response can be posted");
    } else if (!bodyToSave) {
      setPostMsg("Please enter your comment");
    } else {
      await execCreateThreadItem({
        variables: {
          userId: user ? user.id : "0",
          threadId,
          body: bodyToSave,
        },
      });
      refreshThread && refreshThread();
    }
  };

  const receiveBody = (body: Node[]) => {
    const newBody = JSON.stringify(body);
    if (bodyToSave !== newBody) {
      setBodyToSave(newBody);
    }
  };

  return (
    <div>
      <div>
        <UserNameAndTime userName={userName} lastModifiedOn={lastModifiedOn} />
        <span style={{ fontStyle: "italic", fontSize: ".9em" }}>
          &nbsp;(response id&nbsp;{threadItemId})
        </span>
        {readOnly ? (
          <span style={{ display: "inlineBlock", marginLeft: "1em" }}>
            <ThreadPointsInline
              points={points || 0}
              threadItemId={threadItemId}
              refreshThread={refreshThread}
              allowUpdatePoints={allowUpdatePoints}
            />
          </span>
        ) : null}
      </div>
      <div className="thread-body-editor">
        <RichEditor
          existingBody={bodyToSave}
          readOnly={readOnly}
          sendOutBody={receiveBody}
        />
      </div>
      {!readOnly && threadId ? (
        <React.Fragment>
          <div style={{ marginTop: ".5em" }}>
            <button className="action-btn" onClick={onClickPost}>
              Post Response
            </button>
          </div>
          <strong>{postMsg}</strong>
        </React.Fragment>
      ) : null}
    </div>
  );
};

export default ThreadResponse;
