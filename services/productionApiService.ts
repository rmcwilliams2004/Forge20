import { Project, User, ProjectVersion, SubscriptionStatus } from '../types';

/**
 * Production API Service Orchestrator
 * This service manages the transition from simulated browser storage to
 * the production PLaaS backend endpoints.
 */

const IS_PROD = false; // Toggle to switch between Mock and Production API
const API_BASE = 'https://api.synapseforge.ai';

export const projectApi = {
    /**
     * Persists a new version to the project history ledger.
     */
    commitVersion: async (userId: string, version: ProjectVersion): Promise<void> => {
        if (!IS_PROD) {
            console.log("(Simulated) Version committed to local ledger:", version.commitMessage);
            return;
        }

        const response = await fetch(`${API_BASE}/api/projects/version`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userId}` },
            body: JSON.stringify(version),
        });

        if (!response.ok) throw new Error("Failed to commit version to production ledger.");
    },

    /**
     * Triggers the Pro Trial activation handshake.
     */
    activateTrial: async (userId: string): Promise<{ status: SubscriptionStatus; trialEndsAt: string }> => {
        if (!IS_PROD) {
            await new Promise(r => setTimeout(r, 1500));
            return {
                status: SubscriptionStatus.PRO_TRIAL,
                trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
            };
        }

        const response = await fetch(`${API_BASE}/api/billing/activate-trial`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${userId}` }
        });

        return await response.json();
    }
};

export const adminApi = {
    getOperationalMetrics: async () => {
        if (!IS_PROD) return null;
        const response = await fetch(`${API_BASE}/api/admin/metrics`);
        return await response.json();
    }
};
