import { useState, useEffect } from "react";
import { gql, useLazyQuery } from "@apollo/client";
import groupBy from "lodash/groupBy";
import { useWindowDimensions } from "../../../hooks/useWindowDimensions";
import TopCategory from "./TopCategory";
import "./RightMenu.css";

const GetTopCategoryThread = gql`
  query GetTopCategoryThread {
    getTopCategoryThread {
      threadId
      categoryId
      categoryName
      title
    }
  }
`;

const RightMenu = () => {
  const [execGetTopCategoryThread, { data: threadByCategoryData }] =
    useLazyQuery(GetTopCategoryThread);
  const { width } = useWindowDimensions();
  const [topCategories, setTopCategories] = useState<
    Array<JSX.Element> | undefined
  >();

  useEffect(() => {
    execGetTopCategoryThread();
  }, [execGetTopCategoryThread, threadByCategoryData]);

  useEffect(() => {
    if (threadByCategoryData && threadByCategoryData.getTopCategoryThread) {
      const topCatThreads = groupBy(
        threadByCategoryData.getTopCategoryThread,
        "categoryName"
      );

      const topElements = [];
      for (let key in topCatThreads) {
        const currentTop = topCatThreads[key];
        topElements.push(<TopCategory key={key} topCategories={currentTop} />);
      }
      setTopCategories(topElements);
    }
  }, [threadByCategoryData]);

  if (width <= 768) {
    return null;
  }
  return (
    <div className="rightmenu rightmenu-container">
      <h2>Most active:</h2>
      <div>{topCategories}</div>
    </div>
  );
};

export default RightMenu;
