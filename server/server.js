require("dotenv").config();

const express = require("express");
const cors = require("cors");
const axios = require("axios");
const path = require("path");

const app = express();


// ===============================
// MIDDLEWARE
// ===============================

app.use(cors());

app.use(express.json());

app.use(
    express.static(
        path.join(__dirname, "../")
    )
);


const PORT =
process.env.PORT || 3000;



// ===============================
// CONSTANTS
// ===============================

const ANSEM_MINT =
"9cRCn9rGT8V2imeM2BaKs13yhMEais3ruM3rPvTGpump";


const HELIUS_KEY =
process.env.HELIUS_API_KEY;


// ===============================
// HOME
// ===============================

app.get("/", (req,res)=>{

    res.sendFile(
        path.join(
            __dirname,
            "../index.html"
        )
    );

});




// ===============================
// HEALTH CHECK
// ===============================

app.get("/api/ping",(req,res)=>{

    res.json({

        success:true,

        message:
        "ANSEM Dashboard V5 Backend Running"

    });

});





// ===============================
// ANSEM TOKEN DATA
// ===============================


app.get(
"/api/token",
async(req,res)=>{


try{


const response =
await axios.get(

`https://api.dexscreener.com/latest/dex/tokens/${ANSEM_MINT}`

);



const pair =
response.data.pairs?.find(

p=>p.chainId==="solana"

);



if(!pair){

return res.json({

success:false,

message:
"ANSEM pair not found"

});

}




res.json({

success:true,


name:
pair.baseToken.name,


symbol:
pair.baseToken.symbol,


price:
Number(pair.priceUsd || 0),


change:
Number(
pair.priceChange?.h24 || 0
),



marketCap:
pair.marketCap || 0,



liquidity:
pair.liquidity?.usd || 0,



volume:
pair.volume?.h24 || 0,



pairAddress:
pair.pairAddress


});



}
catch(error){


res.status(500).json({

success:false,

message:
error.message

});


}



});


// ===============================
// BTC ETH SOL MARKET
// ===============================


app.get(
"/api/market",
async(req,res)=>{


try{


const response =
await axios.get(

"https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd"

);



res.json(

response.data

);



}
catch(error){


res.status(500).json({

success:false,

message:
error.message

});


}


});







// ===============================
// GLOBAL MARKET
// ===============================


app.get(
"/api/global",
async(req,res)=>{


try{


const response =
await axios.get(

"https://api.coingecko.com/api/v3/global"

);



res.json(

response.data

);



}
catch(error){


res.status(500).json({

success:false,

message:
error.message

});


}


});








// ===============================
// FEAR AND GREED
// ===============================


app.get(
"/api/fear-greed",
async(req,res)=>{


try{


const response =
await axios.get(

"https://api.alternative.me/fng/?limit=1"

);



const data =
response.data.data[0];



res.json({

value:
Number(data.value),


label:
data.value_classification,


timestamp:
data.timestamp


});



}
catch(error){


res.status(500).json({

success:false,

message:
error.message

});


}


});








// ===============================
// TRENDING SOLANA TOKENS
// ===============================


app.get(
"/api/trending",
async(req,res)=>{


try{


const response =
await axios.get(

"https://api.dexscreener.com/token-boosts/latest/v1"

);



const boosted =
response.data

.filter(

token=>

token.chainId==="solana"

)

.slice(0,20);




const tokens=[];




for(const item of boosted){



try{


const data =
await axios.get(

`https://api.dexscreener.com/latest/dex/tokens/${item.tokenAddress}`

);



const pair =
data.data.pairs?.find(

p=>

p.chainId==="solana"

);



if(pair){


tokens.push({

name:
pair.baseToken.name,


symbol:
pair.baseToken.symbol,


address:
pair.baseToken.address,


price:
Number(pair.priceUsd || 0),


change:
Number(
pair.priceChange?.h24 || 0
),


marketCap:
pair.marketCap || 0,


volume:
pair.volume?.h24 || 0,


liquidity:
pair.liquidity?.usd || 0,


url:
pair.url


});


}


}
catch(e){



continue;



}



}




res.json(tokens);



}
catch(error){



res.status(500).json({

success:false,

message:
error.message

});


}



});

// ===============================
// HELIUS TRANSACTION ENGINE
// ===============================


async function getAnsemTransactions(){

    if(!HELIUS_KEY){

        throw new Error(
            "Missing HELIUS_API_KEY"
        );

    }


    const signatures =
    await axios.post(

        `https://mainnet.helius-rpc.com/?api-key=${HELIUS_KEY}`,

        {

            jsonrpc:"2.0",

            id:1,

            method:"getSignaturesForAddress",

            params:[

                ANSEM_MINT,

                {
                    limit:50
                }

            ]

        }

    );



    const sigs =
    signatures.data.result.map(

        tx=>tx.signature

    );



    if(!sigs.length){

        return [];

    }



    const response =
    await axios.post(

        `https://api.helius.xyz/v0/transactions?api-key=${HELIUS_KEY}`,

        {

            transactions:sigs

        }

    );



    return response.data;


}







