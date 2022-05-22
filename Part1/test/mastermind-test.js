//[assignment] write your own unit test to show that your Mastermind variation circuit is working as expected
const chai = require("chai");
const path = require("path");

const wasm_tester = require("circom_tester").wasm;
const buildPoseidon = require("circomlibjs").buildPoseidon;

const F1Field = require("ffjavascript").F1Field;
const Scalar = require("ffjavascript").Scalar;
exports.p = Scalar.fromString("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const Fr = new F1Field(exports.p);

const assert = chai.assert;

describe("MastermindVariation test", function () {
    this.timeout(100000000);
    let F
    let poseidon
    let circuit

    before( async () => {
        poseidon = await buildPoseidon();
        F = poseidon.F;
        circuit = await wasm_tester("contracts/circuits/MastermindVariation.circom");
        await circuit.loadConstraints();        // not needed?
    });

    it("Case: 3 hits", async () => {
        const INPUT = {
            "pubGuessA": 1,
            "pubGuessB": 2,
            "pubGuessC": 3,
            "pubNumHit": 3,
            "pubNumBlow": 0,
            "pubSolnHash": null,
            "privSolnA": 1,
            "privSolnB": 2,
            "privSolnC": 3,
            "privSalt": 1234567890123
        };
        INPUT["pubSolnHash"] = F.toObject(poseidon([INPUT["privSalt"], INPUT["privSolnA"], INPUT["privSolnB"], INPUT["privSolnC"]]), 10);
        const witness = await circuit.calculateWitness(INPUT, true);
        //console.log(witness);

        assert(Fr.eq(Fr.e(witness[0]),Fr.e(1)));
        assert(Fr.eq(Fr.e(witness[1]),Fr.e(INPUT["pubSolnHash"])));
    });

    it("Case: 2 blows, no hit", async () => {
        const INPUT = {
            "pubGuessA": 2,
            "pubGuessB": 1,
            "pubGuessC": 4,
            "pubNumHit": 0,
            "pubNumBlow": 2,
            "pubSolnHash": null,
            "privSolnA": 1,
            "privSolnB": 2,
            "privSolnC": 3,
            "privSalt": 123456789012345678999
        };
        INPUT["pubSolnHash"] = F.toObject(poseidon([INPUT["privSalt"], INPUT["privSolnA"], INPUT["privSolnB"], INPUT["privSolnC"]]), 10);
        const witness = await circuit.calculateWitness(INPUT, true);
        //console.log(witness);

        assert(Fr.eq(Fr.e(witness[0]),Fr.e(1)));
        assert(Fr.eq(Fr.e(witness[1]),Fr.e(INPUT["pubSolnHash"])));
    });    
});