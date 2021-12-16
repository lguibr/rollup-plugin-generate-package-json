const normalizeImportModules = (imports) => {
  return imports.map((module) => {
    const pathParts = module.split(/[/\\]/)
    const [fisrtWord] = pathParts as string[]
    const [firstChar] = fisrtWord
    return (firstChar === '@')
      ? `${pathParts[0]}/${pathParts[1]}`
      : pathParts[0]
  })
}
export default normalizeImportModules