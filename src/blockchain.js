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

const copypto=require('crypto')
class Blockchain{
    constructor(){
        this.blockchain=[]
        this.data=[]
        this.difficulty=[]
        console.log('one hash',this.computeHash(0,'0',new Date().getTime(),"hell xing chain",1))
    }
    //挖矿
    mine(){
        //1、生成新的区块
        //2、不停的计算hash 知道符合难度的条件  新增区块

    }
    //生成新的区块
    genrateNewBlock(){

    }
    //生成hash
    computeHash(index,prevHash,timestamp,data,nonce){
return copypto.createHash('sha256')
.update(index+prevHash+timestamp+data+nonce)
.digest('hex')
    }
    //校验区块
    isValidaBlock(){

    }
    //校验区块链
    isValidChain(){

    }
}
const block=new Blockchain()