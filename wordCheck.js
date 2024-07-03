const request = require("request");
const xml2js = require("xml2js");

// 0C49A43CC8FEEB85676B378D5118FB35

// https://krdict.korean.go.kr/api/search?key=0C49A43CC8FEEB85676B378D5118FB35&type_search=search&part=word&q=나무&sort=dict&_csrf=2a814575-86d4-4846-be16-35b0a372195d

async function wordCheck(word, callback) {
    const url = `https://krdict.korean.go.kr/api/search`
    const option = {
        url: url,
        qs : {
            key : "0C49A43CC8FEEB85676B378D5118FB35",
            q : word,
            type1 : "word",
            part : "word",
            pos : 1,
            method : "exact"
        }
    }
    request(option, (err, response, body) => {
        xml2js.parseString(body,{ explicitArray: false }, (err, result) => {
            if (err) throw err;
            //console.log(result.channel.total);
            if (result.channel.total === "0" ) {
                callback(false)
            } else {
                let w;
                if(result.channel.item[0] !== undefined) {
                    w = result.channel.item[0].word;
                } else {
                    w = result.channel.item.word;
                }
                if(w === word) {
                    //console.log(true)
                    callback(true)
                } else {
                    //console.log(false)
                    callback(false)
                }
            }
        })

    })
}

module.exports = {
    wordCheck
}