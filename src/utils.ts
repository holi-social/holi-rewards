export const requireEnv = (envVar: string): string => {
  const value = Deno.env.get(envVar);
  if (!Deno.env.has(envVar) || value === undefined) {
    throw new Error(`Environment variable "${envVar}" must be set.`);
  }

  return value;
};
