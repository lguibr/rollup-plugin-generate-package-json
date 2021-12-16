import writePackage from 'write-pkg'

async function writePackageJson(folder, contents) {
  try {
    return await writePackage(folder, contents)
  } catch (e) {
    throw new Error('Unable to save generated package.json file, check "outputFolder" option')
  }
}

export default writePackageJson
