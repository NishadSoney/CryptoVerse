/**
 * CryptoVerse - Advanced Market Hub JS
 * Location: assets/js/market-hub.js
 */

const TARGET_SYMBOLS = [
    'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT', 
    'ADAUSDT', 'DOGEUSDT', 'AVAXUSDT', 'LINKUSDT', 'DOTUSDT',
    'MATICUSDT', 'LTCUSDT', 'SHIBUSDT', 'BCHUSDT', 'UNIUSDT',
    'TRXUSDT', 'NEARUSDT', 'APTUSDT', 'ARBUSDT', 'FILUSDT',
    'FETUSDT', 'RNDRUSDT', 'GRTUSDT', 'IMXUSDT', 'GALAUSDT', 'ENJUSDT', 'PEPEUSDT'
];

let marketData = {};
let ws = null;
let currentFilter = 'All'; // 'All' or 'Favorites'
let currentCategoryFilter = 'All';
let searchQuery = '';
let favorites = JSON.parse(localStorage.getItem('cv_favorites')) || [];
let studyChart = null;
let studyCandleSeries = null;
let cmpChart = null;
let cmpSeriesA = null;
let cmpSeriesB = null;

// Coin base configurations
const COIN_CONF = {
    'BTC': { name: 'Bitcoin', mark: '₿', color: '#f3ad45', cat: 'Layer 1 / Layer 2' },
    'ETH': { name: 'Ethereum', mark: '◆', color: '#8497f5', cat: 'Layer 1 / Layer 2' },
    'USDT': { name: 'TetherUS', mark: '₮', color: '#43c99f', cat: 'Stablecoin' },
    'BNB': { name: 'BNB', mark: 'B', color: '#f3d545', cat: 'Layer 1 / Layer 2' },
    'SOL': { name: 'Solana', mark: 'S', color: '#66dfc9', cat: 'Layer 1 / Layer 2' },
    'XRP': { name: 'XRP', mark: 'X', color: '#252838', cat: 'Payments' },
    'ADA': { name: 'Cardano', mark: 'A', color: '#315db8', cat: 'Layer 1 / Layer 2' },
    'DOGE': { name: 'Dogecoin', mark: 'Ð', color: '#c3a634', cat: 'MEME' },
    'AVAX': { name: 'Avalanche', mark: 'A', color: '#e84142', cat: 'Layer 1 / Layer 2' },
    'LINK': { name: 'Chainlink', mark: 'L', color: '#2a5ada', cat: 'DeFi' },
    'DOT': { name: 'Polkadot', mark: 'P', color: '#e6007a', cat: 'Layer 1 / Layer 2' },
    'MATIC': { name: 'Polygon', mark: 'M', color: '#8247e5', cat: 'Layer 1 / Layer 2' },
    'LTC': { name: 'Litecoin', mark: 'Ł', color: '#345d9d', cat: 'Payments' },
    'SHIB': { name: 'Shiba Inu', mark: 'S', color: '#f06427', cat: 'MEME' },
    'BCH': { name: 'Bitcoin Cash', mark: 'B', color: '#8dc351', cat: 'Payments' },
    'UNI': { name: 'Uniswap', mark: 'U', color: '#ff007a', cat: 'DeFi' },
    'TRX': { name: 'TRON', mark: 'T', color: '#ff0013', cat: 'Layer 1 / Layer 2' },
    'NEAR': { name: 'NEAR Protocol', mark: 'N', color: '#111', cat: 'Layer 1 / Layer 2' },
    'APT': { name: 'Aptos', mark: 'A', color: '#111', cat: 'Layer 1 / Layer 2' },
    'ARB': { name: 'Arbitrum', mark: 'A', color: '#28a0f0', cat: 'Layer 1 / Layer 2' },
    'FIL': { name: 'Filecoin', mark: 'F', color: '#0090ff', cat: 'Layer 1 / Layer 2' },
    'FET': { name: 'Fetch.ai', mark: 'F', color: '#1d2852', cat: 'AI' },
    'RNDR': { name: 'Render', mark: 'R', color: '#8f2323', cat: 'AI' },
    'GRT': { name: 'The Graph', mark: 'G', color: '#5a468e', cat: 'AI' },
    'IMX': { name: 'Immutable', mark: 'I', color: '#0a649d', cat: 'Gaming' },
    'GALA': { name: 'Gala', mark: 'G', color: '#1b2944', cat: 'Gaming' },
    'ENJ': { name: 'Enjin Coin', mark: 'E', color: '#6b3594', cat: 'Gaming' },
    'PEPE': { name: 'Pepe', mark: 'P', color: '#3b863b', cat: 'MEME' }
};

