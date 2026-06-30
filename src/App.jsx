import { useState, useEffect, useRef } from "react";

// ─── 音声読み上げ ─────────────────────────────────────────────
function speak(text, rate = 0.85) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "ja-JP";
  utter.rate = rate;
  utter.pitch = 1.1;
  // 日本語音声を優先選択
  const voices = window.speechSynthesis.getVoices();
  const jaVoice = voices.find(v => v.lang.startsWith("ja"));
  if (jaVoice) utter.voice = jaVoice;
  window.speechSynthesis.speak(utter);
}

// 問題文を読み上げ（空欄を1秒の無音にする）
function questionToSpeech(q) {
  // 空欄の前後を別々のutteranceに分けて、間にsetTimeoutで間を作る
  return q.sentence.map((p, i) => i === q.blank ? null : p);
}

function speakWithPause(q, rate = 0.85) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();

  const parts = q.sentence
    .map((p, i) => i === q.blank ? null : p)
    .filter(Boolean);

  const voices = window.speechSynthesis.getVoices();
  const jaVoice = voices.find(v => v.lang.startsWith("ja"));

  // 空欄の位置で分割（前半・後半）
  const before = q.sentence.slice(0, q.blank).join("");
  const after  = q.sentence.slice(q.blank + 1).join("");

  function makeUtter(text) {
    const u = new SpeechSynthesisUtterance(text);
    u.lang  = "ja-JP";
    u.rate  = rate;
    u.pitch = 1.1;
    if (jaVoice) u.voice = jaVoice;
    return u;
  }

  if (before) {
    const u1 = makeUtter(before);
    u1.onend = () => {
      // 1秒の無音後に後半を読む
      setTimeout(() => {
        if (after) window.speechSynthesis.speak(makeUtter(after));
      }, 900);
    };
    window.speechSynthesis.speak(u1);
  } else if (after) {
    // 空欄が先頭の場合：1秒待ってから後半
    setTimeout(() => window.speechSynthesis.speak(makeUtter(after)), 900);
  }
}

