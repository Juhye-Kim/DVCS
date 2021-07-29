const fs = require("fs");
const { dateFormat } = require("./dateFormat");

// add <file_name>
// blobs 파일 생성 (원래는 파일당 1개씩 생성된다고 하는데, 객체형식으로 축약)
// 해당 파일을 staging area로 이동했다고 가정, Staged 상태 표시
function add(curRepo, fileName) {
  // 1. fileName파일 내용 가져오기
  const content = fs.readFileSync(`local/${curRepo}/${fileName}.txt`, "utf8");

  // 2. blobs.json (blob 객체 관리 파일)에 내용, 사이즈 기록
  if (content) {
    fs.open(`local/${curRepo}/objects/blobs.json`, "a", (err, _) => {
      if (err) console.log("file add failed");
      else {
        fs.readFile(
          `local/${curRepo}/objects/blobs.json`,
          "utf8",
          (err, data) => {
            let prev = {};
            if (data) prev = JSON.parse(data);
            let newLog = {
              content,
              time: dateFormat(new Date()),
              size: content.length,
            };
            prev[fileName] = newLog;

            fs.writeFile(
              `local/${curRepo}/objects/blobs.json`,
              JSON.stringify(prev),
              "utf8",
              (err) => {
                if (err) console.error(err);
                else displayStagingArea(curRepo);
              }
            );
          }
        );
      }
    });
  }
}

// Staging Area 에 존재하는 파일목록 반환
// filename(size)	time 형태 -> 배열로
function displayStagingArea(curRepo) {
  const data = fs.readFileSync(`local/${curRepo}/objects/blobs.json`, "utf8");
  const files = data ? JSON.parse(data) : null;
  console.log(`---Staing Area/`);
  if (files) {
    for (let file in files) {
      console.log(`${file}(${files[file]["size"]})    ${files[file]["time"]}`);
    }
    return;
  }
}

exports.add = add;
exports.displayStagingArea = displayStagingArea;
