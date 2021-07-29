const fs = require("fs");
const { dateFormat } = require("./dateFormat");

/*
new <file_name> <내용>
- checkout선택한 저장소 working directory에 파일 생성
- 처음 생성한 파일 상태는 Untracked 상태로 표시
- 내용은 파일 내용으로 저장
*/

function newFile(curRepo, fileName, text) {
  if (!curRepo || curRepo === "") {
    console.log("repository not exists");
    return;
  }

  if (fs.existsSync(`local/${curRepo}`)) {
    fs.writeFile(`local/${curRepo}/${fileName}.txt`, text.join(" "), (err) =>
      err === null
        ? console.log(`${fileName}(${text.join(" ").length})`)
        : console.log("파일 생성 실패", err)
    );
  } else console.log("repository not exists");

  // objects/files.json 파일에 생성한 파일 정보 기록 (이름, 생성시각, 크기, 상태)
  fs.open(`local/${curRepo}/objects/files.json`, "a", (err, _) => {
    if (err) console.log("file create failed");
    else {
      fs.readFile(
        `local/${curRepo}/objects/files.json`,
        "utf8",
        (err, data) => {
          let prev = {};
          if (data) prev = JSON.parse(data);
          let newLog = {
            time: dateFormat(new Date()),
            size: text.join(" ").length,
            status: "untracked",
          };
          prev[fileName] = newLog;

          fs.writeFile(
            `local/${curRepo}/objects/files.json`,
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

// update <filename> <내용> 명령
// - 파일 내용 변경
// - 현재 시간으로 업데이트
//   - 단, new 명령이 아니라 터미널이나 디렉토리에서 파일만 생성한 경우는 고려 X
function updateFile(curRepo, fileName, text) {
  if (fs.existsSync(`local/${curRepo}/${fileName}.txt`)) {
    fs.writeFile(`local/${curRepo}/${fileName}.txt`, text.join(" "), (err) =>
      err === null
        ? console.log(`${fileName}(${text.join(" ").length})`)
        : console.log("file update failed", err)
    );
  } else console.log("repository not exists");

  // objects/files.json 파일에 업데이트 정보 기록 (생성시각, 크기)
  fs.open(`local/${curRepo}/objects/files.json`, "a", (err, _) => {
    if (err) console.log("file create failed");
    else {
      fs.readFile(
        `local/${curRepo}/objects/files.json`,
        "utf8",
        (err, data) => {
          let prev = JSON.parse(data);
          let newLog = { ...prev[fileName] };
          newLog.time = dateFormat(new Date());
          newLog.size = text.join(" ").length;
          prev[fileName] = newLog;

          fs.writeFile(
            `local/${curRepo}/objects/files.json`,
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

exports.newFile = newFile;
exports.updateFile = updateFile;
