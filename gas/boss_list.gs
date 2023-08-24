function bossList() {
    var textMessage = getBossList();
    sendDiscordBossList(textMessage);
}

function getBossList(){
  var textMessage;
  var now      = Moment.moment(); //現在日時を取得
  var ss       = SpreadsheetApp.getActiveSpreadsheet();
  var sheet    = ss.getSheetByName('シート名');
  var rows     = sheet.getDataRange().getValues();
　
  var list = [];
  for (var i=2; i<rows.length; i++) {
    list[i] = [rows[i][2],//ボス名
     Utilities.formatDate(rows[i][4],'Asia/Tokyo', 'MM/d HH:mm'), //出現時刻
     Moment.moment(rows[i][4]), // 比較用出現時刻
     rows[i][6], // 出現場所
     rows[i][7], // 出現位置
    ];
  }
  list.sort(function(a, b) {return new Date(a[1]) - new Date(b[1]);} );
  var textMessage = "◆6時間以内の出現ボス一覧\n---\n";

    border = Moment.moment().add(6, "hours");
    list.forEach(function( val ) {
      if (now < val[2] && val[2] < border) {
        textMessage += "【" + val[1] + " " + val[0] + "】\n　　　　　場所："+ val[3] + "\n　　　　　メモ：" + val[4] + "\n";
      }
    });

    textMessage += "---";

    //Logger.log( textMessage );
    setTrigger("bossList"); //ここにトリガーとして実行したい関数名を記述
    return textMessage;
}


function sendDiscordBossList(textMessage){
  const WEBHOOK_URL = "https://discordapp.com/api/webhooks/933508242930278460/TBkevHCOlYLulF6clJL976m79kft8VFciSufcj8BwfoTMsB7WKxtFEt3SGBX3WRoeYRi";

  const payload = {
    username: "ハンゾーくん",
    content: textMessage,
  };

  UrlFetchApp.fetch(WEBHOOK_URL, {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
  });
}


function setTrigger(func_name) {
  // 指定のトリガーがあれば削除する。
  var triggers = ScriptApp.getProjectTriggers();
  for(var i = 0; i < triggers.length; i++){
    if(triggers[i].getHandlerFunction() == func_name)
      ScriptApp.deleteTrigger(triggers[i]);
  }
  // 1時間後の00分に起動されるようトリガーを設定
  var trigger_setTime = new Date();
  trigger_setTime.setHours(trigger_setTime.getHours() + 1, 0, 0, 0);
  ScriptApp.newTrigger(func_name).timeBased().at(trigger_setTime).create();
}
