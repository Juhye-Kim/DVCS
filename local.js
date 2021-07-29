const fs = require("fs");
const { displayStagingArea } = require("./staging");

// init <repository_name> : local 영역에 <repository_name> 저장소 생성
function init(repoName) {
  if (!fs.existsSync(`local/${repoName}`)) {
    fs.mkdirSync(`local/${repoName}`);
    if (fs.existsSync(`local/${repoName}`)) {
      console.log(`created ${repoName} repository.`);
      fs.mkdirSync(`local/${repoName}/objects`);
    }
  }
}

// checkout <repository_name> 명령
function checkout(repoName) {
  return fs.existsSync(`local/${repoName}`);
}

// status
// checkout 전 - local에 있는 전체 저장소 목록을 출력
// checkout 후 - Working directory / Staging Area / Git Repository 영역 파일 목록을 파일 길이, 변경시간과 함께 출력
function status(curRepo) {
  if (curRepo === "") {
    const list = fs.readdirSync(`local`);
    list.forEach((dir) => console.log(`${dir}/`));
  } else {
    displayWorkingDirectory(curRepo);
    displayStagingArea(curRepo);
    displayLoaclRepository(curRepo);
  }
}

// Staging Area 에 존재하는 파일목록 반환
// filename(size)	time 형태 -> 배열로
function displayWorkingDirectory(curRepo) {
  const data = fs.readFileSync(`local/${curRepo}/objects/files.json`, "utf8");
  const files = data ? JSON.parse(data) : null;
  console.log(`---Working Directory/`);
  if (files) {
    for (let file in files) {
      console.log(`${file}(${files[file]["size"]})    ${files[file]["time"]}`);
    }
    return;
  }
}

function displayLoaclRepository(curRepo) {
  const data = fs.readFileSync(
    `local/${curRepo}/objects/repository.json`,
    "utf8"
  );
  const files = data ? JSON.parse(data) : null;
  console.log(`---Git Repository/`);
  if (files) {
    for (let file in files) {
      console.log(`${file}(${files[file].length})`);
    }
    return;
  }
}

exports.init = init;
exports.checkout = checkout;
exports.status = status;
