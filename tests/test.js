"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var web3 = require("@solana/web3.js");
//import { sign } from 'crypto';
//console.log(solanaWeb3);
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var connection, alice, airdropSignature, latestBlockhash, bob, _a, _b, _c, _d, transaction, signature, _e, _f, _g, _h;
    return __generator(this, function (_j) {
        switch (_j.label) {
            case 0:
                connection = new web3.Connection('http://localhost:8899', 'confirmed');
                alice = web3.Keypair.generate();
                return [4 /*yield*/, connection.requestAirdrop(alice.publicKey, 5 * web3.LAMPORTS_PER_SOL)];
            case 1:
                airdropSignature = _j.sent();
                return [4 /*yield*/, connection.getLatestBlockhash('confirmed')];
            case 2:
                latestBlockhash = _j.sent();
                return [4 /*yield*/, connection.confirmTransaction({
                        signature: airdropSignature,
                        blockhash: latestBlockhash.blockhash,
                        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
                    })];
            case 3:
                _j.sent();
                bob = web3.Keypair.generate();
                _b = (_a = console).log;
                return [4 /*yield*/, connection.getBalance(alice.publicKey)];
            case 4:
                _b.apply(_a, [_j.sent()]);
                _d = (_c = console).log;
                return [4 /*yield*/, connection.getBalance(bob.publicKey)];
            case 5:
                _d.apply(_c, [_j.sent()]);
                transaction = new web3.Transaction().add(web3.SystemProgram.transfer({
                    fromPubkey: alice.publicKey,
                    toPubkey: bob.publicKey,
                    lamports: 1 * web3.LAMPORTS_PER_SOL
                }));
                return [4 /*yield*/, web3.sendAndConfirmTransaction(connection, transaction, [alice])];
            case 6:
                signature = _j.sent();
                console.log(signature);
                _f = (_e = console).log;
                return [4 /*yield*/, connection.getBalance(alice.publicKey)];
            case 7:
                _f.apply(_e, [_j.sent()]);
                _h = (_g = console).log;
                return [4 /*yield*/, connection.getBalance(bob.publicKey)];
            case 8:
                _h.apply(_g, [_j.sent()]);
                return [2 /*return*/];
        }
    });
}); })();
