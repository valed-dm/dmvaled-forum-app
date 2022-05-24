import React, { useEffect, useState, useReducer } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useMutation } from "@apollo/client";
import { gql, useLazyQuery } from "@apollo/client";
import { AppState } from "../../../store/configureStore";
import { Node } from "slate";
import "./Thread.css";
import Category from "../../../models/Category";
import ThreadHeader from "./ThreadHeader";
import ThreadCategory from "./ThreadCategory";
import ThreadTitle from "./ThreadTitle";
import ThreadModel from "../../../models/Thread";
import Nav from "../../areas/Nav";
import ThreadBody from "./ThreadBody";
import ThreadResponsesBuilder from "./ThreadResponsesBuilder";
import ThreadResponse from "./ThreadResponse";
import ThreadPointsBar from "../../ThreadPointsBar";
import ThreadPointsInline from "../../ThreadPointsInline";
import { useWindowDimensions } from "../../../hooks/useWindowDimensions";

const GetThreadById = gql`
  query GetThreadById($id: ID!) {
    getThreadById(threadId: $id) {
      ... on EntityResult {
        messages
      }
      ... on Thread {
        id
        user {
          id
          userName
        }
        lastModifiedOn
        title
        body
        points
        category {
          id
          name
        }
        threadItems {
          id
          body
          points
          user {
            id
            userName
          }
          lastModifiedOn
        }
      }
    }
  }
`;
const CreateThread = gql`
  mutation createThread(
    $userId: ID!
    $categoryId: ID!
    $title: String!
    $body: String!
  ) {
    createThread(
      userId: $userId
      categoryId: $categoryId
      title: $title
      body: $body
    ) {
      messages
    }
  }
`;

const threadReducer = (state: any, action: any) => {
  switch (action.type) {
    case "userId":
      return { ...state, userId: action.payload };
    case "category":
      return { ...state, category: action.payload };
    case "title":
      return { ...state, title: action.payload };
    case "bodyNode":
      return { ...state, bodyNode: action.payload };
    default:
      throw new Error("Unknown action type");
  }
};

const Thread = () => {
  const { width } = useWindowDimensions();
  const { id } = useParams();
  const user = useSelector((state: AppState) => state.user);
  const [execCreateThread] = useMutation(CreateThread);
  const [execGetThreadById, { data: threadData }] = useLazyQuery(
    GetThreadById,
    { fetchPolicy: "no-cache" }
  );
  const [thread, setThread] = useState<ThreadModel | undefined>();
  const [readOnly, setReadOnly] = useState(false);
  const [postMsg, setPostMsg] = useState("");
  const [{ userId, category, title, bodyNode }, threadReducerDispatch] =
    useReducer(threadReducer, {
      userId: user ? user.id : "0",
      category: undefined,
      title: "",
      bodyNode: undefined,
    });
  const navigate = useNavigate();

  const refreshThread = () => {
    if (id && Number(id) > 0) {
      execGetThreadById({
        variables: {
          id,
        },
      });
    }
  };

  useEffect(() => {
    console.log("thread id received >> ", id);
    if (id && Number(id) > 0) {
      execGetThreadById({
        variables: {
          id,
        },
      });
    }
  }, [execGetThreadById, id]);

  useEffect(() => {
    threadReducerDispatch({
      type: "userId",
      payload: user ? user.id : "0",
    });
  }, [user]);

  useEffect(() => {
    if (threadData && threadData.getThreadById) {
      setThread(threadData.getThreadById);
      setReadOnly(true);
    } else {
      setThread(undefined);
      setReadOnly(false);
    }
  }, [threadData]);

  const receiveSelectedCategory = (cat: Category) => {
    threadReducerDispatch({
      type: "category",
      payload: cat,
    });
  };
  const receiveTitle = (updatedTitle: string) => {
    threadReducerDispatch({
      type: "title",
      payload: updatedTitle,
    });
  };
  const receiveBody = (body: Node[]) => {
    threadReducerDispatch({
      type: "bodyNode",
      payload: body,
    });
  };

  const onClickPost = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();

    if (!userId || userId === "0") {
      setPostMsg("Please log in to post");
    } else if (!category) {
      setPostMsg("Please select a category");
    } else if (!title) {
      setPostMsg("Please enter a title");
    } else if (!bodyNode) {
      setPostMsg("Message body can't be empty");
    } else {
      setPostMsg("");

      const newThread = {
        userId,
        categoryId: category?.id,
        title,
        body: JSON.stringify(bodyNode),
      };
      const { data: createThreadMsg } = await execCreateThread({
        variables: newThread,
      });

      if (
        createThreadMsg.createThread &&
        createThreadMsg.createThread.messages &&
        !isNaN(createThreadMsg.createThread.messages[0])
      ) {
        setPostMsg("Thread posted successfully.");
        navigate(`/thread/${createThreadMsg.createThread.messages[0]}`);
      } else {
        setPostMsg(createThreadMsg.createThread.messages[0]);
      }
    }
  };

  return (
    <div className="screen-root-container">
      <div className="thread-nav-container">
        <Nav />
      </div>
      <div className="thread-content-container">
        <div className="thread-content-post-container">
          {width <= 768 && thread ? (
            <ThreadPointsInline
              points={thread?.points || 0}
              threadId={thread?.id}
              refreshThread={refreshThread}
              allowUpdatePoints={true}
            />
          ) : null}

          <ThreadHeader
            userName={thread ? thread.user.userName : user?.userName}
            lastModifiedOn={
              thread ? new Date(thread.lastModifiedOn) : new Date()
            }
            title={thread ? thread.title : title}
          />
          <ThreadCategory
            category={thread ? thread.category : category}
            readOnly={thread ? readOnly : false}
            sendOutSelectedCategory={receiveSelectedCategory}
          />
          <ThreadTitle
            title={thread ? thread.title : ""}
            readOnly={thread ? readOnly : false}
            sendOutTitle={receiveTitle}
          />
          <ThreadBody
            body={thread ? thread.body : JSON.stringify(bodyNode)}
            readOnly={thread ? readOnly : false}
            sendOutBody={receiveBody}
          />
          {thread ? null : (
            <React.Fragment>
              <div style={{ marginTop: ".5em" }}>
                <button className="action-btn" onClick={onClickPost}>
                  Post
                </button>
              </div>
              <strong>{postMsg}</strong>
            </React.Fragment>
          )}
        </div>
        <div className="thread-content-points-container">
          <ThreadPointsBar
            points={thread?.points || 0}
            responseCount={
              thread && thread.threadItems && thread.threadItems.length
            }
            threadId={thread?.id || "0"}
            allowUpdatePoints={true}
            refreshThread={refreshThread}
          />
        </div>
      </div>
      {thread ? (
        <div className="thread-content-response-container">
          <hr className="thread-section-divider" />
          <div style={{ marginBottom: ".5em" }}>
            <strong>Post Response</strong>
          </div>
          <ThreadResponse
            body={""}
            userName={user?.userName}
            lastModifiedOn={new Date()}
            points={0}
            readOnly={false}
            threadItemId={"0"}
            threadId={thread.id}
            allowUpdatePoints={false}
            refreshThread={refreshThread}
          />
        </div>
      ) : null}
      {thread ? (
        <div className="thread-content-response-container">
          <hr className="thread-section-divider" />
          <ThreadResponsesBuilder
            threadItems={thread?.threadItems}
            readOnly={readOnly}
            allowUpdatePoints={true}
            refreshThread={refreshThread}
          />
        </div>
      ) : null}
    </div>
  );
};

export default Thread;