// ─── 問題データ 各助詞50問 ────────────────────────────────────
const ALL_QUESTIONS = {
  が: [
    { id:"ga1",  sentence:["ねこ","___","います。"],        blank:1, hint:"だれが・なにが、を あらわすよ", answer:"が", choices:["が","に","で","も"],  image:"🐱" },
    { id:"ga2",  sentence:["いぬ","___","はしります。"],    blank:1, hint:"だれが・なにが、を あらわすよ", answer:"が", choices:["が","に","で","も"],  image:"🐕" },
    { id:"ga3",  sentence:["とり","___","とびます。"],      blank:1, hint:"だれが・なにが、を あらわすよ", answer:"が", choices:["が","に","で","も"],  image:"🐦" },
    { id:"ga4",  sentence:["はな","___","さきます。"],      blank:1, hint:"だれが・なにが、を あらわすよ", answer:"が", choices:["が","に","で","も"],  image:"🌸" },
    { id:"ga5",  sentence:["かぜ","___","ふきます。"],      blank:1, hint:"だれが・なにが、を あらわすよ", answer:"が", choices:["が","に","で","も"],  image:"🌬️" },
    { id:"ga6",  sentence:["あめ","___","ふります。"],      blank:1, hint:"だれが・なにが、を あらわすよ", answer:"が", choices:["が","に","で","も"],  image:"🌧️" },
    { id:"ga7",  sentence:["こども","___","わらいます。"],  blank:1, hint:"だれが・なにが、を あらわすよ", answer:"が", choices:["が","に","で","も"],  image:"😄" },
    { id:"ga8",  sentence:["でんしゃ","___","とまります。"],blank:1, hint:"だれが・なにが、を あらわすよ", answer:"が", choices:["が","に","で","も"],  image:"🚃" },
    { id:"ga9",  sentence:["ほし","___","ひかります。"],    blank:1, hint:"だれが・なにが、を あらわすよ", answer:"が", choices:["が","に","で","も"],  image:"⭐" },
    { id:"ga10", sentence:["かわ","___","ながれます。"],    blank:1, hint:"だれが・なにが、を あらわすよ", answer:"が", choices:["が","に","で","も"],  image:"🌊" },
    { id:"ga11", sentence:["ひこうき","___","とびます。"],  blank:1, hint:"だれが・なにが、を あらわすよ", answer:"が", choices:["が","に","で","も"],  image:"✈️" },
    { id:"ga12", sentence:["たいよう","___","でます。"],    blank:1, hint:"だれが・なにが、を あらわすよ", answer:"が", choices:["が","に","で","も"],  image:"☀️" },
    { id:"ga13", sentence:["つき","___","でます。"],        blank:1, hint:"だれが・なにが、を あらわすよ", answer:"が", choices:["が","に","で","も"],  image:"🌙" },
    { id:"ga14", sentence:["くも","___","ながれます。"],    blank:1, hint:"だれが・なにが、を あらわすよ", answer:"が", choices:["が","に","で","も"],  image:"☁️" },
    { id:"ga15", sentence:["さかな","___","およぎます。"],  blank:1, hint:"だれが・なにが、を あらわすよ", answer:"が", choices:["が","に","で","も"],  image:"🐟" },
    { id:"ga16", sentence:["ライオン","___","ほえます。"],  blank:1, hint:"だれが・なにが、を あらわすよ", answer:"が", choices:["が","に","で","も"],  image:"🦁" },
    { id:"ga17", sentence:["うさぎ","___","はねます。"],    blank:1, hint:"だれが・なにが、を あらわすよ", answer:"が", choices:["が","に","で","も"],  image:"🐰" },
    { id:"ga18", sentence:["かえる","___","なきます。"],    blank:1, hint:"だれが・なにが、を あらわすよ", answer:"が", choices:["が","に","で","も"],  image:"🐸" },
    { id:"ga19", sentence:["こうえん","___","にぎわいます。"],blank:1,hint:"だれが・なにが、を あらわすよ",answer:"が", choices:["が","に","で","も"],  image:"🌳" },
    { id:"ga20", sentence:["でんき","___","つきます。"],    blank:1, hint:"だれが・なにが、を あらわすよ", answer:"が", choices:["が","に","で","も"],  image:"💡" },
    { id:"ga21", sentence:["ゆき","___","ふります。"],      blank:1, hint:"だれが・なにが、を あらわすよ", answer:"が", choices:["が","に","で","も"],  image:"❄️" },
    { id:"ga22", sentence:["ベル","___","なります。"],      blank:1, hint:"だれが・なにが、を あらわすよ", answer:"が", choices:["が","に","で","も"],  image:"🔔" },
    { id:"ga23", sentence:["むし","___","とびます。"],      blank:1, hint:"だれが・なにが、を あらわすよ", answer:"が", choices:["が","に","で","も"],  image:"🦋" },
    { id:"ga24", sentence:["でんわ","___","なります。"],    blank:1, hint:"だれが・なにが、を あらわすよ", answer:"が", choices:["が","に","で","も"],  image:"📞" },
    { id:"ga25", sentence:["ともだち","___","きます。"],    blank:1, hint:"だれが・なにが、を あらわすよ", answer:"が", choices:["が","に","で","も"],  image:"👫" },
    { id:"ga26", sentence:["おとうと","___","ないています。"],blank:1,hint:"だれが・なにが、を あらわすよ",answer:"が", choices:["が","に","で","も"],  image:"😢" },
    { id:"ga27", sentence:["しんかんせん","___","はしります。"],blank:1,hint:"だれが・なにが、を あらわすよ",answer:"が",choices:["に","が","を","で"],  image:"🚄" },
    { id:"ga28", sentence:["ふね","___","すすみます。"],    blank:1, hint:"だれが・なにが、を あらわすよ", answer:"が", choices:["が","に","で","も"],  image:"⛵" },
    { id:"ga29", sentence:["ロケット","___","とびます。"],  blank:1, hint:"だれが・なにが、を あらわすよ", answer:"が", choices:["が","に","で","も"],  image:"🚀" },
    { id:"ga30", sentence:["ひ","___","もえます。"],        blank:1, hint:"だれが・なにが、を あらわすよ", answer:"が", choices:["が","に","で","も"],  image:"🔥" },
    { id:"ga31", sentence:["みず","___","わきます。"],      blank:1, hint:"だれが・なにが、を あらわすよ", answer:"が", choices:["が","に","で","も"],  image:"♨️" },
    { id:"ga32", sentence:["こおり","___","とけます。"],    blank:1, hint:"だれが・なにが、を あらわすよ", answer:"が", choices:["が","に","で","も"],  image:"🧊" },
    { id:"ga33", sentence:["ねこ","___","なきます。"],      blank:1, hint:"だれが・なにが、を あらわすよ", answer:"が", choices:["が","に","で","も"],  image:"😺" },
    { id:"ga34", sentence:["はっぱ","___","おちます。"],    blank:1, hint:"だれが・なにが、を あらわすよ", answer:"が", choices:["が","に","で","も"],  image:"🍂" },
    { id:"ga35", sentence:["くるま","___","とまります。"],  blank:1, hint:"だれが・なにが、を あらわすよ", answer:"が", choices:["が","に","で","も"],  image:"🚗" },
    { id:"ga36", sentence:["バス","___","きます。"],        blank:1, hint:"だれが・なにが、を あらわすよ", answer:"が", choices:["が","に","で","も"],  image:"🚌" },
    { id:"ga37", sentence:["かみなり","___","なります。"],  blank:1, hint:"だれが・なにが、を あらわすよ", answer:"が", choices:["が","に","で","も"],  image:"⚡" },
    { id:"ga38", sentence:["おに","___","でます。"],      blank:1, hint:"だれが・なにが、を あらわすよ", answer:"が", choices:["が","に","で","も"],  image:"👹" },
    { id:"ga39", sentence:["ねずみ","___","はしります。"],  blank:1, hint:"だれが・なにが、を あらわすよ", answer:"が", choices:["が","に","で","も"],  image:"🐭" },
    { id:"ga40", sentence:["ぞう","___","あるきます。"],    blank:1, hint:"だれが・なにが、を あらわすよ", answer:"が", choices:["が","に","で","も"],  image:"🐘" },
    { id:"ga41", sentence:["にじ","___","でます。"],        blank:1, hint:"だれが・なにが、を あらわすよ", answer:"が", choices:["が","に","で","も"],  image:"🌈" },
    { id:"ga42", sentence:["ほたる","___","ひかります。"],  blank:1, hint:"だれが・なにが、を あらわすよ", answer:"が", choices:["が","に","で","も"],  image:"🪲" },
    { id:"ga43", sentence:["あさひ","___","でます。"],      blank:1, hint:"だれが・なにが、を あらわすよ", answer:"が", choices:["が","に","で","も"],  image:"🌅" },
    { id:"ga44", sentence:["なみ","___","よせます。"],      blank:1, hint:"だれが・なにが、を あらわすよ", answer:"が", choices:["が","に","で","も"],  image:"🌊" },
    { id:"ga45", sentence:["はち","___","とびます。"],      blank:1, hint:"だれが・なにが、を あらわすよ", answer:"が", choices:["が","に","で","も"],  image:"🐝" },
    { id:"ga46", sentence:["かぶとむし","___","います。"],  blank:1, hint:"だれが・なにが、を あらわすよ", answer:"が", choices:["が","に","で","も"],  image:"🪲" },
    { id:"ga47", sentence:["きつね","___","はしります。"],  blank:1, hint:"だれが・なにが、を あらわすよ", answer:"が", choices:["が","に","で","も"],  image:"🦊" },
    { id:"ga48", sentence:["タコ","___","およぎます。"],    blank:1, hint:"だれが・なにが、を あらわすよ", answer:"が", choices:["が","に","で","も"],  image:"🐙" },
    { id:"ga49", sentence:["ひつじ","___","ないています。"],blank:1, hint:"だれが・なにが、を あらわすよ", answer:"が", choices:["が","に","で","も"],  image:"🐑" },
    { id:"ga50", sentence:["こうもり","___","とびます。"],  blank:1, hint:"だれが・なにが、を あらわすよ", answer:"が", choices:["が","に","で","も"],  image:"🦇" },
  ],
  を: [
    { id:"wo1",  sentence:["りんご","___","たべます。"],    blank:1, hint:"「たべる」「のむ」のまえにつくよ", answer:"を", choices:["を","は","も","へ"],  image:"🍎" },
    { id:"wo2",  sentence:["みず","___","のみます。"],      blank:1, hint:"「たべる」「のむ」のまえにつくよ", answer:"を", choices:["を","は","も","へ"],  image:"💧" },
    { id:"wo3",  sentence:["ほん","___","よみます。"],      blank:1, hint:"「よむ」「かく」のまえにつくよ",  answer:"を", choices:["を","は","も","へ"],  image:"📚" },
    { id:"wo4",  sentence:["うた","___","うたいます。"],    blank:1, hint:"「する」「やる」のまえにつくよ",  answer:"を", choices:["を","は","も","へ"],  image:"🎵" },
    { id:"wo5",  sentence:["えんぴつ","___","つかいます。"],blank:1, hint:"「する」「やる」のまえにつくよ",  answer:"を", choices:["を","は","も","へ"],  image:"✏️" },
    { id:"wo6",  sentence:["かみ","___","きります。"],      blank:1, hint:"「する」「やる」のまえにつくよ",  answer:"を", choices:["を","は","も","へ"],  image:"✂️" },
    { id:"wo7",  sentence:["てがみ","___","かきます。"],    blank:1, hint:"「よむ」「かく」のまえにつくよ",  answer:"を", choices:["を","は","も","へ"],  image:"📝" },
    { id:"wo8",  sentence:["ボール","___","なげます。"],    blank:1, hint:"「する」「やる」のまえにつくよ",  answer:"を", choices:["を","は","も","へ"],  image:"⚽" },
    { id:"wo9",  sentence:["えがお","___","みせます。"],    blank:1, hint:"「する」「やる」のまえにつくよ",  answer:"を", choices:["を","は","も","へ"],  image:"😊" },
    { id:"wo10", sentence:["おちゃ","___","のみます。"],    blank:1, hint:"「たべる」「のむ」のまえにつくよ", answer:"を", choices:["を","は","も","へ"],  image:"🍵" },
    { id:"wo11", sentence:["ケーキ","___","たべます。"],    blank:1, hint:"「たべる」「のむ」のまえにつくよ", answer:"を", choices:["を","は","も","へ"],  image:"🎂" },
    { id:"wo12", sentence:["じゅうす","___","のみます。"],  blank:1, hint:"「たべる」「のむ」のまえにつくよ", answer:"を", choices:["を","は","も","へ"],  image:"🧃" },
    { id:"wo13", sentence:["えほん","___","みます。"],      blank:1, hint:"「みる」のまえにつくよ",         answer:"を", choices:["を","は","も","へ"],  image:"📖" },
    { id:"wo14", sentence:["テレビ","___","みます。"],      blank:1, hint:"「みる」のまえにつくよ",         answer:"を", choices:["を","は","も","へ"],  image:"📺" },
    { id:"wo15", sentence:["おんがく","___","ききます。"],  blank:1, hint:"「きく」のまえにつくよ",         answer:"を", choices:["を","は","も","へ"],  image:"🎧" },
    { id:"wo16", sentence:["え","___","かきます。"],        blank:1, hint:"「よむ」「かく」のまえにつくよ",  answer:"を", choices:["を","は","も","へ"],  image:"🖼️" },
    { id:"wo17", sentence:["てがみ","___","だします。"],    blank:1, hint:"「する」「やる」のまえにつくよ",  answer:"を", choices:["を","は","も","へ"],  image:"✉️" },
    { id:"wo18", sentence:["くつ","___","はきます。"],      blank:1, hint:"「する」「やる」のまえにつくよ",  answer:"を", choices:["を","は","も","へ"],  image:"👟" },
    { id:"wo19", sentence:["ふく","___","きます。"],        blank:1, hint:"「する」「やる」のまえにつくよ",  answer:"を", choices:["を","は","も","へ"],  image:"👕" },
    { id:"wo20", sentence:["はを","___","みがきます。"],    blank:1, hint:"「する」「やる」のまえにつくよ",  answer:"を", choices:["を","は","も","へ"],  image:"🪥" },
    { id:"wo21", sentence:["かお","___","あらいます。"],    blank:1, hint:"「する」「やる」のまえにつくよ",  answer:"を", choices:["を","は","も","へ"],  image:"🚿" },
    { id:"wo22", sentence:["てを","___","あらいます。"],    blank:1, hint:"「する」「やる」のまえにつくよ",  answer:"を", choices:["を","は","も","へ"],  image:"🧼" },
    { id:"wo23", sentence:["べんとう","___","たべます。"],  blank:1, hint:"「たべる」「のむ」のまえにつくよ", answer:"を", choices:["を","は","も","へ"],  image:"🍱" },
    { id:"wo24", sentence:["パン","___","たべます。"],      blank:1, hint:"「たべる」「のむ」のまえにつくよ", answer:"を", choices:["を","は","も","へ"],  image:"🍞" },
    { id:"wo25", sentence:["にんじん","___","たべます。"],  blank:1, hint:"「たべる」「のむ」のまえにつくよ", answer:"を", choices:["を","は","も","へ"],  image:"🥕" },
    { id:"wo26", sentence:["ゲーム","___","します。"],      blank:1, hint:"「する」「やる」のまえにつくよ",  answer:"を", choices:["を","は","も","へ"],  image:"🎮" },
    { id:"wo27", sentence:["さんぽ","___","します。"],      blank:1, hint:"「する」「やる」のまえにつくよ",  answer:"を", choices:["を","は","も","へ"],  image:"🚶" },
    { id:"wo28", sentence:["べんきょう","___","します。"],  blank:1, hint:"「する」「やる」のまえにつくよ",  answer:"を", choices:["を","は","も","へ"],  image:"📝" },
    { id:"wo29", sentence:["そうじ","___","します。"],      blank:1, hint:"「する」「やる」のまえにつくよ",  answer:"を", choices:["を","は","も","へ"],  image:"🧹" },
    { id:"wo30", sentence:["せんたく","___","します。"],    blank:1, hint:"「する」「やる」のまえにつくよ",  answer:"を", choices:["を","は","も","へ"],  image:"🧺" },
    { id:"wo31", sentence:["りょうり","___","します。"],    blank:1, hint:"「する」「やる」のまえにつくよ",  answer:"を", choices:["を","は","も","へ"],  image:"🍳" },
    { id:"wo32", sentence:["おかし","___","たべます。"],    blank:1, hint:"「たべる」「のむ」のまえにつくよ", answer:"を", choices:["を","は","も","へ"],  image:"🍬" },
    { id:"wo33", sentence:["アイス","___","たべます。"],    blank:1, hint:"「たべる」「のむ」のまえにつくよ", answer:"を", choices:["を","は","も","へ"],  image:"🍦" },
    { id:"wo34", sentence:["ジュース","___","つくります。"],blank:1, hint:"「する」「やる」のまえにつくよ",  answer:"を", choices:["を","は","も","へ"],  image:"🍹" },
    { id:"wo35", sentence:["かさ","___","もちます。"],      blank:1, hint:"「する」「やる」のまえにつくよ",  answer:"を", choices:["を","は","も","へ"],  image:"☂️" },
    { id:"wo36", sentence:["おもちゃ","___","かたづけます。"],blank:1,hint:"「する」「やる」のまえにつくよ", answer:"を", choices:["を","は","も","へ"],  image:"🧸" },
    { id:"wo37", sentence:["はな","___","うえます。"],      blank:1, hint:"「する」「やる」のまえにつくよ",  answer:"を", choices:["を","は","も","へ"],  image:"🌷" },
    { id:"wo38", sentence:["みせ","___","でます。"],        blank:1, hint:"「する」「やる」のまえにつくよ",  answer:"を", choices:["を","は","も","へ"],  image:"🏪" },
    { id:"wo39", sentence:["みち","___","あるきます。"],    blank:1, hint:"「する」「やる」のまえにつくよ",  answer:"を", choices:["を","は","も","へ"],  image:"🛣️" },
    { id:"wo40", sentence:["そら","___","とびます。"],      blank:1, hint:"「する」「やる」のまえにつくよ",  answer:"を", choices:["を","は","も","へ"],  image:"🕊️" },
    { id:"wo41", sentence:["やさい","___","きります。"],    blank:1, hint:"「する」「やる」のまえにつくよ",  answer:"を", choices:["を","は","も","へ"],  image:"🥦" },
    { id:"wo42", sentence:["コップ","___","あらいます。"],  blank:1, hint:"「する」「やる」のまえにつくよ",  answer:"を", choices:["を","は","も","へ"],  image:"🥤" },
    { id:"wo43", sentence:["えをかいた","___","みます。"],  blank:1, hint:"「みる」のまえにつくよ",         answer:"を", choices:["を","は","も","へ"],  image:"🎨" },
    { id:"wo44", sentence:["はしご","___","のぼります。"],  blank:1, hint:"「する」「やる」のまえにつくよ",  answer:"を", choices:["を","は","も","へ"],  image:"🪜" },
    { id:"wo45", sentence:["いぬ","___","だきます。"],      blank:1, hint:"「する」「やる」のまえにつくよ",  answer:"を", choices:["を","は","も","へ"],  image:"🐶" },
    { id:"wo46", sentence:["くさ","___","ふみます。"],      blank:1, hint:"「する」「やる」のまえにつくよ",  answer:"を", choices:["を","は","も","へ"],  image:"🌿" },
    { id:"wo47", sentence:["かわ","___","わたります。"],    blank:1, hint:"「する」「やる」のまえにつくよ",  answer:"を", choices:["を","は","も","へ"],  image:"🌉" },
    { id:"wo48", sentence:["プール","___","およぎます。"],  blank:1, hint:"どこで するかを あらわすよ",  answer:"で", choices:["で","は","に","も"],  image:"🏊" },
    { id:"wo49", sentence:["きょうしつ","___","はいります。"],    blank:1, hint:"どこへ いくかを あらわすよ",  answer:"に", choices:["に","は","で","も"],  image:"🏫" },
    { id:"wo50", sentence:["たまご","___","やきます。"],    blank:1, hint:"「する」「やる」のまえにつくよ",  answer:"を", choices:["を","は","も","へ"],  image:"🍳" },
  ],
  は: [
    { id:"wa1",  sentence:["ねこ","___","かわいいです。"],    blank:1, hint:"「〇〇は」で テーマを あらわすよ", answer:"は", choices:["は","に","で","も"],  image:"🐱" },
    { id:"wa2",  sentence:["そら","___","あおいです。"],      blank:1, hint:"「〇〇は」で テーマを あらわすよ", answer:"は", choices:["は","に","で","も"],  image:"🌤️" },
    { id:"wa3",  sentence:["やま","___","たかいです。"],      blank:1, hint:"「〇〇は」で テーマを あらわすよ", answer:"は", choices:["は","に","で","も"],  image:"⛰️" },
    { id:"wa4",  sentence:["おかし","___","あまいです。"],    blank:1, hint:"「〇〇は」で テーマを あらわすよ", answer:"は", choices:["は","に","で","も"],  image:"🍬" },
    { id:"wa5",  sentence:["うみ","___","ひろいです。"],      blank:1, hint:"「〇〇は」で テーマを あらわすよ", answer:"は", choices:["は","に","で","も"],  image:"🌊" },
    { id:"wa6",  sentence:["りんご","___","あかいです。"],    blank:1, hint:"「〇〇は」で テーマを あらわすよ", answer:"は", choices:["は","に","で","も"],  image:"🍎" },
    { id:"wa7",  sentence:["くるま","___","はやいです。"],    blank:1, hint:"「〇〇は」で テーマを あらわすよ", answer:"は", choices:["は","に","で","も"],  image:"🚗" },
    { id:"wa8",  sentence:["はな","___","きれいです。"],      blank:1, hint:"「〇〇は」で テーマを あらわすよ", answer:"は", choices:["は","に","で","も"],  image:"🌸" },
    { id:"wa9",  sentence:["ゆき","___","しろいです。"],      blank:1, hint:"「〇〇は」で テーマを あらわすよ", answer:"は", choices:["は","に","で","も"],  image:"❄️" },
    { id:"wa10", sentence:["たいよう","___","あかるいです。"],blank:1, hint:"「〇〇は」で テーマを あらわすよ", answer:"は", choices:["は","に","で","も"],  image:"☀️" },
    { id:"wa11", sentence:["いぬ","___","かわいいです。"],    blank:1, hint:"「〇〇は」で テーマを あらわすよ", answer:"は", choices:["は","に","で","も"],  image:"🐕" },
    { id:"wa12", sentence:["みず","___","つめたいです。"],    blank:1, hint:"「〇〇は」で テーマを あらわすよ", answer:"は", choices:["は","に","で","も"],  image:"💧" },
    { id:"wa13", sentence:["かぜ","___","つよいです。"],      blank:1, hint:"「〇〇は」で テーマを あらわすよ", answer:"は", choices:["は","に","で","も"],  image:"🌬️" },
    { id:"wa14", sentence:["でんしゃ","___","はやいです。"],  blank:1, hint:"「〇〇は」で テーマを あらわすよ", answer:"は", choices:["は","に","で","も"],  image:"🚃" },
    { id:"wa15", sentence:["パン","___","おいしいです。"],    blank:1, hint:"「〇〇は」で テーマを あらわすよ", answer:"は", choices:["は","に","で","も"],  image:"🍞" },
    { id:"wa16", sentence:["かわ","___","ながいです。"],      blank:1, hint:"「〇〇は」で テーマを あらわすよ", answer:"は", choices:["は","に","で","も"],  image:"🌊" },
    { id:"wa17", sentence:["ほし","___","きれいです。"],      blank:1, hint:"「〇〇は」で テーマを あらわすよ", answer:"は", choices:["は","に","で","も"],  image:"⭐" },
    { id:"wa18", sentence:["ゾウ","___","おおきいです。"],    blank:1, hint:"「〇〇は」で テーマを あらわすよ", answer:"は", choices:["は","に","で","も"],  image:"🐘" },
    { id:"wa19", sentence:["アリ","___","ちいさいです。"],    blank:1, hint:"「〇〇は」で テーマを あらわすよ", answer:"は", choices:["は","に","で","も"],  image:"🐜" },
    { id:"wa20", sentence:["ケーキ","___","あまいです。"],    blank:1, hint:"「〇〇は」で テーマを あらわすよ", answer:"は", choices:["は","に","で","も"],  image:"🎂" },
    { id:"wa21", sentence:["すいか","___","あまいです。"],    blank:1, hint:"「〇〇は」で テーマを あらわすよ", answer:"は", choices:["は","に","で","も"],  image:"🍉" },
    { id:"wa22", sentence:["バナナ","___","きいろいです。"],  blank:1, hint:"「〇〇は」で テーマを あらわすよ", answer:"は", choices:["は","に","で","も"],  image:"🍌" },
    { id:"wa23", sentence:["トマト","___","あかいです。"],    blank:1, hint:"「〇〇は」で テーマを あらわすよ", answer:"は", choices:["は","に","で","も"],  image:"🍅" },
    { id:"wa24", sentence:["ブドウ","___","むらさきです。"],  blank:1, hint:"「〇〇は」で テーマを あらわすよ", answer:"は", choices:["は","に","で","も"],  image:"🍇" },
    { id:"wa25", sentence:["いちご","___","あかいです。"],    blank:1, hint:"「〇〇は」で テーマを あらわすよ", answer:"は", choices:["は","に","で","も"],  image:"🍓" },
    { id:"wa26", sentence:["ほん","___","おもしろいです。"],  blank:1, hint:"「〇〇は」で テーマを あらわすよ", answer:"は", choices:["は","に","で","も"],  image:"📚" },
    { id:"wa27", sentence:["えいが","___","たのしいです。"],  blank:1, hint:"「〇〇は」で テーマを あらわすよ", answer:"は", choices:["は","に","で","も"],  image:"🎬" },
    { id:"wa28", sentence:["がっこう","___","たのしいです。"],blank:1, hint:"「〇〇は」で テーマを あらわすよ", answer:"は", choices:["は","に","で","も"],  image:"🏫" },
    { id:"wa29", sentence:["こうえん","___","たのしいです。"],blank:1, hint:"「〇〇は」で テーマを あらわすよ", answer:"は", choices:["は","に","で","も"],  image:"🌳" },
    { id:"wa30", sentence:["ゆめ","___","たのしいです。"],    blank:1, hint:"「〇〇は」で テーマを あらわすよ", answer:"は", choices:["は","に","で","も"],  image:"💭" },
    { id:"wa31", sentence:["おにぎり","___","おいしいです。"],blank:1, hint:"「〇〇は」で テーマを あらわすよ", answer:"は", choices:["は","に","で","も"],  image:"🍙" },
    { id:"wa32", sentence:["ラーメン","___","からいです。"],  blank:1, hint:"「〇〇は」で テーマを あらわすよ", answer:"は", choices:["は","に","で","も"],  image:"🍜" },
    { id:"wa33", sentence:["カレー","___","からいです。"],    blank:1, hint:"「〇〇は」で テーマを あらわすよ", answer:"は", choices:["は","に","で","も"],  image:"🍛" },
    { id:"wa34", sentence:["レモン","___","すっぱいです。"],  blank:1, hint:"「〇〇は」で テーマを あらわすよ", answer:"は", choices:["は","に","で","も"],  image:"🍋" },
    { id:"wa35", sentence:["こーひー","___","にがいです。"],  blank:1, hint:"「〇〇は」で テーマを あらわすよ", answer:"は", choices:["は","に","で","も"],  image:"☕" },
    { id:"wa36", sentence:["あさ","___","さむいです。"],      blank:1, hint:"「〇〇は」で テーマを あらわすよ", answer:"は", choices:["は","に","で","も"],  image:"🌄" },
    { id:"wa37", sentence:["よる","___","くらいです。"],      blank:1, hint:"「〇〇は」で テーマを あらわすよ", answer:"は", choices:["は","に","で","も"],  image:"🌃" },
    { id:"wa38", sentence:["なつ","___","あついです。"],      blank:1, hint:"「〇〇は」で テーマを あらわすよ", answer:"は", choices:["は","に","で","も"],  image:"🌞" },
    { id:"wa39", sentence:["ふゆ","___","さむいです。"],      blank:1, hint:"「〇〇は」で テーマを あらわすよ", answer:"は", choices:["は","に","で","も"],  image:"⛄" },
    { id:"wa40", sentence:["はる","___","あたたかいです。"],  blank:1, hint:"「〇〇は」で テーマを あらわすよ", answer:"は", choices:["は","に","で","も"],  image:"🌷" },
    { id:"wa41", sentence:["まち","___","にぎやかです。"],    blank:1, hint:"「〇〇は」で テーマを あらわすよ", answer:"は", choices:["は","に","で","も"],  image:"🏙️" },
    { id:"wa42", sentence:["もり","___","しずかです。"],      blank:1, hint:"「〇〇は」で テーマを あらわすよ", answer:"は", choices:["は","に","で","も"],  image:"🌲" },
    { id:"wa43", sentence:["ドーナツ","___","まるいです。"],  blank:1, hint:"「〇〇は」で テーマを あらわすよ", answer:"は", choices:["は","に","で","も"],  image:"🍩" },
    { id:"wa44", sentence:["シマウマ","___","しろくろです。"],blank:1, hint:"「〇〇は」で テーマを あらわすよ", answer:"は", choices:["は","に","で","も"],  image:"🦓" },
    { id:"wa45", sentence:["キリン","___","くびがながいです。"],blank:1,hint:"「〇〇は」で テーマを あらわすよ", answer:"は", choices:["は","に","で","も"],  image:"🦒" },
    { id:"wa46", sentence:["ピアノ","___","おもいです。"],    blank:1, hint:"「〇〇は」で テーマを あらわすよ", answer:"は", choices:["は","に","で","も"],  image:"🎹" },
    { id:"wa47", sentence:["はね","___","かるいです。"],      blank:1, hint:"「〇〇は」で テーマを あらわすよ", answer:"は", choices:["は","に","で","も"],  image:"🪶" },
    { id:"wa48", sentence:["かみなり","___","こわいです。"],  blank:1, hint:"「〇〇は」で テーマを あらわすよ", answer:"は", choices:["は","に","で","も"],  image:"⚡" },
    { id:"wa49", sentence:["うちゅう","___","ひろいです。"],  blank:1, hint:"「〇〇は」で テーマを あらわすよ", answer:"は", choices:["は","に","で","も"],  image:"🌌" },
    { id:"wa50", sentence:["ふじさん","___","たかいです。"],  blank:1, hint:"「〇〇は」で テーマを あらわすよ", answer:"は", choices:["は","に","で","も"],  image:"🗻" },
  ],
  に: [
    { id:"ni1",  sentence:["えき","___","います。"],          blank:1, hint:"どこに あるかを あらわすよ",    answer:"に", choices:["に","は","で","も"],  image:"🚉" },
    { id:"ni2",  sentence:["がっこう","___","いきます。"],    blank:1, hint:"どこへ いくかを あらわすよ",    answer:"に", choices:["に","は","で","も"],  image:"🏫" },
    { id:"ni3",  sentence:["いえ","___","かえります。"],      blank:1, hint:"どこへ いくかを あらわすよ",    answer:"に", choices:["に","は","で","も"],  image:"🏠" },
    { id:"ni4",  sentence:["びょういん","___","いきます。"],  blank:1, hint:"どこへ いくかを あらわすよ",    answer:"に", choices:["に","は","で","も"],  image:"🏥" },
    { id:"ni5",  sentence:["いす","___","すわります。"],      blank:1, hint:"どこへ・なにに、を あらわすよ", answer:"に", choices:["に","は","で","も"],  image:"🪑" },
    { id:"ni6",  sentence:["きのう","___","ねます。"],        blank:1, hint:"いつ するかを あらわすよ",      answer:"に", choices:["に","は","で","も"],  image:"😴" },
    { id:"ni7",  sentence:["みぎ","___","まがります。"],      blank:1, hint:"どちらへ いくかを あらわすよ",  answer:"に", choices:["に","は","で","も"],  image:"↪️" },
    { id:"ni8",  sentence:["もり","___","はいります。"],      blank:1, hint:"どこへ いくかを あらわすよ",    answer:"に", choices:["に","は","で","も"],  image:"🌲" },
    { id:"ni9",  sentence:["つくえ","___","おきます。"],      blank:1, hint:"どこへ おくかを あらわすよ",    answer:"に", choices:["に","は","で","も"],  image:"🪞" },
    { id:"ni10", sentence:["でんしゃ","___","のります。"],    blank:1, hint:"なにに のるかを あらわすよ",    answer:"に", choices:["に","は","で","も"],  image:"🚃" },
    { id:"ni11", sentence:["こうえん","___","いきます。"],    blank:1, hint:"どこへ いくかを あらわすよ",    answer:"に", choices:["に","は","で","も"],  image:"🌳" },
    { id:"ni12", sentence:["プール","___","はいります。"],    blank:1, hint:"どこへ いくかを あらわすよ",    answer:"に", choices:["に","は","で","も"],  image:"🏊" },
    { id:"ni13", sentence:["ベッド","___","ねます。"],        blank:1, hint:"どこで するかを あらわすよ",    answer:"に", choices:["に","は","で","も"],  image:"🛏️" },
    { id:"ni14", sentence:["うみ","___","いきます。"],        blank:1, hint:"どこへ いくかを あらわすよ",    answer:"に", choices:["に","は","で","も"],  image:"🌊" },
    { id:"ni15", sentence:["やま","___","のぼります。"],      blank:1, hint:"どこへ いくかを あらわすよ",    answer:"に", choices:["に","は","で","も"],  image:"⛰️" },
    { id:"ni16", sentence:["みぎ","___","まがります。"],      blank:1, hint:"どちらへ まがるかを あらわすよ", answer:"に", choices:["に","は","で","も"],  image:"➡️" },
    { id:"ni17", sentence:["ひだり","___","まがります。"],    blank:1, hint:"どちらへ まがるかを あらわすよ", answer:"に", choices:["に","は","で","も"],  image:"⬅️" },
    { id:"ni18", sentence:["はこ","___","いれます。"],        blank:1, hint:"どこへ いれるかを あらわすよ",   answer:"に", choices:["に","は","で","も"],  image:"📦" },
    { id:"ni19", sentence:["かばん","___","しまいます。"],    blank:1, hint:"どこへ しまうかを あらわすよ",   answer:"に", choices:["に","は","で","も"],  image:"🎒" },
    { id:"ni20", sentence:["どうぶつえん","___","いきます。"],blank:1, hint:"どこへ いくかを あらわすよ",    answer:"に", choices:["に","は","で","も"],  image:"🦁" },
    { id:"ni21", sentence:["としょかん","___","いきます。"],  blank:1, hint:"どこへ いくかを あらわすよ",    answer:"に", choices:["に","は","で","も"],  image:"📖" },
    { id:"ni22", sentence:["スーパー","___","いきます。"],    blank:1, hint:"どこへ いくかを あらわすよ",    answer:"に", choices:["に","は","で","も"],  image:"🛒" },
    { id:"ni23", sentence:["でんしゃ","___","のります。"],    blank:1, hint:"なにに のるかを あらわすよ",    answer:"に", choices:["に","は","で","も"],  image:"🚆" },
    { id:"ni24", sentence:["タクシー","___","のります。"],    blank:1, hint:"なにに のるかを あらわすよ",    answer:"に", choices:["に","は","で","も"],  image:"🚕" },
    { id:"ni25", sentence:["ひこうき","___","のります。"],    blank:1, hint:"なにに のるかを あらわすよ",    answer:"に", choices:["に","は","で","も"],  image:"✈️" },
    { id:"ni26", sentence:["たな","___","おきます。"],        blank:1, hint:"どこへ おくかを あらわすよ",    answer:"に", choices:["に","は","で","も"],  image:"🗄️" },
    { id:"ni27", sentence:["ソファ","___","すわります。"],    blank:1, hint:"どこへ すわるかを あらわすよ",   answer:"に", choices:["に","は","で","も"],  image:"🛋️" },
    { id:"ni28", sentence:["きょうしつ","___","はいります。"],blank:1, hint:"どこへ はいるかを あらわすよ",  answer:"に", choices:["に","は","で","も"],  image:"🏫" },
    { id:"ni29", sentence:["にほん","___","いきます。"],      blank:1, hint:"どこへ いくかを あらわすよ",    answer:"に", choices:["に","は","で","も"],  image:"🗾" },
    { id:"ni30", sentence:["おかあさん","___","あいます。"],  blank:1, hint:"だれに あうかを あらわすよ",    answer:"に", choices:["に","は","で","も"],  image:"👩" },
    { id:"ni31", sentence:["ともだち","___","あいます。"],    blank:1, hint:"だれに あうかを あらわすよ",    answer:"に", choices:["に","は","で","も"],  image:"👫" },
    { id:"ni32", sentence:["せんせい","___","おしえます。"],  blank:1, hint:"だれに するかを あらわすよ",    answer:"に", choices:["に","は","で","も"],  image:"👩‍🏫" },
    { id:"ni33", sentence:["おとうと","___","あげます。"],    blank:1, hint:"だれに あげるかを あらわすよ",  answer:"に", choices:["に","は","で","も"],  image:"🎁" },
    { id:"ni34", sentence:["かみ","___","かきます。"],        blank:1, hint:"どこへ かくかを あらわすよ",   answer:"に", choices:["に","は","で","も"],  image:"📄" },
    { id:"ni35", sentence:["みえます","___","てをふります。"],blank:1, hint:"どこへ するかを あらわすよ",   answer:"に", choices:["に","は","で","も"],  image:"👋" },
    { id:"ni36", sentence:["くだもの","___","なります。"],    blank:1, hint:"だれが・なにが、を あらわすよ",   answer:"が", choices:["が","に","で","も"],  image:"🍊" },
    { id:"ni37", sentence:["えいご","___","なります。"],      blank:1, hint:"なにに なるかを あらわすよ",   answer:"に", choices:["に","は","で","も"],  image:"📘" },
    { id:"ni38", sentence:["みち","___","まよいます。"],      blank:1, hint:"どこで するかを あらわすよ",   answer:"に", choices:["に","は","で","も"],  image:"🗺️" },
    { id:"ni39", sentence:["ゆき","___","うもれます。"],      blank:1, hint:"なにに うもれるかを あらわすよ",answer:"に", choices:["に","は","で","も"],  image:"❄️" },
    { id:"ni40", sentence:["てき","___","まけます。"],      blank:1, hint:"だれに まけるかを あらわすよ",  answer:"に", choices:["に","は","で","も"],  image:"😞" },
    { id:"ni41", sentence:["てき","___","かちます。"],      blank:1, hint:"だれに かつかを あらわすよ",   answer:"に", choices:["に","は","で","も"],  image:"🏆" },
    { id:"ni42", sentence:["みなみ","___","あるきます。"],    blank:1, hint:"どちらへ あるくかを あらわすよ", answer:"に", choices:["に","は","で","も"],  image:"🧭" },
    { id:"ni43", sentence:["きた","___","すすみます。"],      blank:1, hint:"どちらへ すすむかを あらわすよ", answer:"に", choices:["に","は","で","も"],  image:"⬆️" },
    { id:"ni44", sentence:["ちず","___","かきます。"],        blank:1, hint:"どこへ かくかを あらわすよ",   answer:"に", choices:["に","は","で","も"],  image:"🗺️" },
    { id:"ni45", sentence:["きょう","___","かえります。"],    blank:1, hint:"いつ するかを あらわすよ",      answer:"に", choices:["に","は","で","も"],  image:"📅" },
    { id:"ni46", sentence:["しごと","___","いきます。"],      blank:1, hint:"どこへ いくかを あらわすよ",    answer:"に", choices:["に","は","で","も"],  image:"💼" },
    { id:"ni47", sentence:["うんどうかい","___","でます。"],  blank:1, hint:"なにに でるかを あらわすよ",    answer:"に", choices:["に","は","で","も"],  image:"🏃" },
    { id:"ni48", sentence:["ゴール","___","はいります。"],    blank:1, hint:"どこへ はいるかを あらわすよ",  answer:"に", choices:["に","は","で","も"],  image:"⚽" },
    { id:"ni49", sentence:["ちず","___","のります。"],        blank:1, hint:"どこへ のるかを あらわすよ",   answer:"に", choices:["に","は","で","も"],  image:"🗾" },
    { id:"ni50", sentence:["おんせん","___","はいります。"],  blank:1, hint:"どこへ はいるかを あらわすよ",  answer:"に", choices:["に","は","で","も"],  image:"♨️" },
  ],
  で: [
    { id:"de1",  sentence:["こうえん","___","あそびます。"],       blank:1, hint:"どこで するかを あらわすよ", answer:"で", choices:["で","は","に","も"],  image:"🌳" },
    { id:"de2",  sentence:["がっこう","___","べんきょうします。"],  blank:1, hint:"どこで するかを あらわすよ", answer:"で", choices:["で","は","に","も"],  image:"🏫" },
    { id:"de3",  sentence:["うみ","___","およぎます。"],            blank:1, hint:"どこで するかを あらわすよ", answer:"で", choices:["で","は","に","も"],  image:"🏊" },
    { id:"de4",  sentence:["としょかん","___","よみます。"],        blank:1, hint:"どこで するかを あらわすよ", answer:"で", choices:["で","は","に","も"],  image:"📖" },
    { id:"de5",  sentence:["はし","___","たべます。"],              blank:1, hint:"なにで するかを あらわすよ", answer:"で", choices:["で","は","に","も"],  image:"🥢" },
    { id:"de6",  sentence:["じてんしゃ","___","いきます。"],        blank:1, hint:"なにで するかを あらわすよ", answer:"で", choices:["で","は","に","も"],  image:"🚲" },
    { id:"de7",  sentence:["なわとび","___","あそびます。"],        blank:1, hint:"なにで するかを あらわすよ", answer:"で", choices:["で","は","に","も"],  image:"🪢" },
    { id:"de8",  sentence:["でんしゃ","___","いきます。"],          blank:1, hint:"なにで するかを あらわすよ", answer:"で", choices:["で","は","に","も"],  image:"🚃" },
    { id:"de9",  sentence:["にわ","___","あそびます。"],            blank:1, hint:"どこで するかを あらわすよ", answer:"で", choices:["で","は","に","も"],  image:"🏡" },
    { id:"de10", sentence:["えんぴつ","___","かきます。"],          blank:1, hint:"なにで するかを あらわすよ", answer:"で", choices:["で","は","に","も"],  image:"✏️" },
    { id:"de11", sentence:["プール","___","あそびます。"],          blank:1, hint:"どこで するかを あらわすよ", answer:"で", choices:["で","は","に","も"],  image:"🏊" },
    { id:"de12", sentence:["はさみ","___","きります。"],            blank:1, hint:"なにで するかを あらわすよ", answer:"で", choices:["で","は","に","も"],  image:"✂️" },
    { id:"de13", sentence:["くち","___","うたいます。"],            blank:1, hint:"なにで するかを あらわすよ", answer:"で", choices:["で","は","に","も"],  image:"🎤" },
    { id:"de14", sentence:["いえ","___","やすみます。"],            blank:1, hint:"どこで するかを あらわすよ", answer:"で", choices:["で","は","に","も"],  image:"🏠" },
    { id:"de15", sentence:["バス","___","いきます。"],              blank:1, hint:"なにで するかを あらわすよ", answer:"で", choices:["で","は","に","も"],  image:"🚌" },
    { id:"de16", sentence:["じょうぎ","___","はかります。"],        blank:1, hint:"なにで するかを あらわすよ", answer:"で", choices:["で","は","に","も"],  image:"📏" },
    { id:"de17", sentence:["ナイフ","___","きります。"],            blank:1, hint:"なにで するかを あらわすよ", answer:"で", choices:["で","は","に","も"],  image:"🔪" },
    { id:"de18", sentence:["なべ","___","にます。"],                blank:1, hint:"なにで するかを あらわすよ", answer:"で", choices:["で","は","に","も"],  image:"🍲" },
    { id:"de19", sentence:["スプーン","___","たべます。"],          blank:1, hint:"なにで するかを あらわすよ", answer:"で", choices:["で","は","に","も"],  image:"🥄" },
    { id:"de20", sentence:["ひろば","___","あそびます。"],          blank:1, hint:"どこで するかを あらわすよ", answer:"で", choices:["で","は","に","も"],  image:"🎡" },
    { id:"de21", sentence:["たいいくかん","___","うんどうします。"],blank:1, hint:"どこで するかを あらわすよ", answer:"で", choices:["で","は","に","も"],  image:"🏋️" },
    { id:"de22", sentence:["にほんご","___","はなします。"],        blank:1, hint:"なにで するかを あらわすよ", answer:"で", choices:["で","は","に","も"],  image:"🗣️" },
    { id:"de23", sentence:["でんしゃ","___","かえります。"],        blank:1, hint:"なにで するかを あらわすよ", answer:"で", choices:["で","は","に","も"],  image:"🚃" },
    { id:"de24", sentence:["スコップ","___","ほります。"],          blank:1, hint:"なにで するかを あらわすよ", answer:"で", choices:["で","は","に","も"],  image:"🪣" },
    { id:"de25", sentence:["ものさし","___","はかります。"],          blank:1, hint:"なにで するかを あらわすよ", answer:"で", choices:["で","は","に","も"],  image:"📏" },
    { id:"de26", sentence:["あし","___","けります。"],              blank:1, hint:"なにで するかを あらわすよ", answer:"で", choices:["で","は","に","も"],  image:"🦶" },
    { id:"de27", sentence:["て","___","つくります。"],              blank:1, hint:"なにで するかを あらわすよ", answer:"で", choices:["で","は","に","も"],  image:"🤲" },
    { id:"de28", sentence:["ビデオ","___","とります。"],            blank:1, hint:"なにで するかを あらわすよ", answer:"で", choices:["で","は","に","も"],  image:"📹" },
    { id:"de29", sentence:["カメラ","___","とります。"],            blank:1, hint:"なにで するかを あらわすよ", answer:"で", choices:["で","は","に","も"],  image:"📷" },
    { id:"de30", sentence:["こうえん","___","はしります。"],        blank:1, hint:"どこで するかを あらわすよ", answer:"で", choices:["で","は","に","も"],  image:"🏃" },
    { id:"de31", sentence:["のこぎり","___","きります。"],          blank:1, hint:"なにで するかを あらわすよ", answer:"で", choices:["で","は","に","も"],  image:"🪚" },
    { id:"de32", sentence:["くるま","___","いきます。"],            blank:1, hint:"なにで するかを あらわすよ", answer:"で", choices:["で","は","に","も"],  image:"🚗" },
    { id:"de33", sentence:["クレヨン","___","かきます。"],          blank:1, hint:"なにで するかを あらわすよ", answer:"で", choices:["で","は","に","も"],  image:"🖍️" },
    { id:"de34", sentence:["はけ","___","ぬります。"],              blank:1, hint:"なにで するかを あらわすよ", answer:"で", choices:["で","は","に","も"],  image:"🖌️" },
    { id:"de35", sentence:["かがみ","___","みます。"],              blank:1, hint:"なにで するかを あらわすよ", answer:"で", choices:["で","は","に","も"],  image:"🪞" },
    { id:"de36", sentence:["そと","___","あそびます。"],          blank:1, hint:"どこで するかを あらわすよ", answer:"で", choices:["で","は","に","も"],  image:"🌤️" },
    { id:"de37", sentence:["ひとり","___","たべます。"],          blank:1, hint:"どのようにするかを あらわすよ",answer:"で", choices:["で","は","に","も"],  image:"🍽️" },
    { id:"de38", sentence:["みんな","___","たのしみます。"],        blank:1, hint:"どのようにするかを あらわすよ",answer:"で", choices:["で","は","に","も"],  image:"🎉" },
    { id:"de39", sentence:["はやあし","___","はしります。"],        blank:1, hint:"どのようにするかを あらわすよ",answer:"で", choices:["で","は","に","も"],  image:"🏃" },
    { id:"de40", sentence:["リレー","___","はしります。"],          blank:1, hint:"なにで するかを あらわすよ", answer:"で", choices:["で","は","に","も"],  image:"🏅" },
    { id:"de41", sentence:["しんかんせん","___","いきます。"],      blank:1, hint:"なにで するかを あらわすよ", answer:"で", choices:["で","は","に","も"],  image:"🚄" },
    { id:"de42", sentence:["ふね","___","わたります。"],            blank:1, hint:"なにで するかを あらわすよ", answer:"で", choices:["で","は","に","も"],  image:"⛵" },
    { id:"de43", sentence:["きかい","___","つくります。"],          blank:1, hint:"なにで するかを あらわすよ", answer:"で", choices:["で","は","に","も"],  image:"⚙️" },
    { id:"de44", sentence:["チョーク","___","かきます。"],          blank:1, hint:"なにで するかを あらわすよ", answer:"で", choices:["で","は","に","も"],  image:"🖊️" },
    { id:"de45", sentence:["じてんしゃ","___","かえります。"],      blank:1, hint:"なにで するかを あらわすよ", answer:"で", choices:["で","は","に","も"],  image:"🚲" },
    { id:"de46", sentence:["タオル","___","ふきます。"],            blank:1, hint:"なにで するかを あらわすよ", answer:"で", choices:["で","は","に","も"],  image:"🧻" },
    { id:"de47", sentence:["みんな","___","つくります。"],        blank:1, hint:"どのようにするかを あらわすよ",answer:"で", choices:["で","は","に","も"],  image:"🤝" },
    { id:"de48", sentence:["おなべ","___","にます。"],              blank:1, hint:"なにで するかを あらわすよ", answer:"で", choices:["で","は","に","も"],  image:"🍲" },
    { id:"de49", sentence:["ナイフ","___","けずります。"],          blank:1, hint:"なにで するかを あらわすよ", answer:"で", choices:["で","は","に","も"],  image:"🔪" },
    { id:"de50", sentence:["じゅぎょう","___","はなします。"],      blank:1, hint:"どこで するかを あらわすよ", answer:"で", choices:["で","は","に","も"],  image:"🏫" },
  ],
};

