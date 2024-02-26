import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { AppState } from "../../app/store";
import { sub } from "date-fns";
import axios, { AxiosError } from "axios";

const POSTS_URL = "https://jsonplaceholder.typicode.com/posts" as const;

export interface PostTypes {
  userId: number;
  id: number;
  title: string;
  body: string;
  date: string;
  reactions: Record<string, number>;
}

export type Status = "idle" | "loading" | "succeeded" | "failed";

interface InitialState {
  posts: Array<PostTypes>;
  status: Status;
  error: string | undefined;
}

const initialState = {
  posts: [],
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: undefined,
} satisfies InitialState as InitialState;

export const deletePost = createAsyncThunk(
  "posts/deletePost",
  async (initialPost: { id: number }) => {
    const { id } = initialPost;
    try {
      const response = await axios.delete(`${POSTS_URL}/${id}`);
      if (response?.status === 200) return initialPost;
      return `${response?.status}: ${response?.statusText}`;
    } catch (err) {
      if (err instanceof AxiosError) return err.message;
    }
  }
);

export const updatePost = createAsyncThunk(
  "posts/updatePost",
  async (initialPost: Omit<PostTypes, "date">) => {
    const { id } = initialPost;
    try {
      const response = await axios.put(`${POSTS_URL}/${id}`, initialPost);
      return response.data;
    } catch (err) {
      if (err instanceof AxiosError) return initialPost;
      return initialPost;
    }
  }
);

export const fetchPosts = createAsyncThunk("posts/fetchPosts", async () => {
  try {
    const response = await axios.get(POSTS_URL);
    return response.data;
  } catch (err) {
    if (err instanceof AxiosError) return err.message;
  }
});

export const addNewPost = createAsyncThunk(
  "posts/addNewPost",
  async (initialPost: Omit<PostTypes, "id" | "date" | "reactions">) => {
    try {
      const response = await axios.post(POSTS_URL, initialPost);
      return response.data;
    } catch (err) {
      if (err instanceof AxiosError) return err.message;
    }
  }
);

/* const initialState: Array<PostTypes> = [
  {
    id: "1",
    title: "Introduction to JavaScript",
    content:
      "JavaScript is a versatile programming language that is commonly used for web development.",
    date: sub(new Date(), { minutes: 10 }).toISOString(),
    reactions: {
      thumbsUp: 0,
      wow: 0,
      heart: 0,
      rocket: 0,
      coffee: 0,
    },
  },
  {
    id: "2",
    title: "Getting Started with Node.js",
    content:
      "Node.js allows you to run JavaScript on the server side, opening up new possibilities for backend development.",
    date: sub(new Date(), { minutes: 20 }).toISOString(),
    reactions: {
      thumbsUp: 0,
      wow: 0,
      heart: 0,
      rocket: 0,
      coffee: 0,
    },
  },
  {
    id: "3",
    title: "React Basics",
    content:
      "React is a popular JavaScript library for building user interfaces. It uses a component-based architecture.",
    date: sub(new Date(), { minutes: 30 }).toISOString(),
    reactions: {
      thumbsUp: 0,
      wow: 0,
      heart: 0,
      rocket: 0,
      coffee: 0,
    },
  },
  {
    id: "4",
    title: "ES6 Features",
    content:
      "ECMAScript 6 (ES6) introduced new features to JavaScript, making the language more powerful and expressive.",
    date: sub(new Date(), { minutes: 40 }).toISOString(),
    reactions: {
      thumbsUp: 0,
      wow: 0,
      heart: 0,
      rocket: 0,
      coffee: 0,
    },
  },
  {
    id: "5",
    title: "Asynchronous JavaScript",
    content:
      "Asynchronous programming in JavaScript is crucial for handling tasks such as AJAX requests and timers efficiently.",
    date: sub(new Date(), { minutes: 50 }).toISOString(),
    reactions: {
      thumbsUp: 0,
      wow: 0,
      heart: 0,
      rocket: 0,
      coffee: 0,
    },
  },
]; */

const postsSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    /* postAdded: {
      reducer(state, action: PayloadAction<PostTypes>) {
        state.posts.push(action.payload);
      },
      prepare(title: string, body: string, id: number, userId: number) {
        return {
          payload: {
            id,
            title,
            body,
            userId: Number(userId),
            date: new Date().toISOString(),
            reactions: {
              thumbsUp: 0,
              rocket: 0,
              wow: 0,
              heart: 0,
              eyes: 0,
            },
          },
        };
      },
    }, */
    reactionAdded(
      state,
      action: PayloadAction<{ reaction: string; id: number }>
    ) {
      const { id, reaction } = action.payload;
      const existingPost = state.posts.find((post) => post.id === id);
      if (existingPost) {
        existingPost.reactions[reaction]++;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.status = "succeeded";
        let min = 1;
        const loadedPosts = action.payload.map((post: PostTypes) => {
          post.date = sub(new Date(), { minutes: min++ }).toISOString();
          post.reactions = {
            thumbsUp: 0,
            wow: 0,
            heart: 0,
            rocket: 0,
            coffee: 0,
          };
          return post;
        });
        state.posts = state.posts.concat(loadedPosts);
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(
        addNewPost.fulfilled,
        (state, action: PayloadAction<PostTypes>) => {
          action.payload.userId = Number(action.payload.userId);
          action.payload.date = new Date().toISOString();
          action.payload.reactions = {
            thumbsUp: 0,
            wow: 0,
            heart: 0,
            rocket: 0,
            coffee: 0,
          };
          console.log(action.payload);
          state.posts.push(action.payload);
        }
      )
      .addCase(updatePost.fulfilled, (state, action) => {
        if (!action.payload?.id) {
          console.log("Update could not complete!");
          console.log(action.payload);
          return;
        }
        const { id } = action.payload;
        action.payload.date = new Date().toISOString();
        const posts = state.posts.filter((post) => post.id !== id);
        state.posts = [...posts, action.payload];
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        if (!action.payload?.id) {
          console.log("Delete count not complete!");
          console.log(action.payload);
        }
        const { id } = action.payload;
        const posts = state.posts.filter((post) => post.id !== id);
        state.posts = posts;
      });
  },
});

export const selectAllPosts = (state: AppState) => state.posts.posts;
export const getPostsStatus = (state: AppState) => state.posts.status;
export const getPostsError = (state: AppState) => state.posts.error;
export const selectPostById = (state: AppState, postId: number) =>
  state.posts.posts.find((post) => post.id === postId);

export const { reactionAdded } = postsSlice.actions;
export default postsSlice.reducer;
