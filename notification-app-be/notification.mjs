import axios from 'axios';

const API_URL = 'http://4.224.186.213/evaluation-service/notifications';

const NOTIFICATION_WEIGHTS = {
    'Placement': 3,
    'Result': 2,
    'Event': 1
};

export async function getPriorityNotifications(authToken, limit = 10) {
    const headers = {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
    };

    const response = await axios.get(API_URL, { headers });
    const notifications = response.data.notifications;

    const evaluated = notifications.map(item => ({
        ...item,
        weight: NOTIFICATION_WEIGHTS[item.Type] || 0,
        recencyTimestamp: new Date(item.Timestamp).getTime()
    }));

    evaluated.sort((a, b) => {
        if (b.weight !== a.weight) {
            return b.weight - a.weight;
        }
        return b.recencyTimestamp - a.recencyTimestamp;
    });

    return evaluated.slice(0, limit).map(({ ID, Type, Message, Timestamp }) => ({
        ID,
        Type,
        Message,
        Timestamp
    }));
}