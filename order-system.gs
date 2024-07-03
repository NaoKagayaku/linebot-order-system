//プロパティサービス
var prop = PropertiesService.getScriptProperties().getProperties();

// アクセストークン 
const ACCESS_TOKEN = prop.ACCESS_TOKEN;

//リッチメニュー作成関数
function createRichmenu_HR() {
  // リッチメニュー作成用API URL
  var url = 'https://api.line.me/v2/bot/richmenu';

  //タップ領域
  var areas = [];
  areas[0] = {
    'bounds': {
      'x': 0,
      'y': 0,
      'width': 833,
      'height': 843
    },
    'action': {
      'type': "message",
      'label': "Maccha",
      'text': "Maccha"
    }
  };
  areas[1] = {
    'bounds': {
      'x': 833,
      'y': 0,
      'width': 833,
      'height': 843
    },
    'action': {
      'type': "message",
      'label': "Wiener",
      'text': "Wiener"
    }
  };
  areas[2] = {
    'bounds': {
      'x': 1666,
      'y': 0,
      'width': 834,
      'height': 843
    },
    'action': {
      'type': "message",
      'label': "Mix",
      'text': "Mix"
    }
  };
  areas[3] = {
    'bounds': {
      'x': 0,
      'y': 843,
      'width': 834,
      'height': 843
    },
    'action': {
      'type': "message",
      'label': "Delete",
      'text': "Delete"
    }
  };
  
  areas[4] = {
    'bounds': {
      'x': 833,
      'y': 843,
      'width': 833,
      'height': 843
    },
    'action': {
      'type': "message",
      'label': "Delete",
      'text': "Delete"
    }
  };
  areas[5] = {
    'bounds': {
      'x': 1666,
      'y': 843,
      'width': 834,
      'height': 843
    },
    'action': {
      'type': "message",
      'label': "Delete",
      'text': "Delete"
    }
  };

  //リッチメニュー本体
  var postData = {
    'size': {
      'width': 2500,
      'height': 1686
    },
    'selected': true,
    'name': "注文パネル",
    'chatBarText': "注文パネル",
    'areas': areas,
  };

  var headers = {
    'Content-Type': 'application/json; charset=UTF-8',
    'Authorization': 'Bearer ' + ACCESS_TOKEN,
  };

  var options = {
    'headers': headers,
    'method': 'post',
    'payload': JSON.stringify(postData),
  };

  //送信
  var json = UrlFetchApp.fetch(url, options);
  json = JSON.parse(json);
  console.log(json.richMenuId);
}

//リッチメニューに背景画像追加
function setImageRichmenu_HR() {
  //リッチメニューID取得
  var richmenu_Id = prop.richmenu_id;

  // リッチメニュー画像用API URL
  var url = 'https://api-data.line.me/v2/bot/richmenu/' + richmenu_Id + '/content';

  ///画像取得
  var image = DriveApp.getFileById(prop.menu_image);
  var blob = image.getAs(MimeType.PNG);

  var headers = {
    'Content-Type': 'image/png',
    'Authorization': 'Bearer ' + ACCESS_TOKEN,
  };

  var options = {
    'headers': headers,
    'method': 'post',
    'payload': blob,
  };

  //送信
  UrlFetchApp.fetch(url, options);
}

//デフォルトリッチメニュー設定
function defaultRichmenu_HR() {
  var richmenu_Id = prop.richmenu_id;
  var url = "https://api.line.me/v2/bot/user/all/richmenu/" + richmenu_Id;

  var headers = {
    'Authorization': 'Bearer ' + ACCESS_TOKEN
  };

  var options = {
    'headers': headers,
    'method': 'post'
  };

  UrlFetchApp.fetch(url, options);
}

//デフォルトリッチメニュー設定解除
function richmenu_def_delete() {
  var url = 'https://api.line.me/v2/bot/user/all/richmenu'

  UrlFetchApp.fetch(url, {
    'headers': {
      'Authorization': 'Bearer ' + ACCESS_TOKEN,
    },
    'method': 'delete'
  });
}

//リッチメニュー削除
function richmenu_delete() {
  var url = 'https://api.line.me/v2/bot/richmenu/(対象となるリッチメニューID)/'

  UrlFetchApp.fetch(url, {
    'headers': {
      'Authorization': 'Bearer ' + ACCESS_TOKEN,
    },
    'method': 'delete'
  });
}

