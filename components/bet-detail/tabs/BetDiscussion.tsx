import React from 'react';
import CommentList from '../../CommentList';
import { useBetDetail } from '../BetDetailContext';

export const BetDiscussion: React.FC = () => {
    const { bet, comments, currentUser, onAddComment, onUpdateComment, onDeleteComment } = useBetDetail();

    return (
        <CommentList
            comments={comments}
            entityId={bet.id}
            entityType="Bet"
            currentUser={currentUser}

            onAddComment={onAddComment}
            onUpdateComment={onUpdateComment}
            onDeleteComment={onDeleteComment}
        />
    );
};
