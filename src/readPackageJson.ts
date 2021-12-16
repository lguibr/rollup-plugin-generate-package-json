import readPackage from 'read-pkg'


async function readPackageJson(folder) {
  try {
    return await readPackage({ normalize: false, ...(folder && { cwd: folder }) })
  } catch (e) {
    throw new Error('Input package.json file does not exist or has bad format, check "inputFolder" option')
  }
}

export default readPackageJson