const PARTICLE_CONFIG = {
  が: { color:"#FF6B6B", bg:"#fff0f0", desc:"だれが・なにが" },
  を: { color:"#00B5A3", bg:"#f0fffe", desc:"〜をする" },
  は: { color:"#E6A800", bg:"#fffbea", desc:"テーマ・話題" },
  に: { color:"#4A9EDB", bg:"#f0f7ff", desc:"どこに・どこへ" },
  で: { color:"#E8654A", bg:"#fff3f0", desc:"どこで・なにで" },
};

// ─── ユーティリティ ────────────────────────────────────────────
// ③ 選択肢のルール：一緒に出てはいけない組み合わせ
const FORBIDDEN_PAIRS = [
  ["が", "は"], ["を", "に"], ["を", "で"], ["に", "へ"]
];

function fixChoices(answer, choices) {
  let fixed = [...choices];
  for (const [a, b] of FORBIDDEN_PAIRS) {
    if (fixed.includes(a) && fixed.includes(b)) {
      // answerでない方を別の助詞に置き換える
      const removeTarget = answer === a ? b : a;
      const all = ["が","を","は","に","で","へ"];
      const replacement = all.find(p =>
        p !== answer &&
        !fixed.includes(p) &&
        !FORBIDDEN_PAIRS.some(([x,y]) =>
          (fixed.includes(x) && p === y) || (fixed.includes(y) && p === x)
        )
      );
      if (replacement) {
        fixed = fixed.map(c => c === removeTarget ? replacement : c);
      }
    }
  }
  return fixed;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── ストレージ（メモリ内） ───────────────────────────────────
function loadHistory() {
  try { return window.__joshiHistory ? JSON.parse(window.__joshiHistory) : { sessions:[], questionStats:{} }; }
  catch { return { sessions:[], questionStats:{} }; }
}
function saveHistory(h) { window.__joshiHistory = JSON.stringify(h); }

// ─── Hanamaru ────────────────────────────────────────────────
function Hanamaru({ visible }) {
  if (!visible) return null;
  return (
    <div style={{ position:"fixed",inset:0,display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,pointerEvents:"none" }}>
      <svg width="300" height="300" viewBox="0 0 300 300" style={{ animation:"hanamaruPop 0.6s cubic-bezier(0.34,1.56,0.64,1) both" }}>
        {[0,45,90,135,180,225,270,315].map((deg,i)=>(
          <ellipse key={i} cx={150+108*Math.cos(deg*Math.PI/180)} cy={150+108*Math.sin(deg*Math.PI/180)} rx="18" ry="10"
            fill={["#FF6B6B","#FFD93D","#4ECDC4","#667eea","#FF6B6B","#FFD93D","#4ECDC4","#667eea"][i]}
            transform={`rotate(${deg},${150+108*Math.cos(deg*Math.PI/180)},${150+108*Math.sin(deg*Math.PI/180)})`} opacity="0.85"/>
        ))}
        <circle cx="150" cy="150" r="110" fill="none" stroke="#FF4444" strokeWidth="14" strokeLinecap="round"/>
        <path d="M 55 120 Q 30 90 50 70" fill="none" stroke="#FF4444" strokeWidth="14" strokeLinecap="round"/>
        <circle cx="150" cy="150" r="68" fill="white" opacity="0.92"/>
        <text x="150" y="168" textAnchor="middle" fontSize="72" fontWeight="900" fill="#FF4444" fontFamily="serif">◎</text>
      </svg>
    </div>
  );
}

function StarBurst({ count }) {
  return (
    <div style={{ display:"flex",gap:4,justifyContent:"center",marginTop:8 }}>
      {Array.from({length:count}).map((_,i)=>(
        <span key={i} style={{ fontSize:28,animation:`pop 0.3s ease ${i*0.1}s both` }}>⭐</span>
      ))}
    </div>
  );
}

// ─── 履歴ページ ──────────────────────────────────────────────
function HistoryScreen({ onBack, onStartWeak }) {
  const [tab, setTab] = useState("progress");
  const history = loadHistory();
  const { sessions, questionStats } = history;

  const totalSessions = sessions.length;
  const totalCorrect  = sessions.reduce((s,x)=>s+x.score,0);
  const totalQ        = sessions.reduce((s,x)=>s+x.total,0);
  const overallRate   = totalQ>0 ? Math.round((totalCorrect/totalQ)*100) : 0;

  const weakQuestions = Object.entries(questionStats)
    .map(([id,stat])=>{
      let q=null;
      for(const qs of Object.values(ALL_QUESTIONS)){ const f=qs.find(x=>x.id===id); if(f){q=f;break;} }
      return {id,...stat,q};
    })
    .filter(x=>x.q && x.total>=2)
    .sort((a,b)=>(a.correct/a.total)-(b.correct/b.total))
    .slice(0,20);

  const hasWeak = weakQuestions.length > 0;

  const tabStyle=(t)=>({ flex:1,padding:"10px 4px",fontSize:13,fontWeight:"bold",border:"none",cursor:"pointer",borderRadius:10,
    background:tab===t?"#667eea":"transparent",color:tab===t?"#fff":"#888",transition:"all 0.15s" });

  return (
    <div style={S.root}>
      <style>{globalCSS}</style>
      <div style={{...S.card,maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{ display:"flex",alignItems:"center",marginBottom:16 }}>
          <button onClick={onBack} style={{ background:"none",border:"none",fontSize:20,cursor:"pointer",color:"#888",padding:"0 8px 0 0" }}>←</button>
          <h2 style={{ margin:0,fontSize:20,fontWeight:900,color:"#2d2d2d" }}>📊 がくしゅう　きろく</h2>
        </div>
        <div style={{ display:"flex",background:"#f0f0f0",borderRadius:12,padding:4,marginBottom:20,gap:4 }}>
          <button style={tabStyle("progress")} onClick={()=>setTab("progress")}>📈 しんちょく</button>
          <button style={tabStyle("sessions")} onClick={()=>setTab("sessions")}>📅 れきし</button>
          <button style={tabStyle("weak")} onClick={()=>setTab("weak")}>⚠️ にがて</button>
        </div>

        {/* 進捗 */}
        {tab==="progress" && (
          <div>
            <div style={{ background:"linear-gradient(135deg,#667eea,#764ba2)",borderRadius:16,padding:"20px",color:"#fff",marginBottom:16,textAlign:"center" }}>
              <div style={{ fontSize:13,opacity:0.85,marginBottom:4 }}>これまでの　せいかいりつ</div>
              <div style={{ fontSize:52,fontWeight:900,lineHeight:1 }}>{overallRate}<span style={{ fontSize:24 }}>%</span></div>
              <div style={{ fontSize:13,opacity:0.75,marginTop:6 }}>{totalSessions}かい　れんしゅう　／　{totalQ}もん</div>
            </div>
            <p style={{ fontSize:13,color:"#aaa",fontWeight:"bold",marginBottom:10 }}>じょしごとの　せいかいりつ</p>
            {Object.entries(PARTICLE_CONFIG).map(([p,cfg])=>{
              const ids=ALL_QUESTIONS[p].map(q=>q.id);
              let c=0,t=0;
              ids.forEach(id=>{ if(questionStats[id]){c+=questionStats[id].correct;t+=questionStats[id].total;} });
              const rate=t>0?Math.round((c/t)*100):null;
              return (
                <div key={p} style={{ marginBottom:12 }}>
                  <div style={{ display:"flex",justifyContent:"space-between",marginBottom:4 }}>
                    <span style={{ fontWeight:"bold",color:cfg.color,fontSize:16 }}>「{p}」</span>
                    <span style={{ fontSize:13,color:"#888" }}>{rate!==null?`${c}/${t}もん　${rate}%`:"まだ　れんしゅう　していないよ"}</span>
                  </div>
                  <div style={{ background:"#eee",borderRadius:8,height:12,overflow:"hidden" }}>
                    <div style={{ width:`${rate??0}%`,height:"100%",background:cfg.color,borderRadius:8,transition:"width 0.6s ease" }}/>
                  </div>
                </div>
              );
            })}
            {totalSessions===0 && <div style={{ textAlign:"center",color:"#bbb",fontSize:14,marginTop:24 }}>まだ　きろくが　ないよ！<br/>れんしゅうしてみよう🌟</div>}
          </div>
        )}

        {/* 履歴 */}
        {tab==="sessions" && (
          <div>
            {sessions.length===0
              ? <div style={{ textAlign:"center",color:"#bbb",fontSize:14,marginTop:24 }}>まだ　きろくが　ないよ！</div>
              : [...sessions].reverse().map((s,i)=>{
                  const cfg=s.mode==="mixed"?null:s.mode==="weak"?null:PARTICLE_CONFIG[s.mode];
                  const color=s.mode==="weak"?"#9B59B6":s.mode==="mixed"?"#667eea":(cfg?.color||"#667eea");
                  const label=s.mode==="weak"?"にがてもんだい":s.mode==="mixed"?"まじり":`「${s.mode}」`;
                  const rate=Math.round((s.score/s.total)*100);
                  const stars=Math.round((s.score/s.total)*3)||1;
                  return (
                    <div key={i} style={{ background:"#f8f8f8",borderRadius:14,padding:"14px 16px",marginBottom:10,borderLeft:`4px solid ${color}` }}>
                      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                        <span style={{ fontWeight:"bold",color,fontSize:15 }}>{label}　れんしゅう</span>
                        <span style={{ fontSize:12,color:"#bbb" }}>{s.date}</span>
                      </div>
                      <div style={{ display:"flex",alignItems:"center",gap:12,marginTop:8 }}>
                        <span style={{ fontSize:22,fontWeight:900,color }}>{s.score}<span style={{ fontSize:14,color:"#aaa" }}>/{s.total}</span></span>
                        <div style={{ flex:1,background:"#e0e0e0",borderRadius:6,height:8 }}>
                          <div style={{ width:`${rate}%`,height:"100%",background:color,borderRadius:6 }}/>
                        </div>
                        <span style={{ fontSize:13 }}>{"⭐".repeat(stars)}</span>
                      </div>
                    </div>
                  );
                })}
          </div>
        )}

        {/* 苦手 */}
        {tab==="weak" && (
          <div>
            {!hasWeak
              ? <div style={{ textAlign:"center",color:"#bbb",fontSize:14,marginTop:24 }}>まだ　データが　すくないよ！<br/>れんしゅうを　つづけると　にがてが　わかるよ🔍</div>
              : <>
                  <button onClick={onStartWeak} style={{
                    display:"flex",alignItems:"center",justifyContent:"center",gap:8,
                    width:"100%",padding:"14px",borderRadius:14,border:"none",
                    background:"linear-gradient(135deg,#9B59B6,#6C3483)",
                    color:"#fff",fontSize:16,fontWeight:"bold",cursor:"pointer",
                    boxShadow:"0 4px 14px rgba(155,89,182,0.35)",marginBottom:16
                  }}>
                    <span>🎯</span> にがてもんだいを　れんしゅうする！
                  </button>
                  <p style={{ fontSize:13,color:"#aaa",marginBottom:12 }}>まちがえることが　おおい　もんだいだよ</p>
                  {weakQuestions.map(({id,correct,total,q})=>{
                    const rate=Math.round((correct/total)*100);
                    const cfg=PARTICLE_CONFIG[q.answer];
                    return (
                      <div key={id} style={{ background:"#fff8f0",border:"2px solid #FFD93D",borderRadius:14,padding:"12px 14px",marginBottom:10 }}>
                        <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:6 }}>
                          <span style={{ fontSize:26 }}>{q.image}</span>
                          <span style={{ fontSize:17,fontWeight:"bold",color:"#333" }}>
                            {q.sentence.map((p,i)=>i===q.blank?"（　）":p).join("")}
                          </span>
                        </div>
                        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                          <span style={{ fontSize:13,color:"#888" }}>こたえ：<span style={{ color:cfg?.color,fontWeight:"bold",fontSize:16 }}>「{q.answer}」</span></span>
                          <span style={{ fontSize:12,color:rate<50?"#FF6B6B":"#E6A800",fontWeight:"bold" }}>{correct}/{total}もん　{rate}% {rate<50?"⚠️":"📌"}</span>
                        </div>
                      </div>
                    );
                  })}
                </>
            }
          </div>
        )}
      </div>
    </div>
  );
}

