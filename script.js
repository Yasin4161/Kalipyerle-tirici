// İnşaat Kalıp Yerleştirme Uygulaması
class PanelPlacementApp {
    constructor() {
        this.panels = [];
        this.placedPanels = [];
        this.canvas = null;
        this.ctx = null;
        this.colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
            '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43',
            '#10AC84', '#EE5A24', '#0C2461', '#1DD1A1', '#FD79A8'
        ];
        
        this.init();
        this.loadPanels();
        this.addDefaultPanels();
    }

    init() {
        // DOM elementlerini bul
        this.elements = {
            panelWidth: document.getElementById('panelWidth'),
            panelHeight: document.getElementById('panelHeight'),
            panelCount: document.getElementById('panelCount'),
            addPanelBtn: document.getElementById('addPanelBtn'),
            panelsList: document.getElementById('panelsList'),
            emptyPanels: document.getElementById('emptyPanels'),
            areaWidth: document.getElementById('areaWidth'),
            areaHeight: document.getElementById('areaHeight'),
            allowRotation: document.getElementById('allowRotation'),
            calculateBtn: document.getElementById('calculateBtn'),
            resultsSection: document.getElementById('resultsSection'),
            usedPanelsCount: document.getElementById('usedPanelsCount'),
            remainingArea: document.getElementById('remainingArea'),
            efficiency: document.getElementById('efficiency'),
            panelDetails: document.getElementById('panelDetails'),
            panelDetailsList: document.getElementById('panelDetailsList'),
            visualizationCanvas: document.getElementById('visualizationCanvas'),
            exportBtn: document.getElementById('exportBtn'),
            toast: document.getElementById('toast')
        };

        // Event listener'ları ekle
        this.elements.addPanelBtn.addEventListener('click', () => this.addPanel());
        this.elements.calculateBtn.addEventListener('click', () => this.calculatePlacement());
        this.elements.exportBtn.addEventListener('click', () => this.exportCanvas());

        // Enter tuşu ile panel ekleme
        this.elements.panelWidth.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addPanel();
        });
        this.elements.panelHeight.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addPanel();
        });
        this.elements.panelCount.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addPanel();
        });

        // Enter tuşu ile hesaplama
        this.elements.areaWidth.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.calculatePlacement();
        });
        this.elements.areaHeight.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.calculatePlacement();
        });

        // Canvas'ı ayarla
        this.canvas = this.elements.visualizationCanvas;
        this.ctx = this.canvas.getContext('2d');
    }

    // Panel ekleme fonksiyonu
    addPanel() {
        const width = parseFloat(this.elements.panelWidth.value);
        const height = parseFloat(this.elements.panelHeight.value);
        const count = parseInt(this.elements.panelCount.value) || 1;

        // Validasyon
        if (!width || !height || width <= 0 || height <= 0) {
            this.showToast('Lütfen geçerli panel boyutları girin!', 'error');
            return;
        }

        if (count <= 0) {
            this.showToast('Panel adedi 1 veya daha fazla olmalı!', 'error');
            return;
        }

        // Aynı panel var mı kontrol et
        const existingIndex = this.panels.findIndex(panel => 
            panel.width === width && panel.height === height
        );

        if (existingIndex !== -1) {
            // Mevcut panelin sayısını artır
            this.panels[existingIndex].count += count;
            this.showToast(`${count} adet ${width}×${height} panel eklendi! Toplam: ${this.panels[existingIndex].count} adet`, 'success');
        } else {
            // Yeni panel ekle
            const panel = { 
                width, 
                height, 
                count, 
                area: width * height 
            };
            this.panels.push(panel);
            this.showToast(`${count} adet ${width}×${height} panel başarıyla eklendi!`, 'success');
        }

        // Form'u temizle
        this.elements.panelWidth.value = '';
        this.elements.panelHeight.value = '';
        this.elements.panelCount.value = '1';

        // Liste güncelle
        this.updatePanelsList();
        this.savePanels();
    }

    // Paneli sil
    removePanel(index) {
        this.panels.splice(index, 1);
        this.updatePanelsList();
        this.savePanels();
        this.showToast('Panel silindi!', 'success');
    }

    // Panel sayısını artır
    increasePanel(index) {
        if (!this.panels[index].count) this.panels[index].count = 1;
        this.panels[index].count++;
        this.updatePanelsList();
        this.savePanels();
        this.showToast('Panel sayısı artırıldı!', 'success');
    }

    // Panel sayısını azalt
    decreasePanel(index) {
        if (!this.panels[index].count) this.panels[index].count = 1;
        if (this.panels[index].count > 1) {
            this.panels[index].count--;
            this.updatePanelsList();
            this.savePanels();
            this.showToast('Panel sayısı azaltıldı!', 'success');
        } else {
            this.showToast('Panel sayısı 1\'den az olamaz!', 'warning');
        }
    }

    // Panel listesini güncelle
    updatePanelsList() {
        if (this.panels.length === 0) {
            this.elements.emptyPanels.style.display = 'block';
            this.elements.panelsList.innerHTML = '';
            this.elements.panelsList.appendChild(this.elements.emptyPanels);
            return;
        }

        this.elements.emptyPanels.style.display = 'none';
        
        const panelsHTML = this.panels.map((panel, index) => `
            <div class="panel-item">
                <div class="panel-info">
                    <div class="panel-size">${panel.width} × ${panel.height} cm</div>
                    <div class="panel-area">${(panel.area / 10000).toFixed(2)} m² × ${panel.count || 1} adet</div>
                    <div class="panel-total">Toplam: ${((panel.area * (panel.count || 1)) / 10000).toFixed(2)} m²</div>
                </div>
                <div class="panel-actions">
                    <button class="btn btn-count" onclick="app.decreasePanel(${index})" title="Azalt">
                        <i class="fas fa-minus"></i>
                    </button>
                    <span class="panel-count-display">${panel.count || 1}</span>
                    <button class="btn btn-count" onclick="app.increasePanel(${index})" title="Artır">
                        <i class="fas fa-plus"></i>
                    </button>
                    <button class="btn btn-danger" onclick="app.removePanel(${index})" title="Sil">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');

        this.elements.panelsList.innerHTML = panelsHTML;
    }

    // Yerleştirme hesaplaması
    calculatePlacement() {
        // Validasyon
        if (this.panels.length === 0) {
            this.showToast('Önce panel ekleyin!', 'error');
            return;
        }

        const areaWidth = parseFloat(this.elements.areaWidth.value);
        const areaHeight = parseFloat(this.elements.areaHeight.value);

        if (!areaWidth || !areaHeight || areaWidth <= 0 || areaHeight <= 0) {
            this.showToast('Lütfen geçerli alan boyutları girin!', 'error');
            return;
        }

        // Metre'den cm'ye dönüştür
        const areaCmWidth = areaWidth * 100;
        const areaCmHeight = areaHeight * 100;
        const totalArea = areaWidth * areaHeight;

        // Yerleştirme algoritmasını çalıştır
        this.placedPanels = this.placePanels(areaCmWidth, areaCmHeight);

        // Sonuçları hesapla
        const results = this.calculateResults(totalArea);
        
        // Beşon hesaplamalarını yap
        const beamRequirements = this.calculateBeamRequirements(areaWidth, areaHeight);

        // Sonuçları göster
        this.displayResults(results, beamRequirements);
        this.drawVisualization(areaCmWidth, areaCmHeight);

        // Sonuçlar bölümünü göster
        this.elements.resultsSection.style.display = 'block';
        this.elements.resultsSection.scrollIntoView({ behavior: 'smooth' });

        this.showToast('Yerleştirme hesaplandı!', 'success');
    }

    // Panel yerleştirme algoritması
    placePanels(areaWidth, areaHeight) {
        const placed = [];
        const allowRotation = this.elements.allowRotation.checked;

        // Panelleri alan büyüklüğüne göre sırala (büyükten küçüğe)
        const sortedPanels = [...this.panels].sort((a, b) => b.area - a.area);

        // Kullanılabilir alanları tutacak grid sistemi
        const occupiedGrid = Array(Math.ceil(areaHeight)).fill(null)
            .map(() => Array(Math.ceil(areaWidth)).fill(false));

        // Her panel türü için yerleştirme dene
        for (const panel of sortedPanels) {
            let panelCount = 0;
            const maxPanels = panel.count || 1; // Panel sayısı ile sınırla

            while (panelCount < maxPanels) {
                let bestPosition = null;
                let bestRotation = false;

                // Normal yönelim dene
                const normalPos = this.findBestPosition(occupiedGrid, panel.width, panel.height, areaWidth, areaHeight);
                if (normalPos) {
                    bestPosition = normalPos;
                }

                // Döndürülmüş yönelim dene (eğer izin verilmişse ve farklı boyutlarda ise)
                if (allowRotation && panel.width !== panel.height) {
                    const rotatedPos = this.findBestPosition(occupiedGrid, panel.height, panel.width, areaWidth, areaHeight);
                    if (rotatedPos && (!bestPosition || this.isPositionBetter(rotatedPos, bestPosition))) {
                        bestPosition = rotatedPos;
                        bestRotation = true;
                    }
                }

                // Eğer uygun pozisyon bulunamadıysa döngüden çık
                if (!bestPosition) break;

                // Panel'i yerleştir
                const placedPanel = {
                    width: bestRotation ? panel.height : panel.width,
                    height: bestRotation ? panel.width : panel.height,
                    x: bestPosition.x,
                    y: bestPosition.y,
                    originalPanel: panel,
                    rotated: bestRotation,
                    color: this.colors[this.panels.indexOf(panel) % this.colors.length]
                };

                placed.push(placedPanel);
                panelCount++;

                // Grid'i güncelle
                this.markOccupied(occupiedGrid, bestPosition.x, bestPosition.y, placedPanel.width, placedPanel.height);
            }
        }

        return placed;
    }

    // En iyi pozisyonu bul
    findBestPosition(occupiedGrid, panelWidth, panelHeight, areaWidth, areaHeight) {
        // Sol üstten başlayarak tara
        for (let y = 0; y <= areaHeight - panelHeight; y++) {
            for (let x = 0; x <= areaWidth - panelWidth; x++) {
                if (this.canPlacePanel(occupiedGrid, x, y, panelWidth, panelHeight)) {
                    return { x, y };
                }
            }
        }
        return null;
    }

    // Panel yerleştirilebilir mi kontrol et
    canPlacePanel(occupiedGrid, x, y, width, height) {
        const gridHeight = occupiedGrid.length;
        const gridWidth = occupiedGrid[0].length;

        for (let py = Math.floor(y); py < Math.ceil(y + height) && py < gridHeight; py++) {
            for (let px = Math.floor(x); px < Math.ceil(x + width) && px < gridWidth; px++) {
                if (occupiedGrid[py] && occupiedGrid[py][px]) {
                    return false;
                }
            }
        }
        return true;
    }

    // Grid'de alanı işgal edilmiş olarak işaretle
    markOccupied(occupiedGrid, x, y, width, height) {
        const gridHeight = occupiedGrid.length;
        const gridWidth = occupiedGrid[0].length;

        for (let py = Math.floor(y); py < Math.ceil(y + height) && py < gridHeight; py++) {
            for (let px = Math.floor(x); px < Math.ceil(x + width) && px < gridWidth; px++) {
                if (occupiedGrid[py]) {
                    occupiedGrid[py][px] = true;
                }
            }
        }
    }

    // Pozisyon karşılaştırması (sol üst öncelikli)
    isPositionBetter(pos1, pos2) {
        if (pos1.y !== pos2.y) return pos1.y < pos2.y;
        return pos1.x < pos2.x;
    }

    // Beşon hesaplama
    calculateBeamRequirements(areaWidth, areaHeight) {
        // Alan boyutları metre cinsinden
        const widthM = areaWidth;
        const heightM = areaHeight;
        
        // Kısa ve uzun kenarları bul
        const shortEdgeM = Math.min(widthM, heightM);
        const longEdgeM = Math.max(widthM, heightM);
        const longEdgeCm = longEdgeM * 100;
        
        // Beşon sayısı: uzun kenar cm / 50
        const beamCount = Math.ceil(longEdgeCm / 50);
        
        // Beşon boyutu: kısa kenara göre
        let beamType = '';
        
        if (shortEdgeM >= 4) {
            // 4 metre ve üzeri
            beamType = '4m';
        } else if (shortEdgeM >= 3) {
            // 3-3.99 metre arası
            beamType = '3m';
        } else if (shortEdgeM >= 2) {
            // 2-2.99 metre arası
            beamType = '2m';
        } else {
            // 2 metreden kısa
            beamType = 'Kısa beşon gerekli';
        }
        
        return {
            beam4m: beamType === '4m' ? beamCount : 0,
            beam3m: beamType === '3m' ? beamCount : 0,
            beam2m: beamType === '2m' ? beamCount : 0,
            shortBeamWarning: beamType === 'Kısa beşon gerekli',
            shortBeamCount: beamType === 'Kısa beşon gerekli' ? beamCount : 0,
            shortEdgeM: shortEdgeM,
            longEdgeM: longEdgeM,
            beamCount: beamCount,
            beamType: beamType
        };
    }

    // Sonuçları hesapla
    calculateResults(totalAreaM2) {
        const panelCounts = {};
        let totalUsedArea = 0;

        // Panel sayılarını hesapla
        this.placedPanels.forEach(panel => {
            const key = `${panel.originalPanel.width}x${panel.originalPanel.height}`;
            panelCounts[key] = (panelCounts[key] || 0) + 1;
            totalUsedArea += (panel.width * panel.height) / 10000; // cm²'den m²'ye
        });

        const remainingArea = totalAreaM2 - totalUsedArea;
        const efficiency = (totalUsedArea / totalAreaM2) * 100;

        return {
            panelCounts,
            totalPanels: this.placedPanels.length,
            remainingArea: Math.max(0, remainingArea),
            efficiency: Math.min(100, efficiency),
            usedAreaM2: totalUsedArea
        };
    }

    // Sonuçları göster
    displayResults(results, beamRequirements) {
        this.elements.usedPanelsCount.textContent = results.totalPanels;
        this.elements.remainingArea.textContent = results.remainingArea.toFixed(2);
        this.elements.efficiency.textContent = results.efficiency.toFixed(1);

        // Panel detaylarını göster
        const detailsHTML = Object.entries(results.panelCounts)
            .map(([size, count]) => `
                <div class="panel-detail-item">
                    <span class="panel-type">${size} cm</span>
                    <span class="panel-count">${count} adet</span>
                </div>
            `).join('');

        // Beşon hesaplamalarını ekle
        const beamHTML = `
            <div class="beam-calculations">
                <h4><i class="fas fa-ruler"></i> Tahmini Beşon İhtiyacı</h4>
                <div class="beam-info">
                    <small>Kısa kenar: ${beamRequirements.shortEdgeM.toFixed(2)}m | Uzun kenar: ${beamRequirements.longEdgeM.toFixed(2)}m</small>
                </div>
                ${beamRequirements.shortBeamWarning ? 
                    `<div class="beam-warning">
                        <i class="fas fa-exclamation-triangle"></i>
                        Kısa beşon gerekli (2m altı): ${beamRequirements.beamCount} adet
                    </div>
                    <div class="beam-calculation-note">
                        <small>Hesaplama: Uzun kenar (${beamRequirements.longEdgeM.toFixed(2)}m) ÷ 0.5m = ${beamRequirements.beamCount} adet</small>
                    </div>` : 
                    `<div class="beam-details">
                        <div class="beam-item">
                            <span class="beam-type">${beamRequirements.beamType} beşon:</span>
                            <span class="beam-count">${beamRequirements.beamCount} adet</span>
                        </div>
                        <div class="beam-calculation-note">
                            <small>Hesaplama: Uzun kenar (${beamRequirements.longEdgeM.toFixed(2)}m) ÷ 0.5m = ${beamRequirements.beamCount} adet</small>
                        </div>
                    </div>`
                }
            </div>
        `;

        this.elements.panelDetailsList.innerHTML = detailsHTML + beamHTML;
    }

    // Görselleştirme çiz
    drawVisualization(areaWidth, areaHeight) {
        // Canvas boyutlarını ayarla - kenar boyutları için extra alan bırak
        const maxCanvasWidth = 800;
        const maxCanvasHeight = 600;
        const marginSize = 60; // Kenar yazıları için margin
        
        const scale = Math.min((maxCanvasWidth - marginSize * 2) / areaWidth, (maxCanvasHeight - marginSize * 2) / areaHeight);
        
        this.canvas.width = areaWidth * scale + marginSize * 2;
        this.canvas.height = areaHeight * scale + marginSize * 2;

        // PDF benzeri temiz arka plan
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Ana alan koordinatları
        const areaStartX = marginSize;
        const areaStartY = marginSize;
        const areaEndX = areaStartX + areaWidth * scale;
        const areaEndY = areaStartY + areaHeight * scale;

        // Ana inşaat alanı arka planı
        this.ctx.fillStyle = '#fafafa';
        this.ctx.fillRect(areaStartX, areaStartY, areaWidth * scale, areaHeight * scale);

        // Grid çiz
        this.drawGrid(scale, areaStartX, areaStartY);

        // Kapatılamayan alanları hesapla ve sarı renkle göster
        this.drawEmptyAreas(areaWidth, areaHeight, scale, areaStartX, areaStartY);

        // Panelleri çiz
        this.placedPanels.forEach(panel => {
            this.drawPanel(panel, scale, areaStartX, areaStartY);
        });

        // Ana alan sınırlarını çiz
        this.ctx.strokeStyle = '#2c3e50';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(areaStartX, areaStartY, areaWidth * scale, areaHeight * scale);

        // Kenar boyutlarını yaz
        this.drawDimensions(areaWidth, areaHeight, scale, areaStartX, areaStartY, areaEndX, areaEndY);

        // Legend oluştur
        this.createLegend();
    }

    // Grid çiz - PDF benzeri ince çizgiler
    drawGrid(scale, offsetX, offsetY) {
        this.ctx.strokeStyle = '#e0e0e0';
        this.ctx.lineWidth = 0.5;
        this.ctx.setLineDash([2, 2]);

        // 50cm aralıklarla grid
        const gridSize = 50 * scale;
        const areaWidth = this.canvas.width - offsetX * 2;
        const areaHeight = this.canvas.height - offsetY * 2;

        for (let x = 0; x <= areaWidth; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(offsetX + x, offsetY);
            this.ctx.lineTo(offsetX + x, offsetY + areaHeight);
            this.ctx.stroke();
        }

        for (let y = 0; y <= areaHeight; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(offsetX, offsetY + y);
            this.ctx.lineTo(offsetX + areaWidth, offsetY + y);
            this.ctx.stroke();
        }
        
        // Grid çiziminden sonra çizgi stilini normale dön
        this.ctx.setLineDash([]);
    }

    // Panel çiz
    drawPanel(panel, scale, offsetX, offsetY) {
        const x = offsetX + panel.x * scale;
        const y = offsetY + panel.y * scale;
        const width = panel.width * scale;
        const height = panel.height * scale;

        // Panel rengini çiz
        this.ctx.fillStyle = panel.color;
        this.ctx.fillRect(x, y, width, height);

        // Panel sınırlarını çiz
        this.ctx.strokeStyle = '#2c3e50';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, width, height);

        // Panel boyutunu yaz - PDF benzeri temiz görünüm
        const fontSize = Math.max(14, Math.min(width, height) / 6);
        this.ctx.font = `bold ${fontSize}px 'Segoe UI', Arial, sans-serif`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        const text = `${panel.originalPanel.width}×${panel.originalPanel.height}`;
        const textX = x + width / 2;
        const textY = y + height / 2;

        // Kalın siyah gölge
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        this.ctx.fillText(text, textX + 2, textY + 2);
        
        // Ana beyaz text
        this.ctx.fillStyle = 'white';
        this.ctx.fillText(text, textX, textY);
    }

    // Kapatılamayan alanları sarı renkle göster
    drawEmptyAreas(areaWidth, areaHeight, scale, offsetX, offsetY) {
        // Kullanılabilir alanları tutacak grid sistemi
        const occupiedGrid = Array(Math.ceil(areaHeight)).fill(null)
            .map(() => Array(Math.ceil(areaWidth)).fill(false));

        // Yerleştirilen panelleri grid'de işaretle
        this.placedPanels.forEach(panel => {
            this.markOccupied(occupiedGrid, panel.x, panel.y, panel.width, panel.height);
        });

        // Boş alanları bul ve sarı renkle göster
        this.emptyAreas = this.findEmptyAreas(occupiedGrid, areaWidth, areaHeight);
        
        this.emptyAreas.forEach(area => {
            const x = offsetX + area.x * scale;
            const y = offsetY + area.y * scale;
            const width = area.width * scale;
            const height = area.height * scale;
            
            // Minimum alan boyutu kontrolü - 1cm x 1cm ve üzeri alanları göster
            if (area.width >= 1 && area.height >= 1 && width > 3 && height > 3) {
                
                // Sarı alanı çiz
                this.ctx.fillStyle = '#FFD700'; // Parlak sarı
                this.ctx.fillRect(x, y, width, height);
                
                // Kalın siyah sınır çiz
                this.ctx.strokeStyle = '#000000';
                this.ctx.lineWidth = 3;
                this.ctx.setLineDash([]);
                this.ctx.strokeRect(x, y, width, height);
                
                // Boş alan boyutunu yaz - PDF benzeri temiz görünüm
                const fontSize = Math.max(12, Math.min(width / 6, height / 3, 18));
                this.ctx.font = `bold ${fontSize}px 'Segoe UI', Arial, sans-serif`;
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                
                const text = `${area.width.toFixed(0)}×${area.height.toFixed(0)} cm`;
                const area_m2 = ((area.width * area.height) / 10000).toFixed(2);
                const areaText = `(${area_m2} m²)`;
                
                const textX = x + width / 2;
                const textY = y + height / 2;
                
                // Siyah gölge efekti için tekst
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
                this.ctx.fillText(text, textX + 1, textY - fontSize / 3 + 1);
                this.ctx.font = `${fontSize * 0.7}px 'Segoe UI', Arial, sans-serif`;
                this.ctx.fillText(areaText, textX + 1, textY + fontSize / 2 + 1);
                
                // Ana siyah tekst
                this.ctx.fillStyle = '#000000';
                this.ctx.font = `bold ${fontSize}px 'Segoe UI', Arial, sans-serif`;
                this.ctx.fillText(text, textX, textY - fontSize / 3);
                
                // Alan miktarını alt satırda yaz
                this.ctx.font = `${fontSize * 0.7}px 'Segoe UI', Arial, sans-serif`;
                this.ctx.fillText(areaText, textX, textY + fontSize / 2);
            }
        });
    }

    // Boş alanları bul - Overlap düzeltmeli algoritma
    findEmptyAreas(occupiedGrid, areaWidth, areaHeight) {
        const emptyAreas = [];
        const processed = Array(Math.ceil(areaHeight)).fill(null)
            .map(() => Array(Math.ceil(areaWidth)).fill(false));

        // Her cm için tarama yap
        for (let y = 0; y < areaHeight; y += 1) {
            for (let x = 0; x < areaWidth; x += 1) {
                // Bu nokta boş mu ve daha önce işlenmemiş mi kontrol et
                if (this.isEmptyCell(occupiedGrid, x, y) && !this.isProcessedCell(processed, x, y)) {
                    // En büyük dikdörtgen boş alanı bul
                    const area = this.findConnectedEmptyArea(occupiedGrid, processed, x, y, areaWidth, areaHeight);
                    if (area && area.width >= 1 && area.height >= 1) { // 1cm x 1cm ve üzeri alanları göster
                        emptyAreas.push(area);
                    }
                }
            }
        }
        
        // Çakışan alanları düzelt
        const correctedAreas = this.removeOverlaps(emptyAreas);
        
        // Boş alanları boyutlarına göre sırala (büyükten küçüğe)
        correctedAreas.sort((a, b) => (b.width * b.height) - (a.width * a.height));
        
        return correctedAreas;
    }

    // Çakışan alanları kaldır ve boyutları düzelt
    removeOverlaps(areas) {
        const correctedAreas = [];
        
        for (let i = 0; i < areas.length; i++) {
            let currentArea = {...areas[i]};
            
            // Bu alanı önceki alanlarla karşılaştır
            for (let j = 0; j < correctedAreas.length; j++) {
                const existingArea = correctedAreas[j];
                
                // Çakışma var mı kontrol et
                if (this.areasOverlap(currentArea, existingArea)) {
                    // Çakışmayı çöz - küçük alanı böl veya çıkart
                    currentArea = this.resolveOverlap(currentArea, existingArea);
                    if (!currentArea) break; // Alan tamamen çakışıyorsa null döner
                }
            }
            
            if (currentArea && currentArea.width >= 1 && currentArea.height >= 1) {
                correctedAreas.push(currentArea);
            }
        }
        
        return correctedAreas;
    }

    // İki alan çakışıyor mu kontrol et
    areasOverlap(area1, area2) {
        return !(area1.x + area1.width <= area2.x || 
                 area2.x + area2.width <= area1.x || 
                 area1.y + area1.height <= area2.y || 
                 area2.y + area2.height <= area1.y);
    }

    // Çakışmayı çöz
    resolveOverlap(newArea, existingArea) {
        // Çakışma alanını hesapla
        const overlapX = Math.max(newArea.x, existingArea.x);
        const overlapY = Math.max(newArea.y, existingArea.y);
        const overlapWidth = Math.min(newArea.x + newArea.width, existingArea.x + existingArea.width) - overlapX;
        const overlapHeight = Math.min(newArea.y + newArea.height, existingArea.y + existingArea.height) - overlapY;
        
        // Yeni alanı böl - çakışmayan kısmı al
        if (newArea.x < existingArea.x) {
            // Sol kısım
            return {
                x: newArea.x,
                y: newArea.y,
                width: existingArea.x - newArea.x,
                height: newArea.height
            };
        } else if (newArea.x + newArea.width > existingArea.x + existingArea.width) {
            // Sağ kısım
            return {
                x: existingArea.x + existingArea.width,
                y: newArea.y,
                width: (newArea.x + newArea.width) - (existingArea.x + existingArea.width),
                height: newArea.height
            };
        } else if (newArea.y < existingArea.y) {
            // Üst kısım
            return {
                x: newArea.x,
                y: newArea.y,
                width: newArea.width,
                height: existingArea.y - newArea.y
            };
        } else if (newArea.y + newArea.height > existingArea.y + existingArea.height) {
            // Alt kısım
            return {
                x: newArea.x,
                y: existingArea.y + existingArea.height,
                width: newArea.width,
                height: (newArea.y + newArea.height) - (existingArea.y + existingArea.height)
            };
        }
        
        // Tamamen çakışıyorsa null döndür
        return null;
    }

    // Hücre boş mu kontrol et
    isEmptyCell(occupiedGrid, x, y) {
        const gridY = Math.floor(y);
        const gridX = Math.floor(x);
        return !occupiedGrid[gridY] || !occupiedGrid[gridY][gridX];
    }

    // Hücre işlenmiş mi kontrol et
    isProcessedCell(processed, x, y) {
        const gridY = Math.floor(y);
        const gridX = Math.floor(x);
        return processed[gridY] && processed[gridY][gridX];
    }

    // En büyük dikdörtgen boş alanı bul
    findConnectedEmptyArea(occupiedGrid, processed, startX, startY, areaWidth, areaHeight) {
        // Bu noktadan başlayarak en büyük dikdörtgeni bul
        const rect = this.findLargestRectangle(occupiedGrid, startX, startY, areaWidth, areaHeight);
        
        if (!rect || rect.width < 1 || rect.height < 1) return null;
        
        // Bu dikdörtgeni işlenmiş olarak işaretle
        for (let y = rect.y; y < rect.y + rect.height && y < areaHeight; y++) {
            for (let x = rect.x; x < rect.x + rect.width && x < areaWidth; x++) {
                const gridY = Math.floor(y);
                const gridX = Math.floor(x);
                if (processed[gridY] && gridX >= 0 && gridX < processed[gridY].length) {
                    processed[gridY][gridX] = true;
                }
            }
        }
        
        return rect;
    }

    // En büyük dikdörtgeni hesapla
    findLargestRectangle(occupiedGrid, startX, startY, areaWidth, areaHeight) {
        let bestRect = null;
        let maxArea = 0;

        // Bu noktadan başlayarak farklı boyutlarda dikdörtgenler dene
        for (let height = 1; height <= areaHeight - startY; height++) {
            let width = 0;
            
            // Bu yükseklik için maksimum genişliği bul
            for (let x = startX; x < areaWidth; x++) {
                let canExtend = true;
                
                // Bu genişlikte tüm satırlar boş mu kontrol et
                for (let y = startY; y < startY + height; y++) {
                    if (!this.isEmptyCell(occupiedGrid, x, y)) {
                        canExtend = false;
                        break;
                    }
                }
                
                if (canExtend) {
                    width++;
                } else {
                    break;
                }
            }
            
            const area = width * height;
            if (area > maxArea && width > 0) {
                maxArea = area;
                bestRect = {
                    x: startX,
                    y: startY,
                    width: width,
                    height: height
                };
            }
        }

        return bestRect;
    }

    // Alan boyutlarını kenarına yaz
    drawDimensions(areaWidth, areaHeight, scale, areaStartX, areaStartY, areaEndX, areaEndY) {
        this.ctx.fillStyle = '#2c3e50';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        // Genişlik yazısı (üst kenar)
        const widthText = `${(areaWidth / 100).toFixed(1)}m (${areaWidth}cm)`;
        this.ctx.fillText(widthText, areaStartX + (areaWidth * scale) / 2, areaStartY - 30);
        
        // Genişlik yazısı (alt kenar)
        this.ctx.fillText(widthText, areaStartX + (areaWidth * scale) / 2, areaEndY + 30);

        // Yükseklik yazısı (sol kenar) - döndürülmüş
        const heightText = `${(areaHeight / 100).toFixed(1)}m (${areaHeight}cm)`;
        this.ctx.save();
        this.ctx.translate(areaStartX - 30, areaStartY + (areaHeight * scale) / 2);
        this.ctx.rotate(-Math.PI / 2);
        this.ctx.fillText(heightText, 0, 0);
        this.ctx.restore();
        
        // Yükseklik yazısı (sağ kenar) - döndürülmüş
        this.ctx.save();
        this.ctx.translate(areaEndX + 30, areaStartY + (areaHeight * scale) / 2);
        this.ctx.rotate(Math.PI / 2);
        this.ctx.fillText(heightText, 0, 0);
        this.ctx.restore();

        // Çizgiler
        this.ctx.strokeStyle = '#2c3e50';
        this.ctx.lineWidth = 1;
        
        // Üst ve alt çizgiler
        this.ctx.beginPath();
        this.ctx.moveTo(areaStartX, areaStartY - 20);
        this.ctx.lineTo(areaEndX, areaStartY - 20);
        this.ctx.moveTo(areaStartX, areaEndY + 20);
        this.ctx.lineTo(areaEndX, areaEndY + 20);
        
        // Sol ve sağ çizgiler
        this.ctx.moveTo(areaStartX - 20, areaStartY);
        this.ctx.lineTo(areaStartX - 20, areaEndY);
        this.ctx.moveTo(areaEndX + 20, areaStartY);
        this.ctx.lineTo(areaEndX + 20, areaEndY);
        this.ctx.stroke();
    }

    // Legend oluştur
    createLegend() {
        const existingLegend = document.querySelector('.canvas-legend');
        if (existingLegend) {
            existingLegend.remove();
        }

        const legend = document.createElement('div');
        legend.className = 'canvas-legend';

        const usedPanelTypes = new Set();
        this.placedPanels.forEach(panel => {
            const key = `${panel.originalPanel.width}×${panel.originalPanel.height}`;
            usedPanelTypes.add(key);
        });

        // Panel türlerini ekle
        Array.from(usedPanelTypes).forEach(panelType => {
            const panelIndex = this.panels.findIndex(p => `${p.width}×${p.height}` === panelType);
            const color = this.colors[panelIndex % this.colors.length];

            const legendItem = document.createElement('div');
            legendItem.className = 'legend-item';
            legendItem.innerHTML = `
                <div class="legend-color" style="background-color: ${color}"></div>
                <span class="legend-text">${panelType} cm</span>
            `;
            legend.appendChild(legendItem);
        });

        // Sarı (boş) alanları ekle
        if (this.emptyAreas && this.emptyAreas.length > 0) {
            this.emptyAreas.forEach((area, index) => {
                const legendItem = document.createElement('div');
                legendItem.className = 'legend-item';
                legendItem.innerHTML = `
                    <div class="legend-color" style="background-color: #FFD700"></div>
                    <span class="legend-text">${area.width.toFixed(0)}×${area.height.toFixed(0)} cm</span>
                `;
                legend.appendChild(legendItem);
            });
        }

        this.canvas.parentElement.appendChild(legend);
    }

    // Canvas'ı PNG olarak indir
    exportCanvas() {
        const link = document.createElement('a');
        link.download = `kalip-yerlestirme-${new Date().toISOString().slice(0, 10)}.png`;
        link.href = this.canvas.toDataURL();
        link.click();

        this.showToast('Görsel indirildi!', 'success');
    }

    // localStorage'a kaydet
    savePanels() {
        localStorage.setItem('panelPlacement_panels', JSON.stringify(this.panels));
    }

    // localStorage'dan yükle
    loadPanels() {
        const saved = localStorage.getItem('panelPlacement_panels');
        if (saved) {
            this.panels = JSON.parse(saved);
            // Eski panel verilerini yeni formata dönüştür
            this.panels = this.panels.map(panel => ({
                ...panel,
                count: panel.count || 1 // Eğer count yoksa 1 olarak ata
            }));
            this.updatePanelsList();
        }
    }

    // Varsayılan panelleri ekle
    addDefaultPanels() {
        // Eğer hiç panel yoksa varsayılan panelleri ekle
        if (this.panels.length === 0) {
            const defaultPanels = [
                { width: 250, height: 125, count: 10 },
                { width: 40, height: 250, count: 5 },
                { width: 55, height: 250, count: 5 }
            ];
            
            defaultPanels.forEach(panel => {
                this.panels.push({ 
                    width: panel.width, 
                    height: panel.height, 
                    count: panel.count,
                    area: panel.width * panel.height 
                });
            });
            
            this.updatePanelsList();
            this.savePanels();
            this.showToast('Varsayılan paneller eklendi!', 'success');
        }
    }

    // Toast bildirimi göster
    showToast(message, type = 'success') {
        const toast = this.elements.toast;
        toast.textContent = message;
        toast.className = `toast ${type}`;
        
        // Göster
        setTimeout(() => toast.classList.add('show'), 100);
        
        // Gizle
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// Uygulamayı başlat
const app = new PanelPlacementApp();

// Global fonksiyonlar (HTML'den çağrılabilir)
window.app = app;
