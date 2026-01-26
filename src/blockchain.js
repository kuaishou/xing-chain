// 1、迷你区块链--xing-chain
// 2、区块链的生成、新增、校验
// 3、交易
// 4、非对称加密
// 5、挖矿
// 6、p2p网络

//用数组描述一下区块链  数组第一个区块为创世纪区块

// [
//     {
//         index: 0,
//         timestamp: "时间戳",
//         data: "区块的具体信息 主要是交易信息",
//         hash: "当前区块信息的哈希  哈希1",
//         prevHash: "上一个区块的哈希  哈希0",
//         nonce: "随机数"//难度值
//     },
//     {
//         index: 1,
//         timestamp: "时间戳",
//         data: "区块的具体信息 主要是交易信息",
//         hash: "当前区块信息的哈希  哈希2",
//         prevHash: "上一个区块的哈希  哈希1",
//         nonce: "随机数"
//     },
//     {
//         index: 2,
//         timestamp: "时间戳",
//         data: "区块的具体信息 主要是交易信息",
//         hash: "当前区块信息的哈希  哈希3",
//         prevHash: "上一个区块的哈希  哈希2",
//         nonce: "随机数"
//     }
// ]

const { error } = require('console')
const copypto = require('crypto')
const initBlock = {
    index: 0,
    data: 'hello xing chain',
    prevHash: '0',
    timestamp: '1769264928530',
    nonce: 46627,
    hash: '0000cfc3c8d2582b68c333ce498fb0fc6a6a0c5d4f781c6759c856d59d853023'
}
class Blockchain {
    constructor() {
        this.blockchain = [initBlock]
        this.data = []
        this.difficulty = 4
        console.log('one hash', this.computeHash(0, '0', new Date().getTime(), "hello xing chain", 1))
    }
    getLastBlock() {
        return this.blockchain[this.blockchain.length - 1]
    }
    //转账
    transfer(from,to,amount){
        if(from!=='0'){
            const blance= this.blance(from)
            if(blance<amount){
                console.log('not enough blance', from,blance,amount)
                return
            }
        }
        //签名校验（后面完成）
        const transObj={from,to,amount}
        this.data.push(transObj)
        return transObj

    }
    //查询余额功能
    blance(address){
        let blance=0;
        this.blockchain.forEach(block=>{
            if(!Array.isArray(block.data)){
                // console.log('创世区块')
                return
            }
            block.data.forEach(trans=>{
                if(address==trans.from){
                    blance-=trans.amount
                }
                if(address==trans.to){
                    blance+=trans.amount
                }
            })
        })
        return blance

    }
    //挖矿
    mine(address) {
        //1、生成新的区块--一页新的记账加入了区块链
        //2、不停的计算hash 知道符合难度的条件的hash  获取记账权、

        //旷工address奖励 100
        this.transfer('0',address,100)

        const newBlock = this.genrateNewBlock()
        if (this.isValidaBlock(newBlock)&&this.isValidChain()) {

            this.blockchain.push(newBlock)
            this.data=[]//清空data
            return newBlock
        }else{
           console.log('ERROR invalid block',newBlock)
        }


    }
    //生成新的区块
    genrateNewBlock() {

        let nonce = 0
        const index = this.blockchain.length
        const data = this.data
        const prevHash = this.getLastBlock().hash
        let timestamp = new Date().getTime()
        let hash = this.computeHash(index, prevHash, timestamp, data, nonce)
        while (hash.slice(0, this.difficulty) !== '0'.repeat(this.difficulty)) {
            nonce += 1
            hash = this.computeHash(index, prevHash, timestamp, data, nonce);
        }

        return {
            index,
            data,
            prevHash,
            timestamp,
            nonce,
            hash
        }

    }
    computeHashForBlock({index, prevHash, timestamp, data, nonce}){
        return this.computeHash(index, prevHash, timestamp, data, nonce)
    }
    //生成hash
    computeHash(index, prevHash, timestamp, data, nonce) {
        return copypto.createHash('sha256')
            .update(index + prevHash + timestamp + data + nonce)
            .digest('hex')
    }
    //校验区块
    isValidaBlock(newBlock,lastBlock=this.getLastBlock()) {
        //1、新区块的index等于最后一个区块的index+1
        // 2、新区块的时间大于最后一个区块的time
        // 3、新区块的PrevHash是最后一个区块的hash
        // 4、新区块的hash符合难度要求
        // 5、新区块hash计算正确
        if (newBlock.index !== lastBlock.index + 1) {
            return false
        } else if (newBlock.timestamp <= lastBlock.timestamp) {
            return false
        } else if (newBlock.prevHash !== lastBlock.hash) {
            return false
        } else if (newBlock.hash.slice(0, this.difficulty) !== '0'.repeat(this.difficulty)) {
            return false
        }else if(newBlock.hash!==this.computeHashForBlock(newBlock)){
            return false
        }
        return true

    }
    //校验区块链
    isValidChain(chain=this.blockchain) {
        for(let i=chain.length-1;i>=1;i=i-1){
            if(!this.isValidaBlock(chain[i],chain[i-1])){
                return false
            }

        }
                //校验创世区块
        if(JSON.stringify(chain[0])!==JSON.stringify(initBlock)){
            return false
        }
        return true

    }
}
// const block = new Blockchain()
// block.mine()
// block.blockchain[1].nonce=222
// block.mine()
// block.mine()
// console.log(block.blockchain)

module.exports= Blockchain;