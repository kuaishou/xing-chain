const vorpal=require("vorpal")()


const BlockChain=require("./blockchain")

const blockChain=new BlockChain()

vorpal.command('mine',"挖矿")
.action(function(args,callback){
    const newBlock=blockChain.mine()
    if(newBlock){
        console.log(newBlock)
    }
    callback()
})

vorpal.command('chain',"查看区块链")
.action(function(args,callback){
 console.log(blockChain.blockchain)
    callback()
})

console.log("welcome to xing chain")
vorpal.exec('help')
vorpal.delimiter("xing-chain =>").show()