const fs = require("fs");
const { dateFormat } = require("./dateFormat");

// commit <commit_log>
// staging area에 있는 모든 파일을 git repository에 등록
// 커밋된 파일들을 커밋 시간과 함께 Unmodified 상태로 표시
function commit(curRepo, msg) {
  // 1. trees.json 파일 생성
  //   tree들을 관리하는 파일 (각 트리는 고유id 가지고 있음)
  // 2. blobs에 있는 내용을 tree로 싹다 옮김
  const blobs = fs.readFileSync(`local/${curRepo}/objects/blobs.json`, "utf8");
  if (blobs) {
    fs.open(`local/${curRepo}/objects/trees.json`, "a", (err, _) => {
      if (err) console.log("file commit failed");
      else {
        fs.readFile(
          `local/${curRepo}/objects/trees.json`,
          "utf8",
          (err, data) => {
            let prev = {};
            if (data) prev = JSON.parse(data);
            let treeId = Object.keys(prev).length + 1;
            let newTree = {
              blobs,
              time: dateFormat(new Date()),
            };
            prev[treeId] = newTree;

            fs.writeFile(
              `local/${curRepo}/objects/trees.json`,
              JSON.stringify(prev),
              "utf8",
              (err) => {
                if (err) console.error(err);
              }
            );

            fs.writeFile(
              `local/${curRepo}/objects/blobs.json`,
              JSON.stringify({}),
              "utf8",
              (err) => {
                if (err) console.error(err);
              }
            );
            commitLog(curRepo, treeId, msg);
          }
        );
      }
    });
  }

  // 3. commit.json 파일 생성
  // 4. 커밋 메시지 기록
  function commitLog(curRepo, treeId, message) {
    fs.open(`local/${curRepo}/objects/commit.json`, "a", (err, _) => {
      if (err) console.log("file commit failed");
      else {
        fs.readFile(
          `local/${curRepo}/objects/commit.json`,
          "utf8",
          (err, data) => {
            let prev = {};
            if (data) prev = JSON.parse(data);
            let commitId = Object.keys(prev).length + 1;
            let commitTime = dateFormat(new Date());
            let newLog = {
              tree: treeId,
              message,
              time: commitTime,
            };
            prev[commitId] = newLog;

            fs.writeFile(
              `local/${curRepo}/objects/commit.json`,
              JSON.stringify(prev),
              "utf8",
              (err) => {
                if (err) console.error(err);
              }
            );
            // 6. 커밋 파일 목록 보여줌, repo에 업데이트
            printCommitFiles(curRepo, treeId, commitTime);
          }
        );
      }
    });
  }
}

// commit된 파일들 출력
function printCommitFiles(curRepo, treeId, commitTime) {
  const data = fs.readFileSync(`local/${curRepo}/objects/trees.json`, "utf8");
  const trees = data ? JSON.parse(data) : null;
  const tree = trees && trees[treeId] ? trees[treeId] : null;

  console.log(`---Commit files/`);
  if (tree && tree["blobs"]) {
    const files = JSON.parse(tree["blobs"]);
    updateRepository(curRepo, files);
    for (let file in files) {
      console.log(`${file}(${files[file]["size"]})    ${commitTime}`);
    }
    return;
  }
}

// 5. git repository에 파일 기록
function updateRepository(curRepo, files) {
  fs.open(`local/${curRepo}/objects/repository.json`, "a", (err, _) => {
    if (err) console.log("update repository failed");
    else {
      fs.readFile(
        `local/${curRepo}/objects/repository.json`,
        "utf8",
        (err, data) => {
          let prev = {};
          if (data) prev = JSON.parse(data);
          if (files) {
            for (let file in files) {
              prev[file] = files[file]["content"];
            }
          }
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
  });
}

exports.commit = commit;
