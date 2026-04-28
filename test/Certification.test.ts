import { expect, use } from "chai";
import chaiAsPromised from "chai-as-promised";
import hre from "hardhat";

use(chaiAsPromised);

const network = hre.network as any;

describe("Certification", function () {

    async function deployCertificationFixture() {
        const connection = await network.connect();
        const [owner, otherAccount] = await connection.viem.getWalletClients();
        const certification = await connection.viem.deployContract("Certification");
        const publicClient = await connection.viem.getPublicClient();
        return { certification, owner, otherAccount, publicClient };
    }

    describe("Deployment", function () {
        it("Should deploy successfully", async function () {
            const { certification } = await deployCertificationFixture();
            expect(certification.address).to.be.a("string");
        });
    });

    describe("generateCertificate", function () {
        it("Should generate a certificate when called by owner", async function () {
            const { certification } = await deployCertificationFixture();

            await expect(
                certification.write.generateCertificate([
                    "ABC123", "Aditya Singh", "IIIT Ranchi", "Blockchain Development", "2026",
                ])
            ).to.be.fulfilled;
        });

        it("Should revert if called by non-owner", async function () {
            const { certification, otherAccount } = await deployCertificationFixture();

            await expect(
                certification.write.generateCertificate(
                    ["ABC123", "Aditya Singh", "IIIT Ranchi", "Blockchain Dev", "2026"],
                    { account: otherAccount.account }
                )
            ).to.be.rejected;
        });

        it("Should revert if certificate ID already exists", async function () {
            const { certification } = await deployCertificationFixture();

            await certification.write.generateCertificate([
                "ABC123", "Aditya Singh", "IIIT Ranchi", "Blockchain Dev", "2026",
            ]);

            await expect(
                certification.write.generateCertificate([
                    "DEF123", "Another Name", "Another Org", "Another Course", "2027",
                ])
            ).to.be.rejectedWith("Certificate with this ID already exists");
        });
    });

    describe("getData", function () {
        it("Should return correct certificate data", async function () {
            const { certification } = await deployCertificationFixture();

            await certification.write.generateCertificate([
                "ABC123", "Aditya Singh", "IIIT Ranchi", "Blockchain Dev", "2026",
            ]);

            const data = await certification.read.getData(["ABC123"]) as string[];
            expect(data[0]).to.equal("Aditya Singh");
            expect(data[1]).to.equal("IIIT Ranchi");
            expect(data[2]).to.equal("Blockchain Dev");
            expect(data[3]).to.equal("2026");
        });

        it("Should revert if certificate ID does not exist", async function () {
            const { certification } = await deployCertificationFixture();

            await expect(
                certification.read.getData(["INVALID999"])
            ).to.be.rejectedWith("No data exists");
        });
    });
});