import { EnvironmentVariableUndetectedException } from '@shared/errors';

export function getEnv(name: string, fallback?: string): string {
  const value = process.env[name];

  if (!value) {
    if (fallback) {
      return fallback;
    }

    throw new EnvironmentVariableUndetectedException({
      message: `missing env: ${name}`,
    });
  }

  return value;
}
