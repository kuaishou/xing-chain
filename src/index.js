const vorpal=require("vorpal")()
const BlockChain=require("./blockchain")
const blockChain=new BlockChain()

const Table=require("cli-table")
function formatLog(data){
    if(!Array.isArray(data)){
        data=[data]
    }

    const frist=data[0]

    const head=Object.keys(frist)//获取表头

    const table=new Table({
        head:head,
        colWidths:new Array(head.length).fill(15)
    })
    const res= data.map(v=>{//获取表格数据
        return head.map(h=>JSON.stringify(v[h],null,1))
    })
    table.push(...res)
    console.log(table.toString())
}

vorpal.command('trans <from> <to> <amount>',"转账")
.action(function(args,callback){
    const trans=blockChain.transfer(args.from,args.to,args.amount)
  formatLog(trans)
    callback()
})

vorpal.command('mine <address>',"挖矿")
.action(function(args,callback){
    const newBlock=blockChain.mine(args.address)
    if(newBlock){
        formatLog(newBlock)
        // console.log(newBlock)
    }
    callback()
})

vorpal.command('chain',"查看区块链")
.action(function(args,callback){
     formatLog(blockChain.blockchain)
//  console.log(blockChain.blockchain)
    callback()
})

console.log("welcome to xing chain")
vorpal.exec('help')
vorpal.delimiter("xing-chain =>").show()