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
const dgram = require('dgram')
const udp = dgram.createSocket('udp4')//创建udp连接
const copypto = require('crypto')
const rsa = require('./rsa')
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
        //所有的网络节点信息，address port
        this.peers = []
        //种子节点
        this.seed = { port: 8001, address: "localhost" }
        this.udp = dgram.createSocket('udp4')
        this.init()
        // console.log('one hash', this.computeHash(0, '0', new Date().getTime(), "hello xing chain", 1))
    }
    init() {
        this.bindP2p()
        this.bindExit()
    }
    bindP2p() {
        this.udp.on('message', (data, remote) => {
            const { address, port } = remote
            const action = JSON.parse(data)
            // {
            //     type:'你要干啥',
            //     data:'具体传递的消息'
            // }
            if (action.type) {
                console.log('sss', address, port)
                this.dispatch(action, { address, port })
            }
        })
        this.udp.on('listening', () => {
            const address = this.udp.address()
            console.log("[信息]：udp监听完毕" + address.port)
        })

        //区分种子接地那和普通节点，普通节点的端口0即可，随便一个端口即可
        // 种子节点端口必须约定好
        const port = Number(process.argv[2]) || 0
        this.startNode(port)

    }
    bindExit() {
        process.on('exit', () => {
            console.log('[信息]： 网络一线牵 珍惜这段缘 再见')
        })
    }
    startNode(port) {
        this.udp.bind(port)
        if (port !== 8001) {
            this.send({
                type: 'newpeer'
            }, this.seed.port, this.seed.address)
            //把种子节点加入到本地节点中
            this.peers.push(this.seed)
        }

    }
    send(message, port, address) {
        // console.log('senddd', message, port, address)
        this.udp.send(JSON.stringify(message), port, address)
    }
    boardcast(action) {
        //广播全场
        this.peers.forEach(v => {
            // console.log('广播', action, v)
            this.send(action, v.port, v.address)
        })
    }
    addPeers(newPeers) {
        newPeers.forEach(peer => {
            if (!this.peers.find(v => this.isEqualObj(v, peer))) {
                this.peers.push(peer)
            }
        })

    }

    dispatch(action, remote) {
        // console.log('接收到P2P网络消息了', action)
        switch (action.type) {
            case 'newpeer':
                // 1.你的公网IP和port是什么
                this.send({
                    type: 'romoteAddress',
                    data: remote
                }, remote.port, remote.address)
                // 2、现在全部节点的列表
                this.send({
                    type: 'peerList',
                    data: this.peers
                }, remote.port, remote.address)
                // 3、告诉所有已知节点  来了新朋友 快打招呼
                this.boardcast({
                    type: 'sayhi',
                    data: remote
                })
                // 4、告诉你现在区块链的数据
                this.send({
                    type: 'blockchain',
                    data: JSON.stringify({
                        blockchain: this.blockchain,
                        trans: this.data
                    })
                }, remote.port, remote.address)
                console.log('你好啊， 新朋友，请你喝茶', remote)
                this.peers.push(remote)
                break
            case "blockchain":
                //同步本地链
                let allData = JSON.parse(action.data)
                let newChain = allData.blockchain
                let newTrans = allData.trans
                this.replaceChain(newChain)
                console.log('allData', allData)
                this.replaceTrans(newTrans)
                break
            case "romoteAddress":
                // 存储远程消息，退出的时候用
                this.remote = action.data
                break
            case "peerList":
                // 远程告诉我 现在所有的节点列表
                const newPeers = action.data
                this.addPeers(newPeers)
                break
            case "sayhi":
                let remotePeer = action.data
                this.peers.push(remotePeer)
                console.log('[信息]：新朋友你好，相识就是缘分', remote)
                this.send({ type: 'hi', data: 'hidata' }, remote.port, remote.address)
                break
            case "hi":
                console.log(`${remote.address}:${remote.port}:${action.data}`)
                break
            case "trans":
                // 网络上收到的交易请求
                if (!this.data.find(v => this.isEqualObj(v, action.data))) {
                    console.log("有新的交易", action)
                    this.addTrans(action.data)
                    this.boardcast({
                        type: 'trans',
                        data: action.data
                    })
                }
                break

            case "mine":
                // 网络上有人挖矿成功了
                const lastBlock = this.getLastBlock()
                if (lastBlock.hash === action.data.hash) {
                    // 重复消息
                    return
                }
                if (this.isValidaBlock(action.data, lastBlock)) {
                    console.log("[信息] 有朋友挖矿成功让我们一起为他喝彩")
                    this.blockchain.push(action.data)
                    // 清空本地消息
                    this.data = []
                    this.boardcast({
                        type: 'mine',
                        data: action.data
                    })
                } else {
                    console.log('挖矿区块不合法')
                }

                break
            default:
                console.log('这个action不认识')
        }

    }
    isEqualObj(peer1, peer2) {
        const key1 = Object.keys(peer1)
        const key2 = Object.keys(peer2)
        if (key1.length !== key1.length) {
            return false
        }
        return key1.every(key => peer1[key] === peer2[key])
        // return peer1.address === peer2.address && peer1.port === peer2.port

    }



    getLastBlock() {
        return this.blockchain[this.blockchain.length - 1]
    }

    //转账
    transfer(from, to, amount) {
        const timestamp = new Date().getTime()
        //签名校验（后面完成）
        const signature = rsa.sign({ from, to, amount, timestamp })
        const sigTrans = { from, to, amount, timestamp, signature }

        if (from !== '0') {
            const blance = this.blance(from)
            if (blance < amount) {
                console.log('not enough blance', from, blance, amount)
                return
            }
        }

        this.boardcast({
            type: 'trans',
            data: sigTrans
        })
        this.data.push(sigTrans)

        return sigTrans

    }
    //查询余额功能
    blance(address) {
        let blance = 0;
        this.blockchain.forEach(block => {
            if (!Array.isArray(block.data)) {
                // console.log('创世区块')
                return
            }
            block.data.forEach(trans => {
                if (address == trans.from) {
                    blance -= trans.amount
                }
                if (address == trans.to) {
                    blance += trans.amount
                }
            })
        })
        return blance

    }
    isValidTransfer(trans) {
        // 是不是合法的转账
        // 地址使用公钥
        return rsa.verify(trans, trans.from)

    }
    addTrans(trans) {
        if (this.isValidTransfer(trans)) {
            this.data.push(trans)
        }
    }
    replaceTrans(trans) {
        if (trans && trans.every(v => this.isValidTransfer(v))) {
            this.data = trans
        }
    }
    //挖矿
    mine(address) {
        // 校验交易合法性
        // if (!this.data.every(v => this.isValidTransfer(v))) {
        //     console.log('trans nor valid')
        //     return
        // }
        this.data=this.data.filter(v=>this.isValidTransfer(v))

        //1、生成新的区块--一页新的记账加入了区块链
        //2、不停的计算hash 知道符合难度的条件的hash  获取记账权、

        //旷工address奖励 100
        this.transfer('0', address, 100)

        const newBlock = this.genrateNewBlock()
        if (this.isValidaBlock(newBlock) && this.isValidChain()) {

            this.blockchain.push(newBlock)
            this.data = []//清空data
            this.boardcast({
                type: "mine",
                data: newBlock
            })
            return newBlock
        } else {
            console.log('ERROR invalid block', newBlock)
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
    computeHashForBlock({ index, prevHash, timestamp, data, nonce }) {
        return this.computeHash(index, prevHash, timestamp, data, nonce)
    }
    //生成hash
    computeHash(index, prevHash, timestamp, data, nonce) {
        return copypto.createHash('sha256')
            .update(index + prevHash + timestamp + data + nonce)
            .digest('hex')
    }
    //校验区块
    isValidaBlock(newBlock, lastBlock = this.getLastBlock()) {
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
        } else if (newBlock.hash !== this.computeHashForBlock(newBlock)) {
            return false
        }
        return true

    }
    //校验区块链
    isValidChain(chain = this.blockchain) {
        for (let i = chain.length - 1; i >= 1; i = i - 1) {
            if (!this.isValidaBlock(chain[i], chain[i - 1])) {
                return false
            }

        }
        //校验创世区块
        if (JSON.stringify(chain[0]) !== JSON.stringify(initBlock)) {
            return false
        }
        return true

    }
    replaceChain(newChain) {
        //先不校验交易
        if (newChain.length === 1) {
            return
        }
        if (this.isValidChain(newChain) && newChain.length > this.blockchain.length) {
            //    拷贝一份
            this.blockchain = JSON.parse(JSON.stringify(newChain))
        } else {
            console.log("[错误]：不合法的链")
        }

    }
}
// const block = new Blockchain()
// block.mine()
// block.blockchain[1].nonce=222
// block.mine()
// block.mine()
// console.log(block.blockchain)

module.exports = Blockchain;