// ─── クイズ画面（共通） ───────────────────────────────────────
function QuizScreen({ questions, mode, onFinish, onBack }) {
  const [current, setCurrent]         = useState(0);
  const [selected, setSelected]       = useState(null);
  const [answered, setAnswered]       = useState(false);
  const [score, setScore]             = useState(0);
  const [shake, setShake]             = useState(false);
  const [showHanamaru, setShowHanamaru] = useState(false);
  const [sessionLog, setSessionLog]   = useState([]);
  const [voiceOn, setVoiceOn]         = useState(true);
  const speakingAnswerRef             = useRef(false); // 正解文読み上げ中フラグ

  const q = questions[current];
  const isCorrect = selected === q?.answer;
  const modeColor = mode==="weak"?"#9B59B6":mode==="mixed"?"#667eea":(PARTICLE_CONFIG[mode]?.color||"#667eea");
  const modeLabel = mode==="weak"?"にがてもんだい":mode==="mixed"?"まじり":`「${mode}」れんしゅう`;

  // 問題が変わったら自動読み上げ
  useEffect(() => {
    speakingAnswerRef.current = false;
    if (voiceOn && q) {
      const doSpeak = () => speakWithPause(q);
      if (window.speechSynthesis.getVoices().length > 0) {
        doSpeak();
      } else {
        window.speechSynthesis.onvoiceschanged = doSpeak;
      }
    }
    return () => {
      // 正解文読み上げ中はキャンセルしない
      if (!speakingAnswerRef.current) window.speechSynthesis.cancel();
    };
  }, [current, voiceOn]);

  function handleChoice(choice) {
    if (answered) return;
    setSelected(choice); setAnswered(true);
    const correct = choice === q.answer;
    setSessionLog(prev=>[...prev,{id:q.id,correct}]);
    if (correct) {
      setScore(s=>s+1); setShowHanamaru(true);
      setTimeout(()=>setShowHanamaru(false),1200);
      if (voiceOn) {
        const fullText = q.sentence.map((p,i) => i === q.blank ? choice : p).join("");
        setTimeout(() => {
          const voices = window.speechSynthesis.getVoices();
          const jaVoice = voices.find(v => v.lang.startsWith("ja"));
          const makeUtter = (text, rate=0.85) => {
            const u = new SpeechSynthesisUtterance(text);
            u.lang = "ja-JP"; u.rate = rate; u.pitch = 1.1;
            if (jaVoice) u.voice = jaVoice;
            return u;
          };
          speakingAnswerRef.current = true;
          window.speechSynthesis.cancel();
          const u1 = makeUtter(fullText);
          u1.onend = () => {
            setTimeout(() => {
              const u2 = makeUtter("せいかい！すごい！", 0.9);
              u2.onend = () => { speakingAnswerRef.current = false; };
              window.speechSynthesis.speak(u2);
            }, 300);
          };
          window.speechSynthesis.speak(u1);
        }, 200);
      }
    } else {
      setShake(true); setTimeout(()=>setShake(false),500);
      if (voiceOn) setTimeout(()=>speak(`こたえは「${q.answer}」だよ`, 0.8), 300);
    }
  }

  function handleNext() {
    if (current+1 >= questions.length) {
      // 保存
      const newLog = [...sessionLog, {id:q.id, correct: selected===q.answer}];
      const h = loadHistory();
      const now = new Date();
      const dateStr = `${now.getMonth()+1}/${now.getDate()} ${now.getHours()}:${String(now.getMinutes()).padStart(2,"0")}`;
      h.sessions.push({mode, score: score+(selected===q.answer?1:0), total:questions.length, date:dateStr});
      if(h.sessions.length>30) h.sessions=h.sessions.slice(-30);
      newLog.forEach(({id,correct})=>{
        if(!h.questionStats[id]) h.questionStats[id]={correct:0,total:0};
        h.questionStats[id].total++;
        if(correct) h.questionStats[id].correct++;
      });
      saveHistory(h);
      onFinish(score+(selected===q.answer?1:0), questions.length);
    } else {
      setCurrent(c=>c+1); setSelected(null); setAnswered(false);
    }
  }

  if (!q) return null;
  const sentenceWithBlank = q.sentence.map((part,i)=>{
    if(i===q.blank){
      const col=answered?(isCorrect?"#00B5A3":"#FF6B6B"):"#ccc";
      return <span key={i} style={{ display:"inline-block",minWidth:44,borderBottom:`4px solid ${col}`,
        textAlign:"center",fontSize:30,fontWeight:"bold",color:answered?(isCorrect?"#00B5A3":"#FF6B6B"):"#999",marginLeft:2,marginRight:2 }}>
        {answered?selected:"　"}
      </span>;
    }
    return <span key={i} style={{ fontSize:30,fontWeight:"bold",color:"#2d2d2d" }}>{part}</span>;
  });

  return (
    <div style={S.root}>
      <style>{globalCSS}</style>
      <Hanamaru visible={showHanamaru}/>
      <div style={S.progressWrap}>
        <div style={{...S.progressBar,width:`${((current+(answered?1:0))/questions.length)*100}%`,background:modeColor}}/>
      </div>
      <div style={{...S.card,animation:shake?"shake 0.4s ease":"none"}}>
        <div style={S.questionHeader}>
          <span style={{ background:"#f5f0ff",color:modeColor,fontWeight:"bold",fontSize:13,padding:"3px 10px",borderRadius:20,border:`1.5px solid ${modeColor}` }}>
            {modeLabel}
          </span>
          <div style={{ display:"flex",gap:8,alignItems:"center" }}>
            <span style={S.qNum}>{current+1} / {questions.length}</span>
            <span style={S.scoreSmall}>⭐ {score}</span>
            <button onClick={()=>setVoiceOn(v=>!v)} title={voiceOn?"音声OFF":"音声ON"} style={{
              background: voiceOn?"#e8f4ff":"#f0f0f0", border:"none", borderRadius:20,
              padding:"4px 10px", fontSize:18, cursor:"pointer",
              color: voiceOn?"#4A9EDB":"#bbb", transition:"all 0.2s",
            }}>{voiceOn?"🔊":"🔇"}</button>
          </div>
        </div>
        <div style={{ fontSize:64,textAlign:"center",marginBottom:12 }}>{q.image}</div>
        <div style={S.sentenceBox}>
          {sentenceWithBlank}
        </div>
        {/* 再読み上げボタン */}
        <div style={{ textAlign:"center", marginBottom:8 }}>
          <button onClick={()=>speakWithPause(q)} style={{
            background:"none", border:"2px solid #e0e0e0", borderRadius:20,
            padding:"5px 16px", fontSize:13, color:"#888", cursor:"pointer",
            display:"inline-flex", alignItems:"center", gap:4,
          }}>🔁 もういちど　きく</button>
        </div>
        <div style={S.hintBox}>💡 {q.hint}</div>
        <div style={S.choicesGrid}>
          {q.choices.map(choice=>{
            let bg="#fff",border="3px solid #e0e0e0",col="#333";
            if(answered){
              if(choice===q.answer){bg="#00B5A3";border="3px solid #00B5A3";col="#fff";}
              else if(choice===selected){bg="#FF6B6B";border="3px solid #FF6B6B";col="#fff";}
              else{bg="#f5f5f5";col="#bbb";}
            }
            return <button key={choice} onClick={()=>handleChoice(choice)} style={{
              ...S.choiceBtn,background:bg,border,color:col,
              opacity:answered&&choice!==q.answer&&choice!==selected?0.5:1,
              cursor:answered?"default":"pointer",
              transform:answered&&choice===q.answer?"scale(1.05)":"scale(1)",
            }}>{choice}</button>;
          })}
        </div>
        {answered && (
          <div style={{ textAlign:"center",marginTop:16 }}>
            <p style={{ fontSize:22,fontWeight:"bold",color:isCorrect?"#00B5A3":"#FF6B6B",marginBottom:12 }}>
              {isCorrect?"🎉 せいかい！":`❌ こたえは「${q.answer}」だよ`}
            </p>
            <button style={{...S.nextBtn,background:modeColor}} onClick={handleNext}>
              {current+1>=questions.length?"けっかをみる！":"つぎへ →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── 結果画面 ─────────────────────────────────────────────────
function ResultScreen({ score, total, mode, onRetry, onHome, onHistory }) {
  const ratio = score/total;
  const starCount = Math.round(ratio*3)||1;
  const msgs = ["もう　いちど　がんばろう！","よく　できたね！","すごい！　よくできました！","かんぺき！　すばらしい！"];
  const modeColor = mode==="weak"?"#9B59B6":mode==="mixed"?"#667eea":(PARTICLE_CONFIG[mode]?.color||"#667eea");
  const modeLabel = mode==="weak"?"にがてもんだい":mode==="mixed"?"まじり":`「${mode}」`;
  return (
    <div style={S.root}>
      <style>{globalCSS}</style>
      <div style={S.card}>
        <div style={{ fontSize:80,textAlign:"center" }}>🎉</div>
        <h2 style={{...S.title,fontSize:22,marginBottom:0}}>{modeLabel}　れんしゅう　おわったよ！</h2>
        <div style={S.scoreBox}>
          <span style={{...S.scoreNum,color:modeColor}}>{score}</span>
          <span style={S.scoreDen}>/ {total}</span>
        </div>
        <StarBurst count={starCount}/>
        <p style={S.message}>{msgs[Math.min(Math.round(ratio*3),3)]}</p>
        <button style={{...S.startBtn,background:modeColor}} onClick={onRetry}>もう　いちど！</button>
        <button style={S.backBtn} onClick={onHome}>← もどる</button>
        <button style={{...S.backBtn,marginTop:6,color:"#667eea"}} onClick={onHistory}>📊 きろくをみる</button>
      </div>
    </div>
  );
}

// ─── タイトル画面 ─────────────────────────────────────────────
function TitleScreen({ onStart, onHistory }) {
  return (
    <div style={S.root}>
      <style>{globalCSS}</style>
      <div style={S.card}>
        <div style={{ display:"flex",justifyContent:"flex-end" }}>
          <button onClick={onHistory} style={{ background:"#f0f4ff",border:"none",borderRadius:10,padding:"6px 14px",fontSize:13,color:"#667eea",fontWeight:"bold",cursor:"pointer" }}>
            📊 きろく
          </button>
        </div>
        <div style={{ fontSize:64,textAlign:"center",marginBottom:4 }}>📖</div>
        <h1 style={S.title}>じょし　れんしゅう</h1>
        <p style={S.subtitle}>れんしゅうする　じょしを　えらぼう！</p>

        <p style={{ fontSize:13,color:"#aaa",fontWeight:"bold",marginBottom:10 }}>ひとつずつ　れんしゅう</p>
        <div style={S.particleGrid}>
          {Object.entries(PARTICLE_CONFIG).map(([p,cfg])=>(
            <button key={p} onClick={()=>onStart(p)} style={{...S.particleBtn,background:cfg.bg,borderColor:cfg.color}}>
              <span style={{...S.particleBig,color:cfg.color}}>{p}</span>
              <span style={{ fontSize:10,color:"#888",marginTop:2 }}>{cfg.desc}</span>
            </button>
          ))}
        </div>

        <p style={{ fontSize:13,color:"#aaa",fontWeight:"bold",margin:"16px 0 10px" }}>まとめて　れんしゅう</p>
        <button style={S.mixedBtn} onClick={()=>onStart("mixed")}>
          <span style={{ fontSize:22 }}>🔀</span>
          <span style={{ fontSize:16,fontWeight:"bold",marginLeft:8 }}>は・が・を・に・で　まじり（250もんからランダム）</span>
        </button>

        <p style={{ fontSize:13,color:"#aaa",fontWeight:"bold",margin:"14px 0 10px" }}>にがてを　つぶす</p>
        <button style={{...S.mixedBtn,background:"linear-gradient(135deg,#9B59B6,#6C3483)"}} onClick={()=>onStart("weak")}>
          <span style={{ fontSize:22 }}>🎯</span>
          <span style={{ fontSize:16,fontWeight:"bold",marginLeft:8 }}>にがてもんだい　しゅうちゅう！</span>
        </button>

        <p style={S.meta}>それぞれ　10もん　ちょうせん</p>
      </div>
    </div>
  );
}

// ─── メインアプリ ─────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("title"); // title|quiz|result|history
  const [mode, setMode]     = useState(null);
  const [questions, setQuestions] = useState([]);
  const [lastScore, setLastScore] = useState(0);
  const [lastTotal, setLastTotal] = useState(10);

  function buildQuestions(selectedMode) {
    const applyFix = (qs) => qs.map(q => ({ ...q, choices: fixChoices(q.answer, q.choices) }));
    if (selectedMode === "mixed") {
      const all = Object.values(ALL_QUESTIONS).flat();
      return applyFix(shuffle(all).slice(0, 10));
    }
    if (selectedMode === "weak") {
      const h = loadHistory();
      const weakIds = Object.entries(h.questionStats)
        .filter(([,s])=>s.total>=1)
        .sort(([,a],[,b])=>(a.correct/a.total)-(b.correct/b.total))
        .map(([id])=>id);
      const allQ = Object.values(ALL_QUESTIONS).flat();
      const weakQ = weakIds.map(id=>allQ.find(q=>q.id===id)).filter(Boolean);
      const pool = weakQ.length >= 10 ? weakQ : [...weakQ, ...shuffle(allQ.filter(q=>!weakIds.includes(q.id)))];
      return applyFix(pool.slice(0, 10));
    }
    return applyFix(shuffle(ALL_QUESTIONS[selectedMode]).slice(0, 10));
  }

  function handleStart(selectedMode) {
    if (selectedMode === "weak") {
      const h = loadHistory();
      const stats = h.questionStats;
      const hasData = Object.keys(stats).length > 0;
      if (!hasData) {
        alert("まだ　データが　ありません！\nれんしゅうを　いくつか　やってから\nつかってみてね🌟");
        return;
      }
    }
    const qs = buildQuestions(selectedMode);
    setMode(selectedMode); setQuestions(qs); setScreen("quiz");
  }

  function handleFinish(score, total) {
    setLastScore(score); setLastTotal(total); setScreen("result");
  }

  function handleStartWeak() {
    handleStart("weak");
  }

  return (
    <>
      {screen==="title"   && <TitleScreen onStart={handleStart} onHistory={()=>setScreen("history")}/>}
      {screen==="quiz"    && <QuizScreen questions={questions} mode={mode} onFinish={handleFinish} onBack={()=>setScreen("title")}/>}
      {screen==="result"  && <ResultScreen score={lastScore} total={lastTotal} mode={mode}
          onRetry={()=>{ const qs=buildQuestions(mode); setQuestions(qs); setScreen("quiz"); }}
          onHome={()=>setScreen("title")} onHistory={()=>setScreen("history")}/>}
      {screen==="history" && <HistoryScreen onBack={()=>setScreen("title")} onStartWeak={()=>{ setScreen("title"); handleStart("weak"); }}/>}
    </>
  );
}

// ─── スタイル ─────────────────────────────────────────────────
const S = {
  root:{ minHeight:"100vh",backgroundColor:"#f0f4ff",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"16px",fontFamily:"'Hiragino Kaku Gothic ProN','Hiragino Sans','Meiryo',sans-serif" },
  card:{ background:"#fff",borderRadius:24,padding:"24px 22px",width:"100%",maxWidth:480,boxShadow:"0 8px 40px rgba(0,0,0,0.10)" },
  title:{ fontSize:28,fontWeight:900,textAlign:"center",color:"#2d2d2d",margin:"8px 0 8px",letterSpacing:"0.08em" },
  subtitle:{ fontSize:15,textAlign:"center",color:"#666",marginBottom:16 },
  particleGrid:{ display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8,marginBottom:8 },
  particleBtn:{ display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"12px 4px",borderRadius:14,border:"2.5px solid",cursor:"pointer",transition:"transform 0.12s" },
  particleBig:{ fontSize:28,fontWeight:900,lineHeight:1.1 },
  mixedBtn:{ display:"flex",alignItems:"center",justifyContent:"center",width:"100%",padding:"14px",borderRadius:16,border:"none",background:"linear-gradient(135deg,#667eea,#764ba2)",color:"#fff",cursor:"pointer",boxShadow:"0 4px 16px rgba(102,126,234,0.35)",marginBottom:8 },
  meta:{ textAlign:"center",color:"#bbb",fontSize:13,marginTop:12 },
  progressWrap:{ width:"100%",maxWidth:480,height:8,background:"#e0e0e0",borderRadius:8,marginBottom:12,overflow:"hidden" },
  progressBar:{ height:"100%",borderRadius:8,transition:"width 0.4s ease" },
  questionHeader:{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16 },
  qNum:{ fontSize:13,color:"#888",fontWeight:"bold" },
  scoreSmall:{ fontSize:16,color:"#FFD93D",fontWeight:"bold" },
  sentenceBox:{ background:"#f7f8fc",borderRadius:16,padding:"20px 16px",display:"flex",flexWrap:"wrap",justifyContent:"center",alignItems:"baseline",gap:2,marginBottom:16 },
  hintBox:{ background:"#fffbea",border:"2px solid #FFD93D",borderRadius:12,padding:"10px 14px",fontSize:13,color:"#555",marginBottom:20,lineHeight:1.5 },
  choicesGrid:{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 },
  choiceBtn:{ padding:"20px 0",fontSize:30,fontWeight:"bold",borderRadius:16,transition:"all 0.15s ease",boxShadow:"0 2px 8px rgba(0,0,0,0.08)" },
  nextBtn:{ padding:"14px 32px",fontSize:18,fontWeight:"bold",color:"#fff",border:"none",borderRadius:14,cursor:"pointer",boxShadow:"0 4px 14px rgba(0,0,0,0.15)" },
  startBtn:{ display:"block",width:"100%",padding:"16px",fontSize:20,fontWeight:"bold",color:"#fff",border:"none",borderRadius:16,cursor:"pointer",letterSpacing:"0.06em",boxShadow:"0 4px 16px rgba(0,0,0,0.15)",marginBottom:10 },
  backBtn:{ display:"block",width:"100%",padding:"12px",fontSize:16,fontWeight:"bold",color:"#888",background:"#f0f0f0",border:"none",borderRadius:14,cursor:"pointer",marginTop:4 },
  scoreBox:{ textAlign:"center",margin:"16px 0 8px" },
  scoreNum:{ fontSize:72,fontWeight:900 },
  scoreDen:{ fontSize:32,color:"#aaa",marginLeft:4 },
  message:{ fontSize:20,textAlign:"center",fontWeight:"bold",color:"#444",margin:"16px 0 24px" },
};

const globalCSS=`
  @keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-6px)}80%{transform:translateX(6px)}}
  @keyframes hanamaruPop{0%{transform:scale(0) rotate(-20deg);opacity:0}60%{transform:scale(1.15) rotate(5deg);opacity:1}80%{transform:scale(0.95) rotate(-2deg)}100%{transform:scale(1) rotate(0deg);opacity:1}}
  @keyframes pop{0%{transform:scale(0);opacity:0}80%{transform:scale(1.2)}100%{transform:scale(1);opacity:1}}
  *{box-sizing:border-box}body{margin:0}
`;
