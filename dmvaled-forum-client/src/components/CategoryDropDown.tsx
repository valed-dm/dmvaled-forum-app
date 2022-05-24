import { FC, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import DropDown, { Option } from "react-dropdown";
import { AppState } from "../store/configureStore";
import Category from "../models/Category";

const defaultLabel = "Select a category";
const defaultOption = {
  value: "0",
  label: defaultLabel,
};

class CategoryDropDownProps {
  sendOutSelectedCategory?: (cat: Category) => void;
  redirect?: boolean = false;
  preselectedCategory?: Category;
  readOnly?: boolean = false;
}

const CategoryDropDown: FC<CategoryDropDownProps> = ({
  sendOutSelectedCategory,
  redirect,
  preselectedCategory,
  readOnly,
}) => {
  const categories = useSelector((state: AppState) => state.categories);
  const [categoryOptions, setCategoryOptions] = useState<
    Array<string | Option>
  >([defaultOption]);
  const [selectedOption, setSelectedOption] = useState<Option>(defaultOption);
  const navigate = useNavigate();

  useEffect(() => {
    if (categories) {
      const catOptions: Array<Option> = categories.map((cat: Category) => {
        return {
          value: cat.id,
          label: cat.name,
        };
      });
      setCategoryOptions(catOptions);
      setSelectedOption({
        value: preselectedCategory ? preselectedCategory.id : "0",
        label: preselectedCategory ? preselectedCategory.name : defaultLabel,
      });
    }
  }, [categories, preselectedCategory]);

  const onChangeDropDown = (selected: Option) => {
    setSelectedOption(selected);
    if (sendOutSelectedCategory) {
      sendOutSelectedCategory(
        new Category(selected.value, selected.label?.valueOf().toString() ?? "")
      );
    }
    if (redirect) {
      navigate(`/categorythreads/${selected.value}`);
    }
  };

  return (
    <DropDown
      className="thread-category-dropdown"
      options={categoryOptions}
      onChange={onChangeDropDown}
      value={selectedOption}
      placeholder={defaultLabel}
      disabled={readOnly}
    />
  );
};

export default CategoryDropDown;
