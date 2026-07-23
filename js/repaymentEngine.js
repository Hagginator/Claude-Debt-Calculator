/* =========================================
   Debt Manager — repaymentEngine.js
========================================= */

function runRepaymentSimulation(debts, monthlyBudget, strategy = "avalanche", customExtras = {}) {

    // Always clone input (prevents mutation bugs)
    let activeDebts = debts.map(d => ({
        lender: d.lender,
        type: d.type,
        balance: Number(d.balance),
        apr: Number(d.apr),
        minimum: Number(d.minimum),
        minPercent: d.minPercent,
        limit: Number(d.limit),
        promoApr: d.promoApr,
        promoEndDate: d.promoEndDate,
        fixedPayment: d.fixedPayment
    }));

    let month = 0;
    let totalInterest = 0;
    let firstMonthBreakdown = null;

    // Which month each debt's balance first hits zero, and how much
    // interest it racked up in total along the way. Powers the Debt
    // Freedom Timeline and the per-debt "interest saved" breakdown.
    const payoffMonths = {};
    const perDebtInterest = {};
    activeDebts.forEach(d => { perDebtInterest[d.lender] = 0; });

    while (activeDebts.some(d => d.balance > 0.01)) {

        month++;

        let remainingBudget = monthlyBudget;
        let monthlyInterest = 0;

        // Track what each debt actually gets paid this month —
        // only needs to be recorded for month 1, which is what the
        // user needs to know right now.
        const paymentsThisMonth = month === 1
            ? activeDebts.map(d => ({ lender: d.lender, minimum: 0, extra: 0 }))
            : null;

        // 1. Apply interest — using each debt's effective APR, which
        // accounts for any active 0% (or reduced) promo period.
        // Loans are skipped: their balance is the total repayable, which
        // already bakes in every penny of interest at origination. Accruing
        // more on top would double-count it.
        for (let d of activeDebts) {
            if (d.balance <= 0 || d.type === "loan") continue;
            const apr = getEffectiveApr(d, month - 1);
            const interest = d.balance * ((apr / 100) / 12);
            d.balance += interest;
            monthlyInterest += interest;
            perDebtInterest[d.lender] += interest;
        }
        totalInterest += monthlyInterest;

        // 2. Pay the guaranteed floor on each debt — either its fixed
        // monthly payment (if the person has set one higher than the
        // minimum) or just the minimum
        activeDebts.forEach((d, i) => {
            if (d.balance <= 0) return;
            const payment = Math.min(getGuaranteedPayment(d), d.balance);
            d.balance -= payment;
            remainingBudget -= payment;
            if (paymentsThisMonth) paymentsThisMonth[i].minimum = payment;
        });

        // 3. User-set custom extra payments, applied every month while
        // that debt is still active. Once a debt clears, its custom
        // amount naturally stops applying and any leftover budget
        // falls through to step 4.
        // ponytail: loans are excluded from extra payments — a fixed-total
        // loan saves nothing by being overpaid (no interest to save, and
        // early-settlement rebates are out of scope). Extra budget belongs
        // on the revolving debt where it actually compounds.
        activeDebts.forEach((d, i) => {
            if (d.balance <= 0.01 || d.type === "loan") return;
            const requested = Number(customExtras[d.lender]) || 0;
            if (requested <= 0) return;
            const payment = Math.min(requested, remainingBudget, d.balance);
            if (payment <= 0) return;
            d.balance -= payment;
            remainingBudget -= payment;
            if (paymentsThisMonth) paymentsThisMonth[i].extra += payment;
        });

        // 4. Allocate any remaining budget by strategy
        // avalanche: highest EFFECTIVE APR first (a card at 0% promo
        // right now shouldn't get priority just because its rate is
        // high once the promo ends)
        // snowball: smallest balance first (fastest wins, keeps motivation up)
        const sorted = activeDebts
            .map((d, i) => ({ d, i }))
            .filter(o => o.d.balance > 0.01 && o.d.type !== "loan")
            .sort((a, b) => strategy === "snowball"
                ? a.d.balance - b.d.balance
                : getEffectiveApr(b.d, month - 1) - getEffectiveApr(a.d, month - 1)
            );

        for (let { d, i } of sorted) {
            if (remainingBudget <= 0) break;
            const payment = Math.min(d.balance, remainingBudget);
            d.balance -= payment;
            remainingBudget -= payment;
            if (paymentsThisMonth) paymentsThisMonth[i].extra += payment;
        }

        if (month === 1) {
            firstMonthBreakdown = paymentsThisMonth.map(p => ({
                lender: p.lender,
                minimum: p.minimum,
                extra: p.extra,
                total: p.minimum + p.extra
            }));
        }

        // Record the first month any debt's balance actually clears.
        for (let d of activeDebts) {
            if (d.balance <= 0.01 && payoffMonths[d.lender] === undefined) {
                payoffMonths[d.lender] = month;
            }
        }

        if (month > 600) break; // safety stop
    }

    return { months: month, totalInterest, breakdown: firstMonthBreakdown, payoffMonths, perDebtInterest };
}

