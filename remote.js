const fs = require("fs");
const { logDateFormat } = require("./dateFormat");

// 커밋 로그, 커밋한 파일들 목록을 표시
function log(curRepo) {
  if (!curRepo || curRepo === "") {
    console.log("repository not exists");
    return;
  }

  const data = fs.readFileSync(`local/${curRepo}/objects/commit.json`, "utf8");
  const logs = data ? JSON.parse(data) : null;

  if (logs) {
    for (let commit in logs) {
      console.log(`commit "${logs[commit]["message"]}"`);
      findCommitFile(curRepo, logs[commit]["tree"]);
    }
    return;
  }
}

function findCommitFile(curRepo, treeId) {
  if (!curRepo || curRepo === "") {
    console.log("repository not exists");
    return;
  }
  const data = fs.readFileSync(`local/${curRepo}/objects/trees.json`, "utf8");
  const trees = data ? JSON.parse(data) : null;
  const tree = trees && trees[treeId] ? trees[treeId] : null;

  if (tree && tree["blobs"]) {
    const files = JSON.parse(tree["blobs"]);
    for (let file in files) {
      console.log(`${file}(${files[file]["size"]})    ${files[file]["time"]}`);
    }
    return;
  }
}

// log 정보를 {저장소이름}-{년월일-시분}.git 파일에 저장
function exportLog(curRepo) {
  const logFile = logDateFormat(new Date());
  fs.open(
    `local/${curRepo}/objects/${curRepo}-${logFile}.git`,
    "a",
    (err, _) => {
      if (err) console.log("create log file failed");
      else {
        fs.readFile(
          `local/${curRepo}/objects/commit.json`,
          "utf8",
          (err, data) => {
            let prev = {};
            if (data) prev = JSON.parse(data);
            console.log(`export to ${curRepo}-${logFile}.git`);
            fs.writeFile(
              `local/${curRepo}/objects/repository.json`,
              JSON.stringify(prev),
              "utf8",
              (err) => {
                if (err) console.error(err);
              }
            );
          }
        );
      }
    }
  );
}

function pushToRemote() {}

exports.log = log;
exports.exportLog = exportLog;
exports.pushToRemote = pushToRemote;
