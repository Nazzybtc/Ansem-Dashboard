// =======================================
// ANSEM DASHBOARD V5 APP.JS
// =======================================


let previousWhales = new Set();



// =======================================
// FORMATTERS
// =======================================


function money(value){

    if(
        value === undefined ||
        value === null
    ){

        return "$0";

    }


    return "$" +
    Number(value).toLocaleString(
        undefined,
        {
            maximumFractionDigits:2
        }
    );

}



function number(value){

    if(
        value === undefined ||
        value === null
    ){

        return "0";

    }


    return Number(value)
    .toLocaleString();

}



function percent(value){

    if(
        value === undefined ||
        value === null
    ){
        return "0.00%";
    }

    const num = Number(value);

    if(num > 0){
        return "+" + num.toFixed(2) + "%";
    }

    if(num < 0){
        return num.toFixed(2) + "%";
    }

    return "0.00%";
}





// =======================================
// SAFE FETCH
// =======================================


async function safeFetch(url){


try{


const response =
await fetch(url);



if(!response.ok){

throw new Error(
response.status
);

}



return await response.json();



}
catch(error){


console.log(
"API ERROR:",
url,
error
);



return null;


}


}






// =======================================
// LOAD ANSEM TOKEN DATA
// =======================================


async function loadTokenData(){


const data =
await safeFetch(
"/api/token"
);



if(!data)
return;



const price =
document.getElementById(
"tokenPrice"
);



const change =
document.getElementById(
"tokenChange"
);



const market =
document.getElementById(
"marketCap"
);



const liquidity =
document.getElementById(
"liquidity"
);



const volume =
document.getElementById(
"volume"
);





if(price)

price.textContent =
money(data.price);



if(change)

change.textContent =
percent(data.change);



if(market)

market.textContent =
money(data.marketCap);



if(liquidity)

liquidity.textContent =
money(data.liquidity);



if(volume)

volume.textContent =
money(data.volume);



}








// =======================================
// BTC ETH SOL
// =======================================


async function loadMarketData(){


const data =
await safeFetch(
"/api/market"
);



if(!data)

return;



const btc =
document.getElementById(
"quickBTC"
);



const eth =
document.getElementById(
"quickETH"
);



const sol =
document.getElementById(
"quickSOL"
);





if(btc)

btc.textContent =
money(
data.bitcoin?.usd
);



if(eth)

eth.textContent =
money(
data.ethereum?.usd
);



if(sol)

sol.textContent =
money(
data.solana?.usd
);



}








// =======================================
// FEAR GREED
// =======================================


async function loadFearGreed(){


const data =
await safeFetch(
"/api/fear-greed"
);



if(!data)

return;



const box =
document.getElementById(
"fearGreed"
);



if(box){


box.textContent =

`${data.label} (${data.value}/100)`;

}


}








// =======================================
// HOLDERS
// =======================================


async function loadHolders(){

    const holderBox =
    document.getElementById("holders");

    if(!holderBox)
        return;

    holderBox.textContent = "Loading...";

    const data =
    await safeFetch("/api/holders");

    if(
        !data ||
        !data.success
    ){

        holderBox.textContent = "Unavailable";

        return;

    }

    holderBox.textContent =
    Number(data.holders).toLocaleString();

}


// =======================================
// LIVE ANSEM TRADES
// =======================================


async function loadTransactions(){


const txs =
await safeFetch(
"/api/ansem-transactions"
);



if(!txs)

return;



const feed =
document.getElementById(
"tradeFeed"
);



if(!feed)

return;



feed.innerHTML="";




txs
.slice(0,20)
.forEach(tx=>{


const color =

tx.side==="BUY"

?

"buy"

:

tx.side==="SELL"

?

"sell"

:

"transfer";




feed.innerHTML += `

<div class="trade-item">


<span class="${color}">


${
tx.side==="BUY"

?

"🟢 BUY"

:

tx.side==="SELL"

?

"🔴 SELL"

:

"⚪ TRANSFER"

}


</span>


<br>


💰 ${tx.amount} ANSEM

<br>

💲 Price: ${Number(tx.price).toFixed(8)}

<br>

💵 Value: ${money(tx.value)}

<br>

👛 ${tx.wallet}

<br>

🕒 ${tx.time}


</div>


`;



});


}









