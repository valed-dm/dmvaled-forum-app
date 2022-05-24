import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useWindowDimensions } from "../../hooks/useWindowDimensions";
import { AppState } from "../../store/configureStore";
import Category from "../../models/Category";
import "./LeftMenu.css";

const LeftMenu = () => {
  const categoriesState = useSelector((state: AppState) => state.categories);
  const { width } = useWindowDimensions();
  const [categories, setCategories] = useState<JSX.Element>(
    <div>Left Menu loading...</div>
  );

  useEffect(() => {
    if (categoriesState) {
      const cats = categoriesState.map((cat: Category) => {
        return (
          <li key={cat.id}>
            <Link to={`/categorythreads/${cat.id}`}>
              <h2>{cat.name}</h2>
            </Link>
          </li>
        );
      });
      setCategories(<ul className="category">{cats}</ul>);
    }
  }, [categoriesState]);

  if (width <= 768) {
    return null;
  }
  return (
    <div className="leftmenu">
      <h2 style={{ marginLeft: "1.5em" }}>Categories:</h2>
      <div>{categories}</div>
    </div>
  );
};

export default LeftMenu;
