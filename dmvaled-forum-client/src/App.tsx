import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Routes, Route } from "react-router-dom";
import { gql, useQuery } from "@apollo/client";
import useRefreshReduxMe from "./hooks/useRefreshReduxMe";
import { ThreadCategoriesType } from "./store/categories/Reducer";
import Category from "./models/Category";
import Home from "./components/routes/Home";
import Thread from "./components/routes/thread/Thread";
import UserProfile from "./components/routes/userProfile/UserProfile";
import "./App.css";

const GetAllCategories = gql`
  query getAllCategories {
    getAllCategories {
      id
      name
    }
  }
`;

function App() {
  const dispatch = useDispatch();
  const { data: categoriesData } = useQuery(GetAllCategories);
  const { execMe, updateMe } = useRefreshReduxMe();

  useEffect(() => {
    execMe();
  }, [execMe]);

  useEffect(() => {
    updateMe();
  }, [updateMe]);

  useEffect(() => {
    if (categoriesData && categoriesData.getAllCategories) {
      const catData = [...categoriesData.getAllCategories];
      catData.sort((a: Category, b: Category) => {
        let nameA: string = a.name.toLowerCase();
        let nameB: string = b.name.toLowerCase();
        if (nameA < nameB) return -1;
        if (nameA > nameB) return 1;
        return 0;
      });

      dispatch({
        type: ThreadCategoriesType,
        payload: catData,
      });
    }
  }, [dispatch, categoriesData]);

  return (
    <Routes>
      <Route path="/" element={<Home key={"home"} />} />
      <Route path="/latest" element={<Home key={"latest"} />} />
      <Route
        path="/categorythreads/:categoryId"
        element={<Home key={"categorythreads"} />}
      />
      <Route path="/thread/" element={<Thread key={"thread"} />} />
      <Route path="/thread/:id" element={<Thread key={"threadId"} />} />
      <Route
        path="/userprofile/:id"
        element={<UserProfile key={"userprofile"} />}
      />
    </Routes>
  );
}

export default App;