document.addEventListener('DOMContentLoaded', () => {
    initMarketHub();
    setupFilters();
    setupModal();
});

async function initMarketHub() {
    const tableBody = document.getElementById('market-table-body');

    try {
        const res = await fetch('https://api.binance.com/api/v3/ticker/24hr');
        const allTickers = await res.json();
        
        const filteredTickers = allTickers.filter(t => TARGET_SYMBOLS.includes(t.symbol));
        
        let totalVolume = 0;
        let totalCapApprox = 0;
        
        filteredTickers.forEach(t => {
            marketData[t.symbol] = t;
            totalVolume += parseFloat(t.quoteVolume);
            const price = parseFloat(t.lastPrice);
            totalCapApprox += (parseFloat(t.quoteVolume) * 10) * price;
        });

        document.getElementById('hero-total-cap').textContent = '$' + (totalCapApprox / 1e9).toFixed(2) + 'B';
        document.getElementById('hero-total-change').innerHTML = '<i data-lucide="activity" style="width:13px; height:13px; margin-right:4px;"></i> Live Updates Active';

        renderTable();
        renderSpotlights();
        
        if (window.lucide) { window.lucide.createIcons(); }
        
        startBinanceStream();

        tableBody.addEventListener('click', (e) => {
            const favBtn = e.target.closest('.fav-btn');
            if (favBtn) {
                const sym = favBtn.getAttribute('data-symbol');
                toggleFavorite(sym);
            }
            const studyBtn = e.target.closest('.study-btn');
            if (studyBtn) {
                const sym = studyBtn.getAttribute('data-symbol');
                openStudyModal(sym);
            }
        });

    } catch (e) {
        console.error("Failed to load market data:", e);
        tableBody.innerHTML = '<div style="padding:4rem; text-align:center; color:#f06a84;">Failed to load market data. Please try again later.</div>';
    }
}

function setupFilters() {
    const assetBtns = document.querySelectorAll('.asset-tabs button');
    assetBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            assetBtns.forEach(b => b.classList.remove('strong', 'selected'));
            e.target.classList.add('strong', 'selected');
            
            if (e.target.textContent.trim() === 'Favorites') {
                currentFilter = 'Favorites';
            } else {
                currentFilter = 'All';
            }
            renderTable();
        });
    });

    const catBtns = document.querySelectorAll('.category-tabs button');
    catBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            catBtns.forEach(b => b.classList.remove('selected'));
            e.target.classList.add('selected');
            currentCategoryFilter = e.target.textContent.trim();
            renderTable();
        });
    });

    const searchInput = document.getElementById('coin-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.trim().toLowerCase();
            renderTable();
        });
    }

    // Top Market Tabs Navigation
    const tabOverview = document.getElementById('tab-overview');
    const tabTrading = document.getElementById('tab-trading-data');
    const tabUnlock = document.getElementById('tab-token-unlock');
    
    const gridOverview = document.getElementById('overview-grid');
    const gridTrading = document.getElementById('trading-data-grid');
    const gridUnlock = document.getElementById('token-unlock-grid');

    if (tabOverview && tabTrading && tabUnlock) {
        const tabs = [tabOverview, tabTrading, tabUnlock];
        const grids = [gridOverview, gridTrading, gridUnlock];

        tabs.forEach((tab, index) => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('selected'));
                tab.classList.add('selected');
                grids.forEach(g => g.style.display = 'none');
                grids[index].style.display = 'grid';
            });
        });
    }
}

