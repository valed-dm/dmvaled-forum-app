import { FC, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ThreadByCategory from "../../../models/ThreadByCategory";
import "./TopCategory.css";

interface TopCategoryProps {
  topCategories: Array<ThreadByCategory>;
}

const TopCategory: FC<TopCategoryProps> = ({ topCategories }) => {
  const [threads, setThreads] = useState<JSX.Element | undefined>();

  useEffect(() => {
    if (topCategories && topCategories.length > 0) {
      const newThreadElements = topCategories.map((top) => (
        <Link to={`/thread/${top.threadId}`} key={top.threadId}>
          <span className="clickable-span">{top.title}</span>
          <br />
        </Link>
      ));

      setThreads(<ul className="topcat-threads">{newThreadElements}</ul>);
    }
  }, [topCategories]);

  return (
    <div className="topcat-item-container">
      <div>
        <h2 style={{ fontSize: ".95em" }}>{topCategories[0].categoryName}</h2>
      </div>
      {threads}
    </div>
  );
};

export default TopCategory;
