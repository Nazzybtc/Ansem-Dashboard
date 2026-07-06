// =======================================
// ANSEM DASHBOARD V3
// =======================================

function money(value){

    if(value===undefined || value===null)
        return "$0";

    return "$"+Number(value).toLocaleString(
        undefined,
        {
            maximumFractionDigits:2
        }
    );

}

function percent(value){

    if(value===undefined || value===null)
        return "0.00%";

    return Number(value).toFixed(2)+"%";

}

// =======================================
// ANSEM TOKEN
// =======================================

async function loadTokenData(){

    try{

        const response =
        await fetch("/api/token");

        const pair =
        await response.json();

        document.getElementById("tokenPrice").textContent =
        money(pair.priceUsd);

        document.getElementById("tokenChange").textContent =
        percent(pair.priceChange.h24);

        document.getElementById("marketCap").textContent =
        money(pair.marketCap);

        document.getElementById("liquidity").textContent =
        money(pair.liquidity.usd);

        document.getElementById("volume").textContent =
        money(pair.volume.h24);

        document.getElementById("loadingOverlay").style.display="none";

    }catch(error){

        console.log(error);

    }

}
// =======================================
// MARKET DATA
// =======================================

async function loadMarketData(){

    try{

        const response =
        await fetch("/api/market");

        const data =
        await response.json();

        document.getElementById("quickBTC").textContent =
        money(data.bitcoin.usd);

        document.getElementById("quickETH").textContent =
        money(data.ethereum.usd);

        document.getElementById("quickSOL").textContent =
        money(data.solana.usd);

    }catch(error){

        console.log(error);

    }

}

// =======================================
// GLOBAL MARKET
// =======================================

async function loadGlobalData(){

    try{

        const response =
        await fetch("/api/global");

        const global =
        await response.json();

        if(global.data){

            document.getElementById("fearGreed").textContent =
            "Market Live";

        }

    }catch(error){

        console.log(error);

    }

}

// =======================================
// CLOCK
// =======================================

function updateClock(){

    const now=new Date();

    document.getElementById("clock").textContent=
    now.toLocaleTimeString();

}
// =======================================
// TOP GAINERS / LOSERS
// =======================================

async function loadTrending(){

    try{

        const response =
        await fetch("/api/trending");

        const tokens =
        await response.json();

        const gainers =
        document.getElementById("topGainers");

        const losers =
        document.getElementById("topLosers");

        const grid =
        document.getElementById("tokenGrid");

        gainers.innerHTML="";
        losers.innerHTML="";
        grid.innerHTML="";

        const solana =
        tokens.filter(
            t=>t.chainId==="solana"
        ).slice(0,8);

        solana.forEach(token=>{

            const symbol =
            token.tokenAddress
            ? token.tokenAddress.substring(0,6)+"..."
            : "TOKEN";

            grid.innerHTML+=`
            <div>
                <strong>${symbol}</strong><br>
                Solana Token
            </div>
            `;

        });

        solana.slice(0,5).forEach(token=>{

            gainers.innerHTML+=`
            <div>
                🚀 ${token.tokenAddress.substring(0,6)}...
            </div>
            `;

        });

        solana.slice(3,8).forEach(token=>{

            losers.innerHTML+=`
            <div>
                📉 ${token.tokenAddress.substring(0,6)}...
            </div>
            `;

        });

    }catch(error){

        console.log(error);

    }

}

// =======================================
// SEARCH
// =======================================

document
.getElementById("searchButton")
.addEventListener("click",()=>{

    const address =
    document.getElementById("searchInput").value;

    if(address){

        window.open(
            "https://dexscreener.com/solana/"+address,
            "_blank"
        );

    }

});

// =======================================
// START DASHBOARD
// =======================================

function initializeDashboard(){

    loadTokenData();

    loadMarketData();

    loadGlobalData();

    loadTrending();

    updateClock();

    setInterval(updateClock,1000);

    setInterval(loadTokenData,30000);

    setInterval(loadMarketData,60000);

    setInterval(loadTrending,120000);

}

document.addEventListener(
    "DOMContentLoaded",
    initializeDashboard
);
