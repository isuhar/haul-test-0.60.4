const path = require("path")
const fs = require("fs")
const os = require("os")

module.exports = function(argv) {
    const rootDir = fs.realpathSync(path.join(process.cwd(), "."))
    const frontDir = rootDir
    const srcDir = path.join(frontDir, "src")
    const docDir = path.join(frontDir, "doc")
    const cacheDir = path.join(os.tmpdir(), "webpack-cache")
    const buildDir = path.join(process.env.BUILD_DIR || rootDir, "web")

    process.env.NODE_ENV = argv.prod ? "production" : "development"
    process.env.BABEL_ENV = argv.test ? "development-node" : process.env.NODE_ENV
    process.env.APP_NAME = process.env.APP_NAME || "megaplan"

    argv.help = process.env.APP_NAME === "help_static"

    let cpusCount = os.cpus().length

    if (!!argv.reproduceable) {
        cpusCount = Math.floor(cpusCount / 2)
    }

    const isDevMode = !!argv.dev
        || !!argv.test
        || ((!!argv.help || !!argv.mobile) && !argv.prod)
        || false

    return {
        production: !!argv.prod,
        development: !!argv.dev,
        test: !!argv.test,
        help: !!argv.help,
        mobile: !!argv.mobile,
        isDevMode: isDevMode,

        // Only mobile
        platform: argv.platform,
        root: argv.root,
        bundle: argv.bundle,
        // -- end

        teamcity: !!argv.teamcity,
        gitlab: !!argv.gitlab,
        testRealTime: !!argv.testRealTime,

        appName: process.env.APP_NAME,
        nodeEnv: process.env.NODE_ENV,
        babelEnv: process.env.BABEL_ENV,
        browserTest: !!process.env.MEGAPLAN_BROWSER_TEST,

        megaplanVersion: process.env.MEGAPLAN_VERSION || 'undefined_version',
        analyzeReportBaseName: typeof argv.analyzeReportBaseName === "string" && argv.analyzeReportBaseName,
        analyzeReportStats: !!argv.analyzeReportStats,

        rootDir: rootDir,
        frontDir: frontDir,
        srcDir: srcDir,
        docDir: docDir,
        cacheDir: cacheDir,
        buildDir: buildDir,
        publicPath: (argv.staticContentHost ? ("//" + argv.staticContentHost) : "") + "/spa/",

        inlineFileLimit: 10000,
        workersCount: cpusCount - 1
    }
}