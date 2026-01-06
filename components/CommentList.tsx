
import React, { useState } from 'react';
import { Comment, User } from '../types';

interface CommentListProps {
  comments: Comment[];
  entityId: string;
  entityType: Comment['entity_type'];
  currentUser: User;
  onAddComment: (body: string) => void;
}

const CommentList: React.FC<CommentListProps> = ({ comments, entityId, entityType, currentUser, onAddComment }) => {
  const [newComment, setNewComment] = useState('');
  const filteredComments = comments.filter(c => c.entity_id === entityId && c.entity_type === entityType);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(newComment);
      setNewComment('');
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
        <i className="fas fa-comments text-slate-400"></i>
        Discussion ({filteredComments.length})
      </h3>
      
      {/* Input */}
      <div className="flex gap-4">
        <div className="w-10 h-10 rounded-full bg-slate-200 shrink-0 overflow-hidden">
          {/* Fix: The User interface uses firstName and lastName instead of a single name property. */}
          <img src={currentUser.avatar} alt={`${currentUser.firstName} ${currentUser.lastName}`} />
        </div>
        <form onSubmit={handleSubmit} className="flex-1">
          <div className="relative">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment or observation..."
              className="w-full bg-white border border-slate-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none min-h-[100px]"
            />
            <div className="flex justify-end mt-2">
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="px-6 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                Post Comment
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* List */}
      <div className="space-y-6 mt-8">
        {filteredComments.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((comment) => (
          <div key={comment.id} className="flex gap-4 group">
            <div className="w-10 h-10 rounded-full bg-slate-100 shrink-0 overflow-hidden ring-2 ring-white">
              <img src={comment.author_avatar} alt={comment.author_name} />
            </div>
            <div className="flex-1">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 transition-colors group-hover:bg-white group-hover:border-slate-200">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-bold text-slate-900">{comment.author_name}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{comment.body}</p>
              </div>
            </div>
          </div>
        ))}
        {filteredComments.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-slate-400 italic">No comments yet. Start the conversation!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentList;
