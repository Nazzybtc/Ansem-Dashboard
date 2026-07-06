require("dotenv").config();

const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("./"));

const PORT = process.env.PORT || 3000;

// Test
app.get("/api/ping", (req, res) => {
    res.json({
        success: true,
        message: "ANSEM Dashboard API Running"
    });
});

// ANSEM Token
app.get("/api/token", async (req, res) => {
    try {
        const response = await axios.get(
            "https://api.dexscreener.com/latest/dex/tokens/9cRCn9rGT8V2imeM2BaKs13yhMEais3ruM3rPvTGpump"
        );

        const pair = response.data.pairs.find(
            p => p.chainId === "solana"
        );

        if (!pair) {
            return res.status(404).json({
                success: false,
                message: "Token not found"
            });
        }

        res.json(pair);

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

// BTC / ETH / SOL
app.get("/api/market", async (req, res) => {
    try {
        const response = await axios.get(
            "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd"
        );

        res.json(response.data);

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

// Global Market
app.get("/api/global", async (req, res) => {
    try {
        const response = await axios.get(
            "https://api.coingecko.com/api/v3/global"
        );

        res.json(response.data);

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

// Trending
app.get("/api/trending", async (req, res) => {
    try {
        const response = await axios.get(
            "https://api.dexscreener.com/token-profiles/latest/v1"
        );

        res.json(response.data);

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

// Token by address
app.get("/api/token/:address", async (req, res) => {
    try {
        const response = await axios.get(
            `https://api.dexscreener.com/latest/dex/tokens/${req.params.address}`
        );

        const pair = response.data.pairs?.[0];

        if (!pair) {
            return res.status(404).json({
                success: false,
                message: "Token not found"
            });
        }

        res.json(pair);

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

app.listen(PORT, () => {
    console.log("");
    console.log("====================================");
    console.log("🚀 ANSEM Dashboard V3");
    console.log(`🌐 http://localhost:${PORT}`);
    console.log("====================================");
    console.log("");
});