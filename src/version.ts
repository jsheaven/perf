import { resolve, parse } from 'path'
import { fileURLToPath } from 'url'
import { readFile } from 'fs/promises'

/** returns the package.json object parsed */
export const getPackageJson = async (packageJsonPath: string) => {
  return JSON.parse(await readFile(packageJsonPath, { encoding: 'utf-8' }))
}

/** determines the package.json of the project itself and returns its object parsed */
export const getOwnVersion = async () =>
  await getPackageJson(resolve(parse(fileURLToPath(import.meta.url)).dir, '../package.json'))
