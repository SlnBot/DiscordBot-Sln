function bossTimer() {
  var bossName, nextPopTime, popTime, popPosition, jsonData, textMessage;
  var now      = Moment.moment(); //現在日時を取得
  var ss       = SpreadsheetApp.getActiveSpreadsheet();
  var sheet    = ss.getSheetByName('ボス管理表');
  var rows     = sheet.getDataRange().getValues();

  //自動更新用判定時間
  autoUpdateTime = Moment.moment().subtract(60,"minutes"); //60分前

  for (var i=2; i<rows.length; i++) {
    nextPopTime = rows[i][4];
    nextPopTime = Moment.moment(nextPopTime);
    popTime     = Moment.moment(nextPopTime).format("HH:mm");
    judgeTime   = nextPopTime.subtract(10,"minutes"); //10分前通知
   // Logger.log(rows[i][2]);

    //10分前通知
    if (judgeTime.format("YYYYMMDDHHmm") == now.format("YYYYMMDDHHmm")) {
    //debug用
    //if (judgeTime.format("YYYYMMDDHHmm") == "202106190340"){

      /*  変更前のテキスト作成部分
      bossName    = rows[i][2];
      popPlace    = rows[i][6];
      popPosition = rows[i][7];
      textMessage = "【" + bossName + "】出現の10分前でござる！\n【"
       + popPlace + "】で【" + popTime + "】" + " 前回位置【" + popPosition + "】\n";
      */

      var jsonData = {
        username: "ハンゾーくん",
        //avatar_url: "",
        content: "ボス出現の10分前でござる！\n【" + sheet.getRange(i+1, 3).getValue() + "】【"
        + popTime + "】【" + sheet.getRange(i+1, 7).getValue() + "】",
        embeds: [
          {
            title: sheet.getRange(i+1, 3).getValue(),
            color: 11730954,
            thumbnail: {
            url: sheet.getRange(i+1, 10).getValue()
            },
          fields: [
            {
              "name": "Time",
              "value": popTime,
              "inline":true
            },
            {
              "name": "Location",
              "value": sheet.getRange(i+1, 7).getValue(),
              "inline":true
            },
            {
              "name": "Memo",
              "value": sheet.getRange(i+1, 8).getValue(),
              "inline":false
            }
          ]
          }
        ]
      };

      sendDiscord(jsonData);
    
    }
  
    //判定時間を過ぎても更新がなければ次回の時間を討伐時刻とするように自動更新
    nextPopTime = rows[i][4];
    nextPopDt = Moment.moment(nextPopTime);
    if (autoUpdateTime.isAfter(nextPopDt)) {
        rowNum = i+1;
        sheet.getRange(rowNum, 4).setValue(nextPopDt.format('YYYY/MM/DD HH:mm'));
    }
  }
}


function sendDiscord(jsonData){
  //Logger.log(jsonData);
  if(jsonData == ""){
    // 通知内容が空の場合は何もしない
    return;
  }

  const WEBHOOK_URL = "DiscordのWEBHOOK URL";

  const payload = JSON.stringify(jsonData);
  const options = {
    "method" : "post",
    "contentType" : "application/json",
    "payload" : payload
  };

  UrlFetchApp.fetch(WEBHOOK_URL, options);

}
