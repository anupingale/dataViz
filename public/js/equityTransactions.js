const getOneTransaction = function (acc, data) {
    if (data.SMA <= data.Close && acc.canBuy) { //buy
        acc.transactions.push({ "buy": data });
        acc.canBuy = false;
        return acc
    }
    if (data.SMA > data.Close && !acc.canBuy) {
        _.last(acc.transactions)["sell"] = data;
        acc.canBuy = true;
        return acc;
    }
    return acc;
}

const getTransactionSummary = function (transaction, id) {
    const { buy, sell } = transaction;
    const newId = ++id;
    const income = sell.Close - buy.Close;
    return {
        newId, buydate: buy.Time.toLocaleDateString(), buy: Math.round(buy.Close), buySma: Math.round(buy.SMA),
        saleDate: sell.Time.toLocaleDateString(), sell: Math.round(sell.Close), sellSma: Math.round(sell.SMA), income: Math.round(income)
    }
}

const createTransactionsTable = function (matrix) {
    const newMatrix = _.filter(_.filter(matrix, "sell"), "buy");
    const tr = d3.select(".table tbody")
        .selectAll("tr")
        .data(newMatrix)
        .enter().append("tr");

    const td = tr.selectAll("td")
        .data(function (d, i) { return Object.values(getTransactionSummary(d, i)) })
        .enter()
        .append("td")
        .text(function (d) { return d });
}

const getTransactions = function (quotes) {
    const transactions = quotes.reduce(getOneTransaction, { canBuy: true, transactions: [] }).transactions;
    if (!(_.last(transactions).sell)) _.last(transactions)["sell"] = _.last(quotes);
    return transactions
}

const summerizeTransaction = function (transactions) {
    const analysedTransactions = transactions.map(getTransactionSummary);

    return analysedTransactions.reduce((acc, transaction) => {
        if (transaction.income > 0) {
            acc.winCount += 1;
            acc.totalWinAmount += transaction.income;
        } else {
            acc.lossCount += 1;
            acc.totalLossAmount += transaction.income;
        }
        return acc;
    }, { totalWinAmount: 0, totalLossAmount: 0, winCount: 0, lossCount: 0 })
}

const showTransactionSummary = function (transactions) {
    const { totalLossAmount, totalWinAmount, winCount, lossCount } = summerizeTransaction(transactions);
    const totalTransactions = transactions.length;
    const averageWin = Math.round(totalWinAmount / winCount);
    const averageLoss = Math.round(Math.abs(totalLossAmount / lossCount));

    const dataToShow = [
        { text: "Total loss amount", totalLossAmount: Math.abs(totalLossAmount) },
        { text: "Total win amount", totalWinAmount },
        { text: "Average win amount", averageWin },
        { text: "Average loss amount", averageLoss },
        { text: "Total transactions", totalTransactions },
        { text: "Win percentage", totalWinPercentage: Math.round(Math.abs(100 * (totalWinAmount / totalTransactions))) },
        { text: "Win multiple", winMultiple: Math.round(Math.abs(averageWin / averageLoss)) },
        { text: "Net amount", netAmount: totalWinAmount + totalLossAmount },
        { text: "Expectancy", expectancy:  Math.round(totalWinAmount / totalTransactions) }
    ]

    tr = d3.select(".summary-table tbody")
        .selectAll("tr")
        .data(dataToShow)
        .enter().append("tr");

    var td = tr.selectAll("td")
        .data(function (d, i) { return Object.values(d) })
        .enter()
        .append("td")
        .text(function (d) { return d });

}
