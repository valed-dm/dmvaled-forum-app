import React, { FC } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useWindowDimensions } from "../../../hooks/useWindowDimensions";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faHeart, faReplyAll } from "@fortawesome/free-solid-svg-icons";
import Thread from "../../../models/Thread";
import ThreadPointsBar from "../../ThreadPointsBar";
import RichEditor from "../../editor/RichEditor";
import "./ThreadCard.css";

interface ThreadCardProps {
  thread: Thread;
}

const ThreadCard: FC<ThreadCardProps> = ({ thread }) => {
  const navigate = useNavigate();
  const { width } = useWindowDimensions();

  const onClickShowThread = (e: React.MouseEvent<HTMLDivElement>) =>
    navigate(`/thread/${thread.id}`);

  const getPoints = (thread: Thread) => {
    if (width < 768) {
      return (
        <div>
          {thread.points || 0}
          <FontAwesomeIcon
            icon={faHeart}
            className="points-icon"
            style={{ marginLeft: ".5em" }}
          />
        </div>
      );
    }
    return null;
  };

  const getResponses = (thread: Thread) => {
    if (width <= 768) {
      return (
        <div>
          {thread && thread.threadItems && thread.threadItems.length}
          <FontAwesomeIcon
            icon={faReplyAll}
            className="points-icon"
            style={{ marginLeft: ".5em" }}
          />
        </div>
      );
    }
    return null;
  };

  return (
    <section className="panel threadcard-container">
      <div className="threadcard-txt-container">
        <div className="content-header">
          <Link
            to={`/categorythreads/${thread.category.id}`}
            className="link-txt"
          >
            <strong>{thread.category.name}</strong>
          </Link>
          <span className="username-header" style={{ marginLeft: "1em" }}>
            {thread.user.userName}
          </span>
        </div>
        <div>
          <div
            onClick={onClickShowThread}
            data-thread-id={thread.id}
            style={{ marginBottom: ".4em" }}
          >
            <strong>{thread.title}</strong>
          </div>
          <div
            className="threadcard-body"
            onClick={onClickShowThread}
            data-thread-id={thread.id}
          >
            <RichEditor existingBody={thread.body} readOnly={true} />
          </div>
          <div className="threadcard-footer">
            {thread.views}
            <FontAwesomeIcon
              icon={faEye}
              className="icon-lg"
              style={{ marginLeft: "-1em", marginRight: "12em" }}
            />
            {getPoints(thread)}
            {getResponses(thread)}
          </div>
        </div>
      </div>
      <ThreadPointsBar
        points={thread.points}
        responseCount={thread.threadItems.length}
      />
    </section>
  );
};

export default ThreadCard;
