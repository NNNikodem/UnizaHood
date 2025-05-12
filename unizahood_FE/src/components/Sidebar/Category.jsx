import { Link } from "react-router-dom";

const Category = ({ index, category }) => {
  return (
    <li key={index} className="category-item">
      <Link to={`/events/category/${category.name}`} className="category-link">
        {category.name}
      </Link>
    </li>
  );
};
export default Category;
