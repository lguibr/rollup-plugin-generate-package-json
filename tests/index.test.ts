import * as path from 'path'
import { rollup } from 'rollup'
import readPkg from 'read-pkg'
import generatePackageJson, { Options } from '../src'

process.chdir(`${__dirname}/fixtures`)

async function build(options: Options = {}) {
  const bundle = await rollup({
    input: `${options.inputFolder || './dependencies'}/index.js`,
    plugins: [
      generatePackageJson(options)
    ],
    external: ['@google-cloud/bigquery', 'koa', 'uuid/v4']
  })

  await bundle.write({
    file: 'dist/app.js',
    format: 'cjs'
  })
}

function readDistPackageJson() {
  return readPkg({ cwd: 'dist', normalize: false })
}



test('throw if input package.json doesn\'t exist', async () => {
  await expect(build({ inputFolder: './input-file-absent' }))
    .rejects.toThrow('Input package.json file does not exist or has bad format, check "inputFolder" option')
})

test('throw if not possible to save generated file', async () => {
  await expect(build({
    inputFolder: './output-bad-format',
    outputFolder: './output-bad-format/folder'
  })).rejects.toThrow('Unable to save generated package.json file, check "outputFolder" option')
})

test('no options', async () => {
  process.chdir(`${__dirname}/fixtures/./dependencies`)

  const bundle = await rollup({
    input: 'index.js',
    plugins: [
      generatePackageJson()
    ],
    external: ['koa']
  })

  await bundle.write({
    file: path.resolve(process.cwd(), '../../dist/app.js'),
    format: 'cjs'
  })

  process.chdir(`${__dirname}/fixtures`)

  await expect(readDistPackageJson()).resolves.toEqual({
    dependencies: {
      koa: '2.0'
    }
  })
})

test('no dependencies', async () => {
  await build({ inputFolder: './no-dependencies' })

  await expect(readDistPackageJson()).resolves.toEqual({})
})

test('missing dependencies', async () => {
  await build({ inputFolder: './missing-dependencies' })

  await expect(readDistPackageJson()).resolves.toEqual({})
})

test('dependencies', async () => {
  await build({ inputFolder: './dependencies' })

  await expect(readDistPackageJson()).resolves.toEqual({
    dependencies: {
      koa: '2.0'
    }
  })
})

test('base contents', async () => {
  await build({
    inputFolder: './dependencies',
    baseContents: {
      name: 'my-package',
      dependencies: {},
      private: true
    }
  })

  await expect(readDistPackageJson()).resolves.toEqual({
    name: 'my-package',
    dependencies: {
      koa: '2.0'
    },
    private: true
  })
})

test('base contents as function', async () => {
  await build({
    inputFolder: './base-contents-function',
    baseContents: (pkg) => ({
      name: pkg.name,
      main: pkg?.main?.replace('src', 'dist'),
      dependencies: {},
      private: true
    })
  })

  await expect(readDistPackageJson()).resolves.toEqual({
    name: 'test',
    main: 'dist/index.js',
    dependencies: {
      koa: '2.0'
    },
    private: true
  })
})

test('additional dependencies', async () => {
  await build({
    inputFolder: './additional-dependencies',
    additionalDependencies: ['koa-router']
  })

  await expect(readDistPackageJson()).resolves.toEqual({
    dependencies: {
      koa: '2.0',
      'koa-router': '7.4'
    }
  })
})

test('subpath dependencies', async () => {
  await build({ inputFolder: './subpath-dependencies' })

  await expect(readDistPackageJson()).resolves.toEqual({
    dependencies: {
      uuid: '3.3'
    }
  })
})

test('scoped dependencies', async () => {
  await build({ inputFolder: './scoped-dependencies' })

  await expect(readDistPackageJson()).resolves.toEqual({
    dependencies: {
      '@google-cloud/bigquery': '4.4'
    }
  })
})

test('local dependencies', async () => {
  await build({
    inputFolder: './local-dependencies',
    additionalDependencies: {
      koa: '2.11.0',
      'react-calendar': 'file:../react-calendar/react-calendar-v2.13.2.tgz'
    }
  })

  await expect(readDistPackageJson()).resolves.toEqual({
    dependencies: {
      koa: '2.11.0',
      'react-calendar': 'file:../react-calendar/react-calendar-v2.13.2.tgz'
    }
  })
})

test('unique dependencies from multiple chunks', async () => {
  const bundle = await rollup({
    input: [
      './unique-dependencies/app-1.js',
      './unique-dependencies/app-2.js'
    ],
    plugins: [
      generatePackageJson({ inputFolder: './unique-dependencies' })
    ],
    external: ['koa']
  })

  await bundle.write({
    dir: 'dist',
    format: 'cjs'
  })

  await expect(readDistPackageJson()).resolves.toEqual({
    dependencies: {
      koa: '2.0'
    }
  })
})


