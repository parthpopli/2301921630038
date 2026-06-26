import axios from 'axios';

const LOG_API_URL = 'http://4.224.186.213/evaluation-service/logs';

const CONSTRAINTS = {
    stacks: ['backend', 'frontend'],
    levels: ['debug', 'info', 'warn', 'error', 'fatal'],
    packages: {
        backend: ['cache', 'controller', 'cron_job', 'db', 'domain', 'handler', 'repository', 'route', 'service'],
        frontend: ['api', 'component', 'hook', 'page', 'state', 'style'],
        shared: ['auth', 'config', 'middleware', 'utils']
    }
};

let activeAuthToken = null;

export function setAuthToken(token) {
    activeAuthToken = token;
}

function validatePayload(stack, level, pkg) {
    if (!CONSTRAINTS.stacks.includes(stack)) throw new Error();
    if (!CONSTRAINTS.levels.includes(level)) throw new Error();

    const isBackendValid = stack === 'backend' && CONSTRAINTS.packages.backend.includes(pkg);
    const isFrontendValid = stack === 'frontend' && CONSTRAINTS.packages.frontend.includes(pkg);
    const isSharedValid = CONSTRAINTS.packages.shared.includes(pkg);

    if (!isBackendValid && !isFrontendValid && !isSharedValid) throw new Error();
}

export async function Log(stack, level, packageName, message) {
    const normalizedStack = stack?.toLowerCase();
    const normalizedLevel = level?.toLowerCase();
    const normalizedPackage = packageName?.toLowerCase();

    validatePayload(normalizedStack, normalizedLevel, normalizedPackage);

    const response = await axios.post(
        LOG_API_URL,
        {
            stack: normalizedStack,
            level: normalizedLevel,
            package: normalizedPackage,
            message: message
        },
        {
            headers: {
                'Authorization': activeAuthToken ? `Bearer ${activeAuthToken}` : '',
                'Content-Type': 'application/json'
            }
        }
    );
    return response.data;
}