const path = require("path")
const fs = require("fs")
const colors = require("colors")
const child_process = require("child_process")
const semver = require("semver")
const currentPackageConfig = require("../../package.json")

const cleanVersionExp = /[^0-9.]+/

module.exports = function(argv) {
    if (!!argv.nocheck) {
        return
    }

    const nodeVersion = String(child_process.execSync("node -v")).replace(cleanVersionExp, "").replace("\n", "")
    const npmVersion = String(child_process.execSync("npm -v")).replace(cleanVersionExp, "").replace("\n", "")

    const nodeVersionRange = semver.Range(currentPackageConfig.engines.node)
    const npmVersionRange = semver.Range(currentPackageConfig.engines.npm)

    const isValidNode = semver.satisfies(nodeVersion, nodeVersionRange)
    const isValidNpm = semver.satisfies(npmVersion, npmVersionRange)

    const errorMessages = []

    if (!isValidNode) {
        errorMessages.push(`${colors.yellow("Node")} need upgrade. ${colors.red(nodeVersion)} => ${colors.green(nodeVersionRange)}`)
    }

    if (!isValidNpm) {
        errorMessages.push(`${colors.yellow("Npm")} need upgrade. ${colors.red(npmVersion)} => ${colors.green(npmVersionRange)}`)
    }

    Object.entries(currentPackageConfig.dependencies).forEach(packageEntry => {
        const [packageName, packageVersion] = packageEntry
        const packageConfigPath = path.join(process.cwd(), "node_modules", packageName, "package.json")

        if (!fs.existsSync(packageConfigPath)) {
            return errorMessages.push(`Package ${colors.red(packageName)} is not installed`)
        }

        if (!semver.validRange(packageVersion)) {
            return
        }

        const installedPackageVersion = require(packageConfigPath).version
        const rangedPackageVersion = semver.Range(packageVersion)

        if (!semver.satisfies(installedPackageVersion, rangedPackageVersion) && !semver.gtr(installedPackageVersion, rangedPackageVersion)) {
            hasError = true
            errorMessages.push(`Package ${colors.yellow(packageName)} need upgrade. ${colors.red(installedPackageVersion)} => ${colors.green(rangedPackageVersion)}`)
        }
    })

    if (errorMessages.length > 0) {
        console.log(colors.red("Validation errors:"))
        console.log(errorMessages.join("\n"))
        console.log(`\nTo fix the problem, run the command ${colors.green("npm ci")}\n`)
        process.exit(1)
    }
}
