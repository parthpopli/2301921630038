import express from 'express';
import { Log, setAuthToken } from './logging-middleware/logger.mjs';
import { scheduleMaintenance } from './vehicle-scheduler-be/vehicle.mjs';
import { getPriorityNotifications } from './notification-app-be/notification.mjs';

const app = express();
app.use(express.json());


const getBearerToken = (req) => {
    return req.headers.authorization?.split(' ')[1] || '';
};

//post
app.post('/api/logs', async (req, res) => {
    try {
        const token = getBearerToken(req);
        setAuthToken(token);
        const { stack, level, package: pkg, message } = req.body;
        const result = await Log(stack, level, pkg, message);
        res.status(200).json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

//get
app.get('/api/vehicle/schedule', async (req, res) => {
    try {
        const token = getBearerToken(req);
        const result = await scheduleMaintenance(token);
        res.status(200).json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});


app.get('/api/notifications/priority', async (req, res) => {
    try {
        const token = getBearerToken(req);
        const result = await getPriorityNotifications(token, 10);
        res.status(200).json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.listen(3000, () => console.log("Local Evaluation Server active"));
