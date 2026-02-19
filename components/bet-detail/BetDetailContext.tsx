import React, { createContext, useContext, ReactNode } from 'react';
import { Bet, User, Comment, BetAction, Theme, Outcome1Y, Canvas, ActivityLog, Measure } from '../../types';

interface BetDetailContextType {
    bet: Bet;
    onClose: () => void;
    onUpdate: (bet: Bet) => void;
    onDelete: (id: string) => void;
    onArchive: (bet: Bet) => void;
    onSaveTask: (task: BetAction) => void;
    onDeleteTask: (taskId: string) => void;
    currentUser: User;
    comments: Comment[];
    onAddComment: (body: string) => void;
    onUpdateComment: (comment: Comment) => void;
    onDeleteComment: (commentId: string) => void;
    users: User[];
    themes: Theme[];
    outcomes: Outcome1Y[];
    measures: Measure[];
    canvas: Canvas;
    canEdit: boolean;
    activeTab: string;
    setActiveTab: (tab: string) => void;
    initialFocusTaskId?: string;
    activityLogs: ActivityLog[];
}

const BetDetailContext = createContext<BetDetailContextType | undefined>(undefined);

export const useBetDetail = () => {
    const context = useContext(BetDetailContext);
    if (!context) {
        throw new Error('useBetDetail must be used within a BetDetailProvider');
    }
    return context;
};

interface BetDetailProviderProps extends Omit<BetDetailContextType, 'canEdit'> {
    children: ReactNode;
    canEdit?: boolean;
}

export const BetDetailProvider: React.FC<BetDetailProviderProps> = ({
    children,
    currentUser,
    measures,
    ...props
}) => {
    // Calculate canEdit if not provided
    const canEdit = props.canEdit !== undefined
        ? props.canEdit
        : (currentUser.role === 'Admin' || currentUser.role === 'Editor');

    const value = {
        ...props,
        currentUser,
        measures,
        canEdit
    };

    return (
        <BetDetailContext.Provider value={value}>
            {children}
        </BetDetailContext.Provider>
    );
};
