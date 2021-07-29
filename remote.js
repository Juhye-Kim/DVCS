const fs = require("fs");
const { commit } = require("./commit");
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

// remote 폴더로 복사
function pushToRemote(curRepo) {
  if (!curRepo || curRepo === "") {
    console.log("repository not exists");
    return;
  }
  // 1. 마지막까지 local에서 commit한 이력 (local/curRepo/objects 파일 -> remote/curRepo/objects에 생성)
  makeFolder(`remote/${curRepo}`);
  makeFolder(`remote/${curRepo}/objects`);
  console.log("push some commits...");
  ["commit.json", "trees.json"].forEach((file) => copyFile(curRepo, file));

  // 2. commit기록 push
  const data = fs.readFileSync(`local/${curRepo}/objects/commit.json`, "utf8");
  const commits = data ? JSON.parse(data) : null;
  if (commits) {
    for (let commit in commits) {
      console.log(`commit "${commits[commit]["message"]}" pushed`);
    }
  }

  // 3. 모든 Git Repo 파일 복사 (repository.json 파일들 -> remote/curRepo에 생성)
  fs.readFile(
    `local/${curRepo}/objects/repository.json`,
    "utf8",
    (err, data) => {
      let prev = {};
      if (data) prev = JSON.parse(data);
      for (let file in prev) {
        pushFile(curRepo, file, prev[file]);
      }
    }
  );
}

function copyFile(curRepo, fileName) {
  fs.open(`local/${curRepo}/objects/${fileName}`, "a", (err, _) => {
    fs.readFile(`local/${curRepo}/objects/${fileName}`, "utf8", (err, data) => {
      let prev = {};
      if (data) prev = JSON.parse(data);
      fs.writeFile(
        `remote/${curRepo}/objects/${fileName}`,
        JSON.stringify(prev),
        "utf8",
        (err) => {
          if (err) console.error(err);
        }
      );
    });
  });
}

function pushFile(curRepo, fileName, text) {
  fs.open(`remote/${curRepo}/${fileName}.txt`, "a", (err, _) => {
    fs.writeFile(`remote/${curRepo}/${fileName}.txt`, text, "utf8", (err) => {
      if (err) console.error(err);
    });
  });
}

function makeFolder(path) {
  !fs.existsSync(path) && fs.mkdirSync(path);
}

function remoteStatus(curRepo) {
  if (!curRepo || curRepo === "") {
    console.log("repository not exists");
    return;
  }
  // 1. 마지막 커밋 출력
  // last commit "modified file"
  const data = fs.readFileSync(`remote/${curRepo}/objects/commit.json`, "utf8");
  const commits = data ? JSON.parse(data) : null;
  if (commits) {
    const commitsLen = Object.keys(commits).length;
    console.log(`last commit "${commits[commitsLen - 1]["message"]}"`);
  } else console.log(`no commits`);

  // 2. 모든 파일 출력
  // readme(14)	2019-03-27 12:11:01
  const list = fs.readFileSync(`remote/${curRepo}/objects/trees.json`, "utf8");
  const trees = list ? JSON.parse(list) : null;
  if (trees) {
    for (let id in trees) {
      let blobs = JSON.parse(trees[id]["blobs"]);
      for (file in blobs) {
        const { size, time } = blobs[file];
        console.log(`${file}(${size})    ${time}`);
      }
    }
  } else console.log(`no files`);
}

exports.log = log;
exports.exportLog = exportLog;
exports.pushToRemote = pushToRemote;
exports.remoteStatus = remoteStatus;
