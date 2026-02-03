const vorpal = require("vorpal")()
const BlockChain = require("./blockchain")
const blockChain = new BlockChain()

const Table = require("cli-table")
const rsa = require('./rsa')
function formatLog(data) {
    if (!data || data.length === 0) {
        return
    }
    if (!Array.isArray(data)) {
        data = [data]
    }

    const frist = data[0]

    const head = Object.keys(frist)//获取表头

    const table = new Table({
        head: head,
        colWidths: new Array(head.length).fill(15)
    })
    const res = data.map(v => {//获取表格数据
        return head.map(h => JSON.stringify(v[h], null, 1))
    })
    table.push(...res)
    console.log(table.toString())
}

vorpal.command('trans <to> <amount>', "转账")
    .action(function (args, callback) {
        const trans = blockChain.transfer(rsa.keys.pub, args.to, args.amount)
        if (trans) {
            formatLog(trans)
        }

        callback()
    })

vorpal.command('detail <index>', "区块详情")
    .action(function (args, callback) {
        const detail = blockChain.blockchain[args.index]
        this.log(JSON.stringify(detail, null, 2))
        //   formatLog(trans)
        //     callback()
    })
vorpal.command('blance <address>', "查看账户余额")
    .action(function (args, callback) {
        const blance = blockChain.blance(args.address)
        // this.log(JSON.stringify(detail,null,2))
        if (blance) {
            formatLog({ blance, address: args.address })
        }
        callback()
    })
vorpal.command('mine', "挖矿")
    .action(function (args, callback) {
        const newBlock = blockChain.mine(rsa.keys.pub)
        if (newBlock) {
            formatLog(newBlock)
            // console.log(newBlock)
        }
        callback()
    })

vorpal.command('blockchain', "查看区块链")
    .action(function (args, callback) {
        formatLog(blockChain.blockchain)
        //  console.log(blockChain.blockchain)
        callback()
    })

vorpal.command('pub', "查看本地地址")
    .action(function (args, callback) {
        console.log(rsa.keys.pub)
        callback()
    })
vorpal.command('peers', "查看网络节点列表")
    .action(function (args, callback) {
        formatLog(blockChain.peers)
        //  console.log(blockChain.blockchain)
        callback()
    })


vorpal.command('chat <msg>', "跟别的节点打招呼一下")
    .action(function (args, callback) {
        blockChain.boardcast({
            type: 'hi',
            data: args.msg
        })
        callback()
    })

vorpal.command('pending', "查看还没被打包的交易")
    .action(function (args, callback) {
        formatLog(blockChain.data)
        //  console.log(blockChain.blockchain)
        callback()
    })
console.log("welcome to xing chain")
vorpal.exec('help')
vorpal.delimiter("xing-chain =>").show()