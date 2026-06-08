"use client";

import { useState, useEffect, useTransition } from "react";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { addComment, getComments } from "../actions";

interface CommentItem {
  _id: string;
  content: string;
  userId: { name: string; email: string } | null;
  createdAt: string;
}

interface Props {
  taskId: string;
}

export function CommentSection({ taskId }: Props) {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [content, setContent] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getComments(taskId).then(setComments);
  }, [taskId]);

  function handleSubmit() {
    if (!content.trim()) return;
    startTransition(async () => {
      const result = await addComment(taskId, content);
      if (result?.error) {
        toast.error(result.error);
      } else {
        setContent("");
        if (result.comment) {
          setComments((prev) => [result.comment, ...prev]);
        } else {
          const updated = await getComments(taskId);
          setComments(updated);
        }
      }
    });
  }

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium flex items-center gap-2">
        <MessageSquare className="h-4 w-4" /> Comments ({comments.length})
      </h4>

      <div className="flex gap-2">
        <Textarea
          placeholder="Add a comment..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={2}
          className="flex-1"
        />
        <Button
          size="icon"
          onClick={handleSubmit}
          disabled={isPending || !content.trim()}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-3 max-h-60 overflow-y-auto">
        {comments.map((comment) => {
          const authorName = comment.userId?.name ?? "Unknown user";
          return (
          <div key={comment._id} className="flex gap-3">
            <Avatar className="h-7 w-7 shrink-0">
              <AvatarFallback className="text-xs">
                {authorName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{authorName}</span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{comment.content}</p>
            </div>
          </div>
          );
        })}
        {comments.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-2">No comments yet</p>
        )}
      </div>
    </div>
  );
}
