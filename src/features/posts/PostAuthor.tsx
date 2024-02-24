import { useSelector } from "react-redux";
import { selectAllUsers } from "../users/usersSlice";

export default function PostAuthor({ userId }: { userId: number }) {
  const users = useSelector(selectAllUsers);
  const author = users.find((user) => user.id === userId);

  return <span>by {author ? author.name : "Unknown author"}</span>;
}