function setupModal() {
    document.getElementById('close-modal').addEventListener('click', () => {
        document.getElementById('study-modal').style.display = 'none';
        if (studyChart) {
            studyChart.remove();
            studyChart = null;
        }
    });

    const compareBtn = document.getElementById('open-compare-btn');
    if (compareBtn) {
        compareBtn.addEventListener('click', openCompareModal);
    }
    
    document.getElementById('close-compare-modal').addEventListener('click', () => {
        document.getElementById('compare-modal').style.display = 'none';
        if (cmpChart) {
            cmpChart.remove();
            cmpChart = null;
        }
    });

    document.getElementById('compare-coin-a').addEventListener('change', fetchCompareData);
    document.getElementById('compare-coin-b').addEventListener('change', fetchCompareData);
}

function toggleFavorite(symbol) {
    if (favorites.includes(symbol)) {
        favorites = favorites.filter(s => s !== symbol);
    } else {
        favorites.push(symbol);
    }
    localStorage.setItem('cv_favorites', JSON.stringify(favorites));
    renderTable(); // Re-render to update stars
}

async function openCompareModal() {
    const modal = document.getElementById('compare-modal');
    modal.style.display = 'flex';
    
    const selA = document.getElementById('compare-coin-a');
    const selB = document.getElementById('compare-coin-b');
    
    if (selA.options.length === 0) {
        TARGET_SYMBOLS.forEach(sym => {
            const opt1 = document.createElement('option');
            opt1.value = sym; opt1.textContent = sym.replace('USDT','');
            const opt2 = document.createElement('option');
            opt2.value = sym; opt2.textContent = sym.replace('USDT','');
            
            selA.appendChild(opt1);
            selB.appendChild(opt2);
        });
        selA.value = 'BTCUSDT';
        selB.value = 'ETHUSDT';
    }
    
    fetchCompareData();
}

async function fetchCompareData() {
    const symA = document.getElementById('compare-coin-a').value;
    const symB = document.getElementById('compare-coin-b').value;
    
    const chartContainer = document.getElementById('compare-chart-container');
    if (cmpChart) {
        cmpChart.remove();
    }
    chartContainer.innerHTML = '';
    
    cmpChart = LightweightCharts.createChart(chartContainer, {
        layout: { background: { type: 'solid', color: 'transparent' }, textColor: '#8c899c' },
        grid: { vertLines: { color: 'rgba(255,255,255,0.05)' }, horzLines: { color: 'rgba(255,255,255,0.05)' } },
        rightPriceScale: { mode: LightweightCharts.PriceScaleMode.Percentage },
        timeScale: { timeVisible: true, secondsVisible: false }
    });
    
    cmpSeriesA = cmpChart.addLineSeries({ color: '#8d7aff', lineWidth: 2 });
    cmpSeriesB = cmpChart.addLineSeries({ color: '#5de3ca', lineWidth: 2 });
    
    try {
        const [resA, resB] = await Promise.all([
            fetch(`https://api.binance.com/api/v3/klines?symbol=${symA}&interval=1h&limit=168`),
            fetch(`https://api.binance.com/api/v3/klines?symbol=${symB}&interval=1h&limit=168`)
        ]);
        const klA = await resA.json();
        const klB = await resB.json();
        
        cmpSeriesA.setData(klA.map(k => ({ time: k[0]/1000, value: parseFloat(k[4]) })));
        cmpSeriesB.setData(klB.map(k => ({ time: k[0]/1000, value: parseFloat(k[4]) })));
        cmpChart.timeScale().fitContent();
    } catch(e) {
        chartContainer.innerHTML = '<div style="color:#f05d7a;">Error loading compare data.</div>';
    }
    
    updateCompareGrid();
}

function updateCompareGrid() {
    const symA = document.getElementById('compare-coin-a');
    const symB = document.getElementById('compare-coin-b');
    if (!symA || !symB || !symA.value || !symB.value) return;
    
    const dA = marketData[symA.value];
    const dB = marketData[symB.value];
    
    if (dA) {
        document.getElementById('cmp-price-a').textContent = '$' + formatNumber(parseFloat(dA.lastPrice), 4);
        document.getElementById('cmp-growth-a').innerHTML = `<span class="${parseFloat(dA.priceChangePercent) >= 0 ? 'market-positive' : 'market-negative'}">${parseFloat(dA.priceChangePercent).toFixed(2)}%</span>`;
        document.getElementById('cmp-vol-a').textContent = '$' + formatNumber(parseFloat(dA.quoteVolume), 0);
    }
    if (dB) {
        document.getElementById('cmp-price-b').textContent = '$' + formatNumber(parseFloat(dB.lastPrice), 4);
        document.getElementById('cmp-growth-b').innerHTML = `<span class="${parseFloat(dB.priceChangePercent) >= 0 ? 'market-positive' : 'market-negative'}">${parseFloat(dB.priceChangePercent).toFixed(2)}%</span>`;
        document.getElementById('cmp-vol-b').textContent = '$' + formatNumber(parseFloat(dB.quoteVolume), 0);
    }
}

