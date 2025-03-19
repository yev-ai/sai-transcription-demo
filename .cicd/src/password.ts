import { RandomPassword } from '@pulumi/random';

export const createPassword = (pulumiResourceName: string) =>
  new RandomPassword(pulumiResourceName, {
    length: 32,
    keepers: {
      string: pulumiResourceName,
    },
    special: false,
    upper: true,
    lower: true,
    numeric: true,
    minLower: 8,
    minUpper: 8,
    minNumeric: 8,
  }).result;