// ===============================
// LIVE BUY / SELL FEED
// ===============================


app.get(

"/api/ansem-transactions",

async(req,res)=>{


try{


    const transactions =
await getAnsemTransactions();

const tokenResponse =
await axios.get(
`https://api.dexscreener.com/latest/dex/tokens/${ANSEM_MINT}`
);

const pair =
tokenResponse.data.pairs?.find(
p => p.chainId === "solana"
);

const tokenPrice =
Number(pair?.priceUsd || 0);

console.log("PAIR:", pair);
console.log("TOKEN PRICE:", tokenPrice);

const trades = [];

const seen = new Set();

const trades = [];

for(const tx of transactions){



const transfer =
tx.tokenTransfers?.find(

item=>

item.mint===ANSEM_MINT

);



if(!transfer)

continue;




const amount =
Number(

transfer.tokenAmount || 0

);



if(amount<=0)

continue;



let side = "BUY";

if (
    transfer.fromUserAccount &&
    transfer.toUserAccount &&
    tx.nativeTransfers?.length
) {
    side = "SELL";
}


const txId = tx.signature || tx.transactionSignature;

if (seen.has(txId)) continue;

seen.add(txId);

trades.push({

    wallet: (
        transfer.fromUserAccount ||
        transfer.toUserAccount ||
        "Unknown"
    ).slice(0, 10) + "...",

    amount: Number(amount).toLocaleString(),

    side,

    price: tokenPrice || 0,

    value: Number(amount) * (tokenPrice || 0),

    time: tx.timestamp
        ? new Date(tx.timestamp * 1000).toLocaleTimeString()
        : "--"

});



}




res.json(trades);



}
catch(error){


res.status(500).json({

success:false,

message:error.message

});


}



});








// ===============================
// SMART MONEY TRACKER
// ===============================


app.get(

"/api/smart-money",

async(req,res)=>{


try{


const transactions =
await getAnsemTransactions();

const tokenResponse = await axios.get(
    `https://api.dexscreener.com/latest/dex/tokens/${ANSEM_MINT}`
);

const pair = tokenResponse.data.pairs?.find(
    p => p.chainId === "solana"
);

const tokenPrice = Number(pair?.priceUsd || 0);

const result=[];



const seen =
new Set();



for(const tx of transactions){



const transfer =
tx.tokenTransfers?.find(

item=>

item.mint===ANSEM_MINT

);



if(!transfer)

continue;



const amount =
Number(

transfer.tokenAmount || 0

);



const key =
`${transfer.fromUserAccount}-${amount}`;



if(seen.has(key))

continue;



seen.add(key);




if(amount < 5000)

continue;



result.push({

    side:
        tx.nativeTransfers?.length
            ? "SELL"
            : "BUY",

    amount:
        amount.toLocaleString(),

    wallet:
        (
            transfer.fromUserAccount ||
            transfer.toUserAccount ||
            "Unknown"
        ).slice(0, 10) + "...",

    price:
        tokenPrice,

    value:
        amount * tokenPrice,

    time:
        tx.timestamp
            ? new Date(tx.timestamp * 1000).toLocaleTimeString()
            : "--"

});



}



res.json(result);



}
catch(error){


res.status(500).json({

success:false,

message:error.message

});


}


});


// ===============================
// HOLDERS
// ===============================

app.get("/api/holders", async (req, res) => {

    try {

        const response = await axios.get(
            `https://public-api.birdeye.so/defi/token_overview?address=${ANSEM_MINT}`,
            {
                headers: {
                    "X-API-KEY": process.env.BIRDEYE_API_KEY
                }
            }
        );

        res.json({
            success: true,
            holders: response.data.data.holder || 0
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

});



// ===============================
// TOKEN SEARCH
// ===============================


app.get(

"/api/search/:address",

async(req,res)=>{


try{


const address =
req.params.address;



const response =
await axios.get(

`https://api.dexscreener.com/latest/dex/tokens/${address}`

);



const pair =
response.data.pairs?.find(

p=>p.chainId==="solana"

);



if(!pair){


return res.json({

success:false,

message:"Token not found"

});


}




res.json({

success:true,


name:
pair.baseToken.name,


symbol:
pair.baseToken.symbol,


price:
pair.priceUsd,


change:
pair.priceChange?.h24 || 0,


marketCap:
pair.marketCap || 0,


liquidity:
pair.liquidity?.usd || 0,


volume:
pair.volume?.h24 || 0


});



}
catch(error){


res.status(500).json({

success:false,

message:error.message

});


}


});







// ===============================
// START SERVER
// ===============================


app.listen(

PORT,

()=>{


console.log(
"===================================="
);


console.log(
"🚀 ANSEM Dashboard V5 Backend Running"
);


console.log(
`🌐 http://localhost:${PORT}`
);


console.log(
"===================================="
);


}

);
