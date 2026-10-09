import { useState, useEffect } from 'react';
import { Comment } from '../types';
import { MOCK_COMMENTS } from '../constants';
import { collaborationService } from '../services/collaborationService';

/**
 * A hook to provide real-time comment counts for all sections.
 */
export const useCommentCounts = () => {
    const [counts, setCounts] = useState<Record<string, number>>({});

    useEffect(() => {
        // 1. Set initial counts from the static mock data.
        const initialCounts: Record<string, number> = {};
        MOCK_COMMENTS.forEach(comment => {
            initialCounts[comment.sectionId] = (initialCounts[comment.sectionId] || 0) + 1;
        });
        setCounts(initialCounts);

        // 2. Subscribe to live updates.
        const handleLiveComment = (newComment: Comment) => {
            // Guard against double-counting initial mock data if service behavior changes.
            if (MOCK_COMMENTS.some(c => c.id === newComment.id)) {
                return;
            }
            setCounts(prevCounts => ({
                ...prevCounts,
                [newComment.sectionId]: (prevCounts[newComment.sectionId] || 0) + 1,
            }));
        };

        collaborationService.subscribe('*', handleLiveComment);

        // Cleanup subscription.
        return () => {
            collaborationService.unsubscribe('*', handleLiveComment);
        };
    }, []);

    return counts;
};
