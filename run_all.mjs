import axios from 'axios';
import { Log, setAuthToken } from './logging-middleware/logger.mjs';
import { scheduleMaintenance } from './vehicle-scheduler-be/vehicle.mjs';
import { getPriorityNotifications } from './notification-app-be/notification.mjs';

const BASE_URL = 'http://4.224.186.213/evaluation-service';

const REGISTRATION_PAYLOAD = {
    email: "aids23068@glbitm.ac.in", 
    name: "Parth popli",              
    mobileNo: "8920959277",            
    githubUsername: "parthpopli",   
    rollNo: "2301921630038",        
    accessCode: "xxkJnk" 
};

async function executeEvaluationFlow() {
    let clientID, clientSecret, accessToken;

    try {
        console.log("Registering with test server...");
        const regRes = await axios.post(`${BASE_URL}/register`, REGISTRATION_PAYLOAD);
        clientID = regRes.data.clientID;
        clientSecret = regRes.data.clientSecret;
        console.log(`Registration Successful!\n   ClientID: ${clientID}\n   ClientSecret: ${clientSecret}`);
    } catch (err) {
        console.log("Account already registered. Using fallback session window structures...");
        
        
        clientID = "d9cbb699-6a27-444a-8d59-8b1befa816da"; 
        clientSecret = "tVJaaaRBSeXcRXeM"; 
    }

    try {
        console.log("\nAuthenticating to get Access Token...");
        const authRes = await axios.post(`${BASE_URL}/auth`, {
            email: REGISTRATION_PAYLOAD.email,
            name: REGISTRATION_PAYLOAD.name,
            rollNo: REGISTRATION_PAYLOAD.rollNo,
            accessCode: REGISTRATION_PAYLOAD.accessCode,
            clientID,
            clientSecret
        });
        accessToken = authRes.data.access_token;
        console.log("Token Obtained Successfully!");
        console.log(accessToken);
    } catch (err) {
        console.error("Authentication critical failure:", err.response?.data || err.message);
        return;
    }

    try {
        console.log("\nTesting Logging Middleware API connectivity...");
        setAuthToken(accessToken);
        const logRes = await Log("backend", "error", "handler", "received string, expected bool");
        console.log("Remote Log Recorded. LogID:", logRes.logID || logRes.id || "Saved");
    } catch (err) {
        console.error("Logging Middleware Failed:", err.message);
    }

    try {
        console.log("\nExecuting Vehicle Maintenance Solver...");
        const schedules = await scheduleMaintenance(accessToken);
        console.log("Optimization Completed for all depots!");
        console.dir(schedules, { depth: null, colors: true });
    } catch (err) {
        console.error("Vehicle Scheduler Failed:", err.response?.data || err.message);
    }

    try {
        console.log("\nFetching Top 10 Priority Notifications...");
        const alerts = await getPriorityNotifications(accessToken, 10);
        console.log("Priority Inbox parsed successfully!");
        console.table(alerts);
    } catch (err) {
        console.error("Priority Notification Failed:", err.response?.data || err.message);
    }
}

executeEvaluationFlow();
