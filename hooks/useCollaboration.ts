import { useState, useEffect, useCallback } from 'react';
import { Comment, User } from '../types';
import { MOCK_COMMENTS } from '../constants';
import { collaborationService } from '../services/collaborationService';

/**
 * A hook to manage real-time collaboration for a specific section (topic).
 * It uses a simulated WebSocket service to send and receive comments.
 */
export const useCollaboration = (sectionId: string | null, authenticatedUser: User) => {
    const [comments, setComments] = useState<Comment[]>([]);

    // Effect to connect/disconnect the global collaboration service
    useEffect(() => {
        collaborationService.connect();
        return () => {
            collaborationService.disconnect();
        };
    }, []);

    // Effect to handle topic subscriptions and initial data loading
    useEffect(() => {
        if (!sectionId) {
            setComments([]);
            return;
        }

        // Load initial comments for the section from mock data
        const initialComments = MOCK_COMMENTS.filter(c => c.sectionId === sectionId);
        setComments(initialComments);

        // Callback to handle incoming messages from the service
        const handleNewComment = (newComment: Comment) => {
            // Ensure the comment belongs to the currently viewed section
            if (newComment.sectionId === sectionId) {
                setComments(prev => {
                    // Prevent adding duplicate messages that might be broadcast
                    if (prev.some(c => c.id === newComment.id)) {
                        return prev;
                    }
                    return [...prev, newComment];
                });
            }
        };

        collaborationService.subscribe(sectionId, handleNewComment);

        // Cleanup function for when the sectionId changes or the component unmounts
        return () => {
            collaborationService.unsubscribe(sectionId, handleNewComment);
        };
    }, [sectionId]);

    const addComment = useCallback((text: string) => {
        if (!sectionId) return;

        const newComment: Comment = {
            id: `c-user-${Date.now()}`,
            userId: authenticatedUser.id,
            userName: authenticatedUser.name,
            userPicture: authenticatedUser.picture,
            text: text,
            createdAt: new Date().toISOString(),
            sectionId: sectionId,
        };

        collaborationService.sendMessage(sectionId, newComment);

    }, [sectionId, authenticatedUser]);

    return { comments, addComment };
};