export interface Forum {
    id: string;
    user_id: string;
    title: string;
    content: string;
    image_url: string[];
    timestamp: string;
    comments: Comment[];
    likes: string[];
}

export interface Comment {
    id: string;
    user_id: string;
    content: string;
    timestamp: string;
    comments: Comment[];
}
