import axios from 'axios';

const BASE_URL = 'http://4.224.186.213/evaluation-service';

function solveKnapsack(tasks, maxBudget) {
    const n = tasks.length;
    const dp = Array.from({ length: n + 1 }, () => Array(maxBudget + 1).fill(0));

    for (let i = 1; i <= n; i++) {
        const { Duration, Impact } = tasks[i - 1];
        for (let w = 0; w <= maxBudget; w++) {
            if (Duration <= w) {
                dp[i][w] = Math.max(dp[i - 1][w], dp[i - 1][w - Duration] + Impact);
            } else {
                dp[i][w] = dp[i - 1][w];
            }
        }
    }

    const selectedTasks = [];
    let w = maxBudget;
    for (let i = n; i > 0 && w > 0; i--) {
        if (dp[i][w] !== dp[i - 1][w]) {
            selectedTasks.push(tasks[i - 1]);
            w -= tasks[i - 1].Duration;
        }
    }

    return {
        totalImpact: dp[n][maxBudget],
        totalDuration: maxBudget - w,
        tasks: selectedTasks.reverse()
    };
}

export async function scheduleMaintenance(authToken) {
    const headers = {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
    };

    const [depotsRes, vehiclesRes] = await Promise.all([
        axios.get(`${BASE_URL}/depots`, { headers }),
        axios.get(`${BASE_URL}/vehicles`, { headers })
    ]);

    const depots = depotsRes.data.depots;
    const tasks = vehiclesRes.data.vehicles;

    return depots.map(depot => {
        const result = solveKnapsack(tasks, depot.MechanicHours);
        return {
            depotID: depot.ID,
            availableHours: depot.MechanicHours,
            achievedImpact: result.totalImpact,
            hoursUsed: result.totalDuration,
            assignedTasks: result.tasks
        };
    });
}