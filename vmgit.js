const { init, checkout, status } = require("./local");
const { newFile, updateFile } = require("./file");
const { add } = require("./staging");
const { commit } = require("./commit");
const { log, exportLog, pushToRemote, remoteStatus } = require("./remote");
const readline = require("readline");

// 가상으로 git 동작을 확인하는 프로그램 - 시작하면 셀 프롬프트와 비슷하게 명령을 입력받음
function vmgit() {
  let curRepo = "";

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  function exec() {
    rl.on("line", (input) => {
      if (input === "quit") rl.close();
      checkInput(input);
      rl.prompt();
    }).on("close", () => process.exit());
  }

  function checkInput(input) {
    let commands = input.split(" ");
    let command = commands[0];
    try {
      if (command === "init") {
        init(commands[1]);
      } else if (command === "checkout") {
        if (checkout(commands[1])) {
          curRepo = commands[1] || "";
          rl.setPrompt(`/${commands[1] || ""}> `);
        } else console.log("not exist repository");
      } else if (command === "status") {
        if (commands[1] === "remote") remoteStatus(curRepo);
        else status(curRepo);
      } else if (command === "new") {
        newFile(curRepo, commands[1], commands.slice(2));
      } else if (command === "update") {
        updateFile(curRepo, commands[1], commands.slice(2));
      } else if (command === "add") {
        add(curRepo, commands[1]);
      } else if (command === "commit") {
        commit(curRepo, commands.slice(1).join(" "));
      } else if (command === "log") {
        log(curRepo);
      } else if (command === "export") {
        exportLog(curRepo);
      } else if (command === "push") {
        pushToRemote(curRepo);
      } else {
        console.log("존재하지 않는 명령어입니다. 다시 입력해주세요.");
      }
    } catch (err) {
      console.error(err);
    }
  }

  return function () {
    console.log("vmgit start");
    rl.setPrompt("/> ");
    rl.prompt();
    exec();
  };
}

const program = vmgit();
program();
