import { Comment, User, Role } from '../types';
import { MOCK_USERS } from '../constants';

type Message = Comment;
type Callback = (message: Message) => void;

const subscribers: Record<string, Callback[]> = {};
let mockUserInterval: number | null = null;

const broadcast = (topic: string, message: Message) => {
    // Broadcast to specific topic listeners
    if (subscribers[topic]) {
        subscribers[topic].forEach(callback => callback(message));
    }
    // Broadcast to wildcard listeners (for features like global comment counts)
    if (subscribers['*']) {
        subscribers['*'].forEach(callback => callback(message));
    }
};

const generateMockReply = (topic: string, userIdToExclude: string): Comment => {
    const otherUsers = MOCK_USERS.filter(u => u.id !== userIdToExclude && (u.role === Role.Editor || u.role === Role.Manager));
    const randomUser = otherUsers[Math.floor(Math.random() * otherUsers.length)];
    const replies = [
        "That's a great point. I'll look into it.",
        "Interesting, I hadn't considered that perspective.",
        "Could you elaborate on that? I'm not sure I follow.",
        "I agree, we should look into this further.",
        "Let's flag this for the next review meeting.",
        "Good catch. Let's add that to the risk assessment.",
        "I'm not so sure. Have we considered the cost implications?",
    ];
    const randomReply = replies[Math.floor(Math.random() * replies.length)];

    return {
        id: `c-mock-reply-${Date.now()}`,
        userId: randomUser.id,
        userName: randomUser.name,
        userPicture: randomUser.picture,
        text: randomReply,
        createdAt: new Date().toISOString(),
        sectionId: topic,
    };
};

// Simulate other users commenting on active topics to make it feel live
const startMockUserActivity = () => {
    if (mockUserInterval) return;
    mockUserInterval = window.setInterval(() => {
        const topics = Object.keys(subscribers).filter(t => t !== '*'); // Exclude wildcard
        if (topics.length > 0) {
            const randomTopic = topics[Math.floor(Math.random() * topics.length)];
            const otherUsers = MOCK_USERS.filter(u => u.role !== Role.Viewer);
            const randomUser = otherUsers[Math.floor(Math.random() * otherUsers.length)];
            const mockComment: Comment = {
                id: `c-mock-activity-${Date.now()}`,
                userId: randomUser.id,
                userName: randomUser.name,
                userPicture: randomUser.picture,
                text: `Just reviewing the ${randomTopic.replace(/_/g, ' ')} section. Looking good.`,
                createdAt: new Date().toISOString(),
                sectionId: randomTopic,
            };
            broadcast(randomTopic, mockComment);
        }
    }, 20000); // A mock user comments every 20 seconds on a random open topic.
};

const stopMockUserActivity = () => {
    if (mockUserInterval) {
        clearInterval(mockUserInterval);
        mockUserInterval = null;
    }
};

/**
 * A mock service that simulates a WebSocket connection for real-time collaboration.
 */
export const collaborationService = {
    connect: () => {
        console.log("(Simulated) WebSocket connected.");
        startMockUserActivity();
    },
    disconnect: () => {
        console.log("(Simulated) WebSocket disconnected.");
        stopMockUserActivity();
    },
    subscribe: (topic: string, callback: Callback) => {
        if (!subscribers[topic]) {
            subscribers[topic] = [];
        }
        subscribers[topic].push(callback);
        console.log(`(Simulated) Subscribed to topic: ${topic}`);
    },
    unsubscribe: (topic: string, callback: Callback) => {
        if (subscribers[topic]) {
            subscribers[topic] = subscribers[topic].filter(cb => cb !== callback);
            if (subscribers[topic].length === 0) {
                delete subscribers[topic];
                console.log(`(Simulated) Unsubscribed from topic: ${topic}`);
            }
        }
    },
    sendMessage: (topic: string, message: Message) => {
        // Broadcast the user's own message immediately to all subscribers (including themselves)
        broadcast(topic, message);

        // Then simulate a reply from another user after a short delay
        setTimeout(() => {
            const mockReply = generateMockReply(topic, message.userId);
            broadcast(topic, mockReply);
        }, 1500 + Math.random() * 2000);
    }
};