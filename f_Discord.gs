function doPost(e) {
  var ss       = SpreadsheetApp.openById("スプレッドシートID");
  var sheet    = ss.getSheetByName('シート名');
  
  //行の数を取得
  var rows     = sheet.getDataRange().getValues();
  
  //スプレッドシート列番号
  var sheetHeader = {
    bossNameCol : 2,
    bossEndTimeCol : 4,
    popPosition : 8
    };

  var postData = JSON.parse(e.postData.contents);
  //var postData = {bossName : '', hhmm : "20:59", pPosi : '不明', callFrom : 'resetTime'};
  var resMsg, jsonData;

  if (postData.callFrom == 'getList') {

    //bossリスト抽出
    var textMsg = getBossList();
    resMsg = {title: "List", data: textMsg};

  } else if (postData.callFrom == 'reSet') {
    var nowDate  = Moment.moment().format("MM/DD");
    var resetTime = nowDate + " " + postData.hhmm;
    
    sheet.getRange(3, 4, sheet.getLastRow() - 2).setValue(resetTime);

    jsonData  = {
      username: "ハンゾーくんの密書",
      content:"仮のサーバアップ時間：【" + resetTime + "】にセットいたしそうろう～。",
      avatar_url: "画像URL",
      title: "リセット処理",
      color: 0x00BA0A,
    };

    resMsg = jsonData;

    delTrigger("bossList"); //ここにトリガーとして実行したい関数名を記述

  } else {

    //bossタイム更新
    var res = bossTimeUpdate(postData, sheetHeader, sheet);
    //Logger.log(Number.isFinite(res));
    // 行数が帰ってきたら正常終了
    if (Number.isFinite(res)){
      endDt   = sheet.getRange(res, sheetHeader.bossEndTimeCol).getValue();
      　// Logger.log(endDt);
      endDt = Utilities.formatDate(endDt, 'Asia/Tokyo', 'MM/dd HH:mm');
      pPosi = sheet.getRange(res, sheetHeader.popPosition).getValue();

      jsonData  = {
        username: "ハンゾーくんの密書",
        content:"【" + postData.bossName + "】を以下の通りに更新いたしそうろう～",
        avatar_url: "画像URL",
        thumbnail_url: "画像URL",
        title: "更新成功！",
        color: 0xB3000A,
        name: "Time",
        time: endDt,
        memo: pPosi
      };

      resMsg = jsonData;

    } else {

      jsonData  = {
        username: "ハンゾーくんの密書",
        content:res,
        avatar_url: "画像URL",
        thumbnail_url: "画像URL",
        title: "更新失敗……",
        color: 0x0A00BA
      };

      resMsg = jsonData;

    }
  }
  
  //Json配列で返す方法を残しておきたいので、keyとvalueが１つだけだけどこの方式にしておく
  var response = ContentService.createTextOutput(JSON.stringify(resMsg)).setMimeType(ContentService.MimeType.JSON);
  return response;
}

/**
 * ボスの討伐時間を更新する
 * return 成功時、更新した行番号、失敗時エラーメッセージ
 */
function bossTimeUpdate(postData, sheetHeader, sheet) {
  // Logger.log(postData);
  var rows = sheet.getDataRange().getValues();

  //discordから取得したボス名で検索
  var rowNum = findRow(
      rows,
      postData.bossName,
      sheetHeader.bossNameCol
    ); //行番号を返す
    // Logger.log(rowNum);

  // ボス名指定エラー
　if (rowNum == 0) return 'そんな名前のボスはおりませぬぞ！';

  //取得した時間に今日の日付をたして YYYY/MM/DD HH:mm にする
  var nowDate  = Moment.moment().format("YYYY/MM/DD");
  var updateDt = nowDate + " " + postData.hhmm;
    // Logger.log(updateDt);

  //更新完了、失敗を通知
  sheet.getRange(rowNum, sheetHeader.bossEndTimeCol).setValue(updateDt);
  if(postData.position != "NoData"){
    sheet.getRange(rowNum, sheetHeader.popPosition).setValue(postData.position);
  }

  return rowNum;

}

/**
 * スプレッドシート内検索
 * rows 検索するシート
 * val 検索値
 * col 列番号
 *  */
function findRow(rows,val,col){

  for(var i=1;i<rows.length;i++){
    if(rows[i][col-1] === val){
      return i+1;
    }
  }
  return 0;
}

function delTrigger(func_name) {
  // 指定のトリガーがあれば削除する。
  var triggers = ScriptApp.getProjectTriggers();
  for(var i = 0; i < triggers.length; i++){
    if(triggers[i].getHandlerFunction() == func_name)
      ScriptApp.deleteTrigger(triggers[i]);
  }
}
