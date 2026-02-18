import React, { createContext, useContext, ReactNode } from 'react';
import { Bet, User, Comment, BetAction, Theme } from '../../types';

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
    users: User[];
    themes: Theme[];
    canEdit: boolean;
    activeTab: string;
    setActiveTab: (tab: string) => void;
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
    ...props
}) => {
    // Calculate canEdit if not provided
    const canEdit = props.canEdit !== undefined
        ? props.canEdit
        : (currentUser.role === 'Admin' || currentUser.role === 'Editor');

    const value = {
        ...props,
        currentUser,
        canEdit
    };

    return (
        <BetDetailContext.Provider value={value}>
            {children}
        </BetDetailContext.Provider>
    );
};