function doPost(e) {
  //LINE API系
  // リクエストに含まれる最新のメッセージデータ
  const latestEvent = JSON.parse(e.postData.contents).events[0];
  // WebHookで受信した応答用Token
  const replyToken = latestEvent.replyToken;
  //userIDを取得
  const userID = latestEvent.source.userId;
  // ユーザーのメッセージを取得
  const userMessage = latestEvent.message.text;

  // 応答メッセージ用のAPI URL
  const replyUrl = 'https://api.line.me/v2/bot/message/reply'

  //スプレッドシート系
  //シートの取得
  var sheet_id = prop.sheet_id
  var sheet_name = "注文一覧";
  var spreadsheet = SpreadsheetApp.openById(sheet_id);
  var sheet = spreadsheet.getSheetByName(sheet_name);

  //最終行取得(最新のデータ位置取得)
  var lastRow = sheet.getRange(sheet.getMaxRows(), 1).getNextDataCell(SpreadsheetApp.Direction.UP).getRow();
  var userLastRow;

  //ユーザー一致最終行取得
  function userLR() {
    userLastRow = lastRow;
    for (var i = lastRow; i > 0; i--) {
      if (sheet.getRange(i, 1).getValue() == userID) {
        userLastRow = i;
        break;
      }
    }
  }


  //システム系
  //メニュー管理
  var menu_ID = userMessage.replace(/[0-9０-９]/g, '');
  //メニュー
  var orders = { 'menu': "", 'topping': "", 'drink': "", 'situation': "" };
  //調理室サイドの対応
  var responce_num = parseInt(userMessage.replace(/[^0-9]/g, ''));
  var responce_code = userMessage.substr(0, 4);







  //応答メッセージ
  function reply(phase, str) {
    //カードメッセージ関係
    var columns = [];
    //トッピング選択
    if (phase == 'topping') {
      columns = [{
        'imageBackgroundColor': '#FFFFFF',
        'title': "トッピング",
        'text': "トッピング選択1",
        'actions': [
          {
            'type': 'message',
            'label': "粉糖(粉砂糖)",
            'text': "Sugar"
          },
          {
            'type': 'message',
            'label': "ハチミツ",
            'text': "Honey"
          },
          {
            'type': 'message',
            'label': "トッピングなし",
            'text': "Notopping"
          },
        ]
      }, {
        'imageBackgroundColor': '#FFFFFF',
        'title': "トッピング",
        'text': "トッピング選択2",
        'actions': [
          {
            'type': 'message',
            'label': "チョコソース",
            'text': "Chocosource"
          },
          {
            'type': 'message',
            'label': "黒蜜きな粉",
            'text': "Kuromitsukinako"
          },
          {
            'type': 'message',
            'label': "トッピングなし",
            'text': "Notopping"
          }
        ]
      }];
      //ドリンク選択
    } else if (phase == 'drink') {
      columns = [{
        'imageBackgroundColor': '#FFFFFF',
        'title': "ドリンク",
        'text': "ドリンク選択1",
        'actions': [
          {
            'type': 'message',
            'label': "コーヒー",
            'text': "Coffee"
          },
          {
            'type': 'message',
            'label': "オレンジジュース",
            'text': "Orangejuice"
          }
        ]
      }, {
        'imageBackgroundColor': '#FFFFFF',
        'title': "ドリンク",
        'text': "ドリンク選択2",
        'actions': [
          {
            'type': 'message',
            'label': "ミルクティー",
            'text': "Milktea"
          },
          {
            'type': 'message',
            'label': "ドリンクなし",
            'text': "Nodrink"
          }
        ]
      }];
      //内容確定
    } else if (phase == 'check') {
      columns = [{
        'imageBackgroundColor': '#FFFFFF',
        'title': "確認",
        'text': "注文を確定しますか？",
        'actions': [
          {
            'type': 'message',
            'label': "はい",
            'text': "Ordered"
          },
          {
            'type': 'message',
            'label': "いいえ(取り消し)",
            'text': "Delete"
          }
        ]
      }];
    } else if (phase == 'cORd') {
      columns = [{
        'imageBackgroundColor': '#FFFFFF',
        'title': "選択",
        'text': "配送・呼び出し or 受け渡し完了",
        'actions': [
          {
            'type': 'message',
            'label': String(responce_num) + "番を配送・呼び出す",
            'text': "Call" + String(responce_num)
          },
          {
            'type': 'message',
            'label': String(responce_num) + "番の受け渡し完了",
            'text': "Done" + String(responce_num)
          }
        ]
      }];
    }

    //送信
    if (phase == 'ok') {
      UrlFetchApp.fetch(replyUrl, {
        'headers': {
          'Content-Type': 'application/json; charset=UTF-8',
          'Authorization': 'Bearer ' + ACCESS_TOKEN,
        },
        'method': 'post',
        'payload': JSON.stringify({
          'replyToken': replyToken,
          'messages': [{
            'type': 'text',
            'text': str
          }],
        }),
      });
    } else {
      UrlFetchApp.fetch(replyUrl, {
        'headers': {
          'Content-Type': 'application/json; charset=UTF-8',
          'Authorization': 'Bearer ' + ACCESS_TOKEN,
        },
        'method': 'post',
        'payload': JSON.stringify({
          'replyToken': replyToken,
          'messages': [{
            'type': 'text',
            'text': str
          },
          {
            'type': 'template',
            'altText': "カルーセルメッセージが届きました",
            'template': {
              'type': 'carousel',
              'columns': columns
            }
          }],
        }),
      });
    }

  }

  if (responce_num >= 0) {
    if (sheet.getRange(responce_num + 1, 2).getValue() == responce_num) {
      if (responce_code == 'Call') {
        sheet.getRange(responce_num + 1, 3).setValue("配送・呼び出し中");
        reply('ok', responce_num + "番を配送・呼び出し中にしました")
      } else if (responce_code == 'Done') {
        sheet.getRange(responce_num + 1, 3).setValue("受け渡し完了");
        reply('ok', responce_num + "番を受け渡し完了にしました")
      } else {
        reply('cORd', responce_num + "番に対してどうしますか？")
      }
    } else {
      reply('ok', responce_num + "番は無効な整理番号です")
    }
  } else {
    //注文入力
    switch (menu_ID) {
      case "Delete":
        userLR();
        if (sheet.getRange(userLastRow, 3).isBlank()) {
          sheet.getRange(userLastRow, 1, 1, 6).clear();
          reply('ok', "注文をキャンセルしました");
        }
        break;

      //基本メニュー
      case "Wiener":
        userLR();
        if (sheet.getRange(userLastRow, 1).getValue() == userID && sheet.getRange(userLastRow, 2).isBlank() == true) {
          reply('ok', "注文入力が途中です。入力し直す場合は取り消しを行った後に最初から入力してください")

        } else {
          sheet.getRange(lastRow + 1, 1).setValue(userID);
          sheet.getRange(lastRow + 1, 4).setValue("ウインナーケチャップ");
          orders.menu = sheet.getRange(lastRow + 1, 4).getValue();
          reply('topping', orders.menu);
        }
        break;

      case "Maccha":
        userLR();
        if (sheet.getRange(userLastRow, 1).getValue() == userID && sheet.getRange(userLastRow, 2).isBlank() == true) {
          reply('ok', "注文入力が途中です。入力し直す場合は取り消しを行った後に最初から入力してください")

        } else {
          sheet.getRange(lastRow + 1, 1).setValue(userID);
          sheet.getRange(lastRow + 1, 4).setValue("抹茶sweet");
          orders.menu = sheet.getRange(lastRow + 1, 4).getValue();
          reply('topping', orders.menu);
        }
        break;

      case "Mix":
        userLR();
        if (sheet.getRange(userLastRow, 1).getValue() == userID && sheet.getRange(userLastRow, 2).isBlank() == true) {
          reply('ok', "注文入力が途中です。入力し直す場合は取り消しを行った後に最初から入力してください")

        } else {
          sheet.getRange(lastRow + 1, 1).setValue(userID);
          sheet.getRange(lastRow + 1, 4).setValue("sweet mix");
          orders.menu = sheet.getRange(lastRow + 1, 4).getValue();
          reply('topping', orders.menu);
        }
        break;

      case "Drinkonly":
        userLR();
        if (sheet.getRange(userLastRow, 1).getValue() == userID && sheet.getRange(userLastRow, 2).isBlank() == true) {
          reply('ok', "注文入力が途中です。入力し直す場合は取り消しを行った後に最初から入力してください")

        } else {
          sheet.getRange(lastRow + 1, 1).setValue(userID);
          sheet.getRange(lastRow + 1, 4).setValue("ドリンクのみ");
          orders.menu = sheet.getRange(lastRow + 1, 4).getValue();
          reply('drink', orders.menu);
        }
        break;

      //トッピング
      case "Kuromitsukinako":
        userLR();
        sheet.getRange(userLastRow, 5).setValue("黒蜜きな粉");
        orders.menu = sheet.getRange(userLastRow, 4).getValue();
        orders.topping = sheet.getRange(userLastRow, 5).getValue();
        reply('drink', orders.menu + "\n" + orders.topping);
        break;

      case "Honey":
        userLR();
        sheet.getRange(userLastRow, 5).setValue("ハチミツ");
        orders.menu = sheet.getRange(userLastRow, 4).getValue();
        orders.topping = sheet.getRange(userLastRow, 5).getValue();
        reply('drink', orders.menu + "\n" + orders.topping);
        break;

      case "Chocosource":
        userLR();
        sheet.getRange(userLastRow, 5).setValue("チョコソース");
        orders.menu = sheet.getRange(userLastRow, 4).getValue();
        orders.topping = sheet.getRange(userLastRow, 5).getValue();
        reply('drink', orders.menu + "\n" + orders.topping);
        break;

      case "Sugar":
        userLR();
        sheet.getRange(userLastRow, 5).setValue("粉糖(粉砂糖)");
        orders.menu = sheet.getRange(userLastRow, 4).getValue();
        orders.topping = sheet.getRange(userLastRow, 5).getValue();
        reply('drink', orders.menu + "\n" + orders.topping);
        break;

      case "Notopping":
        userLR();
        sheet.getRange(userLastRow, 5).setValue("トッピングなし");
        orders.menu = sheet.getRange(userLastRow, 4).getValue();
        orders.topping = sheet.getRange(userLastRow, 5).getValue();
        reply('drink', orders.menu + "\n" + orders.topping);
        break;

      //ドリンク
      case "Coffee":
        userLR();
        sheet.getRange(userLastRow, 6).setValue("コーヒー");
        orders.menu = sheet.getRange(userLastRow, 4).getValue();
        orders.topping = sheet.getRange(userLastRow, 5).getValue();
        orders.drink = sheet.getRange(userLastRow, 6).getValue();
        reply('check', orders.menu + "\n" + orders.topping + "\n" + orders.drink);
        break;

      case "Milktea":
        userLR();
        sheet.getRange(userLastRow, 6).setValue("ミルクティー");
        orders.menu = sheet.getRange(userLastRow, 4).getValue();
        orders.topping = sheet.getRange(userLastRow, 5).getValue();
        orders.drink = sheet.getRange(userLastRow, 6).getValue();
        reply('check', orders.menu + "\n" + orders.topping + "\n" + orders.drink);
        break;
      
      case "Orangejuice":
        userLR();
        sheet.getRange(userLastRow, 6).setValue("オレンジジュース");
        orders.menu = sheet.getRange(userLastRow, 4).getValue();
        orders.topping = sheet.getRange(userLastRow, 5).getValue();
        orders.drink = sheet.getRange(userLastRow, 6).getValue();
        reply('check', orders.menu + "\n" + orders.topping + "\n" + orders.drink);
        break;

      case "Nodrink":
        userLR();
        sheet.getRange(userLastRow, 6).setValue("ドリンクなし");
        orders.menu = sheet.getRange(userLastRow, 4).getValue();
        orders.topping = sheet.getRange(userLastRow, 5).getValue();
        orders.drink = sheet.getRange(userLastRow, 6).getValue();
        reply('check', orders.menu + "\n" + orders.topping + "\n" + orders.drink);
        break;

      case "Ordered":
        userLR();
        sheet.getRange(userLastRow, 2).setValue(userLastRow - 1);
        sheet.getRange(userLastRow, 3).setValue("注文中");
        orders.menu = sheet.getRange(userLastRow, 4).getValue();
        orders.topping = sheet.getRange(userLastRow, 5).getValue();
        orders.drink = sheet.getRange(userLastRow, 6).getValue();
        reply('ok', orders.menu + "\n" + orders.topping + "\n" + orders.drink + "\nで注文しました\n整理番号は" + sheet.getRange(userLastRow, 2).getValue() + "です");
        break;

      default:
        reply('ok', "無効なメニューです");
        break;
    }
  }

}
