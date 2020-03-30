function sendMailFromKintaiForm() {

    //------------------------------------------------------------
    // 設定エリアここから
    //------------------------------------------------------------

    // 件名、本文、フッターのテンプレ
    var subject = "【勤怠連絡】";
    var body
        = "勤怠連絡フォームが送信されました。\n\n"
        + "＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝\n";
    var footer
        = "＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝\n\n";

    // 入力カラム名の指定
    var timeStampHead = 'タイムスタンプ';
    var workerNumburHead = '社員番号';
    var nameHead = '氏名';
    var teamHead = '所属チーム';
    var messageHead = '連絡事項';
    var detailHead = '連絡内容詳細';
    var privateMail = '連絡先メールアドレス（任意）';

    // メール送信先、送信元
    var admin = "hakamata-h@gnavi.co.jp"; // 管理者（エラー時にメール受信）
    var from  = "hakamata-h+test01@gnavi.co.jp"; // 送信用アドレス（エイリアス必須）
    var to    = "";    // To:　チームごとのメール送信先が入る
    var cc    = ""; // Cc:
    var bcc   = admin; // Bcc:
  
    //チームごとのメール送信先
    var teamMailList = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("チームML"); //チームMLシートを取得
    var teamMailTo   = teamMailList.getRange('A:B').getValues(); //チームMLシートのデータを配列形式で取得
    var teamMailRows = teamMailList.getLastRow(); //行数取得
//    Logger.log(teamMailTo[0][0] + "：" + teamMailTo[0][1]); //1行目（見出しなので使わない）
//    Logger.log(teamMailTo[1][0] + "：" + teamMailTo[1][1]); //2行目
//    Logger.log(teamMailTo[2][0] + "：" + teamMailTo[2][1]); //3行目
//    Logger.log(teamMailTo[3][0] + "：" + teamMailTo[3][1]); //4行目
//    Logger.log(teamMailTo[4][0] + "：" + teamMailTo[4][1]); //5行目
//    Logger.log(teamMailRows + "行");

    //------------------------------------------------------------
    // 設定エリアここまで
    //------------------------------------------------------------

    try{
        // スプレッドシートの操作
        var sh   = SpreadsheetApp.getActiveSheet();
        // var rows = sh.getLastRow(); シート全体のデータ最終行ではなくA列の最終行を取得する形に変更するのでコメントアウト
        var colValuesA   = sh.getRange('A:A').getValues();
        var rows = colValuesA.filter(String).length;
        var cols = sh.getLastColumn();
        var rg   = sh.getDataRange();
        Logger.log("rows="+rows+" cols="+cols);

        // メール件名・本文作成と送信先メールアドレス取得
        for (var j = 1; j <= cols; j++ ) {
            var col_name  = rg.getCell(1, j).getValue();    // カラム名
            var col_value = rg.getCell(rows, j).getValue(); // 入力値

            // 送信先を指定する
            for (var i = 1 ; i <= teamMailRows -1 ; i++ ){
              if ( col_name === teamHead ) {
                var str = col_value;
                //チーム名が一致したら、そのチームのMLをtoを追加
                if ( str.match(teamMailTo[i][0])){
                to = teamMailTo[i][1];
                var reply = to;    // Reply-To:
                }
              }
            }
            if ( col_name === privateMail ) {
                cc = col_value;
            }
            
            // タイムスタンプの表示をフォーマット
            if ( col_name === timeStampHead ){
              col_value = Utilities.formatDate(col_value, 'JST', 'yyyy/M/d H:m');
            }

            // メールタイトル作成
            if ( col_name === messageHead ) {
                subject += col_value += "：";
            }
            if ( col_name === teamHead ) {
                subject += col_value += " ";
            }
            if ( col_name === nameHead ) {
                subject += col_value += " ";
            }
            if ( col_name === timeStampHead ) {
                subject += col_value;
            }

            // メール本文作成（シート見出しとフォーム投稿内容を合体）
            body += "【"+col_name+"】\n";
            body += col_value + "\n\n";
        }
        body += footer;

      
        // 送信先オプション
        var options = {
          cc:cc,
          bcc:bcc,
          from:from, //送信元を変えたい場合に使用。送信元アドレスはエイリアス設定されている必要あり。
          reply:reply      
        };

        // メール送信実行・エラー処理
        if ( to ) {
            GmailApp.sendEmail(to, subject, body, options);
        }else{
            GmailApp.sendEmail(admin, "【失敗】Googleフォーム（勤怠連絡）にメールアドレスが指定されていません", body);
        }
    }catch(e){
        GmailApp.sendEmail(admin, "【失敗】Googleフォーム（勤怠連絡）からメール送信中にエラーが発生", e.message);
    }
}