import { JestConfigWithTsJest, pathsToModuleNameMapper } from 'ts-jest'
import { compilerOptions } from '../tsconfig.json'

const jestE2eConfig: JestConfigWithTsJest = {
    moduleFileExtensions: ['js', 'json', 'ts','tsx'],
    rootDir: '../.',
    testEnvironment: 'node',
    testRegex: '.e2e-spec.ts$',
    transform: {
        '^.+\\.(t|j)s$': 'ts-jest',
        '^.+\\.tsx$': 'ts-jest',
    },
    moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
        prefix: '<rootDir>',
    }),
}

export default jestE2eConfig
