// Centralized permissions config
const ROLE_PERMISSIONS = {
  Junior: { allowedEnvs: ['stage'], maxCostPerEnv: { default: 100 } },
  Senior: { allowedEnvs: ['stage', 'preprod', 'prod'], maxCostPerEnv: { stage: 500, preprod: 500, prod: 1000, default: 500 } },
  Lead: { allowedEnvs: ['*'], maxCostPerEnv: { default: Infinity } }
};

// Internal generic checker (no role conditionals/dupe/unreachable; specific reasons on fail)
function checkPermission(role, env, cost) {
  const roleStr = (role || '').toString().trim();
  const envStr = (env || '').toString().trim().toLowerCase();
  const costNum = parseFloat(cost) || 0;
  const perm = ROLE_PERMISSIONS[roleStr];
  if (!perm) return { allowed: false, reason: 'Invalid or unknown role' };
  
  const allowedEnv = perm.allowedEnvs.includes(envStr) || perm.allowedEnvs.includes('*');
  if (!allowedEnv) return { allowed: false, reason: `Environment '${envStr}' not allowed for role '${roleStr}'` };
  
  const maxCost = perm.maxCostPerEnv[envStr] || perm.maxCostPerEnv.default;
  if (costNum >= maxCost) return { allowed: false, reason: `Cost ${costNum} exceeds limit for ${roleStr} in ${envStr}` };
  
  return { allowed: true };
}

// First-class auth module (generic/reusable)
export const AuthGuard = {
  // For read/list/fetch: simple boolean
  canAccessWorkflows(role, env, cost) {
    return checkPermission(role, env, cost).allowed;
  },
  // For create: structured result (specific reason only on failure)
  evaluateWorkflowCreation(role, env, cost) {
    const result = checkPermission(role, env, cost);
    if (!result.allowed) {
      return { allowed: false, reason: result.reason || 'Insufficient permissions for this role/environment/cost' };
    }
    return { allowed: true };
  }
};
