
const QRCode = require('easyqrcodejs')
const bip39 = require("bip39")
var hdkey = require('hdkey');
var createHash = require('create-hash');
var bs58check = require('bs58check');


import logo from './img/BIS_64.png'
import logo2 from './img/BIS_64.png'
import i512 from './img/BIS_512.png'

import paperbg from './img/paper/default/wallet.png'

import './img/paper/paper.css'

import getWalletsNames from './getWalletsNames'
import lazyLoadImage from './lazyLoadImage';


function getQRConfig(text, logo) {
    return { text: text, // Content
						width: 240, // Width
						height: 240, // Height
						colorDark: "#444444",
						colorLight: "#ffffff", // Light color
						PO: '#5fa1ee', // Global Position Outer color. if not set, the defaut is `colorDark`
						PI: '#b364c2',						quietZone: 0,
						//logo: logo, // LOGO
						//logoBackgroundTransparent: true, // Whether use transparent image, default is false
						backgroundImage: i512,
						backgroundImageAlpha: 0.4,
						autoColor: false,
						correctLevel: QRCode.CorrectLevel.M // L, M, Q, H - don't use L, not enough dup info to allow for the logo
						}}

function getQRConfig2(text, logo) {
    return { text: text, // Content
						width: 240, // Width
						height: 240, // Height
						colorDark: "#444444",
						colorLight: "#ffffff", // Light color
						PO: '#5fa1ee', // Global Position Outer color. if not set, the defaut is `colorDark`
						PI: '#b364c2',
						quietZone: 0,
						//logo: logo, // LOGO
						//logoBackgroundTransparent: true, // Whether use transparent image, default is false
						backgroundImage: i512,
						backgroundImageAlpha: 0.4,
						autoColor: false,
						correctLevel: QRCode.CorrectLevel.M // L, M, Q, H - don't use L, not enough dup info to allow for the logo
						}}


function mapToPaper(map, type='') {
    let out = ''
    out = '<div id="paperkeyarea">'
    out += '<div id="keyarea1" class="keyarea art">'
    out += '<div class="artwallet" id="artwallet1">'
    out += '<img id="paperbg" class="paperbg" src="'+paperbg+'">'
    out += '<div id="qrcode_private" class="qr"></div>'
    out += '<div id="qrcode_address" class="qr"></div>'
    out += '<div class="paper_pub" id="paper_pub">'+map['Address']+'</div>'
    out += '<div class="paper_priv" id="paper_priv">'+map['Private Key']+'</div>'
    out += '</div>'
    out += '</div>'
    out += '</div>'
    out += '<button class="btn btn-primary" type="button" onclick="window.print();" id="print_paper">Print it!</button>'
    return out
}


function privkey_to_address(privateKey) {
    const key = hdkey.fromMasterSeed('');
    key.privateKey = privateKey;
    const publicKey = key.publicKey;
    const step1 = publicKey;
    const step2 = createHash('sha256').update(step1).digest();
    const step3 = createHash('rmd160').update(step2).digest();
    var step4 = Buffer.allocUnsafe(21+2);
    step4.writeUInt8(0x4f, 0);
    step4.writeUInt8(0x54, 1);
    step4.writeUInt8(0x5b, 2);
    step3.copy(step4, 3); //step4 now holds the extended RIPMD-160 result
    const step9 = bs58check.encode(step4);
    return step9;
}

function generate_paper() {
    var privateKey = document.querySelector("#pk-input").value.trim()
    const paperCode =  document.querySelector("#pc-input").value.trim()
    if (privateKey=='' && paperCode=='') {
        alert("Fill in one of Private Key or Paper Code")
        return
    }
    if (privateKey!='' && paperCode!='') {
        alert("Fill only *one* of Private Key or Paper Code")
        return
    }
    const bip39info = document.querySelector("#bip39")
    if (paperCode != '') {
        privateKey = bip39.mnemonicToEntropy(paperCode)
         bip39info.innerHTML = '';
    } else {
      // we got a privatekey
        bip39info.innerHTML = '<form style="margin-top:20px; margin-bottom:20px; "><label for="words">Paper wallet code</label><br/><textarea name="words" style="width:100%; height:auto;">'+bip39.entropyToMnemonic(privateKey)+"</textarea></form>"
    }

    const address = privkey_to_address(Buffer.from(privateKey, 'hex'))
    //console.log(address)
    const outMap= {"Private Key": privateKey, "Address": address}
    const wrapper = document.querySelector("#output")
    wrapper.innerHTML = mapToPaper(outMap)
    let qr = new QRCode(document.getElementById("qrcode_private"), getQRConfig2(privateKey, logo2))
    let qr2 = new QRCode(document.getElementById("qrcode_address"), getQRConfig(address, logo))
    const img = document.getElementById("paperbg")
    lazyLoadImage(document.querySelector("#wallet_template").value, "wallet", img);
}


function template_changed() {
    const select_elem = document.querySelector("#wallet_template")
    //console.log(select_elem.value)
    const img = document.getElementById("preview_img")
    lazyLoadImage(document.querySelector("#wallet_template").value, "front", img);
}

function fill_select() {
    const walletNames = getWalletsNames()
    const select_elem = document.querySelector("#wallet_template")
    walletNames.forEach((element, index) => {
      const option_elem = document.createElement('option');
      // Add index to option_elem
      option_elem.value = element;
      // Add element HTML
      option_elem.textContent = element;
      // Append option_elem to select_elem
      select_elem.appendChild(option_elem);
    });
}


document.querySelector("#generate_paper").addEventListener("click", generate_paper)
fill_select()
document.querySelector("#wallet_template").addEventListener("change", template_changed)
template_changed()
