import { FC } from "react";
import Category from "../../../models/Category";
import CategoryDropDown from "../../CategoryDropDown";
import "react-dropdown/style.css";

interface ThreadCategoryProps {
  category?: Category;
  readOnly?: boolean;
  sendOutSelectedCategory: (cat: Category) => void;
}

const ThreadCategory: FC<ThreadCategoryProps> = ({
  category,
  readOnly,
  sendOutSelectedCategory,
}) => {
  return (
    <div className="thread-category-container">
      <strong>{category?.name}</strong>
      <div style={{ marginTop: "1em" }}>
        <CategoryDropDown
          preselectedCategory={category}
          readOnly={readOnly}
          sendOutSelectedCategory={sendOutSelectedCategory}
        />
      </div>
    </div>
  );
};

export default ThreadCategory;
