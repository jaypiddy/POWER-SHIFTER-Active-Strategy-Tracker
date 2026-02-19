
import React, { useState } from 'react';
import { Comment, User } from '../types';

interface CommentListProps {
  comments: Comment[];
  entityId: string;
  entityType: Comment['entity_type'];
  currentUser: User;
  onAddComment: (body: string) => void;
  onUpdateComment: (comment: Comment) => void;
  onDeleteComment: (commentId: string) => void;
}

const CommentList: React.FC<CommentListProps> = ({
  comments,
  entityId,
  entityType,
  currentUser,
  onAddComment,
  onUpdateComment,
  onDeleteComment
}) => {
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editBody, setEditBody] = useState('');
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);

  const filteredComments = comments.filter(c => c.entity_id === entityId && c.entity_type === entityType);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(newComment);
      setNewComment('');
    }
  };

  const startEdit = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditBody(comment.body);
  };

  const saveEdit = () => {
    if (editingCommentId && editBody.trim()) {
      const comment = comments.find(c => c.id === editingCommentId);
      if (comment) {
        onUpdateComment({ ...comment, body: editBody });
      }
      setEditingCommentId(null);
      setEditBody('');
    }
  };

  const confirmDelete = () => {
    if (deletingCommentId) {
      onDeleteComment(deletingCommentId);
      setDeletingCommentId(null);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-white flex items-center gap-2">
        <i className="fas fa-comments text-slate-400"></i>
        Discussion ({filteredComments.length})
      </h3>

      {/* Input */}
      <div className="flex gap-4">
        <div className="w-10 h-10 rounded-full bg-slate-700 shrink-0 overflow-hidden">
          <img src={currentUser.avatar} alt={`${currentUser.firstName} ${currentUser.lastName}`} />
        </div>
        <form onSubmit={handleSubmit} className="flex-1">
          <div className="relative">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment or observation..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none min-h-[100px] placeholder:text-slate-600"
            />
            <div className="flex justify-end mt-2">
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="px-6 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-500 disabled:opacity-50 transition-colors shadow-lg shadow-blue-900/20"
              >
                Post Comment
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* List */}
      <div className="space-y-6 mt-8">
        {filteredComments.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((comment) => {
          const isAuthor = currentUser.id === comment.author_id;
          const isEditing = editingCommentId === comment.id;

          return (
            <div key={comment.id} className="flex gap-4 group">
              <div className="w-10 h-10 rounded-full bg-slate-800 shrink-0 overflow-hidden ring-2 ring-slate-900 border border-slate-700">
                <img src={comment.author_avatar} alt={comment.author_name} />
              </div>
              <div className="flex-1">
                <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 transition-colors group-hover:border-slate-700 relative">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-bold text-slate-200">{comment.author_name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </span>
                      {isAuthor && !isEditing && (
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            aria-label="Edit Comment"
                            className="text-slate-400 hover:text-blue-400 transition-colors"
                            title="Edit"
                          >
                            <i className="fas fa-pencil-alt text-xs"></i>
                          </button>
                          <button
                            aria-label="Delete Comment"
                            className="text-slate-400 hover:text-rose-400 transition-colors"
                            title="Delete"
                          >
                            <i className="fas fa-trash-alt text-xs"></i>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="mt-2">
                      <textarea
                        value={editBody}
                        onChange={(e) => setEditBody(e.target.value)}
                        className="w-full bg-slate-950 border border-blue-900/50 rounded-lg p-3 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none min-h-[80px]"
                        autoFocus
                      />
                      <div className="flex gap-2 mt-2 justify-end">
                        <button
                          onClick={() => setEditingCommentId(null)}
                          className="px-3 py-1.5 text-xs font-bold text-slate-400 hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={saveEdit}
                          disabled={!editBody.trim()}
                          className="px-3 py-1.5 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-50"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-wrap">{comment.body}</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {filteredComments.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-slate-400 italic">No comments yet. Start the conversation!</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deletingCommentId && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-rose-900/20 rounded-full flex items-center justify-center mx-auto mb-2 border border-rose-900/30">
                <i className="fas fa-trash-alt text-rose-500 text-xl"></i>
              </div>
              <h3 className="text-lg font-bold text-white">Delete Comment?</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Are you sure you want to delete this comment? <br />
                <span className="text-rose-400 font-bold">This action cannot be undone.</span>
              </p>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setDeletingCommentId(null)}
                  className="flex-1 py-2.5 border border-slate-700 text-slate-400 font-bold rounded-xl hover:bg-slate-800 hover:text-white transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-2.5 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-500 transition-colors text-sm shadow-lg shadow-rose-900/20"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentList;
