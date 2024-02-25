import { PostTypes } from "./postsSlice";
import PostAuthor from "./PostAuthor";
import TimeAgo from "./TimeAgo";
import ReactionButtons from "./ReactionButtons";
import { Link } from "react-router-dom";

export default function PostsExcerpt({ post }: { post: PostTypes }) {
  return (
    <article>
      <h2>{post.title}</h2>
      <p className="excerpt">{post.body.substring(0, 75)}</p>
      <p className="postCredit">
        <Link to={`post/${post.id}`}>View Post</Link>
        <PostAuthor userId={post.userId} />
        <TimeAgo timestamp={post.date} />
      </p>
      <ReactionButtons post={post} />
    </article>
  );
}
