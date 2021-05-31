// entrypoint

// autoupdater snippet
// https://www.npmjs.com/package/auto-git-update
import AutoGitUpdate from 'auto-git-update';

const config = {
    repository: 'https://github.com/FlipperLP/dot2wing-firmware',
    tempLocation: 'C:/Users/scheg/Desktop/tmp/',
    ignoreFiles: ['util/config.js'],
    executeOnComplete: 'C:\\Users\\scheg\\Desktop\\worksapce\\AutoGitUpdate\\startTest.bat',
    exitOnComplete: true
}

const updater = new AutoGitUpdate(config);

updater.autoUpdate();