async function openStudyModal(symbol) {
    const modal = document.getElementById('study-modal');
    modal.style.display = 'flex';
    
    const data = marketData[symbol];
    const assetBase = symbol.replace('USDT', '');
    const conf = COIN_CONF[assetBase] || { name: assetBase, mark: assetBase[0], color: '#666' };
    
    document.getElementById('study-asset-title').innerHTML = `
        <span class="coin-icon" style="background:${conf.color}; color:${['XRP','NEAR','APT'].includes(assetBase) ? '#FFF' : '#191525'}">${conf.mark}</span>
        <div>
            <div>${assetBase}</div>
            <div style="font-size:12px; color:#8c899c; font-weight:400;">${conf.name}</div>
        </div>
    `;
    
    document.getElementById('study-asset-price').innerHTML = `
        <div style="font-size:32px; font-weight:700; color:#FFF; font-family:'Space Mono', monospace; text-align:center;">$${formatNumber(parseFloat(data.lastPrice), 4)}</div>
        <div class="${parseFloat(data.priceChangePercent) >= 0 ? 'market-positive' : 'market-negative'}" style="font-size:14px; text-align:center;">
            ${parseFloat(data.priceChangePercent) >= 0 ? '+' : ''}${parseFloat(data.priceChangePercent).toFixed(2)}%
        </div>
    `;
    
    document.getElementById('study-stat-high').textContent = '$' + formatNumber(parseFloat(data.highPrice), 4);
    document.getElementById('study-stat-low').textContent = '$' + formatNumber(parseFloat(data.lowPrice), 4);
    document.getElementById('study-stat-vol').textContent = '$' + formatNumber(parseFloat(data.quoteVolume), 0);
    document.getElementById('study-stat-trend').innerHTML = parseFloat(data.priceChangePercent) >= 0 
        ? '<span style="color:#5de3ca">Bullish</span>' 
        : '<span style="color:#f05d7a">Bearish</span>';
    
    document.getElementById('study-stat-avg').textContent = '$' + formatNumber(parseFloat(data.weightedAvgPrice), 4);
    document.getElementById('study-stat-trades').textContent = formatNumber(parseInt(data.count), 0);

    // Initialize Chart
    const chartContainer = document.getElementById('study-chart-container');
    chartContainer.innerHTML = '';
    
    studyChart = LightweightCharts.createChart(chartContainer, {
        layout: {
            background: { type: 'solid', color: 'transparent' },
            textColor: '#8c899c',
        },
        grid: {
            vertLines: { color: 'rgba(255,255,255,0.05)' },
            horzLines: { color: 'rgba(255,255,255,0.05)' },
        },
        timeScale: {
            timeVisible: true,
            secondsVisible: false,
        }
    });

    studyCandleSeries = studyChart.addCandlestickSeries({
        upColor: '#5de3ca',
        downColor: '#f05d7a',
        borderVisible: false,
        wickUpColor: '#5de3ca',
        wickDownColor: '#f05d7a',
    });

    const volumeSeries = studyChart.addHistogramSeries({
        color: '#26a69a',
        priceFormat: { type: 'volume' },
        priceScaleId: '', 
    });

    studyChart.priceScale('').applyOptions({
        scaleMargins: { top: 0.8, bottom: 0 },
    });

    try {
        // Fetch klines (4-hour intervals for 1 month)
        const klineRes = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=4h&limit=100`);
        const klines = await klineRes.json();
        
        const chartData = klines.map(k => ({
            time: k[0] / 1000,
            open: parseFloat(k[1]),
            high: parseFloat(k[2]),
            low: parseFloat(k[3]),
            close: parseFloat(k[4])
        }));

        const volData = klines.map(k => ({
            time: k[0] / 1000,
            value: parseFloat(k[5]),
            color: parseFloat(k[4]) >= parseFloat(k[1]) ? 'rgba(93, 227, 202, 0.4)' : 'rgba(240, 93, 122, 0.4)'
        }));
        
        studyCandleSeries.setData(chartData);
        volumeSeries.setData(volData);
        studyChart.timeScale().fitContent();
    } catch(e) {
        chartContainer.innerHTML = '<div style="color:#f05d7a;">Error loading chart data.</div>';
    }
}

function renderTable() {
    const tbody = document.getElementById('market-table-body');
    tbody.innerHTML = '';
    
    let symbolsToRender = TARGET_SYMBOLS;
    
    if (currentFilter === 'Favorites') {
        symbolsToRender = TARGET_SYMBOLS.filter(s => favorites.includes(s));
        if (symbolsToRender.length === 0) {
            tbody.innerHTML = '<div style="padding:4rem; text-align:center; color:#94A3B8; grid-column:1/-1;">No favorites added yet. Click the star icon next to an asset.</div>';
            return;
        }
    }
    
    if (currentCategoryFilter !== 'All') {
        symbolsToRender = symbolsToRender.filter(s => {
            const base = s.replace('USDT', '');
            return COIN_CONF[base] && COIN_CONF[base].cat === currentCategoryFilter;
        });
        
        if (symbolsToRender.length === 0) {
            tbody.innerHTML = `<div style="padding:4rem; text-align:center; color:#94A3B8; grid-column:1/-1;">No tokens found in ${currentCategoryFilter} category.</div>`;
            return;
        }
    }

    if (searchQuery) {
        symbolsToRender = symbolsToRender.filter(s => {
            const base = s.replace('USDT', '').toLowerCase();
            const baseUpper = s.replace('USDT', '');
            const name = (COIN_CONF[baseUpper]?.name || '').toLowerCase();
            return base.includes(searchQuery) || name.includes(searchQuery);
        });
        
        if (symbolsToRender.length === 0) {
            tbody.innerHTML = `<div style="padding:4rem; text-align:center; color:#94A3B8; grid-column:1/-1;">No results found for "${searchQuery}".</div>`;
            return;
        }
    }

    symbolsToRender.forEach((symbol) => {
        const data = marketData[symbol];
        if (!data) return;

        const assetBase = symbol.replace('USDT', '');
        const conf = COIN_CONF[assetBase] || { name: assetBase, mark: assetBase[0], color: '#666' };
        
        const price = parseFloat(data.lastPrice);
        const changePct = parseFloat(data.priceChangePercent);
        const volume = parseFloat(data.quoteVolume);
        
        const isFav = favorites.includes(symbol);
        const favIconColor = isFav ? '#f3ad45' : '#676477';
        const favIconFill = isFav ? '#f3ad45' : 'none';

        const row = document.createElement('div');
        row.className = 'asset-row';
        row.setAttribute('role', 'row');
        row.id = `row-${symbol}`;
        
        const isPositive = changePct >= 0;
        const trendClass = isPositive ? 'market-positive' : 'market-negative';
        const trendIcon = isPositive ? 'arrow-up' : 'arrow-down';
        const sparklineStroke = isPositive ? '#45d5b8' : '#f05d7a';

        const sparkline = generateSparkline(
            parseFloat(data.openPrice), parseFloat(data.highPrice), 
            parseFloat(data.lowPrice), parseFloat(data.lastPrice), isPositive
        );

        row.innerHTML = `
            <div class="asset-name">
                <i data-lucide="star" class="fav-btn" data-symbol="${symbol}" style="width:14px; height:14px; color:${favIconColor}; fill:${favIconFill}; cursor:pointer;"></i>
                <span class="coin-icon" style="background:${conf.color}; color:${['XRP','NEAR','APT'].includes(assetBase) ? '#FFF' : '#191525'}">${conf.mark}</span>
                <span><strong>${assetBase}</strong><small>${conf.name}</small></span>
            </div>
            <strong class="price-cell">$${formatNumber(price, price < 1 ? 4 : 2)}</strong>
            <span class="change-cell ${trendClass}">
                <i data-lucide="${trendIcon}" style="width:13px; height:13px;"></i> ${Math.abs(changePct).toFixed(2)}%
            </span>
            <span>$${formatNumber(volume, 0)}</span>
            <svg class="market-sparkline spark-cell" viewBox="0 0 130 38" preserveAspectRatio="none">
                <path d="${sparkline}" fill="none" stroke="${sparklineStroke}" stroke-width="2" vector-effect="non-scaling-stroke"></path>
            </svg>
            <button class="trade-button study-btn" data-symbol="${symbol}">Study</button>
        `;
        tbody.appendChild(row);
    });

    if (window.lucide) { window.lucide.createIcons(); }
}

function startBinanceStream() {
    ws = new WebSocket('wss://stream.binance.com:9443/ws/!miniTicker@arr');
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        data.forEach(ticker => {
            const symbol = ticker.s;
            if (TARGET_SYMBOLS.includes(symbol)) {
                if (marketData[symbol]) {
                    const oldPrice = parseFloat(marketData[symbol].lastPrice);
                    const newPrice = parseFloat(ticker.c);
                    
                    marketData[symbol].lastPrice = ticker.c;
                    marketData[symbol].openPrice = ticker.o;
                    marketData[symbol].highPrice = ticker.h;
                    marketData[symbol].lowPrice = ticker.l;
                    
                    const changePct = ((newPrice - parseFloat(ticker.o)) / parseFloat(ticker.o)) * 100;
                    marketData[symbol].priceChangePercent = changePct;
                    marketData[symbol].quoteVolume = ticker.q;

                    updateRow(symbol, newPrice, oldPrice);
                    
                    // Update compare modal if open
                    const compModal = document.getElementById('compare-modal');
                    if (compModal && compModal.style.display === 'flex') {
                        const sA = document.getElementById('compare-coin-a');
                        const sB = document.getElementById('compare-coin-b');
                        if ((sA && sA.value === symbol) || (sB && sB.value === symbol)) {
                            updateCompareGrid();
                        }
                    }
                }
            }
        });
        
        if (!window.sidebarUpdateTimer) {
            window.sidebarUpdateTimer = setTimeout(() => {
                renderSpotlights();
                window.sidebarUpdateTimer = null;
            }, 3000);
        }
    };
}

function updateRow(symbol, newPrice, oldPrice) {
    const row = document.getElementById(`row-${symbol}`);
    if (!row) return;

    const data = marketData[symbol];
    const priceCell = row.querySelector('.price-cell');
    const changeCell = row.querySelector('.change-cell');
    const sparkPath = row.querySelector('.spark-cell path');
    
    if (newPrice !== oldPrice) {
        priceCell.textContent = `$${formatNumber(newPrice, newPrice < 1 ? 4 : 2)}`;
        const flashClass = newPrice > oldPrice ? 'flash-up' : 'flash-down';
        row.classList.remove('flash-up', 'flash-down');
        void row.offsetWidth; // reflow
        row.classList.add(flashClass);
    }

    const isPositive = data.priceChangePercent >= 0;
    const trendClass = isPositive ? 'market-positive' : 'market-negative';
    const trendIcon = isPositive ? 'arrow-up' : 'arrow-down';
    
    changeCell.className = `change-cell ${trendClass}`;
    changeCell.innerHTML = `<i data-lucide="${trendIcon}" style="width:13px; height:13px;"></i> ${Math.abs(data.priceChangePercent).toFixed(2)}%`;
    
    const sparklineStroke = isPositive ? '#45d5b8' : '#f05d7a';
    sparkPath.setAttribute('stroke', sparklineStroke);
    sparkPath.setAttribute('d', generateSparkline(
        parseFloat(data.openPrice), parseFloat(data.highPrice), 
        parseFloat(data.lowPrice), parseFloat(data.lastPrice), isPositive
    ));
    
    if (window.lucide) { window.lucide.createIcons({root: changeCell}); }
}

function renderSpotlights() {
    const sortedByChange = Object.values(marketData).sort((a, b) => parseFloat(b.priceChangePercent) - parseFloat(a.priceChangePercent));
    const sortedByVol = Object.values(marketData).sort((a, b) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume));
    const sortedByTrades = Object.values(marketData).sort((a, b) => parseInt(b.count || 0) - parseInt(a.count || 0));
    
    // Overview Data
    const gainers = sortedByChange.slice(0, 3);
    const volume = sortedByVol.slice(0, 3);
    const hot = sortedByTrades.slice(0, 3);
    
    // "New" tokens (hardcoded logic)
    const newTokensList = ['PEPEUSDT', 'APTUSDT', 'ARBUSDT', 'FILUSDT', 'NEARUSDT'];
    const newTokens = newTokensList.map(s => marketData[s]).filter(Boolean).slice(0, 3);
    
    fillSpotlight('spotlight-hot', hot);
    fillSpotlight('spotlight-new', newTokens);
    fillSpotlight('spotlight-gainers', gainers);
    fillSpotlight('spotlight-volume', volume);

    // Trading Data
    const losers = sortedByChange.slice(-3).reverse();
    const turnover = sortedByVol.slice(0, 3); // similar to volume but used in trading context
    const mostTrades = sortedByTrades.slice(0, 3);
    
    // High Volatility ( (high - low)/low )
    const sortedByVolatility = Object.values(marketData).sort((a, b) => {
        const vA = (parseFloat(a.highPrice) - parseFloat(a.lowPrice)) / parseFloat(a.lowPrice);
        const vB = (parseFloat(b.highPrice) - parseFloat(b.lowPrice)) / parseFloat(b.lowPrice);
        return vB - vA;
    });
    const highVolatility = sortedByVolatility.slice(0, 3);

    fillSpotlight('spotlight-losers', losers);
    fillSpotlight('spotlight-volatility', highVolatility);
    fillSpotlight('spotlight-turnover', turnover);
    fillSpotlight('spotlight-trades', mostTrades);
    
    if (window.lucide) {
        window.lucide.createIcons();
    }
}

function fillSpotlight(containerId, assets) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '';
    
    assets.forEach(t => {
        const base = t.symbol.replace('USDT', '');
        const conf = COIN_CONF[base] || { name: base, mark: base[0], color: '#666' };
        const price = parseFloat(t.lastPrice);
        const changePct = parseFloat(t.priceChangePercent);
        const isPositive = changePct >= 0;
        const trendClass = isPositive ? 'market-positive' : 'market-negative';
        const trendIcon = isPositive ? 'arrow-up' : 'arrow-down';
        
        container.innerHTML += `
            <div class="spotlight-row">
                <span class="coin-icon" style="background:${conf.color}; color:${['XRP','NEAR','APT'].includes(base) ? '#FFF' : '#191525'}">${conf.mark}</span>
                <div>
                    <strong>${base}</strong>
                    <span>${conf.name}</span>
                </div>
                <b>$${formatNumber(price, price < 1 ? 4 : 2)}</b>
                <span class="${trendClass}"><i data-lucide="${trendIcon}" style="width:12px; height:12px;"></i>${Math.abs(changePct).toFixed(2)}%</span>
            </div>
        `;
    });
}

function formatNumber(num, maxDecimals = 2) {
    if (num >= 1e9) { return (num / 1e9).toFixed(2) + 'B'; }
    if (num >= 1e6) { return (num / 1e6).toFixed(2) + 'M'; }
    
    let parts = num.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    if (parts[1] && maxDecimals > 0) {
        parts[1] = parts[1].substring(0, maxDecimals);
        return parts.join(".");
    }
    return parts[0] || "0";
}

function generateSparkline(open, high, low, close, isPositive) {
    const min = low;
    const max = high;
    const range = max - min || 1;
    
    const getY = (val) => 34 - (((val - min) / range) * 30);
    
    const yOpen = getY(open);
    const yClose = getY(close);
    const yHigh = getY(high);
    const yLow = getY(low);

    const mid1Y = isPositive ? yLow : yHigh;
    const mid2Y = isPositive ? yHigh : yLow;

    return `M0 ${yOpen} C15 ${mid1Y}, 22 ${isPositive? yOpen-5 : yOpen+5}, 36 ${mid1Y} S57 ${mid2Y}, 70 ${yClose} S87 ${mid2Y}, 100 ${mid1Y} S116 ${mid2Y}, 130 ${yClose}`;
}
