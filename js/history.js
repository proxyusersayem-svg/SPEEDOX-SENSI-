// Manages previous analytical execution signals and compiles metrics
export class HistoryManager {
    constructor() {
        this.records = JSON.parse(localStorage.getItem('signal_history')) || [];
    }

    addRecord(record) {
        this.records.unshift(record);
        if (this.records.length > 20) this.records.pop(); // Cap history to 20 logs
        localStorage.setItem('signal_history', JSON.stringify(this.records));
    }

    getStats() {
        if (this.records.length === 0) return { total: 0, winRate: 0 };
        const completed = this.records.filter(r => r.outcome !== 'PENDING');
        if (completed.length === 0) return { total: this.records.length, winRate: 0 };
        
        const wins = completed.filter(r => r.outcome === 'WIN').length;
        return {
            total: this.records.length,
            winRate: Math.round((wins / completed.length) * 100)
        };
    }

    // Real-time loop calls this to check previous outputs against current prices
    verifyPending(currentPrice) {
        let updated = false;
        this.records.forEach(record => {
            if (record.outcome === 'PENDING') {
                const closePrice = currentPrice;
                let outcome = 'LOSS';

                if (record.direction === 'UP' && closePrice > record.entryPrice) {
                    outcome = 'WIN';
                } else if (record.direction === 'DOWN' && closePrice < record.entryPrice) {
                    outcome = 'WIN';
                } else if (closePrice === record.entryPrice) {
                    outcome = 'TIE';
                }

                record.closePrice = closePrice;
                record.outcome = outcome;
                updated = true;
            }
        });

        if (updated) {
            localStorage.setItem('signal_history', JSON.stringify(this.records));
        }
        return updated;
    }
}
