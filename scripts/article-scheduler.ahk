; ============================================
; Article Generator Auto Scheduler
; 朝9時〜夜8時の間、1時間ごとに /article-generator を実行
; ============================================
; 
; 使い方:
; 1. このファイルをダブルクリックして実行
; 2. VS Codeでチャット画面を開いた状態にしておく
; 3. バックグラウンドで自動実行される
;
; 停止方法:
; タスクトレイのAutoHotkeyアイコンを右クリック → Exit
;
; ============================================

#Requires AutoHotkey v2.0
#SingleInstance Force
Persistent

; 設定
INTERVAL_MS := 3600000  ; 1時間 = 3600000ms（変更可能）
START_HOUR := 9         ; 開始時刻（9時）
END_HOUR := 20          ; 終了時刻（20時=夜8時）

; 初期化
TraySetIcon("shell32.dll", 44)
A_IconTip := "Article Generator Scheduler - Running"

; 起動メッセージ
MsgBox("Article Generator Scheduler を開始しました`n`n" 
     . "• 実行間隔: " . (INTERVAL_MS / 60000) . " 分`n"
     . "• 実行時間帯: " . START_HOUR . ":00 〜 " . END_HOUR . ":00`n`n"
     . "停止するには、タスクトレイの H アイコンを右クリック → Exit",
     "Scheduler Started", "Iconi")

; タイマー設定
SetTimer(SendArticleCommand, INTERVAL_MS)

; 起動直後にも実行するか確認
if (MsgBox("今すぐ最初のコマンドを実行しますか？", "Confirm", "YesNo") = "Yes") {
    SendArticleCommand()
}

; メイン関数
SendArticleCommand() {
    currentHour := A_Hour
    
    ; 時間帯チェック
    if (currentHour < START_HOUR || currentHour >= END_HOUR) {
        ; 時間外はスキップ
        return
    }
    
    ; VS Codeを探す
    if !WinExist("ahk_exe Code.exe") {
        TrayTip("VS Codeが見つかりません", "Article Generator", "Icon!")
        return
    }
    
    ; VS Codeをアクティブに
    WinActivate("ahk_exe Code.exe")
    Sleep(500)
    
    ; Geminiチャットにフォーカス（Ctrl+Shift+P → Gemini: Open Chat）
    ; 注: チャット画面が既に開いている前提
    
    ; コマンド送信
    SendInput("/article-generator")
    Sleep(200)
    SendInput("{Enter}")
    
    ; ログ
    TrayTip("コマンド送信完了", "Article Generator", "Iconi")
    
    ; 元のウィンドウに戻す（オプション）
    ; WinActivate("ahk_exe " . previousWindow)
}

; 手動実行用ホットキー（Ctrl+Alt+A）
^!a:: {
    SendArticleCommand()
}