// Baseline: paying only minimums, no extra budget
function runMinimumPaymentSimulation(debts) {

    let active = debts.map(d => ({
        type: d.type,
        balance: Number(d.balance),
        apr: Number(d.apr),
        minimum: Number(d.minimum),
        minPercent: d.minPercent,
        promoApr: d.promoApr,
        promoEndDate: d.promoEndDate
    }));

    let month = 0;
    let totalInterest = 0;

    while (active.some(d => d.balance > 0.01)) {

        month++;
        let monthlyInterest = 0;

        for (let d of active) {
            if (d.balance <= 0 || d.type === "loan") continue; // loan interest is pre-baked
            const apr = getEffectiveApr(d, month - 1);
            const interest = (apr / 100 / 12) * d.balance;
            d.balance += interest;
            monthlyInterest += interest;
        }
        totalInterest += monthlyInterest;

        for (let d of active) {
            if (d.balance <= 0) continue;
            d.balance -= Math.min(getEffectiveMinimum(d), d.balance);
        }

        // If minimums don't even cover the interest charged, balances
        // grow forever and this baseline will never resolve. Bail out
        // rather than compounding interest for 600 months straight.
        if (month > 600) {
            return { months: month, totalInterest, neverPaidOff: true };
        }
    }

    return { months: month, totalInterest, neverPaidOff: false };
}

// Baseline over a fixed window: paying only minimums for exactly
// `monthCount` months, regardless of whether that would ever clear
// the debt. Used to compare "interest paid so far" on a like-for-like
// timeframe against a real repayment plan, which stays meaningful
// even when a debt's minimum never covers its own interest.
function runMinimumPaymentSimulationForMonths(debts, monthCount) {

    let active = debts.map(d => ({
        lender: d.lender,
        type: d.type,
        balance: Number(d.balance),
        apr: Number(d.apr),
        minimum: Number(d.minimum),
        minPercent: d.minPercent,
        promoApr: d.promoApr,
        promoEndDate: d.promoEndDate
    }));

    let totalInterest = 0;
    const perDebtInterest = {};
    active.forEach(d => { perDebtInterest[d.lender] = 0; });

    for (let month = 1; month <= monthCount; month++) {

        for (let d of active) {
            if (d.balance <= 0 || d.type === "loan") continue; // loan interest is pre-baked
            const apr = getEffectiveApr(d, month - 1);
            const interest = (apr / 100 / 12) * d.balance;
            d.balance += interest;
            totalInterest += interest;
            perDebtInterest[d.lender] += interest;
        }

        for (let d of active) {
            if (d.balance <= 0) continue;
            d.balance -= Math.min(getEffectiveMinimum(d), d.balance);
        }
    }

    return { totalInterest, perDebtInterest };
}
