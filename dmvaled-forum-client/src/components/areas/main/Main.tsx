import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { gql, useLazyQuery } from "@apollo/client";
import { AppState } from "../../../store/configureStore";
import Category from "../../../models/Category";
import MainHeader from "./MainHeader";
import ThreadCard from "./ThreadCard";

const GetThreadsByCategoryId = gql`
  query getThreadsByCatergoryId($categoryId: ID!) {
    getThreadsByCategoryId(categoryId: $categoryId) {
      ... on EntityResult {
        messages
      }
      ... on ThreadArray {
        threads {
          id
          title
          body
          views
          points
          user {
            userName
          }
          threadItems {
            id
          }
          category {
            id
            name
          }
        }
      }
    }
  }
`;

const GetThreadsLatest = gql`
  query getThreadsLatest {
    getThreadsLatest {
      ... on EntityResult {
        messages
      }
      ... on ThreadArray {
        threads {
          id
          title
          body
          views
          points
          user {
            userName
          }
          threadItems {
            id
          }
          category {
            id
            name
          }
        }
      }
    }
  }
`;

const Main = () => {
  const [
    execGetThreadsByCat,
    {
      // error: threadsByCatErr,
      // called: threadsByCatCalled,
      data: threadsByCatData,
    },
  ] = useLazyQuery(GetThreadsByCategoryId);

  const [
    execGetThreadsLatest,
    {
      // error: threadsLatestErr,
      // called: threadsLatestCalled,
      data: threadsLatestData,
    },
  ] = useLazyQuery(GetThreadsLatest, { fetchPolicy: "no-cache" });

  const { categoryId } = useParams();
  const categoriesState = useSelector((state: AppState) => state.categories);
  const [category, setCategory] = useState<Category | undefined>();
  const [threadCards, setThreadCards] = useState<Array<JSX.Element> | null>(
    null
  );
  const navigate = useNavigate();

  useEffect(() => {
    if (categoryId && Number(categoryId) > 0) {
      console.log("ThreadsByCat()");
      execGetThreadsByCat({
        variables: {
          categoryId,
        },
      });
    } else {
      execGetThreadsLatest();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId]);

  useEffect(() => {
    console.log("main threadsByCatData", threadsByCatData);
    if (
      threadsByCatData &&
      threadsByCatData.getThreadsByCategoryId &&
      threadsByCatData.getThreadsByCategoryId.threads
    ) {
      const threads = threadsByCatData.getThreadsByCategoryId.threads;
      const cards = threads.map((th: any) => {
        return <ThreadCard key={`thread-${th.id}`} thread={th} />;
      });
      setCategory(threads[0].category);
      setThreadCards(cards);
    } else {
      let cat = categoriesState?.filter((el) => el.id === categoryId);
      if (cat) {
        setCategory(cat[0]);
      } else {
        setCategory(undefined);
      }
      // todo no posted messages for choosen category exist
      setThreadCards(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadsByCatData]);

  useEffect(() => {
    if (
      threadsLatestData &&
      threadsLatestData.getThreadsLatest &&
      threadsLatestData.getThreadsLatest.threads
    ) {
      const threads = threadsLatestData.getThreadsLatest.threads;
      const cards = threads.map((th: any) => {
        return <ThreadCard key={`thread-${th.id}`} thread={th} />;
      });
      setCategory(new Category("0", "Latest"));
      setThreadCards(cards);
    }
  }, [threadsLatestData]);

  console.log("threadCards:", threadCards);

  const onClickPostThread = () => {
    navigate("/thread");
  };

  return (
    <main className="content">
      <button className="action-btn" onClick={onClickPostThread}>
        Post
      </button>
      <MainHeader category={category} />
      <div>{threadCards}</div>
    </main>
  );
};

export default Main;
