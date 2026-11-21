import * as store from "@/lib/store";
import type { Forum, Comment } from "@/types/forum";
import type { User } from "@/types/user";

function sortedPosts(): Forum[] {
    return store
        .list<Forum>("forums")
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

export async function createForumPost(data: {
    title: string;
    content: string;
    user_id: string;
}): Promise<string> {
    return store.insert<Forum>("forums", {
        user_id: data.user_id,
        title: data.title,
        content: data.content,
        image_url: [],
        timestamp: new Date().toISOString(),
        comments: [],
        likes: [],
    });
}

// `offset` is the number of posts already loaded.
export async function getForumPosts(limitCount = 10, offset = 0) {
    const all = sortedPosts();
    const posts = all.slice(offset, offset + limitCount);
    return {
        posts,
        nextOffset: offset + posts.length,
        hasMore: offset + posts.length < all.length,
    };
}

export function subscribeToForumPosts(
    callback: (posts: Forum[]) => void,
    limitCount = 10
) {
    return store.subscribe(() => callback(sortedPosts().slice(0, limitCount)));
}

export function subscribeToForumPost(
    postId: string,
    callback: (post: Forum | null) => void
) {
    callback(store.get<Forum>("forums", postId));
    return store.subscribe(() => callback(store.get<Forum>("forums", postId)));
}

export async function deleteForumPost(postId: string) {
    store.remove("forums", postId);
}

export async function toggleLike(postId: string, userId: string) {
    const post = store.get<Forum>("forums", postId);
    if (!post) return;
    store.update<Forum>("forums", postId, {
        likes: post.likes.includes(userId)
            ? post.likes.filter((id) => id !== userId)
            : [...post.likes, userId],
    });
}

export async function addComment(
    postId: string,
    comment: {
        user_id: string;
        content: string;
        parentCommentId?: string;
    }
) {
    const post = store.get<Forum>("forums", postId);
    if (!post) return;

    const newComment: Comment = {
        id: crypto.randomUUID(),
        user_id: comment.user_id,
        content: comment.content,
        timestamp: new Date().toISOString(),
        comments: [],
    };

    store.update<Forum>("forums", postId, {
        comments: comment.parentCommentId
            ? addNestedComment(post.comments, comment.parentCommentId, newComment)
            : [...post.comments, newComment],
    });
}

export async function updateComment(
    postId: string,
    commentId: string,
    content: string
) {
    const post = store.get<Forum>("forums", postId);
    if (!post) return;
    store.update<Forum>("forums", postId, {
        comments: updateCommentContent(post.comments, commentId, content),
    });
}

export async function deleteComment(postId: string, commentId: string) {
    const post = store.get<Forum>("forums", postId);
    if (!post) return;
    store.update<Forum>("forums", postId, {
        comments: removeComment(post.comments, commentId),
    });
}

export async function getUsersData(userIds: string[]) {
    const usersData: Record<string, User> = {};
    for (const user of store.list<User>("users")) {
        if (userIds.includes(user.id)) usersData[user.id] = user;
    }
    return usersData;
}

function addNestedComment(
    comments: Comment[],
    parentId: string,
    newComment: Comment
): Comment[] {
    return comments.map((comment) => {
        if (comment.id === parentId) {
            return {
                ...comment,
                comments: [...comment.comments, newComment],
            };
        } else if (comment.comments.length > 0) {
            return {
                ...comment,
                comments: addNestedComment(
                    comment.comments,
                    parentId,
                    newComment
                ),
            };
        }
        return comment;
    });
}

function updateCommentContent(
    comments: Comment[],
    commentId: string,
    content: string
): Comment[] {
    return comments.map((comment) => {
        if (comment.id === commentId) {
            return { ...comment, content };
        } else if (comment.comments.length > 0) {
            return {
                ...comment,
                comments: updateCommentContent(
                    comment.comments,
                    commentId,
                    content
                ),
            };
        }
        return comment;
    });
}

function removeComment(comments: Comment[], commentId: string): Comment[] {
    return comments
        .filter((comment) => comment.id !== commentId)
        .map((comment) => ({
            ...comment,
            comments: removeComment(comment.comments, commentId),
        }));
}
