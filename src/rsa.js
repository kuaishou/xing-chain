//1、私钥公钥
// 2、公钥直接当成地址使用（或者截取公钥前20位）
// 3、公钥可以通过私钥计算出来
let fs = require('fs')
let EC = require("elliptic").ec
let ec = new EC("secp256k1")
let keypair = ec.genKeyPair();

function getPub(prv) {
    return ec.keyFromPrivate(prv).getPublic('hex').toString()
}
const res = generateKeys()
console.log(res)

function generateKeys() {

    const fileName = './wallet.json'
    try {
        let res = JSON.parse(fs.readFileSync(fileName))
        if (res.prv && res.pub && getPub(res.prv) === res.pub) {
            keypair = ec.keyFromPrivate(res.prv)
            return res;
        } else {
            throw 'not valid wallet.json'
        }
    } catch (error) {
        //没有wallet文件就重新写一个wallet.json
        const res = {
            //私钥
            prv: keypair.getPrivate('hex').toString(),
            // 公钥
            pub: keypair.getPublic('hex').toString(),
        }
        fs.writeFileSync(fileName, JSON.stringify(res))
    }
}


