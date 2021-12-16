import * as path from 'path'

import { PackageJson } from 'read-pkg'
import { OutputOptions, OutputBundle } from 'rollup'

import readPackageJson from './readPackageJson'
import writePackageJson from './writePackageJson'
// import normalizeImportModules from './normalizeImportModules'


export type Options = {
  inputFolder?: string
  outputFolder?: string
  additionalDependencies?: { [key: string]: string } | string[]
  baseContents?: ((pkg: PackageJson) => PackageJson) | PackageJson
}


export default function generatePackageJson(options: Options = {}) {
  const {
    additionalDependencies = [],
    baseContents = {},
    inputFolder,
    outputFolder
  } = options

  return {
    name: 'generate-package-json',
    generateBundle: async (
      outputOptions: OutputOptions,
      bundle: OutputBundle
    ) => {
      const inputFile = await readPackageJson(inputFolder)
      const outputPath = outputFolder
        || outputOptions.dir
        || path.dirname(outputOptions.file || '')
      let dependencies: string[] = []


      Object.values(bundle).forEach((chunk) => {
        console.log({ chunk })


        // export interface OutputAsset {
        //   fileName: string;
        //   /** @deprecated Accessing "isAsset" on files in the bundle is deprecated, please use "type === \'asset\'" instead */
        //   isAsset: true;
        //   source: string | Buffer;
        //   type: 'asset';
        // }

        // export interface OutputChunk extends RenderedChunk {
        //   code: string;
        //   map?: SourceMap;
        //   type: 'chunk';
        // }

        // if (chunk?.imports) {
        //   console.log('chunks!')
        //   console.log(chunk)
        //   dependencies = [...dependencies, ...normalizeImportModules(chunk.imports)]
        // }
      })

      dependencies = Array.from(
        new Set([
          ...dependencies,
          ...(Array.isArray(additionalDependencies)
            ? additionalDependencies
            : Object.keys(additionalDependencies))
        ])
      ).sort()

      const inputFileDependencies = inputFile.dependencies
      const generatedDependencies = {}

      dependencies.forEach((dependency) => {
        if (inputFileDependencies && inputFileDependencies[dependency]) {
          generatedDependencies[dependency] = inputFileDependencies[dependency]
        }

        if (!Array.isArray(additionalDependencies) && additionalDependencies[dependency]) {
          generatedDependencies[dependency] = additionalDependencies[dependency]
        }
      })

      const generatedContents = {
        ...(typeof baseContents === 'function' ? baseContents(inputFile) : baseContents),
        ...(Object.keys(generatedDependencies).length && { dependencies: generatedDependencies })
      }

      await writePackageJson(outputPath, generatedContents)
    }
  }
}
