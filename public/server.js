import { serve } from "https://deno.land/std@0.138.0/http/server.ts";
import { serveDir } from "https://deno.land/std@0.138.0/http/file_server.ts";

//最初の単語がランダムに決まるようにする
let firstWord = ['あんこ', 'からす', 'さとう', 'たんぼ', 'なみだ', 'はもの', 'まくら', 'やさい', 'らくだ', 'わようせっちゅう', 'すりじゃやわるだなぷらこって'];
let random = Math.floor( Math.random() * firstWord.length );
let previousWord = firstWord[random];

//使用した単語を格納するための配列を作成
let wordList = [];

//小文字とそれに対応する大文字
let smallList = ['ぁ', 'ぃ', 'ぅ', 'ぇ', 'ぉ', 'っ', 'ゃ', 'ゅ', 'ょ', 'ゎ'];
let bigList = ['あ', 'い', 'う', 'え', 'お', 'つ', 'や', 'ゆ', 'よ', 'わ'];


console.log("Listening on http://localhost:8000");

serve(async (req) => {
    const pathname = new URL(req.url).pathname;
    console.log(pathname);

    if (req.method === "GET" && pathname === "/shiritori") {
        return new Response(previousWord);
    }
    if (req.method === "POST" && pathname === "/shiritori") {
        const requestJson = await req.json();
        const nextWord = requestJson.nextWord;
        
        //最後の文字が小文字であれば大文字に変更する
        for(let i=0; i<10; i++) {
            if(previousWord.charAt(previousWord.length - 1) == smallList[i]){
                previousWord = previousWord.slice(0, -1);
                previousWord = previousWord + bigList[i];
            }
        }

        if (
            nextWord.length > 0 &&
            previousWord.charAt(previousWord.length - 1) !== nextWord.charAt(0)
        ) {
            return new Response("前の単語に続いていません。", { status: 400 });
        }

        //同じ単語を入力できないようにする
        for(let i=0; i<100; i++) //二度目の使用か確認
        {
            if(nextWord == wordList[i]) 
            {
                return new Response("同じ単語は使用できません。", { status: 400 });
            }
        }

        //ひらがな以外を入力できないようにする
        if (
            nextWord.match(/^[ぁ-んー　]*$/)
        ){}
        else{
          return new Response("ひらがなで入力してください", { status: 400 });
        }

        //「ん」で終わる単語が入力されたらゲームを終了する
        if (nextWord.charAt(nextWord.length - 1) == 'ん')
        {
            return new Response("ん？", { status: 500 });
        }

        wordList.push(nextWord);    //使用した単語を格納する
        previousWord = nextWord;
        return new Response(previousWord);
    }

    return serveDir(req, {
        fsRoot: "public",
        urlRoot: "",
        showDirListing: true,
        enableCors: true,
    });
});