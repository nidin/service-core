const padding = 20;
export function logVar(name: string, value: any) {
  console.log(`    ${name.padEnd(padding, " ")}: `, value);
}