// =======================================
// SMART MONEY
// =======================================

function speakNotification(message){

    if(!("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(message);

    speech.rate = 1;
    speech.pitch = 1;
    speech.volume = 1;

    window.speechSynthesis.speak(speech);

}

async function loadSmartMoney(){


const whales =
await safeFetch(
"/api/smart-money"
);



if(!whales)

return;



const feed =
document.getElementById(
"whaleFeed"
);



if(!feed)

return;



feed.innerHTML="";




whales
.slice(0,15)
.forEach(tx=>{



const id =
`${tx.wallet}-${tx.amount}`;



if(
!previousWhales.has(id)
){

    previousWhales.add(id);

    if(tx.side === "BUY"){

        speakNotification("Smart money buy detected");

    }else{

        speakNotification("Smart money sell detected");

    }

}




feed.innerHTML += `

<div class="whale-item">

<h3>
🐋 Smart Money ${tx.side}
</h3>

${tx.side === "BUY" ? "🟢 BUY" : "🔴 SELL"}

<br>

💰 ${tx.amount} ANSEM

<br>

💲 Price: ${Number(tx.price || 0).toFixed(8)}

<br>

💵 Value: ${money(tx.value)}

<br>

👛 ${tx.wallet}

<br>

🕒 ${tx.time}

</div>

`;



});



}










// =======================================
// TRENDING TOKENS
// =======================================


async function loadTrending(){


const tokens =
await safeFetch(
"/api/trending"
);



if(!tokens)

return;



const grid =
document.getElementById(
"tokenGrid"
);


const gainers =
document.getElementById(
"topGainers"
);


const losers =
document.getElementById(
"topLosers"
);



if(!grid)

return;



grid.innerHTML="";

gainers.innerHTML="";

losers.innerHTML="";





tokens.forEach(token=>{


grid.innerHTML += `

<div class="token-card">


<strong>

${token.symbol}

</strong>


<br>


${token.name}


<br>


💲 ${Number(token.price)
.toFixed(8)}


<br>


📈 ${percent(token.change)}


<br>


💰 MC:
${money(token.marketCap)}


<br>


🌊 Volume:
${money(token.volume)}


</div>


`;



});






const sorted =
[...tokens]
.sort(

(a,b)=>

Number(b.change)

-

Number(a.change)

);







sorted
.slice(0,5)
.forEach(token=>{


gainers.innerHTML += `

<div>

🚀

<strong>
${token.symbol}
</strong>


<br>

${percent(token.change)}

</div>

`;



});








sorted
.filter(token => Number(token.change) < 0)
.sort((a, b) => Number(a.change) - Number(b.change))
.slice(0, 5)
.forEach(token => {

losers.innerHTML += `

<div>

📉

<strong>${token.symbol}</strong>

<br>

${percent(token.change)}

</div>

`;

});



}

// =======================================
// CLOCK
// =======================================


function updateClock(){


const clock =
document.getElementById(
"clock"
);



if(clock){


clock.textContent =
new Date()
.toLocaleTimeString();


}


}








// =======================================
// LOADING OVERLAY
// =======================================


function hideLoader(){


const loader =
document.getElementById(
"loadingOverlay"
);



if(loader){


setTimeout(()=>{


loader.style.display =
"none";


},1000);


}


}









// =======================================
// DASHBOARD START
// =======================================


function initializeDashboard(){



loadTokenData();


loadMarketData();


loadFearGreed();


loadHolders();


loadTrending();


loadSmartMoney();


loadTransactions();




updateClock();



setInterval(

updateClock,

1000

);




setInterval(

loadTokenData,

30000

);



setInterval(

loadMarketData,

60000

);



setInterval(

loadFearGreed,

600000

);



setInterval(

loadHolders,

60000

);



setInterval(

loadTrending,

120000

);



setInterval(

loadSmartMoney,

15000

);



setInterval(

loadTransactions,

10000

);



hideLoader();



}








// =======================================
// START APPLICATION
// =======================================


document.addEventListener(

"DOMContentLoaded",

()=>{


initializeDashboard()


}

);
